// ECA — openings.js: كتاب الافتتاحات (ECO) بالعربي والإنجليزي
// كل سطر: الكود | الاسم بالإنجليزي | الاسم بالعربي | النقلات (SAN). الفهرس بيتعمل مرة واحدة بالموقف نفسه (مش ترتيب النقلات)
// عشان أي ترتيب نقلات بيوصل لنفس الموقف يتعرف (Transposition). مفيش DOM: نفس الملف بيتجرّب في Node.
(function (root) {
  const RAW = `B00|King's Pawn Opening|افتتاح بيدق الملك|e4
A40|Queen's Pawn Opening|افتتاح بيدق الوزير|d4
A04|Réti Opening|افتتاح ريتي|Nf3
A10|English Opening|الافتتاح الإنجليزي|c4
A00|Polish Opening (Sokolsky)|الافتتاح البولندي (سوكولسكي)|b4
A00|Grob Opening|افتتاح جروب|g4
A00|Hungarian Opening|الافتتاح المجري|g3
A00|Van't Kruijs Opening|افتتاح فانت كرويس|e3
A01|Nimzo-Larsen Attack|هجوم نيمزو-لارسن|b3
A02|Bird's Opening|افتتاح بيرد|f4
A03|Bird's Opening: Dutch Variation|افتتاح بيرد: التنويع الهولندي|f4 d5
A02|Bird's Opening: From's Gambit|افتتاح بيرد: جامبيت فروم|f4 e5
A06|Réti Opening: Zukertort Variation|افتتاح ريتي: زوكرتورت|Nf3 d5
A09|Réti Gambit|جامبيت ريتي|Nf3 d5 c4
A07|King's Indian Attack|هجوم الملك الهندي|Nf3 d5 g3
A11|English Opening: Caro-Kann Defensive System|الإنجليزي: نظام كارو-كان|c4 c6
A13|English Opening: Agincourt Defense|الإنجليزي: دفاع أجينكورت|c4 e6
A15|English Opening: Anglo-Indian Defense|الإنجليزي: الدفاع الأنجلو-هندي|c4 Nf6
A16|English Opening: Anglo-Indian, Queen's Knight|الإنجليزي الأنجلو-هندي: حصان الوزير|c4 Nf6 Nc3
A20|English Opening: King's English|الإنجليزي: تنويع الملك|c4 e5
A22|English Opening: Two Knights|الإنجليزي: الحصانين|c4 e5 Nc3 Nf6
A25|English Opening: Closed (Reversed Sicilian)|الإنجليزي المغلق (صقلي معكوس)|c4 e5 Nc3 Nc6
A30|English Opening: Symmetrical|الإنجليزي المتماثل|c4 c5
A40|Englund Gambit|جامبيت إنجلوند|d4 e5
A40|Modern Defense: Queen's Pawn|الدفاع الحديث (بيدق الوزير)|d4 g6
A40|Horwitz Defense|دفاع هورفيتز|d4 e6
A43|Old Benoni Defense|دفاع بينوني القديم|d4 c5
A45|Indian Game|الدفاع الهندي|d4 Nf6
A45|Trompowsky Attack|هجوم ترومبوفسكي|d4 Nf6 Bg5
A45|London System (vs Indian)|نظام لندن (ضد الهندي)|d4 Nf6 Bf4
A46|Indian Game: Knights Variation|الهندي: تنويع الحصانين|d4 Nf6 Nf3
A46|Torre Attack|هجوم توري|d4 Nf6 Nf3 e6 Bg5
A48|East Indian Defense|الدفاع الهندي الشرقي|d4 Nf6 Nf3 g6
A50|Indian Game: Normal Variation|الهندي: التنويع العادي (c4)|d4 Nf6 c4
A51|Budapest Gambit|جامبيت بودابست|d4 Nf6 c4 e5
A52|Budapest Gambit: Main Line|جامبيت بودابست: الخط الرئيسي|d4 Nf6 c4 e5 dxe5 Ng4
A53|Old Indian Defense|الدفاع الهندي القديم|d4 Nf6 c4 d6
A56|Benoni Defense|دفاع بينوني|d4 Nf6 c4 c5
A56|Czech Benoni|بينوني التشيكي|d4 Nf6 c4 c5 d5 e5
A57|Benko Gambit|جامبيت بنكو|d4 Nf6 c4 c5 d5 b5
A60|Modern Benoni|بينوني الحديث|d4 Nf6 c4 c5 d5 e6
A80|Dutch Defense|الدفاع الهولندي|d4 f5
A82|Dutch Defense: Staunton Gambit|الهولندي: جامبيت ستونتون|d4 f5 e4
A81|Dutch Defense: Fianchetto|الهولندي: الفيانكيتو|d4 f5 g3
A84|Dutch Defense: Main Line|الدفاع الهولندي: الخط الرئيسي|d4 f5 c4 Nf6
A87|Dutch Defense: Leningrad|الهولندي: لينينجراد|d4 f5 c4 Nf6 g3 g6 Bg2 Bg7
A90|Dutch Defense: Stonewall|الهولندي: الحائط الحجري|d4 f5 c4 Nf6 g3 e6 Bg2 d5
B00|Nimzowitsch Defense|دفاع نيمزوفيتش|e4 Nc6
B00|Owen's Defense|دفاع أوين|e4 b6
B01|Scandinavian Defense|الدفاع الإسكندنافي|e4 d5
B01|Scandinavian Defense: Main Line|الإسكندنافي: الخط الرئيسي|e4 d5 exd5 Qxd5 Nc3 Qa5
B01|Scandinavian Defense: Gubinsky-Melts (Qd6)|الإسكندنافي: Qd6|e4 d5 exd5 Qxd5 Nc3 Qd6
B01|Scandinavian Defense: Modern Variation|الإسكندنافي الحديث|e4 d5 exd5 Nf6
B02|Alekhine's Defense|دفاع أليخين|e4 Nf6
B03|Alekhine's Defense: Four Pawns Attack|أليخين: هجوم البيادق الأربعة|e4 Nf6 e5 Nd5 d4 d6 c4 Nb6 f4
B04|Alekhine's Defense: Modern Variation|أليخين الحديث|e4 Nf6 e5 Nd5 d4 d6 Nf3
B06|Modern Defense|الدفاع الحديث|e4 g6
B07|Pirc Defense|دفاع بيرك|e4 d6 d4 Nf6 Nc3 g6
B08|Pirc Defense: Classical|بيرك الكلاسيكي|e4 d6 d4 Nf6 Nc3 g6 Nf3
B09|Pirc Defense: Austrian Attack|بيرك: الهجوم النمساوي|e4 d6 d4 Nf6 Nc3 g6 f4
B10|Caro-Kann Defense|دفاع كارو-كان|e4 c6
B11|Caro-Kann Defense: Two Knights|كارو-كان: الحصانين|e4 c6 Nc3 d5 Nf3
B12|Caro-Kann Defense: Advance Variation|كارو-كان: التقدم|e4 c6 d4 d5 e5
B13|Caro-Kann Defense: Exchange Variation|كارو-كان: التبادل|e4 c6 d4 d5 exd5 cxd5
B14|Caro-Kann Defense: Panov Attack|كارو-كان: هجوم بانوف|e4 c6 d4 d5 exd5 cxd5 c4
B15|Caro-Kann Defense: Main Line|كارو-كان: الخط الرئيسي|e4 c6 d4 d5 Nc3
B17|Caro-Kann Defense: Karpov Variation|كارو-كان: تنويع كاربوف|e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7
B18|Caro-Kann Defense: Classical Variation|كارو-كان الكلاسيكي|e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5
B20|Sicilian Defense|الدفاع الصقلي|e4 c5
B21|Sicilian Defense: Smith-Morra Gambit|الصقلي: جامبيت سميث-مورا|e4 c5 d4 cxd4 c3
B22|Sicilian Defense: Alapin Variation|الصقلي: ألابين|e4 c5 c3
B23|Sicilian Defense: Closed|الصقلي المغلق|e4 c5 Nc3
B23|Sicilian Defense: Grand Prix Attack|الصقلي: هجوم الجراند بري|e4 c5 Nc3 Nc6 f4
B27|Sicilian Defense: Hyperaccelerated Dragon|الصقلي: التنين فائق التسريع|e4 c5 Nf3 g6
B29|Sicilian Defense: Nimzowitsch Variation|الصقلي: نيمزوفيتش|e4 c5 Nf3 Nf6
B30|Sicilian Defense: Old Sicilian|الصقلي: Nc6|e4 c5 Nf3 Nc6
B30|Sicilian Defense: Rossolimo Variation|الصقلي: روسوليمو|e4 c5 Nf3 Nc6 Bb5
B32|Sicilian Defense: Open (Nc6)|الصقلي المفتوح (Nc6)|e4 c5 Nf3 Nc6 d4 cxd4 Nxd4
B32|Sicilian Defense: Kalashnikov Variation|الصقلي: كلاشنكوف|e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 e5 Nb5 d6
B33|Sicilian Defense: Sveshnikov Variation|الصقلي: سفيشنيكوف|e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5
B34|Sicilian Defense: Accelerated Dragon|الصقلي: التنين المسرّع|e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 g6
B40|Sicilian Defense: French Variation|الصقلي: التنويع الفرنسي|e4 c5 Nf3 e6
B41|Sicilian Defense: Kan Variation|الصقلي: كان|e4 c5 Nf3 e6 d4 cxd4 Nxd4 a6
B44|Sicilian Defense: Taimanov Variation|الصقلي: تايمانوف|e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6
B45|Sicilian Defense: Four Knights Variation|الصقلي: الأحصنة الأربعة|e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nf6 Nc3 Nc6
B50|Sicilian Defense: Modern Variations|الصقلي: d6|e4 c5 Nf3 d6
B51|Sicilian Defense: Moscow Variation|الصقلي: تنويع موسكو|e4 c5 Nf3 d6 Bb5+
B53|Sicilian Defense: Open|الصقلي المفتوح|e4 c5 Nf3 d6 d4 cxd4 Nxd4
B54|Sicilian Defense: Open, Nf6|الصقلي المفتوح: Nf6|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6
B56|Sicilian Defense: Classical Variation|الصقلي الكلاسيكي|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 Nc6
B57|Sicilian Defense: Sozin Attack|الصقلي: هجوم سوزين|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 Nc6 Bc4
B60|Sicilian Defense: Richter-Rauzer Variation|الصقلي: ريختر-راوزر|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 Nc6 Bg5
B70|Sicilian Defense: Dragon Variation|الصقلي: التنين (دراجون)|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6
B76|Sicilian Defense: Dragon, Yugoslav Attack|التنين: الهجوم اليوغسلافي|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3
B80|Sicilian Defense: Scheveningen Variation|الصقلي: شيفنينجن|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e6
B90|Sicilian Defense: Najdorf Variation|الصقلي: نايدورف|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6
B90|Sicilian Defense: Najdorf, English Attack|نايدورف: الهجوم الإنجليزي|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3
B92|Sicilian Defense: Najdorf, Opocensky Variation|نايدورف: أوبوشينسكي (Be2)|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2
B94|Sicilian Defense: Najdorf, 6.Bg5|نايدورف: Bg5|e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Bg5
C00|French Defense|الدفاع الفرنسي|e4 e6
C00|French Defense: King's Indian Attack|الفرنسي: هجوم الملك الهندي|e4 e6 d3
C01|French Defense: Exchange Variation|الفرنسي: التبادل|e4 e6 d4 d5 exd5
C02|French Defense: Advance Variation|الفرنسي: التقدم|e4 e6 d4 d5 e5
C03|French Defense: Tarrasch Variation|الفرنسي: تاراش|e4 e6 d4 d5 Nd2
C10|French Defense: Rubinstein Variation|الفرنسي: روبنشتاين|e4 e6 d4 d5 Nc3 dxe4
C11|French Defense: Classical Variation|الفرنسي الكلاسيكي|e4 e6 d4 d5 Nc3 Nf6
C15|French Defense: Winawer Variation|الفرنسي: فيناوير|e4 e6 d4 d5 Nc3 Bb4
C20|King's Pawn Game|لعبة بيدق الملك (الافتتاح المفتوح)|e4 e5
C20|King's Pawn Game: Wayward Queen Attack|هجوم الوزير المبكر|e4 e5 Qh5
C21|Center Game|لعبة المركز|e4 e5 d4 exd4
C21|Danish Gambit|الجامبيت الدنماركي|e4 e5 d4 exd4 c3
C23|Bishop's Opening|افتتاح الفيل|e4 e5 Bc4
C24|Bishop's Opening: Berlin Defense|افتتاح الفيل: دفاع برلين|e4 e5 Bc4 Nf6
C25|Vienna Game|لعبة فيينا|e4 e5 Nc3
C26|Vienna Game: Falkbeer Variation|فيينا: فالكبير|e4 e5 Nc3 Nf6
C29|Vienna Gambit|جامبيت فيينا|e4 e5 Nc3 Nf6 f4
C30|King's Gambit|جامبيت الملك|e4 e5 f4
C30|King's Gambit Declined: Classical Variation|جامبيت الملك المرفوض: الكلاسيكي|e4 e5 f4 Bc5
C31|King's Gambit Declined: Falkbeer Countergambit|جامبيت فالكبير المضاد|e4 e5 f4 d5
C33|King's Gambit Accepted|جامبيت الملك المقبول|e4 e5 f4 exf4
C33|King's Gambit Accepted: Bishop's Gambit|جامبيت الملك المقبول: جامبيت الفيل|e4 e5 f4 exf4 Bc4
C34|King's Gambit Accepted: King's Knight Gambit|جامبيت الملك المقبول: حصان الملك|e4 e5 f4 exf4 Nf3
C40|King's Knight Opening|افتتاح حصان الملك|e4 e5 Nf3
C40|Latvian Gambit|الجامبيت اللاتفي|e4 e5 Nf3 f5
C40|Elephant Gambit|جامبيت الفيل (Elephant)|e4 e5 Nf3 d5
C41|Philidor Defense|دفاع فيليدور|e4 e5 Nf3 d6
C42|Petrov's Defense (Russian Game)|دفاع بتروف (اللعبة الروسية)|e4 e5 Nf3 Nf6
C42|Petrov's Defense: Classical Attack|بتروف الكلاسيكي|e4 e5 Nf3 Nf6 Nxe5 d6
C43|Petrov's Defense: Modern Attack|بتروف: الهجوم الحديث|e4 e5 Nf3 Nf6 d4
C44|Ponziani Opening|افتتاح بونزياني|e4 e5 Nf3 Nc6 c3
C44|Scotch Game|الافتتاح الاسكتلندي|e4 e5 Nf3 Nc6 d4
C44|Scotch Gambit|الجامبيت الاسكتلندي|e4 e5 Nf3 Nc6 d4 exd4 Bc4
C45|Scotch Game: Main Line|الاسكتلندي: الخط الرئيسي|e4 e5 Nf3 Nc6 d4 exd4 Nxd4
C45|Scotch Game: Classical Variation|الاسكتلندي الكلاسيكي|e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5
C45|Scotch Game: Schmidt Variation|الاسكتلندي: تنويع شميت|e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6
C46|Three Knights Opening|افتتاح الأحصنة الثلاثة|e4 e5 Nf3 Nc6 Nc3
C47|Four Knights Game|لعبة الأحصنة الأربعة|e4 e5 Nf3 Nc6 Nc3 Nf6
C47|Four Knights Game: Scotch Variation|الأحصنة الأربعة: الاسكتلندي|e4 e5 Nf3 Nc6 Nc3 Nf6 d4
C48|Four Knights Game: Spanish Variation|الأحصنة الأربعة: الإسباني|e4 e5 Nf3 Nc6 Nc3 Nf6 Bb5
C50|Italian Game|الافتتاح الإيطالي|e4 e5 Nf3 Nc6 Bc4
C50|Italian Game: Hungarian Defense|الإيطالي: الدفاع المجري|e4 e5 Nf3 Nc6 Bc4 Be7
C50|Italian Game: Giuoco Piano|الإيطالي: جيوكو بيانو|e4 e5 Nf3 Nc6 Bc4 Bc5
C50|Italian Game: Giuoco Pianissimo|الإيطالي: جيوكو بيانيسيمو|e4 e5 Nf3 Nc6 Bc4 Bc5 d3
C51|Italian Game: Evans Gambit|الإيطالي: جامبيت إيفانز|e4 e5 Nf3 Nc6 Bc4 Bc5 b4
C53|Italian Game: Giuoco Piano, Main Line|جيوكو بيانو: الخط الرئيسي (c3)|e4 e5 Nf3 Nc6 Bc4 Bc5 c3
C55|Italian Game: Two Knights Defense|الإيطالي: دفاع الحصانين|e4 e5 Nf3 Nc6 Bc4 Nf6
C55|Two Knights Defense: Modern Bishop's Opening|دفاع الحصانين: d3|e4 e5 Nf3 Nc6 Bc4 Nf6 d3
C55|Two Knights Defense: Open Variation|دفاع الحصانين: d4|e4 e5 Nf3 Nc6 Bc4 Nf6 d4
C57|Two Knights Defense: Knight Attack|دفاع الحصانين: هجوم الحصان|e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5
C57|Two Knights Defense: Traxler Counterattack|دفاع الحصانين: هجوم تراكسلر المضاد|e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 Bc5
C57|Two Knights Defense: Fried Liver Attack|هجوم الكبد المقلي (Fried Liver)|e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7
C58|Two Knights Defense: Main Line (Na5)|دفاع الحصانين: الخط الرئيسي (Na5)|e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5
C60|Ruy Lopez (Spanish Opening)|الافتتاح الإسباني (روي لوبيز)|e4 e5 Nf3 Nc6 Bb5
C62|Ruy Lopez: Steinitz Defense|الإسباني: دفاع شتاينتز|e4 e5 Nf3 Nc6 Bb5 d6
C63|Ruy Lopez: Schliemann Gambit|الإسباني: جامبيت شليمان|e4 e5 Nf3 Nc6 Bb5 f5
C64|Ruy Lopez: Classical Defense|الإسباني: الدفاع الكلاسيكي|e4 e5 Nf3 Nc6 Bb5 Bc5
C65|Ruy Lopez: Berlin Defense|الإسباني: دفاع برلين|e4 e5 Nf3 Nc6 Bb5 Nf6
C67|Ruy Lopez: Berlin Defense, Rio Gambit Accepted|برلين: Nxe4|e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4
C70|Ruy Lopez: Morphy Defense|الإسباني: دفاع مورفي|e4 e5 Nf3 Nc6 Bb5 a6
C68|Ruy Lopez: Exchange Variation|الإسباني: تنويع التبادل|e4 e5 Nf3 Nc6 Bb5 a6 Bxc6
C70|Ruy Lopez: Morphy Defense, Ba4|الإسباني: مورفي (Ba4)|e4 e5 Nf3 Nc6 Bb5 a6 Ba4
C78|Ruy Lopez: Morphy Defense, Main Line|الإسباني: مورفي (O-O)|e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O
C80|Ruy Lopez: Open Variation|الإسباني المفتوح|e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Nxe4
C84|Ruy Lopez: Closed Variation|الإسباني المغلق|e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7
C88|Ruy Lopez: Closed, Main Line|الإسباني المغلق: الخط الرئيسي|e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3
C89|Ruy Lopez: Marshall Attack|الإسباني: هجوم مارشال|e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O c3 d5
D00|Queen's Pawn Game|لعبة بيدق الوزير|d4 d5
D00|Blackmar-Diemer Gambit|جامبيت بلاكمار-ديمر|d4 d5 e4
D00|London System|نظام لندن|d4 d5 Bf4
D00|Jobava London System|نظام لندن (جوبافا)|d4 d5 Nc3 Nf6 Bf4
D01|Richter-Veresov Attack|هجوم ريختر-فيريسوف|d4 d5 Nc3 Nf6 Bg5
D02|Queen's Pawn Game: Zukertort Variation|بيدق الوزير: زوكرتورت|d4 d5 Nf3
D02|London System: Main Line|نظام لندن: الخط الرئيسي|d4 d5 Nf3 Nf6 Bf4
D05|Colle System|نظام كولي|d4 d5 Nf3 Nf6 e3 e6 Bd3
D06|Queen's Gambit|جامبيت الوزير|d4 d5 c4
D07|Queen's Gambit Declined: Chigorin Defense|جامبيت الوزير: دفاع تشيجورين|d4 d5 c4 Nc6
D08|Queen's Gambit Declined: Albin Countergambit|جامبيت ألبين المضاد|d4 d5 c4 e5
D10|Slav Defense|الدفاع السلافي|d4 d5 c4 c6
D10|Slav Defense: Exchange Variation|السلافي: التبادل|d4 d5 c4 c6 cxd5 cxd5
D15|Slav Defense: Main Line|السلافي: الخط الرئيسي|d4 d5 c4 c6 Nf3 Nf6 Nc3
D17|Slav Defense: Czech Variation|السلافي: التنويع التشيكي|d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5
D20|Queen's Gambit Accepted|جامبيت الوزير المقبول|d4 d5 c4 dxc4
D30|Queen's Gambit Declined|جامبيت الوزير المرفوض|d4 d5 c4 e6
D31|Queen's Gambit Declined: Queen's Knight Variation|جامبيت الوزير المرفوض: Nc3|d4 d5 c4 e6 Nc3
D32|Tarrasch Defense|دفاع تاراش|d4 d5 c4 e6 Nc3 c5
D35|Queen's Gambit Declined: Exchange Variation|جامبيت الوزير المرفوض: التبادل|d4 d5 c4 e6 Nc3 Nf6 cxd5
D37|Queen's Gambit Declined: Three Knights|جامبيت الوزير المرفوض: الأحصنة الثلاثة|d4 d5 c4 e6 Nc3 Nf6 Nf3
D43|Semi-Slav Defense|الدفاع شبه السلافي|d4 d5 c4 c6 Nf3 Nf6 Nc3 e6
D80|Grünfeld Defense|دفاع جرونفيلد|d4 Nf6 c4 g6 Nc3 d5
D85|Grünfeld Defense: Exchange Variation|جرونفيلد: التبادل|d4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5
E00|Catalan Opening|الافتتاح الكتالوني|d4 Nf6 c4 e6 g3
E10|Indian Game: Anti-Nimzo-Indian|الهندي: ضد نيمزو (Nf3)|d4 Nf6 c4 e6 Nf3
E11|Bogo-Indian Defense|دفاع بوجو الهندي|d4 Nf6 c4 e6 Nf3 Bb4+
E12|Queen's Indian Defense|دفاع الوزير الهندي|d4 Nf6 c4 e6 Nf3 b6
E15|Queen's Indian Defense: Fianchetto|الوزير الهندي: الفيانكيتو|d4 Nf6 c4 e6 Nf3 b6 g3
E20|Nimzo-Indian Defense|دفاع نيمزو الهندي|d4 Nf6 c4 e6 Nc3 Bb4
E32|Nimzo-Indian Defense: Classical Variation|نيمزو الهندي الكلاسيكي|d4 Nf6 c4 e6 Nc3 Bb4 Qc2
E40|Nimzo-Indian Defense: Rubinstein Variation|نيمزو الهندي: روبنشتاين|d4 Nf6 c4 e6 Nc3 Bb4 e3
E60|King's Indian Defense|دفاع الملك الهندي|d4 Nf6 c4 g6
E61|King's Indian Defense: Main Line|دفاع الملك الهندي: Nc3 Bg7|d4 Nf6 c4 g6 Nc3 Bg7
E62|King's Indian Defense: Fianchetto Variation|الملك الهندي: الفيانكيتو|d4 Nf6 c4 g6 Nf3 Bg7 g3
E70|King's Indian Defense: Normal Variation|الملك الهندي: e4 d6|d4 Nf6 c4 g6 Nc3 Bg7 e4 d6
E76|King's Indian Defense: Four Pawns Attack|الملك الهندي: هجوم البيادق الأربعة|d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f4
E80|King's Indian Defense: Sämisch Variation|الملك الهندي: زيميش|d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f3
E90|King's Indian Defense: Classical Variation|الملك الهندي الكلاسيكي|d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3
E97|King's Indian Defense: Mar del Plata|الملك الهندي: مار ديل بلاتا|d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6`;

  const LINES = RAW.split("\n").map(l => { const [eco, en, ar, mv] = l.trim().split("|"); return { eco, en, ar, moves: mv.split(" ") }; });
  // مفتاح الموقف: القطع + الدور + حقوق التبييت (من غير الأخذ في المرور وعدّاد النقلات)
  const key = fen => String(fen).split(" ").slice(0, 3).join(" ");
  let INDEX = null, BAD = [];
  function build(Chess) {
    if (INDEX) return INDEX;
    const C = Chess || (typeof ChessCls !== "undefined" ? ChessCls : null);
    if (!C) return null;
    const idx = new Map(), ends = new Map(), paths = [];
    BAD = [];
    // 1) الخطوط نفسها: كل خط بيوصل لموقف، والموقف ده اسمه اسم الخط
    for (const L of LINES) {
      const g = new C(), path = [];
      let okLine = true;
      for (const mv of L.moves) {
        let r = null; try { r = g.move(mv); } catch (_) {}
        if (!r) { BAD.push(L.eco + " " + L.en + " @ " + mv); okLine = false; break; }
        path.push(key(g.fen()));
      }
      if (!okLine) continue;
      paths.push({ L, path });
      const k = path[path.length - 1];
      if (!ends.has(k)) ends.set(k, L);
    }
    // 2) المواقف اللي في النص: بتاخد اسم آخر خط معروف قبلها على نفس الطريق
    for (const { path } of paths) {
      let cur = null;
      path.forEach((k, i) => {
        if (ends.has(k)) cur = ends.get(k);
        const name = ends.get(k) || cur, prev = idx.get(k);
        if (!name) return;
        const e = { eco: name.eco, en: name.en, ar: name.ar, ply: i + 1, exact: ends.has(k) };
        if (!prev || (e.exact && !prev.exact)) idx.set(k, e);
      });
    }
    INDEX = idx;
    return INDEX;
  }
  // اسم الموقف لو في الكتاب (وإلا null)
  function lookup(fen, Chess) { const ix = build(Chess); return ix ? ix.get(key(fen)) || null : null; }
  // اسم الافتتاح للدور: آخر موقف من الكتاب اتلعب (fens بالترتيب)
  function opening(fens, Chess) { let best = null; for (const f of fens || []) { const e = lookup(f, Chess); if (e) best = e; } return best; }
  root.EcaOpeningBook = { lines: LINES, build, lookup, opening, isBook: (fen, Chess) => !!lookup(fen, Chess), bad: () => BAD.slice(), size: () => LINES.length };
})(typeof window !== "undefined" ? window : globalThis);
