// ECA — firebase.js (اتفصل من index.html في eca-v3)
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
    import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, linkWithPopup, deleteUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
    import { initializeFirestore, writeBatch, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot, serverTimestamp, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyDofyiWsg2HmOQgigWeqUpOaSupoMQ1GKc",
      authDomain: "eca-chess.firebaseapp.com",
      projectId: "eca-chess",
      storageBucket: "eca-chess.firebasestorage.app",
      messagingSenderId: "978726294610",
      appId: "1:978726294610:web:17c0ad743303b700f4fb8b"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
    // كاش أوفلاين على الجهاز: القراءات المتكررة ما بتتحسبش تاني (بيوفر تكلفة) والموقع بيشتغل لو النت قطع
    const firestore = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });

    // ===================== أدوات مساعدة =====================
    const MAIL_SUFFIX = "@eca.local";                  // الطلاب بيدخلوا بـ username؛ بنحوله لإيميل داخلي
    const BAD = /[<>"'`]/g;                            // حروف ممنوعة (حماية من حقن HTML)
    const FIN_KEYS = ["courseFee", "amountPaid", "remaining", "lastPayDate", "lastPayAmount"];   // مالية: للأدمن فقط
    const PRIV_KEYS = ["note", "parentCode"];                                                     // ملاحظة سرية: للكوتش وولي الأمر فقط
    const plain = o => JSON.parse(JSON.stringify(o));
    function cleanDeep(v) {
      if (typeof v === "string") return v.replace(BAD, "");
      if (Array.isArray(v)) return v.map(cleanDeep);
      if (v && typeof v === "object") { const o = {}; for (const k in v) o[String(k).replace(BAD, "")] = cleanDeep(v[k]); return o; }
      return v;
    }
    function toAuthEmail(idf) {
      idf = String(idf || "").trim().toLowerCase();
      if (idf.includes("@")) return idf;               // الكوتش/الأدمن بإيميلهم الحقيقي
      const local = idf.replace(/\s+/g, "_").replace(/[^a-z0-9._-]/g, c => "_x" + c.charCodeAt(0).toString(16) + "_");
      return (local || "user") + MAIL_SUFFIX;
    }
    const isStaffRole = r => r === "coach" || r === "admin";

    // ===================== الحالة =====================
    let me = null;                       // { uid, role: coach|admin|student|parent, name, username, email }
    let unsubs = [];
    let maps = { core: {}, priv: {}, fin: {}, att: {} };
    let synced = {};                     // مفتاح -> آخر JSON اتكتب/اتقرا (عشان نكتب اللي اتغير بس)
    let loaded = { core: false, att: false, groups: false };
    let applyingRemote = false, signingUp = false;

    function resetState() {
      unsubs.forEach(u => { try { u(); } catch (_) {} }); unsubs = [];
      maps = { core: {}, priv: {}, fin: {}, att: {} }; synced = {};
      loaded = { core: false, att: false, groups: false };
    }

    function split(u) {
      const core = {}, priv = {}, fin = {};
      for (const k of Object.keys(u)) {
        if (k === "id" || k === "pass" || k === "isAdmin") continue;
        if (PRIV_KEYS.includes(k)) priv[k] = u[k];
        else if (FIN_KEYS.includes(k)) fin[k] = u[k];
        else core[k] = u[k];
      }
      core.role = "student";
      return { core: plain(core), priv: plain(priv), fin: plain(fin) };
    }

    // يبني db.users من الخرائط المحلية ويعيد الرسم
    function rebuild() {
      applyingRemote = true;
      try {
        const keepId = db.currId;
        const users = [];
        if (me && isStaffRole(me.role)) users.push({ id: me.uid, name: me.name, username: me.username, email: me.email, role: "coach", isAdmin: me.role === "admin" });
        const pend = window.__pendingDel || new Set();       // طلبة اتحذفوا ولسه في مهلة «تراجع»
        Object.keys(maps.core).forEach(id => {
          if (pend.has(id)) return;
          const u = Object.assign({}, maps.core[id], { id, role: "student" }, maps.priv[id] || {}, maps.fin[id] || {});
          users.push(u);
          const p = split(u);
          synced["c:" + id] = JSON.stringify(p.core);
          if (Object.keys(p.priv).length) synced["p:" + id] = JSON.stringify(p.priv);
          if (Object.keys(p.fin).length) synced["f:" + id] = JSON.stringify(p.fin);
        });
        db.users = users; db.currId = keepId;
        window.isFinanceAdminUnlocked = !!(me && me.role === "admin");
      } finally { applyingRemote = false; }
      render();
    }

    // ===================== المزامنة (بنكتب الوثائق اللي اتغيرت بس) =====================
    window.syncToCloud = async function () {
      if (applyingRemote || !me) return;
      const staff = isStaffRole(me.role), admin = me.role === "admin";
      const jobs = [];
      const push = (key, json, run) => {
        if (synced[key] === json) return;
        const prev = synced[key]; synced[key] = json;
        jobs.push(async () => { try { await run(); } catch (err) {
          synced[key] = prev; console.error("Cloud Sync Error:", key, err);
          if (!staff && err && err.code === "permission-denied") resyncSelf();   // القواعد رفضت: نرجع لنسخة السيرفر
        } });
      };
      try {
        const present = new Set(window.__pendingDel || []);   // مهلة التراجع: مانمسحش لسه
        for (const u of db.users) {
          if (u.role !== "student") continue;
          if (!staff && u.id !== me.uid) continue;
          present.add(u.id);
          const p = split(u);
          if (!staff && !loaded.core) continue;
          push("c:" + u.id, JSON.stringify(p.core), () => staff ? setDoc(doc(firestore, "users", u.id), p.core) : updateDoc(doc(firestore, "users", u.id), p.core));
          if (staff && Object.keys(p.priv).length) push("p:" + u.id, JSON.stringify(p.priv), () => setDoc(doc(firestore, "private", u.id), p.priv));
          if (admin && Object.keys(p.fin).length) push("f:" + u.id, JSON.stringify(p.fin), () => setDoc(doc(firestore, "finance", u.id), p.fin));
        }
        if (staff) {
          if (loaded.core) {
            Object.keys(synced).forEach(key => {
              const kind = key.slice(0, 2), id = key.slice(2);
              if ((kind === "c:" || kind === "p:" || kind === "f:") && !present.has(id)) {
                const coll = kind === "c:" ? "users" : kind === "p:" ? "private" : "finance";
                if (coll === "finance" && !admin) return;
                delete synced[key];
                jobs.push(async () => { try { await deleteDoc(doc(firestore, coll, id)); } catch (err) { console.error("Cloud Delete Error:", key, err); } });
              }
            });
          }
          if (loaded.att) {
            const dates = Object.keys(db.attendance || {});
            dates.forEach(d => push("a:" + d, JSON.stringify(db.attendance[d]), () => setDoc(doc(firestore, "attendance", d), { r: plain(db.attendance[d]) })));
            Object.keys(synced).forEach(key => {
              if (key.startsWith("a:") && !(key.slice(2) in (db.attendance || {}))) {
                const d = key.slice(2); delete synced[key];
                jobs.push(async () => { try { await deleteDoc(doc(firestore, "attendance", d)); } catch (err) { console.error(err); } });
              }
            });
          }
          if (loaded.groups) {
            const gDoc = { list: db.groups || [], sched: db.groupSched || {} };   // المجموعات + مواعيدها في نفس الوثيقة
            push("g", JSON.stringify(gDoc), () => setDoc(doc(firestore, "meta", "groups"), plain(gDoc)));
          }
        }
        for (const j of jobs) await j();
      } catch (err) { console.error("Cloud Sync Error:", err); }
    };

    // ===================== دفتر المحاولات (ألغاز وامتحانات) =====================
    async function resyncSelf() {
      if (!me || me.role !== "student") return;
      try {
        const snap = await getDoc(doc(firestore, "users", me.uid));
        if (snap.exists()) { maps.core = {}; maps.core[me.uid] = cleanDeep(snap.data()); rebuild(); }
      } catch (_) {}
    }
    // المحاولة + ملف الطالب في batch واحد: القواعد بتتأكد إن العدّادات زادت واحد بس ومع محاولة جديدة
    window.fbCommitAttempt = async (id, att) => {
      if (!me || me.role !== "student") return { ok: false };
      const u = db.users.find(x => x.id === me.uid); if (!u) return { ok: false };
      const p = split(u), key = "c:" + me.uid, prev = synced[key];
      synced[key] = JSON.stringify(p.core);                 // عشان المزامنة العادية ماتبعتش نفس التغيير تاني
      try {
        const b = writeBatch(firestore);
        b.set(doc(firestore, "attempts", id), Object.assign({ uid: me.uid, at: serverTimestamp() }, att));
        b.update(doc(firestore, "users", me.uid), p.core);
        await b.commit();
        return { ok: true };
      } catch (e) {
        synced[key] = prev;
        console.warn("Attempt rejected:", id, e && e.code);
        await resyncSelf();
        return { ok: false, code: e && e.code };
      }
    };
    // محاولات طالب (للتقرير الشهري) — الكوتش بس. كاش 5 دقايق عشان مانكررش القراءة
    const attCache = {};
    window.fbStudentAttempts = async (sid) => {
      if (!me || !(isStaffRole(me.role) || me.uid === sid || me.role === "parent")) return null;
      const c = attCache[sid]; if (c && Date.now() - c.t < 3e5) return c.list;
      try {
        const snap = await getDocs(query(collection(firestore, "attempts"), where("uid", "==", sid)));
        const list = [];
        snap.forEach(d => {
          const x = d.data() || {}, at = x.at && typeof x.at.toDate === "function" ? x.at.toDate() : null;
          let day = "";
          if (at) { const t = new Date(at); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); day = t.toISOString().slice(0, 10); }
          list.push({ kind: x.kind, ok: !!x.ok, key: x.key, day });
        });
        attCache[sid] = { t: Date.now(), list };
        return list;
      } catch (e) { console.warn("attempts read:", e && e.code); return null; }
    };

    // ===================== إعلانات الأكاديمية (meta/announcements) =====================
    window.fbSaveAnnouncements = async (items) => {
      if (!me || !isStaffRole(me.role)) return false;
      try { await setDoc(doc(firestore, "meta", "announcements"), { items: plain(items || []) }); return true; }
      catch (e) { console.error("announcements save:", e); if (window.toast) toast("تعذّر حفظ الإعلان"); return false; }
    };

    // ===================== تسجيل الأخطاء (errors) =====================
    let errSent = 0; const errSeen = new Set();
    const ERR_SKIP = /ResizeObserver|Script error|chrome-extension|moz-extension|safari-extension|Network ?Error|Failed to fetch|Load failed|NetworkError/i;
    async function flushErrors() {
      const q = window.__ecaErr || []; if (!q.length || !auth.currentUser) return;
      while (q.length && errSent < 10) {
        const e = q.shift(), key = (e.msg || "") + "|" + (e.line || 0);
        if (!e.msg || errSeen.has(key) || ERR_SKIP.test(e.msg + " " + (e.src || ""))) continue;
        errSeen.add(key); errSent++;
        try {
          await setDoc(doc(collection(firestore, "errors")), {
            msg: String(e.msg).slice(0, 500), src: String(e.src || "").slice(0, 300), line: Number(e.line) || 0,
            ua: String(navigator.userAgent || "").slice(0, 300), uid: auth.currentUser.uid, at: serverTimestamp(),
            ver: String(window.ECA_VERSION || ""), tab: String(typeof tab !== "undefined" ? tab : "").slice(0, 30)
          });
        } catch (_) { /* مانسجّلش خطأ تسجيل الأخطاء */ }
      }
    }
    setInterval(flushErrors, 8000);
    window.fbListErrors = async () => {
      if (!me || me.role !== "admin") return null;
      try {
        const snap = await getDocs(query(collection(firestore, "errors"), orderBy("at", "desc"), limit(40)));
        const out = []; snap.forEach(d => { const x = d.data() || {}; out.push({ id: d.id, msg: x.msg, src: x.src, line: x.line, ua: x.ua, uid: x.uid, ver: x.ver, tab: x.tab, at: x.at && x.at.toDate ? x.at.toDate() : null }); });
        return out;
      } catch (e) { console.warn("errors read:", e && e.code); return null; }
    };
    window.fbClearErrors = async (ids) => {
      if (!me || me.role !== "admin") return false;
      try { const b = writeBatch(firestore); (ids || []).slice(0, 450).forEach(id => b.delete(doc(firestore, "errors", id))); await b.commit(); return true; }
      catch (e) { console.warn(e); return false; }
    };

    // ===================== البطولات الداخلية =====================
    window.fbSaveTournament = async (t) => {
      if (!me || !isStaffRole(me.role) || !t || !t.id) return false;
      try { const o = Object.assign({}, t); delete o.id; await setDoc(doc(firestore, "tournaments", t.id), plain(o)); return true; }
      catch (e) { console.error("tournament save:", e); if (window.toast) toast("تعذّر حفظ البطولة"); return false; }
    };
    window.fbDeleteTournament = async (id) => {
      if (!me || !isStaffRole(me.role)) return false;
      try { await deleteDoc(doc(firestore, "tournaments", id)); return true; } catch (e) { console.error(e); return false; }
    };

    window.fbDeleteAttempt = async (id) => {
      if (!me || !isStaffRole(me.role)) return false;
      try { await deleteDoc(doc(firestore, "attempts", id)); return true; } catch (e) { console.warn("delete attempt:", e && e.code); return false; }
    };

    // ===================== الاستماع للتغييرات =====================
    function applyColl(kind, snap) {
      const next = {};
      snap.forEach(d => { next[d.id] = cleanDeep(d.data()); });
      Object.keys(maps[kind]).forEach(id => { if (!(id in next)) delete maps[kind][id]; });
      Object.keys(next).forEach(id => { maps[kind][id] = next[id]; });
      if (kind === "core") { loaded.core = true; window.__authLoading = false; }
      rebuild();
    }
    function applyAtt(snap) {
      const att = {};
      snap.forEach(d => { const r = (d.data() || {}).r; if (r && typeof r === "object" && Object.keys(r).length) att[d.id] = cleanDeep(r); });
      db.attendance = att; loaded.att = true;
      Object.keys(synced).forEach(k => { if (k.startsWith("a:")) delete synced[k]; });
      Object.keys(att).forEach(d => { synced["a:" + d] = JSON.stringify(att[d]); });
      render();
    }
    function applyGroups(snap) {
      const data = snap.exists() ? snap.data() : {};
      const list = Array.isArray(data.list) ? cleanDeep(data.list) : [];
      const sched = data.sched && typeof data.sched === "object" ? cleanDeep(data.sched) : {};
      db.groups = list; db.groupSched = sched; loaded.groups = true; synced["g"] = JSON.stringify({ list, sched });
      render();
    }
    function onErr(label) { return err => { console.error("Firestore listener error (" + label + "):", err); window.__authLoading = false; if (window.toast) toast("مفيش صلاحية لقراءة: " + label); }; }

    function startListeners() {
      if (!me) return;
      if (isStaffRole(me.role)) {
        unsubs.push(onSnapshot(collection(firestore, "users"), s => applyColl("core", s), onErr("users")));
        unsubs.push(onSnapshot(collection(firestore, "private"), s => applyColl("priv", s), onErr("private")));
        if (me.role === "admin") unsubs.push(onSnapshot(collection(firestore, "finance"), s => applyColl("fin", s), onErr("finance")));
        unsubs.push(onSnapshot(collection(firestore, "attendance"), applyAtt, onErr("attendance")));
      } else if (me.role === "student") {
        unsubs.push(onSnapshot(doc(firestore, "users", me.uid), snap => {
          if (snap.exists()) {
            maps.core = {}; maps.core[me.uid] = cleanDeep(snap.data());
            loaded.core = true; window.__authLoading = false; rebuild();
          } else if (!signingUp) {
            window.__authLoading = false;
            if (window.toast) toast("الحساب ده مش مربوط ببيانات طالب. كلّم الكوتش.");
            signOut(auth);
          }
        }, onErr("users")));
      }
      unsubs.push(onSnapshot(doc(firestore, "meta", "groups"), applyGroups, onErr("groups")));
      unsubs.push(onSnapshot(doc(firestore, "meta", "announcements"), snap => {
        db.announcements = snap.exists() && Array.isArray(snap.data().items) ? cleanDeep(snap.data().items) : [];
        if (tab === "home") render();
      }, err => console.warn("announcements not readable:", err && err.code)));
      // البطولات: الكوتش بيكتب، والطلبة بيقروا (الترتيب ونتايجهم)
      unsubs.push(onSnapshot(collection(firestore, "tournaments"), snap => {
        const list = []; snap.forEach(d => list.push(Object.assign(cleanDeep(d.data()), { id: d.id })));
        db.tournaments = list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        if (tab === "tournaments" || tab === "home") render();
      }, err => console.warn("tournaments not readable:", err && err.code)));
      // قائمة الشرف: الكوتش بيحدّثها، والطلبة بيقروها (الطالب مايقدرش يقرا بيانات زمايله مباشرة)
      unsubs.push(onSnapshot(doc(firestore, "meta", "honor"), s => {
        window.honorData = s.exists() ? cleanDeep(s.data()) : null;
        if (tab === "honor") render();
      }, err => console.warn("honor roll not readable:", err && err.code)));
    }

    // ===================== حالة الدخول =====================
    async function initUser(user) {
      resetState();
      if (!user) {
        me = null; db.users = []; db.currId = null; db.attendance = {}; db.groups = []; db.groupSched = {}; db.tournaments = []; db.announcements = [];
        window.isFinanceAdminUnlocked = false; window.__authLoading = false; render(); return;
      }
      if (user.isAnonymous) {
        me = { uid: user.uid, role: "parent" }; db.users = []; db.currId = null;
        window.__authLoading = false; render(); return;
      }
      let staffData = null;
      let staffErr = null;
      try { const s = await getDoc(doc(firestore, "staff", user.uid)); if (s.exists()) staffData = s.data(); }
      catch (e) { staffErr = e; console.error("staff read failed for uid " + user.uid, e); }
      console.info("[ECA] uid:", user.uid, "| staff doc:", staffData);
      if (staffErr) toast("Firebase منع قراءة بيانات الأدمن (" + ((staffErr && staffErr.code) || "error") + ") — راجع قواعد Firestore لـ staff");
      if (staffData) staffData.role = String(staffData.role || "").trim().toLowerCase();   // يقبل "Admin" أو " admin"
      if (!staffData && isGoogleUser(user)) {
        // أول دخول بجوجل: لو مفيش بيانات طالب، نطلب منه يختار (طالب / كوتش) مرة واحدة بس
        let hasProfile = false;
        try { hasProfile = (await getDoc(doc(firestore, "users", user.uid))).exists(); } catch (_) {}
        if (!hasProfile) {
          takeGoogleClick();
          me = null; db.users = []; db.currId = null; pendingGoogle = user;
          window.__authLoading = false; render(); openGoogleOnboarding(); return;
        }
      }
      if (staffData) {
        me = { uid: user.uid, role: staffData.role === "admin" ? "admin" : "coach", name: String(staffData.name || "Coach").replace(BAD, ""), username: String(staffData.username || "coach").replace(BAD, ""), email: user.email || "" };
      } else {
        me = { uid: user.uid, role: "student", email: user.email || "" };
        // داس "دخول الكوتش" بس الإيميل ده متسجّل كطالب → نوضّحله بدل ما يدخل طالب من غير سبب
        // نفتحله خانة الكود عشان يحوّل الحساب لكوتش/أدمن (ولو قفلها يكمّل طالب عادي)
        if (takeGoogleClick() === "coach") { pendingGoogle = user; pendingUpgrade = true; setTimeout(() => openGoogleOnboarding("coach"), 300); }
      }
      if (staffData) takeGoogleClick();
      db.currId = user.uid;
      window.isFinanceAdminUnlocked = me.role === "admin";
      startListeners();
    }
    onAuthStateChanged(auth, (user) => { if (signingUp) return; closeGoogleOnboarding(); initUser(user); });

    // ===================== الدخول بضغطة واحدة عن طريق Google =====================
    let pendingGoogle = null;            // مستخدم جوجل جديد مستني يختار نوع حسابه
    let pendingUpgrade = false;          // طالب موجود عايز يحوّل حسابه لكوتش/أدمن بكود
    let googleRole = "student";
    try { googleRole = sessionStorage.getItem("ECA_G_ROLE") || "student"; } catch (_) {}
    // الزر اللي اتداس في آخر محاولة دخول بجوجل (بيتقرا مرة واحدة بس)
    function takeGoogleClick() { let r = null; try { r = sessionStorage.getItem("ECA_G_CLICK"); sessionStorage.removeItem("ECA_G_CLICK"); } catch (_) {} return r; }
    const isGoogleUser = u => !!(u && (u.providerData || []).some(p => p.providerId === "google.com"));
    const G_ERR = {
      "auth/popup-closed-by-user": "", "auth/cancelled-popup-request": "",
      "auth/unauthorized-domain": "الدومين ده مش مضاف في Firebase (Authorized domains)",
      "auth/operation-not-allowed": "الدخول بجوجل مش متفعّل في Firebase Authentication",
      "auth/network-request-failed": "مفيش اتصال بالإنترنت",
      "auth/account-exists-with-different-credential": "الإيميل ده مسجّل بطريقة دخول تانية — ادخل بالباسورد واربط جوجل من زر",
      "auth/credential-already-in-use": "حساب جوجل ده مربوط بحساب تاني على المنصة",
      "auth/provider-already-linked": "حسابك مربوط بجوجل بالفعل"
    };
    const gToast = e => { const c = e && e.code; const m = c in G_ERR ? G_ERR[c] : "تعذّر الدخول بجوجل"; if (m) toast(m); console.error(e); };

    window.fbGoogleLogin = async (role) => {
      googleRole = role === "coach" ? "coach" : "student";
      try { sessionStorage.setItem("ECA_G_ROLE", googleRole); sessionStorage.setItem("ECA_G_CLICK", googleRole); } catch (_) {}
      try { await signInWithPopup(auth, googleProvider); }
      catch (e) {
        // الموبايل أو متصفح بيمنع النوافذ المنبثقة → نحوّل لصفحة جوجل ونرجع تلقائياً
        if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) {
          try { await signInWithRedirect(auth, googleProvider); } catch (e2) { gToast(e2); }
        } else { takeGoogleClick(); gToast(e); }
      }
    };
    getRedirectResult(auth).catch(gToast);

    // ربط جوجل بحساب موجود (طالب باليوزر نيم أو كوتش بالإيميل) عشان الدخول بعد كده يبقى بضغطة واحدة
    window.fbLinkGoogle = async () => {
      if (!auth.currentUser || auth.currentUser.isAnonymous) return;
      try { await linkWithPopup(auth.currentUser, googleProvider); render(); toast("تم ربط حسابك بجوجل — المرة الجاية ادخل بضغطة واحدة"); }
      catch (e) { gToast(e); }
    };
    window.fbAuthInfo = () => {
      const u = auth.currentUser, ps = (u && u.providerData || []).map(p => p.providerId);
      return { google: ps.includes("google.com"), password: ps.includes("password") };
    };

    function closeGoogleOnboarding() { const m = document.getElementById("googleOnboardModal"); if (m) m.remove(); }
    function openGoogleOnboarding(role) {
      if (!pendingGoogle) return;
      if (role) googleRole = role;
      let m = document.getElementById("googleOnboardModal");
      if (!m) { m = document.createElement("div"); m.id = "googleOnboardModal"; m.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"; document.body.appendChild(m); }
      const r = googleRole, gName = String(pendingGoogle.displayName || "").replace(BAD, "");
      const tabCls = on => `py-2.5 rounded-xl text-xs font-bold border ${on ? 'border-yellow-400 text-yellow-300 bg-yellow-500/10' : 'border-zinc-800 text-gray-400'}`;
      m.innerHTML = `
        <form onsubmit="completeGoogleOnboarding(event)" class="gold-card rounded-2xl max-w-md w-full p-6 space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-display font-bold text-lg text-yellow-400">أهلاً بيك في ECA</h3>
            <button type="button" onclick="cancelGoogleOnboarding()" class="text-gray-400 hover:text-white tap px-2">✕</button>
          </div>
          ${pendingUpgrade ? `<p class="text-xs text-gray-300">الحساب <b dir="ltr">${esc(pendingGoogle.email || "")}</b> متسجّل كطالب. اكتب كود الأدمن أو كود دعوة الكوتش عشان تحوّله لحساب كوتش — أو اقفل النافذة وكمّل كطالب.</p>` : `
          <p class="text-xs text-gray-300">دخلت بحساب <b dir="ltr">${esc(pendingGoogle.email || "")}</b>. اختار نوع حسابك مرة واحدة بس — بعد كده الدخول بضغطة واحدة.</p>`}
          <div class="grid grid-cols-2 gap-2 ${pendingUpgrade ? 'hidden' : ''}">
            <button type="button" onclick="openGoogleOnboarding('student')" class="${tabCls(r === 'student')}">طالب</button>
            <button type="button" onclick="openGoogleOnboarding('coach')" class="${tabCls(r === 'coach')}">كوتش</button>
          </div>
          <input id="gName" required value="${esc(gName)}" placeholder="الاسم بالكامل" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-sm text-white" />
          ${r === "student" ? `
            <select id="gStep" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-sm text-yellow-300">
              ${[1, 2, 3, 4, 5, 6].map(l => `<option value="${l}">Step ${l}</option>`).join("")}
            </select>` : `
            <input id="gCode" required autocomplete="off" autocapitalize="characters" placeholder="كود الأدمن أو كود دعوة الكوتش" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-sm text-white text-center tracking-widest uppercase" />
            <p class="text-[11px] text-gray-400">أول مرة: اكتب كود الأدمن الثابت. بعد كده الأدمن بيطلّع أكواد للكوتشات من زر «كود دعوة كوتش جديد».</p>`}
          <button class="w-full py-3 rounded-xl text-sm gold-btn">دخول المنصة</button>
        </form>`;
      applyLang();
      const f = document.getElementById(r === "coach" ? "gCode" : "gName"); if (f) f.focus();
    }
    window.openGoogleOnboarding = openGoogleOnboarding;
    window.cancelGoogleOnboarding = async () => {
      const up = pendingUpgrade; pendingGoogle = null; pendingUpgrade = false; closeGoogleOnboarding();
      if (!up) { try { await signOut(auth); } catch (_) {} }   // الطالب الموجود يكمّل عادي
    };

    window.completeGoogleOnboarding = async (ev) => {
      ev.preventDefault();
      const user = pendingGoogle; if (!user) return closeGoogleOnboarding();
      const btn = ev.submitter; if (btn) btn.disabled = true;
      const name = document.getElementById("gName").value.trim().replace(BAD, "");
      const email = String(user.email || "").toLowerCase();
      const base = (email.split("@")[0] || "user").replace(/[^a-z0-9_]/g, "_").slice(0, 20);
      const username = base + "_" + user.uid.slice(0, 4).toLowerCase();   // مميز لكل حساب
      signingUp = true; let madeAdmin = false;
      try {
        if (!name) throw { code: "no-name" };
        if (googleRole === "coach") {
          const code = document.getElementById("gCode").value.trim().toUpperCase();
          if (!/^[A-Z0-9]{8,16}$/.test(code)) throw { code: "bad-invite" };
          madeAdmin = (await claimStaff(user.uid, name, base, code)) === "admin";
        } else {
          let group = "";
          try { const g = await getDoc(doc(firestore, "meta", "groups")); if (g.exists() && Array.isArray(g.data().list)) group = String(g.data().list[0] || ""); } catch (_) {}
          const level = Number(document.getElementById("gStep").value) || 1;
          await setDoc(doc(firestore, "users", user.uid), { name, username, email, role: "student", level, group, mode: "offline", att: {}, hw: {}, puz: { t: 0, c: 0 } });
        }
        pendingGoogle = null; pendingUpgrade = false; closeGoogleOnboarding();
        await initUser(user);
        tab = "home"; render();
        toast(madeAdmin ? "تم تفعيل حساب الأدمن" : googleRole === "coach" ? "تم إنشاء حساب الكوتش!" : "تم إنشاء حسابك!");
      } catch (e) {
        if (btn) btn.disabled = false;
        const c = e && e.code;
        toast(c === "no-name" ? "اكتب الاسم" : (c === "bad-invite" || c === "permission-denied" || c === "not-found") ? "كود الدعوة غير صحيح أو مستخدم قبل كده" : "تعذّر إنشاء الحساب");
        console.error(e);
      } finally { signingUp = false; }
    };

    // تفعيل حساب كوتش/أدمن بكود:
    // 1) كود الأدمن الثابت (أول مرة بس): متخزّن في Firestore Rules مش في الصفحة، وبعد أول استخدام بيتقفل للأبد (meta/adminBootstrap)
    // 2) غير كده: كود دعوة عادي من invites (بيستخدم مرة واحدة)
    async function claimStaff(uid, name, username, code) {
      try {
        const b = writeBatch(firestore);
        b.set(doc(firestore, "staff", uid), { role: "admin", name, username, invite: code });
        b.set(doc(firestore, "meta", "adminBootstrap"), { uid, at: Date.now() });
        await b.commit();
        try { await deleteDoc(doc(firestore, "users", uid)); } catch (_) {}   // لو كان اتسجّل طالب بالغلط قبل كده
        return "admin";
      } catch (_) { /* مش كود الأدمن الثابت → نجرب كود دعوة أدمن */ }
      try {
        // كود دعوة أدمن (invites/{code}.role == "admin") — الـ Rules بترفضه لو الكود ده كود كوتش
        const b = writeBatch(firestore);
        b.update(doc(firestore, "invites", code), { used: true, usedBy: uid });
        b.set(doc(firestore, "staff", uid), { role: "admin", name, username, invite: code });
        await b.commit();
        try { await deleteDoc(doc(firestore, "users", uid)); } catch (_) {}
        return "admin";
      } catch (_) { /* مش كود أدمن → نجرب كود دعوة كوتش */ }
      const batch = writeBatch(firestore);
      batch.update(doc(firestore, "invites", code), { used: true, usedBy: uid });
      batch.set(doc(firestore, "staff", uid), { role: "coach", name, username, invite: code });
      await batch.commit();
      return "coach";
    }

    // ===================== واجهات تستدعيها الصفحة =====================
    window.fbLogin =async (idf, pass) => {
      try { await signInWithEmailAndPassword(auth, toAuthEmail(idf), pass); return { ok: true }; }
      catch (e) { return { ok: false, code: e && e.code }; }
    };
    window.fbLogout = async () => { try { await signOut(auth); } catch (_) {} };

    window.fbSignup = async ({ name, username, email, pass, level }) => {
      signingUp = true;
      try {
        const cred = await createUserWithEmailAndPassword(auth, toAuthEmail(username), pass);
        let group = "";
        try { const g = await getDoc(doc(firestore, "meta", "groups")); if (g.exists() && Array.isArray(g.data().list)) group = String(g.data().list[0] || ""); } catch (_) {}
        const profile = { name, username, email: email || "", role: "student", level: Number(level) || 1, group, mode: "offline", att: {}, hw: {}, puz: { t: 0, c: 0 } };
        await setDoc(doc(firestore, "users", cred.user.uid), profile);
        await initUser(cred.user);
        return { ok: true };
      } catch (e) {
        return { ok: false, code: e && e.code };
      } finally { signingUp = false; }
    };

    // تسجيل كوتش جديد بكود دعوة (الكود بيتراجع في Firestore Rules مش في الصفحة، ومرة واحدة)
    window.fbCoachSignup = async ({ name, username, email, pass, code }) => {
      code = String(code || "").trim().toUpperCase();
      if (!/^[A-Z0-9]{8,16}$/.test(code)) return { ok: false, code: "bad-invite" };
      signingUp = true; let cred = null;
      try {
        cred = await createUserWithEmailAndPassword(auth, String(email).trim().toLowerCase(), pass);
        await claimStaff(cred.user.uid, name, username, code);
        await initUser(cred.user);
        return { ok: true };
      } catch (e) {
        if (cred) { try { await deleteUser(cred.user); } catch (_) {} await initUser(null); }
        return { ok: false, code: e && e.code };
      } finally { signingUp = false; }
    };
    window.fbPublishHonor = async (data) => {
      if (!me || !isStaffRole(me.role)) return false;
      try { await setDoc(doc(firestore, "meta", "honor"), plain(data)); return true; }
      catch (e) { console.warn("honor roll publish failed:", e && e.code); return false; }
    };
    window.fbCreateInvite = async (role) => {
      if (!me || me.role !== "admin") return null;
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const r = crypto.getRandomValues(new Uint8Array(10));
      let code = ""; for (const b of r) code += alphabet[b % alphabet.length];
      const data = { used: false, createdBy: me.uid, createdAt: Date.now() };
      if (role === "admin") data.role = "admin";     // كود دعوة أدمن (صلاحيات كاملة)
      try { await setDoc(doc(firestore, "invites", code), data); return code; }
      catch (e) { console.error(e); return null; }
    };

    // الكوتش بينشئ حساب طالب بدون ما يتسجّل خروج (بنستخدم نسخة ثانية من التطبيق)
    let secApp = null;
    window.fbCreateStudentAccount = async (username, pass) => {
      if (!secApp) secApp = initializeApp(firebaseConfig, "secondary");
      const a = getAuth(secApp);
      const cred = await createUserWithEmailAndPassword(a, toAuthEmail(username), pass);
      const uid = cred.user.uid;
      try { await signOut(a); } catch (_) {}
      return uid;
    };

    // ===================== اختبار تحديد المستوى =====================
    // الطالب بدون حساب: بنستخدم نسخة تانية من التطبيق (placement) بدخول مجهول، عشان ما نغيّر حالة الموقع الرئيسي (ولي أمر/طالب)
    let ptApp = null, ptAuth = null, ptDb = null;
    const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({ code: "timeout" }), ms))]);
    async function ptInit() {
      if (!ptApp) { ptApp = initializeApp(firebaseConfig, "placement"); ptAuth = getAuth(ptApp); ptDb = initializeFirestore(ptApp, {}); }
      try { if (ptAuth.authStateReady) await ptAuth.authStateReady(); } catch (_) {}
      if (!ptAuth.currentUser) await signInAnonymously(ptAuth);
      return ptAuth.currentUser.uid;
    }
    // منع إعادة الاختبار: بنقفل (1) الجهاز/المتصفح عن طريق uid الدخول المجهول، (2) بصمة لينك حساب الشطرنج، (3) الـ uid القديم المحفوظ في الجهاز.
    // كله في batch واحد مع وثيقة الاختبار، فلو أي قفل موجود قبل كده العملية كلها بتترفض (permission-denied).
    window.fbPtStart = async (rec) => {
      try {
        const uid = await withTimeout(ptInit(), 15000);
        const id = rec.id, prior = rec.prior; delete rec.id; delete rec.prior;
        const chk = ["u_" + uid]; if (prior) chk.push("u_" + prior); if (rec.lk) chk.push("l_" + rec.lk);
        for (const k of chk) { const s = await withTimeout(getDoc(doc(ptDb, "placementLocks", k)), 12000); if (s.exists()) return { ok: false, code: "permission-denied" }; }
        const b = writeBatch(ptDb), now = Date.now();
        b.set(doc(ptDb, "placementLocks", "u_" + uid), { owner: uid, t: now });
        if (rec.lk) b.set(doc(ptDb, "placementLocks", "l_" + rec.lk), { owner: uid, t: now });
        b.set(doc(ptDb, "placementTests", id), Object.assign({}, rec, { owner: uid, status: "in_progress", createdAt: now, answers: {} }));
        await withTimeout(b.commit(), 15000);
        return { ok: true, uid };
      } catch (e) { return { ok: false, code: e && e.code }; }
    };
    window.fbPtSave = async (id, patch, tries) => {
      let last = null;
      for (let k = 0; k < (tries || 3); k++) {
        try { await ptInit(); await withTimeout(updateDoc(doc(ptDb, "placementTests", id), patch), 12000); return { ok: true }; }
        catch (e) { last = e; if (e && e.code === "permission-denied") break; await new Promise(r => setTimeout(r, 700 * (k + 1))); }
      }
      return { ok: false, code: last && last.code };
    };
    window.fbPtList = async () => {
      if (!me || !isStaffRole(me.role)) return { ok: false, rows: [] };
      try {
        const q = await getDocs(query(collection(firestore, "placementTests"), orderBy("createdAt", "desc"), limit(500)));
        return { ok: true, rows: q.docs.map(d => Object.assign({ id: d.id }, d.data())) };
      } catch (e) { console.error(e); return { ok: false, rows: [] }; }
    };
    window.fbPtUpdate = async (id, patch) => {
      try { await updateDoc(doc(firestore, "placementTests", id), patch); return { ok: true }; } catch (e) { console.error(e); return { ok: false }; }
    };
    window.fbPtReopen = async (id, row) => {
      try {
        const b = writeBatch(firestore);
        b.delete(doc(firestore, "placementTests", id));
        if (row && row.owner) b.delete(doc(firestore, "placementLocks", "u_" + row.owner));
        if (row && row.lk) b.delete(doc(firestore, "placementLocks", "l_" + row.lk));
        await b.commit(); return { ok: true };
      } catch (e) { console.error(e); return { ok: false }; }
    };
    // نسخة احتياطية من كل تقرير: بتتحذف بعد 30 يوم (expireAt) — TTL من Firebase + تنضيف من الكوتش عند فتح الصفحة
    window.fbPtSaveReport = async (rows) => {
      if (!me || !isStaffRole(me.role)) return { ok: false };
      try {
        const now = Date.now();
        await setDoc(doc(firestore, "placementReports", String(now)), { createdAt: now, expireAt: new Date(now + 30 * 86400000), by: me.uid, count: rows.length, rows: JSON.stringify(rows) });
        return { ok: true };
      } catch (e) { console.error(e); return { ok: false }; }
    };
    window.fbPtCleanup = async () => {
      if (!me || !isStaffRole(me.role)) return;
      const q = await getDocs(query(collection(firestore, "placementReports"), where("expireAt", "<", new Date())));
      for (const d of q.docs) await deleteDoc(d.ref);
    };

    window.fbOnStudentDeleted = async (id) => {
      try { await setDoc(doc(firestore, "deleted", id), { at: Date.now() }); } catch (e) { console.error(e); }
      try {
        const q = await getDocs(query(collection(firestore, "parentLinks"), where("sid", "==", id)));
        for (const d of q.docs) await deleteDoc(d.ref);
      } catch (e) { console.error(e); }
    };

    window.fbChangePassword = async (oldP, newP) => {
      try {
        const u = auth.currentUser; if (!u || !u.email) return { ok: false };
        await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, oldP));
        await updatePassword(u, newP);
        return { ok: true };
      } catch (e) { return { ok: false, code: e && e.code }; }
    };

    // ===================== ولي الأمر (كود متابعة) =====================
    window.fbParentLookup = async (codeRaw) => {
      const code = String(codeRaw || "").trim().toUpperCase();
      if (!/^[A-Z0-9]{8,16}$/.test(code)) return { ok: false, code: "bad" };
      try {
        if (!auth.currentUser) await signInAnonymously(auth);
        const uid = auth.currentUser.uid;
        const c = await getDoc(doc(firestore, "parentCodes", code));
        if (!c.exists()) return { ok: false, code: "notfound" };
        const sid = c.data().sid;
        await setDoc(doc(firestore, "parentLinks", uid + "_" + sid), { code, sid });
        const u = await getDoc(doc(firestore, "users", sid));
        let p = {}; try { const ps = await getDoc(doc(firestore, "private", sid)); if (ps.exists()) p = ps.data(); } catch (_) {}
        if (!u.exists()) return { ok: false, code: "notfound" };
        return { ok: true, stu: Object.assign({}, cleanDeep(u.data()), { id: sid, role: "student" }, cleanDeep(p)) };
      } catch (e) { return { ok: false, code: e && e.code }; }
    };

    window.fbGenParentCode = async (sid) => {
      if (!me || !isStaffRole(me.role)) return null;
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const r = crypto.getRandomValues(new Uint8Array(12));
      let code = ""; for (const b of r) code += alphabet[b % alphabet.length];
      const u = db.users.find(x => x.id === sid); if (!u) return null;
      const old = u.parentCode;
      await setDoc(doc(firestore, "parentCodes", code), { sid });
      if (old) { try { await deleteDoc(doc(firestore, "parentCodes", old)); } catch (_) {} }
      // تجديد الكود = سحب صلاحية أي جهاز كان مربوط بالكود القديم
      try {
        const q = await getDocs(query(collection(firestore, "parentLinks"), where("sid", "==", sid)));
        for (const d of q.docs) await deleteDoc(d.ref);
      } catch (_) {}
      u.parentCode = code; save();
      return code;
    };

    // ===================== ترحيل الطلاب من النظام القديم (للأدمن، مرة واحدة) =====================
    // ================= ECA FINANCIAL & ANALYTICS DASHBOARD (CONVERTED FROM CODE.GS & HTML) =================
   // ================= ECA FINANCIAL & ANALYTICS DASHBOARD (SELF-BINDING) =================
    window.finSubTab = window.finSubTab || "analytics";
    window.finSearchQ = window.finSearchQ || "";
    window.finSelectedStuId = window.finSelectedStuId || "";

    window.ensureStudentFinData = function(s, idx) {
      if (!s.stuCode) s.stuCode = "ECA-" + String(idx + 1).padStart(4, "0");
      s.courseFee = Number(s.courseFee) || 0;
      s.amountPaid = Number(s.amountPaid) || 0;
      s.remaining = Math.max(0, s.courseFee - s.amountPaid);
      if (!s.coachName) s.coachName = "Coach Abdelrahman";
      return s;
    };

    window.renderFinanceDashboardView = function() {
      const students = db.users.filter(u => u.role === "student").map((s, idx) => window.ensureStudentFinData(s, idx));
      const todayKey = todayISO();

      let totalFees = 0, totalPaid = 0, totalRem = 0;
      let todayCount = 0, todayPaid = 0, todayRem = 0;
      const byStep = {};
      const byCoach = {};

      students.forEach(s => {
        totalFees += s.courseFee;
        totalPaid += s.amountPaid;
        totalRem += s.remaining;

        if (s.lastPayDate === todayKey) {
          todayCount++;
          todayPaid += Number(s.lastPayAmount) || 0;
          todayRem += s.remaining;
        }

        const stLabel = "Step " + (s.level || 1);
        byStep[stLabel] = byStep[stLabel] || { count: 0, paid: 0, fee: 0 };
        byStep[stLabel].count++;
        byStep[stLabel].paid += s.amountPaid;
        byStep[stLabel].fee += s.courseFee;

        const cName = s.coachName || "Coach Abdelrahman";
        byCoach[cName] = byCoach[cName] || { count: 0, paid: 0, fee: 0 };
        byCoach[cName].count++;
        byCoach[cName].paid += s.amountPaid;
        byCoach[cName].fee += s.courseFee;
      });

      const tabBtnCls = (t) => `flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition ${window.finSubTab === t ? 'gold-btn' : 'bg-zinc-900 text-gray-300 border border-yellow-500/20 hover:border-yellow-400'}`;

      return `
        <div class="space-y-6">
          <div class="gold-card rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 class="font-display font-bold text-xl gold-gradient-text">لوحة تحليلات وحسابات الأكاديمية (ECA ERP Dashboard)</h2>
              <p class="text-xs text-gray-400 mt-1">إدارة الاشتراكات، المسدد، المتبقي، إحصائيات اليوم، وتحليل الإيرادات حسب المستوى والمدرب.</p>
            </div>
            <button onclick="exportFinanceCSV()" class="px-4 py-2 rounded-xl text-xs gold-btn">⬇ تصدير التقرير المالي (Excel/CSV)</button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="gold-card rounded-2xl p-4 text-center border-t-4 border-sky-500">
              <div class="text-[11px] text-gray-400 font-bold">إجمالي الطلاب (TOTAL STUDENTS)</div>
              <div class="text-2xl font-extrabold text-sky-400 mt-1">${students.length}</div>
            </div>
            <div class="gold-card rounded-2xl p-4 text-center border-t-4 border-yellow-500">
              <div class="text-[11px] text-gray-400 font-bold">إجمالي قيمة الاشتراكات (TOTAL FEES)</div>
              <div class="text-2xl font-extrabold text-yellow-300 mt-1">${totalFees.toLocaleString()} <span class="text-xs">EGP</span></div>
            </div>
            <div class="gold-card rounded-2xl p-4 text-center border-t-4 border-emerald-500">
              <div class="text-[11px] text-gray-400 font-bold">إجمالي المسدد (TOTAL PAID)</div>
              <div class="text-2xl font-extrabold text-emerald-400 mt-1">${totalPaid.toLocaleString()} <span class="text-xs">EGP</span></div>
            </div>
            <div class="gold-card rounded-2xl p-4 text-center border-t-4 border-red-500">
              <div class="text-[11px] text-gray-400 font-bold">إجمالي المتبقي (REMAINING)</div>
              <div class="text-2xl font-extrabold text-red-400 mt-1">${totalRem.toLocaleString()} <span class="text-xs">EGP</span></div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 bg-black/60 p-2 rounded-2xl border border-yellow-500/20">
            <button onclick="window.finSubTab='analytics'; render();" class="${tabBtnCls('analytics')}">الداشبورد والتحليلات</button>
            <button onclick="window.finSubTab='manage'; render();" class="${tabBtnCls('manage')}">تسجيل وبحث وتعديل اشتراك طالب</button>
            <button onclick="window.finSubTab='today'; render();" class="${tabBtnCls('today')}">إحصائيات وتحصيلات اليوم (${todayKey})</button>
          </div>

          ${window.finSubTab === "analytics" ? window.renderFinAnalyticsSection(students, byStep, byCoach, totalFees) : ""}
          ${window.finSubTab === "manage" ? window.renderFinManageSection(students) : ""}
          ${window.finSubTab === "today" ? window.renderFinTodaySection(students, todayKey, todayCount, todayPaid, todayRem) : ""}
        </div>
      `;
    };

    window.renderFinAnalyticsSection = function(students, byStep, byCoach, totalFees) {
      const stepKeys = Object.keys(byStep).sort();
      const coachKeys = Object.keys(byCoach);
      const q = (window.finSearchQ || "").toLowerCase();
      return `
        <div class="grid md:grid-cols-2 gap-6">
          <div class="gold-card rounded-2xl p-5 space-y-3">
            <h3 class="font-display font-bold text-sm text-yellow-400">توزيع الطلاب والإيرادات حسب المستوى (Step 1 - 6)</h3>
            <div class="space-y-3">
              ${stepKeys.map(k => {
                const item = byStep[k];
                const pct = totalFees > 0 ? Math.round((item.fee / totalFees) * 100) : 0;
                return `
                  <div class="space-y-1">
                    <div class="flex justify-between text-xs">
                      <span class="font-bold text-white">${k} <span class="text-gray-400">(${item.count} طلاب)</span></span>
                      <span class="text-emerald-300 font-bold">مسدد: ${item.paid.toLocaleString()} / ${item.fee.toLocaleString()} EGP (${pct}%)</span>
                    </div>
                    <div class="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-yellow-500/20">
                      <div class="h-full gold-btn" style="width: ${Math.max(5, pct)}%"></div>
                    </div>
                  </div>`;
              }).join("")}
            </div>
          </div>

          <div class="gold-card rounded-2xl p-5 space-y-3">
            <h3 class="font-display font-bold text-sm text-yellow-400">إجمالي الاشتراكات والتحصيل حسب المدرب</h3>
            <div class="space-y-3">
              ${coachKeys.map(c => {
                const item = byCoach[c];
                const pct = item.fee > 0 ? Math.round((item.paid / item.fee) * 100) : 100;
                return `
                  <div class="space-y-1">
                    <div class="flex justify-between text-xs">
                      <span class="font-bold text-white">${esc(c)} <span class="text-gray-400">(${item.count} طلاب)</span></span>
                      <span class="text-yellow-300 font-bold">تحصيل: ${item.paid.toLocaleString()} / ${item.fee.toLocaleString()} EGP (${pct}%)</span>
                    </div>
                    <div class="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-emerald-500/20">
                      <div class="h-full bg-emerald-500" style="width: ${Math.max(5, pct)}%"></div>
                    </div>
                  </div>`;
              }).join("")}
            </div>
          </div>
        </div>

        <div class="gold-card rounded-2xl p-5 space-y-3">
          <div class="flex flex-wrap justify-between items-center gap-2">
            <h3 class="font-display font-bold text-sm text-yellow-400">سجل اشتراكات الطلاب المالي الشامل</h3>
            <input id="finQuickFilter" value="${esc(window.finSearchQ)}" oninput="window.finSearchQ=this.value; render();" placeholder="ابحث بالكود (ECA-0001) أو الاسم أو الموبايل..." class="bg-black border border-yellow-500/40 rounded-xl px-3 py-1.5 text-xs text-white min-w-[240px]" />
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-white">
              <thead>
                <tr class="text-yellow-300 border-b border-yellow-500/30 text-left">
                  <th class="py-2 px-2">كود الطالب</th>
                  <th class="py-2 px-2">الاسم</th>
                  <th class="py-2 px-2">المستوى / الجروب</th>
                  <th class="py-2 px-2">المدرب</th>
                  <th class="py-2 px-2">قيمة الاشتراك</th>
                  <th class="py-2 px-2">المسدد</th>
                  <th class="py-2 px-2">المتبقي</th>
                  <th class="py-2 px-2">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-yellow-500/10">
                ${students.filter(s => !q || s.name.toLowerCase().includes(q) || s.stuCode.toLowerCase().includes(q) || String(s.phone||"").includes(q)).map(s => {
                  const wa = waLink(s.parentPhone || s.phone);
                  const waMsg = encodeURIComponent(`أهلاً بحضرتك من Egypt Chess Academy (ECA)\nتذكير ودي بخصوص اشتراك البطل (${s.name} - كود ${s.stuCode}):\n• إجمالي الاشتراك: ${s.courseFee} ج.م\n• المسدد: ${s.amountPaid} ج.م\n• المتبقي: ${s.remaining} ج.م\nشكراً لتعاونكم معنا!`);
                  return `
                    <tr class="hover:bg-yellow-500/5">
                      <td class="py-2.5 px-2 font-mono text-yellow-300 font-bold">${esc(s.stuCode)}</td>
                      <td class="py-2.5 px-2 font-bold">${esc(s.name)}</td>
                      <td class="py-2.5 px-2 text-gray-300">Step ${s.level} •${esc(s.group || "")}</td>
                      <td class="py-2.5 px-2 text-gray-300">${esc(s.coachName)}</td>
                      <td class="py-2.5 px-2 font-bold">${s.courseFee} EGP</td>
                      <td class="py-2.5 px-2 font-bold text-emerald-400">${s.amountPaid} EGP</td>
                      <td class="py-2.5 px-2 font-bold ${s.remaining > 0 ? 'text-red-400' : 'text-gray-400'}">${s.remaining} EGP</td>
                      <td class="py-2.5 px-2 flex gap-1.5">
                        <button onclick="openFinEditForStudent('${s.id}')" class="px-2.5 py-1 rounded-lg bg-zinc-800 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500 hover:text-black font-bold">تحصيل / تعديل</button>
                        ${s.remaining > 0 && wa ? `<a href="${wa}?text=${waMsg}" target="_blank" class="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">تذكير واتساب</a>` : ""}
                      </td>
                    </tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    };

    window.renderFinManageSection = function(students) {
      const sel = students.find(s => s.id === window.finSelectedStuId) || students[0] || null;
      const fee = sel ? sel.courseFee : 0;
      const paid = sel ? sel.amountPaid : 0;
      const rem = Math.max(0, fee - paid);

      return `
        <div class="gold-card rounded-2xl p-6 max-w-3xl mx-auto space-y-5">
          <div class="flex flex-wrap justify-between items-center gap-3 border-b border-yellow-500/20 pb-3">
            <h3 class="font-display font-bold text-lg text-yellow-400">استمارة تسجيل وتحديث رسوم الطالب</h3>
            <button onclick="openAddStu()" class="px-3 py-1.5 rounded-xl text-xs bg-zinc-900 border border-yellow-500/40 text-yellow-300">طالب جديد بالكامل</button>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-400 mb-1">اختر الطالب أو ابحث بكوده (ECA):</label>
              <select onchange="window.finSelectedStuId=this.value; render();" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2.5 text-xs text-yellow-300 font-bold">
                ${students.map(s => `<option value="${s.id}" ${sel && sel.id === s.id ? 'selected' : ''}>${esc(s.stuCode)} —${esc(s.name)} (@${esc(s.username)}) \vert{} المتبقي: ${s.remaining} EGP</option>`).join("")}
              </select>
            </div>

            ${sel ? `
              <div>
                <label class="block text-xs text-gray-400 mb-1">اسم الطالب</label>
                <input id="finName" value="${esc(sel.name)}" class="w-full bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">رقم هاتف ولي الأمر (واتساب)</label>
                <input id="finPhone" value="${esc(sel.parentPhone || sel.phone || '')}" placeholder="010XXXXXXXX" class="w-full bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">المستوى / الدورة التدريبية</label>
                <select id="finLevel" class="w-full bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-yellow-300">
                  ${[1,2,3,4,5,6].map(l => `<option value="${l}" ${Number(sel.level)===l?'selected':''}>Step ${l}</option>`).join("")}
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">اسم المدرب المحاضر</label>
                <input id="finCoach" value="${esc(sel.coachName || 'Coach Abdelrahman')}" class="w-full bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">قيمة الكورس الإجمالية (EGP)</label>
                <input id="finFee" type="number" min="0" value="${fee}" oninput="updateLiveCalcBox()" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-xs text-white font-bold" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">إجمالي المبلغ المسدد (EGP)</label>
                <input id="finPaid" type="number" min="0" value="${paid}" oninput="updateLiveCalcBox()" class="w-full bg-black border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold" />
              </div>
            ` : ""}
          </div>

          <div class="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-black/80 border border-yellow-500/30 text-center">
            <div>
              <div class="text-[11px] text-gray-400">قيمة الكورس</div>
              <div id="liveDispFee" class="text-lg font-extrabold text-white mt-0.5">${fee.toLocaleString()} EGP</div>
            </div>
            <div>
              <div class="text-[11px] text-gray-400">المبلغ المسدد</div>
              <div id="liveDispPaid" class="text-lg font-extrabold text-emerald-400 mt-0.5">${paid.toLocaleString()} EGP</div>
            </div>
            <div>
              <div class="text-[11px] text-gray-400">المبلغ المتبقي</div>
              <div id="liveDispRem" class="text-lg font-extrabold text-red-400 mt-0.5">${rem.toLocaleString()} EGP</div>
            </div>
          </div>

          <div class="flex flex-wrap justify-end gap-2">
            <button onclick="saveStudentFinanceRecord('${sel ? sel.id : ''}')" class="px-6 py-2.5 rounded-xl text-xs gold-btn">حفظ البيانات المالية وتحديث الداشبورد</button>
          </div>
        </div>
      `;
    };

    window.renderFinTodaySection = function(students, todayKey, todayCount, todayPaid, todayRem) {
      const todayStudents = students.filter(s => s.lastPayDate === todayKey);
      return `
        <div class="space-y-5">
          <div class="grid sm:grid-cols-4 gap-4">
            <div class="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white text-center shadow-lg">
              <div class="text-xs opacity-90">عمليات تحصيل اليوم</div>
              <div class="text-2xl font-extrabold mt-1">${todayCount}</div>
            </div>
            <div class="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white text-center shadow-lg">
              <div class="text-xs opacity-90">إجمالي المحصل اليوم</div>
              <div class="text-2xl font-extrabold mt-1">${todayPaid.toLocaleString()} EGP</div>
            </div>
            <div class="p-5 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white text-center shadow-lg">
              <div class="text-xs opacity-90">متبقيات طلاب اليوم</div>
              <div class="text-2xl font-extrabold mt-1">${todayRem.toLocaleString()} EGP</div>
            </div>
            <div class="p-5 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 text-white text-center shadow-lg">
              <div class="text-xs opacity-90">تاريخ اليوم</div>
              <div class="text-lg font-extrabold mt-2">${todayKey}</div>
            </div>
          </div>

          <div class="gold-card rounded-2xl p-5">
            <h4 class="font-bold text-sm text-yellow-400 mb-3">قائمة الطلاب المسددين اليوم (${todayKey}):</h4>
            ${todayStudents.length === 0 ? `<p class="text-xs text-gray-400 text-center py-4">لا توجد تحصيلات مسجلة بتاريخ اليوم حتى الآن.</p>` : `
              <div class="space-y-2">
                ${todayStudents.map(s => `
                  <div class="p-3 rounded-xl bg-black/70 border border-yellow-500/20 flex justify-between items-center text-xs">
                    <span><b class="text-yellow-300">${esc(s.stuCode)}</b> — ${esc(s.name)} (Step ${s.level})</span>
                    <span class="text-emerald-400 font-bold">سدد اليوم: ${Number(s.lastPayAmount||0).toLocaleString()} EGP | المتبقي: ${s.remaining.toLocaleString()} EGP</span>
                  </div>
                `).join("")}
              </div>
            `}
          </div>
        </div>
      `;
    };

    window.updateLiveCalcBox = function() {
      const fee = parseFloat(document.getElementById("finFee").value) || 0;
      const paid = parseFloat(document.getElementById("finPaid").value) || 0;
      const rem = Math.max(0, fee - paid);
      document.getElementById("liveDispFee").textContent = fee.toLocaleString() + " EGP";
      document.getElementById("liveDispPaid").textContent = paid.toLocaleString() + " EGP";
      document.getElementById("liveDispRem").textContent = rem.toLocaleString() + " EGP";
    };

    window.openFinEditForStudent = function(stuId) {
      window.finSelectedStuId = stuId;
      window.finSubTab = "manage";
      render();
    };

    window.saveStudentFinanceRecord = function(stuId) {
      if (!isCoach()) return;
      const s = db.users.find(u => u.id === stuId);
      if (!s) return;
      const prevPaid = Number(s.amountPaid) || 0;
      const newFee = Math.max(0, parseFloat(document.getElementById("finFee").value) || 0);
      const newPaid = Math.max(0, parseFloat(document.getElementById("finPaid").value) || 0);

      s.name = document.getElementById("finName").value.trim() || s.name;
      s.parentPhone = document.getElementById("finPhone").value.trim();
      s.level = Number(document.getElementById("finLevel").value) || s.level;
      s.coachName = document.getElementById("finCoach").value.trim() || "Coach Abdelrahman";
      s.courseFee = newFee;
      s.amountPaid = newPaid;
      s.remaining = Math.max(0, newFee - newPaid);

      if (newPaid > prevPaid) {
        const diff = newPaid - prevPaid;
        if (s.lastPayDate === todayISO()) {
          s.lastPayAmount = (Number(s.lastPayAmount) || 0) + diff;
        } else {
          s.lastPayDate = todayISO();
          s.lastPayAmount = diff;
        }
      }
      save();
      window.finSubTab = "analytics";
      render();
      toast(`تم تحديث حساب الطالب (${s.stuCode}) — المتبقي: ${s.remaining} EGP`);
    };

    window.exportFinanceCSV = function() {
      if (!isCoach()) return;
      const students = db.users.filter(u => u.role === "student").map((s, i) => window.ensureStudentFinData(s, i));
      const rows = [["Student ID", "Student Name", "Phone", "Step Level", "Coach", "Total Fee (EGP)", "Amount Paid (EGP)", "Remaining (EGP)", "Last Payment Date"]];
      students.forEach(s => {
        rows.push([s.stuCode, s.name, s.parentPhone || s.phone || "", "Step " + s.level, s.coachName, s.courseFee, s.amountPaid, s.remaining, s.lastPayDate || "—"]);
      });
      const csv = "\ufeff" + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
      dl("ECA-Financial-Dashboard-" + todayISO() + ".csv", csv, "text/csv;charset=utf-8");
      toast("تم تنزيل شيت الحسابات متوافق مع Excel و Google Sheets!");
    };
