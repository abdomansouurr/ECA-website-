// ECA — firebase.js (اتفصل من index.html في eca-v3)
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
    import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, linkWithPopup, deleteUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
    import { initializeFirestore, writeBatch, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, getDocFromServer, getDocs, getDocsFromServer, setDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot, serverTimestamp, orderBy, limit, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
    function normalizeStudentPhone(value) {
      const raw = String(value || "").trim();
      if (!/^[0-9\u0660-\u0669+() -]+$/.test(raw)) return "";
      let digits = raw.replace(/[\u0660-\u0669]/g, c => String(c.charCodeAt(0) - 0x660)).replace(/\D/g, "");
      if (digits.startsWith("0020")) digits = "0" + digits.slice(4);
      else if (digits.startsWith("20") && digits.length === 12) digits = "0" + digits.slice(2);
      return /^\d{8,15}$/.test(digits) ? digits : "";
    }
    const isStaffRole = r => r === "coach" || r === "admin";

    // ===================== الحالة =====================
    let me = null;                       // { uid, role: coach|admin|student|parent, name, username, email }
    let unsubs = [];
    let maps = { core: {}, priv: {}, fin: {}, att: {} };
    let deletedStudentIds = new Set();
    window.__deletedStudentIds = deletedStudentIds;
    let synced = {};                     // مفتاح -> آخر JSON اتكتب/اتقرا (عشان نكتب اللي اتغير بس)
    let loaded = { core: false, att: false, groups: false };
    let applyingRemote = false, signingUp = false;
    let dailyNotificationTimer = null, dailyNotificationAttemptDate = "";
    let remoteRenderQueued = false;

    function scheduleRemoteRender() {
      if (remoteRenderQueued) return;
      remoteRenderQueued = true;
      const flush = () => { remoteRenderQueued = false; render(); };
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(flush);
      else setTimeout(flush, 0);
    }

    // ===================== مدير الاستماع اللحظي =====================
    // كل onSnapshot بيتسجل هنا باسمه. أي تغيير في الدخول بيقفلهم كلهم مرة واحدة (مفيش استماع قديم بيفضل شغال
    // ويصرف قراءات)، والشاشات بتقفل اللي بتاعها لما الطالب يسيبها. ecaListeners() بيعرض المفتوح دلوقتي.
    const liveListeners = new Map();
    let liveSeq = 0;
    function listen(name, ...args) {
      const id = ++liveSeq, stop = onSnapshot(...args);
      liveListeners.set(id, { name, since: Date.now(), stop });
      return () => { const l = liveListeners.get(id); if (!l) return; liveListeners.delete(id); try { l.stop(); } catch (_) {} };
    }
    function stopAllListeners() { for (const [id, l] of [...liveListeners]) { liveListeners.delete(id); try { l.stop(); } catch (_) {} } }
    window.ecaListeners = () => [...liveListeners.values()].map(l => ({ name: l.name, seconds: Math.round((Date.now() - l.since) / 1000) }));

    function resetState() {
      unsubs.forEach(u => { try { u(); } catch (_) {} }); unsubs = [];
      stopAllListeners();
      clearInterval(dailyNotificationTimer); dailyNotificationTimer = null; dailyNotificationAttemptDate = "";
      loginRewardDay = ""; loginRewardTries = 0; freezeCheckDay = "";
      window.ecaNotifications = [];
      maps = { core: {}, priv: {}, fin: {}, att: {} }; synced = {};
      deletedStudentIds = new Set();
      window.__deletedStudentIds = deletedStudentIds;
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
      return { core: cleanDeep(plain(core)), priv: plain(priv), fin: plain(fin) };
    }
    // الطالب بيبعت اللي اتغير بس، عشان حقول الكوتش ماتتبعتش بعد تنضيفها فالقواعد ترفض الحفظ كله.
    // الاسم والإيميل والنيك نيم بيتبعتوا دايمًا لأن القواعد بتشيّك عليهم، وده بينضّف أي قيمة قديمة فيها حروف ممنوعة.
    function corePatch(prevJson, core) {
      let prev;
      try { prev = JSON.parse(prevJson); } catch (_) { return core; }
      if (!prev || typeof prev !== "object") return core;
      const patch = {};
      for (const k of Object.keys(core)) if (JSON.stringify(core[k]) !== JSON.stringify(prev[k])) patch[k] = core[k];
      if (!Object.keys(patch).length) return patch;
      for (const k of ["name", "email", "nickname"]) if (k in core) patch[k] = core[k];
      return patch;
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
          if (pend.has(id) || deletedStudentIds.has(id)) return;
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
      scheduleRemoteRender();
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
        const present = new Set([...(window.__pendingDel || []), ...deletedStudentIds]);   // المحذوفون منطقيًا يفضلوا محفوظين
        for (const u of db.users) {
          if (u.role !== "student") continue;
          if (!staff && u.id !== me.uid) continue;
          present.add(u.id);
          const p = split(u);
          if (!staff && !loaded.core) continue;
          const prevCore = synced["c:" + u.id];
          push("c:" + u.id, JSON.stringify(p.core), async () => {
            if (staff) return setDoc(doc(firestore, "users", u.id), p.core);
            const patch = corePatch(prevCore, p.core);
            if (Object.keys(patch).length) await updateDoc(doc(firestore, "users", u.id), patch);
          });
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
    // كل كتابة في ملف الطالب من المحاولات والجوايز بتمشي واحدة ورا التانية. لو مفيش حاجة شغّالة بتبدأ على طول (نفس اللحظة)
    let writeChain = Promise.resolve(), writeBusy = 0;
    window.fbSerial = fn => {
      const start = () => { try { return Promise.resolve(fn()); } catch (e) { return Promise.reject(e); } };
      const p = writeBusy ? writeChain.then(start) : start();
      writeBusy++;
      writeChain = p.catch(() => {}).then(() => { writeBusy--; });
      return p;
    };
    window.fbCommitAttempt = async (id, att) => {
      if (!me || me.role !== "student") return { ok: false };
      const u = db.users.find(x => x.id === me.uid); if (!u) return { ok: false };
      const p = split(u), key = "c:" + me.uid, prev = synced[key];
      synced[key] = JSON.stringify(p.core);                 // عشان المزامنة العادية ماتبعتش نفس التغيير تاني
      try {
        const b = writeBatch(firestore);
        b.set(doc(firestore, "attempts", id), Object.assign({ uid: me.uid, at: serverTimestamp() }, att));
        b.update(doc(firestore, "users", me.uid), corePatch(prev, p.core));
        await b.commit();
        return { ok: true };
      } catch (e) {
        synced[key] = prev;
        console.warn("Attempt rejected:", id, e && e.code);
        await resyncSelf();
        return { ok: false, code: e && e.code };
      }
    };
    window.fbHasEconomyReceipt = async id => {
      if (!me || me.role !== "student" || !/^[A-Za-z0-9-]{1,100}$/.test(String(id || ""))) throw new Error("Economy receipt lookup is unavailable");
      const snap = await getDoc(doc(firestore, "users", me.uid, "economy", id));
      return snap.exists();
    };
    // القواعد بتفحص الاسم والإيميل واللقب مع كل كتابة، فأي قيمة قديمة فيها حروف ممنوعة بترفض المكافأة، فبننضفها في نفس العملية
    // جائزة الدخول بتتحدد من التاريخ، وقواعد Firestore بتحسبها بنفس الطريقة، فمحدش يقدر يختار جائزة أكبر
    function loginRewardStars(day) {
      const d = Number(String(day).slice(8));
      return d % 7 === 0 ? 3 : d % 3 === 0 ? 2 : 1;
    }
    function selfFieldsFix(profile) {
      const fix = {};
      for (const [k, max] of [["name", 80], ["email", 120], ["nickname", 24]]) {
        if (typeof profile[k] !== "string") continue;
        let clean = profile[k].replace(BAD, "").slice(0, max);
        if (k === "nickname" && clean.length < 2) clean = "";
        if (clean !== profile[k]) fix[k] = clean;
      }
      return fix;
    }
    // السجل ده بيوضح سبب الرفض في «سجل الأخطاء» عند الأدمن: أنواع وأسماء حقول بس، من غير أي بيانات شخصية
    function reportEconomyDenied(err, source, day, profile) {
      if (!err || err.code !== "permission-denied") return;
      const p = profile || {}, a = p.arena || {}, s = p.shop || {};
      const shape = { source, day, now: new Date().toISOString(), loaded: !!profile, shopKeys: Object.keys(s), hints: typeof s.hints, stars: typeof a.stars, xp: typeof a.xp, level: typeof p.level, name: typeof p.name, email: typeof p.email };
      (window.__ecaErr = window.__ecaErr || []).push({ msg: "economy denied " + JSON.stringify(shape), src: "fbEconomy", line: 0 });
    }
    // لوحة الصدارة: صف الطالب بيتنشر لوحده لما ملفه يتغير (الاسم المستعار بس، من غير الاسم الحقيقي)
    let boardLast = null, boardLastUid = "", boardTimer = null, boardRetried = false;
    async function boardPublish() {
      if (!me || me.role !== "student" || !maps.core[me.uid] || !window.ecaWeekKey) return;
      const uid = me.uid, p = maps.core[uid], shop = p.shop || {}, wk = window.ecaWeekKey();
      const row = { n: p.nickname || "", a: (shop.eq || {}).a || "", t: shop.activeTitle || "", g: p.group || "", xp: Math.max(0, (Number((p.arena || {}).xp) || 0) - (Number((p.arena || {}).chx) || 0)), wk, wx: 0 };
      const ref = doc(firestore, "leaderboard", uid);
      try {
        if (boardLastUid !== uid) { boardLast = null; boardLastUid = uid; }
        if (!boardLast) { const snap = await getDoc(ref); boardLast = snap.exists() ? snap.data() : null; }
        const old = boardLast;
        if (old) {
          const gain = Math.max(0, row.xp - (Number(old.xp) || 0));
          row.wx = old.wk === wk ? (Number(old.wx) || 0) + gain : gain;
          if (["n", "a", "t", "g", "xp", "wk", "wx"].every(k => old[k] === row[k])) return;
        }
        await setDoc(ref, row);
        boardLast = row; boardRetried = false;
      } catch (e) {
        boardLast = null;
        // ممكن تكون الخبرة زادت على السيرفر قبل ما توصل هنا: نحاول تاني مرة واحدة ببيانات أحدث
        if (e && e.code === "permission-denied" && !boardRetried) { boardRetried = true; boardPublishSoon(); return; }
        console.warn("Leaderboard update failed:", e && e.code);
      }
    }
    function boardPublishSoon() { clearTimeout(boardTimer); boardTimer = setTimeout(boardPublish, 4000); }
    window.fbBoardWatch = (onRows, onError) => listen("leaderboard", query(collection(firestore, "leaderboard"), orderBy("xp", "desc"), limit(500)),
      snap => onRows(snap.docs.map(d => Object.assign(cleanDeep(d.data()), { id: d.id }))),
      err => { console.warn("Leaderboard read failed:", err && err.code); onError(); });
    async function spinHexOf(uid, day) {
      const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(uid + "|" + day));
      return (new Uint8Array(bytes)[0] >> 4).toString(16);
    }
    // إطارات النخبة: أول 3 في ترتيب الأسبوع
    window.fbEliteTop = async () => {
      const snap = await getDocs(query(collection(firestore, "leaderboard"), orderBy("wx", "desc"), limit(30)));
      return snap.docs.map(d => ({ id: d.id, wk: d.data().wk, wx: Number(d.data().wx) || 0 }));
    };
    // التشجيع بالإيموجي: الكتابة في صندوق الطالب التاني ومعاها توقيت آخر تشجيع (للحد كل 10 ثواني)
    window.fbSendEmote = async (to, e) => {
      if (!me || me.role !== "student" || !/^[A-Za-z0-9_-]{1,128}$/.test(String(to))) throw new Error("not-allowed");
      const batch = writeBatch(firestore);
      batch.set(doc(firestore, "emoteRate", me.uid), { at: serverTimestamp() });
      batch.set(doc(collection(firestore, "users", to, "emotes")), { from: me.uid, n: (maps.core[me.uid] || {}).nickname || "", e, at: serverTimestamp() });
      await batch.commit();
    };
    window.fbEmoteWatch = onItems => {
      if (!me) return () => {};
      return listen("emotes", query(collection(firestore, "users", me.uid, "emotes"), orderBy("at", "desc"), limit(10)), snap => {
        const items = snap.docs.filter(d => !d.metadata.hasPendingWrites).map(d => ({ id: d.id, from: d.data().from, n: cleanDeep(d.data().n || ""), e: d.data().e }));
        if (items.length) onItems(items);
      }, err => console.warn("Emotes failed:", err && err.code));
    };
    window.fbEmoteDelete = id => deleteDoc(doc(firestore, "users", me.uid, "emotes", id));

    // تحدي الأصحاب بالرابط
    const fdView = (id, r) => ({ id, a: r.a, an: cleanDeep(r.an || ""), b: r.b || "", bn: cleanDeep(r.bn || ""), step: r.step, puzzles: Array.isArray(r.puzzles) ? r.puzzles : [], status: r.status, ra: r.ra || null, rb: r.rb || null, winner: r.winner === undefined ? null : r.winner });
    window.fbFriendCreate = async (step, puzzles) => {
      const ref = doc(collection(firestore, "friendDuels"));
      await setDoc(ref, { a: me.uid, an: (maps.core[me.uid] || {}).nickname || "", step, puzzles, status: "open", created: serverTimestamp() });
      return ref.id;
    };
    window.fbFriendWatch = (id, onDoc) => listen("friendDuel", doc(firestore, "friendDuels", id), snap => onDoc(snap.exists() ? fdView(snap.id, snap.data()) : null), err => { if (auth.currentUser) console.warn("Friend duel watch failed:", err && err.code); });
    window.fbFriendJoin = id => runTransaction(firestore, async tx => {
      const ref = doc(firestore, "friendDuels", id), snap = await tx.get(ref);
      if (!snap.exists() || snap.data().status !== "open" || snap.data().a === me.uid) return false;
      tx.update(ref, { status: "live", b: me.uid, bn: (maps.core[me.uid] || {}).nickname || "", started: serverTimestamp() });
      return true;
    });
    // نتيجة لغز واحد. لو اللاعبين الاتنين خلّصوا، نفس الكتابة بتعلن الفايز
    window.fbFriendProgress = (id, solved, ms) => runTransaction(firestore, async tx => {
      const ref = doc(firestore, "friendDuels", id), snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("missing");
      const d = snap.data(), side = d.a === me.uid ? "ra" : d.b === me.uid ? "rb" : "", other = side === "ra" ? "rb" : "ra";
      if (!side) throw new Error("not-player");
      const o = d[side] || {}, n = (Number(o.n) || 0) + 1;
      if (n > 5) return o;
      const res = { n, solved: (Number(o.solved) || 0) + (solved ? 1 : 0), ms: (Number(o.ms) || 0) + Math.max(2000, Math.round(ms)), done: n === 5 };
      const patch = { [side]: res }, them = d[other];
      if (res.done && them && them.done && d.status === "live") {
        const A = side === "ra" ? res : them, B = side === "ra" ? them : res;
        patch.status = "done"; patch.ended = serverTimestamp();
        patch.winner = A.solved > B.solved || (A.solved === B.solved && A.ms < B.ms) ? d.a : (A.solved === B.solved && A.ms === B.ms ? "" : d.b);
      }
      tx.update(ref, patch);
      return res;
    });
    window.fbFriendMine = async () => {
      const [x, y] = await Promise.all([
        getDocs(query(collection(firestore, "friendDuels"), where("a", "==", me.uid), limit(15))),
        getDocs(query(collection(firestore, "friendDuels"), where("b", "==", me.uid), limit(15)))
      ]);
      return [...x.docs, ...y.docs].map(d => Object.assign(fdView(d.id, d.data()), { createdMs: d.data().created && d.data().created.toMillis ? d.data().created.toMillis() : 0 }))
        .sort((p, q) => q.createdMs - p.createdMs).slice(0, 10);
    };

    // تحدي الكوتش الأسبوعي وقاعة المشاهير
    // حل تحدي الأسبوع بيتخزن متشفّر تشفير خفيف (نفس حروف النقلات بس متبدّلة) عشان ما يبانش نص صريح في الـ Network.
    // المسافة في الأول علامة إنه متشفّر، والقديم من غيرها بيتقري زي ما هو. نفس الجدول بتاع scripts/obfuscate-puzzles.js.
    const WK_F = "abcdefgh", WK_R = "12345678", WK_P = "qrbn", WK_f = "fcahdgbe", WK_r = "58371624", WK_p = "bnqr";
    const wkSwap = (s, from, to) => String(s).trim().split(/\s+/).map(m => [...m].map((c, i) => i === 4 ? to[2][from[2].indexOf(c)] : i % 2 ? to[1][from[1].indexOf(c)] : to[0][from[0].indexOf(c)]).join("")).join(" ");
    const wkEnc = s => " " + wkSwap(s, [WK_F, WK_R, WK_P], [WK_f, WK_r, WK_p]);
    const wkDec = s => typeof s === "string" && s.startsWith(" ") ? wkSwap(s, [WK_f, WK_r, WK_p], [WK_F, WK_R, WK_P]) : s;
    window.fbWeeklyWatch = (wk, onChange) => {
      let docData = null, hof = null, att = null, gotDoc = false;
      const emit = () => { if (gotDoc) onChange(docData, hof || [], att); };
      const loadAtt = async () => {
        if (!me || isStaffRole(me.role)) return;
        try { const s = await getDoc(doc(firestore, "coachChallenges", wk, "attempts", me.uid)); att = s.exists() ? { n: Number(s.data().n) || 0, solved: !!s.data().solved } : { n: 0, solved: false }; } catch (_) { att = { n: 0, solved: false }; }
        emit();
      };
      const u1 = listen("weeklyChallenge", doc(firestore, "coachChallenges", wk), snap => {
        gotDoc = true;
        docData = snap.exists() ? { title: cleanDeep(snap.data().title || ""), fen: snap.data().fen, moves: wkDec(snap.data().moves), setup: !!snap.data().setup } : null;
        emit(); loadAtt();
      }, err => { console.warn("Weekly challenge failed:", err && err.code); gotDoc = true; emit(); });
      const u2 = listen("hallOfFame", query(collection(firestore, "coachChallenges", wk, "hallOfFame"), orderBy("ms", "asc"), limit(20)), snap => {
        hof = snap.docs.map(d => ({ uid: d.data().uid, n: cleanDeep(d.data().n || ""), a: d.data().a || "", f: d.data().f || "", ms: Number(d.data().ms) || 0 }));
        emit();
      }, err => console.warn("Hall of Fame failed:", err && err.code));
      window.__wkReloadAtt = loadAtt;
      return () => { u1(); u2(); };
    };
    window.fbWeeklySave = async (wk, data) => {
      if (!me || !isStaffRole(me.role)) throw new Error("not-staff");
      await setDoc(doc(firestore, "coachChallenges", wk), { title: data.title, fen: data.fen, moves: wkEnc(data.moves), setup: !!data.setup, by: me.uid, at: serverTimestamp() });
    };
    window.fbWeeklyAttempt = async wk => {
      const ref = doc(firestore, "coachChallenges", wk, "attempts", me.uid);
      const r = await runTransaction(firestore, async tx => {
        const snap = await tx.get(ref);
        if (snap.exists() && snap.data().solved) return { solved: true };
        const n = snap.exists() ? (Number(snap.data().n) || 0) + 1 : 1;
        if (n > 2) return { over: true };
        if (snap.exists()) tx.update(ref, { n, at: serverTimestamp() }); else tx.set(ref, { n, solved: false, at: serverTimestamp() });
        return { n };
      });
      if (window.__wkReloadAtt) window.__wkReloadAtt();
      return r;
    };
    window.fbWeeklySolved = async (wk, ms) => {
      const p = maps.core[me.uid] || {}, eq = (p.shop || {}).eq || {}, batch = writeBatch(firestore);
      batch.update(doc(firestore, "coachChallenges", wk, "attempts", me.uid), { solved: true });
      batch.set(doc(firestore, "coachChallenges", wk, "hallOfFame", me.uid), { uid: me.uid, n: p.nickname || "", a: eq.a || "", f: eq.f || "", ms: Math.round(ms), at: serverTimestamp() });
      await batch.commit();
      if (window.__wkReloadAtt) window.__wkReloadAtt();
    };

    // خزنة الغلطات (دوجو الانتقام)
    const DOJO_GAPS = [30, 24 * 60, 3 * 24 * 60, 7 * 24 * 60];
    const vaultRef = id => doc(firestore, "users", me.uid, "mistakeVault", id);
    window.fbVaultList = async () => {
      if (!me || me.role !== "student") return [];
      const snap = await getDocs(query(collection(firestore, "users", me.uid, "mistakeVault"), where("resolved", "==", false), limit(200)));
      return snap.docs.map(d => { const r = d.data(); return { id: d.id, motifs: Array.isArray(r.motifs) ? r.motifs : [], step: r.stepLevel, attempts: Number(r.attempts) || 1, rating: Number(r.rating) || 0, failedMs: r.failedAt && r.failedAt.toMillis ? r.failedAt.toMillis() : 0, nextMs: r.nextAt && r.nextAt.toMillis ? r.nextAt.toMillis() : 0 }; });
    };
    // غلطة جديدة أو غلطة تانية في نفس اللغز: المحاولات بتزيد والمراجعة الجاية بتبعد
    window.fbVaultFail = async (id, info) => {
      if (!me || me.role !== "student" || !/^[A-Za-z0-9]{3,20}$/.test(String(id))) return;
      const ref = vaultRef(id), snap = await getDoc(ref);
      if (!snap.exists()) {
        if (!info) return;
        await setDoc(ref, { puzzleId: id, motifs: (info.motifs || []).slice(0, 8), stepLevel: Math.min(6, Math.max(1, Number(info.step) || 1)), failedAt: serverTimestamp(), attempts: 1, resolved: false, nextAt: new Date(Date.now() + DOJO_GAPS[0] * 60000), rating: Math.round(Number(info.rating) || 0) });
        return;
      }
      const attempts = (Number(snap.data().attempts) || 1) + 1;
      const patch = { attempts, failedAt: serverTimestamp(), resolved: false, nextAt: new Date(Date.now() + DOJO_GAPS[Math.min(DOJO_GAPS.length - 1, attempts - 1)] * 60000) };
      if (info && info.motifs && info.motifs.length) patch.motifs = info.motifs.slice(0, 8);
      await updateDoc(ref, patch);
    };
    window.fbVaultResolve = async id => {
      if (!me || me.role !== "student") return;
      await updateDoc(vaultRef(id), { resolved: true });
    };
    // صندوق الكنز: رقم الصندوق محفوظ في ملف الطالب، والجايزة من بصمة الحساب والرقم ده
    const CHEST_ITEMS = { a: "frame-silver", b: "frame-silver", c: "frame-gold", d: "frame-fire", e: "piece-ruby", f: "piece-crystal" };
    window.fbChest = async dropId => {
      if (!me || me.role !== "student") return { ok: false };
      const uid = me.uid, userRef = doc(firestore, "users", uid);
      const fromDrop = typeof dropId === "string" && /^[A-Za-z0-9]{6,40}$/.test(dropId), cost = fromDrop ? 0 : 40;
      const dropRef = fromDrop ? doc(firestore, "liveDrops", uid, "drops", dropId) : null;
      let lastProfile = null;
      const result = await runTransaction(firestore, async tx => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) return { ok: false };
        const profile = userSnap.data(); lastProfile = profile;
        const arena = Object.assign({}, profile.arena || {}), shop = Object.assign({}, profile.shop || {});
        const count = Number(arena.ch) || 0, id = "chest-" + count, receiptRef = doc(firestore, "users", uid, "economy", id);
        if ((await tx.get(receiptRef)).exists()) return { ok: false, code: "stale" };
        let dropNote = "";
        if (fromDrop) { const drop = await tx.get(dropRef); if (!drop.exists() || drop.data().type !== "chest") return { ok: false, code: "drop-gone" }; dropNote = String(drop.data().note || ""); }
        else if ((Number(arena.stars) || 0) < 40) return { ok: false, code: "insufficient-stars" };
        const hex = await spinHexOf(uid, String(count));
        let item = CHEST_ITEMS[hex] || "", xpDelta = 0, duplicate = false;
        const items = Array.isArray(shop.items) ? shop.items : [];
        if (!item) xpDelta = "012345".includes(hex) ? 150 : 300;
        else if (items.includes(item)) { duplicate = true; xpDelta = 300; item = ""; }
        else shop.items = [...items, item];
        arena.stars = (Number(arena.stars) || 0) - cost;
        arena.xp = (Number(arena.xp) || 0) + xpDelta;
        arena.ch = count + 1;
        arena.chx = (Number(arena.chx) || 0) + xpDelta;   // خبرة الصندوق لوحدها، عشان ما تتحسبش في لوحة الصدارة
        const fix = selfFieldsFix(profile);
        const starsDelta = cost ? -cost : 0;
        if (fromDrop) tx.delete(dropRef);
        tx.update(userRef, Object.assign({ arena, shop, lastEconomy: id }, fix));
        tx.set(receiptRef, Object.assign({ uid, kind: "chest", source: fromDrop ? "drop" : "", key: fromDrop ? dropId : "", day: cairoDayKey(), item: "", score: 0, starsDelta, xpDelta, missionBonus: false, at: serverTimestamp() }, fromDrop ? { note: dropNote } : {}));
        return { ok: true, item, xpDelta, duplicate, starsDelta, profile: Object.assign({}, profile, fix, { arena, shop, lastEconomy: id }) };
      }).catch(err => { reportEconomyDenied(err, "chest", cairoDayKey(), lastProfile); throw err; });
      if (result.ok && result.profile) {
        maps.core[uid] = cleanDeep(result.profile);
        synced["c:" + uid] = JSON.stringify(split(Object.assign({ id: uid }, result.profile)).core);
        rebuild();
      }
      return result;
    };
    // ================= واجب الزعيم =================
    const tsMs = t => (t && t.toMillis ? t.toMillis() : 0);
    const bossView = (id, r) => ({ id, title: cleanDeep(r.title || ""), group: cleanDeep(r.group || ""), step: Number(r.step) || 1, motif: String(r.motif || "").replace(/[^A-Za-z0-9]/g, ""),
      puzzles: Array.isArray(r.puzzles) ? r.puzzles.map(x => String(x).replace(/[^A-Za-z0-9]/g, "")).filter(Boolean) : [], dueMs: tsMs(r.due), atMs: tsMs(r.at) });
    window.fbBossCreate = async data => {
      if (!me || !isStaffRole(me.role)) throw new Error("not-staff");
      const ref = doc(collection(firestore, "assignments"));
      await setDoc(ref, { title: data.title, group: data.group, step: data.step, motif: data.motif, puzzles: data.puzzles, due: data.due, by: me.uid, at: serverTimestamp() });
      return ref.id;
    };
    window.fbBossDelete = id => deleteDoc(doc(firestore, "assignments", id));
    window.fbBossWatchAll = (onRows, onError) => listen("assignments", query(collection(firestore, "assignments"), orderBy("at", "desc"), limit(30)),
      snap => onRows(snap.docs.map(d => bossView(d.id, d.data()))),
      err => { if (auth.currentUser) console.warn("Assignments failed:", err && err.code); if (onError) onError(); });
    window.fbBossProgressWatch = (aid, onRows) => listen("assignmentProgress", collection(firestore, "assignments", aid, "progress"),
      snap => onRows(snap.docs.map(d => ({ uid: d.id, solved: Array.isArray(d.data().solved) ? d.data().solved.length : 0, done: d.data().done === true, atMs: tsMs(d.data().at) }))),
      err => { if (auth.currentUser) console.warn("Assignment progress failed:", err && err.code); });
    // الطالب: واجبات مجموعته، ومع كل واجب الألغاز اللي حلها
    window.fbBossMine = (group, onRows) => {
      if (!me || me.role !== "student" || !group) return () => {};
      let alive = true;
      const unsub = listen("bossHomework", query(collection(firestore, "assignments"), where("group", "==", group), limit(20)), async snap => {
        const rows = await Promise.all(snap.docs.map(async d => {
          const row = bossView(d.id, d.data());
          try {
            const p = await getDoc(doc(firestore, "assignments", d.id, "progress", me.uid));
            row.solved = p.exists() && Array.isArray(p.data().solved) ? p.data().solved.map(String) : [];
            row.done = p.exists() && p.data().done === true;
          } catch (_) { row.solved = []; row.done = false; }
          return row;
        }));
        if (alive) onRows(rows);
      }, async err => {
        if (!auth.currentUser) return;
        // الكوتش نقل الطالب لمجموعة تانية: السيرفر بيقفل الاستماع القديم، والصفحة بتفتح واحد جديد على المجموعة الجديدة
        if (err && err.code === "permission-denied") {
          try { const p = await getDocFromServer(doc(firestore, "users", me.uid)); if (p.exists() && String(p.data().group || "") !== group) return; } catch (_) {}
        }
        console.warn("Boss homework failed:", err && err.code);
      });
      return () => { alive = false; unsub(); };
    };
    // ضربة في الزعيم = لغز واحد من الواجب اتحل
    window.fbBossHit = (aid, pid) => runTransaction(firestore, async tx => {
      const ref = doc(firestore, "assignments", aid, "progress", me.uid);
      const [aSnap, pSnap] = await Promise.all([tx.get(doc(firestore, "assignments", aid)), tx.get(ref)]);
      if (!aSnap.exists()) throw new Error("missing");
      const all = Array.isArray(aSnap.data().puzzles) ? aSnap.data().puzzles : [], old = pSnap.exists() && Array.isArray(pSnap.data().solved) ? pSnap.data().solved : [];
      if (!all.includes(pid) || old.includes(pid)) return { solved: old, done: old.length === all.length };
      const solved = [...old, pid], done = solved.length === all.length;
      tx.set(ref, { solved, done, at: serverTimestamp() });
      return { solved, done };
    });

    // ================= فحص النظام (قراية بس من السيرفر، عشان القواعد تتفحص فعلاً ومش الكاش) =================
    window.fbDiagRead = async (path, opts = {}) => {
      if (!me) return { ok: false, code: "signed-out" };
      const parts = String(path).split("/").filter(Boolean);
      if (!parts.length || parts.some(p => !/^[A-Za-z0-9_-]{1,128}$/.test(p))) return { ok: false, code: "bad-path" };
      try {
        if (parts.length % 2 === 0) {
          const s = await getDocFromServer(doc(firestore, ...parts));
          return { ok: true, exists: s.exists(), data: opts.data && s.exists() ? cleanDeep(s.data()) : undefined };
        }
        const c = collection(firestore, ...parts), n = Math.min(20, opts.limit || 1);
        const s = await getDocsFromServer(opts.where ? query(c, where(opts.where[0], "==", opts.where[1]), limit(n)) : query(c, limit(n)));
        return { ok: true, n: s.size, ids: s.docs.map(d => d.id) };
      } catch (e) { return { ok: false, code: e && e.code }; }
    };

    // ================= تقرير ولي الأمر =================
    // خزنة الغلطات، وجوايز الكوتش في الحصة، وواجبات الزعيم: للطالب نفسه أو للكوتش
    window.fbReportData = async (sid, group) => {
      if (!me || !(me.uid === sid || isStaffRole(me.role)) || !/^[A-Za-z0-9_-]{1,128}$/.test(String(sid))) return null;
      const out = { vault: null, drops: null, bosses: null };
      await Promise.all([
        getDocs(query(collection(firestore, "users", sid, "mistakeVault"), limit(400))).then(snap => {
          const rows = snap.docs.map(d => d.data());
          out.vault = { total: rows.length, resolved: rows.filter(r => r.resolved === true).length, retried: rows.filter(r => (Number(r.attempts) || 1) > 1).length };
        }).catch(e => console.warn("Report vault failed:", e && e.code)),
        getDocs(query(collection(firestore, "users", sid, "economy"), where("source", "==", "drop"), limit(60))).then(snap => {
          out.drops = snap.docs.map(d => { const r = d.data(); return { kind: r.kind, stars: Number(r.starsDelta) || 0, xp: Number(r.xpDelta) || 0, note: cleanDeep(String(r.note || "")), atMs: tsMs(r.at) }; })
            .sort((x, y) => y.atMs - x.atMs);
        }).catch(e => console.warn("Report drops failed:", e && e.code)),
        (group ? getDocs(query(collection(firestore, "assignments"), where("group", "==", group), limit(20))).then(async snap => {
          out.bosses = await Promise.all(snap.docs.map(async d => {
            const row = bossView(d.id, d.data());
            try { const p = await getDoc(doc(firestore, "assignments", d.id, "progress", sid)); row.solved = p.exists() && Array.isArray(p.data().solved) ? p.data().solved.length : 0; row.done = p.exists() && p.data().done === true; }
            catch (_) { row.solved = 0; row.done = false; }
            return row;
          }));
          out.bosses.sort((x, y) => y.atMs - x.atMs);
        }) : Promise.resolve(out.bosses = [])).catch(e => console.warn("Report homework failed:", e && e.code))
      ]);
      return out;
    };

    // ================= جوائز الحصة المباشرة =================
    window.fbDropSend = async (uids, drop) => {
      if (!me || !isStaffRole(me.role)) throw new Error("not-staff");
      const list = uids.filter(x => /^[A-Za-z0-9_-]{1,128}$/.test(String(x)));
      // القواعد بتقرا ملف كل طالب ووثيقة الحذف بتاعته، وحد الـ batch عشرين قراية
      for (let i = 0; i < list.length; i += 8) {
        const batch = writeBatch(firestore);
        list.slice(i, i + 8).forEach(uid => batch.set(doc(collection(firestore, "liveDrops", uid, "drops")), { type: drop.type, amount: drop.amount, note: drop.note, by: me.uid, at: serverTimestamp() }));
        await batch.commit();
      }
      return list.length;
    };
    window.fbDropWatch = onItems => {
      if (!me || me.role !== "student") return () => {};
      return listen("liveDrops", collection(firestore, "liveDrops", me.uid, "drops"), snap => {
        const items = snap.docs.filter(d => !d.metadata.hasPendingWrites)
          .map(d => ({ id: d.id, type: d.data().type, amount: Number(d.data().amount) || 0, note: cleanDeep(d.data().note || ""), atMs: tsMs(d.data().at) }));
        if (items.length) onItems(items.sort((x, y) => x.atMs - y.atMs));
      }, err => { if (auth.currentUser) console.warn("Live drops failed:", err && err.code); });
    };

    // بطولة السرعة
    const msOf = t => (t && t.toMillis ? t.toMillis() : 0);
    window.fbArenaWatchOpen = (onRows, onError) => listen("speedArenas", query(collection(firestore, "speedArenas"), where("closed", "==", false), limit(10)),
      snap => onRows(snap.docs.map(d => ({ id: d.id, startsMs: msOf(d.data().startsAt), endsMs: msOf(d.data().endsAt) }))),
      err => { if (auth.currentUser) console.warn("Speed arena list failed:", err && err.code); onError(); });
    window.fbArenaEnsure = async (id, startsAt, endsAt) => {
      const ref = doc(firestore, "speedArenas", id);
      if ((await getDoc(ref)).exists()) return;
      // طالبين ممكن يسجّلوا نفس الموعد في نفس اللحظة: لو حد سبقنا يبقى تمام
      try { await setDoc(ref, { startsAt, endsAt, closed: false }); }
      catch (e) { if (!(await getDoc(ref)).exists()) throw e; }
    };
    window.fbArenaStartNow = async minutes => {
      if (!me || !isStaffRole(me.role)) throw new Error("not-staff");
      const now = Date.now();
      await setDoc(doc(firestore, "speedArenas", "live-" + now), { startsAt: new Date(now), endsAt: new Date(now + minutes * 60000), closed: false });
    };
    window.fbArenaBoard = (id, size, onRows, onError) => listen("speedArenaBoard", query(collection(firestore, "speedArenas", id, "entries"), orderBy("score", "desc"), limit(size)),
      snap => onRows(snap.docs.map(d => { const r = d.data(); return { id: d.id, n: cleanDeep(r.n || ""), a: r.a || "", score: Number(r.score) || 0, atMs: msOf(r.at) }; })),
      err => { if (auth.currentUser) console.warn("Speed arena board failed:", err && err.code); onError(); });
    // بيرجع للطالب نتيجته لو كان دخل قبل كده في نفس البطولة
    window.fbArenaJoin = async id => {
      const ref = doc(firestore, "speedArenas", id, "entries", me.uid), snap = await getDoc(ref);
      if (snap.exists()) { const r = snap.data(); return { score: Number(r.score) || 0, solved: Number(r.solved) || 0, atMs: msOf(r.at) }; }
      const p = maps.core[me.uid] || {};
      await setDoc(ref, { n: p.nickname || "", a: ((p.shop || {}).eq || {}).a || "", score: 0, solved: 0, at: serverTimestamp() });
      return { score: 0, solved: 0, atMs: Date.now() };
    };
    window.fbArenaSolve = (id, score, solved) => updateDoc(doc(firestore, "speedArenas", id, "entries", me.uid), { score, solved, at: serverTimestamp() });
    window.fbArenaMyWins = async () => {
      if (!me) return [];
      const snap = await getDocs(query(collection(firestore, "speedArenas"), where("rank." + me.uid, ">=", 1), limit(10)));
      return snap.docs.map(d => ({ id: d.id, rank: d.data().rank[me.uid] }));
    };
    // القفل: أول 3 بالنقط، والتعادل للي وصل الأول
    window.fbArenaCloseDue = async () => {
      if (!me || !isStaffRole(me.role)) return;
      const open = await getDocs(query(collection(firestore, "speedArenas"), where("closed", "==", false), limit(10)));
      for (const a of open.docs) {
        if (msOf(a.data().endsAt) > Date.now() - 5000) continue;
        const top = await getDocs(query(collection(firestore, "speedArenas", a.id, "entries"), orderBy("score", "desc"), limit(20)));
        const rows = top.docs.map(d => ({ id: d.id, n: d.data().n || "", a: d.data().a || "", score: Number(d.data().score) || 0, at: msOf(d.data().at) }))
          .filter(r => r.score > 0).sort((x, y) => y.score - x.score || x.at - y.at).slice(0, 3);
        const rank = {};
        rows.forEach((r, i) => { rank[r.id] = i + 1; });
        await updateDoc(a.ref, { closed: true, rank, podium: rows.map(r => ({ uid: r.id, n: r.n, a: r.a, score: r.score })) });
      }
    };
    // التحدي المباشر
    window.fbDuelLobby = (onRows, onError) => listen("duelLobby", query(collection(firestore, "duels"), where("status", "==", "open"), limit(20)),
      snap => onRows(snap.docs.map(d => { const r = d.data(); return { id: d.id, a: r.a, an: cleanDeep(r.an || ""), createdMs: r.created && r.created.toMillis ? r.created.toMillis() : 0 }; })),
      err => { console.warn("Duel lobby failed:", err && err.code); onError(); });
    window.fbDuelWatch = (id, onDoc) => listen("duel", doc(firestore, "duels", id),
      snap => { if (snap.exists()) { const r = snap.data(); onDoc({ id: snap.id, a: r.a, an: r.an, b: r.b, bn: r.bn, fen: r.fen, moves: r.moves, status: r.status, winner: r.winner }); } else onDoc(null); },
      err => console.warn("Duel watch failed:", err && err.code));
    window.fbDuelCreate = async (fen, moves) => {
      if (!me || me.role !== "student") throw new Error("not-student");
      const old = await getDocs(query(collection(firestore, "duels"), where("a", "==", me.uid), limit(10)));
      await Promise.all(old.docs.filter(d => d.data().status !== "live").map(d => deleteDoc(d.ref).catch(() => {})));
      const ref = doc(collection(firestore, "duels"));
      await setDoc(ref, { a: me.uid, an: (maps.core[me.uid] || {}).nickname || "", fen, moves, status: "open", created: serverTimestamp() });
      return ref.id;
    };
    window.fbDuelJoin = id => runTransaction(firestore, async tx => {
      const ref = doc(firestore, "duels", id), snap = await tx.get(ref);
      if (!me || !snap.exists() || snap.data().status !== "open" || snap.data().a === me.uid) return null;
      const bn = (maps.core[me.uid] || {}).nickname || "", r = snap.data();
      tx.update(ref, { status: "live", b: me.uid, bn, started: serverTimestamp() });
      return { id, a: r.a, an: r.an, b: me.uid, bn, fen: r.fen, moves: r.moves, status: "live" };
    });
    // أول واحد يكتب النتيجة هو الفائز. القواعد بترفض حل أسرع من 3 ثواني، فبنستنى ونحاول تاني مرة
    window.fbDuelWin = async id => {
      const attempt = () => runTransaction(firestore, async tx => {
        const ref = doc(firestore, "duels", id), snap = await tx.get(ref);
        if (!me || !snap.exists() || snap.data().status !== "live") return false;
        tx.update(ref, { status: "done", winner: me.uid, ended: serverTimestamp() });
        return true;
      });
      try { return await attempt(); }
      catch (e) {
        if (!e || e.code !== "permission-denied") throw e;
        await new Promise(r => setTimeout(r, 3200));
        return attempt();
      }
    };
    window.fbDuelDelete = id => deleteDoc(doc(firestore, "duels", id)).catch(e => console.warn("Duel delete failed:", e && e.code));
    window.fbEconomy = async request => {
      if (!me || me.role !== "student" || !request || typeof request !== "object") return { ok: false };
      const uid = me.uid, userRef = doc(firestore, "users", uid), op = request.op;
      const dayOk = day => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day);
      const nonce = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      let id = "", source = "", key = "", day = "", item = "", score = 0, starsDelta = 0, xpDelta = 0, spinHex = "";
      if (op === "earn") {
        source = String(request.source || ""); key = String(request.key || ""); day = String(request.day || "");
        if (source === "login" || source === "spin" || source === "golden" || source === "combo") { day = cairoDayKey(); key = day; }
        if (source === "boss" || source === "drop") day = cairoDayKey();
        if (!dayOk(day)) return { ok: false };
        if (source === "lesson" && /^[1-6]-[0-9]{1,2}$/.test(key)) id = "lesson-" + key;
        else if (source === "puzzle" && ["daily","easiest","easier","normal","harder","hardest"].includes(key)) id = "puzzle-" + day + "-" + key;
        else if (source === "bot" && /^(0|[1-7])$/.test(key)) id = "bot-" + day + "-" + key;
        else if (source === "coach" && /^([1-9]|10)$/.test(key)) id = "coach-" + day + "-" + key;
        else if (source === "login") id = "login-" + day;
        else if (source === "rush") { score = Math.floor(Number(request.score) || 0); if (score < 3 || score > 1000) return { ok: false }; id = "rush-" + day; key = day; }
        else if (source === "quest" && ["daily", "puzzles", "win", "lesson", "streak3", "rush6"].includes(key)) id = "quest-" + day + "-" + key;
        else if (source === "golden" || source === "combo") id = source + "-" + day;
        else if (source === "event" && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(key)) id = "event-" + key;
        else if (source === "pawn") id = "pawn-" + day;
        else if (source === "arena" && /^[A-Za-z0-9-]{1,40}$/.test(key) && [1, 2, 3].includes(request.rank)) id = "arena-" + key;
        else if (source === "spin") { id = "spin-" + day; spinHex = await spinHexOf(uid, day); }
        else if (source === "duel" && /^[A-Za-z0-9]{10,40}$/.test(key)) id = "duel-" + day;
        else if (source === "dojo" && /^[A-Za-z0-9]{3,20}$/.test(key)) id = "dojo-" + key;
        else if (source === "fduel" && /^[A-Za-z0-9]{10,40}$/.test(key)) id = "fduel-" + day;
        else if (source === "vision") { score = Math.floor(Number(request.score) || 0); if (score < 3 || score > 1000) return { ok: false }; id = "vision-" + day; }
        else if ((source === "boss" || source === "drop") && /^[A-Za-z0-9]{6,40}$/.test(key)) id = source + "-" + key;
        else return { ok: false };
      } else if (op === "purchase") {
        item = String(request.item || "");
        if (!window.ecaShopCatalog || !window.ecaShopCatalog.some(x => x.id === item)) return { ok: false };
        id = "buy-" + item + "-" + nonce();
        day = cairoDayKey();
      } else if (op === "use-freeze") {
        key = String(request.key || "");
        if (!dayOk(key)) return { ok: false };
        id = "freeze-" + key;
        day = todayISO();
      } else if (op === "spend-hint") {
        id = "hint-use-" + nonce();
        day = cairoDayKey();
      } else return { ok: false };
      const receiptRef = doc(firestore, "users", uid, "economy", id);
      let lastProfile = null;
      const result = await runTransaction(firestore, async tx => {
        const [userSnap, receiptSnap] = await Promise.all([tx.get(userRef), tx.get(receiptRef)]);
        if (!userSnap.exists()) return { ok: false };
        if (receiptSnap.exists()) return { ok: true, duplicate: true };
        lastProfile = userSnap.data();
        const profile = userSnap.data(), arena = Object.assign({}, profile.arena || {}), shop = Object.assign({ titles: [], bots: [], hints: 0, activeTitle: "" }, profile.shop || {});
        const oldStars = Number(arena.stars) || 0;
        let nextShop = Object.assign({}, shop), missionBonus = false, receiptKind = op, dropXp = 0, dropNote = null;
        if (op === "earn") {
          if (source === "lesson" && (!profile.att || profile.att[key] !== true)) return { ok: false, code: "not-attended" };
          if (source === "lesson") starsDelta = 1;
          else if (source === "puzzle") {
            starsDelta = { daily: 1, easiest: 1, easier: 2, normal: 3, harder: 4, hardest: 5 }[key];
            missionBonus = arena.missionDate !== day;
            if (missionBonus) { starsDelta++; arena.missionDate = day; arena.missionDone = true; }
          } else if (source === "bot") starsDelta = Number(key) + 1;
          else if (source === "coach") {
            const level = Number(key), prev = arena.cb && arena.cb.d === day ? Number(arena.cb.k) || 0 : 0;
            if (level <= prev) return { ok: false, code: "coach-not-higher", best: prev };
            starsDelta = level - prev;
            arena.cb = { d: day, k: level };
          }
          else if (source === "login") starsDelta = loginRewardStars(day);
          else if (source === "rush") starsDelta = Math.min(5, Math.floor(score / 3));
          else if (source === "quest") {
            starsDelta = { daily: 1, puzzles: 2, win: 2, lesson: 5, streak3: 2, rush6: 2 }[key];
            const claimed = arena.qc && arena.qc.d === day && Array.isArray(arena.qc.k) ? arena.qc.k : [];
            arena.qc = { d: day, k: [...claimed, key] };
          }
          else if (source === "pawn") starsDelta = 2;
          else if (source === "duel") starsDelta = 3;
          else if (source === "fduel") starsDelta = 3;
          else if (source === "dojo") {
            const vault = await tx.get(doc(firestore, "users", uid, "mistakeVault", key));
            if (!vault.exists() || vault.data().resolved) return { ok: false, code: "dojo-resolved" };
            const failed = vault.data().failedAt;
            if (!failed || !failed.toMillis || Date.now() - failed.toMillis() < 30 * 60000) return { ok: false, code: "dojo-early" };
            const prev = arena.dj && arena.dj.d === day ? Number(arena.dj.n) || 0 : 0;
            if (prev >= 5) return { ok: false, code: "dojo-cap" };
            arena.dj = { d: day, n: prev + 1 };
            starsDelta = 2;
          }
          else if (source === "arena") {
            starsDelta = { 1: 50, 2: 30, 3: 20 }[request.rank];
            arena.tr = [...(Array.isArray(arena.tr) ? arena.tr : []), key + "|" + request.rank];
          }
          else if (source === "spin") {
            arena.sp = day;
            if (spinHex === "f") {
              if ((Number(shop.freezes) || 0) >= 2) starsDelta = 3;
              else nextShop.freezes = (Number(shop.freezes) || 0) + 1;
            } else if (spinHex !== "e") starsDelta = "012345".includes(spinHex) ? 1 : "6789".includes(spinHex) ? 2 : "abc".includes(spinHex) ? 3 : 5;
          }
          else if (source === "vision") starsDelta = Math.min(10, Math.floor(score / 3));
          else if (source === "golden" || source === "combo") starsDelta = 3;
          else if (source === "event") { starsDelta = 8; arena.evc = key; }
          else if (source === "boss") {
            const prog = await tx.get(doc(firestore, "assignments", key, "progress", uid));
            if (!prog.exists() || prog.data().done !== true) return { ok: false, code: "boss-alive" };
            starsDelta = 10;
          }
          else if (source === "drop") {
            // الجايزة بتتمسح مع الإيصال في نفس العملية، فمش ممكن تتصرف مرتين
            const dropRef = doc(firestore, "liveDrops", uid, "drops", key), drop = await tx.get(dropRef);
            if (!drop.exists() || !["stars", "xp"].includes(drop.data().type)) return { ok: false, code: "drop-gone" };
            starsDelta = drop.data().type === "stars" ? Number(drop.data().amount) || 0 : 0;
            dropXp = drop.data().type === "xp" ? Number(drop.data().amount) || 0 : 0;
            dropNote = String(drop.data().note || "");
            tx.delete(dropRef);
          }
          xpDelta = source === "spin" && spinHex === "e" ? 100 : (source === "puzzle" && missionBonus ? starsDelta - 1 : starsDelta) * 20;
          if (source === "drop") xpDelta = dropXp;
        } else if (op === "purchase") {
          const catalogItem = window.ecaShopCatalog.find(x => x.id === item);
          if (!catalogItem) return { ok: false };
          if (catalogItem.type === "title") {
            if ((shop.titles || []).includes(item)) return { ok: false, code: "already-owned" };
            nextShop.titles = [...(shop.titles || []), item];
          } else if (catalogItem.type === "bot") {
            const level = Number(item.slice(4));
            if ((shop.bots || []).includes(level)) return { ok: false, code: "already-owned" };
            nextShop.bots = [...(shop.bots || []), level];
          } else if (catalogItem.type === "hint") nextShop.hints = (Number(shop.hints) || 0) + 1;
          else if (catalogItem.type === "cosmetic") {
            if ((shop.items || []).includes(item)) return { ok: false, code: "already-owned" };
            nextShop.items = [...(shop.items || []), item];
          }
          else if (catalogItem.type === "freeze") {
            if ((Number(shop.freezes) || 0) >= 2) return { ok: false, code: "freeze-limit" };
            nextShop.freezes = (Number(shop.freezes) || 0) + 1;
          }
          else return { ok: false };
          if (oldStars < catalogItem.cost) return { ok: false, code: "insufficient-stars" };
          starsDelta = -catalogItem.cost;
        } else if (op === "use-freeze") {
          if ((Number(shop.freezes) || 0) < 1) return { ok: false, code: "no-freezes" };
          nextShop.freezes = Number(shop.freezes) - 1;
          nextShop.frozen = [...(shop.frozen || []), key];
          receiptKind = "spend-freeze";
        } else {
          if ((Number(shop.hints) || 0) < 1) return { ok: false, code: "no-hints" };
          nextShop.hints = Number(shop.hints) - 1;
          receiptKind = "spend-hint";
        }
        arena.stars = oldStars + starsDelta;
        arena.xp = (Number(arena.xp) || 0) + xpDelta;
        const fix = selfFieldsFix(profile);
        tx.update(userRef, Object.assign({ arena, shop: nextShop, lastEconomy: id }, fix));
        tx.set(receiptRef, Object.assign({
          uid, kind: receiptKind, source, key, day, item, score, starsDelta, xpDelta, missionBonus, at: serverTimestamp()
        }, dropNote === null ? {} : { note: dropNote }));
        return { ok: true, duplicate: false, starsDelta, xpDelta, missionBonus, profile: Object.assign({}, profile, fix, { arena, shop: nextShop, lastEconomy: id }) };
      }).catch(err => { reportEconomyDenied(err, source || op, day, lastProfile); throw err; });
      if (result.ok && !result.duplicate && result.profile) {
        maps.core[uid] = cleanDeep(result.profile);
        synced["c:" + uid] = JSON.stringify(split(Object.assign({ id: uid }, result.profile)).core);
        rebuild();
      }
      return result;
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

    {
      const ecoNow = window.fbEconomy, queued = new Map();
      const offlineErr = e => !navigator.onLine || (e && (e.code === "unavailable" || e.code === "deadline-exceeded"));
      // أول ما النت يرجع Firestore بياخد شوية لحد ما يتصل، فبنعيد كل 5 ثواني (لحد دقيقتين) لحد ما الطابور يفضى
      let flushing = false, tries = 0;
      const flush = async () => {
        if (flushing) return; flushing = true;
        let again = false;
        for (const [k, q] of [...queued]) {
          if (!me || me.uid !== q.uid) { queued.delete(k); continue; }
          try { await ecoOne(q.req); queued.delete(k); }
          catch (e) { if (offlineErr(e)) { again = true; break; } console.warn("Queued reward failed:", e && e.code); queued.delete(k); }
        }
        flushing = false;
        if (again && navigator.onLine && ++tries < 24) setTimeout(flush, 5000); else tries = 0;
      };
      addEventListener("online", () => { tries = 0; setTimeout(flush, 1500); });
      window.ecaPendingRewards = () => queued.size;
      // كل الجوايز بتتسجّل واحدة ورا التانية: لو اتنين اتبعتوا في نفس اللحظة (جايزة اللغز + اللغز الذهبي + الصندوق)
      // التاني كان بيقرا رصيد قديم والقواعد بترفضه
      const ecoOne = request => window.fbSerial(() => ecoNow(request));
      window.fbEconomy = async request => {
        try { return await ecoOne(request); }
        catch (e) {
          if (!me || !request || request.op !== "earn" || !offlineErr(e)) throw e;
          queued.set(me.uid + "|" + JSON.stringify(request), { uid: me.uid, req: request });
          if (window.toast) toast(document.documentElement.lang === "en" ? "No internet: the reward will be saved when you're back online." : "مفيش نت: الجايزة هتتسجّل أول ما النت يرجع.");
          return { ok: false, code: "offline-queued" };
        }
      };
    }

    // ===================== إعلانات الأكاديمية (meta/announcements) =====================
    function cairoDayKey() {
      const parts = new Intl.DateTimeFormat("en", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      const part = type => parts.find(x => x.type === type).value;
      return part("year") + "-" + part("month") + "-" + part("day");
    }
    function notificationData(type, titleAr, titleEn, bodyAr, bodyEn) {
      const safe = value => String(value || "").replace(BAD, "").slice(0, 400);
      return { type, titleAr: safe(titleAr), titleEn: safe(titleEn), bodyAr: safe(bodyAr), bodyEn: safe(bodyEn), createdAt: serverTimestamp(), read: false };
    }
    // حد Firebase: 20 قراءة في قواعد الـ batch الواحد، وكل إشعار بيحتاج لحد 3 (staff + users + deleted)
    const NOTIFY_BATCH = 6;
    async function createAnnouncementNotifications(item) {
      if (!item || !/^[A-Za-z0-9_-]{1,60}$/.test(String(item.id || ""))) return false;
      const text = String(item.text || "").replace(BAD, "").slice(0, 400);
      if (!text) return false;
      const recipients = (db.users || []).filter(u => u.role === "student" && (item.aud === "ALL" || u.group === item.aud));
      for (let offset = 0; offset < recipients.length; offset += NOTIFY_BATCH) {
        const batch = writeBatch(firestore);
        recipients.slice(offset, offset + NOTIFY_BATCH).forEach(u => {
          const ref = doc(firestore, "users", u.id, "notifications", "announcement-" + item.id);
          batch.set(ref, notificationData("announcement", "إعلان جديد من الأكاديمية", "New academy announcement", text, text));
        });
        await batch.commit();
      }
      return true;
    }
    // جائزة الدخول: مرة في اليوم بتوقيت القاهرة، والإيصال login-{اليوم} هو اللي بيمنع التكرار حتى من أكتر من جهاز
    let loginRewardDay = "", loginRewardTries = 0, loginRewardBusy = false;
    window.ecaCairoDay = () => cairoDayKey();
    async function checkDailyLoginReward() {
      if (!me || me.role !== "student" || loginRewardBusy || !navigator.onLine) return;
      const day = cairoDayKey();
      if (loginRewardDay === day) return;
      loginRewardBusy = true;
      const uid = me.uid;
      try {
        const result = await window.fbEconomy({ op: "earn", source: "login" });
        if (!me || me.uid !== uid) return;
        if (result && result.ok) {
          loginRewardDay = day; loginRewardTries = 0;
          if (!result.duplicate && window.ecaShowLoginReward) window.ecaShowLoginReward(result);
          return;
        }
        throw new Error("login reward was not saved");
      } catch (e) {
        console.warn("daily login reward:", e && (e.code || e.message));
        if (++loginRewardTries >= 3) { loginRewardDay = day; loginRewardTries = 0; }
      } finally { loginRewardBusy = false; }
    }
    // حماية السلسلة: لو الطالب غاب يوم أو يومين ومعاه حماية كفاية، بتتستخدم تلقائيًا أول ما يفتح الموقع
    let freezeCheckDay = "";
    async function checkStreakFreeze() {
      if (!me || me.role !== "student" || !loaded.core || !navigator.onLine) return;
      const today = todayISO(), profile = maps.core[me.uid];
      if (freezeCheckDay === today || !profile) return;
      freezeCheckDay = today;
      const shop = profile.shop || {}, freezes = Number(shop.freezes) || 0;
      const seen = [...((profile.arena || {}).days || []), ...(shop.frozen || [])].filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && d < today).sort();
      const last = seen[seen.length - 1];
      if (!last || !freezes) return;
      const missed = [];
      for (let t = Date.parse(last + "T12:00:00Z") + 864e5, end = Date.parse(today + "T12:00:00Z"); t < end; t += 864e5) missed.push(new Date(t).toISOString().slice(0, 10));
      if (!missed.length || missed.length > 2 || missed.length > freezes) return;
      try {
        for (const key of missed) {
          const result = await window.fbEconomy({ op: "use-freeze", key });
          if (!result || !result.ok) return;
        }
        if (window.toast) toast(lang === "en" ? "🧊 A Streak Freeze saved your streak!" : "🧊 حماية السلسلة حفظت سلسلتك!");
      } catch (e) { console.warn("streak freeze:", e && (e.code || e.message)); freezeCheckDay = ""; }
    }
    async function checkDailyPuzzleNotification() {
      if (!me || me.role !== "student") return;
      const day = cairoDayKey();
      if (dailyNotificationAttemptDate === day) return;
      dailyNotificationAttemptDate = day;
      const ref = doc(firestore, "users", me.uid, "notifications", "daily-puzzle-" + day);
      try {
        const existing = await getDoc(ref);
        if (!existing.exists()) await setDoc(ref, {
          type: "daily_puzzle",
          day,
          titleAr: "لغز اليوم الجديد جاهز",
          titleEn: "Today's new puzzle is ready",
          bodyAr: "افتح ساحة التدريب وحل لغز اليوم.",
          bodyEn: "Open the Training Arena and solve today's puzzle.",
          createdAt: serverTimestamp(),
          read: false
        });
      } catch (e) {
        console.error("daily puzzle notification:", e);
        if (window.toast) toast("تعذّر حفظ إشعار لغز اليوم");
      }
      // إشعار عجلة الحظ: مرة في اليوم، ولو الطالب لسه ما لفّش
      const profile = maps.core[me.uid] || {};
      if ((profile.arena || {}).sp === day) return;
      const spinRef = doc(firestore, "users", me.uid, "notifications", "lucky-spin-" + day);
      try {
        const existing = await getDoc(spinRef);
        if (!existing.exists()) await setDoc(spinRef, {
          type: "lucky_spin", day,
          titleAr: "عجلة الحظ جاهزة", titleEn: "Your lucky wheel is ready",
          bodyAr: "لفة مجانية مستنياك النهاردة. اضغط هنا وجرّب حظك.", bodyEn: "A free spin is waiting for you today. Tap here to spin.",
          createdAt: serverTimestamp(), read: false
        });
      } catch (e) { console.warn("lucky wheel notification:", e && e.code); }
    }
    window.fbNotifyHomework = async (sid, key, lessonTitle) => {
      if (!me || !isStaffRole(me.role) || !(db.users || []).some(u => u.id === sid && u.role === "student")) return false;
      try {
        await setDoc(doc(collection(firestore, "users", sid, "notifications")), notificationData(
          "homework", "تم تصحيح الواجب", "Homework checked",
          "تم تسجيل واجب درس: " + lessonTitle, "Your homework for " + lessonTitle + " was checked."
        ));
        return true;
      } catch (e) {
        console.error("homework notification:", e);
        if (window.toast) toast("تعذّر إرسال إشعار الواجب");
        return false;
      }
    };
    window.fbSendNotifications = async (studentIds, type, text) => {
      if (!me || !isStaffRole(me.role) || !["homework", "announcement"].includes(type)) return { ok: false, sent: 0 };
      const body = String(text || "").trim();
      if (!body || body.length > 400) {
        if (window.toast) toast("نص الإشعار مطلوب وبحد أقصى 400 حرف");
        return { ok: false, sent: 0 };
      }
      const allowed = new Set((db.users || []).filter(u => u.role === "student").map(u => u.id));
      const recipients = Array.from(new Set(Array.isArray(studentIds) ? studentIds.filter(id => allowed.has(id)) : []));
      if (!recipients.length) return { ok: false, sent: 0 };
      const titleAr = type === "homework" ? "واجب جديد من الكوتش" : "إعلان من الكوتش";
      const titleEn = type === "homework" ? "New homework from your coach" : "Announcement from your coach";
      try {
        for (let offset = 0; offset < recipients.length; offset += NOTIFY_BATCH) {
          const batch = writeBatch(firestore);
          recipients.slice(offset, offset + NOTIFY_BATCH).forEach(sid => {
            const ref = doc(collection(firestore, "users", sid, "notifications"));
            batch.set(ref, notificationData(type, titleAr, titleEn, body, body));
          });
          await batch.commit();
        }
        return { ok: true, sent: recipients.length };
      } catch (e) {
        console.error("send notifications:", e);
        if (window.toast) toast("تعذّر إرسال الإشعار");
        return { ok: false, sent: 0 };
      }
    };
    window.fbSaveAnnouncements = async (items, newItem) => {
      if (!me || !isStaffRole(me.role)) return false;
      try {
        await setDoc(doc(firestore, "meta", "announcements"), { items: plain(items || []) });
        if (newItem) {
          try {
            if (!(await createAnnouncementNotifications(newItem))) {
              console.error("announcement notification: unable to create notifications");
              if (window.toast) toast("تعذّر إرسال إشعارات الإعلان");
            }
          } catch (e) {
            console.error("announcement notification:", e);
            if (window.toast) toast("تعذّر إرسال إشعارات الإعلان");
          }
        }
        return true;
      }
      catch (e) { console.error("announcements save:", e); if (window.toast) toast("تعذّر حفظ الإعلان"); return false; }
    };
    window.fbMarkNotificationRead = async id => {
      if (!me || me.role !== "student" || !/^[A-Za-z0-9_-]{1,120}$/.test(String(id || ""))) return false;
      try {
        await updateDoc(doc(firestore, "users", me.uid, "notifications", id), { read: true, readAt: serverTimestamp() });
        return true;
      } catch (e) {
        console.error("notification read:", e);
        if (window.toast) toast("تعذّر تحديث الإشعار");
        return false;
      }
    };
    window.fbMarkAllNotificationsRead = async ids => {
      if (!me || me.role !== "student") return false;
      const safeIds = (Array.isArray(ids) ? ids : []).filter(id => /^[A-Za-z0-9_-]{1,120}$/.test(String(id || "")));
      if (!safeIds.length) return true;
      try {
        for (let offset = 0; offset < safeIds.length; offset += 400) {
          const batch = writeBatch(firestore);
          safeIds.slice(offset, offset + 400).forEach(id => batch.update(doc(firestore, "users", me.uid, "notifications", id), { read: true, readAt: serverTimestamp() }));
          await batch.commit();
        }
        return true;
      } catch (e) {
        console.error("notifications read:", e);
        if (window.toast) toast("تعذّر تحديث الإشعارات");
        return false;
      }
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
      const previous = maps[kind], previousIds = Object.keys(previous), nextIds = Object.keys(next);
      const changed = (kind === "core" && !loaded.core) || previousIds.length !== nextIds.length
        || nextIds.some(id => JSON.stringify(previous[id]) !== JSON.stringify(next[id]));
      Object.keys(maps[kind]).forEach(id => { if (!(id in next)) delete maps[kind][id]; });
      Object.keys(next).forEach(id => { maps[kind][id] = next[id]; });
      if (kind === "core") { loaded.core = true; window.__authLoading = false; }
      if (!changed) return;
      rebuild();
    }
    function applyDeletedStudents(snap) {
      const next = new Set(snap.docs.map(d => d.id));
      const changed = next.size !== deletedStudentIds.size || Array.from(next).some(id => !deletedStudentIds.has(id));
      deletedStudentIds = next;
      window.__deletedStudentIds = deletedStudentIds;
      if (changed) rebuild();
    }
    function applyAtt(snap) {
      const att = {};
      snap.forEach(d => { const r = (d.data() || {}).r; if (r && typeof r === "object" && Object.keys(r).length) att[d.id] = cleanDeep(r); });
      const changed = !loaded.att || JSON.stringify(db.attendance) !== JSON.stringify(att);
      db.attendance = att; loaded.att = true;
      Object.keys(synced).forEach(k => { if (k.startsWith("a:")) delete synced[k]; });
      Object.keys(att).forEach(d => { synced["a:" + d] = JSON.stringify(att[d]); });
      if (changed) scheduleRemoteRender();
    }
    function applyGroups(snap) {
      const data = snap.exists() ? snap.data() : {};
      const list = Array.isArray(data.list) ? cleanDeep(data.list) : [];
      const sched = data.sched && typeof data.sched === "object" ? cleanDeep(data.sched) : {};
      const changed = !loaded.groups || JSON.stringify(db.groups) !== JSON.stringify(list) || JSON.stringify(db.groupSched) !== JSON.stringify(sched);
      db.groups = list; db.groupSched = sched; loaded.groups = true; synced["g"] = JSON.stringify({ list, sched });
      if (changed) scheduleRemoteRender();
    }
    function onErr(label) { return err => { console.error("Firestore listener error (" + label + "):", err); window.__authLoading = false; if (window.toast) toast("مفيش صلاحية لقراءة: " + label); }; }

    function startListeners() {
      if (!me) return;
      if (isStaffRole(me.role)) {
        unsubs.push(listen("users", collection(firestore, "users"), s => applyColl("core", s), onErr("users")));
        unsubs.push(listen("deleted", collection(firestore, "deleted"), applyDeletedStudents, onErr("deleted students")));
        unsubs.push(listen("private", collection(firestore, "private"), s => applyColl("priv", s), onErr("private")));
        if (me.role === "admin") unsubs.push(listen("finance", collection(firestore, "finance"), s => applyColl("fin", s), onErr("finance")));
        unsubs.push(listen("attendance", collection(firestore, "attendance"), applyAtt, onErr("attendance")));
      } else if (me.role === "student") {
        unsubs.push(listen("deletedSelf", doc(firestore, "deleted", me.uid), snap => {
          if (snap.exists()) {
            toast("هذا الحساب محذوف ولا يمكن الدخول إليه.");
            signOut(auth);
          }
        }, onErr("deleted account")));
        unsubs.push(listen("profile", doc(firestore, "users", me.uid), { includeMetadataChanges: true }, snap => {
          if (snap.exists()) {
            const profile = cleanDeep(snap.data());
            const changed = !loaded.core || JSON.stringify(maps.core[me.uid]) !== JSON.stringify(profile);
            maps.core = {}; maps.core[me.uid] = profile;
            loaded.core = true; window.__authLoading = false;
            if (changed) rebuild();
            if (!snap.metadata.hasPendingWrites && !snap.metadata.fromCache) boardPublishSoon();
          } else if (!signingUp && !snap.metadata.fromCache) {
            window.__authLoading = false;
            if (window.toast) toast("الحساب ده مش مربوط ببيانات طالب. كلّم الكوتش.");
            signOut(auth);
          }
        }, onErr("users")));
        window.ecaNotifications = [];
        unsubs.push(listen("notifications", query(collection(firestore, "users", me.uid, "notifications"), orderBy("createdAt", "desc")), snap => {
          const next = snap.docs.map(d => {
            const data = d.data() || {};
            return {
              id: d.id,
              type: data.type,
              titleAr: data.titleAr,
              titleEn: data.titleEn,
              bodyAr: data.bodyAr,
              bodyEn: data.bodyEn,
              read: data.read === true,
              createdAt: data.createdAt && typeof data.createdAt.toMillis === "function" ? data.createdAt.toMillis() : 0
            };
          });
          const changed = JSON.stringify(window.ecaNotifications) !== JSON.stringify(next);
          window.ecaNotifications = next;
          if (changed) {
            const menu = document.getElementById("notificationsMenu");
            if (menu && !menu.classList.contains("hidden")) scheduleRemoteRender();
            else if (window.ecaUpdateNotificationBell) window.ecaUpdateNotificationBell();
          }
        }, onErr("notifications")));
        checkDailyPuzzleNotification();
        checkDailyLoginReward();
        setTimeout(checkStreakFreeze, 2500);
        dailyNotificationTimer = setInterval(() => { checkDailyPuzzleNotification(); checkDailyLoginReward(); checkStreakFreeze(); }, 60 * 1000);
      }
      unsubs.push(listen("groups", doc(firestore, "meta", "groups"), applyGroups, onErr("groups")));
      unsubs.push(listen("announcements", doc(firestore, "meta", "announcements"), snap => {
        const next = snap.exists() && Array.isArray(snap.data().items) ? cleanDeep(snap.data().items) : [];
        const changed = JSON.stringify(db.announcements) !== JSON.stringify(next);
        db.announcements = next;
        if (changed && tab === "home") scheduleRemoteRender();
      }, err => console.warn("announcements not readable:", err && err.code)));
      // البطولات: الكوتش بيكتب، والطلبة بيقروا (الترتيب ونتايجهم)
      unsubs.push(listen("tournaments", collection(firestore, "tournaments"), snap => {
        const list = []; snap.forEach(d => list.push(Object.assign(cleanDeep(d.data()), { id: d.id })));
        const next = list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        const changed = JSON.stringify(db.tournaments) !== JSON.stringify(next);
        db.tournaments = next;
        if (changed && (tab === "tournaments" || tab === "home")) scheduleRemoteRender();
      }, err => console.warn("tournaments not readable:", err && err.code)));
      // قائمة الشرف: الكوتش بيحدّثها، والطلبة بيقروها (الطالب مايقدرش يقرا بيانات زمايله مباشرة)
      unsubs.push(listen("honor", doc(firestore, "meta", "honor"), s => {
        const next = s.exists() ? cleanDeep(s.data()) : null;
        const changed = JSON.stringify(window.honorData) !== JSON.stringify(next);
        window.honorData = next;
        if (changed && tab === "honor") scheduleRemoteRender();
      }, err => console.warn("honor roll not readable:", err && err.code)));
    }

    // ===================== حالة الدخول =====================
    async function initUser(user) {
      resetState();
      if (!user) {
        me = null; db.users = []; db.currId = null; db.attendance = {}; db.groups = []; db.groupSched = {}; db.tournaments = []; db.announcements = []; window.ecaNotifications = [];
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
      if (staffErr) {
        me = null; db.users = []; db.currId = null;
        window.__authLoading = false; render();
        toast("تعذّر تحميل بيانات الحساب من Firebase. تأكد من الاتصال وحاول مرة أخرى.");
        return;
      }
      if (staffData) staffData.role = String(staffData.role || "").trim().toLowerCase();   // يقبل "Admin" أو " admin"
      if (!staffData) {
        try {
          const deleted = await getDoc(doc(firestore, "deleted", user.uid));
          if (deleted.exists()) {
            window.__authLoading = false;
            toast("هذا الحساب محذوف ولا يمكن الدخول إليه.");
            await signOut(auth);
            return;
          }
        } catch (e) {
          console.error("Deleted-account check failed:", e);
          window.__authLoading = false;
          toast("تعذّر التحقق من حالة الحساب. حاول مرة أخرى.");
          await signOut(auth);
          return;
        }
      }
      if (!staffData && isGoogleUser(user)) {
        // أول دخول بجوجل: لو مفيش بيانات طالب، نطلب منه يختار (طالب / كوتش) مرة واحدة بس
        let hasProfile = false;
        try { hasProfile = (await getDoc(doc(firestore, "users", user.uid))).exists(); }
        catch (e) {
          console.error("Student profile read failed:", e);
          me = null; db.users = []; db.currId = null;
          window.__authLoading = false; render();
          toast("تعذّر التحقق من بيانات الحساب. تأكد من الاتصال وحاول مرة أخرى.");
          return;
        }
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
            <input id="gPhone" required pattern="[0-9٠-٩+() -]{8,20}" title="أدخل رقم هاتف صحيح" class="w-full bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" dir="ltr" inputmode="tel" maxlength="20" placeholder="رقم الطالب (مطلوب)" />
            <input id="gParent" required pattern="[0-9٠-٩+() -]{8,20}" title="أدخل رقم هاتف صحيح" class="w-full bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" dir="ltr" inputmode="tel" maxlength="20" placeholder="رقم ولي الأمر (مطلوب)" />
            <p class="text-[12px] text-gray-400 leading-relaxed">لو عملت اختبار تحديد المستوى، اكتب رقمك ورقم ولي الأمر زي ما سجّلتهم في الاختبار، وهتبدأ من المستوى اللي اتعتمد. غير كده بتبدأ من Step 1.</p>` : `
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
        if (name.length < 2 || name.length > 80) throw { code: "no-name" };
        if (googleRole === "coach") {
          const code = document.getElementById("gCode").value.trim().toUpperCase();
          if (!/^[A-Z0-9]{8,16}$/.test(code)) throw { code: "bad-invite" };
          madeAdmin = (await claimStaff(user.uid, name, base, code)) === "admin";
        } else {
          const phone = normalizeStudentPhone((document.getElementById("gPhone") || {}).value);
          const parentPhone = normalizeStudentPhone((document.getElementById("gParent") || {}).value);
          if (!phone || !parentPhone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw { code: "invalid-profile" };
          let group = "";
          try { const g = await getDoc(doc(firestore, "meta", "groups")); if (g.exists() && Array.isArray(g.data().list)) group = String(g.data().list[0] || ""); } catch (_) {}
          const pl = await plLookup(phone, parentPhone);
          const prof = { name, username, email, phone, parentPhone, role: "student", level: pl ? pl.level : 1, group, mode: "offline", att: {}, hw: {}, puz: { t: 0, c: 0 } };
          if (pl) prof.plk = pl.key;
          await setDoc(doc(firestore, "users", user.uid), prof);
          if (pl) setTimeout(() => toast("تم تطبيق مستواك من اختبار تحديد المستوى: Step " + pl.level), 400);
        }
        pendingGoogle = null; pendingUpgrade = false; closeGoogleOnboarding();
        await initUser(user);
        tab = "home"; render();
        toast(madeAdmin ? "تم تفعيل حساب الأدمن" : googleRole === "coach" ? "تم إنشاء حساب الكوتش!" : "تم إنشاء حسابك!");
      } catch (e) {
        if (btn) btn.disabled = false;
        const c = e && e.code;
        toast(c === "no-name" ? "اكتب الاسم بالكامل بشكل صحيح" : c === "invalid-profile" ? "اكتب بريدًا إلكترونيًا ورقم الطالب ورقم ولي الأمر بشكل صحيح" : (c === "bad-invite" || c === "permission-denied" || c === "not-found") ? "كود الدعوة غير صحيح أو مستخدم قبل كده" : "تعذّر إنشاء الحساب");
        console.error(e);
      } finally { signingUp = false; }
    };

    // تفعيل حساب كوتش/أدمن بكود دعوة من invites (بيستخدم مرة واحدة)
    async function claimStaff(uid, name, username, code) {
      try {
        // كود دعوة أدمن (invites/{code}.role == "admin") — الـ Rules بترفضه لو الكود ده كود كوتش
        const b = writeBatch(firestore);
        b.update(doc(firestore, "invites", code), { used: true, usedBy: uid });
        b.set(doc(firestore, "staff", uid), { role: "admin", name, username, invite: code });
        await b.commit();
        try { await deleteDoc(doc(firestore, "users", uid)); } catch (_) {}   // لو كان اتسجّل طالب قبل كده
        return "admin";
      } catch (_) { /* مش كود أدمن → نجرب كود دعوة كوتش */ }
      const batch = writeBatch(firestore);
      batch.update(doc(firestore, "invites", code), { used: true, usedBy: uid });
      batch.set(doc(firestore, "staff", uid), { role: "coach", name, username, invite: code });
      await batch.commit();
      try { await deleteDoc(doc(firestore, "users", uid)); } catch (_) {}     // لو كان اتسجّل طالب قبل كده
      return "coach";
    }

    // ===================== واجهات تستدعيها الصفحة =====================
    window.fbLogin = async (idf, pass) => {
      try {
        await signInWithEmailAndPassword(auth, toAuthEmail(idf), pass);
        return { ok: true };
      } catch (e) {
        console.error("Sign-in failed:", e && e.code);
        return { ok: false, code: e && e.code };
      }
    };
    window.fbLogout = async () => { try { await signOut(auth); } catch (_) {} };

    // مستوى معتمد من اختبار تحديد المستوى (بالرقمين: الطالب + ولي الأمر). لو مفيش → null ويبدأ Step 1
    const placementPhoneKey = value => {
      let digits = String(value || "").replace(/[\u0660-\u0669]/g, c => String(c.charCodeAt(0) - 0x660)).replace(/\D/g, "");
      if (digits.startsWith("0020")) digits = "0" + digits.slice(4);
      else if (digits.startsWith("20") && digits.length === 12) digits = "0" + digits.slice(2);
      return /^\d{8,15}$/.test(digits) ? digits : "";
    };
    window.ecaPlKey = async (phone, parent) => {
      const student = placementPhoneKey(phone), guardian = placementPhoneKey(parent);
      if (!student || !guardian) return "";
      const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("eca-pl1|" + student + "|" + guardian));
      return Array.from(new Uint8Array(h)).map(v => v.toString(16).padStart(2, "0")).join("");
    };
    async function plLookup(phone, parent) {
      try {
        const key = window.ecaPlKey ? await window.ecaPlKey(phone, parent) : "";
        if (!key) return null;
        const s = await getDoc(doc(firestore, "placementLevels", key));
        const lv = s.exists() ? Number(s.data().level) : 0;
        return lv >= 1 && lv <= 6 ? { key, level: lv } : null;
      } catch (_) { return null; }
    }
    // الكوتش: نشر/مسح المستوى المعتمد (بيتكتب بالمفتاح المشفّر، من غير اسم ولا أرقام)
    window.fbPlPublish = async (rows) => {
      if (!me || !isStaffRole(me.role)) return { ok: false };
      try {
        const list = (rows || []).filter(x => x && Number(x.level) >= 1 && Number(x.level) <= 6);
        for (let i = 0; i < list.length; i += 400) {
          const b = writeBatch(firestore); let n = 0;
          for (const x of list.slice(i, i + 400)) {
            const key = await window.ecaPlKey(x.phone, x.parentPhone); if (!key) continue;
            b.set(doc(firestore, "placementLevels", key), { level: Number(x.level), at: Date.now() }); n++;
          }
          if (n) await b.commit();
        }
        return { ok: true };
      } catch (e) { console.warn("placementLevels:", e && e.code); return { ok: false }; }
    };
    window.fbPlRemove = async (phone, parent) => {
      if (!me || !isStaffRole(me.role)) return;
      try { const key = await window.ecaPlKey(phone, parent); if (key) await deleteDoc(doc(firestore, "placementLevels", key)); } catch (_) {}
    };

    window.fbSignup = async ({ name, username, email, pass, level, phone, parent }) => {
      name = String(name || "").trim().replace(BAD, "");
      username = String(username || "").trim().toLowerCase();
      email = String(email || "").trim().toLowerCase();
      phone = normalizeStudentPhone(phone);
      parent = normalizeStudentPhone(parent);
      if (name.length < 2 || name.length > 80 || !/^[a-z0-9_]{3,30}$/.test(username)
        || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || String(pass || "").length < 8 || !phone || !parent) {
        return { ok: false, code: "invalid-profile" };
      }
      signingUp = true;
      try {
        const cred = await createUserWithEmailAndPassword(auth, toAuthEmail(username), pass);
        let group = "";
        try { const g = await getDoc(doc(firestore, "meta", "groups")); if (g.exists() && Array.isArray(g.data().list)) group = String(g.data().list[0] || ""); } catch (_) {}
        const pl = await plLookup(phone, parent);
        const profile = { name, username, email, phone, parentPhone: parent, role: "student", level: pl ? pl.level : 1, group, mode: "offline", att: {}, hw: {}, puz: { t: 0, c: 0 } };
        if (pl) profile.plk = pl.key;
        await setDoc(doc(firestore, "users", cred.user.uid), profile);
        await initUser(cred.user);
        return { ok: true, level: profile.level, linked: !!pl };
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
        return { ok: true, rows: q.docs.map(d => Object.assign({ id: d.id }, cleanDeep(d.data()))) };
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

    window.fbOnStudentDeleted = async (id, name) => {
      if (!me || me.role !== "admin" || !/^[A-Za-z0-9_-]{1,128}$/.test(String(id || ""))) return { ok: false };
      if (deletedStudentIds.has(id)) return { ok: false, code: "already-deleted" };
      deletedStudentIds.add(id);
      window.__deletedStudentIds = deletedStudentIds;
      rebuild();
      try {
        const profile = await getDoc(doc(firestore, "users", id));
        if (!profile.exists()) {
          deletedStudentIds.delete(id);
          rebuild();
          return { ok: false, code: "missing" };
        }
        const deletedAt = Date.now();
        await setDoc(doc(firestore, "deleted", id), {
          deletedAt: serverTimestamp(),
          expiresAt: new Date(deletedAt + 30 * 86400000),
          name: String(name || profile.data().name || "طالب").slice(0, 80),
          by: me.uid
        });
        deleteDoc(doc(firestore, "leaderboard", id)).catch(e => console.warn("Leaderboard row removal failed:", e && e.code));
        rebuild();
        return { ok: true };
      } catch (e) {
        deletedStudentIds.delete(id);
        window.__deletedStudentIds = deletedStudentIds;
        rebuild();
        console.error("Student deletion failed:", e);
        return { ok: false, code: e && e.code };
      }
    };
    window.fbListDeletedStudents = async () => {
      if (!me || me.role !== "admin") return { ok: false, rows: [] };
      try {
        const snap = await getDocs(collection(firestore, "deleted"));
        return { ok: true, rows: snap.docs.filter(d => !(d.data() || {}).purgedAt).map(d => {
          const data = d.data() || {};
          const millis = v => v && typeof v.toMillis === "function" ? v.toMillis() : (Number(v) || 0);
          return { id: d.id, name: String(data.name || "طالب"), deletedAt: millis(data.deletedAt || data.at), expiresAt: millis(data.expiresAt) };
        }) };
      } catch (e) {
        console.error("Deleted students list failed:", e);
        return { ok: false, rows: [] };
      }
    };
    window.fbRestoreStudent = async (id) => {
      if (!me || me.role !== "admin" || !/^[A-Za-z0-9_-]{1,128}$/.test(String(id || ""))) return { ok: false };
      try {
        const ref = doc(firestore, "deleted", id);
        const archived = await getDoc(ref);
        if (!archived.exists()) return { ok: false, code: "not-found" };
        const data = archived.data() || {};
        if (data.purgedAt) return { ok: false, code: "purged" };
        const profile = await getDoc(doc(firestore, "users", archived.id));
        if (!profile.exists()) return { ok: false, code: "missing" };
        await deleteDoc(ref);
        deletedStudentIds.delete(archived.id);
        window.__deletedStudentIds = deletedStudentIds;
        rebuild();
        return { ok: true };
      } catch (e) {
        console.error("Student restore failed:", e);
        return { ok: false, code: e && e.code };
      }
    };

    // المسح النهائي بضغطة من الأدمن بعد الـ 30 يوم. أول قراءة من السيرفر هي البوابة: القواعد بترفضها لو الـ 30 يوم ما عدّوش،
    // فساعة جهاز غلط مش ممكن تمسح طالب بدري. لو حصل فشل في النص، الأدمن يقدر يضغط تاني ويكمّل.
    async function purgeStudentData(uid) {
      const emotes = await getDocs(collection(firestore, "users", uid, "emotes"));
      for (const v of emotes.docs) await deleteDoc(v.ref);
      await deleteDoc(doc(firestore, "emoteRate", uid)).catch(() => {});
      const fds = await getDocs(query(collection(firestore, "friendDuels"), where("a", "==", uid), limit(200)));
      for (const v of fds.docs) await deleteDoc(v.ref).catch(() => {});
      const weeks = await getDocs(collection(firestore, "coachChallenges"));
      for (const w of weeks.docs) {
        await deleteDoc(doc(firestore, "coachChallenges", w.id, "hallOfFame", uid)).catch(() => {});
        await deleteDoc(doc(firestore, "coachChallenges", w.id, "attempts", uid)).catch(() => {});
      }
      const vault = await getDocs(collection(firestore, "users", uid, "mistakeVault"));
      for (const v of vault.docs) await deleteDoc(v.ref);
      const bosses = await getDocs(collection(firestore, "assignments"));
      for (const a of bosses.docs) await deleteDoc(doc(firestore, "assignments", a.id, "progress", uid)).catch(() => {});
      const drops = await getDocs(collection(firestore, "liveDrops", uid, "drops"));
      for (const v of drops.docs) await deleteDoc(v.ref);
      const arenas = await getDocs(collection(firestore, "speedArenas"));
      for (const a of arenas.docs) await deleteDoc(doc(firestore, "speedArenas", a.id, "entries", uid));
      const economy = await getDocsFromServer(collection(firestore, "users", uid, "economy"));
      const [notes, attempts, links, profile, priv] = await Promise.all([
        getDocs(collection(firestore, "users", uid, "notifications")),
        getDocs(query(collection(firestore, "attempts"), where("uid", "==", uid))),
        getDocs(query(collection(firestore, "parentLinks"), where("sid", "==", uid))),
        getDoc(doc(firestore, "users", uid)),
        getDoc(doc(firestore, "private", uid))
      ]);
      const refs = [...economy.docs, ...notes.docs, ...attempts.docs, ...links.docs].map(d => d.ref);
      refs.push(doc(firestore, "private", uid), doc(firestore, "finance", uid), doc(firestore, "leaderboard", uid));
      const parentCode = priv.exists() ? priv.data().parentCode : "";
      if (typeof parentCode === "string" && /^[A-Z0-9]{8,16}$/.test(parentCode)) refs.push(doc(firestore, "parentCodes", parentCode));
      const data = profile.exists() ? profile.data() : {};
      if (/^[0-9]{8,15}$/.test(String(data.phone || ""))) {
        const test = await getDoc(doc(firestore, "placementTests", data.phone));
        if (test.exists() && test.data().parentPhone === data.parentPhone) refs.push(test.ref);
      }
      // كل مسح بيحتاج لحد 4 قراءات في القواعد، والحد 20 للـ batch
      for (let i = 0; i < refs.length; i += 5) {
        const batch = writeBatch(firestore);
        refs.slice(i, i + 5).forEach(ref => batch.delete(ref));
        await batch.commit();
      }
      await deleteDoc(doc(firestore, "users", uid));
      await updateDoc(doc(firestore, "deleted", uid), { name: "", purgedAt: serverTimestamp() });
    }
    window.fbPurgeStudent = async (id) => {
      if (!me || me.role !== "admin" || !/^[A-Za-z0-9_-]{1,128}$/.test(String(id || ""))) return { ok: false };
      try {
        await purgeStudentData(id);
        return { ok: true };
      } catch (e) {
        console.error("Student purge failed:", id, e && e.code);
        return { ok: false, code: e && e.code };
      }
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
      ["كلمة السر لازم تكون 8 حروف على الأقل", "Password must be at least 8 characters"],
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

    setTimeout(() => { if (typeof render === "function") render(); }, 100);
