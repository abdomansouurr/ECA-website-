// ECA — core.js (اتفصل من index.html في eca-v3)
    // تحميل بنك الألغاز عند الحاجة فقط (الامتحان أو ألغاز الـ Arena لما Lichess يرفض)
    let _puzBankP = null;
    function loadPuzzleBank() {
      if (window.ECA_PUZZLE_BANK) return Promise.resolve(window.ECA_PUZZLE_BANK);
      if (_puzBankP) return _puzBankP;
      _puzBankP = new Promise((res, rej) => {
        const sc = document.createElement("script");
        sc.src = "puzzles.js?v=" + (window.ECA_VERSION || "1");
        sc.onload = () => window.ECA_PUZZLE_BANK ? res(window.ECA_PUZZLE_BANK) : rej(new Error("bank empty"));
        sc.onerror = () => { _puzBankP = null; sc.remove(); rej(new Error("bank load failed")); };
        document.head.appendChild(sc);
      });
      return _puzBankP;
    }

    // 1. ALL STEPS CURRICULUM
    const STEPS = [
      { step: 1, title: "Step 1", sub: "Fundamentals, Piece Moves, Check & Mate", lessons: [
        { t: "Board and pieces", l: [["Examples", "https://lichess.org/study/jjMNw6GF/wWxeB9BO"]] },
        { t: "Moves of the pieces", l: [["Examples", "https://lichess.org/study/48k26G0o/gvaJW7s5"]] },
        { t: "Attacking and taking", l: [["Examples", "https://lichess.org/study/C4BqIzIc/HO9ETmkV"]] },
        { t: "The pawn", l: [["Examples", "https://lichess.org/study/TCt9XgBc/hgBwh3xP"]] },
        { t: "Defending", l: [["Examples", "https://lichess.org/study/g4ch8UUJ"], ["Exercises", "https://lichess.org/study/RPFaVRku/LErAf9Dq"]] },
        { t: "Check", l: [["Examples", "https://lichess.org/study/nHyQinYL/Mlzci7gW"], ["Exercises", "https://lichess.org/study/LJzsX2Bb/1o4kmKsF"]] },
        { t: "Mate (1)", l: [["Exercises 1", "https://lichess.org/study/DfeRg74R"], ["Exercises 2", "https://lichess.org/study/2HFYM7LI/iNAIUMgw"]] },
        { t: "Mate (2)", l: [["Exercises 1", "https://lichess.org/study/Fk6PprHt"], ["Exercises 2", "https://lichess.org/study/4dxlu3Qy"], ["Exercises 3", "https://lichess.org/study/WakS7KEt"]] },
        { t: "Castling", l: [["Examples", "https://lichess.org/study/Q0mL49LP"], ["Exercises", "https://lichess.org/study/8XJxZK1c/g0194InP"]] },
        { t: "Profitable exchange", l: [["Examples", "https://lichess.org/study/91xk9Lw0"], ["Exercises", "https://lichess.org/study/jDKpfwHS"]] },
        { t: "twofold attack", l: [["Examples", "https://lichess.org/study/klYbDwK8"], ["Exercises 1", "https://lichess.org/study/6v9QYu2b"], ["Exercises 2", "https://lichess.org/study/hs7q4Bey"]] },
        { t: "Draw", l: [["Examples", "https://lichess.org/study/4L5NDH4W/Ufe7WXKh"]] }
      ]},
      { step: 2, title: "Step 2", sub: "Double Attack, The Pin, Eliminating Defence & Golden Rules", lessons: [
        { t: "Targets of attack", l: [["Examples", "https://lichess.org/study/3zmfaxGz/TTSEXL79"], ["Exercises 1", "https://lichess.org/study/TGj12BIr/sWXMbVBp"], ["2-", "https://lichess.org/study/Xm0oBMLW"]] },
        { t: "Double attack: queen (1)", l: [["Exercise 1", "https://lichess.org/study/tqJOzF9p"], ["Exercise 2", "https://lichess.org/study/zTSQXHWV"]] },
        { t: "Double attack: queen (2)", l: [["Exercise 1", "https://lichess.org/study/KkMcTebd"], ["Exercise 2", "https://lichess.org/study/zWSgnN2h"]] },
        { t: "4-The pin", l: [["Examples", "https://lichess.org/study/TwRHuPGZ/15bNAErP"], ["Exercises 1", "https://lichess.org/study/Qzhw3D8K/kl8QnDY0"], ["Exercises 2", "https://lichess.org/study/JjvX9r45/Ys2KRHKU"], ["Exercises 3", "https://lichess.org/study/v6l4lLFw/LralQmQS"]] },
        { t: "5-Eliminating of defence", l: [["Examples", "https://lichess.org/study/gjaexjSM/XtAJvCWZ"], ["Exercises", "https://lichess.org/study/yZMV5JdY/9HFnCNVx"]] },
        { t: "The 3 golden rules", l: [["Examples", "https://lichess.org/study/0DeojSlO/OnyeZ0QY"], ["Exercises", "https://lichess.org/study/Tv5Q4AGE/JWFraj6A"]] },
        { t: "Mate in two", l: [["Exercise 1", "https://lichess.org/study/CYeNq3NN/6M0m2KUg"], ["Exercise 2", "https://lichess.org/study/THHzDa1N/C9EZ0z5O"]] },
        { t: "Double attack: knight", l: [["Exercises 1", "https://lichess.org/study/e8U4ZMuQ/8OFL9uo8"], ["Exercises 2", "https://lichess.org/study/otSMJjwH/pIwu0ivp"]] },
        { t: "Mating with the rook", l: [["Exercises", "https://lichess.org/study/zAGZus6e/5AJW3cs7"]] },
        { t: "Double attack: Rook , bishop , pawn , king", l: [["Exercises", "https://lichess.org/study/whl4X0Vy/BPFGoXvj"]] },
        { t: "Double attack : cooperation of two pieces", l: [["Exercise", "https://lichess.org/study/ZOdpD9Ly/O9zAPm3h"]] },
        { t: "Discovered attack", l: [["Examples", "https://lichess.org/study/b00xkEzU/kKJEEqWR"], ["Exercises 1", "https://lichess.org/study/u8w4QQht/n5EcgyIX"], ["Exercises 2", "https://lichess.org/study/a5Q2Twk2/dP4F5lD9"]] },
        { t: "Defending against mate", l: [["Examples", "https://lichess.org/study/2UEfJLEz/EFD3xymZ"], ["Exercises", "https://lichess.org/study/8YoxQqtw/3I15qJzf"]] },
        { t: "Short notation", l: [["Exercises 1", "https://lichess.org/study/ZZTnIekD/MiN0jOS1"], ["Exercises 2", "https://lichess.org/study/45BAOetX/K6P3Lz1b"], ["Exercises 3", "https://lichess.org/study/9G0jITgq"]] }
      ]},
      { step: 3, title: "Step 3", sub: "Discovered Check, X-Ray, Key Squares & Pin", lessons: [
        { t: "Discovered and double check (step 3)", l: [["Study", "https://lichess.org/study/srYNhk2o"]] },
        { t: "Attack on a pinned piece (step 3)", l: [["Examples", "https://lichess.org/study/aUODKeM7"], ["Exercises", "https://lichess.org/study/R7MF7lb4"]] },
        { t: "Access and mating pattern ( step 3)", l: [["Study", "https://lichess.org/study/LdwLPyPK"]] },
        { t: "The square of the pawn (step 3)", l: [["Examples", "https://lichess.org/study/TGs1ej3b"], ["Exercises", "https://lichess.org/study/oZ0xi9dr"]] },
        { t: "Elimination of the defence (step 3)", l: [["examples", "https://lichess.org/study/dPGoFdbD/vGIxjsGO"], ["exercises", "https://lichess.org/study/xrekdf0f/RCd5Ztfm"]] },
        { t: "defending against the double attack (step 3)", l: [["Study", "https://lichess.org/study/Vh0XG74a/WmCoeGe5"]] },
        { t: "draw (step 3)", l: [["Study", "https://lichess.org/study/OWsq2BB6/Us22qb9A"]] },
        { t: "X-Ray (step 3)", l: [["Study", "https://lichess.org/study/2SV6ZvX7/06csTyjJ"]] },
        { t: "defending against the pin (step 3)", l: [["examples", "https://lichess.org/study/cZTwQ7qz/s9y7sUZn"], ["exercises", "https://lichess.org/study/dMXnI1aK"]] },
        { t: "mobility (step 3)", l: [["Study", "https://lichess.org/study/mSAOaeqN/eYak86eR"]] },
        { t: "key squares ( step 3)", l: [["examples", "https://lichess.org/study/tfuHXokW/zqOhzIRG"], ["marking the key squares", "https://lichess.org/study/61A3DAAj/1yrdSgdh"], ["exercises", "https://lichess.org/study/kP7xaVHA/irKTLPXb"]] },
        { t: "pinned piece is not a good defender (step3)", l: [["mate thanks to a pin", "https://lichess.org/study/Nm6Air3f/pSHbbNIB"], ["exercises 1", "https://lichess.org/study/zjRi4eGw/TwqdeoJ7"], ["exercises 2", "https://lichess.org/study/x1vTVIn2/IKdbD71Q"]] }
      ]},
      { step: 4, title: "Step 4", sub: "Interference, Luring, Blocking, Passed Pawns & 7th Rank", lessons: [
        { t: "Elimination of the defence interference", l: [["Exercises", "https://lichess.org/study/t5pXfLox/34DdnZYk"]] },
        { t: "Double attack : luring", l: [["Examples & Exercises", "https://lichess.org/study/6BtkIYoH/jyX4KueF"]] },
        { t: "Elimination of the defence : blocking", l: [["Examples & Exercises", "https://lichess.org/study/Gwg29Hxj/Y6li8kPN"]] },
        { t: "Pin: placing the front and back piece", l: [["Examples & Exercises", "https://lichess.org/study/t1PGCxRF"]] },
        { t: "The passed pawn", l: [["Exercises", "https://lichess.org/study/pibm2ud9/lDYc6ebt"]] },
        { t: "Defending against the passed pawn", l: [["Study", "https://lichess.org/study/wrm58f4j/ZnUsBj0n"]] },
        { t: "Double attack : Elimination of the defence", l: [["Exercises", "https://lichess.org/study/uNWgETUd/XtI3rvDK"]] },
        { t: "The magnet", l: [["Exercises", "https://lichess.org/study/HDoz7iiZ/jtw6t01P"]] },
        { t: "Weak pawns", l: [["Study", "https://lichess.org/study/pvepHzju/NzJust3T"]] },
        { t: "MIX", l: [["Study", "https://lichess.org/study/Vslcoxz5/4s1QtXma"]] },
        { t: "Material advantage", l: [["Study", "https://lichess.org/study/zz7pwo79/NNBE4uIt"]] },
        { t: "Double attack : chasing and aiming", l: [["Exercises", "https://lichess.org/study/eo7JyYza/ka7GUiIW"]] },
        { t: "Attacking the castled king", l: [["Study", "https://lichess.org/study/C1bi0HTS/HtyfEmM3"]] },
        { t: "The seventh rank", l: [["Examples", "https://lichess.org/study/mDeK8pb5/EySaljms"], ["Exercises 1", "https://lichess.org/study/9rPWgIfk"], ["Exercises 2", "https://lichess.org/study/7ojMv2O2"]] },
        { t: "Strategy in pawn endings", l: [["Exercise", "https://lichess.org/study/MTh6EjHF/8TaknmFZ"]] },
        { t: "MIX G", l: [["Study", "https://lichess.org/study/1Joelo2c"]] },
        { t: "Double attack : clearing", l: [["1-", "https://lichess.org/study/zfXowIhD"], ["Study 2", "https://lichess.org/study/WQZY2uhR"]] },
        { t: "Queen against pawn", l: [["Examples", "https://lichess.org/study/MlayR9Ye/Z0O4m2k6"], ["Exercises", "https://lichess.org/study/HyE8ZFrO"]] }
      ]},
      { step: 5, title: "Step 5", sub: "Material & Time, Breakthrough, Pawn Race, Rook Endings & Strong Squares", lessons: [
        { t: "Material and time", l: [["Examples", "https://lichess.org/study/4emClcQa/lwLckQoi"], ["Exercises: MIX A&B", "https://lichess.org/study/ZSiXyT40/qo6SXDlt"]] },
        { t: "Mate", l: [["Mate in two : getting the guard", "https://lichess.org/study/bxlI3yFy/Y6FyYPXW"], ["Mate in three", "https://lichess.org/study/4kbUV3tO/3LguClAn"]] },
        { t: "Breakthrough", l: [["Exercises", "https://lichess.org/study/yCKqwlXK/RiNVgrf6"]] },
        { t: "pawn ending : key squares", l: [["Study", "https://lichess.org/study/PQ7JcSOS/dNkZ0QBc"]] },
        { t: "Use of pawns", l: [["Study", "https://lichess.org/study/8wlJJFgR/y1kgDU5P"]] },
        { t: "Pawn race", l: [["Examples", "https://lichess.org/study/rLpkojaa"], ["Exercises", "https://lichess.org/study/mE6rkIxV/33oS3dA7"]] },
        { t: "Seventh rank", l: [["Exercises", "https://lichess.org/study/mE6rkIxV/8dRywK39"]] },
        { t: "Discovered attack", l: [["Examples", "https://lichess.org/study/OgxlzYQD/rJiCKuon"], ["Exercises", "https://lichess.org/study/57XhbPB3/afi99YM8"]] },
        { t: "Pin (preparatory move)", l: [["Exercises", "https://lichess.org/study/57XhbPB3/MvLHjVgH"]] },
        { t: "The opening", l: [["Examples", "https://lichess.org/study/cFA1o1Fm/2AMXSa9u"], ["Exercises 1", "https://lichess.org/study/jcpzJAzW"], ["Exercises 2", "https://lichess.org/study/VLebVUHz"]] },
        { t: "Rook against pawn", l: [["Examples", "https://lichess.org/study/XEZIKdM3/sCcE8TgD"], ["Exercises 1", "https://lichess.org/study/Gm6BPfN2/aFB4syxa"], ["Exercises 2", "https://lichess.org/study/ixNQgC8m"]] },
        { t: "Strong square", l: [["Examples", "https://lichess.org/study/xBc75QKq/BvOSQ0qP"], ["Exercises", "https://lichess.org/study/NZtUAixb"]] },
        { t: "Eliminating the defence : luring away + mate", l: [["Study", "https://lichess.org/study/tqz28nOS/lAclawnI"]] },
        { t: "Defending", l: [["Examples", "https://lichess.org/study/mmOEd1yJ"], ["Exercises", "https://lichess.org/study/ILOZM4m9"]] },
        { t: "Rook endings", l: [["Examples", "https://lichess.org/study/CNd9QBiq"], ["Exercises", "https://lichess.org/study/G5ILgPOq"]] },
        { t: "Attacking on the king", l: [["Study", "https://lichess.org/study/G5ILgPOq/WUnq8bNf"]] },
        { t: "Open file", l: [["Examples", "https://lichess.org/study/qNv9BNOX/tB0DjXda"], ["Exercises", "https://lichess.org/study/kFBNSeRd"]] },
        { t: "Draw", l: [["Study", "https://lichess.org/study/4QvAxjvr"]] },
        { t: "The wrong bishop", l: [["Study", "https://lichess.org/study/6bKfsHPR"]] }
      ]},
      { step: 6, title: "Step 6", sub: "Coming Soon", lessons: [] }
    ];

    const PUZZLES = {
      1: { q: "White to move: Black King on g8 trapped behind f7,g7,h7 pawns. White Rook on e1. Winning move?", opts: ["Re8# (Checkmate)", "Rf1", "Kf1"], ans: 0, url: "https://lichess.org/study/DfeRg74R" },
      2: { q: "White Knight on d5, Black King on e8 and Queen on a8. Best Double Attack?", opts: ["Nc7+ (Forking King & Queen)", "Nb6", "Ne3"], ans: 0, url: "https://lichess.org/study/e8U4ZMuQ/8OFL9uo8" },
      3: { q: "Black Knight on f6 is pinned to King on e8 by White Bishop on g5. Best plan?", opts: ["Nd5 (Attack the pinned piece)", "Retreat Bishop", "Push a3"], ans: 0, url: "https://lichess.org/study/aUODKeM7" },
      4: { q: "Sacrificing on h7 (Bxh7+ Kxh7) to pull the King to an open line is called:", opts: ["The Magnet / Luring", "Stalemate", "Castling"], ans: 0, url: "https://lichess.org/study/HDoz7iiZ/jtw6t01P" },
      5: { q: "Step 5 Daily Tactical Puzzle: Cut communication between defending Rooks.", opts: ["Nd5! (Interference)", "Kh1", "Rb1"], ans: 0, url: "https://lichess.org/training" },
      6: { q: "Step 6 Master Calculation Puzzle: Find the 4-move forced mating net.", opts: ["Qxh7+! followed by Rh3#", "Qe2", "h4"], ans: 0, url: "https://lichess.org/training" }
    };

    const ALLOW_SELF_SIGNUP = true; // false = اقفل التسجيل الذاتي (الكوتش بس يضيف الطلاب)
    let lang = localStorage.getItem("ECA_LANG") || "ar";
    const EXTRA_DICT = [["تسجيل الحضور", "Attendance"], ["تسجيل الحضور", "Attendance"], ["سجّل حضور الطلاب الأونلاين والأوفلاين كل واحد في قسمه.", "Record attendance for online and offline students, each in their own section."], ["إضافة طالب جديد", "Add new student"], ["إضافة طالب جديد", "Add new student"], ["تعديل بيانات الطالب", "Edit student"], ["نسخة احتياطية", "Backup"], ["استرجاع نسخة", "Restore backup"], ["طلبة الأوفلاين", "Offline students"], ["طلبة الأونلاين", "Online students"], ["ابحث باسم الطالب...", "Search student name..."], ["اليوم السابق", "Previous day"], ["اليوم التالي", "Next day"], ["النهاردة", "Today"], ["تحديد الكل حاضر", "Mark all present"], ["مسح تسجيل اليوم", "Clear today's records"], ["لم يُسجَّل", "Not recorded"], ["✓ حاضر", "✓ Present"], ["متأخر", "Late"], ["✗ غايب", "✗ Absent"], ["حاضر", "Present"], ["متأخر", "Late"], ["غايب", "Absent"], ["لا يوجد سجل بعد", "No records yet"], ["نسبة الحضور", "Attendance rate"], ["حصة", "sessions"], ["نقل للأوفلاين", "Move to offline"], ["نقل للأونلاين", "Move to online"], ["لا يوجد طلاب في هذا القسم بعد. أضف طالباً جديداً أو انقل طالباً من القسم الآخر.", "No students in this section yet. Add a new student or move one from the other section."], ["لا توجد نتائج لهذا البحث.", "No results for this search."], ["لا يوجد طلاب بعد. اضغط «إضافة طالب جديد».", "No students yet. Tap \"Add new student\"."], ["لا يوجد طلاب في هذا القسم بعد.", "No students in this section yet."], ["تقرير الشهر —", "Monthly report —"], ["طلبة الأونلاين", "Online students"], ["طلبة الأوفلاين", "Offline students"], ["⬇ تصدير CSV", "⬇ Export CSV"], ["اسم الطالب", "Student name"], ["اسم الطالب بالكامل", "Student full name"], ["اليوزر نيم بالإنجليزي (اختياري)", "Username in English (optional)"], ["الباسورد (الافتراضي 123456)", "Password (default 123456)"], ["السن", "Age"], ["موبايل الطالب", "Student mobile"], ["موبايل ولي الأمر (واتساب)", "Parent mobile (WhatsApp)"], ["طالب أوفلاين (حضوري)", "Offline student (in-person)"], ["طالب أونلاين", "Online student"], ["اترك الباسورد فارغاً لو مش عايز تغيّره.", "Leave the password empty to keep it unchanged."], ["حذف الطالب", "Delete student"], ["إضافة الطالب", "Add student"], ["حفظ التعديلات", "Save changes"], ["تثبيت التطبيق", "Install app"], ["تم نقل الطالب إلى الأونلاين", "Student moved to online"], ["تم نقل الطالب إلى الأوفلاين", "Student moved to offline"], ["لا توجد سجلات حضور في هذا الشهر", "No attendance records this month"], ["تم تنزيل النسخة الاحتياطية", "Backup downloaded"], ["تم استرجاع النسخة الاحتياطية", "Backup restored"], ["ملف النسخة الاحتياطية غير صالح", "Invalid backup file"], ["سيتم استبدال كل البيانات الحالية بالنسخة الاحتياطية. متابعة؟", "All current data will be replaced by the backup. Continue?"], ["اكتب اسم الطالب", "Enter the student's name"], ["اليوزر نيم ده مستخدم بالفعل", "This username is already taken"], ["يوجد طالب بنفس الاسم بالفعل. هل تريد المتابعة؟", "A student with the same name already exists. Continue?"], ["تم حفظ بيانات الطالب", "Student saved"], ["تمت إضافة الطالب — اليوزر: ", "Student added — username: "], [" / الباسورد: ", " / password: "], ["هل أنت متأكد من حذف الطالب نهائياً مع كل سجلات حضوره؟", "Delete this student permanently with all attendance records?"], ["تم حذف الطالب", "Student deleted"], ["على الآيفون: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»", "On iPhone: tap Share, then \"Add to Home Screen\""], ["لا يوجد إنترنت — الموقع يعمل والبيانات محفوظة على جهازك", "No internet — the site still works and data is saved on your device"], ["عاد الاتصال بالإنترنت", "Back online"]];
    const DICT = [["إلغاء", "Cancel"], ["فتح الملاحظات", "Open notes"], ["خانة ولي الأمر السرية", "Parent Secret Box"], ["أدخل الباسورد الموحد لأولياء الأمور", "Enter the shared parents' password"], ["جاري تحميل منصة Egypt Chess Academy...", "Loading Egypt Chess Academy platform..."], ["بوابة ولي الأمر (Parent Dashboard)", "Parent Portal (Parent Dashboard)"], ["بوابة ولي الأمر", "Parent Portal"], ["داشبورد ولي الأمر", "Parent Dashboard"], ["الرئيسية", "Home"], ["كل المستويات (Steps 1-6)", "All Levels (Steps 1-6)"], ["دروس Step ", "Lessons: Step "], ["متابعة الطلاب والجروبات", "Students & Groups Tracker"], ["خروج", "Logout"], ["اضغط على أي حساب تجريبي للدخول فوراً أو أنشئ حساباً جديداً:", "Tap a demo account to enter instantly or create a new account:"], ["دخول سريع كـ مدرب (Coach)", "Quick login as Coach"], ["يفتح كل الـ 6 Steps + متابعة الطلاب والجروبات", "Opens all 6 Steps + student & group tracking"], ["دخول سريع كـ طالب (Omar - Step 2)", "Quick login as Student (Omar - Step 2)"], ["يرى فقط Step 2 + اللغز اليومي + الدرس القادم", "Sees only Step 2 + daily puzzle + next lesson"], ["ابحث عن omar_chess وشاهد التقييم والملاحظة السرية", "Search omar_chess to see the rating and secret note"], ["الدخول السريع للمدرب محمي بكلمة سر", "Coach quick login is password-protected"], ["Login (دخول)", "Login"], ["Sign Up (حساب جديد)", "Sign Up"], ["تسجيل الدخول", "Log in"], ["طالب (Student)", "Student"], ["مدرب (Coach)", "Coach"], ["إنشاء الحساب", "Create account"], ["كود المدرب السري", "Secret coach code"], ["حضرت", "Attended"], ["درس في", "lessons in"], ["متبقي", "remaining"], ["درس للامتحان", "lessons until the exam"], ["دروس", "lessons"], ["درس لإنهاء", "lessons to finish"], ["ملاحظة المدرب السرية لولي الأمر:", "Coach's secret note for parents:"], ["إغلاق", "Close"], ["نسبة الدقة:", "Accuracy:"], ["اختيار ←", "Select →"], ["فتح التمرين على Lichess ↗", "Open exercise on Lichess ↗"], ["الدرس اللي عليه الدور (Next Lesson)", "Your Next Lesson"], ["مكتمل", "complete"], ["اضغط هنا للانتقال تلقائياً لصفحة دروس مستواك (Step", "Tap here to open your level's lessons (Step"], ["فقط).", "only)."], ["أتممت كل دروس Step", "You completed all lessons of Step"], ["اختبار الترقية للمستوى التالي:", "Promotion test for the next level:"], ["بدء اختبار", "Start test"], ["أجبت إجابة صحيحة — اللغز مقفول", "Correct answer — puzzle locked"], ["أجبت إجابة خاطئة — اللغز مقفول ولا يمكن إعادته", "Wrong answer — puzzle locked, cannot be retried"], ["إجابة صحيحة! أحسنت يا بطل", "Correct! Well done, champion"], ["إجابة خاطئة — تم قفل اللغز", "Wrong answer — puzzle locked"], ["اللغز مقفول بالفعل", "Puzzle is already locked"], ["↺ إعادة فتح اللغز", "↺ Reopen puzzle"], ["تم إعادة فتح اللغز", "Puzzle reopened"], ["حساب المدرب", "Coach Account"], ["يمكنك استعراض جميع الـ 6 Steps ومتابعة حضور وواجبات ومجموعات الطلاب.", "You can browse all 6 Steps and track students' attendance, homework and groups."], ["كل الدروس (Steps 1-6)", "All Lessons (Steps 1-6)"], ["جميع المستويات للمدرب (Steps 1 – 6)", "All Levels for Coach (Steps 1 – 6)"], ["دروس مستواك الحالي فقط — Step", "Your current level's lessons only — Step"], ["اضغط على أي Step لعرض قائمة دروسها تحت بعضها.", "Tap any Step to show its lessons list."], ["ممنوع ظهور أي مستوى آخر غير مستواك الحالي.", "No level other than your current one is shown."], ["▲ إخفاء القائمة", "▲ Hide list"], ["▼ عرض الدروس", "▼ Show lessons"], ["متابعة الطلاب والمجموعات", "Students & Groups Tracker"], ["علم (✓) أمام الدرس الذي حضره الطالب والواجب الذي حله واكتب ملاحظة سرية لولي الأمر.", "Tick (✓) the lessons the student attended and the homework solved, and write a secret note for the parent."], ["+ اسم جروب جديد...", "+ New group name..."], ["إضافة جروب", "Add group"], ["كل الجروبات", "All Groups"], ["حضر", "Attended"], ["الواجبات المكتملة", "Completed homework"], ["الواجب", "Homework"], ["اختر طالباً", "Select a student"], ["ملاحظة سرية لولي الأمر...", "Secret note for parent..."], ["حفظ لولي الأمر", "Save for parent"], ["تم حفظ الملاحظة السرية لولي الأمر", "Secret note saved for parent"], ["بوابة متابعة ولي الأمر (Parent Dashboard)", "Parent Follow-Up Portal (Parent Dashboard)"], ["ابحث بالـ Username الخاص بابنك (جرب:", "Search by your child's username (try:"], [" أو ", " or "], ["اكتب يوزرنيم الطالب...", "Type the student's username..."], ["لا يوجد طالب بهذا الاسم. جرب كتابة omar_chess", "No student with this name. Try typing omar_chess"], ["التقييم التلقائي لمستوى الطالب", "Automatic student level rating"], ["الدروس التي حضرها", "Lessons attended"], ["دقة الألغاز اليومية", "Daily puzzle accuracy"], ["ملاحظة المدرب السرية:", "Coach's secret note:"], ["ملاحظات المدرب السرية لولي الأمر (محمية بباسورد موحد)", "Coach's secret notes for parents (protected by a shared password)"], ["فتح بالباسورد", "Unlock with password"], ["ممتاز / عبقري", "Excellent / Genius"], ["رائع", "Great"], ["مقبول", "Fair"], ["مرحباً بك ", "Welcome "], ["بيانات الدخول غير صحيحة", "Incorrect login details"], ["كود المدربين غير صحيح", "Invalid coach code"], ["تم إنشاء الحساب!", "Account created!"], ["تم فتح ملاحظة ولي الأمر", "Parent note unlocked"], ["باسورد غير صحيح", "Incorrect password"], ["مبروك! تمت ترقيتك إلى Step ", "Congrats! You've been promoted to Step "], ["اختبار نهاية Step ", "End-of-Step test "], [": هل أنت جاهز للترقية إلى Step ", ": ready to be promoted to Step "], ["؟", "?"], ["إتمام الاختبار بنجاح والترقية إلى Step ", "Pass the test and promote to Step "], ["دخول المدرب السريع", "Coach Quick Login"], ["أدخل كلمة سر المدرب", "Enter the coach password"], ["فتح", "Open"], ["كلمة السر غير صحيحة", "Wrong password"]].concat(EXTRA_DICT).sort((a, b) => b[0].length - a[0].length);
    function trText(s) { if (lang !== "en") return s; for (const [a, b] of DICT) s = s.split(a).join(b); return s; }
    function applyLang() {
      document.documentElement.lang = lang;
      const b = document.getElementById("langBtn"); if (b) b.textContent = lang === "en" ? "عربي" : "EN";
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), ns = [];
      while (w.nextNode()) ns.push(w.currentNode);
      ns.forEach(n => {
        const p = n.parentNode && n.parentNode.nodeName; if (p === "SCRIPT" || p === "STYLE") return;
        if (n.__o === undefined) n.__o = n.nodeValue;
        const v = lang === "en" ? trText(n.__o) : n.__o; if (n.nodeValue !== v) n.nodeValue = v;
      });
      document.querySelectorAll("[placeholder]").forEach(e => {
        if (e.__p === undefined) e.__p = e.getAttribute("placeholder");
        e.setAttribute("placeholder", lang === "en" ? trText(e.__p) : e.__p);
      });
      scheduleBidi();
    }
    // ===== اتجاه النص (RTL) للجمل العربية =====
    // الصفحة نفسها LTR، فالجملة العربية اللي فيها كلمة إنجليزي في أولها أو آخرها (Steps، Lichess، ECA…) كانت بتتعرض
    // بترتيب غلط وعلامات الترقيم بتروح للجنب الغلط. هنا بنخلّي كل نص فيه عربي RTL، من غير ما نقلب شكل الصفحة.
    const AR_LETTERS = /[\u0600-\u06FF\u0750-\u077F]/;
    function fixBidi() {
      const body = document.body; if (!body) return;
      if (lang !== "ar") {                                     // الإنجليزي: شيل أي اتجاه ضفناه
        body.querySelectorAll("[data-ecabidi]").forEach(el => {
          if (el.dataset.ecabidi === "w") { const par = el.parentNode; while (el.firstChild) par.insertBefore(el.firstChild, el); par.removeChild(el); }
          else { el.removeAttribute("dir"); el.removeAttribute("data-ecabidi"); }
        });
        return;
      }
      const w = document.createTreeWalker(body, NodeFilter.SHOW_TEXT), nodes = [];
      while (w.nextNode()) { const n = w.currentNode; if (n.nodeValue && AR_LETTERS.test(n.nodeValue)) nodes.push(n); }
      const disp = new Map(), flexish = d => /flex|grid/.test(d);
      for (const n of nodes) {
        let el = n.parentElement; if (!el) continue;
        const tag = el.nodeName; if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA" || tag === "OPTION") continue;
        if (el.hasAttribute("data-ecabidi")) continue;         // اتظبط قبل كده
        if (el.closest('[dir="ltr"]') && !el.closest("[data-ecabidi]")) continue;   // مكان اتحدد له LTR عمدًا (أرقام، FEN…)
        const direct = el;
        while (el && el !== body) { let d = disp.get(el); if (!d) { d = getComputedStyle(el).display; disp.set(el, d); } if (d !== "inline") break; el = el.parentElement; }
        if (!el || el === body) continue;
        if (el.hasAttribute("data-ecabidi")) continue;
        if (el.hasAttribute("dir")) continue;                  // فيه اتجاه محدد من الكود
        if (el === direct && flexish(disp.get(el))) {          // نص مباشر جوه flex/grid: نلفّه في span عشان ما نقلبش ترتيب العناصر
          const sp = document.createElement("span"); sp.setAttribute("dir", "rtl"); sp.dataset.ecabidi = "w";
          n.parentNode.insertBefore(sp, n); sp.appendChild(n);
        } else if (!flexish(disp.get(el))) { el.setAttribute("dir", "rtl"); el.dataset.ecabidi = "1"; }
      }
    }
    let bidiTimer = 0;
    function scheduleBidi() { clearTimeout(bidiTimer); bidiTimer = setTimeout(fixBidi, 40); }
    try { new MutationObserver(scheduleBidi).observe(document.body, { childList: true, subtree: true, characterData: true }); } catch (_) {}

    function toggleLang() { lang = lang === "en" ? "ar" : "en"; localStorage.setItem("ECA_LANG", lang); render(); }   // render بيعمل applyLang + بيعيد التواريخ والجُمل اللي فيها أرقام
    const DB_KEY = "ECA_PLATFORM_V2";
    try { localStorage.removeItem(DB_KEY); } catch (_) {}   // مسح النسخة القديمة المخزنة في المتصفح (كانت فيها كلمات سر)
    let db = { users: [], groups: [], groupSched: {}, tournaments: [], announcements: [], currId: null, attendance: {} };   // البيانات الحقيقية بتيجي من Firebase بعد تسجيل الدخول
    let parentStu = null, parentBusy = false;
    window.__authLoading = true;
    setTimeout(() => { if (window.__authLoading) { window.__authLoading = false; render(); } }, 8000);
    let tab = "home", authMode = "login", signupRole = "student", selStuId = "", grpFilter = "ALL", searchQ = "", parentQ = "", unlockedStuId = null, openSteps = { 1: true, 2: true, 3: false, 4: false, 5: false, 6: false };

    function save() { if (window.syncToCloud) window.syncToCloud(); }
    // محاولة لغز/امتحان: بتتسجّل في دفتر المحاولات (attempts) وملف الطالب في عملية واحدة.
    // قواعد Firestore بترفض أي زيادة في العدّادات من غير محاولة جديدة → مفيش إعادة ولا تزوير أرقام.
    function attemptKey(v) { return String(v || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 40); }
    function recordAttempt(kind, key, ok, mutate, extra) {
      const u = currUser(); if (!u || u.role !== "student") return Promise.resolve({ ok: false });
      key = attemptKey(key); if (!key) return Promise.resolve({ ok: false });
      mutate(u);
      u.lastAttempt = u.id + "_" + kind + "_" + key;
      if (!window.fbCommitAttempt) { save(); return Promise.resolve({ ok: true }); }
      return window.fbCommitAttempt(u.lastAttempt, Object.assign({ kind, key, ok: !!ok }, extra || {}));
    }
    function currUser() { return db.users.find(u => u.id === db.currId) || null; }
    function toast(m) { const el = document.getElementById("toast"); el.textContent = trText(m); el.classList.remove("hidden"); setTimeout(() => el.classList.add("hidden"), 2800); }
    function go(t) { if (tab !== t) history.pushState({ tab: t }, "", "#" + t); tab = t; }
    function switchTab(t) { go(t); render(); }
    function logout() { parentStu = null; parentQ = ""; if (window.fbLogout) window.fbLogout(); go("home"); render(); }
    function goHomeRefresh() { go("home"); render(); }
    // قايمة الحساب (الأيقونة فوق يمين): فتح/قفل — كانت ناقصة من النسخة
    function closeAcctMenu() { const m = document.getElementById("acctMenu"), b = document.getElementById("acctBtn"); if (m) m.classList.add("hidden"); if (b) b.setAttribute("aria-expanded", "false"); }
    function toggleAcctMenu(ev) {
      if (ev) ev.stopPropagation();
      const m = document.getElementById("acctMenu"), b = document.getElementById("acctBtn"); if (!m) return;
      const open = m.classList.contains("hidden");
      m.classList.toggle("hidden", !open);
      if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
    }
    document.addEventListener("click", e => { if (!e.target.closest || !e.target.closest("#acctMenu, #acctBtn")) closeAcctMenu(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeAcctMenu(); });
    function isInfoTab(t) { return typeof renderInfoPage === "function" && INFO_TABS.includes(t); }   // صفحات المعلومات (متعرّفة في سكريبت تحت)

    function calcStats(stu) {
      const st = STEPS.find(x => x.step === Number(stu.level)) || STEPS[0];
      const total = st.lessons.length || 1;
      let attC = 0, hwC = 0, nextIdx = -1;
      st.lessons.forEach((_, i) => {
        const k = stu.level + "-" + i;
        if (stu.att && stu.att[k]) attC++; else if (nextIdx === -1) nextIdx = i;
        if (stu.hw && stu.hw[k]) hwC++;
      });
      const rem = Math.max(0, total - attC);
      const attP = Math.round((attC / total) * 100);
      const hwP = Math.round((hwC / total) * 100);
      const puzP = stu.puz && stu.puz.t > 0 ? Math.round((stu.puz.c / stu.puz.t) * 100) : 100;
      const overall = Math.round(attP * 0.45 + hwP * 0.35 + puzP * 0.2);
      let evalText = "مقبول", evalCls = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      if (overall >= 80) { evalText = "ممتاز / عبقري"; evalCls = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"; }
      else if (overall >= 50) { evalText = "رائع"; evalCls = "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"; }
      return { st, total, attC, hwC, rem, attP, hwP, puzP, overall, evalText, evalCls, nextLesson: nextIdx !== -1 ? st.lessons[nextIdx] : null, nextIdx };
    }

 function render() {
      const winY = window.scrollY;
      const innerScrolls = Array.from(document.querySelectorAll("#mainView .overflow-y-auto")).map(el => el.scrollTop);
      const a = document.activeElement, id = a && a.id, s = a && a.selectionStart, e = a && a.selectionEnd;
      _render(); applyLang();
      if (id) { const el = document.getElementById(id); if (el && el !== document.activeElement) { el.focus({ preventScroll: true }); try { el.setSelectionRange(s, e); } catch (_) {} } }
      document.querySelectorAll("#mainView .overflow-y-auto").forEach((el, i) => { if (innerScrolls[i] !== undefined) el.scrollTop = innerScrolls[i]; });
      window.scrollTo(0, winY);
    }
   function _render() {
      const u = currUser();
      const nav = document.getElementById("navButtons");
      const cSearch = document.getElementById("coachSearchBox");
      const main = document.getElementById("mainView"), acct = document.getElementById("acctButtons");
      if (!u && window.__authLoading) { cSearch.classList.add("hidden"); nav.innerHTML = ""; acct.innerHTML = ""; main.innerHTML = document.getElementById("ecaSkeleton") ? main.innerHTML : SKELETON_HTML; return; }

      if (!u) {
        cSearch.classList.add("hidden");
        acct.innerHTML = "";
        nav.innerHTML = `<button onclick="switchTab('home')" class="nav-tab ${!isInfoTab(tab) ? 'active' : ''}">تسجيل الدخول</button>
          <button onclick="switchTab('about')" class="nav-tab ${isInfoTab(tab) ? 'active' : ''}">عن الأكاديمية</button>`;
        main.innerHTML = isInfoTab(tab) ? renderInfoPage(tab) : renderAuthView();
        return;
      }

      if (u.role === "coach") cSearch.classList.remove("hidden"); else cSearch.classList.add("hidden");

      const T = (id, label, extra) => `<button onclick="switchTab('${id}')" class="nav-tab ${tab === id ? 'active' : ''}" ${tab === id ? 'aria-current="page"' : ''}>${label}${extra || ''}</button>`;
      const certN = (u.certificates || []).length;
      nav.innerHTML = u.role === "coach"
        ? T("home", "الرئيسية") + T("today", "جدول اليوم") + T("attendance", "تسجيل الحضور") + T("tracker", "متابعة الطلاب") + T("finance", "الحسابات")
          + T("lessons", "المنهج") + T("arena", "ساحة التدريب") + T("tournaments", "البطولات") + T("honor", "قائمة الشرف") + T("ranks", "الرتب والشارات")
        : T("home", "الرئيسية") + T("lessons", "دروسي") + T("arena", "ساحة التدريب") + T("tournaments", "البطولات") + T("ranks", "الرتب والشارات")
          + T("honor", "قائمة الشرف") + T("certs", "شهاداتي", certN ? `<span class="badge">${certN}</span>` : "") + T("parent", "تقرير ولي الأمر");
      const ai = window.fbAuthInfo ? window.fbAuthInfo() : { password: true, google: true };
      const mi = (fn, label, icon, cls) => `<button onclick="closeAcctMenu(); ${fn}" role="menuitem" class="w-full flex items-center gap-2.5 px-3 h-11 rounded-lg text-sm text-start hover:bg-yellow-500/10 ${cls || 'text-gray-200'}">${icon}<span>${label}</span></button>`;
      acct.innerHTML = `<div class="relative">
        <button id="acctBtn" onclick="toggleAcctMenu(event)" aria-haspopup="menu" aria-expanded="false" aria-label="الحساب" title="${esc(u.name || "")}" class="icon-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
        </button>
        <div id="acctMenu" role="menu" class="hidden absolute end-0 mt-2 w-60 gold-card rounded-xl p-1.5 shadow-2xl z-40">
          <div class="px-3 py-2 border-b border-yellow-500/15 mb-1">
            <div class="text-sm font-bold text-white truncate">${esc(u.name || "")}</div>
            <div class="text-[11px] text-gray-400 truncate" dir="ltr">@${esc(u.username || "")}</div>
          </div>
          ${!ai.google ? mi("linkGoogle()", "ربط حساب Google", '<svg viewBox="0 0 24 24" class="w-4 h-4" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z"/></svg>') : ""}
          ${ai.password ? mi("changeMyPassword()", "تغيير كلمة السر", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 20 3m-3 3 2 2m-5 1 2 2"/></svg>') : ""}
          ${mi("logout()", "تسجيل الخروج", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/></svg>', "text-red-300")}
        </div>
      </div>`;

      if (tab === "lessons") main.innerHTML = renderLessonsView(u);
      else if (tab === "today" && u.role === "coach") main.innerHTML = renderTodayView(u);
      else if (tab === "tracker" && u.role === "coach") main.innerHTML = renderTrackerView();
      else if (tab === "attendance" && u.role === "coach") main.innerHTML = renderAttendanceView();
      else if (tab === "finance" && u.role === "coach") main.innerHTML = renderFinanceDashboardView();
      else if (tab === "parent" && u.role === "student") main.innerHTML = renderStudentParentView(u);
      else if (tab === "certs" && u.role === "student") main.innerHTML = renderMyCertsView(u);
      else if (tab === "honor") main.innerHTML = renderHonorView(u);
      else if (tab === "tournaments" && typeof renderTournamentsView === "function") main.innerHTML = renderTournamentsView(u);
      else if (tab === "arena") main.innerHTML = renderArenaView(u);
      else if (tab === "ranks") main.innerHTML = renderRanksView(u);
      else if (isInfoTab(tab)) main.innerHTML = renderInfoPage(tab);
      else main.innerHTML = u.role === "student" ? renderStudentHome(u) : renderCoachHome(u);
    }
    function renderAuthView() {
      return `
        <div class="max-w-4xl mx-auto grid md:grid-cols-5 gap-6 mt-4">
          <div class="md:col-span-2 gold-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <img src="img/eca-logo.jpg" alt="Egypt Chess Academy" class="w-32 h-32 mx-auto mb-3 rounded-2xl bg-white border-2 border-yellow-500/60 object-contain" />
              <h2 class="font-display font-bold text-xl gold-gradient-text">Egypt Chess Academy Portal</h2>
              <p class="text-xs text-gray-400 mt-2">سجّل دخولك بحسابك. ولي الأمر يتابع ابنه من «داشبورد ولي الأمر» جوه حساب الطالب.</p>
              <div class="mt-4 space-y-2.5">
                <div class="w-full text-start p-3 rounded-xl bg-black/80 border border-yellow-500/40">
                  <div class="text-xs font-bold text-yellow-300">دخول بضغطة واحدة بحساب Google</div>
                  <div class="text-[11px] text-gray-400">أول مرة بتختار طالب أو كوتش، وبعد كده بتدخل بضغطة واحدة من غير باسورد.</div>
                </div>
              </div>
            </div>
            <div class="text-[11px] text-gray-400 mt-4 pt-3 border-t border-yellow-500/20">
              الدخول بحساب شخصي لكل مستخدم — مفيش كلمات سر مشتركة
            </div>
          </div>

          <div class="md:col-span-3 gold-card rounded-2xl p-6 order-first md:order-none">
            <div class="flex gap-2 mb-5 bg-black p-1 rounded-xl border border-yellow-500/20">
              <button onclick="authMode='login'; render();" class="flex-1 py-2 rounded-lg text-xs font-bold ${authMode==='login'?'gold-btn':'text-gray-400'}">Login (دخول)</button>
              ${ALLOW_SELF_SIGNUP ? `<button onclick="authMode='signup'; render();" class="flex-1 py-2 rounded-lg text-xs font-bold ${authMode==='signup'?'gold-btn':'text-gray-400'}">Sign Up (حساب جديد)</button>` : ''}
            </div>
            <div class="grid sm:grid-cols-2 gap-2">
              <button type="button" onclick="googleLogin('student')" class="g-btn">${G_ICON}<span>دخول الطالب بجوجل</span></button>
              <button type="button" onclick="googleLogin('coach')" class="g-btn">${G_ICON}<span>دخول الكوتش بجوجل</span></button>
            </div>
            <div class="flex items-center gap-3 my-4 text-[11px] text-gray-500"><span class="flex-1 h-px bg-yellow-500/20"></span><span>أو باليوزر نيم / الإيميل</span><span class="flex-1 h-px bg-yellow-500/20"></span></div>
            ${authMode === "login" ? `
              <form onsubmit="doLogin(event)" class="space-y-4">
                <input id="lEmail" required placeholder="Email or Username" class="w-full bg-black border border-yellow-500/30 rounded-xl px-4 py-2.5 text-sm text-white" />
                <input id="lPass" type="password" required placeholder="Password" class="w-full bg-black border border-yellow-500/30 rounded-xl px-4 py-2.5 text-sm text-white" />
                <button class="w-full py-3 rounded-xl text-sm gold-btn">تسجيل الدخول</button>
              </form>
            ` : `
              <form onsubmit="doSignup(event)" class="space-y-3">
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" onclick="signupRole='student'; render();" class="py-2 rounded-xl text-xs font-bold border ${signupRole==='student'?'border-yellow-400 text-yellow-300 bg-yellow-500/10':'border-zinc-800 text-gray-400'}">طالب</button>
                  <button type="button" onclick="signupRole='coach'; render();" class="py-2 rounded-xl text-xs font-bold border ${signupRole==='coach'?'border-yellow-400 text-yellow-300 bg-yellow-500/10':'border-zinc-800 text-gray-400'}">كوتش</button>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <input id="sName" required placeholder="Full Name" class="bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" />
                  ${signupRole === "student" ? `<input id="sUser" required placeholder="Username (e.g. ali_chess)" class="bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" />` : `<input id="sUser" placeholder="Username (optional)" class="bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" />`}
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <input id="sEmail" type="email" ${signupRole === "coach" ? "required" : ""} placeholder="${signupRole === "coach" ? "Email (required)" : "Email"}" class="bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" />
                  <input id="sPass" type="password" required placeholder="Password" class="bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                ${signupRole === "student" ? `
                  <select id="sLvl" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-xs text-yellow-300">
                    <option value="1">Step 1</option><option value="2">Step 2</option><option value="3">Step 3</option><option value="4">Step 4</option><option value="5">Step 5</option><option value="6">Step 6</option>
                  </select>
                ` : `
                  <input id="sCode" required autocomplete="off" autocapitalize="characters" placeholder="كود دعوة الكوتش (من الأدمن)" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-xs text-white" />
                `}
                <button class="w-full py-3 rounded-xl text-sm gold-btn">إنشاء الحساب</button>
              </form>
            `}
          </div>
        </div>
      `;
    }

    const G_ICON = `<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>`;
    let gBusy = false;
    async function googleLogin(role) {
      if (gBusy) return;
      if (!window.fbGoogleLogin) return toast("الاتصال بالسيرفر لسه ما كملش، جرّب بعد ثواني");
      gBusy = true; try { await window.fbGoogleLogin(role); } finally { gBusy = false; }
    }
    function linkGoogle() { if (window.fbLinkGoogle) window.fbLinkGoogle(); }
    function focusLogin() { authMode = "login"; render(); setTimeout(() => { const el = document.getElementById("lEmail"); if (el) el.focus(); }, 0); }
    function randomPass() {
      const al = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const r = crypto.getRandomValues(new Uint8Array(8)); let s = "";
      for (const b of r) s += al[b % al.length];
      return s;
    }
    async function doLogin(ev) {
      ev.preventDefault();
      if (!window.fbLogin) return toast("الاتصال بالسيرفر لسه ما كملش، جرّب بعد ثواني");
      const q = document.getElementById("lEmail").value.trim();
      const p = document.getElementById("lPass").value;
      const btn = ev.submitter; if (btn) btn.disabled = true;
      const r = await window.fbLogin(q, p);
      if (btn) btn.disabled = false;
      if (!r.ok) return toast(r.code === "auth/too-many-requests" ? "محاولات كتير، استنى شوية وجرّب تاني" : (r.code === "auth/network-request-failed" ? "مفيش اتصال بالإنترنت" : "اسم المستخدم أو كلمة السر غير صحيحة"));
      parentStu = null; tab = "home";
    }
    async function doSignup(ev) {
      ev.preventDefault();
      if (!ALLOW_SELF_SIGNUP) return;
      if (!window.fbSignup) return toast("الاتصال بالسيرفر لسه ما كملش، جرّب بعد ثواني");
      const clean = s => String(s || "").trim().replace(/[<>"'`]/g, "");
      const name = clean(document.getElementById("sName").value);
      const username = clean(document.getElementById("sUser").value).toLowerCase().replace(/\s+/g, "_");
      const email = clean(document.getElementById("sEmail").value).toLowerCase();
      const pass = document.getElementById("sPass").value;
      if (signupRole === "coach") {
        if (!window.fbCoachSignup) return toast("الاتصال بالسيرفر لسه ما كملش، جرّب بعد ثواني");
        const code = document.getElementById("sCode").value.trim();
        if (!name || !email) return toast("اكتب الاسم والإيميل");
        if (pass.length < 6) return toast("كلمة السر لازم تكون 6 حروف على الأقل");
        const b2 = ev.submitter; if (b2) b2.disabled = true;
        const rc = await window.fbCoachSignup({ name, username: username || email.split("@")[0].replace(/[^a-z0-9_]/g, ""), email, pass, code });
        if (b2) b2.disabled = false;
        if (!rc.ok) return toast(rc.code === "auth/email-already-in-use" ? "الإيميل ده مسجّل قبل كده" : (rc.code === "auth/weak-password" ? "كلمة السر ضعيفة" : (rc.code === "bad-invite" || rc.code === "permission-denied" || rc.code === "not-found" ? "كود الدعوة غير صحيح أو مستخدم قبل كده" : "تعذّر إنشاء حساب الكوتش")));
        signupRole = "student"; tab = "home"; return toast("تم إنشاء حساب الكوتش!");
      }
      const level = Number(document.getElementById("sLvl").value) || 1;
      if (!name || !username) return toast("اكتب الاسم واسم المستخدم");
      if (pass.length < 6) return toast("كلمة السر لازم تكون 6 حروف على الأقل");
      const btn = ev.submitter; if (btn) btn.disabled = true;
      const r = await window.fbSignup({ name, username, email, pass, level });
      if (btn) btn.disabled = false;
      if (!r.ok) return toast(r.code === "auth/email-already-in-use" ? "اسم المستخدم ده مستخدم قبل كده" : (r.code === "auth/weak-password" ? "كلمة السر ضعيفة" : "تعذّر إنشاء الحساب"));
      tab = "home"; toast("تم إنشاء حسابك!");
    }
    function renderStudentHome(stu) {
      const s = calcStats(stu);
      const puz = PUZZLES[stu.level] || PUZZLES[1];
      const done = (stu.puzDone || {})[stu.level];
      return `
        <div class="space-y-6">
          <div class="gold-card rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span class="px-2.5 py-1 rounded-full text-xs gold-btn">STEP ${stu.level} STUDENT</span>
              <h2 class="font-display font-bold text-2xl gold-gradient-text mt-2">Welcome, ${esc(stu.name)} (@${esc(stu.username)})</h2>
              <p class="text-xs text-gray-400 mt-1">حضرت ${s.attC}/${s.total} درس في Step ${stu.level} • متبقي ${s.rem} درس للامتحان</p>
            </div>
          </div>

          <div class="grid gap-6">
            <!-- 2. Next Lesson Up -->
            <div class="gold-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-center mb-3">
                  <span class="text-xs font-bold text-emerald-300">الدرس اللي عليه الدور (Next Lesson)</span>
                  <span class="text-xs text-gray-400">${s.attP}% مكتمل</span>
                </div>
                ${s.nextLesson ? `
                  <div onclick="switchTab('lessons')" class="cursor-pointer p-5 rounded-2xl bg-black/80 border border-yellow-500/40 hover:border-yellow-400 transition">
                    <div class="text-xs text-yellow-400">Lesson #${s.nextIdx + 1} • Step ${stu.level}</div>
                    <h3 class="font-display font-bold text-xl text-white mt-1 flex justify-between"><span>${s.nextLesson.t}</span><span>→</span></h3>
                    <p class="text-xs text-gray-400 mt-2">اضغط هنا للانتقال تلقائياً لصفحة دروس مستواك (Step ${stu.level} فقط).</p>
                  </div>
                ` : `
                  <div class="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center">
                    <h3 class="font-bold text-emerald-300">أتممت كل دروس Step ${stu.level}!</h3>
                  </div>
                `}
              </div>
              <div class="mt-4 pt-3 border-t border-yellow-500/20 flex justify-between items-center">
                <span class="text-xs text-gray-400">اختبار الترقية للمستوى التالي:</span>
                <button onclick="openExamModal(${stu.level})" class="px-4 py-2 rounded-xl text-xs gold-btn">بدء اختبار Step ${stu.level}</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function solvePuzzle(i, ans) {
      const u = currUser();
      u.puzDone = u.puzDone || {};
      if (u.puzDone[u.level]) return toast("اللغز مقفول بالفعل");
      const ok = i === ans;
      recordAttempt("daily", todayISO() + "-L" + u.level, ok, s => {
        s.puz = s.puz || { t: 0, c: 0 }; s.puz.t = (s.puz.t || 0) + 1; if (ok) s.puz.c = (s.puz.c || 0) + 1;
        s.puzDone = s.puzDone || {}; s.puzDone[s.level] = { i, ok };
        if (typeof markActiveDay === "function") markActiveDay(s);   // اللغز اليومي بيحسب في سلسلة أيام التمرين
      }).then(r => { if (!r.ok && r.code === "permission-denied") { toast("لغز النهاردة اتحسب قبل كده"); render(); } });
      toast(ok ? "إجابة صحيحة! أحسنت يا بطل" : "إجابة خاطئة — تم قفل اللغز");
      render();
    }

    function renderCoachHome(c) {
      return `
        <div class="space-y-6">
          ${c.isAdmin ? adminToolsBox() : ''}
          <div class="gold-card rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4">
            <div>
              <span class="px-2.5 py-1 rounded-full text-xs gold-btn">حساب المدرب</span>
              <h2 class="font-display font-bold text-2xl gold-gradient-text mt-2">Welcome, ${esc(c.name)}</h2>
              <p class="text-xs text-gray-400">يمكنك استعراض جميع الـ 6 Steps ومتابعة حضور وواجبات ومجموعات الطلاب.</p>
            </div>
            <div class="flex gap-2">
              <button onclick="switchTab('lessons')" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-black border border-yellow-500/40 text-yellow-300">كل الدروس (Steps 1-6)</button>
              <button onclick="switchTab('tracker')" class="px-4 py-2.5 rounded-xl text-xs gold-btn">متابعة الطلاب والجروبات</button>
              <button onclick="switchTab('attendance')" class="px-4 py-2.5 rounded-xl text-xs gold-btn">تسجيل الحضور</button>
            </div>
          </div>
          ${typeof todayHomeCard === "function" ? todayHomeCard(c) : ''}
        </div>
      `;
    }

    function renderLessonsView(u) {
      const list = u.role === "coach" ? STEPS : STEPS.filter(s => s.step === Number(u.level));
      return `
        <div class="space-y-4">
          <div class="gold-card rounded-2xl p-5">
            <h2 class="font-display font-bold text-xl gold-gradient-text">${u.role==='coach'?'جميع المستويات للمدرب (Steps 1 – 6)':'دروس مستواك الحالي فقط — Step '+u.level}</h2>
            <p class="text-xs text-gray-400 mt-1">${u.role==='coach'?'اضغط على أي Step لعرض قائمة دروسها تحت بعضها.':'ممنوع ظهور أي مستوى آخر غير مستواك الحالي.'}</p>
          </div>
          ${list.map(st => {
            const isOpen = openSteps[st.step] !== false;
            return `
              <div class="gold-card rounded-2xl overflow-hidden">
                <button onclick="openSteps[${st.step}]=!openSteps[${st.step}]; render();" class="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-yellow-500/5">
                  <div>
                    <h3 class="font-display font-bold text-lg text-yellow-300">${st.title} <span class="text-xs text-gray-400 font-sans">(${st.lessons.length} Lessons)</span></h3>
                    <p class="text-xs text-gray-400">${st.sub}</p>
                  </div>
                  <span class="text-yellow-400 text-xs font-bold">${isOpen ? '▲ إخفاء القائمة' : '▼ عرض الدروس'}</span>
                </button>
                ${isOpen ? `
                  <div class="divide-y divide-yellow-500/15 border-t border-yellow-500/20 bg-black/60">
                    ${st.lessons.length === 0 ? `<div class="p-5 text-xs text-gray-500 text-center">Coming Soon</div>` : st.lessons.map((les, idx) => `
                      <div class="px-6 py-3 flex flex-wrap justify-between items-center gap-2 hover:bg-yellow-500/5">
                        <a href="${les.l[0][1]}" target="_blank" class="text-sm font-semibold text-white hover:text-yellow-300">${idx + 1}.${les.t} ↗</a>
                        <div class="flex flex-wrap gap-2">
                          ${les.l.map(lk => `<a href="${lk[1]}" target="_blank" class="px-3 py-1 rounded-lg text-xs bg-zinc-900 border border-yellow-500/35 text-yellow-300 hover:bg-yellow-500 hover:text-black">${lk[0]} ↗</a>`).join('')}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    function coachSearchStudent(val) { searchQ = val; go("tracker"); render(); }

    function renderTrackerView() {
      const students = db.users.filter(u => u.role === "student");
      const q = searchQ.toLowerCase();
      const filtered = students.filter(s => (grpFilter === "ALL" || s.group === grpFilter) && (!q || String(s.name || "").toLowerCase().includes(q) || String(s.username || "").toLowerCase().includes(q)));
      const sel = students.find(s => s.id === selStuId) || filtered[0] || null;
      return `
        <div class="space-y-5">
          <div class="gold-card rounded-2xl p-5 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 class="font-display font-bold text-xl gold-gradient-text">متابعة الطلاب والمجموعات</h2>
              <p class="text-xs text-gray-400">علم (✓) أمام الدرس الذي حضره الطالب والواجب الذي حله واكتب ملاحظة سرية لولي الأمر.</p>
            </div>
            <button onclick="openAddStu()" class="px-3 py-1.5 rounded-xl text-xs gold-btn">إضافة طالب جديد</button>
            <form onsubmit="addGroup(event)" class="flex gap-2">
              <input id="newGrpInp" placeholder="+ اسم جروب جديد..." class="bg-black border border-yellow-500/40 rounded-xl px-3 py-1.5 text-xs text-white" />
              <button class="px-3 py-1.5 rounded-xl text-xs gold-btn">إضافة جروب</button>
            </form>
          </div>

          <div class="flex flex-wrap gap-2">
            <button onclick="grpFilter='ALL'; render();" class="px-3 py-1.5 rounded-xl text-xs font-bold ${grpFilter==='ALL'?'gold-btn':'bg-zinc-900 text-gray-300'}">كل الجروبات (${students.length})</button>
            ${db.groups.map(g => `<button onclick="grpFilter='${g}'; render();" class="px-3 py-1.5 rounded-xl text-xs font-bold ${grpFilter===g?'gold-btn':'bg-zinc-900 text-gray-300 border border-yellow-500/20'}">${g}</button>`).join('')}
          </div>

          <div class="grid md:grid-cols-3 gap-6">
            <div class="gold-card rounded-2xl p-4 space-y-2">
              ${filtered.map(s => {
                const st = calcStats(s);
                return `
                  <div onclick="selStuId='${s.id}'; render();" class="cursor-pointer p-3 rounded-xl border ${sel && sel.id===s.id ? 'border-yellow-400 bg-yellow-500/15' : 'border-yellow-500/15 bg-black/70'}">
                    <div class="flex justify-between font-bold text-xs text-white"><span>${esc(s.name)} (@${esc(s.username)})</span><span class="text-yellow-300">Step ${s.level}</span></div>
                    <div class="text-[11px] text-gray-400 mt-1">حضر: ${st.attC}/${st.total} | الواجب: ${st.hwC}/${st.total}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="md:col-span-2 gold-card rounded-2xl p-5">
              ${!sel ? `<p class="text-xs text-gray-400">اختر طالباً</p>` : (() => {
                const st = calcStats(sel);
                return `
                  <div class="space-y-4">
                    <div class="flex flex-wrap justify-between items-center gap-2 border-b border-yellow-500/20 pb-3">
                      <div>
                        <h3 class="font-bold text-lg text-white">${esc(sel.name)} <span class="text-xs px-2 py-0.5 rounded border ${st.evalCls}">${st.evalText} (${st.overall}%)</span></h3>
                        <p class="text-xs text-gray-400">متبقي ${st.rem} درس لإنهاء Step ${sel.level}</p>
                      </div>
                      <button onclick="resetPuz('${sel.id}')" class="px-3 py-1.5 rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">↺ إعادة فتح اللغز</button>
                      <select onchange="selLvl('${sel.id}', this.value)" class="bg-black border border-yellow-500/40 rounded-xl px-3 py-1.5 text-xs text-yellow-300">
                        ${[1,2,3,4,5,6].map(l => `<option value="${l}" ${Number(sel.level)===l?'selected':''}>Step ${l}</option>`).join('')}
                      </select>
                    </div>
                    <div class="flex gap-2">
                      <input id="noteInp" value="${esc(sel.note||'')}" class="flex-1 bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" placeholder="ملاحظة سرية لولي الأمر..." />
                      <button onclick="saveNote('${sel.id}')" class="px-4 py-2 rounded-xl text-xs gold-btn">حفظ لولي الأمر</button>
                    </div>
                    <div class="divide-y divide-yellow-500/15 border border-yellow-500/20 rounded-xl max-h-80 overflow-y-auto bg-black/60">
                      ${st.st.lessons.map((les, i) => {
                        const k = sel.level + "-" + i;
                        const a = !!(sel.att && sel.att[k]);
                        const h = !!(sel.hw && sel.hw[k]);
                        return `
                          <div class="px-4 py-2.5 flex justify-between items-center text-xs">
                            <span class="text-white font-medium">${i+1}. ${les.t}</span>
                            <div class="flex gap-4">
                              <label class="flex items-center gap-1 cursor-pointer ${a?'text-emerald-300 font-bold':'text-gray-400'}">
                                <input type="checkbox" ${a?'checked':''} onchange="togCheck('${sel.id}','${k}','att')" /> حضر
                              </label>
                              <label class="flex items-center gap-1 cursor-pointer ${h?'text-yellow-300 font-bold':'text-gray-400'}">
                                <input type="checkbox" ${h?'checked':''} onchange="togCheck('${sel.id}','${k}','hw')" /> الواجب
                              </label>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              })()}
            </div>
          </div>
        </div>
      `;
    }

    function resetPuz(id) {
      const s = db.users.find(u => u.id === id); if (!s) return;
      if (s.puzDone) delete s.puzDone[s.level];
      // لازم نمسح محاولة النهاردة من الدفتر كمان، وإلا القواعد هترفض الحل التاني
      if (window.fbDeleteAttempt) window.fbDeleteAttempt(id + "_daily_" + attemptKey(todayISO() + "-L" + s.level));
      save(); render(); toast("تم إعادة فتح اللغز");
    }
    function addGroup(e) { e.preventDefault(); const v = document.getElementById("newGrpInp").value.trim(); if (v) { db.groups.push(v); save(); render(); } }
    function togCheck(id, k, type) { const s = db.users.find(u => u.id === id); s[type] = s[type] || {}; s[type][k] = !s[type][k]; save(); render(); }
    function selLvl(id, l) { const s = db.users.find(u => u.id === id); s.level = Number(l); save(); render(); }
    function saveNote(id) { const s = db.users.find(u => u.id === id); s.note = document.getElementById("noteInp").value; save(); toast("تم حفظ الملاحظة السرية لولي الأمر"); }

    function renderParentView() {
      const pq = parentQ.trim().toLowerCase();
      const stu = !isCoach() ? parentStu : (pq ? db.users.find(u => u.role === "student" && (String(u.username || "").toLowerCase() === pq || String(u.name || "").toLowerCase().includes(pq))) : null);
      return `
        <div class="max-w-4xl mx-auto space-y-5">
          <div class="gold-card rounded-2xl p-6">
            <h2 class="font-display font-bold text-xl gold-gradient-text">بوابة متابعة ولي الأمر (Parent Dashboard)</h2>
            ${isCoach() ? `<p class="text-xs text-gray-400 mt-1">اكتب Username الطالب أو اسمه لمعاينة لوحة ولي الأمر</p>
            <input id="parentSearchInp" value="${esc(parentQ)}" oninput="parentQ=this.value; render();" placeholder="ابحث باسم الطالب..." class="mt-3 w-full bg-black border border-yellow-500/40 rounded-xl px-4 py-2.5 text-sm text-white" />` : `<p class="text-xs text-gray-400 mt-1">اكتب كود المتابعة اللي استلمته من الأكاديمية</p>
            <div class="mt-3 flex gap-2"><input id="parentCodeInp" value="${esc(parentQ)}" oninput="parentQ=this.value" onkeydown="if(event.key==='Enter')parentLookup()" placeholder="كود ولي الأمر" autocapitalize="characters" autocomplete="off" class="flex-1 bg-black border border-yellow-500/40 rounded-xl px-4 py-2.5 text-sm text-white text-center tracking-widest" /><button onclick="parentLookup()" class="px-5 py-2.5 rounded-xl text-xs gold-btn">عرض</button></div>`}
          </div>
          ${!stu ? `<div class="gold-card rounded-2xl p-6 text-center text-xs text-gray-400">${isCoach() ? 'لا يوجد طالب بهذا الاسم.' : 'اكتب كود المتابعة لعرض تقدّم الطالب.'}</div>` : (() => {
            const s = calcStats(stu);
            return `
              <div class="gold-card rounded-2xl p-6 space-y-5">
                <div class="flex flex-wrap justify-between items-center gap-4 border-b border-yellow-500/20 pb-4">
                  <div>
                    <span class="text-xs text-yellow-400 font-bold">STEP ${stu.level}${stu.group ? ' • ' + esc(stu.group) : ''}</span>
                    <h3 class="font-display font-bold text-2xl text-white">${esc(stu.name)} (@${esc(stu.username)})</h3>
                  </div>
                  <div class="px-5 py-3 rounded-2xl border ${s.evalCls}">
                    <div class="text-[11px]">التقييم التلقائي لمستوى الطالب</div>
                    <div class="text-lg font-extrabold">${s.evalText} (${s.overall}%)</div>
                  </div>
                </div>
                <div class="grid sm:grid-cols-3 gap-4 text-center">
                  <div class="p-4 rounded-xl bg-black/80 border border-yellow-500/20">
                    <div class="text-xs text-gray-400">الدروس التي حضرها</div>
                    <div class="text-xl font-bold text-emerald-400 mt-1">${s.attC} /${s.total}</div>
                    <div class="text-[11px] text-gray-500">متبقي ${s.rem} دروس</div>
                  </div>
                  <div class="p-4 rounded-xl bg-black/80 border border-yellow-500/20">
                    <div class="text-xs text-gray-400">الواجبات المكتملة</div>
                    <div class="text-xl font-bold text-yellow-400 mt-1">${s.hwC} / ${s.total} (${s.hwP}%)</div>
                  </div>
                  <div class="p-4 rounded-xl bg-black/80 border border-yellow-500/20">
                    <div class="text-xs text-gray-400">دقة الألغاز اليومية</div>
                    <div class="text-xl font-bold text-sky-400 mt-1">${s.puzP}%</div>
                  </div>
                </div>
                <div class="p-4 rounded-xl bg-black/90 border border-yellow-500/40 flex justify-between items-center">
                  <div><b class="text-xs text-yellow-400">ملاحظة المدرب لولي الأمر:</b><p class="text-sm text-white mt-1">${esc(stu.note || 'لا توجد ملاحظات حالياً.')}</p></div>
                </div>
              </div>
            `;
          })()}
        </div>
      `;
    }

    async function parentLookup() {
      if (parentBusy) return;
      const code = String(parentQ || "").trim();
      if (!code) return toast("اكتب كود المتابعة الأول");
      if (!window.fbParentLookup) return toast("الاتصال بالسيرفر لسه ما كملش، جرّب بعد ثواني");
      parentBusy = true;
      const r = await window.fbParentLookup(code);
      parentBusy = false;
      if (!r.ok) { parentStu = null; render(); return toast("الكود غير صحيح أو انتهت صلاحيته"); }
      parentStu = r.stu; render();
    }
    async function genParentCode(id) {
      if (!window.fbGenParentCode) return toast("الاتصال بالسيرفر لسه ما كملش");
      const s = db.users.find(u => u.id === id);
      if (s && s.parentCode && !confirm(trText("تجديد الكود هيلغي الكود القديم وأي جهاز مربوط بيه. متأكد؟"))) return;
      const c = await window.fbGenParentCode(id);
      render(); toast(c ? "تم إنشاء كود ولي الأمر" : "تعذّر إنشاء الكود");
    }
    async function changeMyPassword() {
      if (!window.fbChangePassword) return;
      if (window.fbAuthInfo && !window.fbAuthInfo().password) return toast("حسابك بيدخل بجوجل — مفيش كلمة سر تتغير");
      const o = prompt(trText("كلمة السر الحالية")); if (o == null) return;
      const n = prompt(trText("كلمة السر الجديدة (6 حروف على الأقل)")); if (n == null) return;
      if (n.length < 6) return toast("كلمة السر لازم تكون 6 حروف على الأقل");
      const r = await window.fbChangePassword(o, n);
      toast(r.ok ? "تم تغيير كلمة السر" : "كلمة السر الحالية غير صحيحة");
    }
    function adminToolsBox() {
      return `<div class="gold-card rounded-2xl p-4 flex flex-wrap items-center gap-3 text-xs">
        <span class="text-yellow-300 font-bold">أدوات الإدارة</span>
        <button onclick="createInvite()" class="px-3 py-2 rounded-xl bg-zinc-900 border border-yellow-500/40 text-yellow-300">كود دعوة كوتش جديد</button>
        <button onclick="createInvite('admin')" class="px-3 py-2 rounded-xl bg-zinc-900 border border-red-500/50 text-red-300">كود دعوة أدمن جديد</button>
      </div>`;
    }
    async function createInvite(role) {
      if (!window.fbCreateInvite) return toast("الاتصال بالسيرفر لسه ما كملش");
      const isAdm = role === "admin";
      if (isAdm && !confirm(trText("الأدمن بيشوف الحسابات والداشبورد المالي ويقدر يطلّع أكواد كوتش وأدمن. متأكد إنك عايز تعمل كود أدمن؟"))) return;
      const c = await window.fbCreateInvite(isAdm ? "admin" : "coach");
      if (!c) return toast("تعذّر إنشاء الكود");
      try { await navigator.clipboard.writeText(c); } catch (_) {}
      alert(trText(isAdm ? "كود دعوة الأدمن (يُستخدم مرة واحدة):" : "كود دعوة الكوتش (يُستخدم مرة واحدة):") + "\n\n" + c + "\n\n" + trText("اتنسخ تلقائياً. ابعته للشخص ده يدخل بـ «دخول الكوتش بجوجل» ويكتب الكود."));
    }
    function openExamModal(lvl) {
      document.getElementById("examModal").classList.remove("hidden");
      document.getElementById("examBody").innerHTML = `
        <p class="text-xs text-gray-300 mb-3">اختبار نهاية Step ${lvl}: هل أنت جاهز للترقية إلى Step ${lvl+1}؟</p>
        <button onclick="passExam()" class="w-full py-2.5 rounded-xl text-xs gold-btn">إتمام الاختبار بنجاح والترقية إلى Step ${lvl+1}</button>
      `;
    }
    function closeExamModal() { document.getElementById("examModal").classList.add("hidden"); }
    function passExam() {
      const u = currUser();
      if (u && u.role === "student") { u.level = Math.min(6, Number(u.level) + 1); save(); closeExamModal(); render(); toast("مبروك! تمت ترقيتك إلى Step " + u.level); }
    }

    // ================= ECA ADDITIONS: students, attendance, backup, theme, PWA =================

    // أيقونات خطية بسيطة (بدل الإيموجي) — ICON("name", "classes")
    const ICONS = {
      play: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
      target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
      pawn: '<circle cx="12" cy="6.5" r="2.8"/><path d="M10 10h4l1.2 6H8.8L10 10zM7 20h10l-1-4H8l-1 4z"/>',
      eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
      analysis: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      award: '<circle cx="12" cy="9" r="6"/><path d="M8.6 13.9 7 22l5-3 5 3-1.6-8.1"/>',
      flame: '<path d="M12 22c4 0 7-2.8 7-6.8 0-3.9-2.7-6.2-4.5-8.7-.6 2.2-1.8 3.4-3.2 3.9.4-3.2-.8-6.1-3.3-8.4C8 6 5 9.3 5 14.8 5 19 8 22 12 22z"/>',
      trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
      lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
      offline: '<path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01M3 3l18 18"/>',
      certificate: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 9h10M7 13h5"/><circle cx="17" cy="17" r="3"/>',
      chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/>',
      spinner: '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>'
    };
    function ICON(n, cls) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="${cls || "w-5 h-5"}" aria-hidden="true">${ICONS[n] || ""}</svg>`; }
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
    function todayISO() { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
    function stuMode(s) { return s.mode === "online" ? "online" : "offline"; }
    function isCoach() { const u = currUser(); return !!(u && u.role === "coach"); }
    function waLink(num) { let d = String(num || "").replace(/\D/g, ""); if (!d) return ""; if (d.startsWith("00")) d = d.slice(2); else if (d.startsWith("0")) d = "20" + d.slice(1); return "https://wa.me/" + d; }
    function dl(name, text, type) { const b = new Blob([text], { type }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); }
    function keepScroll(fn) { const y = window.scrollY; fn(); window.scrollTo(0, y); }

    // ---------- Attendance ----------
    let attDate = todayISO(), attMode = "offline", attQ = "", attMonth = todayISO().slice(0, 7);
    const ATT_LABEL = { p: "حاضر", l: "متأخر", a: "غايب" };
    function stuAttStats(id, month) {
      let p = 0, l = 0, a = 0;
      for (const d in db.attendance) {
        if (month && !d.startsWith(month)) continue;
        const v = db.attendance[d][id];
        if (v === "p") p++; else if (v === "l") l++; else if (v === "a") a++;
      }
      const t = p + l + a;
      return { p, l, a, t, rate: t ? Math.round(((p + l) / t) * 100) : null };
    }
    function setAtt(id, st) {
      if (!isCoach()) return;
      const r = db.attendance[attDate] = db.attendance[attDate] || {};
      if (r[id] === st) delete r[id]; else r[id] = st;
      if (!Object.keys(r).length) delete db.attendance[attDate];
      save(); keepScroll(render);
    }
    function markAll(st) {
      if (!isCoach()) return;
      const r = db.attendance[attDate] = db.attendance[attDate] || {};
      db.users.filter(u => u.role === "student" && stuMode(u) === attMode).forEach(s => { if (st) r[s.id] = st; else delete r[s.id]; });
      if (!Object.keys(r).length) delete db.attendance[attDate];
      save(); keepScroll(render);
    }
    function shiftDate(n) {
      const d = new Date(attDate + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n);
      attDate = d.toISOString().slice(0, 10); render();
    }
    function setAttDate(v) { if (/^\d{4}-\d{2}-\d{2}$/.test(v)) { attDate = v; render(); } }
    function setStuMode(id, m) {
      if (!isCoach()) return;
      const s = db.users.find(u => u.id === id); if (!s) return;
      s.mode = m; save(); keepScroll(render);
      toast(m === "online" ? "تم نقل الطالب إلى الأونلاين" : "تم نقل الطالب إلى الأوفلاين");
    }
    function renderAttendanceView() {
      const all = db.users.filter(u => u.role === "student");
      const inMode = all.filter(s => stuMode(s) === attMode);
      const q = attQ.toLowerCase();
      const list = inMode.filter(s => !q || String(s.name || "").toLowerCase().includes(q) || String(s.username || "").toLowerCase().includes(q));
      const rec = db.attendance[attDate] || {};
      const cnt = { p: 0, l: 0, a: 0 };
      inMode.forEach(s => { if (rec[s.id]) cnt[rec[s.id]]++; });
      const un = inMode.length - cnt.p - cnt.l - cnt.a;
      const nOff = all.filter(s => stuMode(s) === "offline").length, nOn = all.length - nOff;
      const dateLabel = new Date(attDate + "T12:00:00Z").toLocaleDateString(lang === "en" ? "en-GB" : "ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
      const pill = (on, extra) => `tap px-3.5 rounded-xl text-xs font-bold ${on ? 'gold-btn' : 'bg-zinc-900 text-gray-300 border border-yellow-500/25'} ${extra || ''}`;
      return `
        <div class="space-y-5">
          <div class="gold-card rounded-2xl p-5 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 class="font-display font-bold text-xl gold-gradient-text">تسجيل الحضور</h2>
              <p class="text-xs text-gray-400">سجّل حضور الطلاب الأونلاين والأوفلاين كل واحد في قسمه.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="openAddStu()" class="tap px-4 rounded-xl text-xs gold-btn">إضافة طالب جديد</button>
              <button onclick="exportBackup()" class="tap px-3 rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">نسخة احتياطية</button>
              <button onclick="document.getElementById('bkFile').click()" class="tap px-3 rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">استرجاع نسخة</button>
              <input id="bkFile" type="file" accept=".json,application/json" class="hidden" onchange="importBackup(this)" />
            </div>
          </div>

          <div class="gold-card rounded-2xl p-4 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap gap-2">
                <button onclick="attMode='offline'; render();" class="${pill(attMode === 'offline')}">طلبة الأوفلاين (${nOff})</button>
                <button onclick="attMode='online'; render();" class="${pill(attMode === 'online')}">طلبة الأونلاين (${nOn})</button>
              </div>
              <input id="attQInp" value="${esc(attQ)}" oninput="attQ=this.value; render();" placeholder="ابحث باسم الطالب..." class="tap flex-1 min-w-[160px] max-w-xs bg-black border border-yellow-500/40 rounded-xl px-3 py-1.5 text-xs text-white" />
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button onclick="shiftDate(-1)" class="${pill(false)}">اليوم السابق</button>
              <input type="date" value="${attDate}" onchange="setAttDate(this.value)" class="tap bg-black border border-yellow-500/40 rounded-xl px-3 py-1.5 text-xs text-white" />
              <button onclick="shiftDate(1)" class="${pill(false)}">اليوم التالي</button>
              <button onclick="attDate=todayISO(); render();" class="${pill(attDate === todayISO())}">النهاردة</button>
              <span class="text-xs text-yellow-300 font-bold">${dateLabel}</span>
            </div>
            <div class="grid grid-cols-4 gap-2 text-center">
              <div class="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40"><div class="text-lg font-bold text-emerald-300">${cnt.p}</div><div class="text-[11px] text-gray-400">حاضر</div></div>
              <div class="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40"><div class="text-lg font-bold text-amber-300">${cnt.l}</div><div class="text-[11px] text-gray-400">متأخر</div></div>
              <div class="p-2 rounded-xl bg-red-500/10 border border-red-500/30"><div class="text-lg font-bold text-red-300">${cnt.a}</div><div class="text-[11px] text-gray-400">غايب</div></div>
              <div class="p-2 rounded-xl bg-black/70 border border-yellow-500/20"><div class="text-lg font-bold text-white">${un}</div><div class="text-[11px] text-gray-400">لم يُسجَّل</div></div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="markAll('p')" class="tap px-3 rounded-xl text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">تحديد الكل حاضر</button>
              <button onclick="markAll('')" class="tap px-3 rounded-xl text-xs bg-zinc-900 text-gray-300 border border-yellow-500/20">مسح تسجيل اليوم</button>
            </div>
          </div>

          <div class="space-y-2">
            ${list.length ? list.map(s => {
              const cur = rec[s.id] || "", ss = stuAttStats(s.id), wa = waLink(s.parentPhone || s.phone);
              const b = (st, txt) => `<button onclick="setAtt('${s.id}','${st}')" class="att-btn att-${st} ${cur === st ? 'on' : ''}">${txt}</button>`;
              return `
                <div class="gold-card rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                  <div class="min-w-0 flex-1" style="min-width:150px">
                    <div class="font-bold text-sm text-white">${esc(s.name)} <span class="text-[11px] font-normal text-gray-400">@${esc(s.username)}</span></div>
                    <div class="text-[11px] text-gray-400">Step ${esc(s.level)} • ${esc(s.group || '')} • ${ss.rate === null ? 'لا يوجد سجل بعد' : 'نسبة الحضور ' + ss.rate + '% (' + ss.t + ' حصة)'}</div>
                  </div>
                  <div class="flex gap-1.5">${b('p', '✓ حاضر')}${b('l', 'متأخر')}${b('a', '✗ غايب')}</div>
                  <div class="flex gap-1.5">
                    ${wa ? `<a href="${wa}" target="_blank" rel="noopener" class="tap inline-flex items-center px-3 rounded-xl text-xs bg-zinc-900 border border-emerald-500/40 text-emerald-300" title="WhatsApp" aria-label="WhatsApp">${ICON("chat", "w-4 h-4")}</a>` : ''}
                    <button onclick="setStuMode('${s.id}','${attMode === 'online' ? 'offline' : 'online'}')" class="tap px-3 rounded-xl text-[11px] bg-zinc-900 border border-yellow-500/25 text-gray-300">${attMode === 'online' ? 'نقل للأوفلاين' : 'نقل للأونلاين'}</button>
                    <button onclick="openAddStu('${s.id}')" class="tap px-3 rounded-xl text-xs bg-zinc-900 border border-yellow-500/25 text-yellow-300" title="Edit">تعديل</button>
                  </div>
                </div>`;
            }).join('') : `<div class="gold-card rounded-xl p-5 text-center text-xs text-gray-400">${all.length && !inMode.length ? 'لا يوجد طلاب في هذا القسم بعد. أضف طالباً جديداً أو انقل طالباً من القسم الآخر.' : (inMode.length ? 'لا توجد نتائج لهذا البحث.' : 'لا يوجد طلاب بعد. اضغط «إضافة طالب جديد».')}</div>`}
          </div>

          <div class="gold-card rounded-2xl p-4 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h3 class="font-display font-bold text-lg text-yellow-400">تقرير الشهر — ${attMode === 'online' ? 'طلبة الأونلاين' : 'طلبة الأوفلاين'}</h3>
              <div class="flex flex-wrap gap-2 items-center">
                <input type="month" value="${attMonth}" onchange="if(this.value){attMonth=this.value; render();}" class="tap bg-black border border-yellow-500/40 rounded-xl px-3 py-1.5 text-xs text-white" />
                <button onclick="exportAttCSV()" class="tap px-3 rounded-xl text-xs gold-btn">⬇ تصدير CSV</button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-white">
                <thead><tr class="text-yellow-300 border-b border-yellow-500/25"><th class="text-left py-2 pr-2">اسم الطالب</th><th class="py-2 px-2">حاضر</th><th class="py-2 px-2">متأخر</th><th class="py-2 px-2">غايب</th><th class="py-2 px-2">نسبة الحضور</th></tr></thead>
                <tbody>
                  ${inMode.length ? inMode.map(s => { const m = stuAttStats(s.id, attMonth); return `<tr class="border-b border-yellow-500/10"><td class="py-2 pr-2 font-bold">${esc(s.name)}</td><td class="text-center text-emerald-300">${m.p}</td><td class="text-center text-amber-300">${m.l}</td><td class="text-center text-red-300">${m.a}</td><td class="text-center">${m.rate === null ? '—' : m.rate + '%'}</td></tr>`; }).join('') : `<tr><td colspan="5" class="py-3 text-center text-gray-400">لا يوجد طلاب في هذا القسم بعد.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>`;
    }
    function exportAttCSV() {
      if (!isCoach()) return;
      const safe = c => { c = String(c); if (/^[=+\-@]/.test(c)) c = "'" + c; return '"' + c.replace(/"/g, '""') + '"'; };
      const byId = {}; db.users.forEach(u => byId[u.id] = u);
      const rows = [["التاريخ", "الاسم", "اليوزر", "النوع", "الحالة"]];
      Object.keys(db.attendance).sort().forEach(d => {
        if (!d.startsWith(attMonth)) return;
        Object.entries(db.attendance[d]).forEach(([id, st]) => { const s = byId[id]; if (s) rows.push([d, s.name, s.username, stuMode(s) === "online" ? "أونلاين" : "أوفلاين", ATT_LABEL[st] || st]); });
      });
      if (rows.length === 1) return toast("لا توجد سجلات حضور في هذا الشهر");
      dl("ECA-attendance-" + attMonth + ".csv", "\ufeff" + rows.map(r => r.map(safe).join(",")).join("\r\n"), "text/csv;charset=utf-8");
    }

    // ---------- Backup / restore ----------
    function exportBackup() { if (!isCoach()) return; dl("ECA-backup-" + todayISO() + ".json", JSON.stringify(db, null, 1), "application/json"); toast("تم تنزيل النسخة الاحتياطية"); }
    function importBackup(inp) { try { inp.value = ""; } catch (_) {} toast("استعادة النسخة الاحتياطية متوقفة (البيانات على Firebase). تصدير النسخة شغال."); }

    // ---------- Add / edit / delete student ----------
    let editStuId = null;
    function openAddStu(id) {
      if (!isCoach()) return;
      editStuId = id || null;
      const s = id ? db.users.find(u => u.id === id) : null;
      const $ = x => document.getElementById(x);
      $("asTitleNew").classList.toggle("hidden", !!s); $("asTitleEdit").classList.toggle("hidden", !s);
      $("asSubNew").classList.toggle("hidden", !!s); $("asSubEdit").classList.toggle("hidden", !s);
      $("asDelBtn").classList.toggle("hidden", !s); $("asEditHint").classList.toggle("hidden", !s);
      $("asLevel").innerHTML = [1, 2, 3, 4, 5, 6].map(l => `<option value="${l}">Step ${l}</option>`).join("");
      $("asGroup").innerHTML = db.groups.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join("");
      $("asName").value = s ? s.name : ""; $("asUser").value = s ? s.username : ""; $("asPass").value = ""; $("asUser").readOnly = !!s; $("asPass").disabled = !!s;
      $("asAge").value = s && s.age ? s.age : ""; $("asPhone").value = s && s.phone ? s.phone : ""; $("asParent").value = s && s.parentPhone ? s.parentPhone : "";
      $("asLevel").value = s ? String(s.level) : "1";
      $("asGroup").value = s && s.group ? s.group : (db.groups[0] || "");
      $("asMode").value = s ? stuMode(s) : attMode;
      $("addStuModal").classList.remove("hidden"); applyLang(); $("asName").focus();
    }
    function closeAddStu() { document.getElementById("addStuModal").classList.add("hidden"); editStuId = null; }
    async function saveStudent(ev) {
      ev.preventDefault();
      if (!isCoach()) return;
      const g = x => document.getElementById(x).value.trim().replace(/[<>"'`]/g, "");
      const name = g("asName"); if (!name) return toast("اكتب اسم الطالب");
      let username = g("asUser").toLowerCase().replace(/\s+/g, "_");
      if (!username) username = "eca_" + String(Date.now()).slice(-6);
      if (db.users.some(u => String(u.username || "").toLowerCase() === username && u.id !== editStuId)) return toast("اسم المستخدم ده مستخدم قبل كده");
      if (db.users.some(u => u.role === "student" && String(u.name || "").trim().toLowerCase() === name.toLowerCase() && u.id !== editStuId) && !confirm(trText("فيه طالب بنفس الاسم. هل تريد المتابعة؟"))) return;
      const data = { name, username, level: Number(g("asLevel")) || 1, group: g("asGroup"), mode: g("asMode") === "online" ? "online" : "offline", age: g("asAge"), phone: g("asPhone"), parentPhone: g("asParent") };
      const pass = document.getElementById("asPass").value.trim();
      if (editStuId) {
        const s = db.users.find(u => u.id === editStuId); if (!s) return;
        delete data.username;                       // اسم المستخدم مربوط بحساب الدخول ومينفعش يتغير
        Object.assign(s, data);
        attMode = data.mode; save(); closeAddStu(); render();
        toast(pass ? "تم الحفظ — كلمة السر ما اتغيرتش (الطالب يغيرها من زر)" : "تم حفظ بيانات الطالب");
      } else {
        if (!window.fbCreateStudentAccount) return toast("الاتصال بالسيرفر لسه ما كملش، جرّب بعد ثواني");
        const initPass = pass || randomPass();
        if (initPass.length < 6) return toast("كلمة السر لازم تكون 6 حروف على الأقل");
        const btn = ev.submitter; if (btn) btn.disabled = true;
        try {
          const uid = await window.fbCreateStudentAccount(username, initPass);
          const ns = Object.assign({ id: uid, email: username + "@eca.local", role: "student", att: {}, hw: {}, puz: { t: 0, c: 0 }, note: "لم تُضف ملاحظات بعد." }, data);
          db.users.push(ns); attMode = data.mode; save(); closeAddStu(); render();
          alert(trText("تم إنشاء حساب الطالب") + "\n" + trText("اسم المستخدم") + ": " + username + "\n" + trText("كلمة السر") + ": " + initPass + "\n\n" + trText("سجّل البيانات دي وسلّمها للطالب."));
        } catch (e) {
          toast(e && e.code === "auth/email-already-in-use" ? "اسم المستخدم ده موجود فعلاً في نظام الدخول" : "تعذّر إنشاء الحساب");
        } finally { if (btn) btn.disabled = false; }
      }
    }
    function deleteStudent() {
      if (!isCoach() || !editStuId) return;
      const s = db.users.find(u => u.id === editStuId); if (!s) return;
      if (!confirm(trText("هل أنت متأكد من حذف الطالب نهائياً مع كل سجلات حضوره؟") + "\n" + s.name)) return;
      const _delId = editStuId; db.users = db.users.filter(u => u.id !== editStuId); if (window.fbOnStudentDeleted) window.fbOnStudentDeleted(_delId);
      for (const d in db.attendance) { delete db.attendance[d][editStuId]; if (!Object.keys(db.attendance[d]).length) delete db.attendance[d]; }
      if (selStuId === editStuId) selStuId = "";
      save(); closeAddStu(); render(); toast("تم حذف الطالب");
    }

    // ---------- Theme (dark / light) ----------
    function applyTheme(t) {
      const d = document.documentElement; d.classList.remove("dark", "light"); d.classList.add(t);
      try { localStorage.setItem("ECA_THEME", t); } catch (_) {}
      const b = document.getElementById("themeBtn");
      if (b) b.innerHTML = t === "light"
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
      const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", t === "light" ? "#f6f3ea" : "#050507");
    }
    function toggleTheme() { applyTheme(document.documentElement.classList.contains("light") ? "dark" : "light"); }
    applyTheme(document.documentElement.classList.contains("light") ? "light" : "dark");

    // ---------- PWA ----------
    let deferredInstall = null;
    const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    function showInstallBtn(v) { const b = document.getElementById("installBtn"); if (b) b.classList.toggle("hidden", !v); }
    window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; showInstallBtn(true); });
    window.addEventListener("appinstalled", () => { deferredInstall = null; showInstallBtn(false); });
    if (isIOS && !isStandalone()) showInstallBtn(true);
    function installApp() {
      if (deferredInstall) { deferredInstall.prompt(); deferredInstall.userChoice.finally(() => { deferredInstall = null; showInstallBtn(false); }); }
      else toast("على الآيفون: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»");
    }
    window.addEventListener("offline", () => toast("لا يوجد إنترنت — الموقع يعمل والبيانات محفوظة على جهازك"));
    window.addEventListener("online", () => toast("عاد الاتصال بالإنترنت"));
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
      window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
    }
    // re-render date label etc. when language flips on the attendance page
    { const _tl = toggleLang; toggleLang = function () { _tl(); if (tab === "attendance") render(); }; }

    // Background Animation
    const cv = document.getElementById("bgCanvas"), ctx = cv.getContext("2d");
    function rsz() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
    window.addEventListener("resize", rsz); rsz();
    const pts = Array.from({ length: 35 }, () => ({ x: Math.random() * cv.width, y: Math.random() * cv.height, r: Math.random() * 1.8 + 0.5, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25 }));
    function anim() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      pts.forEach(p => {
        p.x = (p.x + p.vx + cv.width) % cv.width; p.y = (p.y + p.vy + cv.height) % cv.height;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = document.documentElement.classList.contains("light") ? "rgba(153,116,21,0.28)" : "rgba(212,175,55,0.3)"; ctx.fill();
      });
      requestAnimationFrame(anim);
    }
    anim();
    const h0 = (location.hash || "#home").slice(1);
    tab = ["home", "lessons", "arena", "ranks", "certs", "honor", "tracker", "attendance", "finance", "parent", "about", "courses", "private", "faq", "fairplay", "contact"].includes(h0) ? h0 : "home";
    history.replaceState({ tab }, "", "#" + tab);
    window.addEventListener("popstate", e => { tab = (e.state && e.state.tab) || "home"; render(); });
    const _oe = openExamModal; openExamModal = function (l) { _oe(l); applyLang(); };
    render();
    // ================= ECA PRO UPGRADE: 6-IN-1 SMART EXAM, CERTIFICATES & DAILY PUZZLE =================
    
    // 1. تحميل مكتبة jsPDF مجاناً عند الحاجة فقط لتوليد ملف الـ PDF بأعلى سرعة
    let jsPdfLoaded = false;
    function loadJsPDF() {
      return new Promise((resolve) => {
        if (jsPdfLoaded && window.jspdf) return resolve(window.jspdf.jsPDF);
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        s.onload = () => { jsPdfLoaded = true; resolve(window.jspdf.jsPDF); };
        document.head.appendChild(s);
      });
    }

    // تحميل خط Cairo لدعم اللغة العربية في الشهادة بأناقة
    if (!document.getElementById("cairoFontLink")) {
      const fl = document.createElement("link");
      fl.id = "cairoFontLink";
      fl.rel = "stylesheet";
      fl.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;900&display=swap";
      document.head.appendChild(fl);
    }

    // 2. بنك الأسئلة التكتيكية المرتبط بالدروس لتوليد سؤال عشوائي لكل درس + اللغز اليومي المتغير
    const LESSON_QUESTION_PATTERNS = [
      { match: /mate|mating/i, q: (t) => `In "${t}", what is the primary objective to finish the game immediately?`, opts: ["Deliver a forced Checkmate net", "Trade all pawns", "Move the King to the corner"], ans: 0 },
      { match: /pin/i, q: (t) => `In "${t}", how do you maximize pressure on a pinned piece?`, opts: ["Attack it with a pawn or another piece (Pile up)", "Immediately retreat your pieces", "Offer a draw"], ans: 0 },
      { match: /double attack|twofold|fork/i, q: (t) => `In "${t}", what makes a double attack winning?`, opts: ["Creating two simultaneous threats the opponent cannot both defend", "Moving the same piece twice", "Trading Queens early"], ans: 0 },
      { match: /discovered|x-ray/i, q: (t) => `In "${t}", how do you make a discovered attack most devastating?`, opts: ["Move the front piece with a direct check or tempo threat", "Put the King in the center", "Pass the turn"], ans: 0 },
      { match: /defend|defence|eliminat/i, q: (t) => `In "${t}", what is the fastest way to break a strong defense?`, opts: ["Eliminate, capture, or lure away the key defending piece", "Wait passively", "Push flank pawns randomly"], ans: 0 },
      { match: /pawn|breakthrough|square|passed/i, q: (t) => `In "${t}", what is the key strategic goal in pawn play?`, opts: ["Create an unstoppable passed pawn and control key promotion squares", "Keep all pawns on the 2nd rank", "Give up the center"], ans: 0 },
      { match: /rook|seventh|open file/i, q: (t) => `In "${t}", how should Rooks be activated for maximum power?`, opts: ["Seize open files and penetrate to the 7th rank", "Keep Rooks locked behind unmoved pawns", "Trade Rooks for single pawns"], ans: 0 },
      { match: /draw|stalemate|wrong bishop/i, q: (t) => `In "${t}", when you are down material in the endgame, what resource can save the game?`, opts: ["Aim for Stalemate, perpetual check, or a theoretical draw fortress", "Resign immediately", "Expose the King to checks"], ans: 0 },
      { match: /opening|golden rules|castl/i, q: (t) => `In "${t}", what are the 3 Golden Rules of the opening?`, opts: ["Control the center, develop pieces quickly, and castle the King safely", "Bring the Queen out on move 2 and push all edge pawns", "Move only Knights"], ans: 0 }
    ];

    function buildLessonQuestion(lessonObj, idx, seedNum) {
      const title = lessonObj.t;
      const url = (lessonObj.l && lessonObj.l[0] && lessonObj.l[0][1]) ? lessonObj.l[0][1] : "https://lichess.org/training";
      let pat = LESSON_QUESTION_PATTERNS.find(p => p.match.test(title));
      let baseQ = pat ? pat.q(title) : `Tactical Evaluation — Lesson "${title}": Choose the most accurate chess principle:`;
      let rawOpts = pat ? [...pat.opts] : [
        `Apply the core tactical motif of "${title}" with calculation`,
        "Play a passive waiting move without a plan",
        "Give up material without compensation"
      ];
      // تبديل أماكن الاختيارات عشوائياً بناءً على البذرة (Seed) لضمان عدم حفظ المكان
      const shift = (seedNum + idx) % 3;
      const rotated = [0, 1, 2].map(i => ({ text: rawOpts[(i + shift) % 3], isCorrect: ((i + shift) % 3) === 0 }));
      return {
        lessonTitle: title,
        url: url,
        q: baseQ,
        opts: rotated.map(r => r.text),
        ans: rotated.findIndex(r => r.isCorrect)
      };
    }

    // 3. تحديث اللغز اليومي تلقائياً كل يوم بناءً على دروس كل Step (الشرط رقم 6)
    function updateDailyPuzzlesByDate() {
      const dayKey = todayISO(); // YYYY-MM-DD
      const dayHash = dayKey.split("-").reduce((acc, v) => acc + parseInt(v, 10) * 31, 7);
      STEPS.forEach(st => {
        if (st.lessons && st.lessons.length > 0) {
          const lessonIdx = dayHash % st.lessons.length;
          const les = st.lessons[lessonIdx];
          const generated = buildLessonQuestion(les, lessonIdx, dayHash);
          PUZZLES[st.step] = {
            q: `[لغز اليوم ${dayKey} — درس: ${les.t}] ${generated.q}`,
            opts: generated.opts,
            ans: generated.ans,
            url: generated.url,
            dayKey: dayKey
          };
        }
      });
    }

    // فتح اللغز اليومي تلقائياً عندما يتغير اليوم
    function ensureDailyPuzzleFreshForUser(u) {
      updateDailyPuzzlesByDate();
      if (!u || u.role !== "student") return;
      const dayKey = todayISO();
      if (u.lastPuzDate !== dayKey) {
        u.lastPuzDate = dayKey;
        u.puzDone = {};
      }
    }

    // 4. تعديل عرض صفحة الطالب لفرض شروط الامتحان وإظهار الشهادات وطلب الإعادة
    const _origRenderStudentHome = renderStudentHome;
    renderStudentHome = function(stu) {
      ensureDailyPuzzleFreshForUser(stu);
      const html = _origRenderStudentHome(stu).trim();   // trim: الـ regex تحت بيدوّر على آخر النص بالظبط
      const s = calcStats(stu);
      const stepNum = Number(stu.level);
      const exState = (stu.examState && stu.examState[stepNum]) || null; // { status: 'failed'|'passed', score: %, reqRetry: bool }
      const certs = stu.certificates || [];

      let examActionHtml = "";
      if (s.attP < 100) {
        examActionHtml = `
          <div class="mt-4 pt-3 border-t border-yellow-500/20 flex flex-wrap justify-between items-center gap-2">
            <span class="text-xs text-amber-300">يُفتح اختبار الترقية تلقائياً عند إتمام حضور 100% من دروس Step ${stepNum} (متبقي ${s.rem} درس)</span>
            <button disabled class="px-4 py-2 rounded-xl text-xs bg-zinc-800 text-gray-500 cursor-not-allowed">مقفول (${s.attP}%)</button>
          </div>`;
      } else if (exState && exState.status === "failed") {
        examActionHtml = `
          <div class="mt-4 pt-3 border-t border-red-500/30 space-y-2">
            <div class="text-xs text-red-300">لم تجتز الاختبار (${exState.score}% — المطلوب 70%).${exState.attempts > 1 ? ' المحاولة رقم ' + exState.attempts + '.' : ''} لازم الكوتش يوافق عشان تعيد الاختبار.</div>
            ${exState.rejected && !exState.reqRetry ? `<div class="text-xs text-amber-300">الكوتش رفض طلب الإعادة اللي فات — راجع الدروس وابعت طلب تاني لما تكون جاهز.</div>` : ''}
            <div class="flex flex-wrap justify-end gap-2">
            ${exState.reqRetry
              ? `<span class="px-3 py-1.5 rounded-xl text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40">تم إرسال طلب الإعادة للكوتش وبانتظار الموافقة</span>
                 <button onclick="cancelExamRetry()" class="px-3 py-1.5 rounded-xl text-xs bg-zinc-900 border border-zinc-700 text-gray-300">إلغاء الطلب</button>`
              : `<button onclick="requestExamRetry()" class="px-4 py-2 rounded-xl text-xs gold-btn">${exState.rejected ? 'إرسال طلب إعادة تاني' : 'إرسال طلب إعادة الاختبار للكوتش'}</button>`
            }
            </div>
          </div>`;
      } else if (exState && exState.status === "retry") {
        examActionHtml = `
          <div class="mt-4 pt-3 border-t border-emerald-500/30 flex flex-wrap justify-between items-center gap-2">
            <span class="text-xs text-emerald-300 font-bold">الكوتش وافق على إعادة الاختبار (درجتك اللي فاتت ${exState.prevScore}%). بالتوفيق!</span>
            <button onclick="openExamModal(${stepNum})" class="px-4 py-2 rounded-xl text-xs gold-btn">إعادة اختبار Step ${stepNum}</button>
          </div>`;
      } else {
        examActionHtml = `
          <div class="mt-4 pt-3 border-t border-yellow-500/20 flex flex-wrap justify-between items-center gap-2">
            <span class="text-xs text-emerald-300 font-bold">أتممت 100% من الحضور! اختبار الترقية متاح الآن: 10 ألغاز حقيقية • دقيقة لكل لغز • الحل كامل لآخر نقلة • النجاح من 70% (محاولة واحدة)</span>
            <button onclick="openExamModal(${stepNum})" class="px-4 py-2 rounded-xl text-xs gold-btn">بدء اختبار Step ${stepNum} الشامل</button>
          </div>`;
      }

      // استبدال جزء زر الاختبار القديم بالجزء الذكي الجديد
      const replaced = html.replace(
        /<div class="mt-4 pt-3 border-t border-yellow-500\/20 flex justify-between items-center">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>$/,
        examActionHtml + `</div></div>` + (certs.length ? renderStudentCertificatesBox(stu) : "") + `</div>`
      );
      return replaced;
    };

    function renderStudentCertificatesBox(stu) {
      const certs = stu.certificates || [];
      return `
        <div class="gold-card rounded-2xl p-6 mt-6">
          <h3 class="font-display font-bold text-lg text-yellow-400 mb-3">شهادات التقدير المعتمدة (ECA Certificates)</h3>
          <div class="grid sm:grid-cols-2 gap-4">
            ${certs.map((c, idx) => `
              <div class="p-4 rounded-xl bg-black/80 border border-yellow-500/40 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div class="text-sm font-bold text-white">شهادة إتمام Step ${c.step}</div>
                  <div class="text-xs text-gray-400">النتيجة: ${c.score}% • المدرب: ${esc(c.coachName)} •${c.date}</div>
                </div>
                <div class="flex gap-2">
                  <button onclick="previewAndDownloadCert('${stu.id}',${idx}, false)" class="px-3 py-1.5 rounded-xl text-xs gold-btn">تحميل PDF</button>
                  <button onclick="previewAndDownloadCert('${stu.id}',${idx}, true)" class="px-3 py-1.5 rounded-xl text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">إرسال لواتساب ولي الأمر</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>`;
    }

    // 5. طلب إعادة الاختبار وموافقة الكوتش (الشرط رقم 5)
    window.requestExamRetry = function() {
      const u = currUser(); if (!u) return;
      u.examState = u.examState || {};
      const st = Number(u.level);
      if (u.examState[st] && u.examState[st].status === "failed") {
        Object.assign(u.examState[st], { reqRetry: true, rejected: false, reqDate: todayISO() });
        save(); render();
        toast("تم إرسال طلب إعادة الاختبار للمدرب المسؤول");
      }
    };
    window.cancelExamRetry = function() {
      const u = currUser(); if (!u || !u.examState) return;
      const e = u.examState[Number(u.level)]; if (!e || !e.reqRetry) return;
      e.reqRetry = false; save(); render(); toast("تم إلغاء طلب الإعادة");
    };

    // موافقة الكوتش: الطالب يقدر يدخل الاختبار تاني (وبنحتفظ بالدرجة اللي فاتت وعدد المحاولات)
    window.approveExamRetry = function(stuId, stepNum) {
      if (!isCoach()) return;
      const s = db.users.find(u => u.id === stuId); if (!s || !s.examState || !s.examState[stepNum]) return;
      const e = s.examState[stepNum];
      s.examState[stepNum] = { status: "retry", prevScore: e.score, attempts: e.attempts || 1, approvedDate: todayISO() };
      save(); render();
      toast("تمت الموافقة على إعادة الاختبار للطالب " + s.name);
    };
    window.rejectExamRetry = function(stuId, stepNum) {
      if (!isCoach()) return;
      const s = db.users.find(u => u.id === stuId); if (!s || !s.examState || !s.examState[stepNum]) return;
      if (!confirm(trText("رفض طلب الإعادة؟ الطالب هيقدر يبعت طلب تاني بعد كده.") + "\n" + s.name)) return;
      Object.assign(s.examState[stepNum], { reqRetry: false, rejected: true });
      save(); render();
      toast("تم رفض طلب الإعادة");
    };
    // كل طلبات الإعادة اللي مستنية الكوتش
    function pendingRetryRequests() {
      const out = [];
      db.users.filter(u => u.role === "student").forEach(s => Object.keys(s.examState || {}).forEach(k => {
        const e = s.examState[k]; if (e && e.status === "failed" && e.reqRetry) out.push({ stu: s, step: k, score: e.score, date: e.reqDate || "" });
      }));
      return out;
    }
    function retryBannerHTML(withLink) {
      const list = pendingRetryRequests(); if (!list.length) return "";
      return `
        <div class="gold-card rounded-2xl p-4 mb-5 border-2 border-amber-500/60 bg-amber-950/20">
          <div class="flex flex-wrap justify-between items-center gap-2 mb-2">
            <h3 class="font-bold text-sm text-yellow-300">طلبات إعادة اختبار الترقية بانتظار موافقتك (${list.length}):</h3>
            ${withLink ? `<button onclick="switchTab('tracker')" class="px-3 py-1 rounded-lg text-[11px] bg-zinc-900 border border-yellow-500/30 text-yellow-300">فتح المتابعة ←</button>` : ''}
          </div>
          <div class="space-y-2">
            ${list.map(r => `
              <div class="flex flex-wrap justify-between items-center gap-2 p-2.5 rounded-xl bg-black/80 border border-yellow-500/30 text-xs">
                <span class="text-white font-bold">${esc(r.stu.name)} (@${esc(r.stu.username)}) — Step ${esc(r.step)} <span class="text-red-300">(الدرجة السابقة: ${esc(r.score)}%)</span>${r.date ? ` <span class="text-gray-500" dir="ltr">${esc(r.date)}</span>` : ''}</span>
                <div class="flex gap-2">
                  <button onclick="approveExamRetry('${r.stu.id}', '${r.step}')" class="px-3 py-1.5 rounded-xl text-xs gold-btn">✓ موافقة</button>
                  <button onclick="rejectExamRetry('${r.stu.id}', '${r.step}')" class="px-3 py-1.5 rounded-xl text-xs bg-red-500/20 text-red-300 border border-red-500/30">✗ رفض</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>`;
    }

    window.assignStudentCoach = function(stuId, coachName) {
      if (!isCoach()) return;
      const s = db.users.find(u => u.id === stuId); if (!s) return;
      s.coachName = coachName.trim();
      save(); toast("تم تحديث اسم المدرب المسؤول عن الطالب");
    };

    // إضافة إشعار طلبات إعادة الاختبار وخانة اسم المدرب في لوحة تحكم المدرب
    const _origRenderTrackerView = renderTrackerView;
    renderTrackerView = function() {
      const baseHtml = _origRenderTrackerView();
      const students = db.users.filter(u => u.role === "student");
      const retryRequests = [];
      students.forEach(s => {
        if (s.examState) {
          Object.keys(s.examState).forEach(stKey => {
            const inf = s.examState[stKey];
            if (inf && inf.status === "failed" && inf.reqRetry) {
              retryRequests.push({ stu: s, step: stKey, score: inf.score });
            }
          });
        }
      });

      const retryBanner = retryRequests.length ? `
        <div class="gold-card rounded-2xl p-4 mb-5 border-2 border-amber-500/60 bg-amber-950/20">
          <h3 class="font-bold text-sm text-yellow-300 mb-2">طلبات إعادة اختبار الترقية بانتظار موافقتك (${retryRequests.length}):</h3>
          <div class="space-y-2">
            ${retryRequests.map(r => `
              <div class="flex flex-wrap justify-between items-center gap-2 p-2.5 rounded-xl bg-black/80 border border-yellow-500/30 text-xs">
                <span class="text-white font-bold">${esc(r.stu.name)} (@${esc(r.stu.username)}) — Step${r.step} <span class="text-red-300">(الدرجة السابقة: ${r.score}%)</span></span>
                <button onclick="approveExamRetry('${r.stu.id}', '${r.step}')" class="px-3 py-1.5 rounded-xl text-xs gold-btn">✓ الموافقة على إعادة الاختبار</button>
              </div>
            `).join("")}
          </div>
        </div>` : "";

      // نفس الطالب المختار في الجدول الأساسي (مع مراعاة الفلتر والبحث)
      const q = searchQ.toLowerCase();
      const filtered = students.filter(s => (grpFilter === "ALL" || s.group === grpFilter) && (!q || String(s.name || "").toLowerCase().includes(q) || String(s.username || "").toLowerCase().includes(q)));
      const sel = students.find(s => s.id === selStuId) || filtered[0] || null;
      let extraCoachControls = "";
      if (sel) {
        const curCoach = sel.coachName || (currUser() && currUser().name) || "الكوتش عبدالرحمن منصور";
        const certs = sel.certificates || [];
        extraCoachControls = `
          <div class="gold-card rounded-2xl p-4 mt-4 flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2 flex-1">
              <span class="text-xs text-yellow-300 font-bold">اسم الكوتش في شهادة الطالب (${esc(sel.name)}):</span>
              <input id="stuCoachInp" value="${esc(curCoach)}" onchange="assignStudentCoach('${sel.id}', this.value)" class="bg-black border border-yellow-500/40 rounded-xl px-3 py-1.5 text-xs text-white" />
            </div>
            ${certs.length ? `<button onclick="previewAndDownloadCert('${sel.id}',${certs.length - 1}, true)" class="px-3 py-1.5 rounded-xl text-xs gold-btn">إرسال آخر شهادة لولي الأمر PDF</button>` : ""}
          </div>`;
      }

      return retryBannerHTML(false) + baseHtml + extraCoachControls;
    };

    // 6. نظام الاختبار التفاعلي الشامل (لغز من كل درس + نجاح من 70% + محاولة واحدة)
    let activeExam = null;
    openExamModal = function(lvl) {
      const u = currUser();
      if (!u || u.role !== "student") return;
      const stepNum = Number(lvl);
      const stats = calcStats(u);

      if (stats.attP < 100) {
        return toast("يجب إتمام حضور 100% من دروس هذا المستوى أولاً لفتح الاختبار!");
      }
      u.examState = u.examState || {};
      if (u.examState[stepNum] && u.examState[stepNum].status === "failed") {
        return toast("استنفدت محاولتك في هذا الاختبار. اطلب إعادة الاختبار من المدرب.");
      }

      const stObj = STEPS.find(x => x.step === stepNum);
      if (!stObj || !stObj.lessons || stObj.lessons.length === 0) {
        return toast("لا توجد دروس مسجلة في هذا المستوى حالياً");
      }

      const seed = Date.now() % 997;
      const questions = stObj.lessons.map((les, idx) => buildLessonQuestion(les, idx, seed));
      activeExam = { step: stepNum, questions, answers: {} };

      const modal = document.getElementById("examModal");
      modal.classList.remove("hidden");
      renderActiveExamUI();
    };

    function renderActiveExamUI() {
      if (!activeExam) return;
      const total = activeExam.questions.length;
      const answeredCount = Object.keys(activeExam.answers).length;
      document.getElementById("examTitle").innerHTML = `اختبار ترقية Step ${activeExam.step} (${answeredCount}/${total} سؤال)`;
      document.getElementById("examBody").innerHTML = `
        <div class="text-xs text-gray-300 mb-3 p-2.5 rounded-xl bg-black/70 border border-yellow-500/30">
          <b>تعليمات الاختبار:</b> يتكون الاختبار من <b>${total} لغز</b> (سؤال من كل درس في Step ${activeExam.step}). النجاح يتطلب <b>70% فأكثر</b> للترقية التلقائية وإصدار الشهادة. متاح لك <b>محاولة واحدة فقط</b>.
        </div>
        <div class="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          ${activeExam.questions.map((qObj, qIdx) => `
            <div class="p-3.5 rounded-xl bg-black/80 border border-yellow-500/25 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-yellow-400">لغز درس #${qIdx + 1}:${esc(qObj.lessonTitle)}</span>
                <a href="${qObj.url}" target="_blank" class="text-[11px] text-sky-400 hover:underline">معاينة الرقعة ↗</a>
              </div>
              <p class="text-xs text-white font-medium">${esc(qObj.q)}</p>
              <div class="space-y-1.5">
                ${qObj.opts.map((optTxt, oIdx) => {
                  const chosen = activeExam.answers[qIdx] === oIdx;
                  return `
                    <button type="button" onclick="selectExamAns(${qIdx}, ${oIdx})" class="w-full text-left px-3 py-2 rounded-lg text-xs border transition flex justify-between items-center ${chosen ? 'border-yellow-400 bg-yellow-500/20 text-yellow-200 font-bold' : 'border-zinc-800 bg-zinc-900/80 text-gray-300 hover:border-yellow-500/40'}">
                      <span>${esc(optTxt)}</span>
                      <span>${chosen ? '●' : '○'}</span>
                    </button>`;
                }).join("")}
              </div>
            </div>
          `).join("")}
        </div>
        <div class="mt-4 pt-3 border-t border-yellow-500/20 flex justify-between items-center">
          <span class="text-xs text-gray-400">أجبت على ${answeredCount} من ${total}</span>
          <button type="button" onclick="submitFullStepExam()" class="px-5 py-2.5 rounded-xl text-xs gold-btn">تسليم الاختبار والنتيجة النهائية</button>
        </div>
      `;
    }
window.selectExamAns = function(qIdx, oIdx) {
   if (!activeExam) return;
   const box = document.querySelector("#examBody .overflow-y-auto");
   const prevTop = box ? box.scrollTop : 0;
   activeExam.answers[qIdx] = oIdx;
   renderActiveExamUI();
   const newBox = document.querySelector("#examBody .overflow-y-auto");
   if (newBox) newBox.scrollTop = prevTop;
 };

    window.submitFullStepExam = async function() {
      if (!activeExam) return;
      const total = activeExam.questions.length;
      if (Object.keys(activeExam.answers).length < total) {
        return toast("يرجى الإجابة على جميع أسئلة الدروس قبل التسليم!");
      }
      let correct = 0;
      activeExam.questions.forEach((qObj, idx) => {
        if (activeExam.answers[idx] === qObj.ans) correct++;
      });
      recordExamResult(activeExam.step, Math.round((correct / total) * 100));
    };

    // تسجيل نتيجة امتحان الترقية: نجاح (70%+) = شهادة + ترقية، رسوب = محتاج موافقة الكوتش على الإعادة
    window.recordExamResult = function(oldStep, score, opts) {
      opts = opts || {};
      const u = currUser(); if (!u) return;
      u.examState = u.examState || {};
      // عدد المحاولات (مع الإعادة) — لو المحاولة دي اتسجّلت مقدّماً وقت البدء مانعدّهاش مرتين
      const prev = u.examState[oldStep] || {};
      const attempts = prev.inProgress ? (prev.attempts || 1) : (prev.attempts || 0) + 1;

      if (score >= 70) {
        u.examState[oldStep] = { status: "passed", score: score, attempts, date: todayISO() };
        const coachUser = db.users.find(x => x.role === "coach");
        const coachName = u.coachName || (coachUser ? coachUser.name : "الكوتش عبدالرحمن منصور");
        u.certificates = u.certificates || [];
        u.certificates.push({
          step: oldStep,
          score: score,
          studentName: u.name,
          coachName: coachName,
          date: todayISO()
        });
        const newLevel = Math.min(6, oldStep + 1);
        u.level = newLevel;
        save();
        closeExamModal();
        render();
        toast(`مبروك! نجحت بنسبة ${score}% وتمت ترقيتك إلى Step ${newLevel}`);
        // توليد الشهادة وعرض نافذة الإرسال لولي الأمر فوراً
        if (!opts.noCertPopup) setTimeout(() => {
          previewAndDownloadCert(u.id, u.certificates.length - 1, true);
        }, 400);
        return { passed: true, certIdx: u.certificates.length - 1, newLevel };
      } else {
        u.examState[oldStep] = { status: "failed", score: score, attempts, reqRetry: false, date: todayISO() };
        save();
        closeExamModal();
        render();
        toast(`حصلت على ${score}% (المطلوب 70%). تم قفل الاختبار ويمكنك طلب إعادة الاختبار من المدرب.`);
        return { passed: false };
      }
    };

// 7. رسم الشهادة وعرضها في نافذة معاينة مع طباعة PDF وتنزيل مباشر مضمون 100%
    window.buildCertificateDataURL = async function(cert, certLang) {
      // نصوص الشهادة بالعربي أو الإنجليزي
      const EN = certLang === "en";
      const T = EN ? {
        title: "Certificate of Achievement", titleFont: "800 76px Cinzel, serif",
        given: "This certificate is proudly presented to",
        lines: ["In recognition of outstanding performance and dedication in chess training,", `and for successfully completing (Step ${cert.step}) with a score of ${cert.score}%.`, "We wish them continued progress and success in their chess journey."],
        coach: "Coach", mgmt: "Academy Management", dir: "ltr", font: "Inter, Cairo, sans-serif"
      } : {
        title: "شهادة تقدير", titleFont: "900 90px Cairo, sans-serif",
        given: "تمنح هذه الشهادة للمتدرب",
        lines: [`تقديراً لأدائه الرائع والتزامه المتميز في التدريبات الشطرنجية، واجتيازه مستوى (Step ${cert.step}) بنسبة ${cert.score}%،`, "ونتمنى له دوام التقدم والتفوق في رحلته مع الشطرنج."],
        coach: "المدرب", mgmt: "إدارة الأكاديمية", dir: "rtl", font: "Cairo, sans-serif"
      };
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch (_) {}
      }
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1130;
      const c = canvas.getContext("2d");

      // خلفية كريمي مطابقة للشهادة الرسمية
      c.fillStyle = "#faf3e3";
      c.fillRect(0, 0, canvas.width, canvas.height);

      // الإطار الخارجي والداخلي
      c.strokeStyle = "#1b2420";
      c.lineWidth = 14;
      c.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

      c.strokeStyle = "#c59b27";
      c.lineWidth = 4;
      c.strokeRect(58, 58, canvas.width - 116, canvas.height - 116);

      // لوجو الأكاديمية (نفس الموقع، فمفيش مشكلة في رسمه على الـ canvas)
      const loadImg = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
      const [logoMark, logoFull] = await Promise.all([loadImg("img/eca-mark.png"), loadImg("img/eca-logo.jpg")]);

      // علامة مائية خفيفة: لوجو الأكاديمية في النص (multiply عشان الخلفية البيضا بتاعته تختفي)
      c.save();
      c.textAlign = "center";
      if (logoMark) {
        c.globalAlpha = 0.07; c.globalCompositeOperation = "multiply";
        c.drawImage(logoMark, canvas.width / 2 - 300, canvas.height / 2 - 300, 600, 600);
      } else {
        c.globalAlpha = 0.05; c.fillStyle = "#1b2420"; c.font = "900 160px Cinzel, serif";
        c.fillText("ECA CHESS", canvas.width / 2, canvas.height / 2 + 40);
      }
      c.restore();

      // اللوجو في الركنين العلويين
      if (logoFull) {
        c.save(); c.globalCompositeOperation = "multiply";
        c.drawImage(logoFull, 90, 80, 170, 170);
        c.drawImage(logoFull, canvas.width - 260, 80, 170, 170);
        c.restore();
      }

      // العنوان العلوي: EGYPT CHESS ACADEMY (ECA)
      c.fillStyle = "#9a7418";
      c.font = "800 32px Cinzel, serif";
      c.textAlign = "center";
      c.fillText("EGYPT CHESS ACADEMY (ECA)", canvas.width / 2, 145);

      // شهادة تقدير
      c.fillStyle = "#18221f";
      c.font = T.titleFont;
      c.fillText(T.title, canvas.width / 2, 270);

      // خط زخرفي
      c.strokeStyle = "#c59b27";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(canvas.width / 2 - 220, 310);
      c.lineTo(canvas.width / 2 + 220, 310);
      c.stroke();

      // تمنح هذه الشهادة للمتدرب
      c.fillStyle = "#4b5563";
      c.font = "700 34px " + T.font;
      c.fillText(T.given, canvas.width / 2, 390);

      // اسم الطالب
      c.fillStyle = "#b07d12";
      c.font = "900 64px Cairo, sans-serif";
      c.fillText(cert.studentName, canvas.width / 2, 490);

      // نص التقدير
      c.fillStyle = "#1f2937";
      c.font = (EN ? "500 29px " : "600 30px ") + T.font;
      c.save(); c.direction = T.dir;   // عشان الكلام العربي مع (Step) والنسبة مايتلخبطش
      const y0 = T.lines.length > 2 ? 565 : 580, gap = T.lines.length > 2 ? 50 : 60;
      T.lines.forEach((ln, k) => c.fillText(ln, canvas.width / 2, y0 + k * gap));
      c.restore();

      // التوقيعات السفلية: المدرب (يمين) - الشعار (منتصف) - إدارة الأكاديمية (يسار)
      c.fillStyle = "#18221f";
      c.font = "800 34px Cairo, sans-serif";
      c.fillText(cert.coachName, 1220, 855);
      c.strokeStyle = "#9ca3af";
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(1040, 880); c.lineTo(1400, 880); c.stroke();
      c.fillStyle = "#6b7280";
      c.font = "700 26px Cairo, sans-serif";
      c.fillText(T.coach, 1220, 925);

      // ختم الأكاديمية في المنتصف: لوجو ECA جوه دايرة بإطار دهبي
      c.beginPath();
      c.arc(canvas.width / 2, 880, 96, 0, Math.PI * 2);
      c.fillStyle = "#ffffff";
      c.fill();
      if (logoMark) {
        c.save(); c.beginPath(); c.arc(canvas.width / 2, 880, 90, 0, Math.PI * 2); c.clip();
        c.drawImage(logoMark, canvas.width / 2 - 80, 800, 160, 160);
        c.restore();
      } else {
        c.fillStyle = "#18221f";
        c.font = "800 34px Cinzel, serif";
        c.fillText("ECA", canvas.width / 2, 890);
      }
      c.beginPath();
      c.arc(canvas.width / 2, 880, 96, 0, Math.PI * 2);
      c.lineWidth = 6;
      c.strokeStyle = "#d4af37";
      c.stroke();

      // إدارة الأكاديمية
      c.fillStyle = "#18221f";
      c.font = "800 24px Cinzel, serif";
      c.fillText("EGYPT CHESS ACADEMY (ECA)", 380, 855);
      c.beginPath(); c.moveTo(200, 880); c.lineTo(560, 880); c.stroke();
      c.fillStyle = "#6b7280";
      c.font = "700 26px Cairo, sans-serif";
      c.fillText(T.mgmt, 380, 925);

      // التاريخ
      c.fillStyle = "#9ca3af";
      c.font = "600 20px Inter, sans-serif";
      c.fillText(`Issued on: ${cert.date} • Official ECA Certificate`, canvas.width / 2, 1035);

      return canvas.toDataURL("image/png");
    };

    window.previewAndDownloadCert = async function(stuId, certIdx, openWaAfter, certLang) {
      const stu = db.users.find(u => u.id === stuId); if (!stu) return;
      const cert = (stu.certificates || [])[certIdx]; if (!cert) return;
      certLang = certLang === "en" || certLang === "ar" ? certLang : (lang === "en" ? "en" : "ar");   // الافتراضي: لغة الموقع

      const dataUrl = await window.buildCertificateDataURL(cert, certLang);

      // إنشاء أو فتح نافذة معاينة الشهادة داخل الموقع
      let certModal = document.getElementById("certPreviewModal");
      if (!certModal) {
        certModal = document.createElement("div");
        certModal.id = "certPreviewModal";
        certModal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4";
        document.body.appendChild(certModal);
      }
      certModal.classList.remove("hidden");

      const parentNum = stu.parentPhone || stu.phone || "";
      const waBase = waLink(parentNum) || "https://wa.me/";
      const waMsg = encodeURIComponent(certLang === "en" ?
        `Congratulations from Egypt Chess Academy (ECA)\n\n` +
        `Congratulations to our champion (${cert.studentName}) for passing the (Step ${cert.step}) exam with a score of (${cert.score}%) and moving up to the next level!\n` +
        `Coach: ${cert.coachName}\n` +
        `(The official ECA certificate is attached)` :
        `تهنئة من Egypt Chess Academy (ECA)\n\n` +
        `نبارك للبطل (${cert.studentName}) اجتيازه اختبار مستوى (Step ${cert.step}) بنجاح باهر بنسبة (${cert.score}%) وترقيته تلقائياً للمستوى التالي!\n` +
        `إشراف المدرب: ${cert.coachName}\n` +
        `(مرفق لحضرتك شهادة التقدير الرسمية المعتمدة من الأكاديمية)`
      );

      certModal.innerHTML = `
        <div class="gold-card rounded-2xl max-w-3xl w-full p-5 max-h-[92vh] overflow-y-auto space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-display font-bold text-lg text-yellow-400">شهادة تقدير — ${esc(cert.studentName)} (Step ${cert.step})</h3>
            <button onclick="document.getElementById('certPreviewModal').classList.add('hidden')" class="text-gray-400 hover:text-white px-2 text-lg">✕</button>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-gray-400">لغة الشهادة:</span>
            <button onclick="previewAndDownloadCert('${stu.id}', ${certIdx}, true, 'ar')" class="px-3 py-1.5 rounded-xl font-bold ${certLang === 'ar' ? 'gold-btn' : 'bg-zinc-900 border border-yellow-500/30 text-yellow-300'}">عربي</button>
            <button onclick="previewAndDownloadCert('${stu.id}', ${certIdx}, true, 'en')" class="px-3 py-1.5 rounded-xl font-bold ${certLang === 'en' ? 'gold-btn' : 'bg-zinc-900 border border-yellow-500/30 text-yellow-300'}">English</button>
          </div>
          <div class="rounded-xl overflow-hidden border-2 border-yellow-500/50 bg-black">
            <img id="certPreviewImg" src="${dataUrl}" alt="ECA Certificate" class="w-full h-auto block" />
          </div>
          <div class="flex flex-wrap justify-end gap-2 pt-2">
            <button onclick="printCertAsPDF()" class="px-4 py-2.5 rounded-xl text-xs gold-btn">طباعة / حفظ كملف PDF</button>
            <a href="${dataUrl}" download="ECA-Certificate-Step${cert.step}-${esc(stu.username)}-${certLang.toUpperCase()}.png" class="px-4 py-2.5 rounded-xl text-xs bg-zinc-800 border border-yellow-500/40 text-yellow-300 font-bold">تنزيل كصورة جاهزة</a>
            <a href="${waBase}?text=${waMsg}" target="_blank" rel="noopener" class="px-4 py-2.5 rounded-xl text-xs bg-emerald-500 text-black font-bold">إرسال لواتساب ولي الأمر</a>
          </div>
        </div>
      `;

      applyLang();
      // إذا ضغط المستخدم على زر التحميل المباشر، نقوم بتنزيل ملف PDF أو الصورة فوراً
      if (!openWaAfter) {
        printCertAsPDF();
      }
    };

    window.printCertAsPDF = function() {
      const img = document.getElementById("certPreviewImg");
      if (!img) return;
      const src = img.src;
      const w = window.open("", "_blank");
      if (!w) {
        // في حال كان المتصفح يمنع النوافذ المنبثقة، نقوم بتنزيلها مباشرة
        const a = document.createElement("a");
        a.href = src;
        a.download = "ECA-Certificate.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        return toast("تم تنزيل الشهادة مباشرة على جهازك!");
      }
      w.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>ECA Official Certificate — Print / Save PDF</title>
          <style>
            @page { size: landscape; margin: 0; }
            html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #faf3e3; display: flex; align-items: center; justify-content: center; }
            img { width: 100vw; height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${src}" onload="setTimeout(() => { window.print(); }, 250);" />
        </body>
        </html>
      `);
      w.document.close();
    };

    // تشغيل التوليد اليومي للألغاز فور فتح الموقع
    updateDailyPuzzlesByDate();
