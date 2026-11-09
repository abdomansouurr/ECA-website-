// ECA — homework.js (eca-v23): بيانات واجب الألغاز
// eca-enc:1 (solutions are encoded; see scripts/obfuscate-puzzles.js)
// المصدر: قاعدة ألغاز Lichess الرسمية، منتقاة حسب ثيم الدرس ونطاق تقييم متدرّج حسب الـ Step.
// تم فحص قانونية النقلات بـ chess.js والتحقق من نقلة الحل الأولى بـ Stockfish.
// f = FEN بعد نقلة الخصم الأولى (الطالب عليه أن يتحرك)، m = نقلات الحل UCI بالتبادل.
window.ECA_HOMEWORK = {
  "1-0":{"version":2,"src":"https://lichess.org/training/cnpJG","focus":["oneMove","mateIn1"],"puzzles":[
      {"id":"cnpJG","rating":500,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"r1b2k2/4qppQ/pn5p/1p6/1n6/B6P/P1B2PPK/RN6 w - - 6 27","m":["e2e4"],"alts":[]},
      {"id":"MNSGC","rating":532,"themes":["endgame","kingsideAttack","mate","mateIn1","oneMove"],"f":"6rk/p6q/2pp1rP1/1p2pP2/8/1PNP4/1PP2PP1/2K4R w - - 0 24","m":["e5e2"],"alts":[]},
      {"id":"z5xSf","rating":563,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove","operaMate"],"f":"b1rn1rk1/3R3p/4p1p1/3pP3/2pP2PN/Bq4N1/1P5P/5RK1 w - - 0 32","m":["g5g4"],"alts":[]},
      {"id":"34gd6","rating":594,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove"],"f":"r4rk1/pppqb1p1/2bp3p/5pN1/3Q2nP/1P2P3/PBP1NPP1/2KR3R w - - 1 14","m":["h7b2"],"alts":[]},
      {"id":"NODJi","rating":627,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove"],"f":"r2q1rk1/1pp3bp/3p2p1/pP1n2N1/2P1p2Q/B6P/P4PP1/R3K2R w KQ - 0 19","m":["e7e2"],"alts":[]},
      {"id":"SzrEi","rating":658,"themes":["mate","mateIn1","middlegame","oneMove","queensideAttack"],"f":"1r3rk1/3n1ppp/3pbq2/2p5/B3PP1P/P7/1PPQN3/2KR3R b - - 0 21","m":["g6c8"],"alts":[]},
      {"id":"iOEBr","rating":689,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"8/p2Qnk2/2pB4/1pNp1pq1/3P3n/2P4P/P1P3PK/2R5 b - - 4 35","m":["b1b8"],"alts":[]},
      {"id":"ljreO","rating":720,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"r2q2kr/1bpn1p1n/1p1p2pQ/p2PpN1p/4P2P/2N2P2/PPP3P1/1K1R1B1R w - - 6 18","m":["e6b2"],"alts":[]},
      {"id":"C2fnC","rating":752,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove"],"f":"r5k1/ppp2ppp/5B2/b2q4/2p1r1Q1/P7/1P3PPP/R4RK1 w - - 0 18","m":["b7b2"],"alts":[]},
      {"id":"SBlyv","rating":783,"themes":["mate","mateIn1","oneMove","opening"],"f":"r3kb1r/1pp2ppp/p1n1p3/7q/2B3n1/2NP2N1/PPPB1PP1/R2Q1RK1 b kq - 1 11","m":["e1e8"],"alts":[]},
      {"id":"niNxg","rating":815,"themes":["master","mate","mateIn1","middlegame","oneMove"],"f":"6k1/p4p1p/4bQp1/q1p1P2N/3p4/P7/1r2rPPP/R4RK1 w - - 2 26","m":["g6b2"],"alts":[]},
      {"id":"1X1dN","rating":846,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"r5r1/pp3p1k/4pB2/1bPp2Qp/8/P7/1Pq2PPP/5RK1 w - - 0 28","m":["b1e1"],"alts":[]}
    ]},
  "1-1":{"version":2,"src":"https://lichess.org/training/KJBVQ","focus":["oneMove","fork","hangingPiece"],"puzzles":[
      {"id":"KJBVQ","rating":500,"themes":["crushing","endgame","fork","short"],"f":"8/2RRp1k1/1p2q1p1/1P2p3/p3P3/2P2n2/1P6/1KN5 w - - 0 41","m":["h2d2","d6d2","a2d2"],"alts":[]},
      {"id":"jsVaj","rating":513,"themes":["backRankMate","endgame","fork","mate","mateIn2","short"],"f":"k3q3/pp5r/8/3pn3/3P4/2R3P1/PP3PP1/2R2K2 w - - 0 30","m":["a3a4","d4a4","a5a4"],"alts":[]},
      {"id":"v4GxY","rating":525,"themes":["advantage","fork","middlegame","short"],"f":"2rr2k1/5p1p/8/3q2pN/2p5/4P2P/PP1P1P2/R1B2RK1 w - - 0 24","m":["e1g6","b4b2","g6h1"],"alts":[]},
      {"id":"ntKDB","rating":539,"themes":["backRankMate","fork","mate","mateIn2","middlegame","short"],"f":"1n1r3k/1p2q1pp/r3Pp2/p7/B7/3Q4/PPP3PP/2KR4 w - - 0 24","m":["h3h4","d2h4","h5h4"],"alts":[]},
      {"id":"Bl37D","rating":552,"themes":["advancedPawn","endgame","mate","mateIn1","oneMove"],"f":"8/3R4/8/8/3b4/3k1p2/4p3/4K3 b - - 9 81","m":["g3g8"],"alts":[]},
      {"id":"e1BM1","rating":565,"themes":["crushing","endgame","fork","master","short"],"f":"8/8/3p3k/1ppP4/2n1R2P/2P1p3/8/5K2 b - - 3 54","m":["a7h8","g5d8","h8d7"],"alts":[]},
      {"id":"pkCto","rating":579,"themes":["advantage","endgame","fork","short"],"f":"2r3k1/pp4pp/8/3Nb3/2p5/2Pn4/PP4PP/R1B3K1 w - - 3 21","m":["h1d2","b4g2","d2a4"],"alts":[]},
      {"id":"gzJG3","rating":592,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove"],"f":"rn2k2r/1pp3pp/3bp3/4q3/3N4/pPP5/P2B1PPP/R2Q1RK1 b kq - 0 15","m":["d1e8"],"alts":[]},
      {"id":"nWBFY","rating":605,"themes":["endgame","hangingPiece","mate","mateIn2","operaMate","short"],"f":"2R1r1k1/pp1n1ppp/6q1/8/8/B3P2P/P4PP1/6K1 w - - 0 23","m":["a4d4","h2g4","d4g4"],"alts":[]},
      {"id":"TP6Mx","rating":618,"themes":["advantage","endgame","hangingPiece","master","short"],"f":"2r3k1/3p1p2/1B2p1p1/1r2P2p/bK3P2/2R3P1/1R5P/8 w - - 14 43","m":["c7f7","c1c8","a3a4"],"alts":[]},
      {"id":"iM9IS","rating":631,"themes":["backRankMate","hangingPiece","mate","mateIn1","middlegame","oneMove"],"f":"2rq1rk1/3nb1pp/p3N3/1p1p3Q/8/8/PPP3PP/R1B2R1K b - - 0 17","m":["g4g5"],"alts":[]},
      {"id":"OEGTJ","rating":644,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove"],"f":"r4rk1/5bpp/1pp1q3/p3Q3/6P1/2B4P/P1P2PB1/1R4K1 w - - 1 28","m":["d1b2"],"alts":[]}
    ]},
  "1-2":{"version":2,"src":"https://lichess.org/training/sKvFF","focus":["hangingPiece","capturingDefender","fork"],"puzzles":[
      {"id":"sKvFF","rating":504,"themes":["hangingPiece","kingsideAttack","mate","mateIn1","middlegame","oneMove"],"f":"r1b1r1k1/1p3ppp/p7/1Q1p4/1n3B2/5NP1/PqP1N1BP/4RK2 w - - 0 19","m":["c1d4"],"alts":[]},
      {"id":"MdaSp","rating":516,"themes":["endgame","hangingPiece","mate","mateIn1","oneMove"],"f":"5r1k/pR5p/3Q4/3Bp1p1/2Pq4/3P4/r6P/7K w - - 5 36","m":["h6g4"],"alts":[]},
      {"id":"SSMwJ","rating":534,"themes":["crushing","endgame","hangingPiece","master","short"],"f":"8/2k3QP/p4q2/1p3p2/3p4/1P1P2p1/PKP2p2/2R2n1R b - - 0 45","m":["g6b2","e2e4b","b2e4"],"alts":[]},
      {"id":"Xl508","rating":551,"themes":["advantage","endgame","fork","short"],"f":"3k2r1/pb4r1/1p6/3pN3/3P4/2P5/PPK4Q/8 b - - 7 32","m":["b2b8","e8b8","b4b8"],"alts":[]},
      {"id":"zi5Du","rating":568,"themes":["hangingPiece","mate","mateIn1","middlegame","oneMove","queensideAttack"],"f":"k1r5/pp3q2/5n1p/5Qp1/8/2P2PP1/1P1R2P1/rbK4R w - - 0 37","m":["g1a4"],"alts":[]},
      {"id":"P9qU7","rating":585,"themes":["crushing","endgame","fork","short"],"f":"7k/1p2N3/p4p2/4r2p/P6P/1PP3PK/8/8 w - - 1 45","m":["d2b6","e4e2","b6d1"],"alts":[]},
      {"id":"n5IRv","rating":603,"themes":["crushing","fork","middlegame","short"],"f":"1r1qk2r/1ppb1p1p/5p2/p7/P1P5/2nP1NQ1/4PPBP/R4RK1 b k - 2 18","m":["a3d8","b5e5","d8b3"],"alts":[]},
      {"id":"ZUS9S","rating":621,"themes":["crushing","endgame","fork","master","short"],"f":"3r3k/6pp/3N2n1/8/8/4P1P1/4P2P/1B4K1 w - - 1 29","m":["h6g2","e4b4","g2h4"],"alts":[]},
      {"id":"MahJd","rating":637,"themes":["hangingPiece","mate","mateIn1","middlegame","oneMove"],"f":"r1rk1q1Q/4R3/p3pPp1/1p1pb3/8/P7/7P/5R1K w - - 4 36","m":["e4g4"],"alts":[]},
      {"id":"HGAyB","rating":654,"themes":["crushing","endgame","fork","short"],"f":"1N3b2/5p2/1k5p/1p2PK2/8/7P/P7/8 w - - 1 48","m":["c4h2","c6a6","h2g4"],"alts":[]},
      {"id":"va8ed","rating":671,"themes":["hangingPiece","mate","mateIn1","middlegame","oneMove","queensideAttack"],"f":"1k1r4/pp1n1p2/2pqppp1/Q6r/3P4/3R1N2/PPP2PPP/2K4R w - - 6 19","m":["f1h4"],"alts":[]},
      {"id":"RxbND","rating":688,"themes":["backRankMate","hangingPiece","mate","mateIn2","middlegame","short"],"f":"r2q1rk1/p4p1p/bnp1p1pQ/6N1/1bP5/1P1B4/P4PPP/R1B2K1R b - - 3 16","m":["h4h3","g5b5","h3h5"],"alts":[]}
    ]},
  "1-3":{"version":2,"src":"https://lichess.org/training/Eaw2J","focus":["advancedPawn","promotion","enPassant","pawnEndgame"],"puzzles":[
      {"id":"Eaw2J","rating":500,"themes":["advancedPawn","crushing","endgame","promotion","short"],"f":"7K/2p2kPP/8/8/8/8/1p6/6r1 w - - 0 58","m":["b2b4b","b5b4","e2b4b"],"alts":[]},
      {"id":"2GN0V","rating":518,"themes":["advancedPawn","crushing","endgame","knightEndgame","short"],"f":"8/8/7p/7P/1pk2PP1/5K2/N7/8 b - - 0 61","m":["c7c3","f8a5","c3c8"],"alts":[]},
      {"id":"Omexz","rating":536,"themes":["advancedPawn","crushing","endgame","long","pawnEndgame","promotion"],"f":"8/8/8/P7/1K5p/6k1/8/8 w - - 1 59","m":["f1f6","b3g8","f6f2","e7e3","f2f4b"],"alts":[]},
      {"id":"Bmzyy","rating":554,"themes":["advancedPawn","bishopEndgame","endgame","mate","mateIn2","short"],"f":"6k1/6P1/5KP1/7P/p1b5/8/8/8 w - - 0 63","m":["e1e6","f7f3","e6e2"],"alts":[]},
      {"id":"DMgy1","rating":572,"themes":["advancedPawn","crushing","endgame","long","pawnEndgame","quietMove"],"f":"8/7p/8/p7/8/1k1K2P1/5P1P/8 b - - 1 40","m":["f1f7","g8g7","f7f3","g7g1","f3f8"],"alts":[]},
      {"id":"5wxhJ","rating":590,"themes":["advancedPawn","crushing","endgame","long","pawnEndgame","promotion"],"f":"8/8/1K1k4/8/PP1P1p2/8/8/8 b - - 0 43","m":["g7g3","f7f1","g3g8","f1f6","g8g5b"],"alts":[]},
      {"id":"JJR9T","rating":609,"themes":["advancedPawn","advantage","endgame","long","promotion","rookEndgame"],"f":"2r3k1/2P3p1/p6p/3P4/8/8/P4P2/6K1 w - - 1 38","m":["h1h6","b4g2","h6h2","a4a2","h2h4b"],"alts":[]},
      {"id":"IUfbH","rating":626,"themes":["advancedPawn","crushing","endgame","master","masterVsMaster","promotion","short"],"f":"8/1r4k1/PP2p3/7p/6p1/4b1P1/6KP/8 w - - 0 47","m":["f6c2","d3c6","c2c4b"],"alts":[]},
      {"id":"Hq0TD","rating":645,"themes":["advancedPawn","crushing","endgame","long","pawnEndgame","quietMove"],"f":"8/8/8/K3P1kp/P3P3/8/8/8 b - - 0 50","m":["e1e7","f1c6","e7e3","f7f1","e3e8"],"alts":[]},
      {"id":"acj5Y","rating":663,"themes":["endgame","mate","mateIn1","oneMove","pawnEndgame"],"f":"8/5pk1/3P2p1/6Kp/5P1P/8/5P2/8 b - - 0 45","m":["g2g6"],"alts":[]},
      {"id":"pajhT","rating":681,"themes":["advancedPawn","crushing","endgame","long","pawnEndgame"],"f":"8/8/4kp2/3p4/3P1KPp/p6P/P7/8 w - - 1 50","m":["b7b1","g6g1","b1b6","d6g6","b6b2"],"alts":[]},
      {"id":"W3Zkx","rating":699,"themes":["advancedPawn","discoveredAttack","endgame","mate","mateIn2","promotion","short"],"f":"8/pp6/8/1k1P4/1P1b2Q1/P3p3/6PP/6K1 b - - 0 36","m":["d3d8","b7h7","d8d5b"],"alts":[]},
      {"id":"fK8Ta","rating":717,"themes":["advancedPawn","mate","mateIn1","middlegame","oneMove"],"f":"2rr3k/1R2pQqp/3b2pP/p4pN1/5P2/3P4/6P1/5R1K w - - 4 30","m":["e6b2"],"alts":[]},
      {"id":"X7QWl","rating":736,"themes":["advancedPawn","crushing","endgame","pawnEndgame","promotion","quietMove","veryLong"],"f":"8/p6p/8/1p6/1p2PK2/2k4P/P5P1/8 w - - 6 38","m":["d7d1","a3c8","d1d6","c8f8","d6d2","c7c3","d2d4b"],"alts":[]},
      {"id":"5iW43","rating":753,"themes":["advancedPawn","endgame","master","mate","mateIn1","oneMove","promotion"],"f":"6k1/1b2P2p/p7/1p1q1p2/1PpB4/P6P/3b2P1/6K1 w - - 0 44","m":["d2d4b"],"alts":[]}
    ]},
  "1-4":{"version":2,"src":"https://lichess.org/training/zPdP9","focus":["defensiveMove","equality","trappedPiece"],"puzzles":[
      {"id":"zPdP9","rating":501,"themes":["crushing","defensiveMove","endgame","rookEndgame","short"],"f":"8/6p1/5p1p/2p2PP1/3r1P1P/2k1RK2/8/8 b - - 1 49","m":["h7h3","d3h3","a3h3"],"alts":[]},
      {"id":"bYqhT","rating":518,"themes":["crushing","defensiveMove","endgame","pawnEndgame","quietMove","short"],"f":"8/8/7p/8/8/PK4k1/8/8 b - - 0 52","m":["e6e1","f3f7","e1e7"],"alts":[]},
      {"id":"1g9Nq","rating":541,"themes":["crushing","defensiveMove","endgame","pawnEndgame","quietMove","short"],"f":"8/8/p7/6Kp/1k5P/6P1/8/8 b - - 2 55","m":["f6f1","b1e1","f1f7"],"alts":[]},
      {"id":"5uXd3","rating":562,"themes":["crushing","defensiveMove","endgame","rookEndgame","short"],"f":"8/p7/1p6/kr4R1/6PK/8/8/8 w - - 0 68","m":["b1c1","f1c1","b7b1"],"alts":[]},
      {"id":"ZShLp","rating":582,"themes":["equality","hangingPiece","oneMove","opening"],"f":"rnbqkb1r/p4Bp1/2pp1n1p/1p2p3/3PP3/2N2N1P/PPP2PP1/R1BQK2R b KQkq - 0 7","m":["d4g2"],"alts":[]},
      {"id":"KclG9","rating":603,"themes":["advancedPawn","bishopEndgame","crushing","endgame","short","trappedPiece"],"f":"b7/P7/KP1k4/8/8/8/8/8 w - - 1 61","m":["c6c2","f4c2","f6c2"],"alts":[]},
      {"id":"e2IJL","rating":624,"themes":["crushing","defensiveMove","endgame","master","pawnEndgame","quietMove","short"],"f":"8/8/6p1/8/p7/P1PK1k2/1P6/8 b - - 1 66","m":["b6b1","h3h8","b1b7"],"alts":[]},
      {"id":"N5X8k","rating":644,"themes":["advantage","defensiveMove","endgame","fork","short"],"f":"8/4k1R1/7p/3K1BbP/8/4r3/8/8 b - - 12 60","m":["d2g6","b2b6","g6g1"],"alts":[]},
      {"id":"EyMgk","rating":664,"themes":["crushing","endgame","knightEndgame","short","trappedPiece"],"f":"7n/7P/5K2/6p1/7k/8/8/8 w - - 4 54","m":["g6b2","b1b7","b2e4"],"alts":[]},
      {"id":"1cJ8l","rating":685,"themes":["advantage","middlegame","short","trappedPiece"],"f":"r3b1k1/3P1pp1/6np/1p6/2pqN3/5P2/6PP/3R1BK1 w - - 0 38","m":["h5h7","d4h2","h7h2"],"alts":[]},
      {"id":"K49Wk","rating":705,"themes":["crushing","defensiveMove","endgame","master","short"],"f":"8/8/8/pp4K1/8/7P/P3k1B1/5q2 w - - 0 51","m":["b8g5","d8g5","e3e7"],"alts":[]},
      {"id":"pc0GV","rating":726,"themes":["equality","middlegame","short"],"f":"3q1rk1/p2nppbp/6p1/1pQ5/8/4PB1P/P4PPB/3R1RK1 b - - 0 18","m":["h2a1","h5h4","g4h4"],"alts":[]},
      {"id":"nu7Uh","rating":746,"themes":["endgame","equality","pawnEndgame","short"],"f":"8/8/1p6/1Pk1p3/4Kp2/5P2/8/8 w - - 1 67","m":["d7d1","a1c1","d1g7"],"alts":[]},
      {"id":"86rRi","rating":767,"themes":["crushing","defensiveMove","endgame","pawnEndgame","short","zugzwang"],"f":"8/8/8/5p2/3k2P1/6P1/3K4/8 b - - 0 60","m":["g1b7","h8d8","h7d7"],"alts":[]},
      {"id":"omFn3","rating":787,"themes":["advancedPawn","crushing","endgame","short","trappedPiece"],"f":"b7/4k2p/1P6/2N2p2/8/8/6P1/7K w - - 0 41","m":["c6c2","f4c2","a1c2"],"alts":[]}
    ]},
  "1-5":{"version":2,"src":"https://lichess.org/training/774Hh","focus":["mateIn1","doubleCheck","discoveredCheck"],"puzzles":[
      {"id":"774Hh","rating":500,"themes":["advancedPawn","discoveredCheck","doubleCheck","endgame","mate","mateIn2","promotion","queenRookEndgame","queensideAttack","short"],"f":"k1r5/Pr3ppp/1p2p3/3pP3/3P1PP1/6PK/1q6/R1R5 w - - 0 33","m":["a5a4","c2c4","f2c4b"],"alts":[]},
      {"id":"cmedI","rating":513,"themes":["endgame","kingsideAttack","mate","mateIn1","oneMove"],"f":"r4rk1/5ppp/4p3/pp2P1q1/P3Q3/6P1/1P2PP2/R3K2R w KQ - 0 19","m":["d7e2"],"alts":[]},
      {"id":"S3ko2","rating":527,"themes":["discoveredCheck","doubleCheck","endgame","mate","mateIn1","oneMove","pillsburysMate"],"f":"6k1/6pp/5p2/3R4/p1BP4/2r3P1/1r4PK/8 w - - 2 36","m":["h1h4"],"alts":[]},
      {"id":"OlGsg","rating":541,"themes":["discoveredCheck","doubleCheck","epauletteMate","master","mate","mateIn1","middlegame","oneMove"],"f":"r2qkb1r/3n1ppp/1p6/p2p1n1P/4NB2/5NP1/PP3PB1/R3R1K1 w kq - 0 18","m":["d7h6"],"alts":[]},
      {"id":"BOSDh","rating":554,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"2r3k1/p3rp2/1p6/2p1bPpp/4BB1n/1P1P2KP/P4P2/3RR3 b - - 3 39","m":["d1g7"],"alts":[]},
      {"id":"sxLpS","rating":568,"themes":["endgame","mate","mateIn1","oneMove"],"f":"3q1r1k/5bp1/pp4Rp/2p1QP2/6BP/P7/1PP5/1K6 w - - 1 31","m":["d1b2"],"alts":[]},
      {"id":"K7ZkG","rating":581,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove"],"f":"2k3rr/ppp2p2/2nbpp1p/7q/2PP4/1P3B2/P2N1PPP/R2Q1R1K b - - 0 14","m":["e1e8"],"alts":[]},
      {"id":"EjggH","rating":595,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove"],"f":"3rr1k1/1bq2pp1/p3p2p/1p6/2P1P1Q1/2B5/P1PN2nP/3RR1K1 w - - 0 26","m":["b7b2"],"alts":[]},
      {"id":"BCpjt","rating":609,"themes":["discoveredCheck","doubleCheck","mate","mateIn1","middlegame","oneMove"],"f":"rn1qkb1r/2p1pppp/p4n2/1N1b4/Q1pP4/4PN2/PP3PPP/R1B1KB1R w KQkq - 1 8","m":["c1h6"],"alts":[]},
      {"id":"2BGIr","rating":622,"themes":["endgame","kingsideAttack","mate","mateIn1","oneMove"],"f":"r5k1/1pp2pp1/pb1p3p/3P3P/8/1PQ1q3/PBP3P1/1K5R w - - 0 26","m":["a3b2"],"alts":[]},
      {"id":"VYBMM","rating":636,"themes":["endgame","mate","mateIn1","oneMove"],"f":"8/7k/7q/3R4/7P/P4p2/4nP1K/3R4 b - - 0 41","m":["e6e7"],"alts":[]},
      {"id":"pkpT9","rating":649,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"3bNrk1/r2q1ppp/1p6/p3Q3/P7/1P3PP1/R5K1/5R2 w - - 0 29","m":["d1b2"],"alts":[]},
      {"id":"ImEqj","rating":663,"themes":["advancedPawn","discoveredAttack","discoveredCheck","endgame","mate","mateIn2","promotion","short"],"f":"6k1/p4p1p/6p1/1b6/8/3p4/PR3PPP/5K2 b - - 0 30","m":["h3h8","c8c1","h8h5b"],"alts":[]},
      {"id":"MhRC0","rating":676,"themes":["master","mate","mateIn1","middlegame","oneMove"],"f":"4r1k1/5pp1/p3b2r/8/5n2/2PBQ3/1P3PP1/4RK1N b - - 0 37","m":["e6e5"],"alts":[]},
      {"id":"QMCfT","rating":690,"themes":["master","mate","mateIn1","middlegame","oneMove","operaMate"],"f":"2rkn3/p3rp2/1p1p1p2/3PpBq1/4P3/3P1QP1/P4PK1/2R5 w - - 0 35","m":["a5a4"],"alts":[]}
    ]},
  "1-6":{"version":2,"src":"https://lichess.org/training/1Dgoa","focus":["mateIn1"],"puzzles":[
      {"id":"1Dgoa","rating":509,"themes":["endgame","mate","mateIn1","oneMove"],"f":"1q1n2k1/4p2p/2QpNbp1/p2P4/1p3P2/1R5P/6P1/7K w - - 6 37","m":["a6d4"],"alts":[]},
      {"id":"GuILR","rating":522,"themes":["endgame","mate","mateIn1","oneMove"],"f":"5Q2/1N1p2pk/p1q1p1r1/1p2P3/7p/7P/PPP3P1/5R1K b - - 0 26","m":["a6b8"],"alts":[]},
      {"id":"vzyRr","rating":549,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"r2k3r/pppb2pp/4pN1n/n7/1B6/8/q1P1PPPP/3QKB1R w K - 2 16","m":["h5h2"],"alts":[]},
      {"id":"10QeB","rating":574,"themes":["endgame","mate","mateIn1","oneMove"],"f":"8/8/8/2P1nk2/7B/7p/1P3PpP/4R1K1 b - - 0 42","m":["d1g3"],"alts":[]},
      {"id":"oTIYr","rating":599,"themes":["hangingPiece","mate","mateIn1","middlegame","oneMove"],"f":"N1bk2nr/pp1p1ppp/q7/1Rb1P3/8/4PN2/2nBKPPP/3Q1B1R b - - 3 13","m":["f6c1"],"alts":[]},
      {"id":"s4wfx","rating":623,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"7Q/pp1k4/2p5/2pn1pB1/6pK/2Pq4/PP5N/R6R b - - 5 27","m":["h3e3"],"alts":[]},
      {"id":"TK4d6","rating":648,"themes":["endgame","mate","mateIn1","oneMove"],"f":"6k1/pp3pp1/2n5/6q1/5n2/2P2P1R/1P4PK/4RB2 w - - 13 29","m":["d5d4"],"alts":[]},
      {"id":"R73kR","rating":673,"themes":["arabianMate","mate","mateIn1","middlegame","oneMove"],"f":"r4q1k/1p5r/p1np1N2/6p1/8/7R/PPP2PPP/2K4R w - - 0 22","m":["e3e2"],"alts":[]},
      {"id":"1z1dz","rating":698,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"5rk1/3r1pb1/p3q3/1p6/8/2P1PRP1/1PQ3K1/7R w - - 4 36","m":["a8e2"],"alts":[]},
      {"id":"CQMxa","rating":722,"themes":["mate","mateIn1","middlegame","oneMove","queensideAttack"],"f":"r3k2r/pp3ppp/2p1p3/q2pN3/1n1Pb3/bP2QP2/P1P1P1PP/BK1R1B1R b kq - 0 13","m":["d7a8"],"alts":[]},
      {"id":"vWT1H","rating":747,"themes":["hangingPiece","master","mate","mateIn1","middlegame","oneMove"],"f":"6rk/1p1b3p/1n1p1n1r/2pP1p2/p1P1pP1Q/P1N1N3/1P4PK/3BR1R1 b - - 2 29","m":["e6e7"],"alts":[]},
      {"id":"8Fr1k","rating":772,"themes":["advancedPawn","endgame","mate","mateIn1","oneMove","promotion"],"f":"3r2k1/2P3p1/4b1P1/7P/8/1p6/8/6K1 w - - 0 50","m":["a2h4b"],"alts":[]},
      {"id":"Db8BM","rating":797,"themes":["mate","mateIn1","middlegame","oneMove","smotheredMate"],"f":"2kr2nr/1bpp2pp/8/Q2P1p2/B1p5/5P1n/P2B2PP/6RK b - - 0 26","m":["e3g8"],"alts":[]},
      {"id":"qP27U","rating":821,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"6k1/pp3p2/2p4p/6p1/1B4Q1/3r3q/P2Nr2P/R5RK b - - 7 30","m":["d8e8"],"alts":[]},
      {"id":"LBzP9","rating":846,"themes":["endgame","master","mate","mateIn1","oneMove","queenRookEndgame"],"f":"6k1/2R1R3/q5p1/5p1p/5P2/5rPK/7P/8 w - - 1 46","m":["d2d4"],"alts":[]}
    ]},
  "1-7":{"version":2,"src":"https://lichess.org/training/JG01V","focus":["mateIn2"],"puzzles":[
      {"id":"JG01V","rating":510,"themes":["endgame","master","mate","mateIn2","short"],"f":"5k2/p1R1ppb1/1p4pp/1NB5/4r3/PK5P/5PP1/3r4 w - - 0 26","m":["a2a4","h5h4","a4h4"],"alts":[]},
      {"id":"k4Nwn","rating":534,"themes":["endgame","mate","mateIn2","short"],"f":"7k/2N3rp/8/8/2P5/P4p1P/1r3q2/4R1RK w - - 0 35","m":["d5d4","b2b4","b5b4"],"alts":[]},
      {"id":"lg4Or","rating":560,"themes":["endgame","master","mate","mateIn2","rookEndgame","short"],"f":"7k/7p/4rPp1/6p1/1R4P1/8/6K1/r7 w - - 0 43","m":["c7c4","d6d4","c4d4"],"alts":[]},
      {"id":"zpdxh","rating":585,"themes":["endgame","mate","mateIn2","queensideAttack","short"],"f":"1k6/pp5p/2nN1p2/1N2p3/2Q2b1q/8/PPP2P1P/6K1 w - - 1 24","m":["a7b4","a6h4","b4h4"],"alts":[]},
      {"id":"5pTzo","rating":614,"themes":["backRankMate","endgame","mate","mateIn2","short"],"f":"2b5/1pq3kp/8/4Rp2/P1r1p3/7R/1Q3PPP/6K1 b - - 0 31","m":["a7a5","c8a5","a2a5"],"alts":[]},
      {"id":"yVmEW","rating":636,"themes":["endgame","mate","mateIn2","queensideAttack","short"],"f":"2r1rk2/pp3p2/5n2/6p1/3P2P1/5B1Q/PP3PP1/1K2R3 b - - 0 29","m":["d4d5","g3h5","d5h5"],"alts":[]},
      {"id":"6L0Ij","rating":660,"themes":["mate","mateIn2","middlegame","short"],"f":"r1b2r1k/ppp4B/8/2b1p1N1/5P2/2B2K2/PP4PP/n7 w - - 0 21","m":["a3d1","g4g6","d1g6"],"alts":[]},
      {"id":"bvBUu","rating":685,"themes":["mate","mateIn2","middlegame","operaMate","short"],"f":"5B2/3r3r/pRR4p/3p2pk/P2P1p2/1P1bpP2/6P1/3n2K1 w - - 9 44","m":["a6e6","e2e6","c6e6"],"alts":[]},
      {"id":"3kzRE","rating":712,"themes":["kingsideAttack","mate","mateIn2","middlegame","short"],"f":"4r1k1/p4ppp/1pbq1n2/3pr3/3Q4/1NP2B1P/PP1R1PP1/3R2K1 b - - 0 21","m":["d1d5","h5d5","d4d5"],"alts":[]},
      {"id":"aBMia","rating":735,"themes":["kingsideAttack","mate","mateIn2","middlegame","short"],"f":"4r1k1/1pqnrpp1/2p3p1/p2P2N1/8/7P/QP3PP1/R1BR2K1 b - - 0 22","m":["d2d5","h5d5","d4d5"],"alts":[]},
      {"id":"mKbOz","rating":760,"themes":["backRankMate","endgame","mate","mateIn2","short"],"f":"4r1k1/pp3ppp/2p5/5b2/8/P2B4/1P3PPP/R1B2K2 b - - 0 20","m":["g1h3","g5b5","d4d5"],"alts":[]},
      {"id":"Jo9od","rating":786,"themes":["fork","mate","mateIn2","middlegame","short"],"f":"rn4k1/ppp1rppp/7q/2PQ4/8/6R1/PPP2K1P/RN6 w - - 3 19","m":["h1h4","d2d4","h4d4"],"alts":[]},
      {"id":"Se3rZ","rating":811,"themes":["endgame","mate","mateIn2","short"],"f":"8/2p2ppk/P5rp/8/1P1BQ3/2P3Pq/8/5RK1 b - - 0 30","m":["e3b3","d7b8","b3b8"],"alts":[]},
      {"id":"RGG6w","rating":836,"themes":["kingsideAttack","mate","mateIn2","middlegame","short"],"f":"6k1/pp3ppp/1q2pn2/5b2/8/P1B5/B1r2PPP/1R1QR1K1 b - - 3 26","m":["c6g8","b5e5","g8b8"],"alts":[]},
      {"id":"cWAkw","rating":861,"themes":["endgame","mate","mateIn2","short"],"f":"3r2k1/1b2qp2/p5pQ/6N1/8/3B2P1/PP3P1P/6K1 w - - 0 31","m":["e6e2","b4g4","e2e4"],"alts":[]}
    ]},
  "1-8":{"version":2,"src":"https://lichess.org/training/TWRdc","focus":["castling"],"puzzles":[
      {"id":"TWRdc","rating":1161,"themes":["castling","crushing","discoveredAttack","discoveredCheck","middlegame","short"],"f":"r1bqk2r/pp3p2/2p4p/6p1/1b2n3/2N3B1/PP3PPP/R2QKB1R w KQkq - 0 12","m":["h5h4","d4h4","d5a5"],"alts":[]},
      {"id":"92t7C","rating":1192,"themes":["castling","crushing","discoveredAttack","discoveredCheck","master","opening","short"],"f":"r1bqk2r/pp3ppp/2p1p3/8/1bP1n3/2N1B3/PP3PPP/R2QKB1R w KQkq - 0 9","m":["h5h4","d4h4","d5a5"],"alts":[]},
      {"id":"eAVdM","rating":1214,"themes":["advantage","castling","middlegame","short"],"f":"r3k2r/1q3pQ1/p3p2p/2P5/8/2B2b1P/PPP2P2/R3R1K1 b kq - 0 21","m":["d4a4","b2e4","h4e4"],"alts":[]},
      {"id":"rOZop","rating":1214,"themes":["advantage","castling","defensiveMove","hangingPiece","middlegame","short"],"f":"2r3k1/pQ3ppp/5n2/1N2r3/qP3Bb1/8/6PP/1R2K2R w K - 0 21","m":["g7d1","a4d4","d5b5"],"alts":[]},
      {"id":"aCnNR","rating":1231,"themes":["advantage","castling","defensiveMove","hangingPiece","middlegame","pin","short"],"f":"r5k1/1b2q1p1/7p/p1Bp1r2/1p2N3/P1Pn3P/BP2Q1P1/R3K3 w Q - 0 26","m":["d8h3","d2d6","d5a5"],"alts":[]},
      {"id":"BeR4j","rating":1231,"themes":["castling","crushing","master","middlegame","short"],"f":"r3kbnr/pp3pp1/7p/4P3/3N2QP/8/PP3P2/R3KB1q w Qkq - 0 15","m":["d5a5","e5g5","h5g5"],"alts":[]},
      {"id":"pj56w","rating":1245,"themes":["advantage","castling","discoveredAttack","discoveredCheck","middlegame","short"],"f":"r6r/1p1kn2p/p4pp1/4p3/1bP1b3/2N3B1/PP2NP1P/R3K1R1 w Q - 2 20","m":["d5a5","h2d6","a3d7"],"alts":[]},
      {"id":"TiOS8","rating":1248,"themes":["advantage","castling","middlegame","short","trappedPiece"],"f":"2r3k1/pp5p/1qn1p1pB/3p1bN1/8/1PP5/P2QBPPP/b3K2R w K - 2 21","m":["d5b5","f5a3","h8a3"],"alts":[]},
      {"id":"oCRV0","rating":1299,"themes":["advantage","castling","middlegame","short"],"f":"r4knr/ppp2ppp/3p4/8/3P1Q2/2N1B2b/PPP4P/R3KB1q w Q - 2 13","m":["d5a5","e5a6","g5e3"],"alts":[]},
      {"id":"J72b2","rating":1348,"themes":["advantage","castling","discoveredAttack","discoveredCheck","opening","short"],"f":"rnbqk2r/ppp2ppp/8/4P3/1bp1n3/2N1B3/PP3PPP/R2QKBNR w KQkq - 0 7","m":["h5h4","d4h4","d5a5"],"alts":[]},
      {"id":"QJcgp","rating":1403,"themes":["advantage","castling","defensiveMove","middlegame","short"],"f":"4r1k1/3p1pnp/qp3Bp1/8/3pBPP1/1P3Q2/rnP4P/R3K2R w KQ - 0 26","m":["f5f8","f6f8","d5b5"],"alts":[]},
      {"id":"TL1UD","rating":1451,"themes":["advantage","castling","discoveredAttack","discoveredCheck","middlegame","short"],"f":"r3kb1r/ppp2ppp/2n5/1B6/4P3/5P1P/PP3PP1/R1BK3R b kq - 2 11","m":["d4a4","h5d8","a6h7"],"alts":[]},
      {"id":"0gvkC","rating":1501,"themes":["advantage","castling","middlegame","pin","short"],"f":"r2r4/ppp2k1p/2n3p1/8/8/2P2b2/P1P1N2P/R1B1K2R w KQ - 0 16","m":["d5b5","g2b4","g5g3"],"alts":[]},
      {"id":"SeqEA","rating":1551,"themes":["advantage","castling","middlegame","short"],"f":"r3k3/pppqbpQ1/2np1n2/4p3/2P4P/2N1P3/PP1P3P/R1B2RK1 b q - 0 13","m":["d4a4","g5g6","d2g6"],"alts":[]},
      {"id":"kixWA","rating":1600,"themes":["advantage","castling","opening","short"],"f":"r1b1kb1r/ppppqppp/2n5/8/2BPn3/5N2/PP3PPP/RNBQK2R w KQkq - 2 7","m":["d5b5","h2h1","a7h1"],"alts":[]}
    ]},
  "1-9":{"version":2,"src":"https://lichess.org/training/ei5g0","focus":["sacrifice","capturingDefender"],"puzzles":[
      {"id":"ei5g0","rating":503,"themes":["backRankMate","endgame","mate","mateIn2","sacrifice","short"],"f":"3r2k1/1p3ppp/p1p2q2/8/2n5/2P1Q1P1/PP3PBP/4R1K1 w - - 2 31","m":["d3d4","h4d4","d5d4"],"alts":[]},
      {"id":"sQxvX","rating":521,"themes":["endgame","long","mate","mateIn3","sacrifice"],"f":"6k1/ppp2p1p/2n4P/2pRr1r1/2K2p2/2P5/P7/3R4 w - - 0 36","m":["h1h4","a6h4","h5h4","d1d4","h4d4"],"alts":[]},
      {"id":"eNVbu","rating":545,"themes":["advantage","capturingDefender","discoveredAttack","master","middlegame","short"],"f":"6k1/1p1r1pp1/4qb2/3Q3P/p7/P6P/KP1RB3/N1r5 w - - 0 33","m":["h1d6","g2d6","h8h2"],"alts":[]},
      {"id":"ds3oa","rating":566,"themes":["backRankMate","endgame","mate","mateIn2","sacrifice","short"],"f":"1r5k/5Qpp/p7/qp6/2p5/8/6PP/5R1K w - - 2 34","m":["g2g4","c4g4","g5g4"],"alts":[]},
      {"id":"6JvjS","rating":587,"themes":["endgame","mate","mateIn2","operaMate","sacrifice","short"],"f":"r5k1/pp1q2pp/2pBb3/8/3P1Q2/P6P/1P4P1/5RK1 w - - 5 26","m":["g7g4","f4g4","g5g4"],"alts":[]},
      {"id":"MdWui","rating":608,"themes":["endgame","mate","mateIn2","sacrifice","short"],"f":"2r3k1/R5b1/1p4p1/3p4/3Pr3/1Q2B1Pp/PP3P1P/6K1 b - - 0 24","m":["a4a5","d3a5","d7d5"],"alts":[]},
      {"id":"wzXvv","rating":630,"themes":["mate","mateIn2","middlegame","sacrifice","short"],"f":"3r2k1/pp1r2pp/4p3/1q1n2P1/8/BP3Q1P/P7/2R2R1K w - - 0 27","m":["g3g4","h4g4","g5g4"],"alts":[]},
      {"id":"IUUH8","rating":650,"themes":["backRankMate","mate","mateIn2","middlegame","sacrifice","short"],"f":"r6k/6pp/p3Qb1q/3pR3/1p6/6N1/PPP2rPP/R6K w - - 3 26","m":["d6d4","f4d4","d1d4"],"alts":[]},
      {"id":"gJTZ5","rating":671,"themes":["endgame","kingsideAttack","mate","mateIn2","sacrifice","short"],"f":"3R4/2p1rk2/p2bq2p/Pp3pp1/3Q4/2P5/1P3PPP/3R2K1 b - - 3 30","m":["d6d5","h5d5","d2d5"],"alts":[]},
      {"id":"atmBC","rating":692,"themes":["crushing","endgame","long","master","sacrifice"],"f":"6R1/4r1kp/3p1q2/2pP4/6P1/2Q3p1/1P4P1/6K1 b - - 1 36","m":["b2b4","a3g6","d2d5","g6g5","d5g5"],"alts":[]},
      {"id":"pB6cc","rating":713,"themes":["kingsideAttack","mate","mateIn2","middlegame","sacrifice","short"],"f":"r6k/pp4pp/1np1Q3/3n1Nq1/6r1/3P4/P4PPP/R3R1K1 w - - 2 26","m":["d6d4","f4d4","d5d4"],"alts":[]},
      {"id":"l1Pgu","rating":734,"themes":["backRankMate","endgame","long","mate","mateIn3","sacrifice"],"f":"2k5/1pp2ppp/1q2p3/7Q/5r2/2N5/PPP2PPP/1R4K1 b - - 0 20","m":["c6g8","b5e5","g8g5","c5g5","g7g5"],"alts":[]},
      {"id":"Zx4Ut","rating":755,"themes":["backRankMate","endgame","mate","mateIn2","sacrifice","short"],"f":"1r4k1/p2Q1ppp/4b3/8/5q2/8/P3BPPP/3R2K1 w - - 0 22","m":["h2h4","c4h4","h5h4"],"alts":[]},
      {"id":"Jzypr","rating":776,"themes":["endgame","kingsideAttack","mate","mateIn2","sacrifice","short"],"f":"2r3k1/p3Qp1r/5P2/1pp3B1/3p4/2PP1PP1/PP4q1/3KR3 w - - 3 36","m":["d2d4","a4d4","d5d4"],"alts":[]},
      {"id":"fbeCK","rating":797,"themes":["endgame","mate","mateIn2","pillsburysMate","sacrifice","short"],"f":"3r4/1p3p1k/p5p1/4b2p/1Q6/P1PqB2P/1P3PP1/R5K1 b - - 9 29","m":["h3h5","f5h5","h4h5"],"alts":[]}
    ]},
  "1-10":{"version":2,"src":"https://lichess.org/training/Qv2Fb","focus":["fork"],"puzzles":[
      {"id":"Qv2Fb","rating":511,"themes":["advantage","endgame","fork","short"],"f":"4r1k1/p4p2/1p5p/4N1q1/4K1P1/5Q2/8/8 w - - 8 47","m":["g3g2","b4e4","g2d4"],"alts":[]},
      {"id":"BZhdO","rating":524,"themes":["fork","mate","mateIn2","middlegame","operaMate","short"],"f":"2b1n1k1/pr3rpp/1qpB4/3p4/P7/1P6/2P2PPP/2K1RB1R w - - 0 28","m":["d5d4","g2g4","d4g4"],"alts":[]},
      {"id":"ZXWFI","rating":548,"themes":["advantage","endgame","fork","short"],"f":"k3q3/p1R5/8/p2b4/3P2p1/P3P1Pn/3K3P/2R5 w - - 0 48","m":["a2a4","d4a4","a5a4"],"alts":[]},
      {"id":"MQ31Z","rating":574,"themes":["crushing","endgame","fork","short"],"f":"8/8/8/p2kPp2/2p2Pp1/P1K1n1P1/5B2/8 b - - 3 52","m":["d3h5","a3h8","h5g8"],"alts":[]},
      {"id":"A2xey","rating":599,"themes":["crushing","endgame","fork","short"],"f":"8/2k2ppp/4p3/8/3R1nPP/8/8/6K1 b - - 1 34","m":["g7d8","b5g8","d8h7"],"alts":[]},
      {"id":"atqOE","rating":623,"themes":["crushing","endgame","fork","master","short"],"f":"8/5n2/p1k3pp/P1p5/2K1RP2/8/6P1/8 b - - 0 35","m":["g2h6","a7h3","h6d7"],"alts":[]},
      {"id":"PU2RV","rating":649,"themes":["fork","mate","mateIn2","middlegame","short"],"f":"5rk1/1p3pp1/p3p3/3pP3/PPrNnP2/R2R2Pp/7P/1N4K1 b - - 0 24","m":["a7a5","h3h5","a5h5"],"alts":[]},
      {"id":"AxAS5","rating":673,"themes":["advantage","endgame","fork","master","masterVsMaster","short"],"f":"8/Pbk2p2/2p3p1/3p2P1/2n3B1/7P/1P6/1K3R2 b - - 3 40","m":["a7h8","c5a5","h8g5"],"alts":[]},
      {"id":"DEF8R","rating":698,"themes":["advantage","fork","middlegame","short"],"f":"r1bq1k2/ppp4p/3p1Pp1/4n1N1/1Q6/8/PP3PPP/R3K2R b KQ - 1 19","m":["d1h3","d5h8","h3c7"],"alts":[]},
      {"id":"RgD5f","rating":721,"themes":["crushing","endgame","fork","short"],"f":"6r1/8/6p1/3k4/5PNP/6P1/6K1/8 w - - 1 63","m":["b7g6","h1h6","g6b4"],"alts":[]},
      {"id":"zvdTE","rating":748,"themes":["advantage","fork","middlegame","short"],"f":"2rqk2r/p3bppp/1p1p4/2pBn1P1/4PB1P/3P4/PPP4Q/R3K2R b KQk - 4 16","m":["d1g3","d5g8","g3e8"],"alts":[]},
      {"id":"2y4kK","rating":773,"themes":["advantage","endgame","fork","short"],"f":"8/p5k1/1p4p1/3Br1p1/1P2Pn2/P7/6PP/2R3K1 b - - 4 33","m":["g7d8","b5g8","d8a5"],"alts":[]},
      {"id":"rKP2m","rating":797,"themes":["advantage","endgame","fork","short"],"f":"8/4kp2/6pp/3P4/2R5/3n1K2/1P4PP/8 b - - 7 39","m":["h3d1","g3d7","d1a7"],"alts":[]},
      {"id":"Ybbaw","rating":822,"themes":["crushing","endgame","fork","queenRookEndgame","short"],"f":"6k1/1p2rp2/6p1/2p2r2/2PQ4/6KP/PP6/8 w - - 0 38","m":["h7h4","b4e2","h4d2"],"alts":[]},
      {"id":"lVb6m","rating":847,"themes":["advantage","endgame","fork","short"],"f":"7r/ppk5/8/P7/1P3N2/2P1R1Pp/3n1P1K/8 b - - 2 34","m":["h8g5","e8e5","g5d3"],"alts":[]}
    ]},
  "1-11":{"version":2,"src":"https://lichess.org/training/62GW1","focus":["equality","endgame","zugzwang"],"puzzles":[
      {"id":"62GW1","rating":505,"themes":["crushing","endgame","pawnEndgame","short","zugzwang"],"f":"8/8/4k3/p1p3p1/P1P2pP1/3K1P2/8/8 w - - 1 44","m":["h3d7","d6g6","d7h1"],"alts":[]},
      {"id":"PGEIO","rating":520,"themes":["endgame","mate","mateIn1","oneMove"],"f":"7k/6p1/5p1p/4p3/8/1PPQ3P/r4qN1/3R3K b - - 0 35","m":["g8b8"],"alts":[]},
      {"id":"NeDIE","rating":532,"themes":["endgame","mate","mateIn2","short"],"f":"r5k1/p4p1p/4N3/P5p1/2nR4/8/2q2PPP/3R2K1 w - - 0 24","m":["h7h4","f4h4","h5h4"],"alts":[]},
      {"id":"mwWBF","rating":545,"themes":["crushing","endgame","master","rookEndgame","short","zugzwang"],"f":"8/5p2/5p2/5Pk1/6Pp/7P/2r2RK1/8 b - - 17 47","m":["a8g8","b8g8","b1g7"],"alts":[]},
      {"id":"8GhYW","rating":559,"themes":["endgame","mate","mateIn2","short"],"f":"8/6pk/4p3/p2pPp2/3P1P1n/P1q5/1R2Q2P/7K b - - 1 40","m":["a3a5","d8h5","a5h5"],"alts":[]},
      {"id":"qPuqC","rating":573,"themes":["endgame","mate","mateIn1","oneMove"],"f":"7k/5prp/4pQ2/3q4/pp1P4/4P2R/PP3PPP/6K1 b - - 0 34","m":["h1b8"],"alts":[]},
      {"id":"XMZEi","rating":586,"themes":["crushing","endgame","pawnEndgame","short","zugzwang"],"f":"8/3k4/1p3p2/1P3p2/2K2P2/8/8/8 w - - 2 49","m":["a7h1","h2a2","h1d6"],"alts":[]},
      {"id":"kMjrd","rating":600,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/6p1/p1k2pPp/Pp3P1P/1Pp2K2/2P5/8/8 b - - 4 42","m":["a6h1","g7g3","h1d1","g3d3","d1g1"],"alts":[]},
      {"id":"qksUq","rating":614,"themes":["crushing","endgame","pawnEndgame","short","zugzwang"],"f":"8/8/p3k2p/P1p3pP/2P3P1/4K3/8/8 b - - 5 59","m":["d6d1","d3g3","d1h7"],"alts":[]},
      {"id":"v1dlj","rating":627,"themes":["crushing","endgame","pawnEndgame","short","zugzwang"],"f":"8/8/2p2k2/2Pp3p/3P3P/5K2/8/8 b - - 5 53","m":["g6g1","g3d3","g1b7"],"alts":[]},
      {"id":"zMeqG","rating":641,"themes":["endgame","equality","fork","short"],"f":"6k1/3r4/p2P3p/5p2/4N3/8/K5P1/8 w - - 0 43","m":["d7g6","b4g2","g6h2"],"alts":[]},
      {"id":"EzCrR","rating":654,"themes":["crushing","endgame","pawnEndgame","short","zugzwang"],"f":"8/2p4p/k1p3pP/2Pp1pP1/pP1P1P2/K2P4/8/8 b - - 4 36","m":["f6c1","f3f8","c1c7"],"alts":[]},
      {"id":"3bYAf","rating":668,"themes":["endgame","mate","mateIn2","short"],"f":"7k/6r1/p6p/1p2PQ2/2p2P2/2P3pK/P3P1R1/4q3 b - - 1 37","m":["d5e5","b8e8","e5e8"],"alts":[]},
      {"id":"Dd6Gc","rating":681,"themes":["endgame","long","mate","mateIn3"],"f":"6k1/4R1pp/3q4/pQ6/8/2P5/PP4PP/7K b - - 0 32","m":["h6h5","d2d5","h5d5","c1g5","d5g5"],"alts":[]},
      {"id":"HSIv5","rating":695,"themes":["backRankMate","endgame","hangingPiece","mate","mateIn1","oneMove"],"f":"1r4k1/5ppp/3Q4/4n3/8/6PP/6K1/8 w - - 2 45","m":["h6c4"],"alts":[]}
    ]},
  "2-0":{"version":2,"src":"https://lichess.org/training/4ot8f","focus":["fork","hangingPiece","trappedPiece"],"puzzles":[
      {"id":"4ot8f","rating":800,"themes":["advantage","endgame","fork","short"],"f":"8/R2bkp1n/3b2pp/3P4/4PP1P/6P1/5K2/5B2 b - - 0 54","m":["h6a1","g8g3","a1f2"],"alts":[]},
      {"id":"q32SG","rating":813,"themes":["endgame","hangingPiece","mate","mateIn1","oneMove"],"f":"5rk1/5pp1/p1pR3p/4p3/4n3/7Q/P3rPPP/4B1K1 b - - 0 28","m":["d8d5"],"alts":[]},
      {"id":"yVGR8","rating":827,"themes":["crushing","endgame","fork","master","short"],"f":"8/8/8/2Kp4/3Pk3/8/5B2/4n3 b - - 4 58","m":["d5h3","a1a6","h3g8"],"alts":[]},
      {"id":"J9O2R","rating":840,"themes":["endgame","hangingPiece","mate","mateIn1","oneMove"],"f":"1k1r3Q/2p5/pp6/4p3/6P1/2PP1P2/P4qPK/1R6 b - - 0 32","m":["h4e4"],"alts":[]},
      {"id":"bvGoK","rating":853,"themes":["hangingPiece","kingsideAttack","mate","mateIn1","middlegame","oneMove"],"f":"r4r1k/p1q2B1p/4Rbp1/2p5/8/2NP1Q1P/PP3PP1/n5K1 w - - 2 19","m":["g3g6"],"alts":[]},
      {"id":"Oy2Eh","rating":867,"themes":["backRankMate","endgame","hangingPiece","mate","mateIn1","oneMove"],"f":"2r1k2r/pp1qpp2/3p2pp/3P4/4P3/2Q5/PP3PPP/R3R1K1 w k - 1 16","m":["a3e4"],"alts":[]},
      {"id":"QDei2","rating":880,"themes":["crushing","defensiveMove","endgame","knightEndgame","short","trappedPiece"],"f":"8/8/8/7p/4p2P/3k1PP1/4p1K1/4N3 b - - 2 51","m":["h3h8","g3d7","h8d5"],"alts":[]},
      {"id":"GoBrW","rating":893,"themes":["hangingPiece","kingsideAttack","mate","mateIn1","middlegame","oneMove"],"f":"r1b1r1k1/1p1p2p1/p1nBp2q/4P2Q/5n2/2PB4/P4PPP/R2R2K1 w - - 0 19","m":["e1d4"],"alts":[]},
      {"id":"xYUur","rating":907,"themes":["crushing","hangingPiece","master","middlegame","short"],"f":"3r1rk1/ppp2ppp/3n4/2N1b3/2B5/2P3P1/PP3P1P/3RR1K1 b - - 4 17","m":["h6a7","h5h4","g4h4"],"alts":[]},
      {"id":"bpMr8","rating":920,"themes":["crushing","endgame","fork","long"],"f":"8/7p/8/4kp2/8/1p1BN2P/3r1PK1/8 w - - 6 46","m":["d3a7","d1h7","a7h8","h7h3","h8c3"],"alts":[]}
    ]},
  "2-1":{"version":2,"src":"https://lichess.org/training/iRAEh","focus":["fork"],"puzzles":[
      {"id":"iRAEh","rating":810,"themes":["backRankMate","fork","long","mate","mateIn3","middlegame","sacrifice"],"f":"r3nrk1/pb3qp1/1p2p1Np/2ppR2Q/3P4/P1P5/1PB2PPP/R5K1 b - - 0 23","m":["g2g8","b5e5","g8g5","f5g5","g4g5"],"alts":[]},
      {"id":"mOSGf","rating":874,"themes":["crushing","endgame","fork","sacrifice","veryLong"],"f":"4r1k1/2Q3bp/1p2q1p1/p7/8/B6P/1P3PP1/3R2K1 b - - 2 30","m":["d6d5","h5d5","d4d5","b5e8","b2d1","a2d1","d5d1"],"alts":[]},
      {"id":"Opxhf","rating":932,"themes":["advantage","fork","middlegame","short"],"f":"r3k2r/p3b2p/2p1pnp1/6q1/8/2P2Q1P/PP3PP1/1K1RR3 w kq - 0 20","m":["g3a6","d4g4","a6f4"],"alts":[]},
      {"id":"FXA92","rating":990,"themes":["crushing","endgame","fork","master","short"],"f":"4k3/4r1p1/p3B1p1/1qp1Q1Pn/1p2P3/5P2/PP4KP/3R4 b - - 1 38","m":["c1d8","b8b5","d8h5"],"alts":[]},
      {"id":"VWGbY","rating":1051,"themes":["advantage","fork","opening","short"],"f":"r1bqkbnr/pp3ppp/3p4/1N2N3/3QP3/8/PPP2PPP/R1B1K2R b KQkq - 0 8","m":["h4f1","a5h8","f1c1"],"alts":[]},
      {"id":"fdPCU","rating":1109,"themes":["advantage","fork","middlegame","short"],"f":"r1bq1rk1/pp4pp/4p3/5p2/2BNnP2/P7/2P3PP/R1B1QRK1 b - - 0 14","m":["h4h7","a5d3","h7a7"],"alts":[]},
      {"id":"nnEG7","rating":1170,"themes":["advantage","fork","opening","short"],"f":"rnbqk2r/ppp2ppp/8/3Pp3/1bp1n3/2N1B3/PP3PPP/R2QKBNR w KQkq - 0 7","m":["h5f7","a4h2","f7c7"],"alts":[]},
      {"id":"BoiFN","rating":1228,"themes":["advantage","exposedKing","fork","long","middlegame"],"f":"2qr2k1/1p3pbp/3P2p1/1N3b2/P5n1/1P4PP/2P3B1/1R1QR1K1 b - - 0 25","m":["a4a1","b5e5","b7g8","e5e8","g8h5"],"alts":[]},
      {"id":"xklDy","rating":1290,"themes":["endgame","fork","mate","mateIn2","pin","short"],"f":"3q2k1/6r1/pp3p1Q/2b1p1p1/2P5/5P2/PP2RBPP/6K1 b - - 2 33","m":["h4h5","d8d5","h5d5"],"alts":[]},
      {"id":"JsKRj","rating":1350,"themes":["advantage","attraction","endgame","exposedKing","fork","long"],"f":"6k1/6pp/5b2/1PpP4/5n1P/1P1B4/P7/q1QKR3 b - - 4 35","m":["f5a5","h5a5","g7h3","a5h5","h3d5"],"alts":[]}
    ]},
  "2-2":{"version":2,"src":"https://lichess.org/training/WjDex","focus":["fork"],"puzzles":[
      {"id":"WjDex","rating":816,"themes":["endgame","fork","mate","mateIn2","short"],"f":"5q1k/1pp3pB/4p3/3p4/8/7Q/r4PPP/4R1K1 b - - 1 24","m":["g4g8","b5e5","g8d5"],"alts":[]},
      {"id":"fMtOF","rating":864,"themes":["fork","mate","mateIn2","middlegame","short"],"f":"2q2rk1/5pbp/2BQ2p1/1p2p3/p3P3/P3BN1b/1PP2P2/3RR1K1 b - - 5 24","m":["a4b7","b5e8","b7b8"],"alts":[]},
      {"id":"5sOqM","rating":932,"themes":["crushing","endgame","fork","master","short"],"f":"3r4/2R2pk1/4p1pp/p2p4/3P2q1/1P1Q1N2/P2K1P2/8 b - - 1 39","m":["b7g7","h8a8","g7a2"],"alts":[]},
      {"id":"zxv6G","rating":991,"themes":["crushing","endgame","fork","queenRookEndgame","short"],"f":"8/2R2pkp/6p1/8/8/3R3P/5qPK/8 b - - 0 40","m":["g8g7","e8b5","g7a2"],"alts":[]},
      {"id":"PgbhV","rating":1052,"themes":["advantage","fork","long","opening"],"f":"rn1qkbnr/ppp4p/6p1/3Pp2Q/4Pp2/8/PPP3PP/RNB2RK1 w kq - 0 11","m":["e1d1","h4d2","d1e4","d2b2","e4b2"],"alts":[]},
      {"id":"o4sOS","rating":1111,"themes":["advantage","endgame","fork","short"],"f":"6k1/p3qpp1/Q2p3p/2pP1n1P/P4N2/1P4P1/5P2/6K1 w - - 2 35","m":["f6a4","d2g4","a4g1"],"alts":[]},
      {"id":"EJZnu","rating":1169,"themes":["advantage","endgame","fork","short"],"f":"6k1/p1p3b1/3p2p1/2q2n2/8/2P4Q/PP1B2KP/4R3 b - - 0 29","m":["a1h1","b8g8","h1h8"],"alts":[]},
      {"id":"toSb1","rating":1232,"themes":["crushing","deflection","endgame","fork","long"],"f":"8/1Q4pk/p2p3p/4p3/4Pb2/2P2Pq1/PP2K3/3R4 b - - 4 39","m":["b3b8","d8h3","b8g3","h3a7","g3h5"],"alts":[]},
      {"id":"2V5nl","rating":1289,"themes":["crushing","endgame","fork","long"],"f":"r7/p6p/3Q1ppk/2pP4/7q/7P/P1P3P1/R4K2 b - - 0 24","m":["e7a7","g5b5","a7h7","b5e8","h7f5"],"alts":[]},
      {"id":"inlBn","rating":1350,"themes":["crushing","endgame","fork","long"],"f":"2r3k1/pQB3p1/1p4r1/4R3/3p1p2/1P1P3q/1PP3P1/6K1 w - - 1 33","m":["c2h1","b4e4","d1e1","e3e1","h1e1"],"alts":[]}
    ]},
  "2-3":{"version":2,"src":"https://lichess.org/training/saLsd","focus":["pin"],"puzzles":[
      {"id":"saLsd","rating":803,"themes":["advantage","endgame","pin","short"],"f":"6k1/3r2pp/1p6/p3r3/2K1Np2/1P3P2/1P4RP/8 w - - 0 40","m":["d7g6","b4g2","g6h2"],"alts":[]},
      {"id":"4Jkqu","rating":827,"themes":["advantage","endgame","pin","short"],"f":"1k6/6r1/1PpNn3/3pP2p/3P4/3R2P1/6KP/8 b - - 2 44","m":["d6g7","b8g3","g7h3"],"alts":[]},
      {"id":"N4450","rating":852,"themes":["advantage","endgame","pin","short"],"f":"Q3qk2/p7/1p1pr1p1/5p1p/5P2/P7/6PP/2R3K1 w - - 10 38","m":["a5a4","d4a4","f4a4"],"alts":[]},
      {"id":"fR8eX","rating":877,"themes":["advantage","middlegame","pin","short"],"f":"r6r/pb1pk2p/1pn1pq1b/5p1B/8/2N4R/PPPPQPP1/R1B1K3 w Q - 2 18","m":["a3h1","d2h4","h1g6"],"alts":[]},
      {"id":"78ujn","rating":901,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove","pin"],"f":"r2q1r1k/pp1n2np/2p1B1pQ/2Pp4/3PPN2/1P3b2/P4P1P/R3R1K1 w - - 2 23","m":["g7b6"],"alts":[]},
      {"id":"Le8X7","rating":925,"themes":["endgame","mate","mateIn1","oneMove","pin"],"f":"7k/pp4p1/3p4/2pPq3/2B2r1P/P5Q1/6RK/6R1 b - - 0 36","m":["g7e7"],"alts":[]},
      {"id":"IV84Y","rating":950,"themes":["advantage","opening","pin","short"],"f":"r1b1kbnr/ppp1pppp/n1q5/8/3P4/2N5/P1P2PPP/R1BQKB1R w KQkq - 2 10","m":["g5c1","a6c1","a3c1"],"alts":[]},
      {"id":"uZLTm","rating":974,"themes":["mate","mateIn2","middlegame","pin","short"],"f":"1k5r/1pp4r/p1q5/5N2/8/2P4P/1P1Q1RP1/3R3K b - - 0 32","m":["e2e3","e5b5","e3e5"],"alts":[]},
      {"id":"gS9Ez","rating":999,"themes":["advantage","middlegame","pin","short"],"f":"r2q1r2/pp4bk/3p3p/2pN1b2/2P2P2/3PQ2P/PP4B1/4RRK1 b - - 1 21","m":["b2h7","d3h7","a1h7"],"alts":[]},
      {"id":"FNcmK","rating":1024,"themes":["advantage","endgame","pin","short"],"f":"6r1/Q5pk/6np/7N/p1p5/8/2q3PP/6RK w - - 2 37","m":["e1g6","e2e4","g6b4"],"alts":[]},
      {"id":"7k7Mx","rating":1049,"themes":["advantage","opening","pin","short"],"f":"r1bqk1nr/pp3p1p/5b2/3P4/2Bp1P2/6Q1/PPPP2PP/RNB1K2R b KQkq - 2 10","m":["g6e7","d5b5","e7b3"],"alts":[]},
      {"id":"ZO2IG","rating":1072,"themes":["kingsideAttack","mate","mateIn2","opening","pin","short"],"f":"rn2k2r/pp2ppb1/2pp2p1/7n/2PPP3/1PN3Bq/P4P1P/2RQ1RNK b kq - 4 18","m":["e1b3","g8b3","e3e8"],"alts":[]},
      {"id":"gVthH","rating":1097,"themes":["advantage","middlegame","pin","short"],"f":"rn6/ppp1r1pp/6k1/5b2/3Q1P2/2K5/PB4qP/RN5R w - - 0 17","m":["e5b5","b8b5","h7b5"],"alts":[]},
      {"id":"6vpTb","rating":1121,"themes":["advantage","middlegame","pin","short"],"f":"r7/2qk1p2/2pp4/p6p/Qn4rP/1P3N2/pKP1R1P1/3R4 w - - 6 28","m":["g3d1","h2a4","d1b7"],"alts":[]},
      {"id":"tUiLe","rating":1146,"themes":["crushing","endgame","long","pin"],"f":"3r4/p4kpp/4bp2/1p6/2p1QB2/6P1/PP3P1P/6K1 b - - 1 24","m":["h4h5","b5b8","d6h1","d7h1","h5h1"],"alts":[]}
    ]},
  "2-4":{"version":2,"src":"https://lichess.org/training/AciDs","focus":["capturingDefender","deflection"],"puzzles":[
      {"id":"AciDs","rating":800,"themes":["attackingF2F7","deflection","mate","mateIn2","middlegame","short"],"f":"r3kb2/p1qp1p1Q/1pn1p3/1p4N1/2PP4/8/PP3P1P/R3K2b w Qq - 0 17","m":["e2g2","d4h4","g2g4"],"alts":[]},
      {"id":"WWTEI","rating":813,"themes":["deflection","kingsideAttack","mate","mateIn2","middlegame","short"],"f":"6k1/pp3p1p/1q4p1/3p4/2n3Q1/2P5/PP2rPPP/R1B2NK1 b - - 0 22","m":["c6g8","b5e5","g8g5"],"alts":[]},
      {"id":"mWA2K","rating":826,"themes":["capturingDefender","crushing","middlegame","short"],"f":"r4rk1/2p3pp/p1pqbp2/1p6/3P1Q2/2P2N2/PP3PPP/R3R1K1 w - - 1 20","m":["g7h6","a2h6","d5d6"],"alts":[]},
      {"id":"Zgf54","rating":838,"themes":["crushing","deflection","endgame","master","short","skewer"],"f":"6r1/6k1/4P3/5p1r/2Bp1K2/p2P4/2P5/5R2 w - - 4 51","m":["g5b5","b2g6","b5b4"],"alts":[]},
      {"id":"owVzI","rating":851,"themes":["advantage","deflection","endgame","short"],"f":"r7/p1k4p/b1pbp1p1/5p2/2P1pN2/4P1P1/PPB1K2P/3R4 w - - 1 24","m":["g7d6","a2c6","h5h6"],"alts":[]},
      {"id":"jZK4Z","rating":864,"themes":["backRankMate","deflection","discoveredAttack","mate","mateIn2","middlegame","short"],"f":"r4r2/1b4k1/p5p1/1p1PN3/2P2n1Q/1P2P3/1P4PP/5RK1 b - - 0 30","m":["g7d8","b5e5","g4g5"],"alts":[]},
      {"id":"aBHPW","rating":877,"themes":["advantage","capturingDefender","discoveredAttack","middlegame","short"],"f":"2kr2nr/ppp2qpp/1b3p2/3Pn3/QP4b1/P1N2N2/4BPPP/R1B2RK1 w - - 1 14","m":["g3d1","g6d1","d8b7"],"alts":[]},
      {"id":"dJapL","rating":890,"themes":["backRankMate","deflection","long","mate","mateIn3","middlegame"],"f":"3r1rk1/pp4pp/8/3p4/3Qp2q/2P1R3/PP4PP/R4BK1 b - - 3 20","m":["e7g8","b5e5","g8g5","f5g5","g4g5"],"alts":[]},
      {"id":"mvQ2K","rating":903,"themes":["capturingDefender","crushing","endgame","rookEndgame","short"],"f":"r4k2/P6p/4p1p1/3p1p2/1p1P4/R3P3/5PP1/2R3K1 b - - 0 39","m":["c7f3","a5f5","f4f2"],"alts":[]},
      {"id":"rbLEJ","rating":915,"themes":["deflection","endgame","mate","mateIn2","pin","short"],"f":"7k/ppP4p/6p1/8/3P2rr/P4p1B/2R2P1K/2R5 b - - 0 33","m":["b7b8","e8e5","e7e3"],"alts":[]},
      {"id":"RjGSp","rating":927,"themes":["deflection","kingsideAttack","mate","mateIn2","middlegame","short"],"f":"1k5r/ppq1bp2/2p2n2/3p1PB1/1PP1p1P1/3P4/P3QP2/R3R1KB b - - 0 25","m":["a2e8","b5g5","e8e5"],"alts":[]},
      {"id":"i9Htk","rating":941,"themes":["deflection","endgame","mate","mateIn2","short"],"f":"8/8/R6p/4q1pk/3p4/2nP3P/5PP1/7K w - - 4 43","m":["b8b7","e1e7","f6e6"],"alts":[]},
      {"id":"v8oPY","rating":953,"themes":["advantage","capturingDefender","master","middlegame","short"],"f":"1r4k1/8/p2N2p1/q1pPp3/b1P2b1p/Q4P1P/K5P1/1r2B2R w - - 0 29","m":["d5f1","c5e5","f3f7"],"alts":[]},
      {"id":"IDmUb","rating":966,"themes":["advantage","deflection","endgame","short"],"f":"4K3/6kp/4Qb2/6p1/2P5/7P/8/3q4 w - - 2 60","m":["d6g2","b2e6","g2g6"],"alts":[]},
      {"id":"ThfOs","rating":979,"themes":["deflection","kingsideAttack","mate","mateIn2","middlegame","short"],"f":"r3r1k1/1p2bp1p/1qp1pp2/p2pN3/3P4/1P1PP3/P4PPP/R2Q1RK1 w - - 0 16","m":["h5b7","b4e4","d1g2"],"alts":[]}
    ]},
  "2-5":{"version":2,"src":"https://lichess.org/training/GNi4l","focus":["hangingPiece","fork","mateIn1"],"puzzles":[
      {"id":"GNi4l","rating":800,"themes":["backRankMate","endgame","hangingPiece","mate","mateIn2","short"],"f":"1r4k1/2p2ppp/8/8/5P2/B2rP3/PR2KP2/q7 w - - 0 34","m":["c8c4","h3h4","c4h4"],"alts":[]},
      {"id":"a3ViJ","rating":813,"themes":["crushing","endgame","fork","short"],"f":"7r/5pp1/1k6/pPpn1P2/2Q1pP1P/3p4/P7/5K1R b - - 1 33","m":["h1d3","g5g8","d3a7"],"alts":[]},
      {"id":"7jEbm","rating":826,"themes":["advantage","hangingPiece","middlegame","short"],"f":"r1b1k2r/ppp2ppp/8/q3p3/2P5/3n2N1/PP1Q1PPP/R3KB1R w KQkq - 0 13","m":["g5h3","f1h8","d5h8"],"alts":[]},
      {"id":"EHgVY","rating":839,"themes":["mate","mateIn1","middlegame","oneMove","triangleMate"],"f":"q1r2k1r/4R3/7p/P7/1P6/1bp3QP/5PP1/5NK1 w - - 4 34","m":["b3b2"],"alts":[]},
      {"id":"RRHWB","rating":852,"themes":["doubleBishopMate","hangingPiece","kingsideAttack","mate","mateIn2","middlegame","short"],"f":"r4r1k/pbpqn2p/1p6/4bp2/2B5/2P3B1/PP3PPP/R3RNK1 w - - 0 18","m":["b3d1","g4g6","d1g6"],"alts":[]},
      {"id":"NgR9F","rating":865,"themes":["endgame","mate","mateIn1","oneMove","rookEndgame"],"f":"8/pp6/4k2p/4p3/P3KpPP/1Pr2P2/2PR4/8 b - - 0 37","m":["a3d3"],"alts":[]},
      {"id":"KKSgJ","rating":878,"themes":["advantage","endgame","fork","hangingPiece","short"],"f":"3r1k2/pp4p1/4p2p/P4p2/5P2/1Bn1P3/3n1PKP/R1R5 b - - 4 25","m":["h8c3","a5a3","c3f5"],"alts":[]},
      {"id":"mfiSA","rating":891,"themes":["hangingPiece","mate","mateIn1","middlegame","oneMove","queensideAttack"],"f":"1k1r1b1r/pp3pp1/8/Q3p3/3p2np/3PBq2/PPPK1P1P/R4R2 w - - 0 19","m":["f1h4"],"alts":[]},
      {"id":"WoxO4","rating":904,"themes":["endgame","mate","mateIn1","oneMove","queenEndgame"],"f":"k4q2/3Q4/ppK5/8/8/7P/8/8 w - - 0 60","m":["h2c2"],"alts":[]},
      {"id":"UWH8v","rating":917,"themes":["crushing","fork","opening","short"],"f":"r1br2k1/pp2qppp/4p3/2n1P3/2P2n2/5N2/P1B2PPP/RNQ2RK1 b - - 6 16","m":["g7d8","b5e5","d8a5"],"alts":[]}
    ]},
  "2-6":{"version":2,"src":"https://lichess.org/training/MEgFx","focus":["mateIn2"],"puzzles":[
      {"id":"MEgFx","rating":801,"themes":["mate","mateIn2","middlegame","short"],"f":"r4qk1/5p1p/p4QpP/1p2p3/7R/5PR1/P3BKP1/2r5 b - - 3 35","m":["g4a1","e7h7","a1h7"],"alts":[]},
      {"id":"QriIg","rating":824,"themes":["mate","mateIn2","middlegame","queensideAttack","short"],"f":"1k2r3/1pp1rp2/p1q2bpp/3Rp3/5P2/PN2Q2P/1PP3P1/2KR4 w - - 0 25","m":["h1h4","d4h4","h5h4"],"alts":[]},
      {"id":"EzqWB","rating":851,"themes":["backRankMate","endgame","mate","mateIn2","short"],"f":"6k1/6pp/2N5/1p6/4K2n/8/1r5P/5R2 w - - 5 40","m":["a6d2","b4e4","g5g4"],"alts":[]},
      {"id":"QW52t","rating":873,"themes":["deflection","endgame","mate","mateIn2","rookEndgame","short"],"f":"8/8/1R5p/r5pk/8/7P/6PK/8 w - - 14 52","m":["b8b7","e1e7","c6e6"],"alts":[]},
      {"id":"IiLOp","rating":898,"themes":["mate","mateIn2","middlegame","queensideAttack","short"],"f":"rn3rk1/ppp2pp1/4p1b1/3p2Pp/1qnP1N1P/1PN1PP1B/P1P1Q3/2KR3R b - - 0 15","m":["c7f3","a5c5","f3c8"],"alts":[]},
      {"id":"Nbmpc","rating":922,"themes":["endgame","mate","mateIn2","short"],"f":"1k1B4/ppp5/1b6/5Q2/q6p/2P4P/PP4P1/2K5 b - - 0 30","m":["c6d3","a5c5","f7h5"],"alts":[]},
      {"id":"ZYjF8","rating":947,"themes":["endgame","mate","mateIn2","short"],"f":"2r4k/pQp3p1/3P3p/8/4p1q1/P4pP1/1PN2P2/R4R1K b - - 0 31","m":["b7e3","e5b5","e3b8"],"alts":[]},
      {"id":"hBQ3V","rating":971,"themes":["endgame","mate","mateIn2","short"],"f":"3r1r1k/1p3p1p/6p1/p2p1NQ1/P5P1/1P3q1P/2P4K/8 w - - 2 37","m":["b1g6","e4b4","g6b2"],"alts":[]},
      {"id":"lC4oE","rating":996,"themes":["endgame","mate","mateIn2","short"],"f":"3r2k1/p3Rpp1/1ppq2p1/8/8/PQ3P1P/1P4P1/7K w - - 4 30","m":["c3g2","b4e4","g2b2"],"alts":[]},
      {"id":"sm7EE","rating":1020,"themes":["mate","mateIn2","middlegame","short"],"f":"r2qkbnr/2pb4/p2p1pp1/1p3P1Q/4P3/1nN5/PPPP2PP/R1B1K2R w KQkq - 0 12","m":["e1b6","d4d2","a3h1"],"alts":[]},
      {"id":"aftj6","rating":1045,"themes":["endgame","mate","mateIn2","short"],"f":"6k1/p2p3p/1pb1p1p1/8/4P3/P1qP2Q1/1r4PP/5R1K w - - 0 27","m":["b3c4","b4b2","c4g4"],"alts":[]},
      {"id":"mRLra","rating":1070,"themes":["endgame","mate","mateIn2","short"],"f":"2k3r1/ppp2p1p/8/4Q3/8/2PP1P1q/P1P2P1P/R5RK b - - 4 18","m":["e3g3","b5b8","g3b8"],"alts":[]},
      {"id":"NGM31","rating":1094,"themes":["endgame","mate","mateIn2","rookEndgame","short"],"f":"8/1P6/5k1p/6pK/3P1p2/R1P2P2/6r1/8 b - - 0 47","m":["b8e8","e1b7","e6e1"],"alts":[]},
      {"id":"N4Rfm","rating":1119,"themes":["kingsideAttack","mate","mateIn2","middlegame","short"],"f":"1r3rk1/pp1b1ppp/3p4/2qPpNP1/2P2n2/1RPB3Q/P2K1P2/R7 w - - 4 29","m":["g1d2","b4e4","e3e2"],"alts":[]},
      {"id":"rh7Ly","rating":1143,"themes":["kingsideAttack","mate","mateIn2","opening","short"],"f":"rnbqr1k1/pp3pbn/8/4N1pQ/2pP1p2/8/PPP3P1/RNB2RK1 w - - 0 15","m":["e1g2","b4e4","d1b6"],"alts":[]}
    ]},
  "2-7":{"version":2,"src":"https://lichess.org/training/Euo2h","focus":["fork"],"puzzles":[
      {"id":"Euo2h","rating":800,"themes":["advantage","endgame","fork","short"],"f":"4r3/1R2pk2/5pp1/1PB5/6Pp/4PP1P/5K2/4n3 b - - 2 40","m":["d5h3","g8d8","h3a1"],"alts":[]},
      {"id":"czKon","rating":861,"themes":["crushing","endgame","fork","short"],"f":"8/5B2/3k4/8/1p4K1/1P3n2/8/8 b - - 0 49","m":["g3d1","b7g7","d1g2"],"alts":[]},
      {"id":"48C5N","rating":921,"themes":["advantage","fork","opening","short"],"f":"r1b1qbkr/ppp4p/3p4/3N2Np/3nP3/8/PPP4p/R1B2R1K w - - 0 15","m":["h1g6","b4b2","g6d4"],"alts":[]},
      {"id":"Fij0i","rating":982,"themes":["advantage","fork","middlegame","short"],"f":"2r3k1/5rbp/p2p2p1/1p1N4/4P2Q/5q2/PPP4P/1K1R3R w - - 2 24","m":["h1d2","g2d2","e7d2"],"alts":[]},
      {"id":"1w2M1","rating":1043,"themes":["crushing","endgame","fork","veryLong"],"f":"8/8/6pp/3kP3/5PP1/1p1NK2P/2r5/8 w - - 5 56","m":["h3c7","h1d6","c7a8","c3a8","d3h8","a8a5b","h8a5"],"alts":[]},
      {"id":"5QyjR","rating":1103,"themes":["crushing","fork","middlegame","short"],"f":"8/1pp3k1/pb1p3R/3q1p2/PP1PnBp1/3Q4/8/3K3R b - - 10 40","m":["d7g8","h5h8","g8h3"],"alts":[]},
      {"id":"QRSCQ","rating":1163,"themes":["advantage","fork","opening","short"],"f":"r1b2rk1/pp1ppp1p/6p1/8/1n2q3/1NQ1B3/PPP3PP/2KR1B1R b - - 3 14","m":["c7f8","a5h8","f8a3"],"alts":[]},
      {"id":"cgSuW","rating":1224,"themes":["fork","mate","mateIn2","middlegame","short"],"f":"rr3qk1/3b1p1p/2p3pQ/3p2P1/p2P2N1/5K2/1p3P1P/3R3R w - - 0 27","m":["b7g6","b4e4","e6e2"],"alts":[]},
      {"id":"iVpue","rating":1284,"themes":["crushing","endgame","fork","short"],"f":"7B/8/7p/p1k3pP/P5P1/1Bpn4/1b2KP2/8 b - - 10 54","m":["h3a5","d8d3","a5c3"],"alts":[]},
      {"id":"wJws1","rating":1345,"themes":["advantage","fork","opening","short"],"f":"r1b1kbnr/pp2pppp/8/2qP4/1n2P3/5N2/PP1B1PPP/RN1QKB1R b KQkq - 1 7","m":["c7a8","h5a8","a1a8"],"alts":[]}
    ]},
  "2-8":{"version":2,"src":"https://lichess.org/training/VYTGN","focus":["mate","mateIn1","mateIn2","backRankMate"],"puzzles":[
      {"id":"VYTGN","rating":802,"themes":["endgame","mate","mateIn2","short"],"f":"3r2k1/R4Rp1/7p/5P2/5rP1/P1N4P/1PP5/2K5 b - - 0 32","m":["g7g5","a3h5","g5h5"],"alts":[]},
      {"id":"2fe1S","rating":841,"themes":["backRankMate","endgame","mate","mateIn2","short"],"f":"7k/2p1Nrpp/p3P3/2q5/4b3/8/P1P3PP/3R3K w - - 0 29","m":["h5h4","g2g4","h4g4"],"alts":[]},
      {"id":"l0XfT","rating":880,"themes":["backRankMate","mate","mateIn2","middlegame","short"],"f":"r1bqr1k1/pp3p1p/2p3p1/3p1P2/3b3N/1PNP2Q1/1PP2RPP/R1B4K b - - 0 17","m":["d4d5","g8g5","d5g5"],"alts":[]},
      {"id":"BG3Rk","rating":919,"themes":["kingsideAttack","mate","mateIn2","middlegame","short"],"f":"3rr1k1/pp3ppp/2pb4/1q6/3R4/2P2QP1/P1P2P1P/R1B3K1 b - - 5 19","m":["d4d5","b5b8","c1g5"],"alts":[]},
      {"id":"J165m","rating":957,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"r1bRnk1r/1pN1ppbp/1q4p1/4Q3/8/8/PPP2PPP/4K1NR w K - 5 15","m":["h4d4"],"alts":[]},
      {"id":"wRe8x","rating":997,"themes":["endgame","mate","mateIn1","oneMove","pillsburysMate"],"f":"6k1/3r4/2N1bp2/P3p2p/4P2P/5PK1/3r4/1R3R2 b - - 0 38","m":["h2b2"],"alts":[]},
      {"id":"J0SN3","rating":1035,"themes":["attraction","endgame","mate","mateIn2","sacrifice","short"],"f":"5r1k/4nBpp/p2qP3/3p4/3Pp2R/1p2P1P1/4Q2K/8 w - - 0 34","m":["e7e2","e4e2","d8e1"],"alts":[]},
      {"id":"tgXJP","rating":1073,"themes":["backRankMate","endgame","long","mate","mateIn3"],"f":"3r1rk1/p7/4p1pR/2pq2P1/8/2P5/PP2Q3/K4R2 b - - 3 35","m":["g4g5","d8g5","h1h5","g5h5","h4h5"],"alts":[]},
      {"id":"3eYGH","rating":1112,"themes":["deflection","endgame","master","mate","mateIn2","sacrifice","short"],"f":"2r4r/p4p1k/1p2qQp1/3pP1P1/8/4R3/P4P2/3R2K1 w - - 2 28","m":["d3e3","d6e3","g6g2"],"alts":[]},
      {"id":"vQPy0","rating":1151,"themes":["mate","mateIn2","middlegame","sacrifice","short"],"f":"3r4/k7/p2P4/r1nN3P/2pQ2P1/Pp6/1Pq5/K1R1R3 b - - 7 40","m":["f1f3","c8f3","a8f8"],"alts":[]},
      {"id":"lK1fx","rating":1190,"themes":["endgame","mate","mateIn1","oneMove","rookEndgame"],"f":"r3rk2/4R1R1/3p2p1/8/p3P3/8/6P1/7K w - - 6 34","m":["d2g2"],"alts":[]},
      {"id":"Sm424","rating":1229,"themes":["backRankMate","deflection","mate","mateIn4","middlegame","veryLong"],"f":"3r2k1/1b3ppp/p4n2/1p2pN2/4p3/bq2B3/N4PPP/3R2K1 w - - 0 26","m":["h5h4","g6d4","h4d4","f3g4","g1d2","b4e4","d4g4"],"alts":[]},
      {"id":"UpOq5","rating":1267,"themes":["advancedPawn","endgame","mate","mateIn2","promotion","rookEndgame","short"],"f":"1r5k/1PRR4/8/3p4/8/6PK/pr6/8 w - - 0 62","m":["a2a4","c4a4","c2a4b"],"alts":[]},
      {"id":"SoXel","rating":1306,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"r4rk1/5p1p/pq2p2p/1b2Q3/4p3/2R5/PP3PPP/3N2K1 w - - 0 24","m":["a3b3"],"alts":[]},
      {"id":"vrTL5","rating":1345,"themes":["endgame","mate","mateIn1","oneMove","operaMate"],"f":"4r3/1p3R2/p5kp/1p6/1P2b1P1/R1Br3P/7K/8 w - - 6 33","m":["g2b2"],"alts":[]}
    ]},
  "2-9":{"version":2,"src":"https://lichess.org/training/59BTY","focus":["fork"],"puzzles":[
      {"id":"59BTY","rating":803,"themes":["advantage","endgame","fork","short"],"f":"2r3k1/p1r4p/4p3/4N2p/5n2/5P2/P1P3PP/2R2RK1 b - - 8 25","m":["g7d8","b5g8","d8a5"],"alts":[]},
      {"id":"YuLHm","rating":837,"themes":["crushing","fork","middlegame","short"],"f":"3r1rk1/p1p3pp/2q1b3/2nN4/P1P1pp2/8/2Q1BPPP/R4RK1 w - - 0 23","m":["h1d2","b4e4","d2a6"],"alts":[]},
      {"id":"a2OJX","rating":874,"themes":["crushing","endgame","fork","short"],"f":"8/R6p/p3p1pk/1p1b1p2/5P2/1P1B2P1/Pb5P/6K1 b - - 6 34","m":["c8h7","b5g5","h7f2"],"alts":[]},
      {"id":"1s17W","rating":913,"themes":["crushing","endgame","fork","short"],"f":"4r3/p6p/1pk3p1/2p5/2n3B1/2PR1P2/P4K1P/8 w - - 5 35","m":["b7h2","a6a2","h2d4"],"alts":[]},
      {"id":"LqqGL","rating":949,"themes":["advantage","endgame","fork","short"],"f":"4b3/2pkP2R/2p5/1pB5/3P4/3K4/p1r5/R7 b - - 11 67","m":["d4b6","h3d3","b6e2"],"alts":[]},
      {"id":"zdygp","rating":986,"themes":["advantage","endgame","fork","short"],"f":"6r1/R5pk/7p/p7/P1R5/1n3K2/5P1P/8 b - - 7 52","m":["c3h8","g3d3","h8a7"],"alts":[]},
      {"id":"7ypNc","rating":1023,"themes":["endgame","fork","mate","mateIn2","queenEndgame","short"],"f":"8/1QP4p/p4pp1/k1q1p3/P7/KP4P1/8/8 w - - 2 39","m":["c3c7","a1c7","c2c7"],"alts":[]},
      {"id":"prbSA","rating":1061,"themes":["crushing","fork","middlegame","short"],"f":"6k1/6bp/p2r2p1/2p2p2/Rn6/Br2P1P1/4BP1P/5RK1 w - - 2 29","m":["d8a7","b4e4","a7c3"],"alts":[]},
      {"id":"BCQ97","rating":1098,"themes":["advantage","fork","middlegame","short"],"f":"r3k2r/2p1b2p/p1p1p1p1/3pN3/3PP1P1/8/PqPN3P/R2Q1RK1 b kq - 1 15","m":["c8h7","b5e5","h7d1"],"alts":[]},
      {"id":"lLO8j","rating":1135,"themes":["advantage","fork","long","opening"],"f":"r1b1k2r/pppp2pp/8/4bp2/4n3/2P2N1P/PP2P1P1/RNB1KB1R b KQkq - 2 11","m":["d1b3","d5h5","d7g8","h5a8","g8e5"],"alts":[]}
    ]},
  "2-10":{"version":2,"src":"https://lichess.org/training/PSuL7","focus":["discoveredAttack","doubleCheck"],"puzzles":[
      {"id":"PSuL7","rating":800,"themes":["discoveredCheck","doubleCheck","mate","mateIn1","middlegame","oneMove"],"f":"2bn1rk1/r5b1/p2p4/1ppNp1P1/8/P2PPp2/BPP4Q/2K5 w - - 2 27","m":["h1g6"],"alts":[]},
      {"id":"RpOvM","rating":813,"themes":["advancedPawn","advantage","discoveredAttack","endgame","master","promotion","rookEndgame","short"],"f":"8/p7/6P1/2R5/6R1/1P1Kpr2/P1P2k2/8 b - - 0 40","m":["d3d8","h3h7","d8d5b"],"alts":[]},
      {"id":"xEMDM","rating":826,"themes":["advantage","discoveredAttack","endgame","short"],"f":"4k2r/1p2bp2/2p1p1p1/1p2P2p/5q2/PQ3B1P/1P4P1/5R1K w k - 0 24","m":["g3a6","c2a6","g5g7"],"alts":[]},
      {"id":"9Aflj","rating":839,"themes":["crushing","discoveredAttack","endgame","short"],"f":"4r2k/1pp3p1/p2q3p/3Pb3/P1Q5/1P2B2P/6P1/3R2K1 b - - 0 28","m":["d1e8","b5e5","d4d3"],"alts":[]},
      {"id":"OL2cV","rating":851,"themes":["crushing","discoveredAttack","long","middlegame"],"f":"8/kpp1r1b1/p1n5/4Nbqp/2NP4/2P3P1/PP2Q1PP/K3R3 w - - 11 33","m":["d1a6","c2a6","d8d2","b1d2","d5d2"],"alts":[]},
      {"id":"UOKTH","rating":864,"themes":["crushing","discoveredAttack","kingsideAttack","master","middlegame","short"],"f":"3rr1k1/1p2npp1/p1q4p/3NP3/2pQ4/6P1/PPP2P2/3RR1K1 w - - 3 24","m":["h1d2","d4d2","h7h4"],"alts":[]},
      {"id":"Hdv5e","rating":877,"themes":["crushing","discoveredAttack","kingsideAttack","middlegame","short"],"f":"rnb2rk1/1p3ppp/3q4/p3p3/8/1N1B4/PPPQ2PP/R4RK1 w - - 0 16","m":["h3e2","b4e2","h8h6"],"alts":[]},
      {"id":"R9n1M","rating":889,"themes":["advantage","discoveredAttack","kingsideAttack","middlegame","short"],"f":"r4rk1/1b3ppp/p1nq4/1p1B4/8/P4N2/1P3PPP/R2Q1RK1 w - - 1 16","m":["h1g2","g4g2","h5h6"],"alts":[]},
      {"id":"a4jmA","rating":902,"themes":["doubleCheck","mate","mateIn1","middlegame","oneMove"],"f":"2b2rk1/r3pp1p/3p2p1/q1p3Pn/1nN2P2/pPKPPN1P/2P2QB1/3R3R b - - 3 19","m":["c7f8"],"alts":[]},
      {"id":"JcSy5","rating":915,"themes":["discoveredAttack","kingsideAttack","mate","mateIn2","middlegame","short"],"f":"2kr3r/2q2p2/8/pQppnN1p/6pP/4P3/PP3P1P/2R2RK1 b - - 3 27","m":["d1g3","b5e5","a2e8"],"alts":[]},
      {"id":"CRiSA","rating":928,"themes":["doubleCheck","kingsideAttack","mate","mateIn2","middlegame","short"],"f":"r5k1/p1p3pp/1bp4r/3N3n/2QPPp2/5P2/PP3PR1/R1B4K b - - 0 22","m":["e1b3","e5b5","e6e5"],"alts":[]},
      {"id":"Z5tBs","rating":941,"themes":["doubleCheck","mate","mateIn1","middlegame","oneMove"],"f":"1r1qkb1r/1pp2ppp/p7/3n1p2/3P4/2P2N2/P1P1BPPP/1RB1R1K1 w k - 0 14","m":["d8c1"],"alts":[]},
      {"id":"7iR0r","rating":954,"themes":["crushing","discoveredAttack","kingsideAttack","middlegame","short"],"f":"r4rk1/pp2qppp/2p2n2/8/4B3/4Q2P/PPP2PP1/2KR1R2 w - - 3 21","m":["d7e2","b4e2","d3d2"],"alts":[]},
      {"id":"2MGDC","rating":966,"themes":["doubleCheck","endgame","mate","mateIn2","short"],"f":"3r4/pp3p1k/2pp1Rp1/P3p3/1PP1P1Q1/3P2PP/3qn1K1/5R2 b - - 0 32","m":["d8g7","b8b5","h8b8"],"alts":[]},
      {"id":"mrzBL","rating":979,"themes":["crushing","discoveredAttack","endgame","master","short"],"f":"6k1/2p2pp1/2p1b2p/p1q5/2Pr3P/3PQ1P1/3R1R1K/8 b - - 1 38","m":["h7e7","b3e7","a1d3"],"alts":[]}
    ]},
  "2-11":{"version":2,"src":"https://lichess.org/training/OMhAN","focus":["discoveredAttack"],"puzzles":[
      {"id":"OMhAN","rating":801,"themes":["crushing","discoveredAttack","endgame","long","master","rookEndgame"],"f":"8/kpK5/8/rP1R4/8/8/8/8 w - - 0 65","m":["c1c6","f2f6","h1f1","f6f1","a2c2"],"alts":[]},
      {"id":"u4q3y","rating":826,"themes":["advantage","discoveredAttack","kingsideAttack","middlegame","short"],"f":"r3r1k1/ppq1bpp1/3p1n1p/4pb2/4N3/2P1BN2/PPQ2PPP/R4RK1 w - - 7 18","m":["d7g6","d2g6","a8g1"],"alts":[]},
      {"id":"tDWVz","rating":850,"themes":["crushing","discoveredAttack","endgame","short"],"f":"7k/4q1p1/4n1Qb/p3R2P/1pP2p2/1P3P2/P1K2P2/8 b - - 0 41","m":["d6h7","a8h3","d2d1"],"alts":[]},
      {"id":"pcRZE","rating":876,"themes":["deflection","discoveredAttack","endgame","mate","mateIn2","queensideAttack","short"],"f":"2kr4/p1p2p2/4p1p1/4P2p/4P3/2qBbPP1/PP4P1/1K1R4 w - - 0 24","m":["h3f6","a4c4","h5h4"],"alts":[]},
      {"id":"6fhlh","rating":902,"themes":["crushing","discoveredAttack","endgame","master","short"],"f":"2r3k1/p1r3pp/4p3/3p4/Q3BqPP/8/P4P2/4R1K1 w - - 0 31","m":["d7e2","b4e2","f7g7"],"alts":[]},
      {"id":"JGitS","rating":926,"themes":["crushing","discoveredAttack","middlegame","short"],"f":"2k2r2/1pq5/r1bR3R/p1QNpPp1/4P1P1/P2P4/1PK5/8 b - - 3 31","m":["a6f7","a8c5","a2a1"],"alts":[]},
      {"id":"BRs7w","rating":951,"themes":["attackingF2F7","crushing","deflection","discoveredAttack","opening","short"],"f":"rn1qk1nr/pp3ppp/2p5/3B1b2/8/2P1P3/P4PPP/R1BQK1NR w KQkq - 0 9","m":["h1g2","d4g2","h5h4"],"alts":[]},
      {"id":"pb5tQ","rating":976,"themes":["advantage","discoveredAttack","endgame","short"],"f":"4n1qk/1p3Rb1/6Qp/p2p2p1/P2P3P/1PP5/6P1/2B3K1 b - - 0 31","m":["b2h7","a3h7","b4b6"],"alts":[]},
      {"id":"flrPO","rating":1002,"themes":["advantage","discoveredAttack","opening","short"],"f":"r1b2rk1/1pq1ppbp/p2p1np1/n7/P1BPP3/5N1P/1PQ2PP1/RNB1R1K1 w - - 1 12","m":["a7g2","g4g2","a8a2"],"alts":[]},
      {"id":"vSwGU","rating":1027,"themes":["advantage","discoveredAttack","discoveredCheck","kingsideAttack","master","middlegame","short"],"f":"3n1rk1/1p2rq2/p6p/3pPbN1/P2P1p2/2PB3P/1P5K/R5R1 w - - 0 27","m":["b1g2","b4g2","h3g1"],"alts":[]},
      {"id":"nxF5E","rating":1052,"themes":["crushing","discoveredAttack","endgame","short"],"f":"3Q4/1p1b1pkp/p1pq1np1/3p4/3P4/P2B1NP1/1PP2PKP/8 b - - 3 28","m":["h2e3","b8e3","h6h4"],"alts":[]},
      {"id":"mqTET","rating":1077,"themes":["crushing","discoveredAttack","discoveredCheck","endgame","master","short"],"f":"3r4/kb3Pbp/1pnNQ3/p1p5/8/PP1PP3/2P4P/7K b - - 2 28","m":["a6h7","h6c2","h7d6"],"alts":[]},
      {"id":"9ZkLz","rating":1103,"themes":["discoveredAttack","kingsideAttack","mate","mateIn2","middlegame","short"],"f":"r4rk1/ppq2ppp/8/1BBpn3/4N1n1/2P2N2/PP3PPP/R2Q1RK1 b - - 0 15","m":["d1g3","b8g3","a2e8"],"alts":[]},
      {"id":"17eZC","rating":1127,"themes":["advantage","discoveredAttack","opening","short"],"f":"rnb2rk1/pp3pp1/2p4p/4N3/2Pq1p2/3Bn3/P2Q2PP/R1B1R1K1 w - - 0 16","m":["h3e2","b4e2","h8h7"],"alts":[]},
      {"id":"TIqYW","rating":1152,"themes":["advancedPawn","crushing","discoveredAttack","discoveredCheck","middlegame","short"],"f":"2r2r1k/1p1q1p2/p5pP/1n1pPp2/5P2/1P5Q/7P/B2R1R1K w - - 0 36","m":["d1d6","e4e2","d6h2"],"alts":[]}
    ]},
  "2-12":{"version":2,"src":"https://lichess.org/training/xO6AQ","focus":["defensiveMove","mateIn1","mateIn2"],"puzzles":[
      {"id":"xO6AQ","rating":800,"themes":["crushing","defensiveMove","endgame","short"],"f":"8/3k3p/6p1/3P2P1/1bK5/8/8/8 w - - 0 55","m":["a7c7","h2h6","c7a7"],"alts":[]},
      {"id":"1yhQy","rating":808,"themes":["endgame","mate","mateIn2","short"],"f":"5k2/2p2pp1/pq4p1/1p6/3b2P1/4RQ1P/P4K2/8 w - - 1 35","m":["g3f4","c6c4","f4c4"],"alts":[]},
      {"id":"HxXXN","rating":817,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"r2qk2r/pb1n2p1/2p1pp2/1p1n3p/2pP1PN1/B1P3P1/P1Q1P1BP/R4RK1 w kq - 0 14","m":["a8b6"],"alts":[]},
      {"id":"ZfHSA","rating":825,"themes":["endgame","mate","mateIn1","oneMove"],"f":"5r1k/p1Q4p/8/1p1q4/6RK/2P1r2P/PP4P1/8 w - - 0 38","m":["a2b2"],"alts":[]},
      {"id":"XXR6x","rating":834,"themes":["mate","mateIn1","oneMove","opening"],"f":"2kr1b1r/ppp2ppp/8/4p2q/6n1/5BN1/PPPB1PP1/R2Q1RK1 b - - 0 13","m":["e1e8"],"alts":[]},
      {"id":"0LamX","rating":842,"themes":["mate","mateIn1","oneMove","opening","swallowstailMate"],"f":"N1bk2nr/pp1p1ppp/8/8/1B1qP3/3P2P1/P1n1K2P/R2Q1BNR b - - 3 13","m":["h7d3"],"alts":[]},
      {"id":"mR5px","rating":851,"themes":["advantage","defensiveMove","endgame","short"],"f":"5k2/5p2/8/p1rpPQ2/1p6/1P6/P3q2K/5R2 w - - 1 45","m":["g5g8","d8g8","g1g8"],"alts":[]},
      {"id":"Sjpxq","rating":859,"themes":["endgame","mate","mateIn2","short"],"f":"8/2R5/5ppk/2p4p/1b3PPP/2n2K2/8/8 w - - 2 44","m":["b7b1","g6b1","g7b1"],"alts":[]},
      {"id":"ztSCr","rating":867,"themes":["endgame","mate","mateIn1","oneMove"],"f":"Qq6/R6p/2P1pk2/5pp1/8/pr2P2P/5PP1/6K1 b - - 8 36","m":["c3c5"],"alts":[]},
      {"id":"t5sTP","rating":876,"themes":["endgame","master","mate","mateIn2","short"],"f":"7k/7p/1p3r2/2p3R1/3P4/4RN1q/P3K3/8 w - - 0 40","m":["d3d4","g6g4","d4g4"],"alts":[]},
      {"id":"T8lGo","rating":884,"themes":["mate","mateIn2","middlegame","short"],"f":"4r1rk/7p/3pB3/pp1Pp2q/8/P1P2P2/1P4Qb/6RK w - - 0 34","m":["b8b4","d4b4","b5b4"],"alts":[]},
      {"id":"3V40t","rating":893,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove"],"f":"6nr/1pkN1pp1/p3p1p1/2BpP3/6Pq/8/PPP2P1P/R2Q1RK1 b - - 0 17","m":["e7e8"],"alts":[]},
      {"id":"OxP9Y","rating":901,"themes":["endgame","mate","mateIn2","short"],"f":"5rk1/1p6/p2qp1pp/3p4/P4PQ1/1P6/5r1P/6RK w - - 0 26","m":["b7b6","b4e4","b6e6"],"alts":[]},
      {"id":"AzHJ5","rating":910,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove"],"f":"2r3k1/1b3pp1/p2p3p/1p1qN3/1P6/P7/4BPPP/3Q1RK1 b - - 0 22","m":["h1b8"],"alts":[]},
      {"id":"24WCx","rating":918,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"2r2qk1/pp1n1p2/4p1nQ/3pP1N1/2rP2P1/2PR3P/P1R2P2/6K1 w - - 3 26","m":["e6e2"],"alts":[]}
    ]},
  "2-13":{"version":2,"src":"https://lichess.org/training/TXIpR","focus":["short","oneMove"],"puzzles":[
      {"id":"TXIpR","rating":801,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"2rq1N1k/pp4bn/3P3p/6p1/8/1B2P2P/PP3PP1/1R4K1 w - - 0 34","m":["g4b6"],"alts":[]},
      {"id":"MPnKv","rating":819,"themes":["advancedPawn","crushing","endgame","rookEndgame","short"],"f":"8/2p2k2/1p1p1P2/1P1Pp1P1/p3r3/5RK1/8/8 w - - 1 51","m":["b1b6","g2b6","g6g2"],"alts":[]},
      {"id":"f7RlT","rating":839,"themes":["endgame","mate","mateIn2","short"],"f":"6k1/2R2pp1/1p2p1p1/3n4/1P3P2/2P2R2/6PP/r2r1NK1 w - - 3 28","m":["a2a4","b4e2","g3e3"],"alts":[]},
      {"id":"lgdTH","rating":858,"themes":["mate","mateIn1","oneMove","opening"],"f":"rnb2k1r/pppn4/3pB2p/4b1qQ/5p2/3P4/PPPN2PP/RN3RK1 w - - 4 14","m":["e1g2"],"alts":[]},
      {"id":"BcgM2","rating":877,"themes":["attackingF2F7","mate","mateIn1","oneMove","opening"],"f":"r1bqkb1r/pp1nppp1/2p4p/4N3/2BP1n2/2N5/PPP2PPP/R2QK2R w KQkq - 0 10","m":["a7g2"],"alts":[]},
      {"id":"XCbmj","rating":897,"themes":["advantage","fork","middlegame","short"],"f":"r2qr1k1/bpp2p2/3p3p/p2P4/2PnNB2/P2B3P/1P1Q1P2/R4RK1 b - - 0 18","m":["h7g3","b5b8","g3h8"],"alts":[]},
      {"id":"U7H2W","rating":916,"themes":["mate","mateIn1","oneMove","opening","smotheredMate"],"f":"1rbqkb1r/p2nnppp/4p3/1N1p4/Q1p5/P1N1P3/1P3PPP/R1B1KB1R w KQk - 0 14","m":["c1h6"],"alts":[]},
      {"id":"U5dkg","rating":935,"themes":["crushing","endgame","fork","master","masterVsMaster","short"],"f":"5k2/4R3/3p1n1p/2p3p1/1pB2n2/3P1K1P/1P6/8 w - - 4 42","m":["d2g2","g4d4","g2g6"],"alts":[]},
      {"id":"668Xn","rating":955,"themes":["crushing","discoveredAttack","endgame","short"],"f":"5R2/pp1k4/2pn4/3p4/3P4/KP3N2/PP3r2/8 w - - 5 40","m":["g3d1","h2d6","g4g8"],"alts":[]},
      {"id":"15cRz","rating":974,"themes":["endgame","mate","mateIn1","oneMove"],"f":"8/5Q1p/2p5/3p1N2/3P2kP/6P1/5PK1/q1r5 w - - 1 55","m":["g8g3"],"alts":[]}
    ]},
  "3-0":{"version":2,"src":"https://lichess.org/training/JsKnF","focus":["discoveredCheck","doubleCheck"],"puzzles":[
      {"id":"JsKnF","rating":1001,"themes":["advantage","discoveredCheck","doubleCheck","endgame","fork","short"],"f":"1k1r4/pPp5/8/N3PPr1/3pQ3/1P6/2P1K3/q7 w - - 0 40","m":["f1a6","c4c2","a6h4"],"alts":[]},
      {"id":"yQMME","rating":1013,"themes":["advancedPawn","crushing","discoveredAttack","discoveredCheck","endgame","rookEndgame","short"],"f":"8/pr6/8/RP5k/6p1/2K5/8/8 w - - 0 45","m":["c1c6","e1b6","c6f2"],"alts":[]},
      {"id":"CaC8V","rating":1026,"themes":["discoveredAttack","discoveredCheck","endgame","long","mate","mateIn3","sacrifice"],"f":"7r/5p2/kp2p3/p1q2n2/P1R4p/1QP5/6PP/5R1K b - - 6 32","m":["g1b3","e8b3","e7b3","a7e7","e4e7"],"alts":[]},
      {"id":"oWMw4","rating":1038,"themes":["doubleCheck","mate","mateIn2","middlegame","short"],"f":"1r5r/p2kbppp/1q2n3/4P3/1P6/2PB1N2/3Q1PPP/4K2R w K - 0 22","m":["h3c1","h2a4","h8h2"],"alts":[]},
      {"id":"ObOgH","rating":1050,"themes":["crushing","discoveredAttack","discoveredCheck","fork","middlegame","short"],"f":"4k2r/1p3ppp/1n6/1PQnPq2/4N2r/P4P1P/5P2/R3RK2 w k - 7 26","m":["d7h6","d4g4","h6g1"],"alts":[]},
      {"id":"E7Rbc","rating":1062,"themes":["advantage","discoveredAttack","discoveredCheck","endgame","fork","short"],"f":"6k1/4p2p/3p4/3P4/6n1/1R4PK/2r4P/3R4 b - - 6 51","m":["b7g8","e3b8","g8h5"],"alts":[]},
      {"id":"V2G1j","rating":1075,"themes":["crushing","discoveredAttack","discoveredCheck","endgame","master","short"],"f":"4k3/8/1p6/1P6/1b3P2/3KN1P1/4R3/3qr3 w - - 0 56","m":["d3h5","d5d8","h3d8"],"alts":[]},
      {"id":"b116S","rating":1087,"themes":["advancedPawn","advantage","doubleCheck","endgame","fork","master","short"],"f":"6k1/pp3rp1/1b6/8/4p3/P1P2QP1/4R1KP/3R4 b - - 0 34","m":["d7g3","b8g5","g3d8"],"alts":[]},
      {"id":"byXd1","rating":1099,"themes":["doubleCheck","endgame","master","mate","mateIn2","short"],"f":"4n3/4np2/r6p/3p3k/p1pP2N1/2P2PKN/8/7R w - - 8 37","m":["e3g7","e1b1","e5e1"],"alts":[]},
      {"id":"BdTCZ","rating":1112,"themes":["doubleCheck","mate","mateIn1","middlegame","oneMove"],"f":"B3qrk1/p1pnbppp/2N5/8/8/3P2Pb/PPP2P1P/R1BQK2R b KQ - 0 12","m":["d2c7"],"alts":[]},
      {"id":"pqrRr","rating":1124,"themes":["doubleCheck","mate","mateIn2","middlegame","short"],"f":"7r/3nqpk1/8/p1pnPpNr/Pp1P4/1Pp4P/8/R1B3RK w - - 0 29","m":["b1d6","b2e2","b5b2"],"alts":[]},
      {"id":"P6V55","rating":1136,"themes":["crushing","discoveredAttack","discoveredCheck","fork","middlegame","veryLong"],"f":"r1q3rk/2p2R2/1p1p3B/pP1Pp3/P1P1N2b/7b/3QB2P/R6K b - - 0 29","m":["e3b8","e5b5","b8d7","e6b2","b4b2","g2b2","e4b2"],"alts":[]},
      {"id":"tLWZd","rating":1148,"themes":["discoveredAttack","discoveredCheck","long","mate","mateIn3","middlegame"],"f":"2kr3r/3p2qp/1Q2p3/4P3/1b4p1/4BP2/2P2P1P/RR4K1 b - - 0 22","m":["b7g3","d3b1","b2b1","b5g5","b1b8"],"alts":[]},
      {"id":"X0kyK","rating":1161,"themes":["advancedPawn","crushing","discoveredAttack","discoveredCheck","endgame","master","queenEndgame","short"],"f":"6k1/ppp3p1/7p/3P4/1PQPp3/5qPP/8/4K3 w - - 3 35","m":["h1h6","b4e2","h6a2"],"alts":[]},
      {"id":"P4IFU","rating":1173,"themes":["crushing","discoveredAttack","discoveredCheck","endgame","long"],"f":"8/3r4/7p/6k1/p5p1/P7/1b4PP/1B3R1K w - - 2 39","m":["g5g1","b1b6","g1h1","b6g6","h1h2"],"alts":[]}
    ]},
  "3-1":{"version":2,"src":"https://lichess.org/training/Xz2QM","focus":["pin"],"puzzles":[
      {"id":"Xz2QM","rating":1001,"themes":["advantage","middlegame","pin","short"],"f":"4r1k1/1p5p/p2b2p1/2pq4/P5PP/2R1pP2/1P1rB1R1/2Q4K w - - 2 38","m":["d8a7","h1a7","a3a7"],"alts":[]},
      {"id":"JRP2X","rating":1027,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove","pin","smotheredMate"],"f":"r3k2r/pp1b1qp1/1bn1p3/3pPn2/3P4/P1N2NP1/1P4BP/R2Q1RBK b kq - 4 18","m":["g1b3"],"alts":[]},
      {"id":"cxR4m","rating":1052,"themes":["crushing","middlegame","pin","short"],"f":"3r4/pb3pkp/1p1q1np1/4p3/1P1N4/P3P1Q1/B4PPP/2R3K1 w - - 0 25","m":["h7g1","b2g4","g1h6"],"alts":[]},
      {"id":"OAQYU","rating":1078,"themes":["advantage","discoveredAttack","endgame","kingsideAttack","pin","short"],"f":"2b2rk1/p5p1/4p2p/2p1rp2/3pN3/1P1P2R1/P1P3PP/4R1K1 w - - 0 23","m":["d7g6","b4g2","d5d1"],"alts":[]},
      {"id":"XLw4Y","rating":1105,"themes":["crushing","endgame","pin","short"],"f":"1Q6/1p1q1kpp/4p3/5r2/8/3p2P1/PP5P/2R3K1 w - - 2 32","m":["a5a2","h2a2","c4a2"],"alts":[]},
      {"id":"a6fQo","rating":1129,"themes":["crushing","endgame","pin","short"],"f":"3r1k2/1p2qpp1/7p/3pN3/3Pn3/5QRP/5PP1/6K1 w - - 4 30","m":["d1b6","g4d4","b6d2"],"alts":[]},
      {"id":"dBTJQ","rating":1154,"themes":["advantage","middlegame","pin","short"],"f":"r3kb1r/pp1q1ppp/5n2/3pp3/2B5/2N1BQ1P/PP3PP1/n1K4R w kq - 0 14","m":["a7c1","h2c1","a3c1"],"alts":[]},
      {"id":"FRGSO","rating":1180,"themes":["crushing","kingsideAttack","middlegame","pin","short"],"f":"2r1r1k1/2BN1qp1/b3pnQp/p2p4/1p1P1R2/4P2P/P5P1/2R3K1 w - - 3 29","m":["h2g6","g2g6","g7g6"],"alts":[]},
      {"id":"Ockgk","rating":1205,"themes":["crushing","deflection","endgame","pin","short"],"f":"6k1/1q3p2/4p1p1/R5p1/6P1/p4Q1P/B4PK1/3r4 b - - 21 53","m":["h5b5","b8b5","c2g3"],"alts":[]},
      {"id":"M4vLq","rating":1231,"themes":["crushing","middlegame","pin","short"],"f":"3r2k1/6p1/p3pqQ1/3r2R1/2p1pp1P/P1Pb4/BP3P2/R5K1 w - - 2 33","m":["b6g6","h1b1","g6b1"],"alts":[]},
      {"id":"XwvR4","rating":1256,"themes":["mate","mateIn2","middlegame","pin","queensideAttack","short"],"f":"r3k1r1/1pqbnp1Q/4p3/n2pP2P/3B4/5N2/1PP2PP1/2KR1B1R b q - 0 17","m":["f1c3","a5c5","f4f5"],"alts":[]},
      {"id":"cgLxz","rating":1282,"themes":["deflection","discoveredAttack","mate","mateIn2","middlegame","pin","short"],"f":"2k1r3/pp1r1p1p/8/2p1nN2/6p1/P1PP1bPP/2PK1P2/4RBR1 b - - 0 21","m":["d1a7","h8a5","d4d5"],"alts":[]},
      {"id":"AScP4","rating":1307,"themes":["mate","mateIn1","middlegame","oneMove","pin"],"f":"rn2k1br/pp2nqb1/2p1Q1pp/8/2B4P/6N1/PPP2PP1/R3R1K1 w kq - 0 17","m":["d6a4"],"alts":[]},
      {"id":"94YM7","rating":1333,"themes":["advantage","middlegame","pin","short"],"f":"2r1k2r/p5p1/3p1pb1/8/3Qq3/1P4BP/NP6/K6R w k - 0 30","m":["e5d5","d7d5","b3d5"],"alts":[]}
    ]},
  "3-2":{"version":2,"src":"https://lichess.org/training/IDiKJ","focus":["mate","backRankMate","mateIn2"],"puzzles":[
      {"id":"IDiKJ","rating":1000,"themes":["dovetailMate","mate","mateIn1","oneMove","opening"],"f":"r1b2rk1/pppp1ppp/5q2/8/3bP1P1/2NP2KP/PPP1N3/R2Q1B1R b - - 2 13","m":["g6g8"],"alts":[]},
      {"id":"TIlaQ","rating":1010,"themes":["backRankMate","long","mate","mateIn3","middlegame","sacrifice"],"f":"1r4k1/3Q2pp/4p3/q3P3/3P2bb/4P2p/8/2B2RK1 w - - 4 33","m":["h2g2","b4e4","g2g4","c4g4","g5g4"],"alts":[]},
      {"id":"VleGD","rating":1021,"themes":["backRankMate","long","mate","mateIn3","middlegame","sacrifice"],"f":"r4rk1/ppp3pp/8/8/4Q2q/8/PP3PPP/R1B1R1K1 b - - 0 18","m":["e7g8","b5e5","g8g5","d5g5","g4g5"],"alts":[]},
      {"id":"XwD3t","rating":1032,"themes":["mate","mateIn2","middlegame","short"],"f":"rnb1k2r/ppp3Q1/4q2p/5p2/7B/2P1bN2/P1P3PP/RK3B1R b kq - 0 15","m":["d6c6","g5c1","c6c1"],"alts":[]},
      {"id":"PGmpy","rating":1042,"themes":["attackingF2F7","mate","mateIn1","oneMove","opening"],"f":"rnbqk2r/pppp1pQp/5b2/8/2B2P2/2P2N2/PP1P2PP/RNB1K2n w Qkq - 1 9","m":["b2g2"],"alts":[]},
      {"id":"iQMzg","rating":1052,"themes":["endgame","master","mate","mateIn1","oneMove","rookEndgame"],"f":"6k1/5pp1/7p/1R6/3P4/3r1P2/1R2r1PP/6K1 b - - 2 36","m":["h3h5"],"alts":[]},
      {"id":"MmO62","rating":1063,"themes":["advancedPawn","backRankMate","mate","mateIn1","middlegame","oneMove","promotion"],"f":"Q1b2rk1/4bppp/p3pn2/1p2R3/8/N3B3/PPp2PPP/3R2K1 b - - 0 17","m":["a8h5b"],"alts":[]},
      {"id":"5PMpf","rating":1073,"themes":["mate","mateIn2","middlegame","short"],"f":"2r3k1/5rn1/4Q1RR/1p2P2p/6p1/4P1B1/PP3P1K/5q2 b - - 6 40","m":["g5e3","e8b5","a4a5"],"alts":[]},
      {"id":"Md691","rating":1084,"themes":["backRankMate","long","mate","mateIn3","middlegame","sacrifice"],"f":"r1b1r1k1/pp3ppp/2p5/4q2Q/8/P3P1P1/1P4BP/2R2RK1 w - - 1 24","m":["e1g2","b4e4","g2g4","d4g4","g5g4"],"alts":[]},
      {"id":"m3jGg","rating":1095,"themes":["backRankMate","deflection","long","mate","mateIn3","opening","sacrifice"],"f":"r1r1nnk1/p1q1b1pp/1p2P3/2ppp3/3P2P1/2P1PQ2/PP1N3P/R1B2RK1 w - - 0 17","m":["g3g2","b4e4","g2g4","d2g4","g5g4"],"alts":[]},
      {"id":"Am3TE","rating":1105,"themes":["endgame","mate","mateIn1","oneMove"],"f":"8/1p2p1k1/2p2pP1/3p4/3P4/2P1P1R1/r4q2/1QK3R1 b - - 6 35","m":["g8h8"],"alts":[]},
      {"id":"rCaKm","rating":1116,"themes":["mate","mateIn2","middlegame","sacrifice","short"],"f":"r1b2k1r/pp2q1pp/2p2b2/4p2B/8/1QN5/PP3PPP/3R1RK1 w - - 2 16","m":["h5h4","d2h4","c3g2"],"alts":[]},
      {"id":"ljxmy","rating":1126,"themes":["backRankMate","endgame","long","mate","mateIn3","sacrifice"],"f":"2r5/p1qk4/1p3Q1b/3p2N1/3P4/8/PP3P1P/1K2R3 b - - 0 43","m":["a2a8","c5f5","a8a5","d5a5","a4a5"],"alts":[]},
      {"id":"UhF7z","rating":1136,"themes":["mate","mateIn1","middlegame","oneMove"],"f":"r4rk1/pp4pp/1npb1n2/3p2Nq/3P2B1/2P1B3/PP1N1PP1/R2Q1RK1 b - - 0 18","m":["e1e8"],"alts":[]},
      {"id":"fZaJa","rating":1147,"themes":["endgame","mate","mateIn2","short"],"f":"8/b1R5/r5kp/4KN2/1n2P3/6P1/7P/8 w - - 3 53","m":["a2b2","b6e1","b3b7"],"alts":[]}
    ]},
  "3-3":{"version":2,"src":"https://lichess.org/training/jLNvm","focus":["pawnEndgame","advancedPawn","promotion"],"puzzles":[
      {"id":"jLNvm","rating":1000,"themes":["advancedPawn","mate","mateIn2","middlegame","promotion","short"],"f":"5r2/4rP1k/p2p1q1p/5b1P/P7/1B4Q1/1P4P1/3R3K w - - 3 33","m":["b3b4","g4b4","g2b4b"],"alts":[]},
      {"id":"iF6BI","rating":1011,"themes":["advancedPawn","advantage","endgame","promotion","rookEndgame","short"],"f":"8/1p6/p3pk2/2Pp4/3P1PPr/2P1R1Kp/1P6/8 b - - 5 43","m":["e3e8","b3e7","e8e5b"],"alts":[]},
      {"id":"iFwH3","rating":1021,"themes":["advancedPawn","endgame","master","mate","mateIn2","promotion","short"],"f":"4r2k/4PRp1/1b5p/8/1p2Q3/6qP/1P4P1/7K w - - 0 41","m":["g2g4","d4g4","d2g4b"],"alts":[]},
      {"id":"vZiZD","rating":1032,"themes":["advancedPawn","bishopEndgame","crushing","endgame","long"],"f":"8/8/2Pk4/7K/B5p1/8/8/8 b - - 0 62","m":["b7b3","a6a2","h6a2","f7a8","b3b8"],"alts":[]},
      {"id":"Ciwtc","rating":1043,"themes":["advancedPawn","advantage","endgame","long"],"f":"7k/p3q1p1/1pprP2p/5Q2/2PbP3/1P5P/P5P1/5R1K w - - 1 29","m":["g1g4","d2g4","g5g4","e4e2","d6d2"],"alts":[]},
      {"id":"am4Ty","rating":1054,"themes":["advancedPawn","endgame","mate","mateIn2","promotion","rookEndgame","short"],"f":"8/4PR1p/8/5P2/8/5k2/1pr4P/1R5K b - - 0 43","m":["a8a5","c5a5","c8a5b"],"alts":[]},
      {"id":"gZDbR","rating":1064,"themes":["advancedPawn","endgame","mate","mateIn2","promotion","queenEndgame","short"],"f":"Q7/8/8/8/8/8/1P3kpK/8 b - - 0 58","m":["b8b5b","e8e3","b5b3"],"alts":[]},
      {"id":"XU68e","rating":1075,"themes":["advancedPawn","crushing","endgame","hangingPiece","master","short"],"f":"8/8/8/6Q1/pP4Pk/2K4p/P7/8 b - - 0 72","m":["e7b1","c7c1","e3e8"],"alts":[]},
      {"id":"Iqmed","rating":1086,"themes":["advancedPawn","crushing","deflection","endgame","exposedKing","long","promotion"],"f":"3k4/1p6/p2P4/2P1B3/1q4BK/8/8/8 w - - 1 58","m":["d1g6","h4d4","h6h2","d4g2","h2h4b"],"alts":[]},
      {"id":"9n00g","rating":1096,"themes":["advancedPawn","crushing","endgame","master","rookEndgame","short"],"f":"8/p2k4/1p6/1P1p4/P2P1r2/4p1RP/6P1/6K1 b - - 0 50","m":["d3d8","b3d3","g7g5"],"alts":[]},
      {"id":"MDmbd","rating":1108,"themes":["advancedPawn","crushing","endgame","long","pawnEndgame","promotion"],"f":"8/7p/6p1/p3KP2/8/1k6/5P2/8 w - - 1 47","m":["g1g6","f1f7","g6g2","f7f3","g2g4b"],"alts":[]},
      {"id":"9nNSA","rating":1118,"themes":["advancedPawn","endgame","mate","mateIn2","promotion","short"],"f":"1R6/p7/k7/2P5/1P3P2/P4nr1/7p/5R1K b - - 2 38","m":["b3b5","g5b5","e8b5b"],"alts":[]},
      {"id":"zysAd","rating":1129,"themes":["advancedPawn","crushing","endgame","promotion","short"],"f":"3r4/5P1Q/4r3/1P3nk1/5p2/8/1P4PK/8 w - - 1 45","m":["e2b4","h4b4","g2b4b"],"alts":[]},
      {"id":"VnGL7","rating":1139,"themes":["advancedPawn","crushing","defensiveMove","endgame","knightEndgame","long","promotion"],"f":"8/8/8/8/6k1/7p/5KN1/8 b - - 1 68","m":["e3e8","b8d3","b7e3","g8g3","e8e5b"],"alts":[]},
      {"id":"vcGkD","rating":1150,"themes":["advancedPawn","advantage","endgame","master","masterVsMaster","promotion","short"],"f":"6k1/pp3pb1/2pP3p/3n1RpP/3N2P1/3P4/1PK2P2/4r3 w - - 0 35","m":["h6h2","b2h7","h2h4b"],"alts":[]}
    ]},
  "3-4":{"version":2,"src":"https://lichess.org/training/d5wD2","focus":["capturingDefender","deflection"],"puzzles":[
      {"id":"d5wD2","rating":1000,"themes":["deflection","endgame","mate","mateIn2","short"],"f":"4q1kb/3p4/p2Pp3/1p2r1N1/2p1Q1P1/8/PPP2PK1/8 w - - 0 31","m":["d7e2","b4g4","e2e4"],"alts":[]},
      {"id":"zj8Uo","rating":1012,"themes":["crushing","deflection","endgame","rookEndgame","short"],"f":"8/7p/P2k4/rP2R3/3K4/8/4P3/8 b - - 2 49","m":["f1f7","h7a3","h6d1"],"alts":[]},
      {"id":"JSpvO","rating":1025,"themes":["deflection","mate","mateIn2","middlegame","short"],"f":"5nk1/pp3ppp/2p2p2/2Pr4/PP1P4/3BP1b1/2Q3Nq/R2R1K2 b - - 4 23","m":["e8e5","g5d8","e5b8"],"alts":[]},
      {"id":"ME76j","rating":1038,"themes":["clearance","deflection","endgame","kingsideAttack","long","mate","mateIn3","sacrifice"],"f":"6k1/4ppb1/2p5/1p1p1pNR/2qP1P2/4PP2/r1PK2P1/7Q w - - 3 28","m":["e1e4","b2e4","e5e2","b4g4","e2e4"],"alts":[]},
      {"id":"BfHME","rating":1050,"themes":["advantage","capturingDefender","discoveredAttack","endgame","short"],"f":"8/1b6/pP6/5k1p/4p1p1/4prP1/4B2P/4R1K1 w - - 0 40","m":["d8g3","b7g3","d5d3"],"alts":[]},
      {"id":"cjrri","rating":1062,"themes":["crushing","deflection","endgame","short"],"f":"4r1k1/5pp1/p1Qq3p/1p6/1P6/P6P/5PP1/2R3K1 b - - 3 42","m":["d4d5","a5d5","h6a6"],"alts":[]},
      {"id":"eqJKF","rating":1075,"themes":["advantage","deflection","fork","long","middlegame"],"f":"r1b5/2b3k1/2p1pqpp/p1Pp4/P2P2nP/3Q1N2/1P3PP1/RB2R1K1 b - - 5 28","m":["a2e8","b5e5","b7g8","e5e8","g8h3"],"alts":[]},
      {"id":"farpZ","rating":1087,"themes":["advantage","deflection","endgame","master","masterVsMaster","short","skewer"],"f":"6k1/5p2/7p/6p1/6P1/2b1PPN1/R4KP1/2r5 b - - 8 41","m":["a3d5","g8d8","d5b3"],"alts":[]},
      {"id":"6uYie","rating":1100,"themes":["backRankMate","deflection","endgame","long","master","mate","mateIn3"],"f":"5r1k/p3Q1pp/8/8/5q2/8/1P4PP/3R1NK1 b - - 3 33","m":["g7g8","b5e5","g8g5","h5g5","g4g5"],"alts":[]},
      {"id":"NJm79","rating":1112,"themes":["advantage","deflection","endgame","master","short"],"f":"6k1/6p1/1pQ2p1p/p2q4/3Pr3/6P1/PP3PP1/2R3K1 b - - 0 31","m":["d7d5","a5d5","h1a6"],"alts":[]},
      {"id":"Vdazm","rating":1125,"themes":["advancedPawn","advantage","deflection","endgame","master","promotion","short"],"f":"6R1/6R1/5P1k/p6p/1b5r/8/2Kp1P2/8 b - - 0 48","m":["e7a7","a8h3","h8h5b"],"alts":[]},
      {"id":"9xI8f","rating":1138,"themes":["advantage","deflection","endgame","short"],"f":"4r1k1/5pp1/2p3q1/5Q1p/5n2/3P2N1/PPP2PPP/R5K1 b - - 1 25","m":["g7d8","b3d8","b6g1"],"alts":[]},
      {"id":"ewsd3","rating":1150,"themes":["crushing","deflection","endgame","master","rookEndgame","short"],"f":"8/6R1/5K1k/1P5p/8/7r/8/8 b - - 0 51","m":["e3g3","g6d1","e6b2"],"alts":[]},
      {"id":"aH0gI","rating":1163,"themes":["attraction","deflection","endgame","long","mate","mateIn3","sacrifice"],"f":"4Qnk1/1p3pp1/p3p3/8/8/P6R/1Br3PK/4q3 w - - 6 35","m":["e3e4","b4e4","d4g4","e4e2","g4b2"],"alts":[]},
      {"id":"5fusH","rating":1175,"themes":["crushing","deflection","endgame","short"],"f":"8/pp1Rrp1p/5kp1/8/1PN1pPP1/P1n1P2P/8/5K2 w - - 5 35","m":["b7b1","g6b2","h2d2"],"alts":[]}
    ]},
  "3-5":{"version":2,"src":"https://lichess.org/training/3cyud","focus":["defensiveMove"],"puzzles":[
      {"id":"3cyud","rating":1000,"themes":["advancedPawn","crushing","defensiveMove","endgame","knightEndgame","long","promotion"],"f":"8/8/3p4/1P1N4/P7/5p2/K3k3/8 b - - 1 56","m":["g3g8","c1c6","g8g5b","c6c2","g5g4"],"alts":[]},
      {"id":"TWpL0","rating":1038,"themes":["advantage","defensiveMove","middlegame","short"],"f":"3rr3/pQ4k1/5q1p/2p3pb/2P1p3/P3P1PP/5P2/R3RBK1 b - - 0 28","m":["d4d2","c2d2","g6d2"],"alts":[]},
      {"id":"W9Yom","rating":1075,"themes":["crushing","defensiveMove","endgame","master","short"],"f":"6k1/5pbp/4p1p1/pQp5/P2p4/1P3R1P/2P3P1/4q2K w - - 2 35","m":["g3g5","d5g5","c1g5"],"alts":[]},
      {"id":"oLhK2","rating":1112,"themes":["advantage","defensiveMove","hangingPiece","long","middlegame"],"f":"2Q3k1/2r3pp/2N2q2/4pp2/4n3/P7/1P3PPP/2RR2K1 b - - 0 28","m":["a2a4","a6d2","g6d2","a5a4","b4g2"],"alts":[]},
      {"id":"kr20A","rating":1150,"themes":["crushing","defensiveMove","endgame","pawnEndgame","short"],"f":"8/p2k3p/2p2p2/1pP2Pp1/PP1K2P1/8/7P/8 w - - 0 39","m":["f7c1","a6c1","h7h1"],"alts":[]},
      {"id":"PNaKa","rating":1188,"themes":["advancedPawn","crushing","defensiveMove","endgame","master","rookEndgame","short"],"f":"8/8/2PK4/1R3pk1/8/3r4/8/8 w - - 2 50","m":["c1h1","h3e3","a6a2"],"alts":[]},
      {"id":"mfRSm","rating":1225,"themes":["crushing","defensiveMove","endgame","rookEndgame","short"],"f":"8/8/4R1pp/4p1k1/5rP1/5K1P/5P2/8 w - - 5 53","m":["g3b3","g7b7","e3b7"],"alts":[]},
      {"id":"FkMQE","rating":1263,"themes":["crushing","defensiveMove","endgame","short"],"f":"6k1/8/5Bp1/5bP1/5Pr1/5K2/7p/R7 b - - 1 56","m":["b7b5","f5f4","b4g2"],"alts":[]},
      {"id":"zCBJC","rating":1300,"themes":["advancedPawn","bishopEndgame","crushing","defensiveMove","endgame","veryLong"],"f":"8/8/8/3BK3/3p2kp/8/8/8 b - - 0 59","m":["h7h3","d1d7","h3h8","h1c3","e7e3","c3h5","b7b3"],"alts":[]},
      {"id":"I12Rj","rating":1338,"themes":["crushing","defensiveMove","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/5k2/p1p2p2/P1P2PpK/1P6/8/8 b - - 4 49","m":["g6b6","e7b3","b6e1","b3b8","e1e7"],"alts":[]}
    ]},
  "3-6":{"version":2,"src":"https://lichess.org/training/m9bXl","focus":["equality","endgame","zugzwang"],"puzzles":[
      {"id":"m9bXl","rating":1000,"themes":["crushing","defensiveMove","endgame","master","pawnEndgame","short","zugzwang"],"f":"8/1p6/p1p3k1/2Pp3p/1P1P1PK1/4P3/8/8 w - - 0 48","m":["b7e7","b6g6","e7e1"],"alts":[]},
      {"id":"Fv77i","rating":1010,"themes":["crushing","endgame","pawnEndgame","quietMove","veryLong","zugzwang"],"f":"8/8/4k3/1p3p2/5Kp1/1pP3P1/P7/8 w - - 0 45","m":["f8c3","d6g6","a3a7","c1c7","a7a1","g6d6","a1a6"],"alts":[]},
      {"id":"Oi4al","rating":1021,"themes":["advantage","endgame","fork","long"],"f":"8/1k5p/8/8/1P3N1P/6PK/5r2/3R1n2 b - - 4 45","m":["g8e8","e3b7","g5d3","b7e1","d3h5"],"alts":[]},
      {"id":"aB04b","rating":1031,"themes":["advancedPawn","advantage","defensiveMove","endgame","long"],"f":"2k5/2r3p1/PK3p1p/4bP2/8/3R2P1/7P/8 w - - 5 44","m":["f6f2","a2c2","c6f6","c2f2","f6f2"],"alts":[]},
      {"id":"m1FOz","rating":1041,"themes":["advantage","endgame","fork","short"],"f":"r4k2/7R/8/8/3Q4/3P1PKP/q7/8 b - - 2 55","m":["f8b4","h7b7","b4e2"],"alts":[]},
      {"id":"cgBHM","rating":1052,"themes":["crushing","endgame","veryLong","zugzwang"],"f":"8/6p1/k4p2/5P2/5Kr1/8/8/8 w - - 0 61","m":["g7b7","f6c1","b7e1","c1a7","e1b6","a7h1","b6b2","h1d1","b2b6","d1d7","b6g6"],"alts":[]},
      {"id":"X5myG","rating":1062,"themes":["crushing","endgame","pawnEndgame","short","zugzwang"],"f":"8/2k5/p1p5/P7/1P1K4/8/8/8 w - - 1 54","m":["h7a1","a2h2","a1c6"],"alts":[]},
      {"id":"QQeVN","rating":1073,"themes":["crushing","defensiveMove","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/8/p7/6p1/1P3KPk/8/8 w - - 0 48","m":["g3g7","e3e8","g7b7","f1f7","c3f7"],"alts":[]},
      {"id":"mt3Xy","rating":1083,"themes":["crushing","endgame","hangingPiece","long","zugzwang"],"f":"2k5/K7/2r5/PP6/8/8/8/8 w - - 0 53","m":["c1a6","a4a2","f1f6","a2a6","f2c4"],"alts":[]},
      {"id":"sNrMg","rating":1093,"themes":["backRankMate","endgame","long","mate","mateIn3","sacrifice"],"f":"5rk1/2RQ2b1/7p/3p4/4p3/4P3/3q1PPP/2R3K1 b - - 1 29","m":["h8g8","b5e5","g8g5","a5g5","g4g5"],"alts":[]},
      {"id":"whko9","rating":1104,"themes":["crushing","endgame","exposedKing","long","rookEndgame","zugzwang"],"f":"8/8/4p3/4Pk2/4R3/5K2/2r5/8 b - - 3 48","m":["a8a3","d7d3","a3d3","g3d3","g1d1"],"alts":[]},
      {"id":"Rn9Ii","rating":1114,"themes":["deflection","endgame","long","mate","mateIn3"],"f":"3Q4/5pk1/p1p3p1/4p1P1/8/8/PPP1q2r/2KR4 w - - 3 33","m":["h4g6","b2b4","h5h4","b4e2","g6g2"],"alts":[]}
    ]},
  "3-7":{"version":2,"src":"https://lichess.org/training/ESKY1","focus":["xRayAttack","skewer"],"puzzles":[
      {"id":"ESKY1","rating":1000,"themes":["advantage","endgame","master","rookEndgame","short","skewer"],"f":"6k1/p1R5/4R3/8/8/1P2KP2/r4P1P/3r4 b - - 3 40","m":["h5d5","d3g7","d5d6"],"alts":[]},
      {"id":"hRZbJ","rating":1012,"themes":["advantage","endgame","short","skewer"],"f":"6R1/8/p2p1k2/1pp4p/3nP3/1P1B4/PKP2r2/8 w - - 0 37","m":["b4g4","g6b1","g4g8"],"alts":[]},
      {"id":"IIyM1","rating":1024,"themes":["crushing","endgame","short","skewer"],"f":"8/7R/1p1k4/pBp2p1P/P3b3/1P6/1KPr4/8 w - - 1 39","m":["e2h2","h6d6","h2h8"],"alts":[]},
      {"id":"qB3K5","rating":1036,"themes":["crushing","middlegame","short","skewer"],"f":"2k2r2/b6p/R2P4/1pp5/2N5/2P1RP1q/1P4p1/3Q2K1 b - - 0 27","m":["e3e5","b5g8","e5h5"],"alts":[]},
      {"id":"xK43r","rating":1048,"themes":["endgame","fork","mate","mateIn2","short","xRayAttack"],"f":"4r1k1/6p1/p2R3p/1p4N1/8/8/1P3PPP/q2Q2K1 b - - 2 26","m":["d4d5","h5d5","f5d5"],"alts":[]},
      {"id":"yBVkJ","rating":1060,"themes":["kingsideAttack","mate","mateIn2","middlegame","pillsburysMate","short","xRayAttack"],"f":"3r2k1/1p3ppp/1B6/p7/P3b1q1/1B4Q1/1PPR1P1P/3R2K1 b - - 2 26","m":["b7h5","h8h5","h4h5"],"alts":[]},
      {"id":"rgmVm","rating":1071,"themes":["advantage","endgame","short","skewer"],"f":"2R5/8/2p2kp1/8/3b2PP/5b1K/8/8 w - - 0 46","m":["a4g4","g6d1","g4g3"],"alts":[]},
      {"id":"A7Nok","rating":1084,"themes":["mate","mateIn2","middlegame","short","xRayAttack"],"f":"8/5rpk/3q3p/Q7/6N1/P3R2P/1P4P1/3rR2K b - - 0 39","m":["g2g5","d5g5","h5g5"],"alts":[]},
      {"id":"Ebw0Q","rating":1095,"themes":["endgame","master","mate","mateIn2","short","xRayAttack"],"f":"5k2/ppq2p2/2p2p2/2P2N1p/1PB1R1pK/6Q1/P2r4/8 b - - 1 36","m":["h8e8","b3e8","a2e8"],"alts":[]},
      {"id":"UZyM4","rating":1107,"themes":["advantage","endgame","short","skewer"],"f":"8/1p3rkp/6p1/1R2K3/4N3/5P1P/6P1/8 b - - 4 46","m":["g2g1","d1h7","g1c1"],"alts":[]},
      {"id":"hjgbh","rating":1119,"themes":["advantage","endgame","rookEndgame","short","skewer"],"f":"8/pp3p1p/8/1r3k2/5P2/2P5/PP2RKR1/3r4 w - - 7 36","m":["b8b1","g1g7","b1c1"],"alts":[]},
      {"id":"GOwpl","rating":1131,"themes":["backRankMate","endgame","mate","mateIn2","sacrifice","short","xRayAttack"],"f":"1k6/ppp4p/6p1/q2r4/1b2N2Q/8/PPP3PP/1K1R4 w - - 0 26","m":["e7h4","h1h4","h5h4"],"alts":[]},
      {"id":"rCxf6","rating":1143,"themes":["backRankMate","endgame","mate","mateIn2","sacrifice","short","xRayAttack"],"f":"4rrk1/pp3pp1/7p/q1pR4/2P5/1P6/P1Q1RPPP/6K1 b - - 2 24","m":["f1d5","d8d5","d4d5"],"alts":[]},
      {"id":"HabeB","rating":1155,"themes":["crushing","endgame","rookEndgame","short","skewer"],"f":"8/5R2/8/p7/r3k3/5pK1/5P2/8 w - - 0 46","m":["g2g7","d7h1","g7f7"],"alts":[]},
      {"id":"v1FLo","rating":1167,"themes":["crushing","endgame","exposedKing","long","sacrifice","skewer"],"f":"2rr2k1/5p1p/6pP/8/p4P2/P2Np3/1P2B3/4K1R1 b - - 1 37","m":["h4h3","d8h3","a4a5","d5d8","a5b5"],"alts":[]}
    ]},
  "3-8":{"version":2,"src":"https://lichess.org/training/R5yv8","focus":["defensiveMove","pin"],"puzzles":[
      {"id":"R5yv8","rating":1000,"themes":["crushing","defensiveMove","endgame","long","queenEndgame"],"f":"8/q7/6pk/7p/8/P2Q4/3K4/8 w - - 1 45","m":["h3d3","f2d3","h8d3","e6b1","f3f7"],"alts":[]},
      {"id":"suqUA","rating":1016,"themes":["crushing","endgame","pin","short"],"f":"r5k1/1p3ppp/2bR4/8/p2R4/8/6PP/7K w - - 0 36","m":["h6h4","a6d4","h4f4"],"alts":[]},
      {"id":"Iibap","rating":1032,"themes":["advantage","endgame","long","pin","queenRookEndgame"],"f":"6k1/1p4p1/p7/8/2p4q/5R2/6K1/5R2 w - - 0 43","m":["g3g4","b4e2","g5e5","e7e5","b8e5"],"alts":[]},
      {"id":"YGv4K","rating":1049,"themes":["advantage","long","middlegame","pin"],"f":"2rqkb1r/1b3ppp/p7/1p1p4/3Q4/P1N2P2/1PP1B1PP/3RR1K1 b k - 3 15","m":["g4a1","d8c1","d4g4","h7a1","a4a1"],"alts":[]},
      {"id":"l0Ywb","rating":1065,"themes":["crushing","defensiveMove","endgame","long"],"f":"8/8/p2p1k2/1p1P4/1P2P3/P4Kb1/8/8 w - - 0 38","m":["g3b3","g6d1","b3g3","d1h7","g3g7"],"alts":[]},
      {"id":"UTuhg","rating":1081,"themes":["advantage","middlegame","pin","short"],"f":"2B4k/p5pp/1p6/5p2/1P3q2/P3RN2/2rQ1KP1/R7 b - - 0 32","m":["a8h8","d3d8","h8d8"],"alts":[]},
      {"id":"WdGt9","rating":1097,"themes":["endgame","long","mate","mateIn3","pin"],"f":"r3r2k/4N1pp/5p2/4p3/P6R/8/2n1BPKP/8 w - - 6 36","m":["d2b6","e4b4","d8a7","d4d6","a7d6"],"alts":[]},
      {"id":"sy1wo","rating":1113,"themes":["discoveredAttack","mate","mateIn2","middlegame","pin","short"],"f":"2r2bk1/pr3ppp/4p3/3pP2N/3P3Q/5P1P/q7/6RK w - - 0 29","m":["e1g6","b4e4","e7e2"],"alts":[]},
      {"id":"02ccm","rating":1129,"themes":["crushing","defensiveMove","endgame","long","zugzwang"],"f":"8/8/4k2p/4p1p1/4P1P1/rK3P1P/8/8 w - - 0 48","m":["c3f3","d6h2","f3c7","h2a6","c7a7"],"alts":[]},
      {"id":"8gNI9","rating":1146,"themes":["mate","mateIn1","middlegame","oneMove","pin"],"f":"5k2/p3nrp1/1p3b1p/1PQ5/1Bbp4/P3p3/2r3PP/4R1K1 w - - 0 28","m":["a1a4"],"alts":[]},
      {"id":"xlgsJ","rating":1162,"themes":["crushing","defensiveMove","endgame","long","queenEndgame","quietMove"],"f":"6k1/p7/4p1p1/2q4p/4P3/2Q3PP/1P3P2/6K1 b - - 0 31","m":["a1a3","c8a3","f2f1","b5g5","f1f7"],"alts":[]},
      {"id":"UGwHz","rating":1178,"themes":["advantage","opening","pin","short"],"f":"r1b2rk1/ppp3pp/2n5/2bqNp2/4n3/3B4/PPPPQPPP/R1B2RK1 w - - 0 10","m":["h3a7","a4d6","a7h1"],"alts":[]}
    ]},
  "3-9":{"version":2,"src":"https://lichess.org/training/rsrTp","focus":["trappedPiece","zugzwang"],"puzzles":[
      {"id":"rsrTp","rating":1000,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/p5p1/1p1k1p1P/1Pp2P1P/P1K2P2/8/8 b - - 0 39","m":["b6e1","a3a8","h1h7","a8h8","a7a3"],"alts":[]},
      {"id":"fzOY4","rating":1019,"themes":["crushing","defensiveMove","endgame","long","zugzwang"],"f":"8/2R5/3k1p2/6p1/6P1/6K1/8/8 b - - 0 44","m":["h6a2","b3g3","a2h6","g3d7","h6d6"],"alts":[]},
      {"id":"6Hmc8","rating":1038,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/p4k2/1p2p2p/1P2P3/P5PK/8/8 w - - 1 49","m":["e3e7","g6b6","b3b7","e1b7","e7b7"],"alts":[]},
      {"id":"70rRx","rating":1056,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/1p2k1p1/1Pp4p/2P2P1P/5K2/8/8 w - - 1 50","m":["g3d7","d6h6","g7g1","b6g1","d7g1"],"alts":[]},
      {"id":"l12Bu","rating":1075,"themes":["advantage","middlegame","short","trappedPiece"],"f":"1r1qkr2/5p2/2p1pb1Q/3b2p1/p2P4/P1B1P1N1/1P3PPP/2R1R1K1 b - - 0 24","m":["g4e4","e6g6","h4g6"],"alts":[]},
      {"id":"ju72b","rating":1094,"themes":["crushing","endgame","master","short","trappedPiece"],"f":"8/2k2B2/p3p3/4Pp2/1P5n/5Kp1/8/8 w - - 0 52","m":["g3b3","g1g7","b3e7"],"alts":[]},
      {"id":"E2OIb","rating":1113,"themes":["advancedPawn","crushing","defensiveMove","endgame","hangingPiece","long","zugzwang"],"f":"4k3/8/3PbK2/8/p7/P7/8/8 w - - 0 52","m":["g6d6","d4h4","h6h2","h4a2","d6d2"],"alts":[]},
      {"id":"m33fc","rating":1131,"themes":["crushing","endgame","pawnEndgame","short","zugzwang"],"f":"8/8/p1pk1p2/P7/3KPp2/6P1/8/8 w - - 0 44","m":["b3g7","a6a1","h7a7"],"alts":[]},
      {"id":"nxv82","rating":1150,"themes":["crushing","defensiveMove","endgame","long","zugzwang"],"f":"8/6k1/6p1/2p4R/1pP1P3/pP2K3/P7/8 b - - 0 40","m":["b6e1","d3g3","b2b6","g3b3","b6b1"],"alts":[]},
      {"id":"Dbt1C","rating":1169,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/3k4/8/1p2P1p1/1P2KpP1/8/8/8 b - - 7 49","m":["h2d6","d7h7","g7g3","h7d3","d6d1"],"alts":[]}
    ]},
  "3-10":{"version":2,"src":"https://lichess.org/training/Ji2ZW","focus":["pawnEndgame","zugzwang"],"puzzles":[
      {"id":"Ji2ZW","rating":1001,"themes":["crushing","endgame","long","pawnEndgame"],"f":"8/6k1/1p2p3/pP1pPpP1/P2P4/5K2/8/8 b - - 1 42","m":["b2b6","g3g7","b6e1","b1b6","e1b6"],"alts":[]},
      {"id":"EHTVm","rating":1013,"themes":["endgame","equality","quietMove","rookEndgame","short","zugzwang"],"f":"8/8/8/5pkp/7R/7K/8/8 b - - 0 55","m":["g1g7","e7g7","b1g7"],"alts":[]},
      {"id":"sswrK","rating":1026,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/1p6/2k2p2/p1P2p1p/P2K1P1P/8/8/8 w - - 0 44","m":["h7a7","a6h2","a7c1","h2a2","c1f1"],"alts":[]},
      {"id":"tnKms","rating":1039,"themes":["crushing","endgame","pawnEndgame","short","zugzwang"],"f":"8/1kp2p2/p1p3p1/P3P1Pp/1P1K3P/8/8/8 w - - 9 39","m":["h7a1","c2c4","a1a6"],"alts":[]},
      {"id":"yToZi","rating":1052,"themes":["crushing","endgame","pawnEndgame","short"],"f":"8/7p/5k2/3P1p2/p1p2K1P/P1p5/1P6/8 w - - 0 41","m":["c8a3","e2e1","h1h6"],"alts":[]},
      {"id":"khg3z","rating":1065,"themes":["crushing","endgame","pawnEndgame","veryLong"],"f":"8/8/1k2p1p1/5pP1/8/3K4/5P2/8 w - - 0 48","m":["h3h7","c6a6","h7d1","a6h2","d1g6","g1g7","g6b6"],"alts":[]},
      {"id":"zxCq4","rating":1078,"themes":["crushing","endgame","long","rookEndgame","zugzwang"],"f":"8/5p2/5P1k/5KRp/r6P/8/8/8 b - - 4 55","m":["f7f1","g1g7","f1b1","e7b1","e6b6"],"alts":[]},
      {"id":"RNV8z","rating":1091,"themes":["crushing","defensiveMove","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/6k1/4Kp1p/8/5PP1/8/8 b - - 2 59","m":["b6b1","g3g7","b1b7","d1g6","b7b3"],"alts":[]},
      {"id":"Mw1IF","rating":1104,"themes":["crushing","endgame","long","rookEndgame","zugzwang"],"f":"8/8/3r2p1/4k1Pp/5R1P/6K1/8/8 b - - 6 49","m":["h6h3","g7g3","h3g3","b3g3","d1g1"],"alts":[]},
      {"id":"piLBN","rating":1116,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/2k5/p1P2p1p/2K4p/4PPP1/8/8 w - - 0 35","m":["b3e7","f1f7","a7c7","f7f3","c7f3"],"alts":[]},
      {"id":"uQd79","rating":1130,"themes":["advancedPawn","crushing","endgame","pawnEndgame","promotion","veryLong"],"f":"8/2p5/3p4/1P1K4/5k2/8/8/8 w - - 6 63","m":["h1a6","g7d3","a6a2","h6h1","c1c6","h1h7","c6c2","h7h3","c2c4b"],"alts":[]},
      {"id":"01Pkt","rating":1143,"themes":["crushing","defensiveMove","endgame","long","pawnEndgame"],"f":"8/p6p/6p1/1P2p3/Pk2K3/5P2/6PP/8 b - - 5 34","m":["c7f7","d7d1","f7c1","g3g7","f2f1"],"alts":[]},
      {"id":"4lG3P","rating":1156,"themes":["advancedPawn","crushing","endgame","master","pawnEndgame","short"],"f":"8/pp3p1p/6p1/P1P5/1k6/8/2K4P/8 w - - 0 33","m":["f1f6","c7a1","f6c2"],"alts":[]},
      {"id":"GnKP8","rating":1169,"themes":["crushing","endgame","master","pawnEndgame","short"],"f":"8/1p6/3k4/P2p2p1/1P1K3p/5P1P/6P1/8 b - - 0 46","m":["h6a6","h7d1","a6c1"],"alts":[]},
      {"id":"7mrue","rating":1182,"themes":["advancedPawn","crushing","endgame","pawnEndgame","promotion","quietMove","veryLong"],"f":"8/8/8/8/pP1p4/k2K4/8/8 w - - 0 58","m":["c7c1","f3c7","c1c6","f7f3","c6c2","f3f8","c2c4b"],"alts":[]}
    ]},
  "3-11":{"version":2,"src":"https://lichess.org/training/Q4c15","focus":["pin","capturingDefender"],"puzzles":[
      {"id":"Q4c15","rating":1001,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove","pin"],"f":"r5k1/P1p3pp/1p1p1r2/3Pp1n1/1QP1Pp2/5PqP/6P1/R4NKR b - - 6 31","m":["b1g3"],"alts":[]},
      {"id":"iSuix","rating":1014,"themes":["crushing","middlegame","pin","short"],"f":"3rk2r/1pp5/4qp2/1PQ1n2p/1P6/5P1P/4PPB1/R3K2R b KQk - 5 21","m":["d1h3","d5g5","h3a1"],"alts":[]},
      {"id":"WJwq5","rating":1028,"themes":["crushing","endgame","master","pin","short"],"f":"5rk1/p1p3qb/1p1p4/3P3P/2PR4/1PQ1PP2/P7/2K5 w - - 2 30","m":["h7b7","b2b7","g3b7"],"alts":[]},
      {"id":"E4HcY","rating":1041,"themes":["advantage","middlegame","pin","short"],"f":"1rb1kb1r/p4ppp/3qp3/8/3P4/3Q1BP1/P4P1P/R1B2K1R b k - 0 17","m":["a4f6","h3f6","h6f6"],"alts":[]},
      {"id":"NcDK3","rating":1055,"themes":["advantage","capturingDefender","master","middlegame","short"],"f":"r1n3k1/1b1qbppp/8/1Q1PpP2/1Bp1P2P/2N3P1/1P2B1K1/3R4 b - - 2 36","m":["h2c1","a3c1","d2c7"],"alts":[]},
      {"id":"rQkuE","rating":1068,"themes":["advantage","middlegame","pin","short"],"f":"6rk/5p1p/pq1pn3/1p1QN3/7P/2P3P1/PP3PK1/3R1R2 b - - 0 29","m":["d6g7","b8e8","g7h1"],"alts":[]},
      {"id":"vX5Sa","rating":1082,"themes":["advancedPawn","advantage","endgame","long","pin"],"f":"3rr2k/6pp/8/4P3/1R6/3p4/4QPPP/3R2K1 b - - 0 31","m":["h3d8","h5d5","h4h5","g8g7","h5d5"],"alts":[]},
      {"id":"33VbG","rating":1095,"themes":["advantage","capturingDefender","middlegame","short"],"f":"r2qknn1/pp2p1b1/2p1r1p1/3p2Pp/3P1N2/2NQ4/PPP2PP1/R4RK1 w q - 6 14","m":["g7d6","g4d6","h3b6"],"alts":[]},
      {"id":"6fIiB","rating":1109,"themes":["advantage","endgame","pin","short"],"f":"8/p4k1n/2p5/5rPK/2P1RP2/3P4/1P5P/8 b - - 2 38","m":["e2g6","e1e7","g6d7"],"alts":[]},
      {"id":"VbXTx","rating":1122,"themes":["advancedPawn","deflection","discoveredAttack","endgame","mate","mateIn2","pin","promotion","short"],"f":"6k1/1p3p1p/8/5Q2/3b1pp1/4p3/P1R3PP/5RK1 b - - 0 35","m":["d3d8","g5g8","d8d5b"],"alts":[]},
      {"id":"UkFkv","rating":1136,"themes":["advantage","capturingDefender","kingsideAttack","middlegame","short"],"f":"rn3rk1/p7/2pb2pR/1p1p1b2/3P2p1/2NB4/PPP2PP1/1K1R2N1 w - - 2 17","m":["h3g1","g4g1","e6b6"],"alts":[]},
      {"id":"hD4rA","rating":1149,"themes":["crushing","defensiveMove","endgame","long","pin"],"f":"1k2rR2/p1p1P3/1p6/2p5/4QK2/2PP4/8/5q2 w - - 5 43","m":["d7g3","g5g3","g7g3","c4a4","g4d4"],"alts":[]},
      {"id":"jVy6a","rating":1163,"themes":["backRankMate","endgame","long","mate","mateIn3","pin"],"f":"6k1/5ppp/2N5/2q5/p7/PrP2P1P/1P1r2P1/R3R2K w - - 0 28","m":["d5d4","a1g4","a6d2","b4e4","d4g4"],"alts":[]},
      {"id":"PztwC","rating":1176,"themes":["advantage","capturingDefender","deflection","middlegame","short"],"f":"2r1nrk1/R4ppp/3b4/8/4q3/1QN1B1P1/P4P1P/1R4K1 b - - 1 27","m":["a4a3","c3a3","d7c5"],"alts":[]}
    ]},
  "4-0":{"version":2,"src":"https://lichess.org/training/NzN1r","focus":["interference"],"puzzles":[
      {"id":"NzN1r","rating":1200,"themes":["advantage","endgame","interference","short"],"f":"1r5r/5pk1/6pp/p1p2P2/1p2q1P1/1p2P1Q1/P7/2K2R1R w - - 0 34","m":["g1g6","b2b4","b3c4"],"alts":[]},
      {"id":"6g8Mi","rating":1224,"themes":["advantage","fork","interference","middlegame","short"],"f":"r6r/1p2kp2/pb1np3/2NpB1P1/6Pp/5B1P/PP6/2R3K1 w - - 7 24","m":["d1g6","d2d4","g6e4"],"alts":[]},
      {"id":"td4gF","rating":1247,"themes":["advantage","deflection","endgame","interference","master","short"],"f":"7r/p3Q3/1p3np1/2p3k1/3q4/5PK1/PP4P1/4R3 w - - 4 34","m":["d5d1","b1e6","d2g6"],"alts":[]},
      {"id":"VQQx6","rating":1271,"themes":["crushing","endgame","fork","interference","short"],"f":"2r3k1/1p1q1p1p/p4bpB/Q7/8/1P5P/P4PP1/4R1K1 b - - 7 29","m":["g6a3","f1c6","a3d5"],"alts":[]},
      {"id":"6KA4p","rating":1294,"themes":["crushing","interference","kingsideAttack","long","middlegame"],"f":"4r1k1/1p3pp1/p1pp1q1p/8/2P4b/3Qr2P/PPB2PP1/4R1K1 w - - 0 28","m":["h3e2","b4g4","e2e4","g4d2","d5d3"],"alts":[]},
      {"id":"0SWiD","rating":1318,"themes":["crushing","interference","kingsideAttack","long","middlegame"],"f":"4r1k1/bb3pp1/p2q3p/3P3n/1PP5/P2Q1N1P/2B2PP1/4rRK1 w - - 0 25","m":["h3e2","b4g4","e2e4","g4d2","g5d5"],"alts":[]},
      {"id":"H1qxY","rating":1340,"themes":["crushing","interference","intermezzo","middlegame","queensideAttack","short"],"f":"2kr1b1r/p1p1nppp/8/q7/3pQ3/2N2P2/PPP2P1P/2KR3R w - - 0 14","m":["d7f4","a4h2","h5h7"],"alts":[]},
      {"id":"MfKPW","rating":1365,"themes":["crushing","deflection","endgame","interference","veryLong"],"f":"4r1k1/p5p1/1p3p2/8/4q3/PP6/K1P4R/7Q w - - 1 34","m":["e8e4","b4g2","e5e1","b2b6","e1e2","g2d6","e4d4"],"alts":[]},
      {"id":"rSPj8","rating":1389,"themes":["advantage","interference","long","middlegame","queensideAttack"],"f":"r5n1/p1nPp2p/3p2k1/q2P1r2/1p2N3/4QP2/1PP3P1/2KR2NR b - - 0 22","m":["f1f5","a5h8","g1h1","h8d8","f5h5"],"alts":[]},
      {"id":"0pN9l","rating":1412,"themes":["crushing","exposedKing","interference","long","middlegame"],"f":"r4b1r/3k2p1/p4pQp/3pB3/7q/5P2/PPPKN3/R7 w - - 0 24","m":["b6g2","g4d2","g2h1","h2d4","h1f4"],"alts":[]},
      {"id":"Fwsso","rating":1436,"themes":["crushing","interference","long","middlegame"],"f":"2kr3r/1pqb1pp1/p4n2/2bppNB1/7P/P1NQP3/1PP2P2/2KR3R b - - 1 18","m":["d1d7","h3d8","h2g1","b1g6","b2g6"],"alts":[]},
      {"id":"PnXlQ","rating":1459,"themes":["crushing","endgame","interference","master","short"],"f":"6k1/1b1p2pp/3Pp3/2p3r1/2P2B2/1PQ4P/4RK2/7r b - - 0 35","m":["b1b8","g8d3","e5e3"],"alts":[]},
      {"id":"TjApO","rating":1483,"themes":["advantage","interference","middlegame","short"],"f":"3r3k/pp2q1bp/4Nnp1/2p1n3/4p3/PQP4P/1P3PP1/R1B2RK1 b - - 3 19","m":["a1a7","c3c7","d2d6"],"alts":[]},
      {"id":"fveXp","rating":1507,"themes":["crushing","endgame","interference","master","short"],"f":"2k5/6bp/p7/5q2/1P6/PB6/2P2PKP/3R3R b - - 6 34","m":["g1b7","b8g5","b7h5"],"alts":[]},
      {"id":"3AHYK","rating":1530,"themes":["advantage","endgame","interference","short"],"f":"3rq1k1/p5p1/3P1p1p/2p2N2/3pb1P1/1P1Q3P/P7/5RK1 w - - 3 30","m":["g1d2","b4e4","h3d7"],"alts":[]}
    ]},
  "4-1":{"version":2,"src":"https://lichess.org/training/PRtQY","focus":["attraction"],"puzzles":[
      {"id":"PRtQY","rating":1202,"themes":["attraction","endgame","mate","mateIn2","sacrifice","short"],"f":"6rk/2p3pp/1r2Q3/p7/3q4/1P5P/P4RP1/5R1K w - - 1 30","m":["d6b4","e4b4","g8g4"],"alts":[]},
      {"id":"1nhd9","rating":1236,"themes":["advantage","attraction","exposedKing","fork","long","middlegame"],"f":"1r1k3r/2p2q1p/1bR5/p2pPbPQ/P2P1P1R/1NP1B3/1P6/3K4 b - - 2 35","m":["g2e1","e7e1","g1b7","h5d5","b7e1"],"alts":[]},
      {"id":"Rv7xY","rating":1269,"themes":["anastasiaMate","attraction","kingsideAttack","mate","mateIn4","middlegame","sacrifice","veryLong"],"f":"r4rk1/5ppp/3pb3/p2Np3/1pPnP3/1P2N3/P4KP1/3R3R w - - 4 23","m":["h1d2","b4e4","e5e2","e4e2","h5e5","d6e3","e5e3"],"alts":[]},
      {"id":"C1qtl","rating":1303,"themes":["attraction","crushing","endgame","fork","long"],"f":"4r3/8/5p1p/p2Pk1pN/4r3/4R1P1/P2K3P/8 w - - 0 36","m":["d3d7","d1d7","e1g6","d7h7","g6d4"],"alts":[]},
      {"id":"RgG5C","rating":1337,"themes":["advancedPawn","attraction","crushing","endgame","short"],"f":"1k6/2r5/1P2p3/p3P1p1/P7/5KB1/2p4P/2Rr4 w - - 1 58","m":["c6a2","c4a2","a5a8"],"alts":[]},
      {"id":"h3vXZ","rating":1370,"themes":["attraction","endgame","long","master","mate","mateIn3","sacrifice"],"f":"1r6/4ppk1/p5pp/qr6/2pP2PP/2P2P2/PPQ5/KR5R b - - 0 28","m":["f1f8","f5f8","c1f1","a8f7","f1f7"],"alts":[]},
      {"id":"eTzbM","rating":1404,"themes":["advantage","attraction","fork","long","middlegame","sacrifice"],"f":"r1r3k1/1b3ppp/1P2p3/pBB1b3/8/P4P2/5KPP/2R4R b - - 4 22","m":["a4a1","a5a1","d1h7","g8d8","h7a1"],"alts":[]},
      {"id":"8p1Dq","rating":1437,"themes":["attraction","kingsideAttack","long","mate","mateIn3","middlegame","sacrifice"],"f":"2kr3r/ppp3p1/8/1Nb2p2/8/3n1BP1/PPQ3PN/R4R1K b - - 1 20","m":["e4e8","e5e8","h4e4","g3e1","e4e1"],"alts":[]},
      {"id":"RK65M","rating":1471,"themes":["attraction","long","mate","mateIn3","middlegame","pillsburysMate"],"f":"3r3k/p4Q1p/6p1/4Np2/5P1b/4B3/PP2r1PP/3R3K b - - 0 29","m":["h4h5","d3b5","h5b5","e5b5","d8d5"],"alts":[]},
      {"id":"wZyoV","rating":1504,"themes":["attraction","mate","mateIn2","middlegame","sacrifice","short"],"f":"5rk1/5ppp/p2QbP2/8/8/2q5/PrP2PPP/R2R2K1 w - - 1 23","m":["h6g4","b4g4","h5h4"],"alts":[]},
      {"id":"BWzVc","rating":1538,"themes":["advantage","attraction","fork","long","middlegame","sacrifice"],"f":"r3r1k1/pppR2p1/2n3Qp/8/6P1/P1q2N1P/2P2PK1/7R b - - 1 25","m":["a3g3","b8g3","a6d1","g3b3","d1b6"],"alts":[]}
    ]},
  "4-2":{"version":2,"src":"https://lichess.org/training/DgjZs","focus":["interference"],"puzzles":[
      {"id":"DgjZs","rating":1200,"themes":["crushing","fork","interference","long","middlegame"],"f":"r1k4r/2p1qppp/p2p4/1Q1P4/5B2/2b4P/P5P1/1R5K w - - 0 22","m":["c1c2","a4h2","c2a6","h2h4","a6f4"],"alts":[]},
      {"id":"U4ZsL","rating":1225,"themes":["crushing","endgame","interference","long","skewer"],"f":"r6r/p1p1kp2/1pRpp2Q/5q2/8/8/P4PP1/4R1K1 w - - 2 25","m":["a6a2","d2h4","e6e4","h4a2","e4f4"],"alts":[]},
      {"id":"7X5iO","rating":1247,"themes":["crushing","deflection","endgame","interference","short"],"f":"6k1/1p5p/p1p4r/5qp1/3P4/1P2K1P1/PQ3R2/4R3 b - - 1 31","m":["e6d6","d3h8","g1g8"],"alts":[]},
      {"id":"9fHce","rating":1271,"themes":["crushing","interference","long","middlegame"],"f":"4r1k1/2p2ppp/8/ppNq4/3P1b2/1P1Q1P2/P1K5/4r2R w - - 0 33","m":["h3e2","b4g4","e2e4","g4d2","e5d5"],"alts":[]},
      {"id":"kxkkX","rating":1295,"themes":["crushing","endgame","interference","queenEndgame","short"],"f":"8/1p1kp3/p2p2q1/4P3/8/2P5/PP2Q3/3K4 b - - 2 37","m":["b6c5","h5h8","c5c8"],"alts":[]},
      {"id":"v0pUm","rating":1318,"themes":["crushing","exposedKing","fork","interference","middlegame","veryLong"],"f":"2r1r1k1/1p3pp1/p2p3p/P2P4/1P2P2q/8/5QBP/3RK2R b K - 6 31","m":["d4d7","b8d7","e7d7","g8d8","d7e5","d5h8","e5h1"],"alts":[]},
      {"id":"J80Ha","rating":1340,"themes":["crushing","discoveredAttack","discoveredCheck","endgame","interference","short"],"f":"6k1/pp5p/1bb3p1/3q1p2/1PQp4/P4P2/2P1B1PP/3R2K1 b - - 0 33","m":["h7h3","b5e5","h1a7"],"alts":[]},
      {"id":"FYV9J","rating":1365,"themes":["advantage","interference","long","middlegame"],"f":"r4rk1/1bq1bpp1/p2pp2p/1p2n3/3RP3/1BN3B1/PP2QPPP/3R2K1 w - - 2 18","m":["b3d1","h6d1","h7h2","a2c6","h2d2"],"alts":[]},
      {"id":"pim58","rating":1388,"themes":["crushing","endgame","interference","master","rookEndgame","short"],"f":"8/r5p1/1k5p/1pppPp2/1P3P2/P4P1P/5KR1/8 w - - 0 37","m":["b8b6","c6a2","b6b2"],"alts":[]},
      {"id":"Lt6gX","rating":1413,"themes":["crushing","endgame","interference","kingsideAttack","long"],"f":"4r1k1/ppq1Rppp/2p5/3p4/3P2n1/2P2Q1P/P1P2PP1/4R1K1 b - - 0 19","m":["a2e8","b5g5","e8e5","g5d8","d4d2"],"alts":[]},
      {"id":"mnygR","rating":1435,"themes":["crushing","endgame","interference","short"],"f":"1k6/1p6/3R4/p1K1P1pp/5q2/8/2BR3P/8 b - - 0 42","m":["g7c7","a1h1","c7h8"],"alts":[]},
      {"id":"G0Otc","rating":1458,"themes":["crushing","exposedKing","interference","long","middlegame","queensideAttack","skewer"],"f":"2kr3r/p3qppp/1p5n/2n1P3/5P2/5Q1P/PPR3P1/2KR4 w - - 0 22","m":["g3f4","a4a2","f4f2","a2a6","f2d2"],"alts":[]},
      {"id":"59NhM","rating":1483,"themes":["advantage","deflection","interference","middlegame","veryLong"],"f":"8/5q1k/3bBr1p/5p2/3p4/8/PPQ2PP1/2R1R2K b - - 0 31","m":["g2e1","e5b5","e1e8","b5g5","e8e5","g5d8","g6d6","d8h3","d6d5","a5d5","e5d5"],"alts":[]},
      {"id":"TSvxM","rating":1505,"themes":["interference","long","mate","mateIn3","middlegame"],"f":"2r3r1/1p2kp2/p1n1b3/3pPq2/1P1P1N2/P5R1/5PPP/2Q3K1 w - - 3 26","m":["a5a1","d2d4","b3b4","d4h2","a1h6"],"alts":[]},
      {"id":"i9NAm","rating":1530,"themes":["advantage","interference","opening","short"],"f":"r2q1rk1/1b1pbppp/p3p1n1/np6/3NP3/1B3NB1/PP3PPP/2RQ1RK1 w - - 6 14","m":["b3a2","h4d4","a2f1"],"alts":[]}
    ]},
  "4-3":{"version":2,"src":"https://lichess.org/training/eZ8yi","focus":["pin","skewer"],"puzzles":[
      {"id":"eZ8yi","rating":1200,"themes":["advantage","endgame","exposedKing","long","skewer"],"f":"3R4/p4p1k/1p3B2/4P2p/5r2/8/6r1/1R1K4 w - - 5 48","m":["h4e4","e2b6","e4b4","b6g1","b4b8"],"alts":[]},
      {"id":"ZXCw7","rating":1212,"themes":["advantage","endgame","short","skewer"],"f":"8/kp3Q2/p2p1p2/3PbP1P/2r1P3/R4K2/7r/4R3 b - - 0 47","m":["e8e3","g3b7","e3f3"],"alts":[]},
      {"id":"CGYNr","rating":1224,"themes":["deflection","kingsideAttack","mate","mateIn2","middlegame","pin","short"],"f":"7k/ppp2Bp1/7p/P7/1PQ2pq1/2PP3b/5RPP/4rNK1 b - - 4 23","m":["d5g5","g8g5","b7b8"],"alts":[]},
      {"id":"zBYjd","rating":1236,"themes":["crushing","endgame","long","queenEndgame","skewer"],"f":"Q7/8/8/6q1/2PK4/8/5k2/8 b - - 4 73","m":["b1d3","h7h1","d3g3","h1d6","g3f4"],"alts":[]},
      {"id":"DnRoC","rating":1247,"themes":["advantage","opening","pin","short"],"f":"2kr1b1r/pppq2pp/2n1pn2/3p1B1b/3P4/2N2N1P/PPP2PP1/R1BQR1K1 w - - 3 11","m":["g1d6","h2d6","d5d6"],"alts":[]},
      {"id":"l5tLE","rating":1260,"themes":["crushing","endgame","long","skewer"],"f":"2r5/8/6kp/8/1pNb1KP1/1P6/8/4R3 b - - 0 54","m":["a4g4","g7d7","g4d4","d7h7","d4d5"],"alts":[]},
      {"id":"tYK0O","rating":1272,"themes":["crushing","endgame","long","skewer"],"f":"8/1b1R4/p2n1p2/4kPp1/2R3P1/1P2r3/P6K/8 w - - 2 37","m":["h2d2","d1h1","d2d3","h6a7","c3a7"],"alts":[]},
      {"id":"Bhzpv","rating":1283,"themes":["advantage","exposedKing","long","middlegame","queensideAttack","skewer"],"f":"k6r/3bb1pp/1Pp1p1n1/8/3P1p2/2N2B1P/1PP2PP1/5RK1 w - - 0 24","m":["g5f5","f4c2","f5f2","c2c6","f2h2"],"alts":[]},
      {"id":"EtIHJ","rating":1295,"themes":["crushing","fork","middlegame","pin","short"],"f":"3r3k/p4p2/2pr1q1p/4pp2/4P2P/P5QK/PBPn1PR1/8 w - - 0 40","m":["c8d1","g6d1","b3d1"],"alts":[]},
      {"id":"s3uyD","rating":1307,"themes":["attraction","mate","mateIn2","opening","pin","sacrifice","short"],"f":"rnb1r3/pppq1Qbk/7p/3p4/3Pp3/2P3P1/PP2BPP1/RN2K2R w KQ - 1 16","m":["e5e6","e2e6","g2e1"],"alts":[]},
      {"id":"rk7cR","rating":1319,"themes":["crushing","endgame","short","skewer"],"f":"8/p3Q3/1p4p1/2p4p/2q2k2/5P1P/P5P1/5n1K w - - 21 45","m":["d2e7","g7d3","e7a7"],"alts":[]},
      {"id":"GVa8M","rating":1331,"themes":["crushing","endgame","master","pin","short"],"f":"8/3bk3/3p1q2/2pP4/1pP2p2/pP3P2/P6Q/4BK2 w - - 4 45","m":["d5e7","d2g2","e7g6"],"alts":[]},
      {"id":"YCPjW","rating":1343,"themes":["advantage","defensiveMove","long","middlegame","pin"],"f":"B4qk1/p1pn2pp/1p1p1r2/8/3P4/B1P5/P1P3QP/4R1K1 b - - 0 20","m":["g6b6","f4h1","b4e4","b8b6","e2b6"],"alts":[]},
      {"id":"0bvGO","rating":1355,"themes":["advantage","middlegame","pin","short"],"f":"5rk1/pp4p1/4br2/3p3p/3Qp3/4P2q/PPP5/2KN1RR1 w - - 0 24","m":["g5g6","g4g6","h7g6"],"alts":[]},
      {"id":"eSV1v","rating":1367,"themes":["advantage","deflection","endgame","pin","short"],"f":"2r5/5k2/p1b1p3/1pP2pBp/3P3P/P1n3K1/B7/5R2 w - - 2 37","m":["g5g1","g2d4","f8d6"],"alts":[]}
    ]},
  "4-4":{"version":2,"src":"https://lichess.org/training/QCUpg","focus":["advancedPawn","promotion","pawnEndgame"],"puzzles":[
      {"id":"QCUpg","rating":1200,"themes":["advancedPawn","crushing","endgame","long","pawnEndgame","promotion"],"f":"8/8/8/PK2p3/5p2/5Pk1/8/8 w - - 1 57","m":["f1f6","d1d7","f6f2","d7d3","f2f4b"],"alts":[]},
      {"id":"ixofY","rating":1210,"themes":["advancedPawn","crushing","deflection","endgame","long","promotion","rookEndgame"],"f":"3k4/8/3P4/2PK1p2/5Pp1/3R2Pp/2r5/8 b - - 2 48","m":["e3e8","h3h5","a8h8","h5h8","e8e5b"],"alts":[]},
      {"id":"VA27z","rating":1220,"themes":["crushing","defensiveMove","endgame","exposedKing","long","pawnEndgame"],"f":"8/8/8/1pppk2p/6p1/P1P1K1P1/5P1P/8 b - - 0 38","m":["h1h7","a3h7","a1h7","d3h3","d1h1"],"alts":[]},
      {"id":"eg06E","rating":1231,"themes":["advancedPawn","advantage","endgame","master","sacrifice","short"],"f":"3R4/1B3pk1/2P1p1p1/p6p/P1rn4/7P/5PP1/6K1 w - - 7 49","m":["h4h7","a7h7","a6a2"],"alts":[]},
      {"id":"pyVAK","rating":1241,"themes":["advancedPawn","endgame","mate","mateIn2","promotion","short"],"f":"4r2k/4P1np/1p3Q2/p7/q4P2/8/6PP/3R3K w - - 0 34","m":["g6g4","d4g4","d2g4b"],"alts":[]},
      {"id":"OVZq9","rating":1251,"themes":["advancedPawn","attraction","crushing","deflection","endgame","long","promotion"],"f":"1kbR4/8/PB5p/1r6/8/8/8/2K5 w - - 1 40","m":["f6f2","c4c2","h4a4","c2a4","f2f4b"],"alts":[]},
      {"id":"KRCr0","rating":1261,"themes":["advancedPawn","crushing","endgame","rookEndgame","short"],"f":"6k1/1R5p/6p1/Pp6/8/1r5P/5PK1/8 w - - 2 45","m":["f1f6","c3f3","f6f2"],"alts":[]},
      {"id":"jwT1B","rating":1271,"themes":["advancedPawn","crushing","endgame","long"],"f":"8/1Bk5/2P2p1n/p3pP1P/1p1pP2K/1P6/P7/8 b - - 2 50","m":["h7h3","c2f6","h3h8","f6d8","a2a6"],"alts":[]},
      {"id":"YHUfC","rating":1282,"themes":["advancedPawn","crushing","endgame","long","promotion","rookEndgame"],"f":"8/8/P7/1K6/5k2/2R1r1p1/8/8 w - - 1 65","m":["a3d3","g7d3","f6f2","d3g8","f2f4b"],"alts":[]},
      {"id":"ssflO","rating":1292,"themes":["advancedPawn","advantage","discoveredCheck","doubleCheck","fork","middlegame","short"],"f":"8/ppk1r1p1/8/2NPn3/5RP1/P7/3R1K2/1r1b4 w - - 1 33","m":["h1h6","a2h4","h6d2"],"alts":[]},
      {"id":"aoL8y","rating":1302,"themes":["advancedPawn","clearance","exposedKing","long","mate","mateIn3","middlegame","promotion","sacrifice"],"f":"3r1r1k/pp3p1P/4pN2/3n1nN1/3p4/2pK4/P7/4R1R1 w - - 4 35","m":["b1g2","g4g2","b5b4","h4b4","e2b4b"],"alts":[]},
      {"id":"Xb8Z1","rating":1312,"themes":["crushing","endgame","pawnEndgame","short","zugzwang"],"f":"8/8/5kp1/7p/5P1P/5K2/8/8 b - - 4 63","m":["g6g1","g3b3","g1d7"],"alts":[]},
      {"id":"3en35","rating":1323,"themes":["advancedPawn","crushing","endgame","promotion","quietMove","short"],"f":"8/8/8/5BP1/5K2/n1k5/1p6/8 b - - 2 60","m":["f3a8","b1b6","c8c5b"],"alts":[]},
      {"id":"QJ2fs","rating":1333,"themes":["advancedPawn","advantage","endgame","long"],"f":"7k/pp4p1/2Pp2pp/4p3/2B3P1/3P1r1P/PPP5/R4q1K w - - 0 25","m":["f5g5","g3g5","e5b8","g5g4","a6c2"],"alts":[]},
      {"id":"xwd5l","rating":1343,"themes":["advancedPawn","crushing","endgame","long","promotion","sacrifice"],"f":"4k3/8/4K3/4P1B1/4N3/3p4/6r1/8 b - - 5 66","m":["b8b1","d7b1","h3h8","b1d7","h8h5b"],"alts":[]}
    ]},
  "4-5":{"version":2,"src":"https://lichess.org/training/4i9IB","focus":["defensiveMove","advancedPawn","pawnEndgame"],"puzzles":[
      {"id":"4i9IB","rating":1200,"themes":["crushing","endgame","pawnEndgame","short"],"f":"8/8/8/p7/1k1p4/1P1K4/2P5/8 w - - 4 67","m":["h3h7","f1f7","c3f7"],"alts":[]},
      {"id":"gOea8","rating":1209,"themes":["advancedPawn","advantage","endgame","long"],"f":"8/3r2k1/p1r1P1p1/1b3pPp/1p3P2/4R1P1/PK6/8 w - - 0 40","m":["d6h2","a6h6","d3d2","b2b4","d2d4"],"alts":[]},
      {"id":"I0VaN","rating":1217,"themes":["advancedPawn","advantage","deflection","endgame","knightEndgame","promotion","short"],"f":"6k1/5p2/1P1np3/P2n4/6P1/3N1N2/2p2PK1/8 b - - 1 37","m":["h1g7","h3g7","a8a5b"],"alts":[]},
      {"id":"AEBHj","rating":1226,"themes":["advantage","defensiveMove","long","middlegame"],"f":"4rrk1/pp1b2q1/7p/5ppQ/2p5/6P1/P1B1R1PP/4R2K w - - 4 27","m":["d8d4","h2d4","d5d4","b2f5","a8h5"],"alts":[]},
      {"id":"8oqKW","rating":1234,"themes":["advancedPawn","crushing","endgame","long","pawnEndgame","quietMove"],"f":"8/8/p4pp1/1p6/1PP3P1/1k1K4/8/8 w - - 1 41","m":["a7a1","c3c7","a1a6","c7a1","a6a2"],"alts":[]},
      {"id":"V5vPO","rating":1243,"themes":["advancedPawn","crushing","endgame","long","promotion","rookEndgame"],"f":"1R6/8/7P/5K2/k4P2/6r1/1p6/8 b - - 1 50","m":["b3c3","c4c3","f7c3","g1b6","c8c5b"],"alts":[]},
      {"id":"hj7ht","rating":1251,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/2k5/p1p5/P7/1PK5/8/8 w - - 7 46","m":["a3a7","a6c6","a7h1","c6a2","h1a1"],"alts":[]},
      {"id":"Ph8Sk","rating":1260,"themes":["advancedPawn","crushing","discoveredAttack","endgame","master","short"],"f":"b4rk1/5p2/5QPq/2pPP2p/8/7P/6BK/8 w - - 1 33","m":["b6g2","g4g2","g6e6"],"alts":[]},
      {"id":"vW6Y7","rating":1269,"themes":["advancedPawn","kingsideAttack","mate","mateIn2","opening","short"],"f":"r1q1k2r/ppp2p2/3p1b2/4n1p1/2P5/4P1Np/PP3P2/R1BQ1RKB b kq - 3 18","m":["e3e8","b5b8","a4e3"],"alts":[]},
      {"id":"si9J9","rating":1277,"themes":["advancedPawn","kingsideAttack","mate","mateIn2","opening","short"],"f":"rnb2bkr/ppp1p1pp/1n1pP1q1/6N1/8/5Q2/PPPP1PPP/RNB1K2R w KQ - 5 9","m":["g3g2","b6g2","d6g2"],"alts":[]},
      {"id":"RBUz0","rating":1286,"themes":["crushing","endgame","pawnEndgame","short"],"f":"8/8/1p1k4/p1p2p2/P1PPp3/4KP2/3P4/8 b - - 1 37","m":["a1h7","d3h7","d7g3"],"alts":[]},
      {"id":"oALzK","rating":1294,"themes":["advancedPawn","kingsideAttack","long","mate","mateIn3","middlegame","promotion"],"f":"r4r1k/1pp4p/1b6/p7/P2q4/1Q1P2N1/1PP3Pp/R4R1K b - - 0 26","m":["g4g5","f5g5","h7b5","g5b5","e8b5b"],"alts":[]},
      {"id":"Fr2iG","rating":1303,"themes":["advancedPawn","advantage","endgame","queenRookEndgame","short"],"f":"8/2p2ppk/P6p/QP2P3/4KPP1/3p3P/2r5/8 b - - 0 45","m":["h3h8","f1h8","a8h8"],"alts":[]},
      {"id":"xdyUd","rating":1311,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/4k1p1/p1p1P2p/1p1p1P1P/1P1P1K2/1P6/8 w - - 3 43","m":["g3d7","f1f7","c3f7","a1a7","h3a7"],"alts":[]},
      {"id":"kOndM","rating":1320,"themes":["advancedPawn","crushing","endgame","exposedKing","long","master","promotion"],"f":"8/7k/4b2p/8/4R3/P1P1ppP1/1P6/6K1 b - - 1 54","m":["g3g8","b5g5","d6e3","g5d8","g8g5b"],"alts":[]}
    ]},
  "4-6":{"version":2,"src":"https://lichess.org/training/fQJbR","focus":["capturingDefender","deflection","fork"],"puzzles":[
      {"id":"fQJbR","rating":1200,"themes":["deflection","endgame","mate","mateIn2","rookEndgame","short"],"f":"8/1R3Rpk/4p2p/1P6/5PK1/1r4P1/7r/8 b - - 3 37","m":["e6e1","b7b1","c3b3"],"alts":[]},
      {"id":"fIPwP","rating":1210,"themes":["attraction","crushing","deflection","endgame","long"],"f":"3q3r/2k3p1/2p4p/2p1P2Q/2Pp4/4b2P/5NP1/1R4K1 w - - 1 31","m":["e1g2","h4h2","c5c2","a2c2","g2h2"],"alts":[]},
      {"id":"8r2Fi","rating":1220,"themes":["crushing","endgame","fork","short"],"f":"r5k1/5pp1/7p/2Q5/qP2P3/8/P3R2P/1K6 b - - 9 37","m":["f7h5","a1a5","h5d8"],"alts":[]},
      {"id":"FCqa7","rating":1231,"themes":["attraction","crushing","deflection","endgame","long"],"f":"5k2/p2qp3/1p3r2/8/4Q1R1/2p5/PP4P1/2K5 w - - 1 40","m":["d7f4","h2d4","b7b4","g4b4","f4d4"],"alts":[]},
      {"id":"FpL07","rating":1241,"themes":["advancedPawn","attraction","crushing","deflection","endgame","exposedKing","long","promotion"],"f":"8/5p2/6p1/1R6/1P2bkP1/3p3P/5K2/8 b - - 0 42","m":["h3h8","g8d8","d7h3","d8h3","h8h5b"],"alts":[]},
      {"id":"5pR4K","rating":1251,"themes":["advantage","deflection","endgame","veryLong"],"f":"6k1/1pp3p1/p1n1R2p/1r4q1/1P1P2P1/2PK4/P3Q2P/8 w - - 3 34","m":["d6d4","b4e2","d8d7","b1b6","d4e4","e2e4","d7b6"],"alts":[]},
      {"id":"sLRbT","rating":1261,"themes":["attackingF2F7","crushing","deflection","discoveredAttack","opening","short"],"f":"r1bqkb1r/pp3ppp/8/2pB4/1n6/5N2/PPP2PPP/R1BQK2R w KQkq - 1 10","m":["h1g2","d4g2","h5h4"],"alts":[]},
      {"id":"FfuiR","rating":1271,"themes":["advantage","deflection","endgame","veryLong"],"f":"7k/1R4p1/2p1r1qp/8/8/P1P2Q1P/1P4P1/7K b - - 1 34","m":["d6d5","e5e8","b6h6","g3b3","d5e5","e8e5","h6b3"],"alts":[]},
      {"id":"XIdpN","rating":1281,"themes":["crushing","deflection","endgame","short"],"f":"8/8/1n6/2p1Bkp1/4n3/3K1N1P/6P1/8 w - - 5 43","m":["b8b7","g1b6","h3d7"],"alts":[]},
      {"id":"L5VS8","rating":1292,"themes":["advantage","capturingDefender","middlegame","short"],"f":"r4rk1/ppp2pbp/4p1p1/1q2Pn2/3P4/1PP1BB1P/P3Q1P1/R4RK1 b - - 2 16","m":["c1d8","g3d8","g1d3"],"alts":[]},
      {"id":"PmZYM","rating":1302,"themes":["advantage","fork","middlegame","short"],"f":"3r4/pp3Bkp/1q6/8/2P3b1/1P4P1/P1Q2RKP/4r3 w - - 2 26","m":["a8a3","c6h7","a3d5"],"alts":[]},
      {"id":"DYcBo","rating":1312,"themes":["advantage","endgame","fork","short"],"f":"1B6/p5pp/1p2k3/4n3/2r3P1/7P/PP1R1P2/4K3 b - - 3 31","m":["d1g3","d5h5","g3h8"],"alts":[]}
    ]},
  "4-7":{"version":2,"src":"https://lichess.org/training/ag9rG","focus":["attraction","deflection"],"puzzles":[
      {"id":"ag9rG","rating":1200,"themes":["crushing","deflection","middlegame","pin","short"],"f":"r2q1bk1/p4ppp/8/3p1N2/4nPQ1/2r5/6PP/R4R1K w - - 2 29","m":["g1e6","b4e4","e6g2"],"alts":[]},
      {"id":"dH2Hn","rating":1212,"themes":["crushing","deflection","endgame","veryLong"],"f":"6k1/5pp1/2p4p/p7/8/1rq3P1/5Q1P/4R1K1 w - - 8 34","m":["d5d4","b4e2","g8g1","b2b6","g1g2","a3b2","g2c3"],"alts":[]},
      {"id":"0cw8z","rating":1224,"themes":["deflection","kingsideAttack","mate","mateIn2","middlegame","short"],"f":"4nr1k/1q3r2/p4pQp/1ppNp3/4P3/P2P2RP/1PP3P1/6K1 w - - 0 38","m":["b6e6","g2e2","e6g4"],"alts":[]},
      {"id":"KsRTh","rating":1236,"themes":["attraction","crushing","deflection","endgame","long"],"f":"6k1/p4p2/1p1qp3/5r2/1P1PQp2/P5P1/5KP1/7R w - - 0 31","m":["d7f4","h6g4","e5e4","b4e4","f4g4"],"alts":[]},
      {"id":"CZZch","rating":1249,"themes":["crushing","deflection","endgame","master","short"],"f":"2r5/4kp1p/4p1p1/p2bP1P1/1p3P2/1P1K2P1/PBR5/8 b - - 1 35","m":["h1d7","h3d7","a4a8"],"alts":[]},
      {"id":"LUGDq","rating":1261,"themes":["crushing","deflection","endgame","long","master"],"f":"6k1/4pp1p/1q6/2p3P1/2Qp3P/1P6/1RKN4/r7 b - - 2 34","m":["c6b6","a7h3","f5a5","a8a5","b6h3"],"alts":[]},
      {"id":"rl38m","rating":1273,"themes":["crushing","deflection","kingsideAttack","long","middlegame","pin"],"f":"3r1bk1/1q4p1/p3p2p/1prn4/8/1P2PP1Q/PB3P1P/1B1R2K1 w - - 0 26","m":["e3d6","c2g2","c5e2","b4e2","d6g2"],"alts":[]},
      {"id":"S6ivR","rating":1285,"themes":["attraction","endgame","exposedKing","mate","mateIn4","veryLong"],"f":"4kr2/pp1R2p1/4ppq1/6r1/2P4Q/3R4/5P1P/7K w - - 16 32","m":["h2h4","d4g2","h3h2","g2b4","h4g4","b4g4","e7e4"],"alts":[]},
      {"id":"bWMCr","rating":1297,"themes":["attraction","crushing","deflection","middlegame","short"],"f":"5rk1/p3bppp/6r1/1p2P3/2pP1B2/P1P5/1Pq1QKPP/1R1R4 b - - 8 24","m":["b6b8","g8b8","a8d8"],"alts":[]},
      {"id":"d1Ul5","rating":1309,"themes":["deflection","mate","mateIn2","middlegame","short"],"f":"7r/pQ2nk1p/3B1ppb/8/8/3P1P2/qPP3P1/3KRB2 b - - 0 23","m":["f8c5","h5d8","c5a8"],"alts":[]},
      {"id":"n1OXe","rating":1321,"themes":["crushing","deflection","middlegame","short"],"f":"r6r/ppqn1pk1/2p2n2/3p4/3P1b1Q/P1NB1P1P/1PP2P2/R3R2K w - - 5 18","m":["d5b5","b2g4","e7e4"],"alts":[]},
      {"id":"mWMZT","rating":1333,"themes":["advancedPawn","advantage","attraction","endgame","exposedKing","fork","long"],"f":"4k3/p6p/1pNP2p1/6P1/1P2P2n/P2b4/2p2K2/7B w - - 0 38","m":["h6h2","d4h2","a6d1","h2d2","d1h3"],"alts":[]},
      {"id":"DSukU","rating":1346,"themes":["attraction","crushing","endgame","exposedKing","fork","long"],"f":"6k1/1pb3r1/p1p2p2/P2p3p/3P1N1P/4PK2/1P3P2/6R1 w - - 2 38","m":["b5b2","b4b2","g7d6","b2g2","d6a2"],"alts":[]},
      {"id":"pzG0Q","rating":1358,"themes":["crushing","deflection","endgame","long","sacrifice"],"f":"8/6pk/6rp/1R6/2p1P2r/P4PqP/1P2Q1P1/3R3K b - - 0 45","m":["e7e3","b8e3","b3e3","d8e8","e3g3"],"alts":[]},
      {"id":"1zx3Y","rating":1369,"themes":["attraction","endgame","long","mate","mateIn3","sacrifice"],"f":"3Q4/5rkp/3p2p1/2p5/1p1qPp2/1P1P1P1R/r1P1K1P1/2R5 w - - 5 32","m":["e3e2","b2e2","a5e5","e2b2","h4e4"],"alts":[]}
    ]},
  "4-8":{"version":2,"src":"https://lichess.org/training/7wi40","focus":["hangingPiece","pawnEndgame"],"puzzles":[
      {"id":"7wi40","rating":1200,"themes":["crushing","endgame","hangingPiece","short"],"f":"8/1p6/1k6/6p1/1nK1P2P/p5P1/Rb6/8 w - - 1 40","m":["a7c7","b1e7","b3e7"],"alts":[]},
      {"id":"YpWgH","rating":1219,"themes":["crushing","endgame","master","pawnEndgame","short"],"f":"8/7p/1p6/1P4k1/p3K3/P6P/8/8 w - - 2 53","m":["d7h1","b1e7","h1a6"],"alts":[]},
      {"id":"wzp8p","rating":1237,"themes":["advantage","endgame","hangingPiece","veryLong"],"f":"6k1/p4p2/1p4p1/4P2p/3Q3P/P5P1/1Prp1PK1/5q2 w - - 0 44","m":["b8g5","a8a5","g5d8","h8h5b","h7h5","a5h5","d8h5"],"alts":[]},
      {"id":"dIWOG","rating":1256,"themes":["advantage","hangingPiece","intermezzo","middlegame","short"],"f":"2r3k1/3R1pp1/p3b2p/1pb5/8/P1N1BP1P/1P4P1/R5K1 b - - 0 25","m":["a1d3","b5g5","d6h2"],"alts":[]},
      {"id":"A8V2Y","rating":1274,"themes":["advancedPawn","crushing","endgame","pawnEndgame","promotion","quietMove","veryLong"],"f":"8/1p6/p7/P5K1/2k4p/7P/6P1/8 w - - 0 42","m":["b1e7","a7c7","b8b7","c7f1","b7b1","c2c1","b1b6","c1c7","b6b2","c7c3","b2b4b"],"alts":[]},
      {"id":"U9LQY","rating":1293,"themes":["crushing","hangingPiece","long","middlegame"],"f":"3r4/p2P2bk/1p2P1p1/n6p/3RBP1P/6Pb/P7/4R1K1 b - - 0 32","m":["b2h7","b5e8","e3d6","d7b6","e2b6"],"alts":[]},
      {"id":"LNysT","rating":1311,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/5pk1/7p/5P1P/5K2/8/8 w - - 2 51","m":["g3d7","b6g2","d7g1","g2d2","g1b6"],"alts":[]},
      {"id":"JMScx","rating":1330,"themes":["crushing","endgame","long","pawnEndgame"],"f":"8/8/1p2p3/p3P3/PPPK1k2/8/8/8 b - - 0 49","m":["f1c7","a7a1","c6a1","h7a7","g7d1"],"alts":[]},
      {"id":"UIMOI","rating":1348,"themes":["crushing","endgame","long","pawnEndgame","quietMove"],"f":"8/8/5p1p/3p1kp1/2pP4/2P2PPP/1K6/8 b - - 0 38","m":["e6e1","b3b7","e1b7","e3b7","g1g7"],"alts":[]},
      {"id":"icYBZ","rating":1367,"themes":["crushing","endgame","pawnEndgame","quietMove","short"],"f":"8/8/4p3/5pp1/PpP1k2p/7P/3K2P1/8 w - - 0 38","m":["f7f1","d7h7","f1f6"],"alts":[]}
    ]},
  "4-9":{"version":2,"src":"https://lichess.org/training/B2ODi","focus":["fork","pin","skewer","sacrifice","discoveredAttack","deflection","clearance"],"puzzles":[
      {"id":"B2ODi","rating":1200,"themes":["advantage","discoveredAttack","middlegame","short"],"f":"r3k2r/p3bpp1/qp2pn1p/2pn4/2NP1B2/P1PQP3/1P3PPP/R4RK1 w kq - 2 15","m":["a7h6","d2h6","h3f6"],"alts":[]},
      {"id":"HJPqD","rating":1205,"themes":["clearance","kingsideAttack","mate","mateIn2","middlegame","sacrifice","short"],"f":"3r2k1/1p2pp1p/p2p2p1/2r4n/2P1P3/1P2qP2/P2Q2PP/2RR1B1K b - - 4 22","m":["e1b3","e8b3","a1e1"],"alts":[]},
      {"id":"fPN4w","rating":1211,"themes":["attraction","crushing","deflection","endgame","long"],"f":"4r3/2pk3p/2pp1p2/5N2/1q6/2PQ3P/3K1PP1/3R4 b - - 0 29","m":["c7c8","h3a8","d4d8","h8d8","c8a8"],"alts":[]},
      {"id":"q9ewF","rating":1216,"themes":["attraction","mate","mateIn2","middlegame","sacrifice","short"],"f":"3r4/R3bkp1/5N2/1q6/7Q/1P2B3/1Pr2PPP/5RK1 b - - 0 26","m":["c1g5","b5g5","h4h5"],"alts":[]},
      {"id":"Z6pek","rating":1222,"themes":["anastasiaMate","attraction","endgame","long","mate","mateIn3","sacrifice"],"f":"3r3r/pk3p2/1p2p3/6Q1/8/P1P5/4nPPP/R4R1K b - - 0 22","m":["e4e8","e5e8","h4e4","b1e7","e4e7"],"alts":[]},
      {"id":"JJlST","rating":1227,"themes":["crushing","endgame","long","pin"],"f":"2r5/6k1/3bP3/1p1Qp3/4PpP1/5B2/1P3KP1/7r b - - 1 40","m":["a4a8","g3d8","h6a1","h1a1","a8a1"],"alts":[]},
      {"id":"4msEV","rating":1233,"themes":["advantage","endgame","long","pin"],"f":"4r1k1/ppp4p/6p1/3q4/3B4/3R2PK/2P2Q1P/8 b - - 1 29","m":["h1e1","e3b8","d4d8","h3g3","d8g8"],"alts":[]},
      {"id":"qahW4","rating":1238,"themes":["crushing","endgame","exposedKing","long","queenEndgame","skewer"],"f":"8/1PQ2pkp/4p3/8/4q3/3p2P1/3K1P1P/8 b - - 0 42","m":["d7d8","h8a3","d8a8","a3h7","a8a2"],"alts":[]},
      {"id":"lcWmj","rating":1244,"themes":["advancedPawn","crushing","deflection","endgame","promotion","rookEndgame","short"],"f":"8/2PR4/8/7p/5p2/2r4k/5K2/8 w - - 2 56","m":["h2h3","a3h3","a2a4b"],"alts":[]},
      {"id":"lcfyR","rating":1249,"themes":["crushing","endgame","pin","short"],"f":"4q2k/3r2p1/1pp4p/R3p3/4Q3/6P1/5PKP/8 w - - 0 40","m":["f1d1","d4b4","d1d4"],"alts":[]},
      {"id":"8Q3bm","rating":1255,"themes":["advancedPawn","attraction","crushing","endgame","fork","long","promotion"],"f":"8/p4k2/8/1p6/1B2R3/P2rP1P1/KR5p/7r b - - 0 46","m":["e5f5","f8f5","e8e5b","f5f8","e5d7"],"alts":[]},
      {"id":"Po9J0","rating":1260,"themes":["deflection","long","mate","mateIn3","middlegame"],"f":"rn3r2/1p4Rp/2p1p3/p2nk1B1/P3N3/1B1P4/KPP1Q2P/R5q1 b - - 4 25","m":["h1c7","f8f3","b5f5","c3f8","f5f8"],"alts":[]}
    ]},
  "4-10":{"version":2,"src":"https://lichess.org/training/kJ5D3","focus":["advantage","crushing","hangingPiece"],"puzzles":[
      {"id":"kJ5D3","rating":1200,"themes":["advantage","middlegame","short"],"f":"2B1rnk1/pp3ppp/2pb1p2/8/2PP1P2/1P6/PQ5N/q1B2RK1 b - - 1 20","m":["f5c8","a5c8","d4a4"],"alts":[]},
      {"id":"2RbCo","rating":1213,"themes":["crushing","hangingPiece","intermezzo","kingsideAttack","middlegame","short"],"f":"r1b2rk1/pp3ppp/2n1p3/3Q4/3b1P2/2P1B3/PP4PP/RN3RK1 b - - 0 13","m":["h7d3","b5e5","d6h1"],"alts":[]},
      {"id":"BDzKK","rating":1225,"themes":["advantage","middlegame","short"],"f":"r1b3k1/2pprpp1/ppq4p/3B4/Pb2P3/8/1PP1QPPP/R1B2RK1 b - - 1 16","m":["a6h1","d7h1","d2d8"],"alts":[]},
      {"id":"yY3B5","rating":1238,"themes":["crushing","opening","short"],"f":"3qkb1r/N1pn1ppp/8/4P2n/4Q1b1/8/PrPB2PP/R3KBNR b KQk - 1 12","m":["h4e7","b8b3","e1b3"],"alts":[]},
      {"id":"D0iRm","rating":1250,"themes":["advantage","discoveredAttack","endgame","short"],"f":"4rbk1/5pp1/pRp4p/2P5/3BrP2/P3P1PP/8/4R2K b - - 1 26","m":["d7h7","d3h7","d4d5"],"alts":[]},
      {"id":"VNhHj","rating":1263,"themes":["advantage","endgame","exposedKing","fork","long"],"f":"2r3k1/2p3b1/1p2p1Np/p2p2q1/P2P4/1P4P1/1B1Q1P1P/6K1 w - - 1 25","m":["h8b1","e6b1","b6d2","b4g4","d2a4"],"alts":[]},
      {"id":"BVpr1","rating":1275,"themes":["advantage","discoveredAttack","endgame","master","masterVsMaster","short"],"f":"5k2/2p4p/3pQP2/4n1p1/8/2P5/P3q1PP/5RK1 b - - 0 31","m":["d1g3","g5g3","d8d6"],"alts":[]},
      {"id":"8rIin","rating":1288,"themes":["crushing","endgame","short"],"f":"8/1R1r1pk1/8/3B2p1/4Pn1p/4KP1P/6P1/8 b - - 5 40","m":["g7h1","d7h1","h2c2"],"alts":[]},
      {"id":"H3Bua","rating":1300,"themes":["attraction","crushing","deflection","endgame","short"],"f":"5q2/p5k1/3n2p1/2p1p1B1/2PpP1pP/P2P2P1/6K1/5Q2 w - - 1 33","m":["b1e6","b2e6","g5g4"],"alts":[]},
      {"id":"2TcLi","rating":1313,"themes":["crushing","deflection","master","middlegame","short"],"f":"r3r3/p2k2pp/2pq1n2/1p3p2/1P1P4/1Q6/P3RPPP/4R1K1 w - - 0 23","m":["c3g2","h2a4","d8d4"],"alts":[]}
    ]},
  "4-11":{"version":2,"src":"https://lichess.org/training/NI2Rh","focus":["fork","skewer"],"puzzles":[
      {"id":"NI2Rh","rating":1200,"themes":["crushing","endgame","fork","veryLong"],"f":"7k/6p1/4N3/3pP3/1Pb2p2/5q2/6R1/1B4K1 w - - 0 40","m":["b8e8","e4b4","c5e2","b4g2","d6b1","g2g4","b1g3"],"alts":[]},
      {"id":"Ogg9Y","rating":1218,"themes":["advantage","endgame","fork","short"],"f":"7k/Qp3qp1/7p/2P1np2/1P2p3/P2rP3/5PPP/5RK1 w - - 1 28","m":["f2c4","e4e2","c4d1"],"alts":[]},
      {"id":"MpixW","rating":1236,"themes":["advantage","exposedKing","middlegame","skewer","veryLong"],"f":"1r3rk1/3n2bp/8/p2N1p1P/2pP2P1/2P1P3/q1BNQ2R/3K2R1 b - - 0 27","m":["f8f5","h8c5","c4c5","a8c5","f5c5","h5h8","c5b5"],"alts":[]},
      {"id":"kYo2Y","rating":1255,"themes":["advantage","attraction","endgame","fork","long","sacrifice"],"f":"r6k/B2R3p/6p1/5p2/PP3b2/8/6PP/6K1 b - - 0 34","m":["f4f2","h2f2","g7d3","b5g5","d3f2"],"alts":[]},
      {"id":"sRhkL","rating":1273,"themes":["endgame","fork","long","mate","mateIn3"],"f":"4rk2/2R3p1/8/3pP1p1/1p2Qp2/pP6/P4KP1/3q4 w - - 0 40","m":["d7g1","g4b4","g1g2","b4e4","g2b2"],"alts":[]},
      {"id":"etz4x","rating":1291,"themes":["advantage","fork","long","middlegame"],"f":"8/1pb2qpk/7p/8/pP2p1Q1/Pb1rP2P/1R3PP1/2R3K1 w - - 11 38","m":["b7d7","g2b6","d7b6","e2b6","a5a2"],"alts":[]},
      {"id":"9ffz5","rating":1309,"themes":["crushing","fork","long","middlegame"],"f":"4rnk1/5pp1/p1p4p/8/P1QP4/2P4P/2B2qPK/3R1r2 w - - 0 32","m":["h5g5","g8a8","a7g2","b4e2","g2d4"],"alts":[]},
      {"id":"v5tPm","rating":1328,"themes":["attraction","crushing","endgame","fork","long","sacrifice"],"f":"6k1/5pp1/2p1q2p/p3p3/P1P5/2nRP1P1/2Q2P1P/1rB3K1 b - - 6 23","m":["c5a5","a8a5","a3d8","b5b8","d8a5"],"alts":[]},
      {"id":"HvgeS","rating":1346,"themes":["advancedPawn","advantage","endgame","fork","short"],"f":"8/1p2rpkp/pR4p1/5P2/P1B2KP1/1P5r/8/8 w - - 0 40","m":["g1g6","b2g4","g6d2"],"alts":[]},
      {"id":"RWV5W","rating":1364,"themes":["crushing","endgame","rookEndgame","short","skewer"],"f":"8/5k2/7p/5PpP/R5K1/5P2/8/7r b - - 4 45","m":["e5e7","b7b3","e7f7"],"alts":[]}
    ]},
  "4-12":{"version":2,"src":"https://lichess.org/training/f51WA","focus":["kingsideAttack","exposedKing"],"puzzles":[
      {"id":"f51WA","rating":1200,"themes":["advantage","kingsideAttack","long","middlegame"],"f":"2k3r1/ppp1b1r1/4p1q1/4Pp2/3P3N/2PB3R/PP1N1QP1/6K1 b - - 0 29","m":["d2e7","e3e7","b6b8","g8b8","b2b8"],"alts":[]},
      {"id":"DtnRY","rating":1212,"themes":["kingsideAttack","mate","mateIn2","opening","short"],"f":"2r1rbk1/3q1pp1/4bn1p/3p3N/1pp4N/3QP3/1P3PPP/1BR1R1K1 w - - 0 25","m":["e1g6","b2g6","h3e2"],"alts":[]},
      {"id":"TrihM","rating":1224,"themes":["crushing","deflection","exposedKing","long","middlegame","pin"],"f":"r3k3/pp1bn3/n1pR4/4Q2p/2B1P3/3N1r2/PPP5/2KN3q w q - 0 22","m":["d1e4","g3g4","a7g2","d4h4","e4g4"],"alts":[]},
      {"id":"v6nxM","rating":1236,"themes":["advantage","attraction","deflection","endgame","exposedKing","long"],"f":"2R5/kr4p1/1qQ1p1p1/4p3/3bP3/1P3P2/1P6/1K6 w - - 4 39","m":["a6f7","c6f6","a4f4","f2f4","f7f6"],"alts":[]},
      {"id":"20edc","rating":1248,"themes":["advantage","discoveredAttack","discoveredCheck","exposedKing","fork","long","middlegame"],"f":"4r1k1/7p/1p1p4/p2P2nq/4nQ2/PP4P1/4B3/4RRK1 b - - 6 33","m":["b1e3","b5e8","e3g7","d8e1","g7e1"],"alts":[]},
      {"id":"e2VaV","rating":1260,"themes":["kingsideAttack","mate","mateIn2","middlegame","short"],"f":"rnbqr2k/pp5p/2p3p1/8/2Bp4/2P2Q2/P1P2PPP/R3R1K1 w - - 0 16","m":["d5d4","h4d4","g3g6"],"alts":[]},
      {"id":"tUVTw","rating":1272,"themes":["advancedPawn","crushing","endgame","exposedKing","long"],"f":"k4r2/6p1/pPr2q1p/8/3n4/3Q4/5PPP/5RK1 w - - 0 35","m":["h3f6","f4c4","f6f2","c4a4","c6c2"],"alts":[]},
      {"id":"rbB2z","rating":1283,"themes":["advantage","attraction","endgame","exposedKing","fork","long","sacrifice"],"f":"2r5/1k2r1p1/3R1p2/7p/1pbRP2P/pN3P2/KpP3P1/8 w - - 2 39","m":["h7a7","a4a7","c3f1","c2f2","f1a7"],"alts":[]},
      {"id":"xz7Xu","rating":1295,"themes":["crushing","endgame","exposedKing","long"],"f":"8/4rp2/2p2k1p/p1Np3P/Pp1n1PP1/1P2R3/6K1/8 w - - 3 36","m":["b7b1","e6b1","g7b1","g6b1","d3d2"],"alts":[]},
      {"id":"hxdrn","rating":1307,"themes":["crushing","endgame","exposedKing","interference","long","queenEndgame"],"f":"6k1/7p/4p3/p1q1P3/1p6/1P6/P2KQ2P/8 b - - 7 42","m":["a1a3","h8h5","a3f5","h5a8","f5f8"],"alts":[]},
      {"id":"si5hi","rating":1319,"themes":["endgame","exposedKing","long","mate","mateIn3","rookEndgame"],"f":"8/8/2P4R/6p1/5kP1/7P/2r5/7K b - - 2 45","m":["g7b3","e6g6","a8a5","g6g5","a5g5"],"alts":[]},
      {"id":"TtbXp","rating":1331,"themes":["kingsideAttack","long","mate","mateIn3","middlegame","triangleMate"],"f":"3b2qk/pp3prp/2p1p2r/2PpNp2/PP1P1P2/4P2P/4QRP1/6RK b - - 12 29","m":["e6e3","b8e3","b2b5","e5e8","b4b3"],"alts":[]},
      {"id":"aPRaT","rating":1343,"themes":["crushing","deflection","endgame","kingsideAttack","long"],"f":"5r1k/1pp3p1/1b1p3p/p3q3/2B1P3/P1P3P1/1P2Q2P/5R1K b - - 7 25","m":["g4g5","d8g5","d1d7","g5b8","d7a7"],"alts":[]},
      {"id":"igpaR","rating":1355,"themes":["attraction","crushing","endgame","exposedKing","fork","long"],"f":"1r4k1/5p1p/6p1/p3P1P1/n4P1P/P7/2K1B3/1R6 b - - 2 30","m":["c4c5","a8c5","f7a3","c5f5","a3d8"],"alts":[]},
      {"id":"85JcK","rating":1367,"themes":["kingsideAttack","long","mate","mateIn3","middlegame"],"f":"r1b1nnk1/p1b2p2/1ppq3Q/3p2N1/1P1P4/PN1B3P/2P2PP1/5RK1 w - - 0 24","m":["h3e2","g4e2","e6e2","b4g4","e2g2"],"alts":[]}
    ]},
  "4-13":{"version":2,"src":"https://lichess.org/training/k3DUR","focus":["rookEndgame"],"puzzles":[
      {"id":"k3DUR","rating":1200,"themes":["crushing","deflection","endgame","long","rookEndgame"],"f":"8/pRR2p2/3p1k2/4pr2/8/4KP2/PP4r1/8 w - - 0 32","m":["a2g2","g6d6","c2d2","d6h1","g2g1"],"alts":[]},
      {"id":"RaFNb","rating":1259,"themes":["crushing","endgame","rookEndgame","short","skewer"],"f":"r7/4K2p/5P2/kp1p4/8/8/1R6/8 w - - 2 57","m":["c8f8","f1c7","f8f4"],"alts":[]},
      {"id":"Iknho","rating":1321,"themes":["crushing","endgame","hangingPiece","rookEndgame","short"],"f":"8/6rR/p7/1p3K2/8/2P5/PP4kp/8 w - - 0 56","m":["e2b2","b8g8","b2e2"],"alts":[]},
      {"id":"I8La2","rating":1382,"themes":["advantage","endgame","long","rookEndgame"],"f":"8/pR6/8/6p1/k4rP1/6K1/8/8 w - - 0 43","m":["c2f2","f7c1","f2b2","g7g5","b2b1"],"alts":[]},
      {"id":"275mi","rating":1444,"themes":["crushing","endgame","long","rookEndgame"],"f":"5r2/P3R3/8/1k6/5p2/5K2/8/8 w - - 1 53","m":["d2c2","c1f6","c2c4","f6f2","c4g4"],"alts":[]},
      {"id":"WwRaN","rating":1502,"themes":["crushing","deflection","endgame","exposedKing","long","rookEndgame","skewer"],"f":"8/3k2p1/3r4/4K1p1/8/8/R7/8 w - - 0 46","m":["f8f2","h2a6","f2f6","a6c1","f6h6"],"alts":[]},
      {"id":"3s8lD","rating":1561,"themes":["advancedPawn","crushing","endgame","rookEndgame","short"],"f":"2r1k3/R6R/7p/8/r7/2p3P1/5P1P/6K1 b - - 4 37","m":["f7f2","e2f2","a3a8"],"alts":[]},
      {"id":"t19oL","rating":1621,"themes":["crushing","endgame","long","rookEndgame"],"f":"8/4r3/8/1p6/kP3K2/P1R2R2/r7/8 b - - 12 79","m":["d2g2","g7d7","g2g3","a3g3","f8f3"],"alts":[]},
      {"id":"6Z5oO","rating":1675,"themes":["advancedPawn","crushing","endgame","rookEndgame","short"],"f":"6k1/2R3pp/1P3p2/4p3/4P3/7P/1r4r1/1R2K3 w - - 4 41","m":["c5c8","b8c8","c6c2"],"alts":[]},
      {"id":"Juula","rating":1742,"themes":["crushing","endgame","rookEndgame","short"],"f":"8/1p3p2/8/1PPk3p/1P2p3/2Kp2P1/3Rr2P/8 w - - 0 45","m":["h8d8","h3d8","a3h8"],"alts":[]}
    ]},
  "4-14":{"version":2,"src":"https://lichess.org/training/8Ffr5","focus":["pawnEndgame","zugzwang","advancedPawn"],"puzzles":[
      {"id":"8Ffr5","rating":1200,"themes":["crushing","endgame","hangingPiece","long","quietMove","zugzwang"],"f":"8/8/2p2p2/1p1p1k1p/p2P1B1P/P1P2P2/1P4K1/8 b - - 0 41","m":["g1g7","b8g8","g6g1","g8d8","g7b3"],"alts":[]},
      {"id":"rGcbW","rating":1208,"themes":["crushing","endgame","pawnEndgame","veryLong","zugzwang"],"f":"8/8/4p2p/3p1p1P/kPpP1Pp1/2P3P1/K7/8 w - - 8 82","m":["f8c8","f7c1","c8f3","c1a6","f3f7","a6c6","c7c1"],"alts":[]},
      {"id":"Uv1Dm","rating":1217,"themes":["crushing","defensiveMove","endgame","pawnEndgame","short","zugzwang"],"f":"8/8/4p3/3p1kpK/3P2P1/2P5/8/8 b - - 0 52","m":["g1g7","e1b6","g7b7"],"alts":[]},
      {"id":"oWWxZ","rating":1226,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/6p1/p1p1kp2/P2P3P/1PP1K3/8/8 b - - 0 49","m":["a1h7","a3h7","d1h1","c3c7","f1c7"],"alts":[]},
      {"id":"8DzNr","rating":1235,"themes":["advancedPawn","crushing","endgame","pawnEndgame","promotion","quietMove","veryLong"],"f":"8/8/K5p1/5p1p/PP4kP/8/8/8 b - - 0 39","m":["g1g7","c7c1","g7g3","c1c6","g3g8","c6c2","g8g5b"],"alts":[]},
      {"id":"Q4XCF","rating":1243,"themes":["crushing","endgame","pawnEndgame","veryLong"],"f":"8/2p5/1p3p2/p2P4/2P2K2/1Pk2P2/P4P2/8 b - - 0 35","m":["a3c8","g7g1","c8f8","g1d6","f8c3","a7a1","c6a1"],"alts":[]},
      {"id":"D4imt","rating":1252,"themes":["advancedPawn","crushing","deflection","endgame","pin","promotion","rookEndgame","short"],"f":"8/8/3k4/P4RK1/2P5/7P/r4p2/8 b - - 3 62","m":["f8f1","g1f1","g8g5b"],"alts":[]},
      {"id":"mSGv8","rating":1260,"themes":["advancedPawn","crushing","endgame","pawnEndgame","promotion","quietMove","veryLong"],"f":"8/8/8/3p2p1/3K1k2/7P/2P5/8 w - - 2 38","m":["h7h1","g7b3","a8a7","b3e3","a7a1","b1b7","a1a6","b7b3","a6a2","e3e8","a2a4b"],"alts":[]},
      {"id":"VLySQ","rating":1269,"themes":["crushing","endgame","pawnEndgame","veryLong"],"f":"8/p7/1p6/1P6/P1K5/4k3/8/8 w - - 6 60","m":["a7h1","d3h3","h1a6","h3a7","a6c2","a7c3","c2f2"],"alts":[]},
      {"id":"LBOOZ","rating":1278,"themes":["crushing","defensiveMove","endgame","pawnEndgame","short","zugzwang"],"f":"8/2p5/1p3kp1/1P1P3p/5P1P/3K4/8/8 w - - 4 48","m":["h3d7","g6d2","d7d1"],"alts":[]},
      {"id":"LT1Xt","rating":1286,"themes":["advancedPawn","crushing","master","middlegame","short"],"f":"4r1k1/1b3p2/p4QqP/1p2P1N1/3P1p2/8/P2RKPP1/2r5 w - - 7 30","m":["e6e2","b6e2","b1e2"],"alts":[]},
      {"id":"ouj2a","rating":1295,"themes":["crushing","endgame","long","zugzwang"],"f":"8/8/4pk1p/4r2K/5PP1/8/8/8 w - - 0 49","m":["g7d1","g6b2","b7b1","e6b1","e1b1"],"alts":[]},
      {"id":"MDK0k","rating":1304,"themes":["crushing","endgame","pawnEndgame","short","zugzwang"],"f":"3k4/5p2/1p3P2/1PpKP3/8/8/8/8 b - - 4 49","m":["h4h2","h1a7","h2d6"],"alts":[]},
      {"id":"wPCE1","rating":1312,"themes":["advancedPawn","crushing","endgame","pawnEndgame","promotion","veryLong"],"f":"8/8/8/1p1p2P1/p4K2/k1P5/8/8 w - - 0 53","m":["b1b6","h1h7","a3h7","c1c7","b6b2","c7c3","b2b4b"],"alts":[]},
      {"id":"BK8oE","rating":1321,"themes":["crushing","endgame","pawnEndgame","quietMove","veryLong"],"f":"8/pK6/8/8/8/8/Pk6/8 b - - 0 48","m":["f2f1","c2f6","f1f7","f6f1","f7f3","f1c7","c8f8","c7a3","f8c5"],"alts":[]}
    ]},
  "4-15":{"version":2,"src":"https://lichess.org/training/bHshu","focus":["fork","pin","skewer","sacrifice","discoveredAttack","deflection","clearance","attraction"],"puzzles":[
      {"id":"bHshu","rating":1200,"themes":["mate","mateIn2","middlegame","sacrifice","short"],"f":"2b1k3/3q1p1n/2pp2p1/2p1p2r/P1P1P3/3P1NKP/1P1Q1RP1/R7 b - - 2 26","m":["e1e3","b8e3","h2e3"],"alts":[]},
      {"id":"It1w3","rating":1206,"themes":["advancedPawn","crushing","deflection","endgame","master","pin","promotion","rookEndgame","short"],"f":"4k3/8/4p3/7P/5PP1/3R1K2/1r1p4/8 b - - 0 41","m":["c8c3","h3c3","h8h5b"],"alts":[]},
      {"id":"mdUVz","rating":1212,"themes":["crushing","discoveredAttack","endgame","long"],"f":"8/5p2/R1N2rpp/3K4/2P3k1/5n2/8/8 w - - 0 40","m":["a6d1","g3d1","f6g6","d1a7","h1a7"],"alts":[]},
      {"id":"CG8DZ","rating":1217,"themes":["crushing","endgame","master","pin","short"],"f":"6r1/1p3R2/2bB4/3p3K/1P1P4/3kP3/5P2/8 b - - 2 51","m":["a6d4","e1e6","d4g2"],"alts":[]},
      {"id":"xrqan","rating":1223,"themes":["attraction","endgame","mate","mateIn2","sacrifice","short"],"f":"1k6/1pp4p/p3QPq1/2N5/8/5p1P/PPP2Pr1/5R1K b - - 2 26","m":["b8e8","e5e8","b6b8"],"alts":[]},
      {"id":"R5ogO","rating":1229,"themes":["attraction","mate","mateIn2","middlegame","sacrifice","short"],"f":"1r4k1/4qpp1/7p/3r4/3B2P1/R1PQRP2/K7/8 b - - 2 33","m":["d2f3","f8f3","h1f1"],"alts":[]},
      {"id":"uKkF0","rating":1235,"themes":["crushing","endgame","fork","short"],"f":"8/ppp4p/5k2/4R1N1/1P6/5P2/P2q2PP/6K1 w - - 3 33","m":["b1d7","g6d1","d7h8"],"alts":[]},
      {"id":"fE6BM","rating":1241,"themes":["attraction","endgame","long","mate","mateIn3","sacrifice"],"f":"1q6/6pk/2P3pp/5r2/3PQ3/5P2/P4bPP/2RR3K b - - 2 35","m":["c4e8","e5e8","g1e1","d7e7","e1e7"],"alts":[]},
      {"id":"ISlPp","rating":1246,"themes":["crushing","long","middlegame","sacrifice"],"f":"3r3r/1kpqnpp1/1p1p4/3PnP1p/3QP3/4B3/P5PP/1R3RK1 w - - 2 21","m":["c5c6","a2c6","h7c6","c2a4","g5a5"],"alts":[]},
      {"id":"QB1Kt","rating":1252,"themes":["advantage","endgame","short","skewer"],"f":"6k1/p6p/5Q2/8/2P1P2P/1PK1B3/P4P2/3q4 b - - 1 43","m":["h5f5","a3h3","f5g6"],"alts":[]},
      {"id":"D2goU","rating":1258,"themes":["crushing","endgame","rookEndgame","short","skewer"],"f":"8/R5p1/5kP1/1K6/8/5r2/8/8 w - - 6 49","m":["f2g2","g6b6","g2g3"],"alts":[]}
    ]},
  "4-16":{"version":2,"src":"https://lichess.org/training/rURC5","focus":["clearance"],"puzzles":[
      {"id":"rURC5","rating":1201,"themes":["backRankMate","clearance","long","mate","mateIn3","middlegame","sacrifice"],"f":"4r2k/pp1n2p1/1bp4p/8/2N1nR2/P1P5/1P4PP/R1B4K b - - 1 21","m":["d7g8","g7g8","d4d5","g8g5","d5g5"],"alts":[]},
      {"id":"WKWgZ","rating":1238,"themes":["advantage","clearance","kingsideAttack","middlegame","short"],"f":"3rn2k/7p/2qpp3/2p1b3/1pP2B1r/3P3P/1P1Q1P1K/R5R1 w - - 4 29","m":["g7d1","h6d1","h8b1"],"alts":[]},
      {"id":"eRU01","rating":1275,"themes":["clearance","kingsideAttack","mate","mateIn2","middlegame","sacrifice","short"],"f":"2k4r/ppP2pp1/4p1q1/2P5/8/P3PN1p/1B4rP/1R2QR1K b - - 3 31","m":["b8e8","g3e8","b6b8"],"alts":[]},
      {"id":"MBsJJ","rating":1312,"themes":["clearance","long","mate","mateIn3","middlegame","pin","sacrifice"],"f":"k3r2r/pp3R1p/2bQ2p1/8/2P1q3/1B6/PP4PP/6RK b - - 0 22","m":["d7b8","b5b8","d4d5","g2g5","d5g5"],"alts":[]},
      {"id":"8HOjh","rating":1349,"themes":["clearance","crushing","endgame","exposedKing","long","pin"],"f":"6k1/pp6/5q1p/6p1/2Pr4/4Q2P/P4PK1/4R3 w - - 0 28","m":["d3d4","g6g4","d4b6","b4e4","d5d4"],"alts":[]},
      {"id":"fY06A","rating":1385,"themes":["attraction","clearance","crushing","deflection","exposedKing","fork","long","middlegame"],"f":"5rk1/2p3b1/1p1p3p/p2Pp1pP/P1P2q2/8/1P2Q1R1/1B2K1B1 b - - 2 33","m":["g7a5","d8h5","g4g5","d5g5","a5h5"],"alts":[]},
      {"id":"34QQ2","rating":1422,"themes":["advantage","clearance","master","middlegame","short"],"f":"r1b1k2r/pp4pp/1qn1p3/2bpn3/3N4/P1PB1N2/1P4PP/R1BQK2R w KQkq - 0 13","m":["g3d1","a6d1","h5e1"],"alts":[]},
      {"id":"pei5Y","rating":1459,"themes":["clearance","crushing","endgame","long","sacrifice"],"f":"4r3/p4p1p/6pk/2N1n3/3Q4/PP4qP/6P1/5R1K b - - 3 30","m":["d1g3","g5g3","d4d5","h7b5","d5b5"],"alts":[]},
      {"id":"Ws81a","rating":1497,"themes":["clearance","mate","mateIn2","middlegame","queensideAttack","short"],"f":"4k2r/1p2p1b1/p2P2p1/5b2/4n2p/1Qq1BN1P/P1P3P1/2KR3R b k - 1 22","m":["a3f5","c3c5","b2c8"],"alts":[]},
      {"id":"xwa8w","rating":1533,"themes":["clearance","crushing","deflection","endgame","long"],"f":"6k1/1b4p1/2p2qQp/1p6/2ppB3/2P3P1/4P2P/6K1 w - - 2 30","m":["b6d4","g6g4","d7e2","b4e2","d4g4"],"alts":[]}
    ]},
  "4-17":{"version":2,"src":"https://lichess.org/training/6lpVq","focus":["queenEndgame","promotion","advancedPawn"],"puzzles":[
      {"id":"6lpVq","rating":1200,"themes":["advancedPawn","crushing","endgame","promotion","queenEndgame","veryLong"],"f":"8/8/8/8/pkq3P1/5K1P/8/1Q6 b - - 9 67","m":["a7c3","c5c3","f7c3","b7b1","c3c8","b1b6","c8c5b"],"alts":[]},
      {"id":"Sqguo","rating":1210,"themes":["endgame","mate","mateIn2","queenEndgame","short"],"f":"8/5pp1/4p3/3p1kPp/3P1P1P/4P1K1/4q3/6Q1 w - - 3 48","m":["b5c5","d8a8","c5a8"],"alts":[]},
      {"id":"Vptu8","rating":1220,"themes":["crushing","endgame","queenEndgame","short","skewer"],"f":"5Q2/8/6K1/3k4/3p4/8/8/7q w - - 1 59","m":["g4f4","h1a1","f4e5"],"alts":[]},
      {"id":"KgCWt","rating":1230,"themes":["advancedPawn","crushing","endgame","short"],"f":"8/8/3P4/1p1r3p/2b4k/2P5/7K/3R4 w - - 1 51","m":["h5h1","a7h1","h6h2"],"alts":[]},
      {"id":"QoIxC","rating":1239,"themes":["endgame","mate","mateIn2","queenEndgame","short"],"f":"k7/1p5p/pP4p1/2Q5/6q1/8/5P1K/8 w - - 0 38","m":["a1g4","b7a4","g4a4"],"alts":[]},
      {"id":"9Er9N","rating":1249,"themes":["endgame","mate","mateIn1","oneMove","queenEndgame"],"f":"8/3K4/5kp1/5p1q/8/2P1Q3/8/8 w - - 39 87","m":["d3d2"],"alts":[]},
      {"id":"zzIBP","rating":1259,"themes":["advancedPawn","crushing","deflection","endgame","promotion","queenEndgame","short"],"f":"8/3kPK2/8/2P5/6P1/7P/4q3/8 w - - 3 56","m":["a1a6","h2a2","d2d4b"],"alts":[]},
      {"id":"b6QPY","rating":1269,"themes":["endgame","master","mate","mateIn2","queenEndgame","short"],"f":"6K1/8/5q2/6pk/8/8/6Q1/8 w - - 0 63","m":["b8e3","e1b6","e3e2"],"alts":[]},
      {"id":"oTkKD","rating":1279,"themes":["advancedPawn","crushing","endgame","fork","promotion","veryLong"],"f":"8/4n3/3B2p1/Pk1P2Pp/2pK3P/P7/8/8 b - - 0 51","m":["d2g1","h7d1","g1h6","d1h6","a7a3","h6d6","a3a8","h1h6","a8a5b"],"alts":[]},
      {"id":"tevfH","rating":1289,"themes":["advancedPawn","crushing","endgame","long","promotion"],"f":"2B5/4r3/P7/7p/4k2P/6PK/8/8 w - - 7 43","m":["a4c2","d7h7","f6f2","d2c2","f2f4b"],"alts":[]},
      {"id":"q73db","rating":1299,"themes":["advancedPawn","crushing","endgame","long","queenEndgame"],"f":"8/6pk/7p/8/3pq3/1P3Q1P/P5PK/8 b - - 1 33","m":["d7g3","b8g3","h7h3","e8b3","h3h8"],"alts":[]},
      {"id":"uL9Ob","rating":1308,"themes":["advancedPawn","advantage","endgame","long","promotion"],"f":"8/2k3pp/2PN2b1/P3p3/5p2/8/3K3P/8 w - - 1 37","m":["f1f6","a2a6","f6f2","a6h6","f2f4b"],"alts":[]},
      {"id":"gH3V2","rating":1318,"themes":["advancedPawn","crushing","endgame","knightEndgame","long","promotion"],"f":"8/3P4/2n3kP/p1p2p2/P1P3p1/1p1N2P1/6K1/8 w - - 3 51","m":["h3d1","b6e2","d1a6","c3c8","h2h4b"],"alts":[]},
      {"id":"hVo1I","rating":1328,"themes":["advancedPawn","endgame","mate","mateIn1","oneMove","promotion"],"f":"5rk1/6Pp/p2Bb3/4P3/2q5/2p5/PPP5/2K4R w - - 0 29","m":["b2g4b"],"alts":[]},
      {"id":"WsL9j","rating":1338,"themes":["advancedPawn","crushing","endgame","master","pawnEndgame","short"],"f":"8/7p/1k6/1P1p1p2/P2Pp3/5pPP/2K2P2/8 b - - 0 36","m":["d7d3","g8d3","g3g8"],"alts":[]}
    ]},
  "5-0":{"version":2,"src":"https://lichess.org/training/DI2eY","focus":["advantage","crushing"],"puzzles":[
      {"id":"DI2eY","rating":1400,"themes":["advancedPawn","crushing","endgame","sacrifice","short"],"f":"3k4/R2n4/P1pnp3/8/1P2pK2/8/8/8 w - - 0 48","m":["f2h2","h4h2","f6f2"],"alts":[]},
      {"id":"J4VWo","rating":1412,"themes":["advancedPawn","crushing","endgame","long","rookEndgame"],"f":"6k1/R5pp/8/2Pp4/3rp3/7P/6P1/7K w - - 0 38","m":["a1a6","h7a7","a6a2","d7d3","f2f4"],"alts":[]},
      {"id":"uxwc1","rating":1425,"themes":["attraction","crushing","fork","long","middlegame","sacrifice"],"f":"1rr3k1/1q3p1p/p5p1/3Rp3/1P1nP3/P1NQ4/2P3PP/2K4R b - - 0 24","m":["a4a3","h3a3","h7d8","a5h8","d8a3"],"alts":[]},
      {"id":"nbb5V","rating":1437,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/5kp1/1p6/5KP1/p1P5/P7/8/8 w - - 4 56","m":["b1b6","g2d2","g1d1","c6c1","a7c1"],"alts":[]},
      {"id":"7PozG","rating":1450,"themes":["advantage","deflection","long","middlegame"],"f":"1k2r2r/pp4Qp/2p5/4p1P1/nB2P3/P1PPq2P/1PK5/3R1R2 b - - 2 24","m":["d3d8","h5h8","d8g5","c7h6","c4f4"],"alts":[]},
      {"id":"2t2az","rating":1462,"themes":["advantage","discoveredAttack","opening","short"],"f":"r2qk1nr/p1p2ppp/1pnb4/1B1Q4/8/2P1PP2/PP4PP/RNB1K1NR b KQkq - 0 9","m":["h6b3","e8b3","h4h1"],"alts":[]},
      {"id":"YkM7B","rating":1475,"themes":["crushing","endgame","long","skewer"],"f":"8/3R4/1p2p1k1/p1b1B3/P1P2P2/1PK5/4r3/8 b - - 24 56","m":["a1c7","a3h3","d8h8","h3d7","h8h2"],"alts":[]},
      {"id":"OAgM6","rating":1487,"themes":["crushing","endgame","long"],"f":"5r1k/pp4pp/4Q3/5R2/8/1P5P/q4PP1/6K1 b - - 0 28","m":["f8c5","b5e8","c5g1","d6g1","g4g1"],"alts":[]},
      {"id":"bt6Sc","rating":1499,"themes":["advantage","fork","middlegame","short"],"f":"5rk1/p2n2bp/1pb3p1/3p3q/3p2Q1/3BP1B1/PP4PP/R4NK1 w - - 4 22","m":["b7d6","g4g2","d6a6"],"alts":[]},
      {"id":"rvlcE","rating":1512,"themes":["crushing","endgame","pawnEndgame","quietMove","veryLong","zugzwang"],"f":"8/8/8/4kp1p/5p1P/8/5KP1/8 w - - 2 72","m":["g8g3","d1d6","g3g7","d6g6","b8b3","g6b6","g7d1"],"alts":[]},
      {"id":"TfWrK","rating":1524,"themes":["crushing","defensiveMove","endgame","long","pawnEndgame","quietMove"],"f":"8/7K/6p1/4k3/8/7P/8/8 w - - 1 59","m":["e2b6","d1d6","e3e7","d6d2","b6b2"],"alts":[]},
      {"id":"s8Sfm","rating":1537,"themes":["crushing","endgame","fork","short"],"f":"8/8/p1krR3/1p3BK1/1P4P1/P7/6r1/8 w - - 35 55","m":["g1d7","a6a2","d6h6"],"alts":[]},
      {"id":"8bCtV","rating":1549,"themes":["crushing","master","middlegame","short"],"f":"1r4k1/3R1r1p/R5n1/1p2p1Q1/8/6PP/1qp1bP2/6K1 w - - 2 32","m":["f6b6","e2b6","b1b6"],"alts":[]},
      {"id":"mmhkp","rating":1562,"themes":["advantage","endgame","exposedKing","veryLong"],"f":"3k4/3rb1pp/pRp2p2/P7/1n1PP3/5P1P/4KBP1/8 w - - 9 34","m":["c6c4","h4a2","g8b3","d2h6","b3h6","h2h6","c4c7"],"alts":[]},
      {"id":"G2RRC","rating":1574,"themes":["advantage","discoveredAttack","middlegame","short"],"f":"1k4r1/ppp2N2/4Qn2/3r3p/3P2p1/2PK3P/q2N1PP1/3R3R b - - 3 21","m":["h1h7","a3h7","f8d6"],"alts":[]}
    ]},
  "5-1":{"version":2,"src":"https://lichess.org/training/OAbK1","focus":["mateIn2","mateIn3"],"puzzles":[
      {"id":"OAbK1","rating":1400,"themes":["deflection","kingsideAttack","long","mate","mateIn3","middlegame"],"f":"r5k1/6pp/R3pp2/1r1pP1b1/QP1P4/PNq1PR2/6PP/6K1 b - - 0 29","m":["a3d5","g3g5","b1d3","b5e5","d5g5"],"alts":[]},
      {"id":"zE2DO","rating":1412,"themes":["endgame","mate","mateIn2","short"],"f":"4r1k1/5p1p/6p1/3R2P1/3Q3P/1P3q2/P4P2/6K1 b - - 6 35","m":["d4d5","b5e8","d5e5"],"alts":[]},
      {"id":"SEE5v","rating":1425,"themes":["endgame","mate","mateIn2","short"],"f":"8/5pkp/6p1/R4n2/5PK1/5P1P/8/8 b - - 6 41","m":["e2e1","b7b1","g2g6"],"alts":[]},
      {"id":"q8T2i","rating":1437,"themes":["long","mate","mateIn3","middlegame","sacrifice"],"f":"8/1k2b1pr/p1p2pQ1/B1p4r/4PP2/1P2q2P/P5PK/3R1R2 b - - 5 28","m":["e1e3","b8e3","d3e3","e8b5","e3e8"],"alts":[]},
      {"id":"eqp80","rating":1449,"themes":["endgame","master","mate","mateIn2","short"],"f":"8/ppQ5/2n3k1/4pqN1/3p3P/P5P1/1P2pr2/6RK w - - 2 36","m":["a2e2","b6g6","e2g2"],"alts":[]},
      {"id":"Z2RWq","rating":1461,"themes":["endgame","mate","mateIn2","queenEndgame","short"],"f":"8/8/6Qp/3k2pP/6K1/5P2/8/4q3 b - - 6 70","m":["d5e7","b7g1","e7g7"],"alts":[]},
      {"id":"pUpwi","rating":1474,"themes":["endgame","mate","mateIn2","queenRookEndgame","short"],"f":"8/5R2/p5pk/3q4/3P1R2/6PK/P7/8 b - - 1 45","m":["h1e5","e3b7","e5e1"],"alts":[]},
      {"id":"K4pWF","rating":1486,"themes":["endgame","long","mate","mateIn3","sacrifice"],"f":"3r2k1/5p1p/3r2pP/4q3/8/1Q6/PpP5/1K3R2 w - - 4 32","m":["c3g2","b4e4","g2g4","h4g4","g5g4"],"alts":[]},
      {"id":"BjwA7","rating":1499,"themes":["endgame","fork","long","master","mate","mateIn3","pin"],"f":"4rB2/7k/3R4/8/1bP5/1P3bP1/5R1P/6K1 b - - 0 33","m":["d4d5","g8g5","c7a1","h6h7","a1h7"],"alts":[]},
      {"id":"tbW3e","rating":1511,"themes":["attraction","endgame","mate","mateIn2","sacrifice","short"],"f":"4r3/p5pk/7p/8/2PQ4/3n2B1/P3qPPP/5RK1 b - - 0 33","m":["d8g5","b5g5","d4d5"],"alts":[]},
      {"id":"XUwlM","rating":1523,"themes":["endgame","knightEndgame","mate","mateIn2","short"],"f":"5n2/8/p1p5/1pP5/kP2N3/P7/8/2K5 w - - 1 42","m":["a5c8","f6f1","d7a3"],"alts":[]},
      {"id":"eHhap","rating":1535,"themes":["kingsideAttack","mate","mateIn2","middlegame","pin","short"],"f":"2N2kr1/3bqp2/Q3p3/4n1np/4P3/1P6/P2B1PP1/R4RK1 b - - 0 24","m":["b1g3","b5e5","d2e7"],"alts":[]},
      {"id":"vwYyj","rating":1548,"themes":["kingsideAttack","mate","mateIn2","middlegame","short"],"f":"1r3r1k/p2bpp1n/1q1p2P1/3N4/4P3/5P2/pPP3P1/2KR3R w - - 0 21","m":["e5e2","e4b4","h1d2"],"alts":[]},
      {"id":"OavA1","rating":1560,"themes":["endgame","epauletteMate","mate","mateIn2","short"],"f":"8/5ppk/3r2p1/4Kn2/8/5P2/Q6P/8 b - - 8 49","m":["g2g6","d1g7","h6h7"],"alts":[]},
      {"id":"m3ndN","rating":1572,"themes":["endgame","mate","mateIn2","short"],"f":"1r4n1/4p3/pq5k/4pQ2/2p1P1P1/8/PPP5/2KR4 w - - 1 30","m":["h5e5","e6b2","e5e2"],"alts":[]}
    ]},
  "5-2":{"version":2,"src":"https://lichess.org/training/NDQvn","focus":["pawnEndgame","advancedPawn","promotion"],"puzzles":[
      {"id":"NDQvn","rating":1400,"themes":["advancedPawn","crushing","endgame","knightEndgame","promotion","veryLong"],"f":"8/8/5Pp1/2k1K1n1/1p1N4/8/8/8 w - - 0 44","m":["h7d6","b1d6","d1d6","c7c3","g6g2","c3c8","g2g4b"],"alts":[]},
      {"id":"1dB3I","rating":1410,"themes":["advancedPawn","crushing","endgame","knightEndgame","sacrifice","short"],"f":"8/8/1P1N4/2n4p/8/6k1/2K5/8 w - - 0 64","m":["h6d7","a1d7","c6c2"],"alts":[]},
      {"id":"4bdW9","rating":1420,"themes":["crushing","endgame","pawnEndgame","short"],"f":"8/pp3p2/8/3p1p2/3P1P2/2K1P3/P6k/8 w - - 0 38","m":["a3c7","e8b3","c7a1"],"alts":[]},
      {"id":"PNzyI","rating":1430,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/1k6/1p1p1p1p/1p1P1Pp1/P1K3P1/7P/8 w - - 0 47","m":["a3c7","e1e7","b3e7","b7b3","e8b3"],"alts":[]},
      {"id":"bExPZ","rating":1441,"themes":["advancedPawn","crushing","endgame","exposedKing","long"],"f":"8/8/kB5p/P1KN4/5pr1/8/8/8 w - - 0 51","m":["h1a2","f6c2","f1f6","c2a4","f6f2"],"alts":[]},
      {"id":"Lt8pz","rating":1451,"themes":["crushing","endgame","long","master","pawnEndgame","quietMove"],"f":"8/8/5kp1/p2p4/1p3PK1/1P6/P6P/8 b - - 1 45","m":["h1h7","b7g3","g6g1","e8e7","h7h3"],"alts":[]},
      {"id":"f6nzu","rating":1461,"themes":["advancedPawn","crushing","endgame","long","pawnEndgame"],"f":"8/8/1p5P/2p3k1/2P2p2/1P1p1K2/8/8 w - - 1 44","m":["e6e2","h3h8","g3d8","h8h5b","d8h5"],"alts":[]},
      {"id":"ikeXy","rating":1471,"themes":["advancedPawn","advantage","endgame","promotion","short"],"f":"8/5ppk/B6p/2P4b/1q2Q3/8/p4PPP/4R1K1 b - - 1 41","m":["c7d7","d5d7","f8f5b"],"alts":[]},
      {"id":"JpCP9","rating":1481,"themes":["advancedPawn","crushing","endgame","pawnEndgame","promotion","veryLong"],"f":"8/5p2/4pP1p/7P/3k2P1/8/p7/K7 w - - 1 51","m":["b7b1","e6b1","e1e6","h7d1","e6e2","d1g6","e2e4b"],"alts":[]},
      {"id":"kNdPn","rating":1492,"themes":["advancedPawn","advantage","middlegame","pin","queensideAttack","short"],"f":"1k2r3/1pbr4/1P5p/p6q/P2NPn2/B2P4/2Q2P2/4KB2 w - - 1 29","m":["c6a2","h2a2","f3h6"],"alts":[]},
      {"id":"FBt69","rating":1501,"themes":["advancedPawn","attraction","discoveredAttack","mate","mateIn2","middlegame","short"],"f":"r4rk1/p4pnp/2pp2PB/8/q3P1Q1/7P/P5P1/R6K w - - 0 23","m":["b6e2","b4e2","b7b2"],"alts":[]},
      {"id":"eWqoP","rating":1512,"themes":["advancedPawn","advantage","endgame","long","promotion"],"f":"3r1k2/5p2/p1n1qR2/1p2p2Q/4P3/P1P4P/1P1p2P1/5RK1 b - - 0 30","m":["d6g6","g5g6","h8h5b","e1h5","h4h5"],"alts":[]},
      {"id":"ZSHqA","rating":1522,"themes":["crushing","endgame","pawnEndgame","veryLong"],"f":"8/5p2/3p4/3Pp1k1/2K1P2p/5PP1/8/8 w - - 0 48","m":["b3e7","b1e7","a7c1","e7b3","c1a6","b3g3","a6h6"],"alts":[]},
      {"id":"sW22P","rating":1532,"themes":["advancedPawn","advantage","endgame","exposedKing","promotion","queenRookEndgame","veryLong"],"f":"8/2P3k1/3R4/3p2K1/2q2PP1/3r4/8/8 w - - 1 58","m":["h6h2","b2g4","h2h4","g4d2","a2a4b","a7a4","h4a4"],"alts":[]},
      {"id":"7QxXT","rating":1542,"themes":["advancedPawn","bishopEndgame","crushing","deflection","endgame","master","short"],"f":"8/8/p5pp/1p1k1p2/2pB1P2/P1Kp1P1P/1P6/8 b - - 0 40","m":["h3h8","a3h8","h1h7"],"alts":[]}
    ]},
  "5-3":{"version":2,"src":"https://lichess.org/training/WDkTk","focus":["pawnEndgame","zugzwang"],"puzzles":[
      {"id":"WDkTk","rating":1400,"themes":["crushing","endgame","long","rookEndgame","zugzwang"],"f":"8/8/5krR/4p1p1/4P3/5PK1/8/8 w - - 2 61","m":["e6b6","g6b6","b3b7","b6g6","b7e1"],"alts":[]},
      {"id":"Oz3Wx","rating":1413,"themes":["crushing","endgame","pawnEndgame","veryLong","zugzwang"],"f":"8/8/5k2/5p1p/7P/5KP1/8/8 w - - 4 44","m":["g3g7","g6d6","g7b1","d6d1","b1e1","g1g7","b3g7"],"alts":[]},
      {"id":"WE944","rating":1426,"themes":["crushing","endgame","long","pawnEndgame","quietMove","zugzwang"],"f":"8/2k5/1p1p4/pP3p2/2PK1Pp1/P5P1/8/8 w - - 1 51","m":["h7h1","a2h2","f3f7","h2d2","h1a6"],"alts":[]},
      {"id":"KwOST","rating":1440,"themes":["crushing","endgame","rookEndgame","short","zugzwang"],"f":"8/8/p3rk2/P2pR2p/2pK1Pp1/2P3P1/7P/8 b - - 2 49","m":["d6d1","g7d1","g6d6"],"alts":[]},
      {"id":"OBGMg","rating":1453,"themes":["advancedPawn","crushing","endgame","pawnEndgame","quietMove","veryLong"],"f":"8/8/4k3/6p1/1p1P4/pP3K2/P7/8 b - - 2 47","m":["d6h1","g3d3","b1b7","d3h3","b7b3","h3d3","b3b8","d3g8","h1h7","g8b8","h7a3","b8g5","a3c8"],"alts":[]},
      {"id":"IsZ34","rating":1466,"themes":["crushing","endgame","exposedKing","long","rookEndgame","zugzwang"],"f":"8/8/8/5p2/2r2Pk1/5R2/6K1/8 b - - 4 77","m":["a7a8","g3g8","a8g8","b8g8","b7g7"],"alts":[]},
      {"id":"edZVT","rating":1479,"themes":["bishopEndgame","crushing","endgame","short","zugzwang"],"f":"8/6p1/7p/6PP/6bK/5k2/2B5/8 w - - 3 53","m":["a8h5","g3g7","h5b7"],"alts":[]},
      {"id":"i9eRc","rating":1493,"themes":["crushing","defensiveMove","endgame","pawnEndgame","short"],"f":"8/8/8/3k1K2/4p3/5P2/8/8 w - - 0 103","m":["g3d7","h1h6","g1g6"],"alts":[]},
      {"id":"m97XW","rating":1506,"themes":["crushing","defensiveMove","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/8/4p1k1/6P1/8/6K1/8 b - - 0 58","m":["b1b7","b8g8","b7g7","g8d8","g7d7"],"alts":[]},
      {"id":"1ORN2","rating":1519,"themes":["crushing","endgame","pawnEndgame","quietMove","veryLong","zugzwang"],"f":"8/7p/1p3k2/p1p2p1P/P1P2K2/2P3P1/8/8 b - - 0 49","m":["e2e6","g7d3","g6b1","d3g3","b1e1","g3g7","e1b6"],"alts":[]},
      {"id":"WtAJh","rating":1532,"themes":["crushing","endgame","pawnEndgame","veryLong"],"f":"8/6p1/4p1k1/4P3/1Kp2pPP/2P5/8/8 w - - 0 43","m":["c7a7","g7g3","a7h3","g3g8","h3d8","g8g5n","d8g5"],"alts":[]},
      {"id":"eKv0f","rating":1545,"themes":["crushing","endgame","long","pawnEndgame"],"f":"8/8/8/2p5/P7/1K1k4/8/8 b - - 0 63","m":["a1a7","c3c8","h3h8","f7f1","a7a3"],"alts":[]},
      {"id":"0mkKK","rating":1559,"themes":["crushing","endgame","long","pawnEndgame"],"f":"5k2/5p2/3p1p1p/p1p2P2/2P1K1P1/PP5P/8/8 w - - 0 36","m":["d7h1","g4d2","h1a6","f1f7","c3f7"],"alts":[]},
      {"id":"1Mq3j","rating":1572,"themes":["crushing","endgame","long","pawnEndgame"],"f":"8/p7/1p3k2/7p/1PP4K/8/P7/8 b - - 2 47","m":["g6d1","f8f7","d1h7","a7a1","c6a1"],"alts":[]},
      {"id":"lrimq","rating":1585,"themes":["crushing","defensiveMove","endgame","queenEndgame","veryLong","zugzwang"],"f":"1Q6/8/8/3p1k2/4qP2/8/5K2/8 b - - 6 55","m":["d7g7","c4g7","g1g7","g8d8","g7d7","d8h8","d7h7"],"alts":[]}
    ]},
  "5-4":{"version":2,"src":"https://lichess.org/training/91uR4","focus":["pawnEndgame","advancedPawn","promotion"],"puzzles":[
      {"id":"91uR4","rating":1400,"themes":["advancedPawn","crushing","endgame","pawnEndgame","promotion","veryLong"],"f":"8/7p/1K5P/2Pk4/6p1/8/8/8 b - - 1 54","m":["b7b3","a1a6","b3b8","a6a2","b8b5b","c6c2","b5c5"],"alts":[]},
      {"id":"FaK9r","rating":1410,"themes":["crushing","endgame","pawnEndgame","quietMove","veryLong"],"f":"8/pK6/8/8/8/8/Pk6/8 b - - 0 42","m":["f2f1","c2a6","f1f7","a6c1","f7f3","c1c7","c8f8"],"alts":[]},
      {"id":"Cu48m","rating":1420,"themes":["crushing","endgame","long","pawnEndgame","quietMove"],"f":"8/5Kpp/8/6PP/5k2/8/8/8 b - - 2 41","m":["g7b1","g2b2","e2e6","b2g2","b1e1"],"alts":[]},
      {"id":"X1Eoi","rating":1430,"themes":["crushing","endgame","long","pawnEndgame","quietMove","zugzwang"],"f":"8/1p6/3k1p2/1P4p1/P1p1PpP1/5P2/3K4/8 b - - 0 35","m":["h6a1","h8a3","c2c6","a3a8","a1c7"],"alts":[]},
      {"id":"5r95J","rating":1441,"themes":["crushing","endgame","long","pawnEndgame"],"f":"8/1p6/3p1k2/p2p1p1p/P1P2PpP/3K2P1/8/8 w - - 0 37","m":["a7h1","g6d2","h3a7","d2h2","a7c1"],"alts":[]},
      {"id":"XhvT2","rating":1451,"themes":["advancedPawn","crushing","endgame","short"],"f":"8/8/3k1P2/p2pb3/1p4N1/1P1K4/P7/8 w - - 1 63","m":["b7d1","h6d1","g6g2"],"alts":[]},
      {"id":"29MCx","rating":1461,"themes":["advancedPawn","crushing","endgame","long"],"f":"2q2k2/5pp1/5b1p/2Qp4/2pP4/6P1/4PPBP/6K1 b - - 1 35","m":["a4a1","h7a1","a7a3","b8h1","a3a8"],"alts":[]},
      {"id":"Ih3Ly","rating":1471,"themes":["crushing","defensiveMove","endgame","pawnEndgame","quietMove","veryLong"],"f":"8/pK6/8/8/8/8/Pk6/8 b - - 0 45","m":["f2f1","c2a6","f1f7","a6c1","f7f3","c1f7","c8f8","f7c7","f8c8"],"alts":[]},
      {"id":"ivK81","rating":1481,"themes":["crushing","endgame","pawnEndgame","short"],"f":"8/6k1/4K3/5P1p/8/8/8/8 w - - 0 64","m":["d6d2","e1e7","g1g6"],"alts":[]},
      {"id":"WwhsH","rating":1492,"themes":["crushing","endgame","master","pawnEndgame","short","zugzwang"],"f":"8/4k3/5p2/3p1K1p/3P1P1P/2P5/8/8 b - - 0 49","m":["d2g2","a3a7","h1a7"],"alts":[]},
      {"id":"5zzrt","rating":1501,"themes":["crushing","endgame","master","pawnEndgame","short"],"f":"8/8/8/3p4/p2K2kp/P1P5/6P1/8 b - - 2 68","m":["b7b3","a3a7","h1a7"],"alts":[]},
      {"id":"2viRB","rating":1512,"themes":["crushing","endgame","long","pawnEndgame","quietMove","zugzwang"],"f":"8/1p6/1p1k1p2/2p1p1p1/P1K1P1P1/2P2P2/8/8 w - - 0 37","m":["a7c1","h6a2","a3a7","a2h2","c1c6"],"alts":[]},
      {"id":"WPdvF","rating":1522,"themes":["advancedPawn","crushing","endgame","promotion","rookEndgame","veryLong"],"f":"8/8/8/2R3P1/7K/3k4/1rp5/8 b - - 1 58","m":["c8c7","e7e1","c7a7","a1a7","h3a7","b1b6","a8a5b"],"alts":[]},
      {"id":"cW6LF","rating":1532,"themes":["advancedPawn","crushing","deflection","endgame","master","promotion","rookEndgame","short"],"f":"8/8/5pk1/7p/R4KPP/5P2/p1r5/8 b - - 0 46","m":["a8a7","f7a7","f8f5b"],"alts":[]},
      {"id":"3tI0F","rating":1542,"themes":["advancedPawn","deflection","endgame","mate","mateIn2","short"],"f":"6k1/p4pp1/2Q5/6P1/3P1P2/P1P3qp/6P1/4rRK1 b - - 4 34","m":["e3e8","b5e5","d5g5"],"alts":[]}
    ]},
  "5-5":{"version":2,"src":"https://lichess.org/training/3vfr3","focus":["pawnEndgame","promotion","advancedPawn"],"puzzles":[
      {"id":"3vfr3","rating":1401,"themes":["advancedPawn","crushing","endgame","pawnEndgame","promotion","quietMove","veryLong"],"f":"8/8/6pp/8/4K1P1/5Pk1/8/8 b - - 3 51","m":["e6e1","b7e1","b6e1","g3g7","e1e7","g7g1","e7e3","g1g6","e3e8","d7h7","e8e5b"],"alts":[]},
      {"id":"qGIye","rating":1410,"themes":["advancedPawn","crushing","endgame","short"],"f":"8/2k5/p2b4/1p1P4/4p3/P3B1p1/1PP1K2p/7R b - - 1 41","m":["b3b8","e5e8","h6e8"],"alts":[]},
      {"id":"TkUXI","rating":1420,"themes":["advancedPawn","crushing","endgame","pawnEndgame","promotion","quietMove","veryLong"],"f":"8/8/8/3p4/5KpP/2k5/8/8 w - - 0 57","m":["e7e1","a3a8","e1e6","h1h7","e6e2","h7h3","e2e4b"],"alts":[]},
      {"id":"ruIRe","rating":1430,"themes":["crushing","endgame","master","pawnEndgame","short"],"f":"8/8/6p1/4k3/3pPp2/5P2/4K1P1/8 w - - 2 44","m":["d8h3","b6b1","h3a7"],"alts":[]},
      {"id":"NWqKt","rating":1441,"themes":["advancedPawn","advantage","endgame","long","promotion"],"f":"r1b2Q2/1p5k/3Pp1p1/3p4/1q6/3R4/p4PPP/R5K1 b - - 1 26","m":["c7c5","h3h5","c5h5","f5h5","f8f5b"],"alts":[]},
      {"id":"9ox7c","rating":1451,"themes":["advancedPawn","crushing","endgame","long","promotion"],"f":"r7/pkp1P2p/1p3p2/4q1Q1/8/8/P3n1PP/5R1K w - - 0 31","m":["b1d1","g6d1","g5g4","f4g4","d2g4b"],"alts":[]},
      {"id":"zEXw4","rating":1461,"themes":["crushing","endgame","pawnEndgame","veryLong","zugzwang"],"f":"8/8/5p2/6pk/4P3/7P/7K/8 b - - 2 60","m":["e1e7","e8b8","b1b7","e3b7","e7b7","b8g8","b7g7"],"alts":[]},
      {"id":"to8eW","rating":1471,"themes":["advancedPawn","attraction","crushing","deflection","endgame","exposedKing","fork","master","promotion","veryLong"],"f":"8/P7/2p5/5R2/3p2n1/1P4k1/5p2/5K2 b - - 0 47","m":["b7d3","g5d8","d3g1","f2f4b","h7h3","d8h3","g8g5b"],"alts":[]},
      {"id":"4qQ8k","rating":1481,"themes":["advancedPawn","crushing","endgame","long","promotion","rookEndgame"],"f":"8/p7/1p4R1/2p2Pp1/r1P1k3/2P5/PK6/8 w - - 0 49","m":["g1g6","d7g1","g6g2","g1b6","g2g4b"],"alts":[]},
      {"id":"AdLCj","rating":1492,"themes":["crushing","endgame","long","pawnEndgame","quietMove"],"f":"8/6K1/2k2p2/4p2p/8/5P1P/6P1/8 b - - 0 45","m":["g6g1","b2g6","d1d7","g6g1","d7d3"],"alts":[]},
      {"id":"qJn5f","rating":1501,"themes":["advancedPawn","crushing","endgame","pawnEndgame","promotion","veryLong"],"f":"8/8/p7/1P6/3p2K1/2k4P/8/8 w - - 0 46","m":["c1f6","h7h3","f6f2","h3h8","f2f4b","h8h5b","f4g3","h5g3","b7g3"],"alts":[]},
      {"id":"EHbCI","rating":1511,"themes":["advancedPawn","crushing","endgame","long"],"f":"8/1p2Q1q1/1n1PP1k1/5pp1/2P5/1P6/1K2b3/8 w - - 0 42","m":["d2b2","b6b2","h6h2","c6h2","d6h2"],"alts":[]},
      {"id":"F5BML","rating":1522,"themes":["crushing","defensiveMove","endgame","long","pawnEndgame"],"f":"8/8/6p1/4k3/6KP/8/8/8 w - - 1 51","m":["b7b1","d1d6","b1b6","d6d2","b6b2"],"alts":[]},
      {"id":"vE714","rating":1532,"themes":["crushing","endgame","pawnEndgame","short"],"f":"8/8/p7/1p3k2/6p1/P3K1Pp/1P5P/8 w - - 0 47","m":["d3h7","c1c7","f3c7"],"alts":[]},
      {"id":"01RWL","rating":1542,"themes":["advancedPawn","bishopEndgame","crushing","endgame","long","promotion"],"f":"8/3K4/B4k2/8/1P4p1/5p2/P7/8 b - - 0 46","m":["b7b3","c7c1","b3b8","c1c6","b8b5b"],"alts":[]}
    ]},
  "5-6":{"version":2,"src":"https://lichess.org/training/YMbYY","focus":["rookEndgame"],"puzzles":[
      {"id":"YMbYY","rating":1403,"themes":["endgame","epauletteMate","mate","mateIn2","rookEndgame","short"],"f":"3rr3/R3R3/1kp1p3/4P2p/1pp3pP/2P5/5PK1/8 w - - 0 34","m":["d2c2","c6a1","f2f1"],"alts":[]},
      {"id":"95nt2","rating":1494,"themes":["advancedPawn","crushing","endgame","long","rookEndgame"],"f":"8/pp5R/2p1Pk2/5Pr1/r7/2PK4/PP6/8 w - - 4 34","m":["e2g2","g6d1","d6d2","b1b4","g2g4"],"alts":[]},
      {"id":"tA0SD","rating":1573,"themes":["advancedPawn","crushing","endgame","promotion","quietMove","rookEndgame","veryLong"],"f":"8/8/5pK1/8/1p5P/1k6/1Pr2R2/8 w - - 3 45","m":["g8a8","c3a8","e7e1","c7c3","e1e6","a8c8","e6e2","c8a8","e2e4b"],"alts":[]},
      {"id":"PC0Rp","rating":1674,"themes":["advantage","endgame","exposedKing","long","rookEndgame"],"f":"8/1pp2r2/8/p2P4/2P2R2/P3KpP1/5Pk1/8 b - - 7 46","m":["g2d2","g7d7","d2d7","d3d7","b8g8"],"alts":[]},
      {"id":"tNIN4","rating":1756,"themes":["crushing","endgame","interference","rookEndgame","short"],"f":"8/p7/6r1/2PK1k2/8/4P3/1R4p1/8 w - - 0 53","m":["c8g8","g1b7","g8b8"],"alts":[]},
      {"id":"HcBu6","rating":1847,"themes":["crushing","endgame","long","rookEndgame","skewer"],"f":"3r3k/4R2p/2p5/p4p2/Pp6/1P5R/KP3r1P/8 w - - 6 35","m":["d2e2","e4b4","e2e4","b4b2","e4h4"],"alts":[]},
      {"id":"9pc4W","rating":1933,"themes":["crushing","endgame","master","rookEndgame","short"],"f":"8/4k3/5p2/6p1/3P2Pp/4P2P/r1RK4/8 b - - 6 64","m":["f8a8","h8a8","g6g1"],"alts":[]},
      {"id":"hHkz2","rating":2023,"themes":["crushing","defensiveMove","endgame","rookEndgame","short"],"f":"r7/P2k4/6R1/3K1p2/8/2p5/8/8 w - - 0 47","m":["b6b2","h2a4","h1a6"],"alts":[]},
      {"id":"Txlmv","rating":2112,"themes":["crushing","endgame","long","rookEndgame"],"f":"8/5k1p/3Kp3/2R3PP/5P2/1p6/r7/8 b - - 0 44","m":["f8h8","h6d1","h8h1","a1h1","d6h1"],"alts":[]},
      {"id":"bnQYl","rating":2200,"themes":["crushing","endgame","rookEndgame","short"],"f":"4k3/3R2p1/5p2/5P1R/6rP/8/r7/5K2 w - - 2 68","m":["h2c2","b7g7","g5b5"],"alts":[]}
    ]},
  "5-7":{"version":2,"src":"https://lichess.org/training/FzbYi","focus":["discoveredAttack"],"puzzles":[
      {"id":"FzbYi","rating":1400,"themes":["advantage","discoveredAttack","discoveredCheck","middlegame","short"],"f":"r4k1r/q4pp1/p1bNp2p/1p6/1Q6/4p3/P3BbPP/1R3N1K w - - 6 32","m":["h6a4","g4b4","a4f2"],"alts":[]},
      {"id":"kn8RE","rating":1423,"themes":["arabianMate","discoveredAttack","mate","mateIn2","middlegame","short"],"f":"6k1/R2N3p/6p1/1pN2p2/1n6/5PnP/1r1r2P1/4R1K1 w - - 2 33","m":["h2g6","b4e4","f2e2"],"alts":[]},
      {"id":"x7leS","rating":1447,"themes":["crushing","discoveredAttack","endgame","short"],"f":"4r1k1/p1p4p/1p1p2p1/4q3/2P1Q3/1P3PP1/P6P/4R1K1 b - - 0 23","m":["d1a1","b5b8","d4d7"],"alts":[]},
      {"id":"XGsqx","rating":1470,"themes":["crushing","discoveredAttack","kingsideAttack","master","middlegame","short"],"f":"r3r1k1/pbpqbpp1/1p3n1p/3Np3/2PQ1B2/5N1P/PP3PP1/3RR1K1 w - - 0 16","m":["h1g6","d2g6","h7h2"],"alts":[]},
      {"id":"2ZzPg","rating":1493,"themes":["advantage","discoveredAttack","fork","long","middlegame"],"f":"2rr2k1/p1p2ppp/1b6/3N1q2/1PB5/P5P1/3Q1P1P/2R3K1 w - - 9 26","m":["h1d2","b4g4","h8h4","a4h4","d2g1"],"alts":[]},
      {"id":"OInJ0","rating":1517,"themes":["advantage","discoveredAttack","middlegame","short"],"f":"r3r1k1/ppp2pp1/3p1q1p/8/1PPnP3/P5P1/1Q2PPBP/3R1RK1 b - - 8 18","m":["h7g3","d8g3","g6c8"],"alts":[]},
      {"id":"jrD1R","rating":1540,"themes":["advancedPawn","advantage","attraction","discoveredAttack","middlegame","queensideAttack","short"],"f":"4k2r/3b3p/1q2pPpQ/3pP3/n5P1/Pp6/1PN3B1/1K1R3R b k - 0 27","m":["c3a8","c5a8","c6c8"],"alts":[]},
      {"id":"IKcdF","rating":1563,"themes":["discoveredAttack","hookMate","kingsideAttack","mate","mateIn2","middlegame","short"],"f":"rBb1k2r/pp1p2p1/4p3/1Nb5/4P1p1/6P1/PP3P1n/R2Q1R1K b kq - 0 16","m":["e8g3","e5b8","e4e8"],"alts":[]},
      {"id":"Vnewt","rating":1587,"themes":["advantage","discoveredAttack","endgame","long"],"f":"5B2/p6p/6bK/4k1p1/8/8/1R5P/r7 w - - 2 39","m":["g4b2","d1h1","c8h8","h1a6","b2f5"],"alts":[]},
      {"id":"D4bto","rating":1610,"themes":["crushing","discoveredAttack","fork","middlegame","short"],"f":"6k1/1p3ppp/8/3p1b2/1Br5/1R4NP/r4PP1/3K3R b - - 3 25","m":["g1a8","h5d8","a8c3"],"alts":[]},
      {"id":"idJIj","rating":1634,"themes":["crushing","discoveredAttack","kingsideAttack","master","middlegame","short"],"f":"r5k1/ppp4p/3p2p1/5b2/2PQ1n1q/2N2PP1/PP5P/4RBK1 b - - 0 19","m":["g7e3","g5e3","e7h7"],"alts":[]},
      {"id":"1g9Vz","rating":1657,"themes":["advantage","discoveredAttack","endgame","intermezzo","long"],"f":"5r1k/7p/1p3p2/2qpR3/p7/P1P5/1P3QPP/5RK1 b - - 2 30","m":["g6d1","g8a1","g4g5","b5g5","c6a1"],"alts":[]},
      {"id":"W0bQE","rating":1680,"themes":["advantage","discoveredAttack","endgame","short"],"f":"3r2k1/p4pbp/6p1/2q1p1B1/3p2P1/1P1Q3P/P3PPK1/5R2 b - - 1 25","m":["d1d7","h3d7","a1b1"],"alts":[]},
      {"id":"1d975","rating":1704,"themes":["advantage","attraction","discoveredAttack","endgame","long","master"],"f":"6k1/6pp/p1bN4/8/8/5P1P/PPKR2nr/6B1 b - - 1 35","m":["b8d5","a8h5","e8h8","h5h8","d5g3"],"alts":[]},
      {"id":"j8rK4","rating":1727,"themes":["discoveredAttack","endgame","long","mate","mateIn3","sacrifice"],"f":"1rr5/p2p3p/b1pP1k2/2K1pB2/1PP3PP/P7/8/4R2R b - - 0 30","m":["c4c1","a7c1","a6c1","a1h1","f6c2"],"alts":[]}
    ]},
  "5-8":{"version":2,"src":"https://lichess.org/training/7ivgv","focus":["pin","quietMove"],"puzzles":[
      {"id":"7ivgv","rating":1400,"themes":["advantage","endgame","pin","short"],"f":"3k3r/ppp2p1p/2n1p3/3q4/Q5p1/P5P1/P4PNP/2R4K w - - 0 22","m":["a5h5","h1h5","f7h5"],"alts":[]},
      {"id":"0iVzE","rating":1412,"themes":["advantage","middlegame","pin","short"],"f":"2Rr2k1/pQ1r2p1/4p2p/5pq1/5n2/4N3/PP3PPP/5RK1 w - - 3 23","m":["c2h2","h4a4","h2a4"],"alts":[]},
      {"id":"PsQlR","rating":1425,"themes":["crushing","endgame","pawnEndgame","quietMove","veryLong"],"f":"8/p7/3k1K2/8/2P5/6P1/8/8 b - - 1 59","m":["f2f1","a7a1","h6a1","g6g2","f1f7","b3b7","f7f3"],"alts":[]},
      {"id":"zhih7","rating":1437,"themes":["advantage","middlegame","pin","short"],"f":"2r1k2r/1q2pp1p/p5p1/1pp5/4NP2/P2P4/2P4P/b2QR1K1 w k - 0 21","m":["d7h6","d4h2","h6c2"],"alts":[]},
      {"id":"GI2SQ","rating":1449,"themes":["crushing","defensiveMove","endgame","long","pin"],"f":"5r1k/pr4q1/3R3p/2p2Pp1/2P5/P3P1P1/2Q3K1/3R4 b - - 2 32","m":["c2c8","h6e6","e4b4","e6b6","c8a8"],"alts":[]},
      {"id":"MqdzT","rating":1461,"themes":["crushing","endgame","quietMove","rookEndgame","veryLong"],"f":"1k6/6r1/p7/1p6/6R1/P5K1/5P1P/8 b - - 0 37","m":["b2b7","b3b7","f6f1","b7g1","c1c7","f3f7","c7c3"],"alts":[]},
      {"id":"hnuoX","rating":1474,"themes":["crushing","endgame","fork","long","pin"],"f":"2r3k1/p4pp1/1p5p/3RP3/5P2/1P1Q2PP/P1rR3K/3q4 b - - 4 32","m":["a8h8","h3h8","a4a8","h8a8","h5a8"],"alts":[]},
      {"id":"swcTK","rating":1486,"themes":["advantage","opening","pin","short"],"f":"2kr1b1r/pppq1ppp/2np1n2/8/3pPP1P/P2Q1P2/1PP5/RNB1KB1R w KQ - 1 10","m":["g5e3","h2e3","e5e3"],"alts":[]},
      {"id":"FKWYj","rating":1498,"themes":["crushing","endgame","pin","short"],"f":"8/pbk5/1p2p3/2p1qpB1/3p4/3P2PQ/PPP2K2/8 w - - 0 42","m":["b1g7","d1g7","b3g7"],"alts":[]},
      {"id":"QINh3","rating":1511,"themes":["crushing","endgame","master","pawnEndgame","quietMove","short"],"f":"8/5p2/8/1p6/1k2K1pP/8/8/8 w - - 0 46","m":["e7e1","c7a7","e1e6"],"alts":[]},
      {"id":"toNVV","rating":1523,"themes":["kingsideAttack","mate","mateIn1","middlegame","oneMove","pin"],"f":"2k3r1/pp3p2/2p1pp2/2P5/3Pqb1p/2R1P1rP/PP1NQ1P1/6RK b - - 1 23","m":["b3e3"],"alts":[]},
      {"id":"THylU","rating":1535,"themes":["advantage","long","middlegame","pin","sacrifice"],"f":"4r1n1/2pq1ppk/Rp4bp/4N3/1b1P4/1PN4P/1PP2QP1/5RK1 b - - 4 24","m":["d4d1","h7d1","c7a1","g8a1","c6a1"],"alts":[]},
      {"id":"zoP7z","rating":1547,"themes":["advancedPawn","crushing","endgame","pawnEndgame","quietMove","veryLong"],"f":"8/8/7p/2Pk4/3P2p1/8/1K4P1/8 b - - 1 41","m":["e6e1","c8a8","e1e7","a8h5","e7e3","h5d5","e3e8"],"alts":[]},
      {"id":"F7lMu","rating":1560,"themes":["bishopEndgame","crushing","endgame","quietMove","veryLong"],"f":"6bk/6pp/8/8/3pp3/1B5P/P4KP1/8 w - - 0 35","m":["c3b4","e4b4","f8f7","b4g2","f7f1","g2d6","f1f6"],"alts":[]},
      {"id":"u2nXd","rating":1572,"themes":["advantage","endgame","quietMove","short"],"f":"8/k1p3r1/1p4r1/p7/PP2Qn1P/8/7P/5R1K b - - 4 33","m":["g7e3","d7b6","b2b6"],"alts":[]}
    ]},
  "5-9":{"version":2,"src":"https://lichess.org/training/d7iwD","focus":["opening","attackingF2F7","castling"],"puzzles":[
      {"id":"d7iwD","rating":1400,"themes":["attackingF2F7","mate","mateIn2","opening","short"],"f":"rnbBk2r/p4ppp/2p5/1pb5/2N1n3/3P4/PPP2PPP/R2QKB1R b KQkq - 0 9","m":["a1g8","d5d8","a4b7"],"alts":[]},
      {"id":"KsfX3","rating":1411,"themes":["advantage","kingsideAttack","opening","short"],"f":"r1bqr1k1/ppp2pbp/2np2p1/6n1/3P4/3B1N1P/PP3PPB/RN1QR1K1 w - - 2 12","m":["d5d4","h4d4","g3b1"],"alts":[]},
      {"id":"8Q916","rating":1422,"themes":["mate","mateIn2","opening","short"],"f":"r1bq3r/ppp1k1pp/3b1n2/3B2Q1/3np3/8/PPP2PPP/RNB1K1NR w KQ - 0 12","m":["b1b2","d2d4","b2g2"],"alts":[]},
      {"id":"lSSWE","rating":1433,"themes":["attackingF2F7","mate","mateIn2","middlegame","short"],"f":"r3k2r/5pp1/1q2P3/8/3b4/pbB3Np/5Q1K/8 w kq - 0 38","m":["g8g2","d4h4","g2h2"],"alts":[]},
      {"id":"x0n0d","rating":1444,"themes":["attackingF2F7","deflection","mate","mateIn2","opening","short"],"f":"rnb1kbnr/1pp2ppp/p7/3pN3/3P4/2N2Q1q/P1P2P1P/1RB1K2R w Kkq - 0 15","m":["g3g2","d4h4","g2g4"],"alts":[]},
      {"id":"LwBKV","rating":1455,"themes":["mate","mateIn1","oneMove","opening","pin"],"f":"r3qbkr/pp2pNpp/1nn1b3/3p4/3P2Q1/8/PP3PPP/RNB1K2R w KQ - 0 13","m":["g2e6"],"alts":[]},
      {"id":"DFObi","rating":1466,"themes":["attackingF2F7","mate","mateIn2","middlegame","short"],"f":"rn1qkbnr/ppp2p2/3p3p/4N1p1/2B1Pp2/2N4P/PPPP2P1/R1Bb1RK1 w kq - 0 9","m":["a7g2","d4d2","a3h1"],"alts":[]},
      {"id":"SNqsZ","rating":1477,"themes":["attackingF2F7","mate","mateIn1","oneMove","opening"],"f":"rn1qkb1r/pQ3ppp/4pn2/1bp3N1/4p3/2P5/PP1P1PPP/RNB1K2R w KQkq - 0 9","m":["c2g2"],"alts":[]},
      {"id":"u5lzc","rating":1488,"themes":["advantage","opening","short"],"f":"r1b1r1k1/pp3ppp/5n2/2qp4/Q2p4/3N4/P4PPP/RN2KB1R w KQ - 2 14","m":["f7d4","g6d4","h3a1"],"alts":[]},
      {"id":"dMt7l","rating":1499,"themes":["advancedPawn","attackingF2F7","mate","mateIn2","middlegame","short"],"f":"r2qk2r/1b1nbp1p/p2pP1p1/1pp5/7N/2NPB1n1/PPP1B1PP/3R1RK1 w kq - 0 15","m":["d6g2","d4g4","d3e6"],"alts":[]},
      {"id":"etFTA","rating":1510,"themes":["attackingF2F7","mate","mateIn2","middlegame","short"],"f":"1r2kr2/3pbp1Q/p3p3/B5qB/8/p7/1PP3PP/1K3R2 w - - 0 26","m":["e1g2","g4g2","e2g2"],"alts":[]},
      {"id":"RQsrn","rating":1521,"themes":["advancedPawn","attackingF2F7","mate","mateIn2","middlegame","short"],"f":"r2qkb1r/2pb1pp1/p3Pn1p/1p6/8/1BN1Bn2/PPP3PP/2KR2NR w kq - 0 13","m":["d6g2","d4d2","d3a1"],"alts":[]},
      {"id":"8ryX0","rating":1532,"themes":["attackingF2F7","crushing","deflection","master","opening","short"],"f":"r1bqkb1r/pp2pppp/2p5/4P3/2B5/2n5/PPP2PPP/R1BQK2R w KQkq - 0 9","m":["a7g2","d4g2","h5h4"],"alts":[]},
      {"id":"DybsL","rating":1543,"themes":["opening"],"f":"r1b1k1nr/pp2ppb1/1q4p1/3pP2p/3n3P/3BB3/PPQ2PP1/RN2K1NR w KQkq - 0 10","m":["a8f7","a4h2","f7h7","c6h7","d3h7"],"alts":[]},
      {"id":"WYQPN","rating":1554,"themes":["advantage","long","opening","pin","sacrifice"],"f":"r1b1k2r/p1qp1pbp/2p2np1/4p3/2BB4/2N5/PPP2PPP/R2Q1RK1 w kq - 0 12","m":["h7d1","a2d1","g5d5","d1d5","h5d5"],"alts":[]}
    ]},
  "5-10":{"version":2,"src":"https://lichess.org/training/i8SHZ","focus":["rookEndgame"],"puzzles":[
      {"id":"i8SHZ","rating":1400,"themes":["crushing","deflection","endgame","rookEndgame","short"],"f":"7R/8/5p1p/3k1K2/4r3/8/8/8 w - - 4 64","m":["e4h4","h1a6","g1d7"],"alts":[]},
      {"id":"5waHh","rating":1424,"themes":["crushing","endgame","exposedKing","long","rookEndgame","skewer"],"f":"6kr/R7/8/6K1/8/8/8/8 w - - 6 108","m":["b1b6","b4g4","f2f4","g4d2","f4e4"],"alts":[]},
      {"id":"iXwfz","rating":1448,"themes":["crushing","defensiveMove","endgame","long","rookEndgame"],"f":"8/4p3/6k1/6R1/1p2K2P/1P4r1/8/8 b - - 1 46","m":["b3b1","e7b1","b6b1","d7d1","b1b7"],"alts":[]},
      {"id":"zpSQ8","rating":1472,"themes":["crushing","endgame","rookEndgame","short"],"f":"8/2R4P/4p2r/2p1k3/2P2pK1/8/8/8 w - - 4 46","m":["a2a1","d1h7","a1e1"],"alts":[]},
      {"id":"qWNTX","rating":1496,"themes":["crushing","endgame","long","rookEndgame"],"f":"8/1p3R2/8/1r1k2K1/4p2P/8/P7/8 w - - 0 50","m":["g2g1","h1a6","g1c1","a6c1","b1g7"],"alts":[]},
      {"id":"RmO3l","rating":1520,"themes":["crushing","endgame","rookEndgame","short"],"f":"3k4/p2P4/1p6/8/5p2/2K5/PP1R1r2/8 b - - 1 38","m":["g8h8","a3h8","h4h2"],"alts":[]},
      {"id":"zlu3R","rating":1544,"themes":["crushing","endgame","long","rookEndgame"],"f":"8/8/2r5/R3PP2/6K1/1k4P1/p7/8 b - - 0 54","m":["a6a7","b7g3","a7f7","f1f7","c3f7"],"alts":[]},
      {"id":"xWdI8","rating":1567,"themes":["crushing","endgame","long","rookEndgame"],"f":"8/3k1p2/1pr4p/4PP2/7P/3K4/2R5/8 b - - 2 46","m":["a6a8","h3a8","h2a6","a8h3","a6h1"],"alts":[]},
      {"id":"YxHat","rating":1591,"themes":["crushing","endgame","rookEndgame","short"],"f":"8/8/4k3/4r2p/R7/4pP1P/4K3/8 w - - 3 62","m":["f7d7","d1d7","g3d7"],"alts":[]},
      {"id":"JXgry","rating":1615,"themes":["crushing","endgame","long","rookEndgame"],"f":"8/1k6/3K4/8/3P4/R7/p1r5/8 b - - 9 63","m":["a8a6","h6d1","a6f6","f3f8","f6f8"],"alts":[]},
      {"id":"HcWhs","rating":1639,"themes":["endgame","mate","mateIn2","rookEndgame","short"],"f":"4r3/p1p3pp/2k2p2/8/2P2KP1/P2r4/5P1P/1R2R3 b - - 1 27","m":["b2b1","g7g1","h3g3"],"alts":[]},
      {"id":"vUw1H","rating":1663,"themes":["advantage","endgame","rookEndgame","short"],"f":"5k2/p2p1p1R/4pp2/7P/8/P3P1P1/r4PK1/8 w - - 1 35","m":["e1e6","g4b4","e2b2"],"alts":[]},
      {"id":"dQtVY","rating":1687,"themes":["endgame","mate","mateIn2","quietMove","rookEndgame","short"],"f":"r6r/1R4pp/p1k1pp2/8/2PP4/8/5PPP/R5K1 w - - 2 26","m":["f5c5","f6f1","c5c6"],"alts":[]},
      {"id":"snbeA","rating":1711,"themes":["advancedPawn","crushing","endgame","exposedKing","long","rookEndgame"],"f":"2k5/7r/6RP/2P5/pp6/8/1K6/8 w - - 1 41","m":["b6b4","a4a2","b4b2","e2b2","e6b2"],"alts":[]},
      {"id":"b9u1S","rating":1735,"themes":["advantage","endgame","fork","master","rookEndgame","short"],"f":"8/6R1/2p2p2/p2p1k1r/3P4/2P1R3/r5P1/6K1 w - - 0 32","m":["b8b7","g1g7","b7e1"],"alts":[]}
    ]},
  "5-11":{"version":2,"src":"https://lichess.org/training/g6yk8","focus":["quietMove","zugzwang","trappedPiece"],"puzzles":[
      {"id":"g6yk8","rating":1400,"themes":["advantage","clearance","endgame","long","trappedPiece"],"f":"4r1k1/pp4bQ/2p2qp1/8/N7/1P6/P1PP4/2K4R b - - 1 30","m":["b4g2","a8a3","d4e4","e2e4","b2e4"],"alts":[]},
      {"id":"fm4q0","rating":1410,"themes":["crushing","endgame","long","master","quietMove"],"f":"8/r4R2/1k6/8/7P/8/2n2K2/8 w - - 0 66","m":["g2f2","c6f2","e7e1","f2c6","e1e6"],"alts":[]},
      {"id":"7C9Ph","rating":1419,"themes":["advantage","middlegame","short","trappedPiece"],"f":"2kr3r/ppp2ppp/2nb1nq1/4p3/8/3P1NNP/PPPB1PP1/R2QK2R w KQ - 1 13","m":["g3e7","b6b3","g8b3"],"alts":[]},
      {"id":"PaA18","rating":1429,"themes":["advantage","middlegame","short","trappedPiece"],"f":"r3r3/p3pk2/2p2p1Q/pqNp1bp1/3P1P2/nP2P2P/P1P3PB/2R2RK1 b - - 0 22","m":["d4e4","e6e4","f4e4"],"alts":[]},
      {"id":"5ztHk","rating":1439,"themes":["crushing","defensiveMove","endgame","pawnEndgame","quietMove","veryLong"],"f":"8/1p6/8/pkPK4/8/P7/8/8 b - - 0 62","m":["c1f7","h1a7","f7f3","a7c1","f1f7","c1f1","f3c3"],"alts":[]},
      {"id":"Rkf7J","rating":1449,"themes":["advancedPawn","crushing","endgame","pawnEndgame","quietMove","veryLong"],"f":"8/8/5p2/8/8/P7/6kP/4K3 b - - 7 48","m":["g6g1","e8e7","g1g7","e7e1","g7g3","d5h8","g3g8"],"alts":[]},
      {"id":"y7UVd","rating":1458,"themes":["advancedPawn","advantage","middlegame","promotion","short","trappedPiece"],"f":"r3kb1r/pp5p/2n1pq2/2pn2P1/8/2pP1N2/PP2BPP1/RN1QK2R b KQkq - 0 13","m":["a3c8","b1g6","c8f5b"],"alts":[]},
      {"id":"Jaku4","rating":1468,"themes":["crushing","endgame","quietMove","rookEndgame","short"],"f":"8/RP4p1/5p2/8/P6p/7k/1r6/4K3 w - - 0 48","m":["f7f1","e3b8","f1f6"],"alts":[]},
      {"id":"jLjRm","rating":1478,"themes":["crushing","defensiveMove","endgame","knightEndgame","long","trappedPiece"],"f":"8/8/8/4K3/8/p1k5/8/N7 b - - 5 61","m":["a3c8","d1h7","c8f5","h7a3","f5c5"],"alts":[]},
      {"id":"De4Ff","rating":1488,"themes":["crushing","endgame","long","master","pawnEndgame","quietMove","zugzwang"],"f":"8/8/2k5/3p1p1p/5P2/3KP2P/8/8 w - - 2 73","m":["h3h7","a6h6","e3e7","h6a6","h7d1"],"alts":[]},
      {"id":"l9mFU","rating":1497,"themes":["crushing","defensiveMove","endgame","long","pawnEndgame","zugzwang"],"f":"8/8/8/p3kp2/P7/4KP2/8/8 b - - 3 50","m":["g1g7","d3h3","d1h1","h3a3","h1a1"],"alts":[]},
      {"id":"e2hXF","rating":1507,"themes":["advantage","fork","master","middlegame","short","trappedPiece"],"f":"r3k2r/1b1pnp1p/p3p1p1/1pb4P/2B1P3/5Q2/PqNB1PP1/2R2RK1 w kq - 2 17","m":["h8a3","c8a5","g5a5"],"alts":[]}
    ]},
  "5-12":{"version":2,"src":"https://lichess.org/training/Hp299","focus":["deflection","attraction","mate"],"puzzles":[
      {"id":"Hp299","rating":1400,"themes":["advantage","attraction","endgame","fork","long"],"f":"7r/p2Rb2p/4kpp1/2p1p3/1r6/1P2B3/P4PPP/R5K1 w - - 5 23","m":["h2d2","d6d2","d3a1","d2d6","a1c7"],"alts":[]},
      {"id":"kbMWQ","rating":1409,"themes":["attraction","crushing","fork","long","middlegame"],"f":"2rq1rk1/p2p1pbp/6p1/2RN4/5B2/7P/PP1Q1PP1/5K2 w - - 1 19","m":["a1a4","h4a4","h1d2","b4e4","d2a4"],"alts":[]},
      {"id":"aVUjt","rating":1418,"themes":["attraction","crushing","endgame","fork","rookEndgame","sacrifice","veryLong"],"f":"8/8/1p1rpk1p/8/1R1P1KP1/P7/8/8 b - - 0 44","m":["h6h7","c7h7","d6d1","g7d3","d1h7","d3h7","g6b1"],"alts":[]},
      {"id":"x2gZb","rating":1426,"themes":["advantage","attraction","endgame","fork","long","sacrifice"],"f":"8/ppp2qpk/2n1p2p/P3P3/1PQ1P1P1/2P2NKP/8/8 b - - 4 41","m":["g2g3","b3g3","a6d1","g3d3","d1a7"],"alts":[]},
      {"id":"25Yhz","rating":1435,"themes":["attraction","kingsideAttack","mate","mateIn2","middlegame","sacrifice","short"],"f":"5r1k/1p1n1pR1/4p2p/pP1pP2N/P2P4/6Q1/1n1q2PP/2r2RK1 w - - 3 25","m":["b2e2","e4e2","b3b2"],"alts":[]},
      {"id":"BhYqK","rating":1444,"themes":["crushing","deflection","discoveredAttack","long","middlegame"],"f":"4r1k1/3nq3/2p5/1p1p1P1p/3Q2b1/PPB5/2B2KP1/4R3 b - - 1 43","m":["d2e7","g8b5","d4d5","a3d5","e7d5"],"alts":[]},
      {"id":"TVumK","rating":1453,"themes":["deflection","endgame","long","mate","mateIn3"],"f":"6k1/5r1p/p1B2Pp1/1p4P1/1Pn4P/P1r5/8/4R1K1 w - - 0 36","m":["d5d4","g2g4","a6h1","b4e4","d4g4"],"alts":[]},
      {"id":"0gFpU","rating":1461,"themes":["advantage","attraction","fork","long","middlegame"],"f":"r2r4/7k/p3Q2p/3q2p1/4N1Pn/1P6/2P2P1P/5R1K w - - 5 31","m":["d6h1","h4h1","d7g6","e2b2","g6h1"],"alts":[]},
      {"id":"GbU0h","rating":1470,"themes":["deflection","kingsideAttack","long","mate","mateIn3","middlegame","sacrifice"],"f":"6rk/5p1p/2q2N2/p1p1pP2/Pp3n1Q/3P1P2/1PP3rP/R4R1K b - - 3 28","m":["b8b5","g5b5","a6g3","b5b8","g3b8"],"alts":[]},
      {"id":"QNwd0","rating":1479,"themes":["exposedKing","long","mate","mateIn3","middlegame"],"f":"1kr3n1/5pQp/4p3/3PP3/1q3P2/1NBp1N2/PPbK2PP/R4B1R b - - 8 30","m":["c7g7","h8d5","g7d3","g5d8","d3d8"],"alts":[]},
      {"id":"1YHqe","rating":1488,"themes":["advantage","deflection","discoveredAttack","fork","master","middlegame","short"],"f":"3r2k1/1b4p1/1p2N1P1/2bnN2p/P1B2P2/2P1P3/1PK5/3R4 b - - 6 36","m":["h1d3","a8c3","h4h5"],"alts":[]},
      {"id":"3kOXe","rating":1497,"themes":["crushing","deflection","endgame","long","rookEndgame"],"f":"8/1p5r/p7/4k3/2p1PRKP/2P5/PP6/8 b - - 7 52","m":["e2e7","b7e7","d1g7","d7d1","g7d1"],"alts":[]},
      {"id":"Yxv4P","rating":1505,"themes":["endgame","mate","mateIn2","short"],"f":"2r5/p1p4k/1p1p2p1/3q4/3b4/8/P1Q2rR1/7K w - - 0 30","m":["a8b6","e2e4","b6e6"],"alts":[]},
      {"id":"dAs8A","rating":1514,"themes":["crushing","deflection","long","middlegame"],"f":"q3r1k1/5pp1/2r1p2p/4P3/P1BPnbQP/1P6/1BK2P2/6RR b - - 4 28","m":["a6a7","c3a7","f4f7","a8h3","d7g8"],"alts":[]},
      {"id":"P7FAu","rating":1522,"themes":["attraction","crushing","endgame","long","pin","queenRookEndgame"],"f":"7k/p1r5/1p3p1p/4p3/6Q1/P7/2r3R1/6K1 b - - 6 42","m":["a8b8","b7b8","a2b2","b5e8","b2b8"],"alts":[]}
    ]},
  "5-13":{"version":2,"src":"https://lichess.org/training/8iolE","focus":["defensiveMove","equality"],"puzzles":[
      {"id":"8iolE","rating":1400,"themes":["capturingDefender","endgame","equality","short"],"f":"2k5/2p2ppp/pbp1p3/2N5/2p1P1n1/P3B1P1/1P2KPBP/8 b - - 2 22","m":["b7d3","g8d3","c6a1"],"alts":[]},
      {"id":"SUJD2","rating":1412,"themes":["advancedPawn","bishopEndgame","endgame","equality","veryLong"],"f":"8/5b1p/5P1p/1Pk1KP2/8/8/8/8 w - - 3 48","m":["c1c6","a1c6","d1h6","e6e1","h6d2","g2h1","g6g2","h1g2","d2g2"],"alts":[]},
      {"id":"ebTEy","rating":1423,"themes":["crushing","defensiveMove","endgame","long","zugzwang"],"f":"8/8/3p4/p1p1k1p1/PpP1P3/1P3P2/2Kr2P1/8 w - - 0 41","m":["a8h8","d1g7","h8d8","g7b3","d8g5"],"alts":[]},
      {"id":"2buXN","rating":1435,"themes":["advantage","defensiveMove","hangingPiece","opening","short"],"f":"rn2r1k1/pp3ppp/1qpb1p2/8/2bP4/1B2BN1P/PP3PP1/R2QK2R w KQ - 0 12","m":["c3a7","c6c7","g3h8"],"alts":[]},
      {"id":"Yj3oL","rating":1447,"themes":["crushing","defensiveMove","endgame","pawnEndgame","short"],"f":"8/5P1p/4k3/1K1p4/3P4/8/8/8 b - - 0 56","m":["d6g2","c1a1","g2d6"],"alts":[]},
      {"id":"i20Ru","rating":1458,"themes":["equality","middlegame","short"],"f":"Nnbk3r/pp3pp1/8/3P1qPp/3Q1P2/8/PP2B2K/R1B2R2 b - - 0 22","m":["g1e3","e8b5","e3b3"],"alts":[]},
      {"id":"4n2bP","rating":1470,"themes":["crushing","defensiveMove","endgame","knightEndgame","long"],"f":"8/8/1n2k1pp/3P4/5K1P/2N5/8/8 b - - 0 40","m":["c6h1","a3h1","d6h1","g7d3","h1d1"],"alts":[]},
      {"id":"595Ma","rating":1482,"themes":["crushing","defensiveMove","endgame","long","quietMove"],"f":"8/7K/6n1/3k4/8/7P/8/8 w - - 0 54","m":["e2b6","h1d6","e3e7","d6d2","b6b2"],"alts":[]},
      {"id":"KZfUP","rating":1493,"themes":["advancedPawn","clearance","crushing","defensiveMove","endgame","short"],"f":"8/4R3/5p2/7P/2b5/2kp4/5PP1/6K1 b - - 0 52","m":["h3h8","d2h2","a7h3"],"alts":[]},
      {"id":"8bMh2","rating":1505,"themes":["bishopEndgame","crushing","defensiveMove","endgame","short"],"f":"8/4kp2/2b1p3/1p1pP1Pp/1PpP2K1/2P5/2B5/8 w - - 0 33","m":["b7e1","d2g4","e1e6"],"alts":[]},
      {"id":"XVNf3","rating":1516,"themes":["equality","opening","short"],"f":"r2qk2r/pp1n1ppp/4p3/2bpn3/1P6/P1NQ1N1P/2P2PP1/R1B1K2R w KQkq - 0 13","m":["g3d1","a1g8","d5g8"],"alts":[]},
      {"id":"qUleP","rating":1528,"themes":["crushing","defensiveMove","endgame","queenRookEndgame","short"],"f":"5k2/pp1P2p1/2p4p/3p4/3q2P1/1P6/P5P1/4R1K1 w - - 3 31","m":["b5e5","h7g6","d5d4"],"alts":[]},
      {"id":"s0dUd","rating":1540,"themes":["advancedPawn","crushing","defensiveMove","endgame","exposedKing","fork","long","rookEndgame"],"f":"8/p3r1k1/3p2P1/5PK1/6P1/8/8/8 w - - 1 52","m":["g1g6","b2g4","g6d2","g4d2","b1e6"],"alts":[]},
      {"id":"s3z8W","rating":1551,"themes":["bishopEndgame","crushing","defensiveMove","endgame","veryLong"],"f":"8/5p2/2B1b3/k3P3/4K1p1/6P1/8/8 w - - 2 51","m":["a6h1","f1c1","h1d6","g2d6","d7g7","c1a1","g7b7","a1h1","b7g7"],"alts":[]},
      {"id":"0ecnA","rating":1563,"themes":["crushing","defensiveMove","endgame","exposedKing","long","rookEndgame"],"f":"8/8/8/4P3/3P4/kpR1Pr2/8/1K6 b - - 2 58","m":["g3g5","a3a5","g5a5","c5a5","f3f8"],"alts":[]}
    ]},
  "5-14":{"version":2,"src":"https://lichess.org/training/olrnk","focus":["rookEndgame"],"puzzles":[
      {"id":"olrnk","rating":1401,"themes":["advancedPawn","crushing","endgame","long","promotion","rookEndgame"],"f":"8/2K5/2RP3p/p2k2p1/1p3pP1/2r2P1P/8/8 w - - 9 50","m":["a6a3","c7a3","h6h2","a3a8","h2h4b"],"alts":[]},
      {"id":"MxXN9","rating":1422,"themes":["crushing","deflection","endgame","rookEndgame","veryLong"],"f":"8/8/3pk2r/5RKP/8/5P2/8/8 b - - 4 47","m":["e6e1","b1e1","d6g1","e1e7","g1g7","e7e3","g7g3"],"alts":[]},
      {"id":"v0nnH","rating":1447,"themes":["crushing","endgame","rookEndgame","short"],"f":"5rk1/1R1R1rp1/2p3p1/7p/P7/7P/6PK/8 w - - 5 31","m":["h2g2","g4g2","c2g2"],"alts":[]},
      {"id":"ppUSx","rating":1471,"themes":["endgame","mate","mateIn2","rookEndgame","short"],"f":"8/rk6/R1Rp3r/4p3/4P3/8/7P/6K1 w - - 2 40","m":["f6c6","c2f4","a6a4"],"alts":[]},
      {"id":"AraTX","rating":1493,"themes":["endgame","exposedKing","long","mate","mateIn3","rookEndgame"],"f":"8/2r2k1p/1R3P2/4PK2/8/2p5/1p6/8 w - - 0 41","m":["d1d6","g2b4","c6c4","a2a4","c4a4"],"alts":[]},
      {"id":"erz9l","rating":1518,"themes":["advancedPawn","crushing","endgame","rookEndgame","short"],"f":"8/8/2p1p2p/5Pk1/2r5/5R2/7P/6K1 w - - 0 42","m":["g1g6","b1b6","g6g2"],"alts":[]},
      {"id":"L55io","rating":1541,"themes":["endgame","exposedKing","long","mate","mateIn3","rookEndgame"],"f":"7k/1p1R4/2p3p1/p5K1/2r2P2/8/8/8 w - - 0 41","m":["b1b6","a7g7","h2h4","g7g4","h4g4"],"alts":[]},
      {"id":"5Repe","rating":1564,"themes":["crushing","discoveredAttack","endgame","master","rookEndgame","short"],"f":"8/4k3/r3p2R/2P2p2/3K1P1P/8/8/8 b - - 0 59","m":["d6d1","h7a3","f6e6"],"alts":[]},
      {"id":"uD9Nd","rating":1588,"themes":["crushing","endgame","long","rookEndgame"],"f":"8/4K3/4R3/3kP2r/8/8/8/8 b - - 7 59","m":["e1e2","d2g6","e2e6","g6g1","e6d6"],"alts":[]},
      {"id":"CbnKi","rating":1611,"themes":["advantage","endgame","rookEndgame","short"],"f":"8/1p5p/p4p2/Pk1pp1p1/1PrP2P1/3KP3/2R4P/8 w - - 3 35","m":["a8a7","h1a7","h3a3"],"alts":[]},
      {"id":"Oi2zz","rating":1635,"themes":["crushing","endgame","long","quietMove","rookEndgame","skewer"],"f":"r5k1/5pp1/4p3/1prpP1P1/p4P2/1P6/1PP1R3/2K4R w - - 0 30","m":["d8e8","b4g4","e8e4","g4d2","e4f4"],"alts":[]},
      {"id":"fy5NQ","rating":1658,"themes":["crushing","endgame","rookEndgame","short"],"f":"8/4k3/5R2/5KpP/7r/8/8/8 b - - 0 48","m":["e7g7","g1b1","g7g6"],"alts":[]},
      {"id":"55ol9","rating":1682,"themes":["advantage","endgame","rookEndgame","short"],"f":"8/4k3/2R5/4p1p1/4Pp1p/5P1P/1r4PK/8 w - - 12 49","m":["a6b6","c8c5","b6b1"],"alts":[]},
      {"id":"eqTpx","rating":1705,"themes":["endgame","mate","mateIn2","rookEndgame","short"],"f":"8/3r4/5R2/1pkpr3/1p2p2P/P1P1R1P1/2K5/8 w - - 0 40","m":["f3c7","a1a7","g6a6"],"alts":[]},
      {"id":"WXwjx","rating":1729,"themes":["crushing","endgame","long","rookEndgame","skewer"],"f":"7R/2p5/1p5P/p3K1k1/8/8/PP5r/8 w - - 1 43","m":["e4b4","b1e6","b4e4","e6b2","e4e8"],"alts":[]}
    ]},
  "5-15":{"version":2,"src":"https://lichess.org/training/eygmb","focus":["kingsideAttack","exposedKing"],"puzzles":[
      {"id":"eygmb","rating":1400,"themes":["advantage","kingsideAttack","master","middlegame","short"],"f":"r4rk1/p1p2ppp/1p1pb2q/5n2/3nNB2/P2B4/1PP1N1PP/3QR1KR b - - 1 21","m":["h7d8","h5d8","e6g7"],"alts":[]},
      {"id":"AWXor","rating":1412,"themes":["deflection","endgame","exposedKing","long","mate","mateIn3","queenRookEndgame"],"f":"5r2/p5k1/1p1p2p1/2pQ4/2P1R1R1/P1P3K1/5r1P/8 b - - 3 35","m":["g4g3","b3e7","g8e8","e7b1","e8e1"],"alts":[]},
      {"id":"pwlWx","rating":1425,"themes":["attraction","kingsideAttack","master","masterVsMaster","mate","mateIn2","middlegame","sacrifice","short"],"f":"1r3q1k/2r3pp/3pB1R1/5PRQ/p1P1p2P/Pp5K/1b3P2/8 w - - 0 37","m":["e1e2","e4e2","b1e1"],"alts":[]},
      {"id":"Wyo4y","rating":1437,"themes":["advantage","endgame","exposedKing","fork","long","sacrifice"],"f":"1k1r4/1p5p/6p1/8/RPnB4/3pP1PP/5P2/3K4 b - - 6 31","m":["h4h7","d3h7","a7c8","h5h8","c8f7"],"alts":[]},
      {"id":"ewmy9","rating":1449,"themes":["crushing","endgame","exposedKing","master","veryLong"],"f":"6Q1/8/8/p4N1p/3p1n2/3k3P/r7/5K2 b - - 0 57","m":["f8f5","g5g8","g7e3","g8g3","f5g5","g3b3","g5b5"],"alts":[]},
      {"id":"ecLf3","rating":1461,"themes":["crushing","endgame","kingsideAttack","short"],"f":"4rrk1/pp4p1/2p4p/4Rq1Q/3p4/3P1P2/PPP3PP/4R1K1 b - - 0 21","m":["g1e1","d1e1","d4d5"],"alts":[]},
      {"id":"bMBce","rating":1474,"themes":["exposedKing","long","mate","mateIn3","middlegame","pin"],"f":"k1b4r/1nP3pp/3P4/4r3/3B4/3q1B2/5PPP/1R4K1 w - - 3 40","m":["c5f5","d1f1","f5f1","h3f6","f1f6"],"alts":[]},
      {"id":"f3QY5","rating":1486,"themes":["advancedPawn","crushing","endgame","exposedKing","fork","long"],"f":"r7/B7/1Pkb1q2/3Rp1p1/2P5/6p1/4PP2/3R2K1 w - - 0 30","m":["h1h6","g6h6","h5h6","a6h6","c6c2"],"alts":[]},
      {"id":"DMrOB","rating":1499,"themes":["crushing","endgame","exposedKing","long"],"f":"5k2/7Q/1p6/p1b3PB/5q2/8/5PK1/8 w - - 1 50","m":["e2e4","g4d2","e4d4","d2h6","d4c4"],"alts":[]},
      {"id":"pHv0C","rating":1511,"themes":["advantage","attraction","exposedKing","long","middlegame","sacrifice","skewer"],"f":"8/1p1r1p2/pp3k2/n4bR1/8/b3P1P1/5PBP/5RK1 w - - 2 30","m":["b1g1","g6g1","b8e3","g1g6","e3h2"],"alts":[]},
      {"id":"DpduM","rating":1523,"themes":["endgame","exposedKing","long","mate","mateIn3"],"f":"1r6/5p1k/p2p2p1/3Pp3/4Q1P1/1qP4P/3R3R/K7 b - - 1 33","m":["c3f3","h8f8","f3a5","d7c5","c4c5"],"alts":[]},
      {"id":"d3ln9","rating":1535,"themes":["attraction","endgame","exposedKing","long","mate","mateIn3","sacrifice"],"f":"5r2/pp5k/3p2RP/2p2pQ1/3pq3/P7/1PP1rP2/1K6 w - - 3 30","m":["b6b2","e2e4","b2e2","e4e2","b1b2"],"alts":[]},
      {"id":"4I4OX","rating":1547,"themes":["advancedPawn","crushing","endgame","exposedKing","pawnEndgame","promotion","veryLong"],"f":"8/8/8/8/3p2P1/2k5/4K3/8 b - - 0 54","m":["a3a8","b7b1","h7h3","d8d3","h3h8","b1b6","h8h5b"],"alts":[]},
      {"id":"HkgVE","rating":1560,"themes":["kingsideAttack","mate","mateIn2","middlegame","pin","sacrifice","short"],"f":"r1b2rk1/pppp1ppp/8/8/2B4P/5Q2/P2q1PP1/2R1R1K1 w - - 0 17","m":["g3g2","g4g2","d5d4"],"alts":[]},
      {"id":"NIkeL","rating":1572,"themes":["crushing","discoveredAttack","endgame","kingsideAttack","long","sacrifice","skewer"],"f":"4r1k1/ppp3pp/3q1r2/4p3/2P1R3/1Q3p1P/PP3PP1/4R1K1 w - - 0 27","m":["a7a1","h6d6","d7d1","d6c3","d1d4"],"alts":[]}
    ]},
  "5-16":{"version":2,"src":"https://lichess.org/training/JMQsd","focus":["clearance","xRayAttack","discoveredAttack"],"puzzles":[
      {"id":"JMQsd","rating":1400,"themes":["clearance","crushing","defensiveMove","endgame","rookEndgame","veryLong"],"f":"8/1p6/p2Rrk2/1pP3p1/1P2r1P1/3R1K2/1P6/8 w - - 5 40","m":["h6d6","d7d6","h3h6","d6h6","a1h6","g6d6","g3d7"],"alts":[]},
      {"id":"wVjP2","rating":1412,"themes":["advantage","discoveredAttack","discoveredCheck","endgame","short"],"f":"8/8/p1r1nk2/4Rp1P/4nP2/4K3/PBp5/8 w - - 0 52","m":["d1a1","g6g2","a1a6"],"alts":[]},
      {"id":"ho3Tj","rating":1424,"themes":["clearance","mate","mateIn2","middlegame","sacrifice","short"],"f":"7r/3B4/Q2p1kp1/3P2qp/5pn1/7K/PP6/4RR2 b - - 0 34","m":["b7g8","g5g8","b1b3"],"alts":[]},
      {"id":"vAWR0","rating":1436,"themes":["clearance","long","mate","mateIn3","middlegame","sacrifice"],"f":"5rk1/p2Q1ppp/4p3/8/8/6b1/PPr1q1PP/3R1R1K w - - 2 20","m":["h2g2","g4g2","h5h4","g2g4","g5g4"],"alts":[]},
      {"id":"iTojR","rating":1448,"themes":["backRankMate","endgame","mate","mateIn2","short","xRayAttack"],"f":"1r4k1/Q4ppp/1r5q/8/4p3/2P3P1/5P1P/1R3RK1 w - - 0 33","m":["f2c4","c6c4","c5c4"],"alts":[]},
      {"id":"Yy5rP","rating":1461,"themes":["advantage","discoveredAttack","endgame","short"],"f":"8/p4p2/1p1p4/2pknK2/P4R2/R1P3r1/8/8 w - - 11 43","m":["a3a7","d1a7","f3b3"],"alts":[]},
      {"id":"nLIX7","rating":1473,"themes":["advantage","discoveredAttack","opening","pin","short"],"f":"rn2kb1r/pp2ppp1/2p2n2/4RNq1/8/2N4p/PPPP1PP1/R1BQ2K1 w kq - 0 13","m":["g1h6","d4h2","d1b1"],"alts":[]},
      {"id":"TYGwC","rating":1485,"themes":["clearance","kingsideAttack","mate","mateIn2","middlegame","short"],"f":"rq2k2r/pB3pp1/1p6/2b1n2p/6n1/1PN1PN1P/PB3PP1/2RQ1RK1 b kq - 0 17","m":["d1g3","b8g3","c4e8"],"alts":[]},
      {"id":"uHEsN","rating":1496,"themes":["advantage","discoveredAttack","fork","master","middlegame","short"],"f":"5r1k/pp2r1bp/6p1/2PQN1q1/3P1p2/2P4P/PR3BP1/1b4K1 w - - 0 29","m":["d1g2","d2g2","h1b1"],"alts":[]},
      {"id":"25etE","rating":1509,"themes":["discoveredAttack","discoveredCheck","endgame","mate","mateIn4","veryLong"],"f":"r1b4k/pp1p2pB/4pq2/2P4Q/1P6/P7/3K4/6b1 w - - 5 29","m":["e2b6","e4b4","e1e2","b4g4","e2e4","g4d2","e4d4"],"alts":[]}
    ]},
  "5-17":{"version":2,"src":"https://lichess.org/training/AikzT","focus":["equality","zugzwang","endgame"],"puzzles":[
      {"id":"AikzT","rating":1400,"themes":["crushing","defensiveMove","endgame","pawnEndgame","veryLong","zugzwang"],"f":"8/8/8/5k2/5p1p/4K2P/6P1/8 w - - 0 54","m":["d3g3","g1d1","g3b7","d1d7","b7e7","g7g3","b8g3"],"alts":[]},
      {"id":"IgEEL","rating":1408,"themes":["advantage","endgame","long","skewer"],"f":"8/4k3/1rB3R1/2R4p/4P3/5P1P/4K1P1/1r2b3 b - - 0 38","m":["c6c8","d8d3","d5g8","d3g7","g8a1"],"alts":[]},
      {"id":"ZzTJ3","rating":1416,"themes":["crushing","defensiveMove","endgame","long","queenEndgame","quietMove"],"f":"7k/2q1QKp1/7p/5P2/8/8/P7/8 b - - 12 59","m":["a2d2","g2d2","e6e1","d2h6","e1e7"],"alts":[]},
      {"id":"4vl2i","rating":1424,"themes":["advancedPawn","crushing","endgame","exposedKing","long"],"f":"6rk/pp3r2/2p1qPQB/4P3/3P4/8/PP4P1/6K1 w - - 3 33","m":["e6b2","b4b2","g6b2","g2b2","b6d6"],"alts":[]},
      {"id":"L8fEN","rating":1432,"themes":["advantage","endgame","fork","master","short"],"f":"7k/3R2b1/4N2p/1r6/3p3P/6P1/4KP2/8 b - - 1 42","m":["c1d1","d8h8","d1d6"],"alts":[]},
      {"id":"MkDLy","rating":1440,"themes":["advantage","endgame","long"],"f":"3r3k/pp1R3p/3p1ppP/2q5/3Q4/8/PPP2PP1/6K1 b - - 0 27","m":["h4h2","h7g6","e4b4","g6d6","h2g2"],"alts":[]},
      {"id":"772wv","rating":1448,"themes":["crushing","endgame","rookEndgame","short"],"f":"8/7p/4k3/4p1p1/3rPp2/1p1R1P2/1K4PP/8 w - - 2 39","m":["h3h7","d1h7","c8c3"],"alts":[]},
      {"id":"6RPKj","rating":1456,"themes":["crushing","endgame","pawnEndgame","veryLong","zugzwang"],"f":"8/8/5kp1/6pP/4K1P1/8/8/8 w - - 0 69","m":["e1e6","g6g2","d7d1","g2b4","d1g6","b4e4","g6b6"],"alts":[]},
      {"id":"srbAo","rating":1464,"themes":["crushing","endgame","rookEndgame","veryLong","zugzwang"],"f":"8/8/2kr1p1p/1p4p1/1P1RP1P1/3K3P/8/8 w - - 1 51","m":["h7h6","a6h6","h3h7","h6a6","d7d1","g6g1","b7g1"],"alts":[]},
      {"id":"2kR6e","rating":1472,"themes":["attraction","crushing","discoveredAttack","endgame","long","rookEndgame"],"f":"8/3k4/2RP1p2/p2Kpr2/8/8/PP3P2/8 b - - 0 43","m":["d1d7","h1d7","g1d1","d7g7","h2a6"],"alts":[]},
      {"id":"mZ4Tx","rating":1480,"themes":["crushing","endgame","long"],"f":"1r4k1/2q3pp/2p1p2Q/p1Pp4/P2P4/6RP/5PP1/6K1 b - - 7 33","m":["c4c5","b5e8","a2b3","e8b3","b2e6"],"alts":[]},
      {"id":"ZxRLV","rating":1489,"themes":["crushing","endgame","fork","long"],"f":"5k2/4R3/1q5p/4Np2/5P2/1p4PP/7K/8 w - - 4 42","m":["d1h2","g4d2","h2c6","c3c8","c6h1"],"alts":[]},
      {"id":"O7PN6","rating":1496,"themes":["crushing","defensiveMove","endgame","long","pawnEndgame","quietMove","zugzwang"],"f":"8/6p1/3k2p1/p3p3/Pp2P2P/1P1K2P1/8/8 w - - 2 37","m":["h3a7","h6a6","b3b7","b6b1","e7e1"],"alts":[]},
      {"id":"sldoD","rating":1504,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/p7/1p2pkp1/1P1p4/P2P1P2/2P2K2/8/8 b - - 6 40","m":["g6g1","g3b3","g1d7","b3b7","d7h3"],"alts":[]}
    ]},
  "5-18":{"version":2,"src":"https://lichess.org/training/OTKol","focus":["bishopEndgame","pawnEndgame","equality"],"puzzles":[
      {"id":"OTKol","rating":1416,"themes":["advancedPawn","bishopEndgame","crushing","endgame","long","promotion"],"f":"8/4P3/p1K5/P2P3b/2pk4/8/8/8 w - - 1 61","m":["h1h6","a7a3","h6h2","a3a8","h2h4b"],"alts":[]},
      {"id":"SJhNh","rating":1471,"themes":["bishopEndgame","crushing","endgame","short"],"f":"8/1p6/8/pPP4k/2P4P/1b5K/8/8 w - - 0 38","m":["a1a6","c2a6","c1c6"],"alts":[]},
      {"id":"mST1c","rating":1524,"themes":["bishopEndgame","crushing","endgame","short"],"f":"5k2/8/8/7B/pp2K2P/8/P7/8 b - - 1 53","m":["c7c3","f8c3","f7f3"],"alts":[]},
      {"id":"hzwDj","rating":1582,"themes":["bishopEndgame","crushing","defensiveMove","endgame","master","short"],"f":"8/4k3/4P2p/p2PPK1P/P7/2b5/8/8 w - - 5 52","m":["h1h6","d2d4","g1g6"],"alts":[]},
      {"id":"O2Ldk","rating":1640,"themes":["advancedPawn","bishopEndgame","crushing","endgame","long"],"f":"8/1p6/2p5/pPP2kBp/P1PK2pP/5p2/5P2/8 b - - 1 48","m":["b7b3","c1a6","c2a6","g8b3","g3g8"],"alts":[]},
      {"id":"CSiF6","rating":1696,"themes":["crushing","endgame","long","pawnEndgame","zugzwang"],"f":"8/4k3/p2p1p2/Pp1K2p1/1P2P2p/5P1P/6P1/8 b - - 0 39","m":["d2h2","h1h7","h2d6","h7d3","d6d1"],"alts":[]},
      {"id":"TilKK","rating":1749,"themes":["bishopEndgame","crushing","endgame","veryLong"],"f":"8/8/1p6/p1p3p1/P2k1p1p/5P1P/2K3P1/3B4 b - - 3 60","m":["h7d3","a8a5","d3g8","h5a8","g8b8","a8g1","b8g3"],"alts":[]},
      {"id":"eghkU","rating":1807,"themes":["bishopEndgame","crushing","endgame","long","master","quietMove"],"f":"3b4/k7/P1K5/1PP2ppp/6P1/5P2/7P/8 b - - 0 43","m":["e1b7","g3b7","g1g7","a6h2","g7g3"],"alts":[]},
      {"id":"1wJZc","rating":1862,"themes":["advancedPawn","bishopEndgame","crushing","endgame","long","promotion"],"f":"7B/8/8/3p1k2/P2Pp3/5P1p/1P3K2/8 b - - 1 39","m":["d7d3","g8d3","e3e8","e4d1","e8e5b"],"alts":[]},
      {"id":"c3TcF","rating":1918,"themes":["bishopEndgame","crushing","endgame","long"],"f":"8/8/2bPk3/1PP5/2PK4/p7/8/8 w - - 0 61","m":["h7a3","f3f8","a3c8","f8f5n","c8f5"],"alts":[]},
      {"id":"RgFkE","rating":1965,"themes":["bishopEndgame","crushing","endgame","master","short"],"f":"8/8/1PK1k3/2P4p/5b2/8/8/8 w - - 0 46","m":["a6c2","e1e7","a1a6"],"alts":[]},
      {"id":"tC4kS","rating":2032,"themes":["bishopEndgame","crushing","endgame","long","quietMove"],"f":"6k1/p6p/2P5/1P4p1/P4bP1/3p4/8/3K4 w - - 2 44","m":["f7f1","b4g2","c1c6","f2c6","f1f6"],"alts":[]},
      {"id":"6oUb5","rating":2087,"themes":["bishopEndgame","crushing","defensiveMove","endgame","long","quietMove"],"f":"8/1p5p/p2B2p1/P2p1p2/1P3P2/1k6/6PP/6K1 b - - 2 43","m":["h1h7","h6a1","h7h3","a1d3","c3a8"],"alts":[]},
      {"id":"MPu8a","rating":2145,"themes":["advancedPawn","bishopEndgame","crushing","endgame","long"],"f":"8/8/p2P4/1pK1k3/1P4b1/P7/1P6/8 w - - 2 49","m":["a1a6","d1d6","a6a2","b7e1","h6h2"],"alts":[]},
      {"id":"oTmDx","rating":2197,"themes":["bishopEndgame","crushing","endgame","long","quietMove","sacrifice"],"f":"8/7p/p1k2P2/2Pb2P1/1p5P/1P2K3/P7/8 w - - 1 46","m":["e7e1","a6a1","b1b6","e2b6","e1e6"],"alts":[]}
    ]}
};
;(function(){var F="abcdefgh",R="12345678",P="qrbn",f="fcahdgbe",r="58371624",p="bnqr";function m(x){var o="";for(var i=0;i<x.length;i++){var c=x.charAt(i);o+=i===4?P.charAt(p.indexOf(c)):i%2?R.charAt(r.indexOf(c)):F.charAt(f.indexOf(c));}return o;}function d(s){return String(s).split(" ").map(m).join(" ");}var h=window.ECA_HOMEWORK||{};for(var k in h){var ps=(h[k]&&h[k].puzzles)||[];for(var i=0;i<ps.length;i++){if(ps[i].m)ps[i].m=ps[i].m.map(d);if(ps[i].alts)ps[i].alts=ps[i].alts.map(d);}}})();

// ECA — homework.js (eca-v22): واجب الألغاز التفاعلي جوه المنصة
// الطالب بيحل مواقف الواجب على رقعة المنصة، بنحسب كام إجابة صح من أول محاولة، ويقدر يعيد الحل.
// الكوتش بيشوف النتيجة في «متابعة الطلاب»، والطالب بيشوفها جنب زر الواجب في الدروس.

// ===== لاعب الواجب =====
// ECA — لاعب الواجب (eca-v23): الطالب بيحل كل نقلة بنفسه (نقلة له ونقلة للخصم بالتبادل)،
// تلميح 3 مرات للواجب كله، عدّاد سلسلة 🔥 + عدّاد إجمالي، من غير زر «الحل».
// الجديد في v23: كل نقلة ليها 3 محاولات بس — لو غلط 3 مرات في نفس النقلة بنلعبها له
// تلقائيًا (بالتمييز) وبيكمّل الباقي بنفسه. التلميح بيتأكد إن القطعة موجودة فعلًا في مربعه.
let HWChess = null;
loadChessModule().then(m => { HWChess = m.Chess; if (tab === "homework") render(); }).catch(() => {});

const HW = { key: null, entry: null, i: 0, game: null, sol: [], alts: [], idx: 0, color: "w", flip: false,
             sel: null, last: null, flash: null, status: "play", wrongThis: false, firstTry: [], finished: false,
             hintsLeft: 3, freeHintsLeft: 3, bonusHintsLeft: 0, hintSaving: false, hintUsed: false, hint: null, streak: 0, maxStreak: 0, demoTimer: null,
             miss: 0, autoMsg: false };
const hwT = (ar, en) => lang === "en" ? en : ar;   // ترجمة محلية آمنة (من غير DICT عشان ما ندوش نصوص تانية)

function hwLessonTitle(key) {
  const p = String(key).split("-"), st = STEPS.find(x => x.step === Number(p[0]));
  const les = st && st.lessons[Number(p[1])];
  return les ? les.t : "Homework";
}
function hwEntry(key) { return (typeof window.ECA_HOMEWORK === "object") ? window.ECA_HOMEWORK[key] : null; }
function hwProgressRecord(u, key) {
  const record = u && u.hwp && u.hwp[key], entry = hwEntry(key);
  return record && entry && record.version === entry.version ? record : null;
}
function hwIsAutoComplete(u, key) {
  const record = hwProgressRecord(u, key), entry = hwEntry(key);
  const total = entry && entry.puzzles ? entry.puzzles.length : 0;
  return !!(record && total && Number(record.solved) > total / 2);
}

function openHomework(key) {
  if (HW.hintSaving) return toast(hwT("جارٍ تسجيل التلميح، انتظر لحظة.", "Saving the hint—please wait."));
  const viewer = currUser();
  if (viewer && viewer.role === "student" && !(viewer.att && viewer.att[key])) return hwLockedNotice();
  const e = hwEntry(key); if (!e) return;
  HW.key = key; HW.entry = e; HW.finished = false;
  go("homework"); hwStartAttempt();
}
function hwStartAttempt() {
  if (HW.hintSaving) return toast(hwT("جارٍ تسجيل التلميح، انتظر لحظة.", "Saving the hint—please wait."));
  clearTimeout(HW.demoTimer);
  const u = currUser(), purchasedHints = Math.max(0, Math.floor(Number(u && u.shop && u.shop.hints) || 0));
  HW.i = 0; HW.finished = false; HW.freeHintsLeft = 3; HW.bonusHintsLeft = purchasedHints; HW.hintSaving = false; HW.hintsLeft = 3 + purchasedHints; HW.streak = 0; HW.maxStreak = 0;
  const ps = (HW.entry && HW.entry.puzzles) || [];
  HW.firstTry = ps.map(() => true);
  if (ps.length) hwLoadPuzzle(); else HW.game = null;
  render();
}
function hwLoadPuzzle() {
  clearTimeout(HW.demoTimer);
  const p = HW.entry.puzzles[HW.i];
  let g = null; try { g = HWChess ? new HWChess(p.f) : null; } catch (_) {}
  HW.game = g; HW.sol = (p.m || []).slice(); HW.alts = (p.alts || []).slice();
  HW.idx = 0; HW.color = g ? g.turn() : "w"; HW.flip = HW.color === "b";
  HW.sel = null; HW.last = null; HW.flash = null; HW.status = g ? "play" : "error";
  HW.wrongThis = false; HW.hintUsed = false; HW.hint = null; HW.miss = 0; HW.autoMsg = false;
}
function hwClick(sq) {
  if (!HW.game || HW.status !== "play" || !HWChess) return;
  if (HW.idx % 2 === 1 || HW.idx >= HW.sol.length) return;   // دور الخصم (رد آلي) — استنى
  const mv = pickOrMove(HW, sq, HW.color);
  if (!mv) return render();
  // ترقية البيدق: اختيار القطعة زي Lichess بالظبط (Q N R B على الرقعة) — واختيار قطعة غير قطعة الحل بيتحسب غلط
  if (mv.promotion && promoNeeded(HW, mv.from, mv.to)) return promoShow(HW, mv.from, mv.to, pc => hwPlay(Object.assign(mv, { promotion: pc })));
  hwPlay(mv);
}
function hwPlay(mv) {
  let r = null; try { r = HW.game.move(mv); } catch (_) {}
  if (!r) return render();
  const u = r.from + r.to + (r.promotion || ""), want = HW.sol[HW.idx] || "";
  // لو الحل بيرقّي لقطعة محددة: لازم الطالب يختار نفس القطعة (زي Lichess) — غير كده مقارنة المربع بس
  const ok = (want.length === 5 ? u === want : u.slice(0, 4) === want.slice(0, 4))
    || (HW.idx === 0 && (HW.alts || []).some(a => a.slice(0, 4) === u.slice(0, 4)))
    || HW.game.isCheckmate();
  HW.last = [r.from, r.to]; HW.sel = null; HW.hint = null;
  if (!ok) {
    HW.miss++; HW.wrongThis = true;
    // غلط 3 مرات في نفس النقلة؟ بنلعبها له تلقائيًا وبيكمّل بنفسه
    if (HW.miss >= 3) {
      HW.status = "wrong"; HW.flash = { [r.to]: "bad" }; render();
      setTimeout(() => { if (HW.status === "wrong") hwAutoMove(); }, 750);
      return;
    }
    HW.status = "wrong"; HW.flash = { [r.to]: "bad" }; render();
    setTimeout(() => { if (HW.status !== "wrong") return; try { HW.game.undo(); } catch (_) {} HW.flash = null; HW.last = lastOf(HW.game); HW.status = "play"; render(); }, 750);
    return;
  }
  HW.idx++; HW.miss = 0; HW.autoMsg = false; HW.flash = { [r.to]: "good" };
  if (HW.idx >= HW.sol.length || HW.game.isCheckmate()) return hwSolved();
  render();
  hwOppReply();
}
// لعب النقلة الصح تلقائيًا بعد 3 أغلاط في نفس النقلة — وبعدين الطالب بيكمّل عادي
function hwAutoMove() {
  clearTimeout(HW.demoTimer);
  if (!HW.game || HW.status !== "play" && HW.status !== "wrong") return;
  try { HW.game.undo(); } catch (_) {}                    // تراجع الغلطة لو لسه مركّبة
  HW.flash = null; HW.sel = null; HW.hint = null;
  let r = null;
  try { r = uciMove(HW.game, HW.sol[HW.idx]); } catch (_) { return hwSolved(); }
  if (!r) return hwSolved();
  HW.last = [r.from, r.to]; HW.flash = { [r.to]: "good" };
  HW.idx++; HW.miss = 0; HW.autoMsg = true;
  if (HW.idx >= HW.sol.length || HW.game.isCheckmate()) { HW.status = "play"; return hwSolved(); }
  HW.status = "play"; render();
  hwOppReply();
}
// رد الخصم الآلي (نقلة من سطر الحل)
function hwOppReply() {
  clearTimeout(HW.demoTimer);
  HW.demoTimer = setTimeout(() => {
    if (!HW.game || HW.status !== "play" || HW.idx >= HW.sol.length) return;
    try { const r = uciMove(HW.game, HW.sol[HW.idx]); HW.last = [r.from, r.to]; } catch (_) { return hwSolved(); }
    HW.idx++;
    if (HW.idx >= HW.sol.length || HW.game.isCheckmate()) return hwSolved();
    render();
  }, 600);
}
// لغز اتحل — الحساب: من أول محاولة = لا غلط ولا تلميح في اللغز ده
function hwSolved() {
  clearTimeout(HW.demoTimer);
  const ft = !HW.wrongThis && !HW.hintUsed;
  HW.firstTry[HW.i] = ft;
  hwSaveProgress(HW.i + 1);
  if (ft) { HW.streak++; HW.maxStreak = Math.max(HW.maxStreak, HW.streak); }
  else HW.streak = 0;
  HW.status = "solved"; HW.flash = null; HW.sel = null; HW.hint = null;
  render();
  const game = HW.game, index = HW.i;
  HW.demoTimer = setTimeout(() => {
    if (tab === "homework" && HW.status === "solved" && HW.game === game && HW.i === index) hwNext();
  }, 2000);
}
function hwSaveProgress(solved) {
  const u = currUser(), total = HW.entry && HW.entry.puzzles ? HW.entry.puzzles.length : 0;
  if (!u || u.role !== "student" || !HW.key || !total) return;
  u.hwp = u.hwp || {};
  const prev = hwProgressRecord(u, HW.key) || {};
  const previousSolved = Number.isInteger(prev.solved) ? prev.solved : 0;
  u.hwp[HW.key] = Object.assign({}, prev, {
    solved: Math.min(total, Math.max(previousSolved, solved)),
    t: total,
    version: HW.entry.version,
    ts: Date.now()
  });
  save();
}
// التلميحات الإضافية تُستهلك من رصيد المتجر بعد التلميحات المجانية.
// حماية: لو مربع القطعة فاضي أو القطعة من لون غلط (بيانات بايظ) مننزلش التلميح خالص
async function hwHint() {
  if (!HW.game || HW.status !== "play" || HW.hintSaving || HW.hintsLeft <= 0 || HW.idx % 2 === 1 || HW.idx >= HW.sol.length) return;
  const pc = HW.game.get((HW.sol[HW.idx] || "").slice(0, 2));
  if (!pc || pc.color !== HW.color) { HW.status = "wrong"; render(); setTimeout(() => { if (HW.status === "wrong") { HW.status = "play"; render(); } }, 900); return; }
  if (HW.freeHintsLeft > 0) HW.freeHintsLeft--;
  else if (HW.bonusHintsLeft > 0) {
    if (!window.fbEconomy) return toast(hwT("الاتصال غير جاهز لاستخدام التلميح.", "Connection is not ready to use this hint."));
    let result;
    HW.hintSaving = true; render();
    try { result = await window.fbEconomy({ op: "spend-hint" }); }
    catch (error) {
      console.error("Homework hint use failed:", error);
      HW.hintSaving = false;
      render();
      return toast(hwT("تعذّر استخدام التلميح الإضافي.", "Could not use the extra hint."));
    }
    HW.hintSaving = false;
    if (!result.ok) { render(); return toast(hwT("لا توجد تلميحات إضافية متاحة.", "No extra hints are available.")); }
    HW.bonusHintsLeft--;
  } else return;
  HW.hintsLeft--; HW.hintUsed = true;
  HW.hint = (HW.sol[HW.idx] || "").slice(0, 2);
  render();
}
function hwNext() {
  clearTimeout(HW.demoTimer);
  HW.i++;
  if (HW.i >= (HW.entry.puzzles || []).length) return hwFinish();
  hwLoadPuzzle(); render();
}
function hwFinish() {
  const t = (HW.entry.puzzles || []).length, ft = HW.firstTry.filter(Boolean).length;
  const u = currUser();
  if (u && u.role === "student" && HW.key) {
    u.hwp = u.hwp || {};
    const prev = hwProgressRecord(u, HW.key);
    u.hwp[HW.key] = { ft, t, solved: t, att: ((prev && prev.att) || 0) + 1, version: HW.entry.version, ts: Date.now(), bs: HW.maxStreak };
    if (typeof markActiveDay === "function") markActiveDay(u);
    save();
  }
  HW.finished = true; render();
}
function hwRetry() { hwStartAttempt(); }
function hwExit() { clearTimeout(HW.demoTimer); go("lessons"); render(); }
// ثيم الرقعة جوه اللاعب — نفس الإعدادات العامة (ألوان Lichess + شكل القطع)
function hwSetTheme(l, d) { setBoardColor("l", l); setBoardColor("d", d); render(); }
function hwSetPieces(k) { setPieceSet(k); render(); }

function renderHomeworkPlayer(u) {
  const e = HW.entry;
  const hwBack = `<button onclick="hwExit()" class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">${hwT("← رجوع للدروس", "← Back to lessons")}</button>`;
  if (!e || !HW.key) return `<div class="max-w-xl mx-auto gold-card rounded-2xl p-8 text-center mt-6">
      <p class="text-sm text-gray-300">${hwT("افتح الواجب من صفحة الدروس — اضغط زر «Homework» جنب الدرس.", "Open the homework from the lessons page — tap the Homework button next to the lesson.")}</p>
      <div class="mt-4">${hwBack}</div></div>`;
  const title = hwLessonTitle(HW.key);
  const srcLink = `<a href="${esc(e.src)}" target="_blank" rel="noopener" class="text-[11px] text-sky-400 hover:underline">${hwT("عرض أول لغز على Lichess ↗", "View first puzzle on Lichess ↗")}</a>`;

  // واجب قراءة (مفيش موقف قابل للحل)
  if (e.reading || !e.puzzles || !e.puzzles.length) {
    return `<div class="max-w-xl mx-auto space-y-4 mt-4">
      <div class="gold-card rounded-2xl p-6 text-center space-y-3">
        <div class="text-xs text-gray-400">${hwT("واجب —", "Homework —")} ${esc(title)}</div>
        <h2 class="font-display font-bold text-xl gold-gradient-text">${hwT("الواجب ده للقراءة", "This homework is for reading")}</h2>
        <p class="text-xs text-gray-400">${hwT("الدرس ده واجبه شرح ومواقف على Lichess — افتحه وخلّي الكوتش يعلم لك إنك حللته.", "This lesson's homework is explanation & positions on Lichess — open it, and the coach will tick it for you.")}</p>
        <a href="${esc(e.src)}" target="_blank" rel="noopener" class="inline-block px-4 py-2 rounded-xl text-xs gold-btn">${hwT("فتح الواجب على Lichess ↗", "Open homework on Lichess ↗")}</a>
        <div>${hwBack}</div>
      </div></div>`;
  }

  // ملخص النتيجة بعد الخلاص
  if (HW.finished) {
    const t = e.puzzles.length, ft = HW.firstTry.filter(Boolean).length;
    const perfect = ft === t;
    return `<div class="max-w-xl mx-auto space-y-4 mt-4">
      <div class="gold-card rounded-2xl p-8 text-center space-y-4">
        <div class="text-5xl">${perfect ? "🏆" : "💪"}</div>
        <h2 class="font-display font-bold text-2xl ${perfect ? "text-emerald-300" : "text-yellow-300"}">${perfect ? hwT("برافو! الواجب كله صح من أول محاولة", "Bravo! All homework solved first try") : hwT("خلصت الواجب — ممكن أحسن", "Homework done — you can do better")}</h2>
        <div class="text-lg font-extrabold text-white">${hwT("النتيجة:", "Score:")} <span class="${perfect ? "text-emerald-300" : "text-yellow-300"}">${ft} ${hwT("من", "of")} ${t}</span> ${hwT("صح من أول محاولة", "correct on the first try")}</div>
        <div class="flex justify-center gap-2 text-xs font-bold">
          <span class="px-3 py-1 rounded-lg bg-orange-500/15 border border-orange-500/40 text-orange-300">🔥 ${hwT("أطول سلسلة", "Best streak")}: ${HW.maxStreak}</span>
          <span class="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">✓ ${hwT("حليت صح", "Solved correct")}: ${HW.firstTry.length ? HW.firstTry.filter(Boolean).length : 0}/${t}</span>
        </div>
        <p class="text-xs text-gray-400">${hwT("الكوتش هيشوف النتيجة في «متابعة الطلاب» — وتقدر تعيد الحل في أي وقت.", "The coach will see the result in the Students tracker — you can retry anytime.")}</p>
        <div class="flex flex-wrap justify-center gap-2 pt-2">
          <button onclick="hwRetry()" class="tap rounded-xl text-xs gold-btn">${hwT("↺ إعادة المحاولة", "↺ Retry")}</button>
          ${hwBack}
        </div>
        <div>${srcLink}</div>
      </div></div>`;
  }

  // شاشة الحل
  if (!HWChess) return `<div class="max-w-xl mx-auto gold-card rounded-2xl p-8 text-center mt-6">
      <p class="text-sm text-gray-300">${hwT("جاري تحميل مكتبة الشطرنج... لو اتفضلت كده طويل، اتأكد من الإنترنت.", "Loading the chess library... if it takes long, check your internet.")}</p>
      <div class="mt-3">${hwBack}</div><div class="mt-2">${srcLink}</div></div>`;
  if (!HW.game) return `<div class="max-w-xl mx-auto gold-card rounded-2xl p-8 text-center mt-6">
      <p class="text-sm text-red-300">${hwT("تعذّر تحميل موقف الواجب — افتحه على Lichess بدل كده.", "Could not load the homework position — open it on Lichess instead.")}</p>
      <div class="mt-3">${hwBack}</div><div class="mt-2">${srcLink}</div></div>`;

  const ps = e.puzzles;
  const u2 = currUser();
  const prevProgress = hwProgressRecord(u2, HW.key);
  const attN = prevProgress ? (prevProgress.att || 0) + 1 : 1;
  const tot = ps.length;
  // عدّاد واضح من أول لغز: الطالب يعرف من البداية عليه يحل كام لغز
  const doneN = Math.min(HW.i + (HW.status === "solved" ? 1 : 0), tot);
  const pct = tot ? Math.round((doneN / tot) * 100) : 0;
  const goalTxt = tot === 1 ? hwT("عليك حل لغز واحد", "1 puzzle to solve")
    : hwT("عليك حل", "You'll solve") + ` ${tot} ` + hwT("ألغاز", "puzzles");
  const hwThemeBtns = (typeof BOARD_THEMES !== "undefined" ? BOARD_THEMES : []).map(t => {
    const on = boardColors.l === t[1] && boardColors.d === t[2];
    return `<button onclick="hwSetTheme('${t[1]}','${t[2]}')" title="${t[0]}" aria-pressed="${on}" class="w-7 h-7 rounded-lg border ${on ? "border-yellow-400 ring-2 ring-yellow-400/40" : "border-yellow-500/30"}" style="background:linear-gradient(135deg, ${t[1]} 50%, ${t[2]} 50%)"></button>`;
  }).join("");
  const sideTxt = HW.color === "w" ? hwT("انت بالأبيض", "You are White") : hwT("انت بالأسود", "You are Black");
  const missChip = HW.miss > 0 && HW.status !== "solved" ? ` <span class="px-1.5 py-0.5 rounded-md bg-red-500/15 border border-red-500/40 text-red-300" dir="ltr">⚠ ${HW.miss}/3</span>` : "";
  const status = HW.autoMsg ? hwT("لعبنا لك النقلة الصح — كمّل الباقي بنفسك 💪", "We played the right move for you — keep going 💪")
    : HW.status === "wrong" ? hwT("مش دي النقلة — جرّب تاني", "Not this move — try again")
    : HW.status === "solved" ? (HW.firstTry[HW.i] ? hwT("صح! من أول محاولة ✓", "Correct! First try ✓") : hwT("صح! (بعد غلط أو تلميح)", "Correct! (after a wrong try or hint)"))
    : hwT("لاقي النقلات الصح —", "Find the correct moves —") + " " + sideTxt;
  const stCls = HW.status === "wrong" ? "text-red-300" : HW.status === "solved" ? "text-emerald-300" : "text-yellow-300";
  const solvedAll = HW.status === "solved";
  // عدّادات حيّة: 🔥 السلسلة (حل ورا بعض من أول محاولة) + ✓ إجمالي المحلول
  const liveStreak = (HW.wrongThis || HW.hintUsed) ? 0 : HW.streak;
  const hwHintBtn = `<button onclick="hwHint()" ${solvedAll || HW.hintSaving || HW.hintsLeft <= 0 || (HW.idx % 2 === 1) ? "disabled" : ""} title="${hwT("تشمل الرصيد المجاني والتلميحات التي اشتريتها من المتجر", "Includes free hints and hints bought from the shop")}" class="tap rounded-xl text-xs bg-zinc-900 border border-sky-500/40 text-sky-300 disabled:opacity-40">💡 ${hwT("تلميح", "Hint")} (${HW.hintsLeft})</button>`;
  return `
    <div class="max-w-5xl mx-auto grid lg:grid-cols-5 gap-5 mt-2">
      <div class="min-w-0 lg:col-span-3 space-y-3">
        <div class="gold-card rounded-2xl p-3 sm:p-4">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-bold text-yellow-300">🎯 ${goalTxt}</span>
            <span class="flex items-center gap-1.5 text-[11px] font-extrabold" dir="ltr">
              <span class="px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/40 text-orange-300">🔥 ${liveStreak}</span>
              <span class="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">✓ ${doneN}</span>
              <span class="text-white px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800">${HW.i + 1}/${tot}</span>
            </span>
          </div>
          <div class="h-2.5 rounded-full bg-black/60 border border-yellow-500/20 overflow-hidden mb-3" role="progressbar" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${doneN}">
            <div class="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-300" style="width:${pct}%"></div>
          </div>
          ${boardHTML({ game: HW.game, flip: HW.flip, sel: HW.sel, targets: targetsOf(HW.game, HW.sel), last: HW.last, flash: HW.flash, hint: HW.hint, onClick: "hwClick" })}
        </div>
        <div class="gold-card rounded-2xl p-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-gray-400">
          <span class="font-bold text-yellow-300">${hwT("ثيم الرقعة:", "Board theme:")}</span>
          ${hwThemeBtns}
        </div>
        <div class="gold-card rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-bold ${stCls}">${status}${missChip}</span>
          <div class="flex flex-wrap gap-2">
            ${hwHintBtn}
            <button onclick="hwNext()" ${!solvedAll ? "disabled" : ""} class="tap rounded-xl text-xs gold-btn disabled:opacity-40">${HW.i + 1 >= ps.length ? hwT("خلاص ✓", "Done ✓") : hwT("التالي ←", "Next →")}</button>
          </div>
        </div>
      </div>
      <div class="min-w-0 lg:col-span-2 space-y-4">
        <div class="gold-card rounded-2xl p-5 space-y-3">
          <h2 class="font-display font-bold text-lg gold-gradient-text">${hwT("واجب:", "Homework:")} ${esc(title)}</h2>
          <div class="flex flex-wrap gap-1.5 text-[11px]">
            <span class="px-2 py-0.5 rounded-lg bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">Step ${esc(String(HW.key).split("-")[0])}</span>
            <span class="px-2 py-0.5 rounded-lg bg-zinc-900 text-gray-300 border border-zinc-800">${hwT("لغز", "Puzzle")} ${HW.i + 1} ${hwT("من", "of")} ${ps.length}</span>
            <span class="px-2 py-0.5 rounded-lg bg-zinc-900 text-gray-300 border border-zinc-800">${hwT("محاولة رقم", "Attempt #")} ${attN}</span>
          </div>
          <div class="flex flex-wrap gap-1.5">${ps.map((_, j) => {
            const done = j < HW.i, cur = j === HW.i, ok = done && HW.firstTry[j];
            return `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border ${cur ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-200" : ok ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300" : done ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300" : "bg-zinc-900 border-zinc-800 text-gray-500"}">${ok ? "✓" : j + 1}</span>`;
          }).join("")}</div>
          <p class="text-[11px] text-gray-400">${hwT("حل كل لغز بكل النقلات: نقلة لك ونقلة للخصم بالتبادل لحد الحل. لكل نقلة 3 محاولات بس — لو غلطت 3 مرات بنلعبها لك وبتكمّل. إجابتك من أول محاولة (من غير غلط ولا تلميح) هي اللي بتتحسب — وعندك 3 تلميحات بس للواجب كله. تقدر تعيد الواجب في أي وقت.", "Solve each puzzle with ALL its moves — yours and the opponent's alternate until it's done. Each move allows just 3 tries — after 3 wrong tries we play it for you and you carry on. Only a clean first attempt (no wrong move, no hint) counts — and you have just 3 hints for the whole homework. You can redo it anytime.")}</p>
          <div>${srcLink}</div>
        </div>
        ${u2 && u2.role === "student" && prevProgress ? `<div class="gold-card rounded-2xl p-4 text-center">
          <div class="text-lg font-extrabold text-emerald-300">${prevProgress.ft}/${prevProgress.t}</div>
          <div class="text-[11px] text-gray-400">${hwT("أفضل نتيجة مسجّلة — صح من أول محاولة", "Best recorded score — correct on the first try")}</div>
        </div>` : ""}
        <div class="lg:hidden">${hwBack}</div>
      </div>
    </div>`;
}