// ================= 1. ترجمة صفحة الحسابات والداشبورد للإنجليزية (AR / EN) =================
    const FIN_DICT = [
      ["الحسابات والداشبورد", "Finance & ERP"],
      ["لوحة تحليلات وحسابات الأكاديمية (ECA ERP Dashboard)", "ECA Financial & Analytics ERP Dashboard"],
      ["إدارة الاشتراكات، المسدد، المتبقي، إحصائيات اليوم، وتحليل الإيرادات حسب المستوى والمدرب.", "Manage subscriptions, paid & remaining balances, daily collections, and revenue by level & coach."],
      ["⬇ تصدير التقرير المالي (Excel/CSV)", "⬇ Export Financial Report (Excel/CSV)"],
      ["قفل الحسابات", "Lock Finance"],
      ["إجمالي الطلاب (TOTAL STUDENTS)", "TOTAL STUDENTS"],
      ["إجمالي قيمة الاشتراكات (TOTAL FEES)", "TOTAL SUBSCRIPTION FEES"],
      ["إجمالي المسدد (TOTAL PAID)", "TOTAL PAID"],
      ["إجمالي المتبقي (REMAINING)", "TOTAL REMAINING"],
      ["الداشبورد والتحليلات", "Analytics Dashboard"],
      ["تسجيل وبحث وتعديل اشتراك طالب", "Student Billing & Search"],
      ["إحصائيات وتحصيلات اليوم", "Today's Collections"],
      ["توزيع الطلاب والإيرادات حسب المستوى (Step 1 - 6)", "Students & Revenue by Level (Step 1 - 6)"],
      ["إجمالي الاشتراكات والتحصيل حسب المدرب", "Subscriptions & Collection by Coach"],
      ["سجل اشتراكات الطلاب المالي الشامل", "Complete Student Financial Registry"],
      ["ابحث بالكود (ECA-0001) أو الاسم أو الموبايل...", "Search by code (ECA-0001), name, or phone..."],
      ["كود الطالب", "Student ID"],
      ["الاسم", "Name"],
      ["المستوى / الجروب", "Level / Group"],
      ["المدرب", "Coach"],
      ["قيمة الاشتراك", "Course Fee"],
      ["المسدد", "Paid"],
      ["المتبقي:", "Remaining:"],
      ["المتبقي", "Remaining"],
      ["إجراءات سريعة", "Quick Actions"],
      ["تحصيل / تعديل", "Collect / Edit"],
      ["تذكير واتساب", "WhatsApp Reminder"],
      ["استمارة تسجيل وتحديث رسوم الطالب", "Student Fee Registration & Update Form"],
      ["طالب جديد بالكامل", "Add New Student"],
      ["اختر الطالب أو ابحث بكوده (ECA):", "Select Student or Search by ID (ECA):"],
      ["اسم الطالب", "Student Name"],
      ["رقم هاتف ولي الأمر (واتساب)", "Parent Phone (WhatsApp)"],
      ["المستوى / الدورة التدريبية", "Level / Course"],
      ["اسم المدرب المحاضر", "Assigned Coach"],
      ["قيمة الكورس الإجمالية (EGP)", "Total Course Fee (EGP)"],
      ["إجمالي المبلغ المسدد (EGP)", "Total Amount Paid (EGP)"],
      ["قيمة الكورس", "Course Fee"],
      ["المبلغ المسدد", "Amount Paid"],
      ["المبلغ المتبقي", "Remaining Balance"],
      ["حفظ البيانات المالية وتحديث الداشبورد", "Save Financial Record & Update Dashboard"],
      ["عمليات تحصيل اليوم", "Today's Transactions"],
      ["إجمالي المحصل اليوم", "Total Collected Today"],
      ["متبقيات طلاب اليوم", "Today's Students Remaining"],
      ["تاريخ اليوم", "Today's Date"],
      ["قائمة الطلاب المسددين اليوم", "Students Who Paid Today"],
      ["لا توجد تحصيلات مسجلة بتاريخ اليوم حتى الآن.", "No collections recorded for today yet."],
      ["سدد اليوم:", "Paid today:"],
      ["طلاب)", "students)"],
      ["مسدد:", "Paid:"],
      ["تحصيل:", "Collected:"],
      ["قسم الإدارة المالية (للمديرين فقط)", "Financial Management (Admins Only)"],
      ["هذا القسم خاص بإدارة الأكاديمية. يرجى إدخال الباسورد الإداري للمتابعة:", "This section is restricted to Academy Management. Enter Admin Password:"],
      ["أدخل باسورد الإدارة...", "Enter Admin Password..."],
      ["فتح لوحة الحسابات", "Unlock Finance Dashboard"],
      ["تم فتح لوحة الحسابات الإدارية", "Admin Finance Dashboard Unlocked"],
      ["تم قفل لوحة الحسابات", "Finance Dashboard Locked"],
      ["باسورد الإدارة غير صحيح", "Incorrect Admin Password"]
    ];
    FIN_DICT.forEach(pair => {
      if (!DICT.some(d => d[0] === pair[0])) DICT.push(pair);
    });
    [
      ["سجّل دخولك بحسابك، أو ادخل كود المتابعة لو انت ولي أمر:", "Log in with your account, or enter the follow-up code if you are a parent:"],
      ["الدخول بحساب شخصي لكل مستخدم — مفيش كلمات سر مشتركة", "Every user has a personal account — no shared passwords"],
      ["ادخل كود المتابعة لمعرفة تقدّم ابنك", "Enter the follow-up code to see your child's progress"],
      ["اكتب كود المتابعة اللي استلمته من الأكاديمية", "Enter the follow-up code you received from the academy"],
      ["اكتب كود المتابعة لعرض تقدّم الطالب.", "Enter the follow-up code to view the student's progress."],
      ["كود ولي الأمر", "Parent code"], ["عرض", "View"],
      ["ملاحظة المدرب لولي الأمر:", "Coach's note for the parent:"],
      ["الكود غير صحيح أو انتهت صلاحيته", "Invalid or expired code"],
      ["اسم المستخدم أو كلمة السر غير صحيحة", "Wrong username or password"],
      ["تم إنشاء حسابك!", "Your account has been created!"],
      ["كلمة السر لازم تكون 6 حروف على الأقل", "Password must be at least 6 characters"],
      ["تم تغيير كلمة السر", "Password changed"],
      ["جاري التحميل...", "Loading..."],
      ["القسم المالي (للإدارة فقط)", "Financial Management (Admins Only)"],
      ["دخول بضغطة واحدة بحساب Google", "One-tap login with Google"],
      ["أول مرة بتختار طالب أو كوتش، وبعد كده بتدخل بضغطة واحدة من غير باسورد.", "Pick student or coach the first time, then log in with one tap — no password."],
      ["دخول الطالب بجوجل", "Student — Google"],
      ["دخول الكوتش بجوجل", "Coach — Google"],
      ["أو باليوزر نيم / الإيميل", "or with username / email"],
      ["أهلاً بيك في ECA", "Welcome to ECA"],
      ["اختار نوع حسابك مرة واحدة بس — بعد كده الدخول بضغطة واحدة.", "Choose your account type once — after that it's one-tap login."],
      ["دخلت بحساب", "Signed in as"],
      ["طالب", "Student"],
      ["كوتش", "Coach"],
      ["الاسم بالكامل", "Full name"],
      ["كود دعوة الكوتش (من الأدمن)", "Coach invite code (from admin)"],
      ["الكود بيستخدم مرة واحدة، وبيطلعه الأدمن من زر «كود دعوة كوتش جديد».", "The code is single-use; the admin generates it with \"New coach invite code\"."],
      ["دخول المنصة", "Enter platform"],
      ["تم ربط حسابك بجوجل — المرة الجاية ادخل بضغطة واحدة", "Google linked — next time log in with one tap"],
      ["حسابك بيدخل بجوجل — مفيش كلمة سر تتغير", "Your account uses Google — no password to change"],
      ["تعذّر الدخول بجوجل", "Google sign-in failed"],
      ["الدومين ده مش مضاف في Firebase (Authorized domains)", "This domain isn't in Firebase Authorized domains"],
      ["الدخول بجوجل مش متفعّل في Firebase Authentication", "Google sign-in isn't enabled in Firebase Authentication"],
      ["حساب جوجل ده مربوط بحساب تاني على المنصة", "This Google account is linked to another platform account"],
      ["كود الدعوة غير صحيح أو مستخدم قبل كده", "Invite code is invalid or already used"],
      ["اكتب الاسم", "Enter your name"],
      ["تعذّر إنشاء الحساب", "Could not create the account"],
      ["تم إنشاء حساب الكوتش!", "Coach account created!"]
    ].forEach(p => { if (!DICT.some(d => d[0] === p[0])) DICT.push(p); });
    DICT.sort((a, b) => b[0].length - a[0].length);

    // ================= 2. حماية قسم الحسابات بباسورد خاص للمديرين فقط =================
    // الصلاحية بتتحدد من Firebase: staff/{uid}.role == "admin" — مفيش كلمة سر في الكود
    window.isFinanceAdminUnlocked = false;
    window.unlockFinanceAdmin = function (ev) { if (ev) ev.preventDefault(); };
    window.lockFinanceAdmin = function () {};
    window.renderFinanceLockScreen = function () {
      return `
        <div class="max-w-md mx-auto mt-10 gold-card rounded-2xl p-6 text-center space-y-4 border-2 border-yellow-500/40">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-black border-2 border-yellow-500 flex items-center justify-center text-yellow-300 shadow-lg">${ICON("lock", "w-7 h-7")}</div>
          <h2 class="font-display font-bold text-xl gold-gradient-text">القسم المالي (للإدارة فقط)</h2>
          <p class="text-xs text-gray-400">الحساب ده مش عنده صلاحية الأدمن. الصلاحية بتتفعّل من لوحة Firebase.</p>
        </div>
      `;
    };

    // إضافة زر "قفل الحسابات" داخل الداشبورد بعد فتحها
    const _origRenderFinanceDashboardView = window.renderFinanceDashboardView;
    window.renderFinanceDashboardView = function() {
      if (!window.isFinanceAdminUnlocked) {
        return window.renderFinanceLockScreen();
      }
      const html = _origRenderFinanceDashboardView();
      return html.replace(
        `<button onclick="exportFinanceCSV()" class="px-4 py-2 rounded-xl text-xs gold-btn">⬇ تصدير التقرير المالي (Excel/CSV)</button>`,
        `<div class="flex gap-2"><button onclick="exportFinanceCSV()" class="px-4 py-2 rounded-xl text-xs gold-btn">⬇ تصدير التقرير المالي (Excel/CSV)</button></div>`
      );
    };

    // ربط تلقائي بـ _render مع ضمان تشغيل applyLang() لترجمة صفحة الحسابات فوراً
    {
      const _prevRender = window._render || _render;
      window._render = _render = function() {
        _prevRender();
        const u = currUser();
        if (u && u.role === "coach" && tab === "finance") {
          document.getElementById("mainView").innerHTML = window.renderFinanceDashboardView();
          applyLang();
        }
      };
    }
    // تشغيل المنصة فوراً بعد تحميل كل الإضافات
    setTimeout(() => { if (typeof render === "function") render(); }, 100);
