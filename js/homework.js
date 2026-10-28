// ECA — homework.js (eca-v23): بيانات واجب الألغاز
// المصادر: أول لغز = موقف الكوتش من فصل الواجب على Lichess (المستخرج في eca-v20) + تعبئة من قاعدة ألغاز Lichess الرسمية
// مفلترة بثيم الدرس + نطاق مستوى الـ Step — FEN الموضع مصحّح (بعد نقلة الخصم مباشرة) (scripts: hw3-select.py → hw3-build.js)
// f = FEN (على الحَلّاب أن يتحرك)، m = سطر الحل UCI (نقلات الطالب والخصم بالتبادل — تُبدأ وتُنهى بنقلة الطالب)
window.ECA_HOMEWORK = {"1-0":{"src":"https://lichess.org/study/jjMNw6GF/wWxeB9BO","puzzles":[{"f":"r1b2rk1/ppp2ppp/8/2bP4/7q/1BNQ4/PPP3PP/R1B1R2K b - - 2 15","m":["h4e1","d3f1","e1f1"],"alts":[]},
{"f":"6k1/R5Np/8/5p2/5P2/5RP1/P2r3n/5BK1 b - - 0 32","m":["h2f3","g1h1","d2h2"],"alts":[]},
{"f":"1rbr2k1/ppN2ppp/3p4/4R2q/8/1B4Q1/PPP2PPP/3R2K1 b - - 0 19","m":["h5d1","e5e1","d1e1"],"alts":[]},
{"f":"2r1k3/2p1rpp1/1p1p1b1B/p2P1P1P/P1P5/3K4/5PR1/6R1 b - - 0 30","m":["g7h6","g2g8","e8d7","g8c8","d7c8"],"alts":[]},
{"f":"1Q1q1k2/1p3pp1/p1p4p/4P3/PP3PP1/7P/8/6K1 w - - 4 31","m":["b8d8"],"alts":[]},
{"f":"r3kb1r/pp1q1ppp/4p3/4PR2/3pN3/2P4P/PP4P1/R1BQ2K1 b kq - 0 15","m":["e6f5","e4d6","f8d6"],"alts":[]},
{"f":"r2r2k1/pp2bppp/2N1p3/3q4/3P4/P3B2P/1P3PP1/R2b1RK1 w - - 0 16","m":["c6e7","g8h8","e7d5"],"alts":[]},
{"f":"3qr1k1/1r1nbpp1/p1p4p/3p4/N1P5/BP3Q1P/P1P2PP1/R3R1K1 b - - 0 19","m":["e7a3","e1e8","d8e8"],"alts":[]},
{"f":"1r4k1/6p1/5Q1p/1p3p2/2pn4/8/PbP1BPPP/1R3RK1 b - - 0 24","m":["d4e2","g1h1","b2f6"],"alts":[]},
{"f":"rn2k2r/pp1q1ppp/3bbn2/2pB2N1/8/6P1/PPPP1P1P/RNBQR1K1 b kq - 0 9","m":["f6d5","g5e6","f7e6"],"alts":[]},
{"f":"3rB1k1/p2n4/1pp1p2p/5pb1/2P5/P2n1R2/6PB/5R1K w - - 0 36","m":["f3d3","d8e8","d3d7"],"alts":[]},
{"f":"1r3rk1/pp1nqppp/5n2/2p1N3/2b2PP1/P1N1Q2P/1P4B1/R4RK1 w - - 5 20","m":["e5c4","e7e3","c4e3"],"alts":[]}]},"1-1":{"src":"https://lichess.org/study/48k26G0o/gvaJW7s5","puzzles":[{"f":"r2qk2r/pp2bBpp/2n5/4p3/6b1/2P2N2/P4PPP/R1BQ1RK1 b kq - 0 13","m":["e8f7","f3g5","e7g5"],"alts":[]},
{"f":"5rk1/5p2/1p3Q1p/4p1p1/8/2P1PB1P/Pq3PPB/R5K1 b - - 0 22","m":["b2a1","f3d1","a1d1"],"alts":[]},
{"f":"8/8/2R5/2k4P/8/5PK1/2p3P1/8 b - - 2 59","m":["c5c6","h5h6","c2c1q"],"alts":[]},
{"f":"8/pk1r2R1/1p2b3/8/2P2N2/1P6/1K6/8 w - - 22 61","m":["f4e6","d7g7","e6g7"],"alts":[]},
{"f":"3r2rk/p5pp/Bp6/3b1p2/P3p2P/6P1/3q1PK1/2RQR3 w - - 0 28","m":["d1d2","e4e3","d2d5"],"alts":[]},
{"f":"5Bk1/1p1r3p/8/p4N2/1nP1p3/1P6/5RPP/3R3K b - - 0 38","m":["d7d1","f2f1","d1f1"],"alts":[]},
{"f":"6k1/1p3pp1/p6p/4Q3/1P2P3/2P2K2/7q/3RR3 b - - 0 29","m":["h2e5","d1d8","g8h7"],"alts":[]},
{"f":"r2qr1k1/pp4pp/5bn1/3N2N1/Q4Bb1/8/PP1R1PPP/4R1K1 b - - 0 19","m":["e8e1"],"alts":[]},
{"f":"5rk1/pp5p/2pN2p1/2P1n3/5Pq1/1P5b/P4RB1/Q5K1 w - - 3 25","m":["a1e5","h3g2","f2g2"],"alts":[]},
{"f":"r1b3k1/5rpp/p1n1Np2/1p1n4/2pPBq2/2P2N2/PP3PPP/R2QR1K1 b - - 2 18","m":["c8e6","e4h7","g8h7"],"alts":[]},
{"f":"2R2rk1/5pp1/p5np/b2p4/3P4/Pq1BPN2/1P3QPP/3R2K1 b - - 0 26","m":["b3d1","f2f1","d1f1","g1f1","f8c8"],"alts":[]},
{"f":"2k4r/2p2pp1/pnp1p2p/2q1P2P/4bPP1/1QNr4/PP6/1KBR3R w - - 0 21","m":["c3e4","d3b3","e4c5"],"alts":[]}]},"1-2":{"src":"https://lichess.org/study/C4BqIzIc/HO9ETmkV","puzzles":[{"f":"2k2n1r/prp3pp/8/Q1RP4/2N1Pq2/P7/1P3PPP/2R3K1 b - - 4 28","m":["f4c1","a5e1","c1e1"],"alts":[]},
{"f":"r4k1r/pppq1p2/3pb2p/6p1/2nQ4/8/PPP2PPP/R4RK1 w - - 0 17","m":["d4h8","f8e7","h8a8"],"alts":[]},
{"f":"1r3rk1/5ppp/4b3/Q7/2P1Pp2/P3bP2/R5PP/1N2KB1R b K - 0 18","m":["b8b1","e1e2","e6c4"],"alts":[]},
{"f":"4r1k1/pppq2b1/2bp1Npp/5p2/2P4N/7P/PP1BQPP1/4R1K1 b - - 1 24","m":["g7f6","e2e8","d7e8","e1e8","c6e8"],"alts":[]},
{"f":"1r5k/5pb1/nrbRp1pp/1Np1P3/p1P1NB1P/P7/1P3PP1/2KR4 b - - 7 29","m":["c6e4","d6b6","b8b6"],"alts":[]},
{"f":"2r1k3/5q2/1ppQ2n1/4p3/4P1p1/2P2pP1/PP1N3r/R4R1K w - - 0 27","m":["h1h2","c8d8","d6c6"],"alts":[]},
{"f":"7k/1p1rp1bp/pB4p1/4rp2/P4Q2/2P4P/1P3PP1/4R1K1 b - - 1 34","m":["e5e1","g1h2","g7e5","f4e5","e1e5"],"alts":[]},
{"f":"r5k1/2p2p1p/1pB3p1/8/6P1/qP1b4/P1QRr2P/1K5R w - - 4 25","m":["c2d3","e2d2","d3d2"],"alts":[]},
{"f":"r1b1kbnr/pp1n1ppp/3p4/qBp2N2/4P3/2P5/PP3PPP/RNBQK2R b KQkq - 0 7","m":["a5b5","f5d6","f8d6"],"alts":[]},
{"f":"6k1/p4p2/8/1rp3p1/R1P3r1/P1K5/2B5/8 w - - 0 42","m":["c4b5","g4a4","c2a4"],"alts":[]},
{"f":"1q2nr1k/5p1p/4NP2/p7/7Q/4p3/1PP3PP/1K6 w - - 0 33","m":["e6f8","e8f6","h4f6"],"alts":[]},
{"f":"r7/3n2pp/2pkp3/1p2p3/1P2P1P1/1p2KP2/2P1N2P/R7 w - - 0 25","m":["a1a8","b3b2","e2c3"],"alts":[]}]},"1-3":{"src":"https://lichess.org/study/TCt9XgBc/hgBwh3xP","puzzles":[{"f":"7k/p7/5p2/3P4/8/6P1/1P6/7K w - - 0 1","m":["b2b4","f6f5","b4b5","a7a5","b5a6"],"alts":[]},
{"f":"8/5ppk/7p/2pr4/4p3/4P3/1Qp2PPP/R5K1 b - - 2 36","m":["d5d1","a1d1","c2d1q"],"alts":[]},
{"f":"8/1k6/p7/3Q3P/p2K1P2/1q6/8/8 b - - 5 55","m":["b3d5","d4d5","a4a3","h5h6","a3a2"],"alts":[]},
{"f":"8/6p1/5p1p/R2b2kP/6P1/1r3PK1/8/8 w - - 5 62","m":["a5d5","f6f5","d5f5"],"alts":[]},
{"f":"R1b3k1/4pp2/3p2p1/2pP3p/2P1PP2/2Q2B1P/5qPK/1r6 w - - 0 28","m":["a8c8","g8h7","c3h8"],"alts":[]},
{"f":"r2q2rk/pp3p1n/2p1b2b/3p3P/3P1Q2/2NB1P2/PPP3P1/2KR3R w - - 3 22","m":["f4h6","d8g5","h6g5"],"alts":[]},
{"f":"8/6B1/8/1p4pp/1Pp3P1/5P1k/4K2b/8 w - - 0 52","m":["g4h5","h3h4","h5h6","h4h5","h6h7"],"alts":[]},
{"f":"8/8/8/6KP/p7/1k6/8/8 w - - 1 51","m":["h5h6","a4a3","h6h7","b3c2","h7h8q"],"alts":[]},
{"f":"r5k1/2PR1ppp/8/8/7P/8/P3pqPK/8 w - - 0 34","m":["d7d8","a8d8","c7d8q"],"alts":[]},
{"f":"6k1/1Q4p1/p1p4p/3pP3/P3bq2/2N4P/1P4P1/5B1K b - - 2 26","m":["f4f1","h1h2","f1g2"],"alts":[]},
{"f":"r1bq1rk1/p4pbp/5np1/4p1B1/3pN3/8/PPPQBPPP/2R2RK1 b - - 1 14","m":["f6e4","g5d8","e4d2"],"alts":[]},
{"f":"4r2k/p4r1p/2pp1b2/2p5/5P2/3P2R1/PqPB2PP/4RK2 w - - 0 22","m":["e1e8","f7f8","e8f8"],"alts":[]},
{"f":"8/pb3k2/3P4/3N2p1/4p3/2K4P/8/8 w - - 2 46","m":["d6d7","b7d5","d7d8q"],"alts":[]},
{"f":"8/2Q2pkp/6p1/8/4Pp2/7P/r1p3P1/7K b - - 1 40","m":["a2a1","h1h2","c2c1q","c7c1","a1c1"],"alts":[]},
{"f":"8/8/p2K3p/5p1P/P3k3/2P5/8/8 b - - 1 43","m":["f5f4","c3c4","f4f3","c4c5","f3f2","c5c6","f2f1q"],"alts":[]}]},"1-4":{"src":"https://lichess.org/study/RPFaVRku/LErAf9Dq","puzzles":[{"f":"r1q2rk1/3b2pp/pnp5/P2p4/1P1Pp3/1QN1P3/3B1PPP/1R3RK1 b - - 0 1","m":["b6c4"],"alts":[]},
{"f":"3r1r2/8/2Q1k1p1/3ppq2/8/2P3P1/PP3PK1/3R3R b - - 1 38","m":["d8d6","c6d6","e6d6"],"alts":[]},
{"f":"8/8/8/6p1/5KPk/8/8/8 w - - 0 81","m":["f4f5","h4h3","f5g5"],"alts":[]},
{"f":"k6r/1b5p/6p1/1P6/3Q1P2/PP2R3/3K3q/8 w - - 0 32","m":["e3e2","h2e2","d2e2"],"alts":[]},
{"f":"8/8/p1k3p1/P1P2P2/2K4p/7P/8/8 b - - 0 51","m":["g6f5","c4d4","f5f4"],"alts":[]},
{"f":"8/8/8/1p5p/1P3P1k/4K3/8/8 b - - 0 61","m":["h4g4","e3e4","h5h4"],"alts":[]},
{"f":"8/3K4/r7/6k1/6p1/6Pp/3R3P/8 w - - 3 55","m":["d2d5","g5g6","d5d6","a6d6","d7d6","g6f6","d6d5","f6f5","d5d4"],"alts":[]},
{"f":"8/1p5p/1Q5k/6p1/8/6Pq/PP1r3P/2R3K1 b - - 1 42","m":["h6h5","b6f2","d2f2"],"alts":[]},
{"f":"8/5rk1/4K1p1/3R2P1/8/8/8/8 w - - 10 70","m":["d5d7","f7d7","e6d7","g7f7","d7d6"],"alts":[]},
{"f":"8/1p3k2/p2p1np1/3P4/1P2BP2/5K2/P7/8 b - - 5 38","m":["f6e4","f3e4","f7f6"],"alts":[]},
{"f":"2Q4k/6p1/8/2p1q2P/1p1bPr2/1P1R3K/P5R1/8 b - - 3 37","m":["h8h7","c8g4","f4g4"],"alts":[]},
{"f":"8/8/5r2/1p1pBk2/p1pP4/P1P2K2/1P6/8 w - - 0 47","m":["e5f6","f5f6","f3f4"],"alts":[]},
{"f":"7k/p4pp1/8/1q1p3n/6B1/P7/2QB1PPb/5K2 w - - 1 30","m":["g4e2","h5g3","f2g3"],"alts":[]},
{"f":"4rbk1/3n3p/3p2p1/3Pp3/2p1P1P1/P1q1BP2/7Q/4K2R w K - 0 27","m":["e3d2","c3a1","e1e2","a1h1","h2h1"],"alts":[]},
{"f":"8/p6p/6p1/1P2p3/Pk2K3/5P2/6PP/8 b - - 5 34","m":["b4a4","e4e5","a4b5","f3f4","a7a5"],"alts":[]}]},"1-5":{"src":"https://lichess.org/study/LJzsX2Bb/1o4kmKsF","puzzles":[{"f":"2k5/1pp4p/p1n5/6r1/8/2B5/PP3P1P/5RK1 w - - 0 1","m":["g1h1"],"alts":[]},
{"f":"2r4k/1p4pp/p4p2/P2pp3/1P6/3RP3/5PPP/2R3K1 b - - 0 32","m":["c8c1","d3d1","c1d1"],"alts":[]},
{"f":"r4rk1/pp3pbp/5pp1/7q/1Q1PP1P1/3B1N2/PP1B1P2/R3K2R b KQ - 0 18","m":["h5h1","e1e2","h1a1"],"alts":[]},
{"f":"4R3/4k2P/8/8/2pB4/2P5/p6r/2K5 b - - 3 51","m":["e7e8","h7h8r","h2h8"],"alts":[]},
{"f":"5rk1/Q4ppp/3R4/1N2p1b1/4P3/5q1P/PPP2P2/1K5R b - - 0 20","m":["f3h1","d6d1","h1d1"],"alts":[]},
{"f":"r4rk1/1p3pp1/p3bR1p/2q1p3/3nP3/P1BB2QP/1PP3PN/R5K1 b - - 0 19","m":["d4e2","g1f1","e2g3"],"alts":[]},
{"f":"r4rk1/1p3ppp/p1q2n2/P2p4/3b2b1/1B1P4/1P2NPPP/R1BQ1RK1 w - - 0 16","m":["e2d4","g4d1","d4c6"],"alts":[]},
{"f":"8/8/5p2/4bPpP/3pp1B1/2kn3K/P7/6Q1 b - - 1 49","m":["d3f4","h3g3","f4e2","g3g2","e2g1"],"alts":[]},
{"f":"3r4/pR4p1/2p2N1k/4p2p/2B1Pn1N/1P6/P1P2PPP/3R2K1 b - - 0 31","m":["d8d1","c4f1","f4e2","g1h1","d1f1"],"alts":[]},
{"f":"r5k1/p3rppb/7p/1ppQn1q1/3p4/P2P4/BPP1N3/R3K2R w KQ - 2 24","m":["d5a8","e7e8","a8e8"],"alts":[]},
{"f":"r4rk1/ppp5/2b2pN1/3q4/3PnpQ1/2P5/PP4P1/R3R1K1 w - - 0 21","m":["g6e7","g8f7","e7d5"],"alts":[]},
{"f":"2b1rr1k/3q2pB/p1p5/PpPp4/1P1b1Np1/8/2Q2P1P/R4RK1 w - - 0 22","m":["f4g6","h8h7","g6f8","h7g8","f8d7"],"alts":[]},
{"f":"2r3k1/2q2pb1/p5p1/3pp3/1P5Q/1b6/2B2P1P/R1R3K1 w - - 0 37","m":["c2b3","c7c1","a1c1","c8c1","g1g2"],"alts":[]},
{"f":"8/5r1k/p1qQp1pp/2p5/2P3P1/6B1/1P3P1n/2R2K2 w - - 0 33","m":["g3h2","c6h1","h2g1"],"alts":[]},
{"f":"r1b2rk1/1p2bppp/pqnp4/3Np3/2B1PP2/PN6/1PP2nPP/R1BQ1RK1 b - - 6 13","m":["f2h3","g1h1","b6g1","f1g1","h3f2"],"alts":[]}]},"1-6":{"src":"https://lichess.org/study/2HFYM7LI/iNAIUMgw","puzzles":[{"f":"6rk/8/2K2p2/8/7p/8/8/2Q5 w - - 0 1","m":["c1h6"],"alts":["c1c5"]},
{"f":"rnb1k1nr/1ppp1ppp/8/p1bPp3/4P2q/2PB1N2/PP3PPP/RNBQK2R b KQkq - 4 6","m":["h4f2"],"alts":[]},
{"f":"6k1/5ppp/5Bq1/8/p3R3/P6P/5rB1/R5K1 w - - 0 30","m":["e4e8"],"alts":[]},
{"f":"r1b1kb1Q/ppp4p/6pB/3P4/2pn4/8/PPP1qPPP/RNK4R b q - 3 13","m":["e2c2"],"alts":[]},
{"f":"5kr1/ppR3p1/3R3p/1n6/1r6/8/1P3PPP/2K5 w - - 5 32","m":["d6d8"],"alts":[]},
{"f":"3r1k1r/p1p2pp1/1p6/2pQ1b2/2Pn1P2/8/PP1P1KBq/R1B1R3 w - - 4 26","m":["d5d8"],"alts":[]},
{"f":"4r3/3R1pkp/6p1/1P6/1b6/5B2/1P1R1PPP/6K1 b - - 0 36","m":["e8e1"],"alts":[]},
{"f":"rn2kb1r/pQ2pppp/2p2n2/8/3q2b1/8/PPP2PPP/RNB1KBNR b KQkq - 0 7","m":["d4d1"],"alts":[]},
{"f":"2k4r/pp3pp1/4pn2/2np2p1/8/1B1P1Pq1/PPPN3R/R2Q3K b - - 7 20","m":["g3h2"],"alts":[]},
{"f":"r1bk3r/ppp1np1p/3P2pP/1N4q1/2BP1n2/8/PPP3P1/R1BQ2KR b - - 0 14","m":["g5g2"],"alts":[]},
{"f":"7k/1pq3p1/2p2r1p/3pPQ2/1p1P4/7P/1rB4K/5R2 w - - 0 36","m":["f5h7"],"alts":[]},
{"f":"q5kr/p4p2/4b1p1/4B2p/5n2/2P5/P1Q2PPP/3R1RK1 b - - 0 21","m":["a8g2"],"alts":[]},
{"f":"4r1k1/2Q4p/pp6/2p2n2/P2P1P1q/2P4P/2PB2b1/4R1K1 w - - 0 30","m":["e1e8"],"alts":[]},
{"f":"r3k2r/ppp2p1p/2n1pp2/7q/2PN2P1/2BP2b1/PP2B1P1/R2Q1RK1 b kq - 0 16","m":["h5h2"],"alts":[]},
{"f":"2r4k/5p2/4pNp1/6Pp/qQ5P/7r/2P5/1RKN4 b - - 3 37","m":["c8c2"],"alts":[]}]},"1-7":{"src":"https://lichess.org/study/WakS7KEt","puzzles":[{"f":"6k1/1p3ppp/nq3b2/8/2Q5/BP5P/r4PP1/4R1K1 w - - 0 1","m":["e1e8"],"alts":[]},
{"f":"r5k1/pp3ppp/8/3p4/2qP4/4R2P/2P1QPPK/8 w - - 2 22","m":["e3e8","a8e8","e2e8"],"alts":[]},
{"f":"5rk1/p2q2p1/1p2p1Np/3p3P/3Pb1P1/2P5/PP3R2/6K1 w - - 0 34","m":["f2f8","g8h7","f8h8"],"alts":[]},
{"f":"5rk1/3Q1p2/5p1p/2q5/8/8/P1r2PPP/3RR1K1 b - - 5 23","m":["c5f2","g1h1","f2g2"],"alts":[]},
{"f":"rn1qr1k1/1p3ppp/2p2b2/p2p4/3P4/2N2N2/PPP1QPPP/2KRR3 w - - 0 13","m":["e2e8","d8e8","e1e8"],"alts":[]},
{"f":"3r2k1/pp3ppp/2p3b1/2n3P1/2B2q1P/5N2/PPP1QP2/4R1K1 w - - 0 24","m":["e2e8","d8e8","e1e8"],"alts":[]},
{"f":"8/5p2/1R6/6pk/8/3r2PP/5K2/8 w - - 4 41","m":["g3g4","h5h4","b6h6"],"alts":[]},
{"f":"r3kb1r/4ppp1/3q2p1/p2p4/Pp1PN3/8/1PP1QPPP/R1B1R1K1 b kq - 0 17","m":["d6h2","g1f1","h2h1"],"alts":[]},
{"f":"8/1p2rppk/5q1p/Q4R2/2P5/PP5P/5PP1/5K2 b - - 0 32","m":["f6a1","a5e1","e7e1"],"alts":[]},
{"f":"r6r/1bpnk3/1p1pB3/pP1P4/P3PQP1/2b2N1q/2P2P2/R3R1K1 w - - 0 25","m":["f4f7","e7d8","f7d7"],"alts":[]},
{"f":"3r1r1k/p6p/1p4pP/2p5/2PbBQ2/2q5/P1P1K3/5R2 w - - 1 35","m":["f4f8","d8f8","f1f8"],"alts":[]},
{"f":"6nr/1pN2ppp/p2Qbk2/4p3/3Bq3/8/PP2BPPP/5K1R b - - 0 19","m":["e4b1","e2d1","b1d1"],"alts":[]},
{"f":"4r1k1/p4p1p/1p6/6B1/3P2n1/P4Q2/1P4P1/7K b - - 0 34","m":["e8e1","f3f1","e1f1"],"alts":[]},
{"f":"6k1/3P1pp1/4p3/p7/3QR3/3q1PP1/1P3PK1/2r5 b - - 1 37","m":["d3f1","g2h2","f1h1"],"alts":[]},
{"f":"1r4k1/p4ppp/4p3/p5n1/4P3/1P3PPq/QB3N1P/R5K1 b - - 0 30","m":["g5f3","g1h1","h3h2"],"alts":[]}]},"1-8":{"src":"https://lichess.org/study/8XJxZK1c/g0194InP","puzzles":[{"f":"6k1/pb2r1pN/1n4Bp/3p4/1P2pR2/P7/5PPP/2rR2K1 b - - 3 30","m":["c1d1"],"alts":[]},
{"f":"6k1/5pp1/p1N5/1n1b3p/1B4P1/P4P1P/2K5/8 w - - 3 43","m":["c6e7","g8h7","e7d5"],"alts":[]},
{"f":"4r1k1/2p1qpp1/3p4/1p1P2PQ/1P6/3R3P/2PBrb2/5RK1 w - - 7 27","m":["f1f2","e2f2","g1f2"],"alts":[]},
{"f":"R7/5pk1/4pn1p/8/3NP3/5P2/6PP/2rB2K1 b - - 0 31","m":["c1d1","g1f2","d1d4"],"alts":[]},
{"f":"3r2k1/1B3p1p/6p1/3N4/3p2r1/8/5KP1/3R4 w - - 0 36","m":["d5f6","g8g7","f6g4"],"alts":[]},
{"f":"r5r1/pp1k1p2/2p5/3pQ3/3P4/2NB4/PPP2q2/1K6 w - - 2 29","m":["d3f5","f2f5","e5f5"],"alts":[]},
{"f":"r5k1/1p1r1pp1/p3pnp1/2qN4/8/1Q5P/PP3PP1/3RR1K1 w - - 0 25","m":["d5f6","g7f6","d1d7"],"alts":[]},
{"f":"r2qr1k1/b1p2ppp/p5n1/P1p1p3/4P1n1/B2P2Pb/3NBP1P/RN1QR1K1 w - - 0 17","m":["e2g4","h3g4","d1g4"],"alts":[]},
{"f":"r4rk1/1Q2bppp/p1N1p3/1p1q4/2pP1n2/2P5/PP3PPP/R4RK1 w - - 2 19","m":["c6e7","g8h8","e7d5"],"alts":[]},
{"f":"5r2/1b3k2/1q4p1/p3Pp1p/2pn1P1P/4Q1P1/P5BK/R1R5 b - - 3 34","m":["d4f3","e3f3","b7f3"],"alts":[]},
{"f":"5rk1/p4pp1/3qb2p/1B1p4/3P4/Q3PN2/P4PPP/1rR3K1 w - - 6 20","m":["a3d6","b1c1","b5f1"],"alts":[]},
{"f":"3r1k2/p4p2/1p4p1/1P5p/4BP1P/3n2P1/P2p3K/3R4 w - - 2 45","m":["d1d2","d8d4","e4d3"],"alts":[]},
{"f":"rnbqkb1r/pp3p1p/6pn/P1ppp3/8/3P1P2/1PP1P1P1/RNBQKBNR w KQkq - 0 8","m":["c1h6","f8h6","h1h6"],"alts":[]},
{"f":"r2q1r1k/1ppbb1pn/p1n4p/3QNp2/B3P3/2P4P/PP3PP1/R1B1RNK1 b - - 0 14","m":["c6e5","a4d7","e5d7"],"alts":[]},
{"f":"3b4/3P4/pp2Pk2/5Q2/P6p/8/8/7K b - - 0 43","m":["f6f5","e6e7","d8e7","d7d8q","e7d8"],"alts":[]}]},"1-9":{"src":"https://lichess.org/study/jDKpfwHS","puzzles":[{"f":"r4rk1/pp3p2/1q1R1bpp/8/8/4P3/1P1QBPPP/5RK1 w - - 0 1","m":["d6b6","a7b6","g1h1","f8d8","d2c2","a8c8","e2c4"],"alts":[]},
{"f":"6k1/8/1R2p1pp/4P3/p1N2P2/6PK/7P/1r6 b - - 0 48","m":["b1b6","c4b6","a4a3","b6d7","a3a2"],"alts":[]},
{"f":"5rr1/1p5k/p2b1Pn1/2p1p1P1/P1PpP3/2P5/1P3KB1/R4R2 w - - 3 30","m":["f1h1","g6h4","h1h4"],"alts":[]},
{"f":"r4rk1/p3ppbp/Pp1q1np1/3PpbB1/2B5/2N2P2/1PPQ2PP/3RR1K1 b - - 0 18","m":["d6c5","g1h1","c5c4"],"alts":[]},
{"f":"6k1/Q2bqr1p/2rpp1pR/p7/Pp2P3/1B3P2/1PP3P1/2KR4 b - - 7 22","m":["e7g5","c1b1","g5h6"],"alts":[]},
{"f":"r1bqk2r/pp1nbppp/3p4/1B1p4/3P1B2/5N2/PPP2PPP/R2QK2R b KQkq - 3 9","m":["d8a5","d1d2","a5b5"],"alts":[]},
{"f":"1rr3k1/4ppbp/3p1np1/1b1N4/P2BP3/5P2/P2R2PP/R5K1 w - - 0 22","m":["d5e7","g8f8","e7c8"],"alts":[]},
{"f":"3r1rk1/1q3ppp/4pb2/8/1P1N4/4P1P1/3B1PBP/R5K1 w - - 0 24","m":["g2b7","f6d4","e3d4"],"alts":[]},
{"f":"6k1/6p1/pp2np1p/8/2r1NR1P/6P1/1PP5/1K6 w - - 2 33","m":["e4f6","g7f6","f4c4"],"alts":[]},
{"f":"8/1R6/p1pk4/2q3bp/1QP5/P7/KP6/3r4 w - - 3 45","m":["b7d7","d6d7","b4c5"],"alts":[]},
{"f":"b4rk1/qn2r3/1p3ppp/1P1p4/1Q1PnB2/P3P3/4BPPP/5RK1 w - - 0 29","m":["b4e7","f8f7","e7e8","g8g7","f4h6"],"alts":[]},
{"f":"1k1r4/pp1b4/2p1qp1p/6p1/8/1Q4P1/PP3PBP/3R2K1 w - - 1 28","m":["b3e6","d7e6","d1d8"],"alts":[]},
{"f":"1r3rk1/q5pp/2R5/3P4/2Q5/1p2NpPb/1P3P1P/3R2K1 b - - 1 32","m":["a7e3","f2e3","f3f2"],"alts":[]},
{"f":"2rr2k1/1p1q1pp1/1B2pnp1/1Q1p4/8/2P2B2/PP4Pb/3RR2K w - - 2 33","m":["b5d7","f6d7","b6d8"],"alts":[]},
{"f":"3q1rk1/4pp1p/p4Pp1/4p1P1/b1PpP2Q/3n3P/P3r1B1/R4RK1 w - - 0 23","m":["h4h6","e7f6","g5f6","d8f6","f1f6"],"alts":[]}]},"1-10":{"src":"https://lichess.org/study/hs7q4Bey","puzzles":[{"f":"r4rk1/pp2qpp1/1b2p2p/4n3/3pPB2/1N3nP1/PP2QPBP/R4R1K w - - 0 1","m":["g2f3","d4d3","e2d1","e5f3","d1f3","e6e5","f4c1"],"alts":[]},
{"f":"8/4k3/1p1p4/rP2p1p1/P2nP1P1/3B4/3K4/R7 b - - 1 35","m":["d4b3","d2c3","b3a1"],"alts":[]},
{"f":"8/8/8/2Pk4/pK4p1/3N4/4bP2/8 w - - 8 60","m":["d3f4","d5c6","f4e2"],"alts":[]},
{"f":"b7/2k1pp2/ppn2qp1/8/4B3/1PNR4/P1P2PP1/5K2 w - - 0 27","m":["c3d5","c7b8","d5f6"],"alts":[]},
{"f":"3rr1k1/p4pp1/1pp4p/3pPQ2/1P3P2/2P2RqP/P2R2P1/6K1 b - - 2 24","m":["g3e1","g1h2","e1d2"],"alts":[]},
{"f":"r7/8/p1k5/1p1p1pn1/7R/2P1P2P/5P2/R5K1 b - - 0 31","m":["g5f3","g1g2","f3h4"],"alts":[]},
{"f":"r4rk1/3nqpp1/4p2p/1p2P3/2pn1Q2/P6N/1P3PPP/1B1R1RK1 b - - 1 24","m":["d4e2","g1h1","e2f4"],"alts":[]},
{"f":"6rk/1pR3p1/6Bp/2b4P/8/pP3PK1/P1P5/8 b - - 0 32","m":["c5d6","f3f4","d6c7"],"alts":[]},
{"f":"2r3k1/6p1/R6p/3P1N2/8/3K4/5b2/8 w - - 6 58","m":["f5e7","g8f7","e7c8"],"alts":[]},
{"f":"1br3k1/4pp1p/p1N3p1/1p6/8/PP2BN1P/6P1/6K1 w - - 1 28","m":["c6e7","g8f8","e7c8"],"alts":[]},
{"f":"5q2/3n1rk1/3p2p1/p1p5/1pP2NP1/3PNp1P/PP5K/3Q4 w - - 2 31","m":["f4e6","g7g8","e6f8"],"alts":[]},
{"f":"5r2/5p1k/2ppq1p1/4p1b1/4N2P/3P4/1P1R1P2/4K1R1 w - - 0 30","m":["e4g5","h7h6","g5e6"],"alts":[]},
{"f":"8/5p2/6p1/1p1N1k2/1P1K4/2P3P1/8/5b2 w - - 1 49","m":["d5e3","f5e6","e3f1"],"alts":[]},
{"f":"6k1/1pp2ppp/p3n1q1/4PN2/2P2Q2/1P1rBP1P/r4P1K/4R3 w - - 6 31","m":["f5e7","g8f8","e7g6"],"alts":[]},
{"f":"r3kb1r/p4ppp/b3p3/2pq4/3Q4/4BN2/PPP2PPP/R3K2R w KQkq - 0 12","m":["d4a4","a6b5","a4b5"],"alts":[]}]},"1-11":{"src":"https://lichess.org/study/4L5NDH4W/Ufe7WXKh","puzzles":[{"f":"K7/P1q4k/6P1/8/8/8/8/8 b - - 0 1","m":["h7g8","g6g7","c7c8"],"alts":[]},
{"f":"8/5p2/p3kr2/8/8/R1P5/4P3/4K3 w - - 0 53","m":["a3a6","e6e5","a6f6"],"alts":[]},
{"f":"8/8/1p1k1n2/4p2p/1PP2pp1/3K4/3N1PPP/8 w - - 0 38","m":["d2e4","f6e4","d3e4"],"alts":[]},
{"f":"5bk1/2R4p/6p1/8/4NP1P/3bP1K1/r7/8 w - - 3 46","m":["e4f6","g8h8","c7h7"],"alts":[]},
{"f":"6k1/pp3pp1/2p1q1Pp/3b4/8/6Q1/PB3Pp1/3r1NK1 w - - 0 28","m":["g3b8","e6e8","b8e8"],"alts":[]},
{"f":"6k1/pp3pp1/2p5/7b/4r2P/2P2N2/PP4K1/3R4 w - - 0 25","m":["d1d8","g8h7","f3g5"],"alts":[]},
{"f":"6R1/8/Kpk1p3/1p1pP3/6P1/PPr5/8/8 w - - 0 41","m":["g8c8","c6d7","c8c3"],"alts":[]},
{"f":"8/2k1b3/5p2/RBpK1Pp1/P2p2P1/1p1P4/2r5/8 w - - 0 46","m":["a5a7","c7b8","a7e7"],"alts":[]},
{"f":"6R1/p7/5k2/P7/6KP/8/8/5r2 b - - 6 53","m":["f1g1","g4f4","g1g8"],"alts":[]},
{"f":"8/1p5k/p3p1q1/3pP3/2p3PQ/2P5/PP6/2K5 b - - 4 33","m":["g6h6","h4h6","h7h6"],"alts":[]},
{"f":"4r1k1/pp1qr1p1/7p/2pPR3/2P2p2/1P3P2/P2Q2PP/4R1K1 b - - 4 33","m":["e7e5","e1e5","e8e5"],"alts":[]},
{"f":"1k6/8/8/6p1/1pp4P/p4PP1/N1P5/7K b - - 0 38","m":["b4b3","c2b3","c4b3"],"alts":[]},
{"f":"8/2p5/3k2p1/1p1P1p2/1P3P2/3K2Pp/7P/8 w - - 2 44","m":["d3d4","g6g5","f4g5"],"alts":[]},
{"f":"Q7/5qk1/p2p4/b1p1pr2/P7/6P1/4KP1R/8 w - - 4 39","m":["a8h8","g7g6","h8h6"],"alts":[]},
{"f":"r1b5/ppr2k1p/5p2/5p2/8/2P3P1/P4PP1/4RK1R w - - 2 24","m":["h1h7","f7g6","h7c7"],"alts":[]}]},"2-0":{"src":"https://lichess.org/study/Xm0oBMLW","puzzles":[{"f":"5rk1/pb2np2/1p4p1/8/8/6N1/PPQ3PP/6K1 w - - 0 1","m":["c2c7","e7c6","c7b7","c6d4","g1f2","f8d8","b7c7"],"alts":[]},
{"f":"8/2kn1p2/8/3P4/R7/2PKN3/1r6/8 b - - 14 70","m":["d7c5","d3d4","c5a4"],"alts":[]},
{"f":"1k4r1/pp3p2/4p3/2N1q3/1P1bp3/P3P3/5P2/2RR1K2 w - - 2 28","m":["c5d7","b8a8","d7e5"],"alts":[]},
{"f":"6k1/6pp/1p6/p1n5/4q3/1P2pN2/P4PPP/3Q2K1 w - - 0 29","m":["d1d8","g8f7","f3g5","f7g6","g5e4"],"alts":[]},
{"f":"3K4/8/2P5/R5pp/1n6/5PkP/6P1/8 b - - 4 61","m":["b4c6","d8d7","c6a5"],"alts":[]},
{"f":"8/pp1k1p2/4p3/2ppPr1r/7P/2P2pP1/P1P5/2K1RR2 w - - 0 23","m":["g3g4","f5e5","g4h5"],"alts":[]},
{"f":"r3k2r/p1bN2pp/2p1Rp2/3p3b/3P1q2/2N4P/PPPQ1PP1/R5K1 b kq - 0 16","m":["e8d7","d2f4","c7f4"],"alts":[]},
{"f":"r2qk2r/pp1n1ppp/4pn2/3N2B1/1b1P4/4QN1P/PPb1BPP1/R4RK1 b kq - 0 12","m":["f6d5","g5d8","d5e3"],"alts":[]},
{"f":"8/2p5/pp1p4/3P1N2/PPP1Pp2/5n1p/5K1k/8 w - - 0 47","m":["f2f3","h2g1","f3f4","h3h2","f5g3"],"alts":[]},
{"f":"5rk1/1p3ppp/pq1Q1b2/8/8/1P3N2/P4PPP/3R2K1 b - - 3 27","m":["f8d8","d6d8","f6d8"],"alts":[]}]},"2-1":{"src":"https://lichess.org/study/zTSQXHWV","puzzles":[{"f":"4r1k1/pp2qppp/2b5/2P4N/8/6QP/PP4P1/5RK1 b - - 0 1","m":["e7c5","g1h2","c5h5","b2b4","g8h8","b4b5","c6b5"],"alts":[]},
{"f":"r6k/pp2n1pp/2nN4/4p1r1/1PB5/2P4b/P3Nb1P/R2R3K w - - 0 23","m":["d6f7","h8g8","f7g5"],"alts":[]},
{"f":"8/1pr2pk1/5np1/6p1/p5Pn/1B2P2P/P2RqP2/3R2KQ b - - 1 41","m":["h4f3","h1f3","e2f3"],"alts":[]},
{"f":"8/pk1r1Rp1/1p2p2p/4P1bP/4N3/8/PP6/1K1r1R2 w - - 5 34","m":["f1d1","d7f7","e4d6","b7c7","d6f7"],"alts":[]},
{"f":"rn3rk1/p5pp/3N4/4np1q/5Q2/1P6/PB1P1KP1/2R4R b - - 1 25","m":["e5d3","f2e3","d3f4","h1h5","f4h5"],"alts":[]},
{"f":"6k1/5r1p/4b1pQ/5q2/3B3P/2P5/4R1P1/6K1 b - - 8 36","m":["f5f1","g1h2","f1e2"],"alts":[]},
{"f":"8/6k1/4p1pq/1p1pPp2/p2P1n2/2P1QNP1/PP3P1P/5K2 b - - 0 39","m":["h6h3","f1e1","f4g2","e1d2","g2e3"],"alts":[]},
{"f":"2r5/4kp2/p3p2q/1p3nNP/3rQP2/P1N5/1P3K2/6R1 w - - 0 35","m":["e4b7","d4d7","b7c8"],"alts":[]},
{"f":"Bn3rk1/p4p1p/1p4p1/2p5/3n2PP/2Q4N/qPP5/2KR3R b - - 0 19","m":["d4e2","c1d2","e2c3"],"alts":[]},
{"f":"5rk1/1p3ppp/pq1Q1b2/8/8/1P3N2/P4PPP/3R2K1 b - - 3 27","m":["f8d8","d6d8","f6d8"],"alts":[]}]},"2-2":{"src":"https://lichess.org/study/zWSgnN2h","puzzles":[{"f":"r1bqkb1r/ppppnp1p/6p1/4n3/2BNP3/5Q2/PPP2PPP/RNB1K2R w - - 0 1","m":["f3f6","e5c4","f6h8"],"alts":[]},
{"f":"3k4/ppp2p1r/4p2P/5n2/3PK1N1/2P5/P1P3P1/7R b - - 0 30","m":["f5g3","e4f4","g3h1"],"alts":[]},
{"f":"rnbq1rk1/pp2b2p/4p2Q/3p1p2/2pP4/P1N5/1PP1PPPP/2KR1BNR b - - 0 11","m":["e7g5","h6g5","d8g5"],"alts":[]},
{"f":"r2q1r2/p3ppkp/3p2P1/1N2n3/4P1P1/5P2/PPPQ4/R3K2R b KQ - 0 16","m":["e5f3","e1e2","f3d2"],"alts":[]},
{"f":"r1b2r2/pp1n2k1/2p3pp/4Np2/2BP4/8/PP4PP/2KRR3 w - - 1 19","m":["e5d7","c8d7","e1e7","g7f6","e7d7"],"alts":[]},
{"f":"2k3nr/ppp2ppp/2n5/8/8/1Q2P3/q4rPP/1R2KB1R w K - 0 16","m":["b3b7","c8d7","b1d1"],"alts":[]},
{"f":"3r2k1/pp2R2p/5pbQ/q2p4/6PP/1Br2P2/P1P5/5RK1 b - - 1 24","m":["a5c5","f1f2","c5e7"],"alts":[]},
{"f":"3r4/p5k1/1p1qpr1p/1Q1pn1p1/3P1pP1/1PP5/P5PP/4RRK1 w - - 0 30","m":["d4e5","d6c5","b5c5","b6c5","e5f6"],"alts":[]},
{"f":"8/2Q5/2p2nk1/4K3/2r5/8/8/8 b - - 5 71","m":["c4e4","e5d6","f6e8","d6d7","e8c7"],"alts":[]},
{"f":"5rk1/1p3ppp/pq1Q1b2/8/8/1P3N2/P4PPP/3R2K1 b - - 3 27","m":["f8d8","d6d8","f6d8"],"alts":[]}]},"2-3":{"src":"https://lichess.org/study/v6l4lLFw/LralQmQS","puzzles":[{"f":"2kr4/p2n2bp/1pp3p1/3p1p2/3P1B2/2P3P1/PP2rPBP/R2R2K1 w - - 0 1","m":["g2f1","g6g5","f1e2","g5f4","e2d3","d8f8","g3f4"],"alts":[]},
{"f":"2kr1b1r/pbp5/1pn1q2p/3p1pp1/3P4/P1P1BQ1B/1P3P1P/R3K1R1 w Q - 0 19","m":["h3f5","e6f5","f3f5"],"alts":[]},
{"f":"6k1/5rpp/1q1p4/2pB4/6Q1/2b4P/Pr4P1/6K1 w - - 0 30","m":["g4c8","b6d8","c8d8"],"alts":[]},
{"f":"2kr3r/ppp3pp/6q1/3Pnp2/1PPQp3/7P/P3NPP1/R4RK1 b - - 2 17","m":["e5f3","g1h1","f3d4"],"alts":[]},
{"f":"r6r/ppk3pp/2pb4/4P3/8/6PQ/PP3PKP/R1Bq4 w - - 0 25","m":["e5d6","d1d6","c1f4","d6f4","g3f4"],"alts":[]},
{"f":"1kq1Q3/2p5/1p3p1p/4p3/8/2P1n3/PP1R2rP/7K w - - 4 32","m":["d2d8","c8d8","e8d8"],"alts":[]},
{"f":"1q4k1/5pp1/R3p2p/p1r5/P3Q3/6PP/5P1K/8 w - - 1 34","m":["a6a8","b8a8","e4a8"],"alts":[]},
{"f":"r7/3r1kpp/p1N2pb1/1pR5/1P2pQ2/1q5P/1P3PP1/R5K1 w - - 3 34","m":["c6e5","f7g8","e5d7"],"alts":[]},
{"f":"8/5k2/1p4p1/1R1K2P1/r6P/8/8/8 b - - 12 58","m":["a4a5","b5a5","b6a5"],"alts":[]},
{"f":"3r4/p4ppk/2q4p/2NpPb2/1PPQ4/5P2/P6P/3R3K b - - 0 41","m":["d5c4","d4d8","c6f3"],"alts":[]},
{"f":"3r1rk1/ppp1qp1p/6p1/8/2B1p1b1/4P3/PPP2RPP/RN3QK1 b - - 1 17","m":["d8d1","f1d1","g4d1"],"alts":[]},
{"f":"3r2k1/p5p1/6p1/b2r1p2/P4P2/1R1BP3/4K3/1R6 w - - 2 37","m":["d3c4","g8f8","c4d5"],"alts":[]},
{"f":"4rn1k/pb2r1pp/1p1q1p2/5P2/2BppN2/7R/PP1Q2PP/4R1K1 w - - 2 25","m":["f4g6","f8g6","f5g6"],"alts":[]},
{"f":"6k1/5pb1/p6p/1p4P1/8/5BQ1/PP1q1PP1/6K1 b - - 0 36","m":["d2e1","g1h2","g7e5"],"alts":[]},
{"f":"5rk1/p4p1p/4p1p1/5nq1/8/5QPP/5PK1/1R1R4 b - - 7 35","m":["f5h4","g2f1","h4f3"],"alts":[]}]},"2-4":{"src":"https://lichess.org/study/yZMV5JdY/9HFnCNVx","puzzles":[{"f":"8/3R3p/6pk/5p2/5PP1/7P/rr1B1K2/8 w - - 1 47","m":["g4g5","h6h5","d7h7"],"alts":[]},
{"f":"8/5k2/6RK/8/8/3r4/8/8 b - - 2 58","m":["d3h3","h6g5","h3g3","g5f4","g3g6"],"alts":[]},
{"f":"8/3k1p2/3Pb3/4P1p1/N7/4K3/8/8 w - - 10 55","m":["a4c5","d7c6","c5e6"],"alts":[]},
{"f":"6k1/p7/2p1r1bp/3p2p1/8/1PP3BP/P4P2/4RK2 b - - 1 35","m":["g6d3","f1g2","e6e1"],"alts":[]},
{"f":"5rk1/p3Q1pp/2p5/8/4p1B1/6PP/4P1K1/3q4 w - - 4 32","m":["g4e6","g8h8","e7f8"],"alts":[]},
{"f":"r6r/p1p3k1/1p1qpbp1/8/3P2R1/2P2P2/PPQ2P1P/2KR4 w - - 0 19","m":["c2g6","g7f8","g6f6"],"alts":[]},
{"f":"8/R1R2ppk/3qp1bp/pB6/P7/4P1QP/6PK/3r4 b - - 12 34","m":["d1h1","h2h1","d6g3"],"alts":[]},
{"f":"r4rk1/pp3ppp/2p2q2/3p4/4n3/1P1BQN2/2K2PPP/3R3R b - - 3 18","m":["f6c3","c2b1","c3b3"],"alts":[]},
{"f":"2r2r2/2b1qpk1/p1n1p2p/1pPp2pn/1P1P4/P2Q3P/2BB1PP1/R3R1K1 w - - 0 24","m":["d3h7","g7f6","h7h6"],"alts":[]},
{"f":"8/5k2/7p/1R3Kp1/4P3/5P1P/1pr5/8 b - - 3 51","m":["c2c5","b5c5","b2b1q"],"alts":[]},
{"f":"rnb2r2/ppp2B1k/3p3p/2b4Q/4P3/3P4/Pq1NKPPP/8 w - - 0 15","m":["h5g6","h7h8","g6h6"],"alts":[]},
{"f":"r4rk1/pp1b1ppp/2n1pq2/1B1p1n2/Qb1P4/2N1B3/PP2NPPP/R4RK1 w - - 8 13","m":["b5c6","d7c6","a4b4"],"alts":[]},
{"f":"8/5r2/7k/6pp/7P/5PK1/R7/8 w - - 0 59","m":["a2a6","h6g7","h4g5"],"alts":[]},
{"f":"7r/8/3b4/3p1P2/6R1/2kN4/4KP2/8 b - - 0 67","m":["h8e8","e2f3","c3d3"],"alts":[]},
{"f":"7r/pp2Rp2/1n4pk/4Q3/3N2q1/8/PP3PPP/5K2 b - - 0 29","m":["g4d1","e5e1","d1d4","e1e3","d4e3"],"alts":[]}]},"2-5":{"src":"https://lichess.org/study/Tv5Q4AGE/JWFraj6A","puzzles":[{"f":"8/7p/4k3/pb1p1pPB/1n1P3P/N1p1P3/4K3/8 w - - 2 43","m":["a3b5","c3c2","e2d2"],"alts":[]},
{"f":"rn2kbnr/pp6/2p2p2/4P3/4P1pq/2N3N1/PPPB1KB1/R2Q1R2 b kq - 2 17","m":["f8c5","d2e3","c5e3","f2e3","h4g3"],"alts":[]},
{"f":"6k1/p4p2/1p5p/4r3/P3B3/1P2KP2/2P3PP/8 b - - 1 29","m":["f7f5","g2g4","f5e4"],"alts":[]},
{"f":"Q1b2rk1/2q2p1p/1p2pbp1/pP6/2P5/P2B1N2/5PPP/3R1RK1 b - - 0 20","m":["c8b7","a8a7","f8a8","a7a8","b7a8"],"alts":[]},
{"f":"1k6/p1p5/P2p4/3P4/1PK2r1p/4P3/8/4B3 w - - 0 58","m":["e3f4","h4h3","e1g3"],"alts":[]},
{"f":"2r3k1/4R1pp/p1p2p2/2N5/2P5/1Pb4P/P4PP1/6K1 b - - 0 25","m":["c3b4","e7a7","b4c5"],"alts":[]},
{"f":"8/pkp5/2p1p3/3p4/N2q4/1P4Q1/1PP3Pr/K2R4 b - - 0 29","m":["d4d1","a1a2","h2h1","a4c5","b7b6"],"alts":[]},
{"f":"rnbqk2r/pp3ppp/5n2/4N3/2p5/2P5/P1PPQPPP/R1B1K2R w KQkq - 0 9","m":["e5c6","c8e6","c6d8"],"alts":[]},
{"f":"r2q2kr/p1B2pp1/4b2p/n1Qn4/8/4P3/PP3PPP/2KR1BNR b - - 2 14","m":["d8c7","c5c7","d5c7"],"alts":[]},
{"f":"r3kb1r/1p2np2/p1p4p/4Pbp1/3PN3/8/PPP3PP/R1B2RK1 w kq - 0 16","m":["e4d6","e8d7","d6f5"],"alts":[]}]},"2-6":{"src":"https://lichess.org/study/THHzDa1N/C9EZ0z5O","puzzles":[{"f":"5k2/5rq1/p1p1Q2R/1p2P3/6p1/P7/1PP4P/7K w - - 0 1","m":["e6c8","f8e7","h6e6"],"alts":[]},
{"f":"R7/1p3kp1/2pK3p/3p1PP1/3r2nP/8/1P6/8 w - - 0 40","m":["g5g6","f7f6","a8f8"],"alts":[]},
{"f":"r3r1k1/6b1/p2Nn2p/1P1Qp3/6nq/2P3P1/1PB2P2/R1B1R1K1 b - - 0 30","m":["h4h2","g1f1","h2f2"],"alts":[]},
{"f":"rn1qrk2/ppp3pQ/3p1pP1/3Pp3/2P1P3/8/PP3PP1/R1B1K3 w Q - 3 17","m":["h7h8","f8e7","h8g7"],"alts":[]},
{"f":"5rk1/1bR3q1/pQ6/8/6P1/4R3/P7/6K1 b - - 0 28","m":["g7g4","e3g3","g4g3"],"alts":[]},
{"f":"3br1kr/7p/4p1pQ/P5P1/1B5P/P6q/5R2/6K1 w - - 2 36","m":["f2f8","e8f8","h6f8"],"alts":[]},
{"f":"2RQ4/p4pp1/4p1kp/8/6PP/4qPK1/1r6/8 w - - 0 36","m":["h4h5","g6h7","d8g8"],"alts":[]},
{"f":"8/1p4p1/pb2pp1p/3n1k2/3P4/P3BN1P/1P2KPP1/8 w - - 1 27","m":["f3h4","f5e4","f2f3"],"alts":[]},
{"f":"6R1/p4p1p/2p1pp1k/6b1/2N5/6R1/4K1PP/2q5 w - - 2 30","m":["g3h3","g5h4","h3h4"],"alts":[]},
{"f":"3r4/4kp1r/p2Np1p1/3bP3/P2n4/8/1P3RPP/5RK1 w - - 5 26","m":["f2f7","h7f7","f1f7"],"alts":[]},
{"f":"5Q2/pbp3np/1p1pq1pk/1P6/P6P/6K1/8/8 w - - 0 33","m":["f8f4","g6g5","f4g5"],"alts":[]},
{"f":"r4rk1/6pp/1p1Bp3/p7/P1PP4/4nqP1/Q2R3P/4R1K1 b - - 2 25","m":["f3f1","e1f1","f8f1"],"alts":[]},
{"f":"1rr3k1/5p1p/p5pQ/4p3/4q3/B1P1P3/PP1R1PPP/2KR4 b - - 0 27","m":["c8c3","b2c3","b8b1"],"alts":[]},
{"f":"4r1k1/p1R1n2p/4N3/5r2/6K1/6PP/P3R3/8 b - - 4 46","m":["h7h5","g4h4","e7g6"],"alts":[]},
{"f":"r1bq1k1r/ppppn1pp/2n5/b5N1/4P3/B1P5/P4PPP/RN1QK2R w KQ - 2 10","m":["d1f3","f8e8","f3f7"],"alts":[]}]},"2-7":{"src":"https://lichess.org/study/otSMJjwH/pIwu0ivp","puzzles":[{"f":"r3q3/1ppknr2/p5pB/2QPn3/4P3/8/PP4BP/2K2R1R b - - 0 22","m":["e5d3","c1c2","d3c5"],"alts":[]},
{"f":"3k3r/rp1qb3/2p2nQ1/p2p2N1/3P2pP/P3P1P1/1P3P2/1K1R3R w - - 7 27","m":["g5f7","d8c7","f7h8"],"alts":[]},
{"f":"3r1q1k/p1pb2pp/1pnp4/6N1/5B2/1Q4P1/PP4PP/4R2K w - - 0 25","m":["g5f7","f8f7","b3f7"],"alts":[]},
{"f":"3rk2r/2qn2p1/p1Q1p3/3n3p/8/8/PP4PP/5R1K w k - 0 24","m":["c6e6","d5e7","e6f7"],"alts":[]},
{"f":"6k1/6pp/p7/2N1bp2/P1P5/1r6/6PP/2R3K1 b - - 2 33","m":["e5d4","g1f1","d4c5"],"alts":[]},
{"f":"3r2k1/1p3p2/p1n2P2/2P3P1/1PR1p3/P2pP3/3B4/6K1 b - - 1 33","m":["c6e5","c4e4","e5f3","g1f2","f3d2"],"alts":[]},
{"f":"8/p7/1p4k1/2pN2p1/4Pp2/P1P4r/1P2K1R1/8 b - - 7 50","m":["f4f3","e2f2","f3g2"],"alts":[]},
{"f":"r3r1k1/ppp2ppp/2nnq3/8/3P4/P1P1P1P1/2Q3BP/R1B1KR2 w Q - 5 17","m":["d4d5","e6e5","d5c6"],"alts":[]},
{"f":"8/5R2/1p2P3/p4r2/P6p/1P3Pk1/4K3/8 b - - 2 64","m":["f5e5","e2f1","e5e6"],"alts":[]},
{"f":"5rk1/1p3ppp/pq1Q1b2/8/8/1P3N2/P4PPP/3R2K1 b - - 3 27","m":["f8d8","d6d8","f6d8"],"alts":[]}]},"2-8":{"src":"https://lichess.org/study/zAGZus6e/5AJW3cs7","puzzles":[{"f":"6k1/5R2/6K1/8/8/8/8/8 w - - 0 1","m":["f7f6","g8h8","f6f8"],"alts":[]},
{"f":"r1bqr1k1/pp1nbpp1/2p5/3n2P1/2BP4/P7/1PQNNPP1/R3K2R w KQ - 1 14","m":["c2h7","g8f8","h7h8"],"alts":[]},
{"f":"6k1/2q2p1p/4pPp1/4P3/p1pP1P2/r1P5/6QP/4B1K1 w - - 0 34","m":["g2a8","c7b8","a8b8"],"alts":[]},
{"f":"1R6/6pk/2p4p/3bP2r/5B1P/2P1RqP1/P4P1Q/6K1 b - - 3 40","m":["f3d1","e3e1","d1e1"],"alts":[]},
{"f":"8/8/p2k4/1pp5/7P/1PKP1RP1/7r/8 b - - 1 46","m":["b5b4","c3c4","h2c2"],"alts":[]},
{"f":"3r4/2k2p1p/pp2pN2/2p5/3n4/6P1/PPP2PRP/2K5 b - - 0 23","m":["d4e2","c1b1","d8d1"],"alts":[]},
{"f":"1k3r2/q5r1/2Qp3p/3Bp3/2N1P1p1/P7/1PP2PPP/R5K1 b - - 13 35","m":["a7f2","g1h1","f2f1","a1f1","f8f1"],"alts":[]},
{"f":"1k5r/ppp1R2p/r4p2/5Q2/3p4/2qP4/2P2PPP/2K1R3 w - - 6 27","m":["e7e8","h8e8","e1e8"],"alts":[]},
{"f":"3r2k1/4ppnp/pp4p1/2p5/4q3/3rP3/P2P1QPP/3R1RK1 w - - 0 29","m":["f2f7","g8h8","f7f8","d8f8","f1f8"],"alts":[]},
{"f":"kr6/1pR4p/p4R2/n7/P3p3/3rB3/6PP/6K1 w - - 1 39","m":["f6a6","b7a6","c7a7"],"alts":[]},
{"f":"6k1/5ppp/r1p5/p1n1rP2/8/2P2N1P/2P3P1/3R2K1 w - - 0 22","m":["d1d8","e5e8","d8e8"],"alts":[]},
{"f":"8/6P1/5k1K/8/8/3p4/P2R4/6r1 b - - 2 49","m":["g1h1","d2h2","h1h2"],"alts":[]},
{"f":"1q3r2/p5k1/1p2pbpp/2p5/2P1p3/2P2PQP/PP3P2/6RK w - - 0 30","m":["g3g6","g7h8","g6h6"],"alts":[]},
{"f":"1r6/5k2/2Q1pNp1/p5Pp/1p2P2P/2P4R/KP3P2/3q4 b - - 0 31","m":["b4b3","a2a3","d1a1"],"alts":[]},
{"f":"1R2R3/p7/1p1k3p/1Pb5/P5p1/6P1/5r1P/7K b - - 7 41","m":["f2f1","h1g2","f1g1"],"alts":[]}]},"2-9":{"src":"https://lichess.org/study/whl4X0Vy/BPFGoXvj","puzzles":[{"f":"1r1q1rk1/1b4b1/4p1Bp/3pP3/p2B2P1/7Q/PPP5/2KR3R b - - 0 23","m":["d8g5","c1b1","g5g6"],"alts":[]},
{"f":"r2qr1k1/b1p2ppp/p5n1/P1p1p3/4P1n1/B2P2Pb/3NBP1P/RN1QR1K1 w - - 0 17","m":["e2g4","h3g4","d1g4"],"alts":[]},
{"f":"3r1rk1/1p2q1pp/5p2/8/1P1n4/6Q1/PPBB1PPP/R4RK1 b - - 0 20","m":["d4e2","g1h1","e2g3","f2g3","d8d2"],"alts":[]},
{"f":"5rk1/1p2p2p/p2p4/2pPb2R/2P1P3/1P1BKPrR/8/8 w - - 5 31","m":["h3g3","e5g3","h5g5","g8f7","g5g3"],"alts":[]},
{"f":"4k3/1R6/6N1/5p1p/7P/2r3PK/5b2/8 b - - 0 47","m":["c3g3","h3h2","g3g6"],"alts":[]},
{"f":"8/5p2/4p1k1/4P3/8/5RPn/1P2Kp2/5N1r b - - 3 46","m":["h3g1","e2f2","g1f3"],"alts":[]},
{"f":"4rk1r/1pp2p2/p2p3p/3N4/3P2q1/8/PPP5/1K2Q1NR w - - 2 24","m":["e1e8","f8e8","d5f6","e8e7","f6g4"],"alts":[]},
{"f":"1r2r1k1/ppp1q1pp/4b3/4P3/1Q1R1P2/8/P5PP/R1B3K1 b - - 0 19","m":["c7c5","b4a3","c5d4","a3e7","e8e7"],"alts":[]},
{"f":"8/5R2/1p2P3/p4r2/P6p/1P3Pk1/4K3/8 b - - 2 64","m":["f5e5","e2f1","e5e6"],"alts":[]},
{"f":"5rk1/1p3ppp/pq1Q1b2/8/8/1P3N2/P4PPP/3R2K1 b - - 3 27","m":["f8d8","d6d8","f6d8"],"alts":[]}]},"2-10":{"src":"https://lichess.org/study/ZOdpD9Ly/O9zAPm3h","puzzles":[{"f":"r3rnk1/1p3ppp/p7/1q1P4/4b3/P4RN1/1B1Q2PP/R6K w - - 0 1","m":["d2d4","f7f6","g3e4","e8e4","d4e4","b5b2","f3f1"],"alts":[]},
{"f":"3q2k1/3r4/pp3p1Q/2b1n3/P3N3/2P5/1P4PP/R6K w - - 1 25","m":["e4f6","d8f6","h6f6"],"alts":[]},
{"f":"r1b2rk1/4bppp/p1n5/3q4/Pp6/3B1N2/1B3PPP/R2Q1RK1 w - - 0 18","m":["d3h7","g8h7","d1d5"],"alts":[]},
{"f":"r3qrk1/2p2pp1/p2bpn1p/2ppN3/3P1Pb1/1PP1P1B1/P2N2PP/R2Q1RK1 w - - 1 15","m":["e5g4","f6g4","d1g4"],"alts":[]},
{"f":"5qk1/pQ3p2/7p/b2N1bp1/P3r3/5K2/7P/R4B2 w - - 0 25","m":["d5f6","g8h8","f6e4"],"alts":[]},
{"f":"1r3rk1/1pqN1pbp/p1p1pnp1/2N5/3P4/1QP5/PP3PPP/3RR1K1 b - - 3 19","m":["f6d7","c5d7","c7d7"],"alts":[]},
{"f":"8/7Q/3p1kp1/1p6/2b5/2q4P/5PPK/8 w - - 0 37","m":["h7h8","f6e6","h8c3"],"alts":[]},
{"f":"3R4/8/8/KB2b3/1p6/1P2k3/3p4/8 b - - 0 58","m":["e5c7","a5b4","c7d8"],"alts":[]},
{"f":"1k5r/pp1r1ppp/4p2n/1Nb2q2/2Pp4/6P1/PP3P1P/R1BQR1K1 w - - 3 15","m":["c1f4","f5f4","g3f4"],"alts":[]},
{"f":"r2qr1k1/ppp2ppp/4P3/8/1nP2Q2/2N2N1P/PP3KP1/R4R2 b - - 0 15","m":["b4d3","f2g1","d3f4"],"alts":[]},
{"f":"7Q/2p5/1p2prp1/p4k1p/q4p1P/8/6RK/8 w - - 0 38","m":["g2g5","f5e4","h8f6"],"alts":[]},
{"f":"6k1/r1b1q3/2p3p1/2Pp4/1P2p1n1/2B1P3/NQ6/2K4R w - - 2 37","m":["h1h8","g8f7","h8h7","f7e8","h7e7"],"alts":[]},
{"f":"8/8/2B2p1p/P4Pp1/3p2P1/1b1Pb1kP/8/4K3 w - - 1 51","m":["a5a6","b3c4","a6a7"],"alts":[]},
{"f":"r3brk1/5pp1/p2qpn1p/P2pn3/2pP4/2P1PN2/5PPP/RB1QK2R w KQ - 0 17","m":["d4e5","d6e7","e5f6"],"alts":[]},
{"f":"r5k1/5pp1/1p1rb1qp/3pR3/p1pP4/P1P3Q1/5PPN/4R1K1 w - - 2 31","m":["g3g6","f7g6","e5e6","d6e6","e1e6"],"alts":[]}]},"2-11":{"src":"https://lichess.org/study/a5Q2Twk2/dP4F5lD9","puzzles":[{"f":"8/1r6/1B6/4k3/8/8/4K3/1R6 w - - 0 1","m":["b6d4","e5d4","b1b7"],"alts":[]},
{"f":"2kr1b1R/p5p1/8/3P1p2/2P5/4B3/PP1K1P2/8 b - - 0 25","m":["f8b4","d2d3","d8h8"],"alts":[]},
{"f":"1r2k1nr/N3pp1p/6p1/8/8/8/PbP2PPP/1RB1K2R b Kk - 1 14","m":["b2c3","e1e2","b8b1"],"alts":[]},
{"f":"3r4/ppk2pp1/2p1p3/4b3/P3n1P1/8/KPP2PN1/3rBR1R w - - 3 32","m":["e1a5","b7b6","f1d1"],"alts":[]},
{"f":"3r3r/pp3pp1/5k2/2Qbq3/3N4/5PP1/PPP1N2p/R3R2K b - - 0 22","m":["d5f3","d4f3","e5c5"],"alts":[]},
{"f":"r2q1rk1/ppp1nppp/3b4/1B6/3QP3/2N2P2/PPP2P1P/R1B2RK1 b - - 0 10","m":["d6h2","g1h2","d8d4"],"alts":[]},
{"f":"2k2r1r/p2n3p/1pqbQ3/8/3P4/2P2N2/P2B1PPP/R4RK1 b - - 0 19","m":["d6h2","f3h2","c6e6"],"alts":[]},
{"f":"8/6k1/2bb2pp/4pP2/6P1/3BBPKP/8/8 b - - 0 38","m":["e5e4","f3f4","e4d3"],"alts":[]},
{"f":"r1q2rk1/2p3p1/pbp2n2/7P/7B/2N2Q1N/PP3P1K/R2R4 b - - 1 24","m":["f6g4","h2g2","f8f3"],"alts":[]},
{"f":"8/8/8/1p6/3k4/2p4P/rP2RK2/8 w - - 2 50","m":["b2c3","d4c3","e2a2"],"alts":[]},
{"f":"6k1/1B2ppbp/p2p2p1/3P4/1P2P3/P3B1P1/4qP1P/1Q1b2K1 b - - 0 28","m":["e2e1","g1g2","d1f3","g2f3","e1b1"],"alts":[]},
{"f":"r1b2k1r/pppp2pp/5q2/4n3/2BQ4/8/PPP2PPP/RN2R1K1 b - - 0 13","m":["e5f3","g2f3","f6d4"],"alts":[]},
{"f":"3q2k1/r1p3p1/P1Pp3p/3Pp1b1/R4r2/4QN1P/5PP1/R5K1 b - - 2 27","m":["f4a4","a1a4","g5e3"],"alts":[]},
{"f":"2r5/p2n1pkp/4p1p1/2Np4/1r6/1P1K1P1P/P3R1P1/2R5 w - - 6 37","m":["c5e6","f7e6","c1c8"],"alts":[]},
{"f":"8/p1q3k1/6r1/3pp1R1/7Q/7P/P5PK/8 b - - 7 54","m":["e5e4","h4g3","c7g3"],"alts":[]}]},"2-12":{"src":"https://lichess.org/study/8YoxQqtw/3I15qJzf","puzzles":[{"f":"8/1p3Rp1/p1p3r1/P1P5/1P3k1K/7P/8/8 b - - 1 45","m":["g6f6","f7f6","g7f6"],"alts":[]},
{"f":"8/p2Q2k1/1p2p1pn/1P1p1p1R/3P1P2/qN2r3/P1r3PP/R5K1 b - - 3 40","m":["h6f7","h5h7","g7h7"],"alts":[]},
{"f":"8/8/4k2p/4p1p1/4P1P1/rK3P1P/8/8 w - - 0 48","m":["b3a3","e6d7","a3b4","d7c6","b4c4"],"alts":[]},
{"f":"2k5/6K1/2q2Q2/p7/8/6P1/7P/8 b - - 0 66","m":["c6f6","g7f6","a5a4"],"alts":[]},
{"f":"1r1qkb1r/1p3ppp/4b3/p2pP3/P7/1QN5/1P3PPP/R1B2RK1 b k - 4 15","m":["d5d4","b3b5","e6d7","b5d3","d4c3"],"alts":[]},
{"f":"8/8/2bk2pp/8/1N1K4/7P/6P1/8 w - - 0 43","m":["b4c6","d6c6","d4e5"],"alts":[]},
{"f":"7k/p6p/1p1b4/8/1P1pBPq1/3Q4/P6P/7K w - - 3 31","m":["d3d4","g4g7","d4d6","g7a1","h1g2"],"alts":[]},
{"f":"8/8/8/p4p2/2pPkP2/2K5/1P6/8 w - - 1 38","m":["c3c4","e4f4","d4d5","f4e5","c4c5","f5f4","d5d6","e5e6","c5c6"],"alts":[]},
{"f":"8/7R/5p2/p7/7P/2p5/3k2N1/1K6 b - - 0 48","m":["c3c2","b1a2","c2c1q","h7d7","d2e2"],"alts":[]},
{"f":"8/7k/p3q3/7R/P3pprP/1P4PK/3Q1P2/8 b - - 0 42","m":["h7g6","h5g5","g4g5"],"alts":[]},
{"f":"8/8/8/p7/PpK4R/1P6/5bk1/8 b - - 0 78","m":["f2h4","c4b5","h4d8"],"alts":[]},
{"f":"4R3/1p6/1Pp4K/5k2/P4r2/8/8/8 w - - 0 51","m":["e8f8","f5e4","f8f4","e4f4","a4a5"],"alts":[]},
{"f":"6k1/1p2npp1/p5qp/8/P7/4BN1P/1b3PP1/3Q2K1 w - - 0 27","m":["d1d8","g8h7","d8e7","g6b1","g1h2"],"alts":[]},
{"f":"8/5pk1/p5p1/1p6/1P2p1Pp/P1RrP2P/5PK1/8 w - - 1 39","m":["c3d3","e4d3","g2f1"],"alts":[]},
{"f":"8/4k3/5R2/3pPK2/p1pP4/2P5/r7/8 b - - 0 40","m":["a2f2","f5g6","f2f6","e5f6","e7f8"],"alts":[]}]},"2-13":{"src":"https://lichess.org/study/9G0jITgq","puzzles":[{"f":"q5k1/1r3pp1/p4b1p/2p5/1p6/1B1P4/P1P2PPP/3QR1K1 w - - 0 1","m":["b3d5","f6c3","d5b7","a8b7","e1e8","g8h7","d1g4"],"alts":[]},
{"f":"r3k1nr/1pp2ppp/1pnp4/4p1q1/2B1P3/3P1Q1P/PPP2PP1/R4RK1 w kq - 0 12","m":["f3f7","e8d8","f7f8","d8d7","f8a8"],"alts":[]},
{"f":"3N1r2/R7/kp6/p2pPp1Q/2pP2P1/2q5/2P5/2K5 b - - 1 38","m":["a6a7","h5h7","a7a6"],"alts":[]},
{"f":"8/p1p1k2p/4P3/2PP1p1P/1r3r2/5B2/P3RK2/8 w - - 4 39","m":["d5d6","c7d6","c5d6","e7d6","e6e7"],"alts":[]},
{"f":"r1b1qrk1/pp1n1pbp/2pp1np1/4P3/2P2B2/2NBPN1P/PP3PP1/R2Q1RK1 b - - 0 10","m":["d6e5","f4h2","e5e4"],"alts":[]},
{"f":"5r1k/pQR3pp/5rp1/3B4/q2n4/7P/P4PP1/5RK1 b - - 4 30","m":["d4e2","g1h2","a4f4","h2h1","e2g3","f2g3","f4f1"],"alts":[]},
{"f":"r7/p2k1pp1/p1p1pn2/3p4/3P4/P3PQp1/1PP2P1R/2K5 b - - 0 20","m":["g3h2","f3h3","f6g4"],"alts":[]},
{"f":"2r2rk1/3p1ppp/p3p3/1p6/6P1/3Q4/PP5q/1K2RR2 w - - 0 23","m":["f1h1","h2c2","d3c2","c8c2","b1c2"],"alts":[]},
{"f":"2rqk2r/3n4/1p2p3/p3N2R/Q1PP2p1/P2BP3/3K1Pb1/R7 b k - 0 22","m":["h8h5","d3g6","e8e7","a4d7","d8d7"],"alts":[]},
{"f":"5rr1/3pk1q1/p3p3/1pP4p/1P1R1p2/2P2QP1/1P3P1P/5RK1 b - - 2 26","m":["f4g3","d4d7","e7d7","f3b7","d7e8"],"alts":[]}]},"3-0":{"src":"https://lichess.org/study/srYNhk2o","puzzles":[{"f":"2k5/3q4/8/3P4/2B5/8/8/1KR5 w - - 0 1","m":["c4b5"],"alts":[]},
{"f":"5rk1/pp3Npp/3p2r1/8/bnN5/8/5RP1/5RK1 w - - 0 27","m":["f7h6","g7h6","f2f8","g8g7","f1f7"],"alts":[]},
{"f":"5k2/p3pp2/7p/2Qp1P2/6q1/8/2K5/8 w - - 0 44","m":["c5c8","f8g7","f5f6","g7f6","c8g4"],"alts":[]},
{"f":"2k5/1pp2B2/p1np4/4pR2/PP2P1q1/1NPP2P1/5bK1/8 w - - 0 31","m":["f7e6","c8d8","f5f8","d8e7","e6g4"],"alts":[]},
{"f":"2rq1rk1/1b2bppp/pp2p3/8/3N4/P1P1P3/4BPPP/1Q1R1RK1 w - - 0 19","m":["d4e6","f7e6","d1d8"],"alts":[]},
{"f":"r2q1rk1/p4pbp/1pp1p1p1/4n3/2PQN3/1P4P1/PB2PP1P/1R3RK1 b - - 0 16","m":["e5f3","e2f3","g7d4"],"alts":[]},
{"f":"r5k1/1pp2r2/p3n2q/3pP2p/2P2R1P/8/PP1Q2P1/5RK1 w - - 1 23","m":["f4g4","h5g4","d2h6","f7f1","g1f1"],"alts":[]},
{"f":"r1q1r1k1/1p3pp1/n1p4p/p2pp2P/P3P3/2P2P2/1P1QBb2/R1BK3R w - - 0 24","m":["e2a6","b7a6","d2f2"],"alts":[]},
{"f":"r3r3/1p1n2pk/2p1p2p/2P5/1p2R3/P2Q1N1P/5PP1/q5K1 w - - 0 25","m":["e4e1","h7h8","e1a1"],"alts":[]},
{"f":"2r2rk1/1b3ppp/p2pp3/bp1n4/3PQ1Nq/PP1B4/1BP2PPP/R4RK1 w - - 4 18","m":["g4f6","d5f6","e4h4"],"alts":[]},
{"f":"8/2k5/8/1r2p1R1/6p1/3K4/1p4PP/1N6 b - - 1 41","m":["e5e4","d3c2","b5g5"],"alts":[]},
{"f":"6qk/1p4p1/B1n2rQp/3p4/8/2P2P2/P6P/6RK w - - 1 30","m":["g6f6","g7f6","g1g8","h8g8","a6b7"],"alts":[]},
{"f":"r4r1k/ppp1b1pp/3q1n2/6B1/8/1QN5/PPP2PPP/R4RK1 b - - 4 14","m":["f6g4","g2g3","e7g5"],"alts":[]},
{"f":"5rk1/ppq2ppp/3bp3/3p1nPP/3P4/2P1B3/PP2Q1P1/R4RK1 b - - 0 19","m":["d6h2","g1h1","f5g3","h1h2","g3e2"],"alts":[]},
{"f":"4R3/5ppk/7p/2p2q2/1B6/3r2P1/5P1P/1Q4K1 b - - 0 35","m":["d3g3","f2g3","f5b1"],"alts":[]}]},"3-1":{"src":"https://lichess.org/study/R7MF7lb4","puzzles":[{"f":"r1b1R3/pp4pk/2p5/8/2P5/1P3B2/P5P1/6K1 w - - 0 1","m":["f3g4","b7b6","g4c8"],"alts":["e8c8"]},
{"f":"5r2/1Pk5/8/K2B4/8/1P6/8/8 b - - 2 47","m":["f8f5","b7b8b","c7b8","a5b5","f5d5"],"alts":[]},
{"f":"7k/p5p1/5q1p/8/P1b5/3rQ1RP/6BK/8 w - - 7 43","m":["e3e8","c4g8","g3d3"],"alts":[]},
{"f":"1k4r1/7p/1p4r1/pPp1qp2/P1Pp1R2/3Q1RNP/2P4K/8 b - - 5 32","m":["g6g3","f3g3","e5f4"],"alts":[]},
{"f":"5rk1/5p2/4p1p1/7R/2P5/2n2N2/5r2/2K4R w - - 0 38","m":["h5h8","g8g7","h1h7","g7f6","h8f8"],"alts":[]},
{"f":"2r3k1/2r1bppp/3ppn2/qp6/4P3/1Q2B1P1/PP3PBP/1RR3K1 b - - 6 21","m":["c7c1","b1c1","c8c1","e3c1","a5e1","g2f1","e1c1"],"alts":[]},
{"f":"6r1/2R3pk/1n2p2p/p6N/6PP/8/P7/6K1 w - - 1 41","m":["h5f6","h7h8","f6g8"],"alts":[]},
{"f":"r3kb1r/ppp2pp1/3p4/1P2p3/2P3Qn/2N1P2q/PB1P1P1N/R4RK1 b kq - 0 15","m":["h4f3","h2f3","h3g4"],"alts":[]},
{"f":"6rk/pp6/2n5/3ppn1p/3p4/2P2P1q/PP3QNB/R5RK b - - 3 29","m":["f5g3","f2g3","g8g3"],"alts":[]},
{"f":"5rk1/5ppp/1r6/3Qp3/2B1P3/2q3P1/3R1PKP/8 w - - 0 28","m":["d5f7","f8f7","d2d8"],"alts":[]},
{"f":"b6k/8/1Q4p1/4q2p/5r1P/P1N3R1/1PP3PK/8 b - - 4 35","m":["f4h4","h2g1","e5e1"],"alts":[]},
{"f":"5rk1/4Q1pp/4pp2/pP6/P1BpP1PP/8/7K/3q4 w - - 2 35","m":["c4e6","g8h8","e7f8"],"alts":[]},
{"f":"1r4k1/p5pp/5p2/2Rb4/1P4P1/P7/3r3P/3B1RK1 w - - 0 35","m":["c5d5","d2d5","d1b3","g8f8","b3d5"],"alts":[]},
{"f":"2r3k1/2r3p1/p3pqQ1/1p1p4/nP1P4/2P4R/P4PPP/2R3K1 w - - 1 31","m":["g6h7","g8f7","h3f3","f6f3","g2f3"],"alts":[]}]},"3-2":{"src":"https://lichess.org/study/LdwLPyPK","puzzles":[{"f":"2Q5/p5pk/1r2p3/K2pP2p/3P4/2P4R/Pq6/8 w - - 0 42","m":["h3h5","h7g6","c8e8"],"alts":[]},
{"f":"4rr1k/p1Qn2pp/3p1q2/8/8/2P5/PP3PPP/RN3RK1 b - - 0 16","m":["f6f2","f1f2","e8e1","f2f1","e1f1"],"alts":[]},
{"f":"Q7/8/8/5k2/8/5pr1/5r2/R6K b - - 0 50","m":["g3h3","h1g1","f2g2","g1f1","h3h1"],"alts":[]},
{"f":"3r1k2/p2n3p/1p2Bpp1/2r2N2/4q3/6QP/P5P1/5R1K w - - 2 41","m":["g3d6","f8e8","d6e7"],"alts":[]},
{"f":"r1b1r2k/p1p2p1p/2q1N3/7p/8/b1NPB3/PP3P1P/R3K1R1 w Q - 2 19","m":["e3d4","f7f6","d4f6"],"alts":[]},
{"f":"7k/p5pp/2r2q2/2p4Q/8/8/P5PP/3r1R1K w - - 0 30","m":["h5e8","f6f8","e8f8"],"alts":[]},
{"f":"r2n2k1/1bq2rpp/1p6/3P4/p3Q3/B3P3/PP3PPP/3R2K1 w - - 0 21","m":["e4e8","f7f8","e8f8"],"alts":[]},
{"f":"Q4n1k/p2b2pp/3b4/2p5/4Nq2/2Pn3P/PP2BPP1/R1B2RK1 b - - 0 23","m":["f4h2"],"alts":[]},
{"f":"4rk2/pbp2pp1/1p1N4/3P1q2/QPBP4/1KP2P2/P5r1/R3R3 b - - 0 25","m":["f5c2","b3a3","c2b2"],"alts":[]},
{"f":"8/p1p2k2/1r2rp2/3p1Q2/2qP2R1/2P4P/6PK/4q3 w - - 0 34","m":["f5h7","f7f8","g4g8"],"alts":[]},
{"f":"4r3/1k6/pp3P2/1b5p/3R1p2/P1R2P2/1P4PP/6K1 b - - 0 35","m":["e8e1","g1f2","e1f1"],"alts":[]},
{"f":"r1bq3r/pp1nbkp1/2p1p2p/8/2BP4/1PN3P1/P3QP1P/3R1RK1 w - - 0 20","m":["e2e6","f7f8","e6f7"],"alts":[]},
{"f":"8/6pk/1Q1p2n1/4p3/2P3P1/P2PPK1P/1B6/4q3 b - - 2 35","m":["g6h4","f3e4","e1h1"],"alts":[]},
{"f":"2k3rB/ppp2p1p/2np4/8/4P3/2NB1b2/PPP2PPP/R4RK1 b - - 0 13","m":["g8g2","g1h1","g2g4"],"alts":[]},
{"f":"1r5r/5pk1/4p3/3p2PP/N1nP4/n1P5/P3B3/K1R4R b - - 0 34","m":["b8b1","c1b1","a3c2"],"alts":[]}]},"3-3":{"src":"https://lichess.org/study/oZ0xi9dr","puzzles":[{"f":"8/8/8/3P4/8/8/7k/K7 w - - 0 1","m":["d5d6","h2g3","d6d7","g3f4","d7d8q"],"alts":[]},
{"f":"8/p5k1/1pp3p1/4pp1p/5P1P/2P3P1/PP4K1/8 w - - 0 36","m":["f4e5","g7f7","g2f3","f7e6","f3f4"],"alts":[]},
{"f":"8/7p/6pP/p2k1p2/1p1P1P2/PP2K3/8/8 w - - 0 50","m":["a3b4","a5b4","e3d3","d5e6","d3c4"],"alts":[]},
{"f":"8/8/5p2/7k/4KP2/8/8/8 w - - 1 66","m":["e4f5","h5h6","f5f6"],"alts":[]},
{"f":"8/8/8/4p3/PK5p/5k1P/8/8 b - - 0 41","m":["e5e4","a4a5","e4e3","a5a6","e3e2"],"alts":[]},
{"f":"8/8/5p2/1p5p/2k1KP2/P7/7P/8 b - - 0 36","m":["c4b3","e4f5","b3a3","f5f6","b5b4","f6e7","b4b3","f4f5","b3b2","f5f6","b2b1q"],"alts":[]},
{"f":"4k3/p1pp3p/1p3K2/8/5P2/8/8/8 w - - 5 45","m":["f6g7","h7h5","f4f5","h5h4","f5f6"],"alts":[]},
{"f":"8/8/8/p1k4p/P1p4P/2K2P2/8/8 w - - 1 40","m":["f3f4","c5d5","f4f5","d5e5","c3c4","e5f5","c4b5","f5e6","b5a5"],"alts":[]},
{"f":"8/7p/3p1p2/3P4/P1p1k3/1P1p4/6P1/4K3 w - - 0 38","m":["b3c4","e4d4","a4a5","d4c4","a5a6","c4d5","a6a7"],"alts":[]},
{"f":"8/7p/6p1/3k4/5KPP/8/8/8 w - - 1 51","m":["f4g5","d5e4","g5h6"],"alts":[]},
{"f":"8/8/8/pK2k3/P7/8/8/8 w - - 2 60","m":["b5a5","e5d6","a5b6","d6d7","b6b7"],"alts":[]},
{"f":"8/7K/4k3/6P1/pp6/4P3/P7/8 b - - 1 51","m":["b4b3","a2b3","a4b3","g5g6","b3b2","g6g7","b2b1q"],"alts":[]},
{"f":"8/2p2p2/3p2kp/p2P4/P1P1KpP1/7P/8/8 w - - 0 38","m":["e4f4","f7f6","h3h4"],"alts":[]},
{"f":"8/8/2p5/P7/1k6/3K1p2/8/8 w - - 0 51","m":["a5a6","f3f2","d3e2","b4c5","a6a7"],"alts":[]},
{"f":"8/p4pp1/7p/4k3/1p1pP1P1/1Pp2PP1/P1PK4/8 w - - 0 32","m":["d2d3","g7g5","d3c4"],"alts":[]}]},"3-4":{"src":"https://lichess.org/study/xrekdf0f/RCd5Ztfm","puzzles":[{"f":"2k4r/ppp2p1p/4p1n1/q7/1n5B/2Q2N2/PPP2PPP/3R2K1 w - - 0 1","m":["c3h8","g6h8","d1d8"],"alts":[]},
{"f":"6k1/pp3pp1/1n4p1/2p5/6P1/1B3PKP/PP1r4/4R3 w - - 6 29","m":["e1e8","g8h7","b3f7"],"alts":[]},
{"f":"5rk1/b5pp/4p3/pp1N4/8/P2rP3/B5PP/2B2RK1 w - - 0 27","m":["d5e7","g8h8","f1f8"],"alts":[]},
{"f":"r2q1rk1/ppp2ppp/2nbb3/6N1/6n1/2NPB3/PPP1BPPP/R2QK2R b KQ - 6 9","m":["g4e3","f2e3","d8g5"],"alts":[]},
{"f":"6k1/8/p2b1q2/1p1p4/1P1P3p/P4QP1/5PK1/4R3 b - - 1 38","m":["h4h3","g2h3","f6f3"],"alts":[]},
{"f":"4rrk1/pB4pp/2N2p2/2p5/6b1/1PN3P1/P1P2P1P/4RK2 b - - 0 21","m":["g4h3","f1g1","e8e1"],"alts":[]},
{"f":"4Qn1k/6p1/7p/8/1b1P2N1/2q1B2P/6P1/6K1 b - - 1 31","m":["c3e1","g1h2","b4d6","g4e5","e1e3"],"alts":[]},
{"f":"2kr3r/ppp2ppp/2nbp3/6B1/P2P2n1/2N2N1q/1PP2P2/R2QRBK1 b - - 3 14","m":["d6h2","g1h1","g4f2"],"alts":[]},
{"f":"5R2/8/p5pp/2B5/5b1P/P3p3/8/3K1k2 b - - 3 46","m":["e3e2","d1c2","e2e1q","f8f4","f1g2"],"alts":[]},
{"f":"3qr1k1/p4p1p/6p1/3Q4/8/1P3P2/P5PP/3R2K1 b - - 0 26","m":["e8e1","d1e1","d8d5"],"alts":[]},
{"f":"r3q1k1/p5b1/1pp3p1/3n1pB1/Qnb1p3/2N1PP1P/PP4BN/3R2K1 w - - 2 25","m":["c3d5","c6d5","a4b4"],"alts":[]},
{"f":"r4rk1/BRp2pp1/3b3p/2P5/5P2/6P1/P6P/3R2K1 b - - 0 23","m":["a8a7","b7a7","d6c5","g1f1","c5a7"],"alts":[]},
{"f":"2r3k1/p4pp1/1p5p/1Q6/2q5/5P2/1P4PP/3R2K1 w - - 4 31","m":["d1d8","c8d8","b5c4","d8d1","g1f2"],"alts":[]},
{"f":"8/pk5p/1pp1Q3/8/3R2P1/P1P1K2n/2q2r2/8 w - - 0 36","m":["d4d7","b7a6","e6c4","b6b5","c4c6","a6a5","d7a7"],"alts":[]},
{"f":"3r1rk1/pp3pp1/2p2b1p/4p3/4Pnb1/2P2NN1/PP2BP1K/R1B1R3 b - - 3 19","m":["f4e2","g3e2","g4f3"],"alts":[]}]},"3-5":{"src":"https://lichess.org/study/Vh0XG74a/WmCoeGe5","puzzles":[{"f":"1r5r/p3kp2/4p2p/4P3/R4Pp1/6P1/P1P4P/4K2R b K - 2 25","m":["b8b1","e1f2","b1h1","a4a7","e7f8"],"alts":[]},
{"f":"r2qr1k1/b1p2ppp/p5n1/P1p1p3/4P1n1/B2P2Pb/3NBP1P/RN1QR1K1 w - - 0 17","m":["e2g4","h3g4","d1g4"],"alts":[]},
{"f":"5k2/R3Rp2/6p1/1p5p/1P1r3K/2n5/7P/8 w - - 8 44","m":["h4g5","c3e4","g5h6"],"alts":[]},
{"f":"8/1b4p1/1k3pPp/4K2P/4PP2/8/8/8 w - - 0 47","m":["e5e6","b7e4","e6f7"],"alts":[]},
{"f":"8/5R2/1p2P3/p4r2/P6p/1P3Pk1/4K3/8 b - - 2 64","m":["f5e5","e2f1","e5e6"],"alts":[]},
{"f":"3r4/6k1/1p1pr1p1/p1p2p2/P1P1p1P1/1P1n4/3R1PBP/4R1K1 w - - 1 30","m":["d2d3","e4d3","e1e6","d3d2","g2f3"],"alts":[]},
{"f":"3r4/5k2/p4Pp1/2K3Pp/2R5/P7/8/8 b - - 0 51","m":["d8c8","c5d4","c8c4","d4c4","h5h4"],"alts":[]},
{"f":"5rk1/1p3ppp/pq1Q1b2/8/8/1P3N2/P4PPP/3R2K1 b - - 3 27","m":["f8d8","d6d8","f6d8"],"alts":[]},
{"f":"3r1rk1/p1p2pbp/1p4p1/7n/4P2q/1P2BP2/P1B3QP/3R1R1K w - - 7 24","m":["e3g5","h5g3","g2g3"],"alts":[]},
{"f":"6k1/p1Q2p1p/4p1p1/3p4/1r6/7P/q4PP1/5RK1 w - - 0 27","m":["c7c8","g8g7","c8c3","d5d4","c3b4"],"alts":[]}]},"3-6":{"src":"https://lichess.org/study/OWsq2BB6/Us22qb9A","puzzles":[{"f":"8/5kp1/p3pb2/8/6Pp/1P4qP/P2R2Q1/7K b - - 3 34","m":["g3e1","g2g1","e1d2"],"alts":[]},
{"f":"6nr/p4p1p/k1p5/1p6/1QN5/2P1P3/4KPqP/8 w - - 0 27","m":["b4a5","a6b7","c4d6","b7b8","a5d8"],"alts":[]},
{"f":"3r4/4kp1p/1PQ1p1p1/p3b3/1p2P2P/1P5K/6P1/8 b - - 2 36","m":["d8d3","g2g3","d3g3","h3h2","g3c3"],"alts":[]},
{"f":"1r6/p2kp1P1/3p4/2pP4/2P2B2/1N6/p4PK1/8 w - - 0 42","m":["b3c5","d6c5","f4b8","a2a1q","g7g8q"],"alts":[]},
{"f":"4r1k1/ppq3pp/2p2p2/4r3/4p1Q1/P5RP/1P3PP1/3R2K1 w - - 4 35","m":["d1d7","c7d7","g4d7"],"alts":[]},
{"f":"5kr1/pp1b1p2/4p2p/2KpP2B/5P2/P5R1/7P/8 w - - 5 35","m":["g3g8","f8g8","c5d6"],"alts":[]},
{"f":"r6k/3NR1p1/4n2p/5b1P/p7/6R1/8/6K1 b - - 0 43","m":["a4a3","g3a3","a8a3","e7e8","h8h7"],"alts":[]},
{"f":"3r2k1/1b4bR/p2P2p1/3p2N1/2p5/2P2N2/PP6/2K5 w - - 0 29","m":["h7g7","g8g7","g5e6","g7g8","e6d8"],"alts":[]},
{"f":"2KQ4/8/5b2/p1B5/P7/3k4/6p1/8 b - - 0 77","m":["f6d8","c8d8","d3c4"],"alts":[]},
{"f":"8/6p1/2B2n2/3b2k1/3B4/6K1/4P3/8 w - - 5 45","m":["d4f6","g5f5","c6d5"],"alts":[]},
{"f":"8/5p1k/5Ppb/2p3P1/qp6/8/KB5Q/8 w - - 5 59","m":["a2b1","a4d1","b2c1"],"alts":[]},
{"f":"8/8/3p4/4kp2/1pP3pP/2RK2P1/8/8 b - - 0 42","m":["b4c3","d3c3","f5f4","c3d3","f4g3"],"alts":[]}]},"3-7":{"src":"https://lichess.org/study/2SV6ZvX7/06csTyjJ","puzzles":[{"f":"8/1pk2p2/6p1/R5K1/2pP4/2P5/1P4P1/7r b - - 0 1","m":["h1h5"],"alts":[]},
{"f":"4r3/pp5p/4k3/2p1r3/3p4/PP1P4/3KR2P/5R2 w - - 2 32","m":["e2e5","e6e5","f1e1","e5d6","e1e8"],"alts":[]},
{"f":"8/5p2/8/4kP2/6P1/R2K4/P7/6r1 b - - 0 45","m":["g1g3","d3e2","g3a3"],"alts":[]},
{"f":"r1b2rk1/5ppp/4p3/1B6/1P6/5P2/2PR2PP/2K4R b - - 0 18","m":["a8a1","c1b2","a1h1"],"alts":[]},
{"f":"8/8/2k5/P2RK1p1/8/5P2/r7/8 b - - 6 57","m":["a2e2","e5d4","e2d2","d4e3","d2d5"],"alts":[]},
{"f":"7R/8/8/8/r2k4/4p3/8/4K3 w - - 2 58","m":["h8h4","d4c3","h4a4"],"alts":[]},
{"f":"r5k1/2p2ppp/1q6/2p1P3/8/5QB1/r4PPP/R5K1 w - - 0 28","m":["f3a8","a2a8","a1a8","b6b8","a8b8"],"alts":[]},
{"f":"4r1k1/1p3p1p/p3p1pQ/3b4/7R/1P1P1P2/2r3PP/q3NK1R w - - 0 25","m":["h6h7","g8f8","h7h8","a1h8","h4h8","f8g7","h8e8"],"alts":[]},
{"f":"2k4r/p2p4/8/1pp2p2/5P2/3P1Q2/qP5P/5R1K w - - 0 33","m":["f3a8","c8c7","a8h8","a2d5","h1g1"],"alts":[]},
{"f":"8/5p2/Q6p/1p2k2q/3pp3/2r5/6R1/6K1 w - - 2 42","m":["a6b5","e5d6","b5h5"],"alts":[]},
{"f":"8/3R2pp/2rP1pk1/2b5/8/P6P/1P3P2/1K6 w - - 1 45","m":["d7c7","c6d6","c7c5"],"alts":[]},
{"f":"rb4k1/2q3pp/P3pp2/3p4/1Q1P4/3NP3/2P2PPP/R5K1 b - - 3 26","m":["c7h2","g1f1","h2h1","f1e2","h1a1"],"alts":[]},
{"f":"1R2b3/4P3/R7/3p1p1k/pK1P1P2/r7/8/8 b - - 5 56","m":["a3b3","b4c5","b3b8"],"alts":[]},
{"f":"8/1R2B3/5p2/4bP1p/p1k4r/5K2/8/8 w - - 8 46","m":["b7b4","c4d5","b4h4"],"alts":[]},
{"f":"8/r4pp1/2k1p2p/8/pK1PP3/5PP1/6P1/1R6 b - - 2 35","m":["a7b7","b4a4","b7b1"],"alts":[]}]},"3-8":{"src":"https://lichess.org/study/dMXnI1aK","puzzles":[{"f":"4k3/1ppr2p1/5n1p/1B6/1P6/4PP2/P4K1P/3R4 b - - 0 1","m":["c7c6"],"alts":[]},
{"f":"3r4/6pp/pNnNpk2/1p6/3p1R2/8/PPP2PPK/8 b - - 5 32","m":["f6e5","d6f7","e5f4","f7d8","c6d8"],"alts":[]},
{"f":"4r1k1/1b1r1pPp/4p3/p5B1/5Q2/1P6/PbR3RP/7K b - - 0 36","m":["d7d1","f4f1","d1f1"],"alts":[]},
{"f":"8/8/1p2pk2/p1p3P1/P1Pp3K/1P1P4/8/8 b - - 0 42","m":["f6g6","h4g4","e6e5"],"alts":[]},
{"f":"5r2/7P/5K2/8/2P2k2/P7/8/8 w - - 1 69","m":["f6g7","f8d8","h7h8q","d8h8","g7h8","f4e4","a3a4","e4d4","a4a5"],"alts":[]},
{"f":"8/8/k6p/p4p1P/K1p1pP2/2P1P3/1P6/8 b - - 0 49","m":["a6b6","a4a3","b6b5","a3a2","b5a4"],"alts":[]},
{"f":"r5k1/1pn2p1p/p2p2p1/2pP3P/P1Pb2q1/3B2B1/1P2QP2/R4RK1 b - - 0 21","m":["g4g3","g1h1","g3h3"],"alts":[]},
{"f":"2r1r1k1/2q4p/4pp1Q/p2p3R/3P4/2P4P/P4PP1/6K1 w - - 1 28","m":["h6f6","c7g7","h5g5","g7g5","f6g5"],"alts":[]},
{"f":"r3qr1k/1p2b1p1/4p1Qp/2ppP3/p4P2/2P1P1P1/PP4P1/1K1R3R w - - 1 21","m":["h1h6","g7h6","g6h6","h8g8","d1h1"],"alts":[]},
{"f":"2r1k2r/1p2bppp/1q1p4/p2Pp1P1/P4n1P/1N3P2/1PPQ4/2KR1B1R b k - 0 17","m":["b6b3","f1b5","e8f8"],"alts":[]},
{"f":"r2qk2r/bpp5/p5n1/3P4/4P3/6Bb/PP4BK/R2Q1R2 w kq - 0 21","m":["g2h3","d8d7","f1f5"],"alts":[]},
{"f":"8/pp4k1/2b2pr1/3R4/PP1Q4/8/7P/7K b - - 0 31","m":["g6g5","h2h4","g5d5","d4d5","c6d5"],"alts":[]}]},"3-9":{"src":"https://lichess.org/study/mSAOaeqN/eYak86eR","puzzles":[{"f":"3r1rk1/p4pp1/b1p4p/8/BPP5/P2P3P/2Q3P1/qNB4K w - - 0 28","m":["c1b2","a1b2","c2b2"],"alts":[]},
{"f":"8/4R3/p4kpp/3B4/5q2/8/5P1P/6K1 w - - 6 41","m":["e7f7","f6e5","f7f4"],"alts":[]},
{"f":"r1b1k1nr/ppp2pbp/3p1qp1/4p3/2BnP3/N2P2QP/PPP2PP1/R1B1K2R w KQkq - 0 10","m":["c1g5","f6g5","g3g5"],"alts":[]},
{"f":"3r3r/pQNk1ppp/1qnR1n2/1B6/8/8/PPP3PP/5R1K b - - 0 19","m":["d7d6","b7b6","a7b6"],"alts":[]},
{"f":"5Q2/8/1bk1p1p1/5p2/3p4/5qPK/7P/8 w - - 2 52","m":["f8a8","c6d6","a8f3"],"alts":[]},
{"f":"3r1r1k/1p4p1/p1p3Qp/2q5/8/3n1N1P/PP1R2P1/5R1K w - - 8 29","m":["d2d3","d8d3","g6d3"],"alts":[]},
{"f":"2r1q1k1/8/b2b1r1p/Pp1pNpp1/P2Pn3/1RPQ3P/2B1NPP1/4R1K1 b - - 0 28","m":["b5a4","d3a6","a4b3"],"alts":[]},
{"f":"r4rk1/pp2Bppp/2n1b3/q1pp4/8/P1Q2NP1/1PP1PP1P/2KR3R b - - 1 15","m":["a5c3","b2c3","c6e7"],"alts":[]},
{"f":"8/5P2/2p5/K2b3p/7N/P1k5/8/8 b - - 0 63","m":["d5f7","a5b6","f7d5","b6c5","c3b3"],"alts":[]},
{"f":"r5k1/pp4p1/1n6/3pB3/3P2pb/2N2Q2/PP6/2K3R1 b - - 0 24","m":["g4f3","g1g7","g8f8"],"alts":[]}]},"3-10":{"src":"https://lichess.org/study/kP7xaVHA/irKTLPXb","puzzles":[{"f":"2k5/8/3K4/2P5/8/8/8/8 w - - 0 1","m":["d6c6","c8b8","c6d7","b8b7","c5c6","b7b8","c6c7"],"alts":[]},
{"f":"8/4P1k1/8/3K4/6P1/p7/8/8 b - - 0 75","m":["g7f7","e7e8q","f7e8"],"alts":[]},
{"f":"8/8/4k1p1/1p1p3p/pP3P1P/P1P2K2/8/8 b - - 4 52","m":["e6f5","f3e3","f5g4"],"alts":[]},
{"f":"8/8/8/1K6/8/pPk5/P7/8 b - - 2 53","m":["c3b2","b5c4","b2a2","c4c3","a2b1","b3b4","a3a2"],"alts":[]},
{"f":"8/8/p7/2K1p3/1pP5/1P1k4/P7/8 b - - 0 42","m":["e5e4","c5b6","e4e3","c4c5","e3e2"],"alts":[]},
{"f":"8/8/1p5p/p1k2K2/P7/1P5P/8/8 b - - 2 49","m":["c5b4","f5g6","b4b3","g6h6","b3a4"],"alts":[]},
{"f":"8/8/7p/pk3p1P/3K1Pp1/1P4P1/8/8 b - - 6 52","m":["b5b4","d4e5","b4b3"],"alts":[]},
{"f":"8/2p5/1p1p4/p2Pk1p1/P1P1P1P1/3K4/8/8 b - - 0 36","m":["e5f4","d3d4","f4g4"],"alts":[]},
{"f":"8/1k6/1P1Kp1p1/3pP3/7P/8/8/8 b - - 2 48","m":["d5d4","d6e6","d4d3"],"alts":[]},
{"f":"8/8/5k2/1p3pp1/p1p2P1p/P1P1KP1P/1P6/8 w - - 0 47","m":["f4g5","f6g5","f3f4","g5g6","e3d4"],"alts":[]},
{"f":"8/7p/4K2P/8/5k2/8/8/8 w - - 5 54","m":["e6f6","f4e4","f6g7","e4f5","g7h7","f5f6","h7g8"],"alts":[]},
{"f":"8/5p1p/3p1kp1/3P4/5PPP/8/3K4/8 b - - 0 44","m":["h7h5","g4g5","f6f5"],"alts":[]},
{"f":"8/8/4K3/Pp6/3k4/8/8/8 w - - 0 68","m":["a5a6","b5b4","a6a7","b4b3","a7a8q"],"alts":[]},
{"f":"8/6k1/4p3/6Kp/3P4/5P2/8/8 w - - 1 45","m":["g5h5","g7f6","h5g4"],"alts":[]},
{"f":"8/3k4/3p1p2/2p2P2/p1Kp2P1/P2P4/2P5/8 b - - 1 34","m":["d7c6","c2c3","d6d5"],"alts":[]}]},"3-11":{"src":"https://lichess.org/study/x1vTVIn2/IKdbD71Q","puzzles":[{"f":"r1bqk2r/ppppn1pp/5n2/1B1P2N1/1b6/2N5/PP3PPP/R1BQK2R w - - 0 1","m":["g5e6"],"alts":[]},
{"f":"r6r/4kppp/2pNpnq1/p1P1n3/8/B3P3/PP1Q1PPP/3R1RK1 b - - 8 20","m":["e5f3","g1h1","f3d2"],"alts":[]},
{"f":"r1krR3/ppp2B2/5p1p/8/8/8/PPP2PPP/2K5 w - - 2 21","m":["f7e6","c8b8","e8d8"],"alts":[]},
{"f":"4Q3/2B3k1/4p2p/2P3p1/3P4/4p3/6PP/4qNK1 b - - 1 34","m":["e1f2","g1h1","f2f1"],"alts":[]},
{"f":"r1b2r2/pp2bpkp/1qn1p2p/3pP3/3P4/5NN1/PP1QBPPP/R3K2R b KQ - 7 12","m":["e7b4","e1c1","b4d2"],"alts":[]},
{"f":"1r3r2/Q1qk3p/2pp1npb/2p2P2/8/2N5/PP3PPP/4RRK1 w - - 1 20","m":["e1e7","d7e7","a7c7"],"alts":[]},
{"f":"1k1r3r/1Bq1b1p1/p2p4/2n1p1P1/4P3/4BP2/1PPQN3/2KR3R b - - 0 24","m":["c5b3","c1b1","b3d2"],"alts":[]},
{"f":"8/p6p/3b2pk/5p1n/2B4q/1P3P2/P5QP/3R3K b - - 11 35","m":["h5g3","g2g3","d6g3"],"alts":[]},
{"f":"2R5/5pk1/pb4p1/1p1q4/3P1P1p/P3r2P/1PQ3P1/3R3K b - - 7 45","m":["e3h3","h1g1","b6d4","d1d4","d5d4"],"alts":[]},
{"f":"1r3k1r/pNqnppb1/6pn/2p3Np/7P/2P2Q2/PP3PP1/R1B1K2R w KQ - 3 16","m":["g5e6","f8g8","e6c7"],"alts":[]},
{"f":"1Q6/3kr3/2q4p/2p1pp1P/2Bb4/1P6/P6K/4R3 w - - 5 44","m":["c4b5","c6b5","b8b5"],"alts":[]},
{"f":"4rk2/p4q2/1p3Q1b/8/1p5N/2P1p3/P3P3/2K5 w - - 1 44","m":["h4g6","f8g8","f6h8"],"alts":[]},
{"f":"3r2k1/1p2R3/7p/P4rpB/8/2n3P1/1q4PP/3R2K1 w - - 2 33","m":["d1d8","f5f8","h5f7","g8h8","d8f8"],"alts":[]},
{"f":"3rr1k1/1p3pq1/p1n1b2p/2b3p1/QP6/P2BPNB1/5PPP/R2R2K1 b - - 0 20","m":["d8d3","d1d3","g7a1"],"alts":[]}]},"4-0":{"src":"https://lichess.org/study/t5pXfLox/34DdnZYk","puzzles":[{"f":"8/4n1k1/4P3/3p2PP/rp1P4/3K4/P4R2/8 b - - 1 47","m":["a4a3","d3c2","a3a2","c2b3","a2f2"],"alts":[]},
{"f":"r2k3r/pp1n2p1/3bpnBp/2qp4/3Q1BPP/P1N1P3/1PP2P2/R4RK1 b - - 3 15","m":["c5d4","e3d4","d6f4"],"alts":[]},
{"f":"r3r1k1/ppp1Bpp1/6p1/1P6/3P2n1/1QP2N2/P4PPq/R3RK2 b - - 3 23","m":["h2h1","f3g1","g4h2","f1e2","e8e7"],"alts":[]},
{"f":"3k4/p3q3/2Q2pb1/7p/2B1P3/2b2PPp/P6P/7K w - - 0 30","m":["c6a8","d8c7","a8a7"],"alts":[]},
{"f":"2b5/p1p2kqp/1p1p2p1/3P4/1PP5/4QPn1/P2K2P1/R3R3 b - - 12 37","m":["g7b2","d2d1","b2a1"],"alts":[]},
{"f":"r2q1rk1/pppb1ppp/1b3n2/4B3/2Q5/2N5/PPP3PP/2KR1B1R w - - 1 13","m":["e5f6","d8f6","d1d7"],"alts":[]},
{"f":"1r1q1k1r/3bbBp1/p1pp1nnp/P3p3/2Q1P3/5N2/1PP1NPPP/R1B2RK1 b - - 2 15","m":["d6d5","f7g6","d5c4"],"alts":[]},
{"f":"r1bqnrk1/pp1p1p1p/2n1p1p1/4b3/2BN4/2N4P/PPP2PP1/R1BQR1K1 w - - 0 11","m":["d4c6","b7c6","e1e5"],"alts":[]},
{"f":"r4rk1/1p3pp1/p2b1n1p/2p1N3/P3q1b1/2P2N2/1P4PP/R1B1QRK1 w - - 0 19","m":["e1e4","f6e4","e5g4"],"alts":[]},
{"f":"r3qr2/pp3pk1/3p1np1/2pPp2p/4P2P/P1Q2P1B/1PP2P2/2KR3R w - c6 0 19","m":["d5c6","e8c6","c3c6","b7c6","d1d6"],"alts":[]},
{"f":"7k/1bq3n1/pp1r2B1/8/2p5/1P2Q2P/P2N2P1/7K w - - 2 36","m":["e3h6","h8g8","h6h7","g8f8","h7h8","f8e7","h8g7"],"alts":[]},
{"f":"6rk/8/4r2p/2ppNq2/Pb1p1P2/1P1P3P/4R2Q/5R1K b - - 2 38","m":["e6e5","e2e5","f5d3"],"alts":[]},
{"f":"1k1r4/ppp2pb1/4b2p/5qp1/1P3p2/5N2/1P3QPP/R1BrR1K1 w - - 3 23","m":["f2a7","b8c8","a7a8","c8d7","e1d1"],"alts":[]},
{"f":"3r2k1/4qp2/4r1pp/1p6/pP5P/4bRP1/P1B1Q1P1/5R1K b - - 2 30","m":["d8d2","e2b5","d2c2"],"alts":[]},
{"f":"5r1k/pp5p/n1q5/3Q1Bp1/4P3/2P2P2/P6P/6RK b - - 0 28","m":["c6d5","e4d5","f8f5"],"alts":[]}]},"4-1":{"src":"https://lichess.org/study/6BtkIYoH/jyX4KueF","puzzles":[{"f":"r6r/pp2kb2/3p1p2/1N1Pp3/3bP3/P2B2P1/1P1Q2PP/7K b - - 7 28","m":["h8h2","h1h2","a8h8","d2h6","h8h6"],"alts":[]},
{"f":"2r5/4ppkp/6p1/1p6/1P6/P3B3/1br2PPP/1R1R2K1 w - - 3 23","m":["b1b2","c2b2","e3d4","f7f6","d4b2"],"alts":[]},
{"f":"3rk2r/pp2qpp1/2b1pn2/6Np/2p4P/2N1RP2/PPPQ2P1/2KR4 w k - 2 18","m":["d2d8","e7d8","d1d8","e8d8","g5f7"],"alts":[]},
{"f":"5r2/pp1k4/4p1b1/3pP1Np/3P1P1K/8/P7/2R5 w - - 8 43","m":["c1c7","d7c7","g5e6","c7b6","e6f8"],"alts":[]},
{"f":"2rr2k1/5ppp/p7/1p1nP3/1B1P1PP1/PK5P/2R5/3R4 b - - 5 30","m":["c8c2","b3c2","d5e3","c2d3","e3d1"],"alts":[]},
{"f":"3r3k/pp4bp/3Bn1p1/7n/8/8/PP3P1K/3R1RN1 b - - 2 27","m":["d8d6","d1d6","g7e5","h2h1","e5d6"],"alts":[]},
{"f":"2k4r/ppp2ppr/2n5/3b1N2/3p1bP1/5NP1/PPP1QPK1/R3R3 b - - 2 20","m":["h7h2","g2f1","h2h1","f3g1","h1g1","f1g1","h8h1"],"alts":[]},
{"f":"r7/1pp4k/p2p3p/3Ppq2/2P2bb1/1N2R3/PPQ5/1K1N2R1 b - - 9 27","m":["f5c2","b1c2","g4d1","g1d1","f4e3"],"alts":[]},
{"f":"r2qkb1r/pp1nppp1/2p2n1p/3p1b2/2PP4/BP2PN2/P4PPP/RN1QKB1R b KQkq - 0 7","m":["f5b1","a1b1","d8a5","b3b4","a5a3"],"alts":[]},
{"f":"r2qk2r/1p2bp2/p2pp1p1/8/4b2P/4B3/PPPQB3/2K3RR w kq - 0 18","m":["d2d4","e4h1","d4h8","e8d7","h8d8"],"alts":[]},
{"f":"6k1/5p1p/B2bp2q/5p2/6rP/1P4P1/1Q3P2/3R3K b - - 4 34","m":["g4h4","g3h4","h6h4","h1g2","h4g4","g2f1","g4d1"],"alts":[]}]},"4-2":{"src":"https://lichess.org/study/Gwg29Hxj/Y6li8kPN","puzzles":[{"f":"4rk2/1q3pp1/4P3/8/1b5Q/8/8/3K3R w - - 0 1","m":["e6e7","b4e7","h4h8"],"alts":[]},
{"f":"5r2/6pk/R3bn1p/8/1P6/P2PqB2/1B2P2P/6RK w - - 1 31","m":["f3e4","h7h8","a6e6"],"alts":[]},
{"f":"6r1/Rb4r1/pPp1p3/2Pp1pk1/3P4/4P1p1/5K1P/6R1 w - - 0 34","m":["g1g3","g5f6","a7b7","g7b7","g3g8"],"alts":[]},
{"f":"2r5/1p5k/p2q2pb/3p1bQn/3B4/P1NP1N1P/1P6/K3R3 w - - 1 34","m":["e1e7","h7g8","g5h6"],"alts":[]},
{"f":"6k1/p4rp1/8/2p1Bq1p/2P1b3/2P3QP/P5PK/4R3 b - - 1 30","m":["h5h4","g3h4","f5e5"],"alts":[]},
{"f":"r7/pp1Qp1B1/3b4/3k4/4q3/8/PP3PP1/5K2 w - - 5 35","m":["d7b7","d5e6","b7e4"],"alts":[]},
{"f":"6k1/p4pp1/Qp3q1p/2p1R3/8/2P2N1P/P1P2PPK/2r5 b - - 5 24","m":["f6f4","g2g3","f4f3","e5e8","g8h7","a6d3","f3d3"],"alts":[]},
{"f":"r1bqk2r/p3nppp/3p4/1pp5/4P3/4Q3/PPP2PPP/2KR1B1R w kq - 0 12","m":["f1b5","c8d7","d1d6","d7b5","d6d8"],"alts":[]},
{"f":"r6k/6pp/p7/Qp6/2b5/7P/Pq4P1/R3R2K b - - 1 28","m":["c4d5","e1g1","d5g2","g1g2","b2a1"],"alts":[]},
{"f":"r3r3/R3nkb1/5p2/3p4/3P2N1/2P1R1PP/5P2/5K2 w - - 11 35","m":["e3e7","e8e7","a7a8"],"alts":[]},
{"f":"3r2r1/p3kp1p/2q1p3/2p2p2/5Q2/6N1/PPP3PP/3R2K1 w - - 2 22","m":["f4h4","f7f6","h4h7","e7f8","d1d8"],"alts":[]},
{"f":"8/8/3r3p/p1P1k3/4pp2/PPK5/3p2PR/8 w - - 0 41","m":["h2h5","e5e6","h5h6"],"alts":[]},
{"f":"4r1k1/pp3ppp/1q4b1/1Nb5/2Q4B/2P4P/PP3PP1/R5K1 b - - 2 24","m":["e8e4","b5d4","e4h4"],"alts":[]},
{"f":"8/1p3pp1/p1k3p1/3nR3/3P4/Q5P1/P3KP1r/7q w - - 10 33","m":["a3c5","c6d7","e5d5","h1d5","c5d5"],"alts":[]},
{"f":"2r3k1/5p1p/4pQpP/Bb1p4/p2P4/q2BPP2/1rPK2P1/3R3R b - - 0 25","m":["a3d3","d2e1","d3e3"],"alts":[]}]},"4-3":{"src":"https://lichess.org/study/t1PGCxRF","puzzles":[{"f":"2r5/1p6/p2p3R/3qpkP1/4np2/3B4/PP6/1K4R1 w - - 0 32","m":["h6f6"],"alts":[]},
{"f":"4Q3/6bk/6pp/pp6/8/P2qBP1P/1P6/K1R5 b - - 0 37","m":["d3a3","a1b1","a3b2"],"alts":[]},
{"f":"5r2/2p2pbk/4p1p1/7p/1q3P1n/pP3Q2/P5P1/1BBR3K w - - 0 29","m":["f3h5","h7g8","h5h4"],"alts":[]},
{"f":"r3q1r1/1ppn3k/p2p1N1b/3Pp1Bp/1PP4P/5P1Q/P7/2K2RR1 b - - 10 27","m":["d7f6","g5h6","h7h6"],"alts":[]},
{"f":"3r3k/6p1/4Q3/4B3/1p3P2/4PKP1/3q4/8 w - - 18 52","m":["e6h6","h8g8","h6g7"],"alts":[]},
{"f":"2r2r2/1b4pk/p5qp/2p2p1Q/4pP2/2P1R2N/PP4PP/2R3K1 w - - 5 33","m":["h3g5","g6g5","f4g5"],"alts":[]},
{"f":"r1bq4/p3p1bk/2p3p1/3pn2p/8/2NB3P/PPPBQ1P1/5RK1 w - - 2 18","m":["e2h5","h7g8","d3g6","e5g6","h5g6"],"alts":[]},
{"f":"2rqrbk1/pp3ppp/8/3p1N2/3NnnQ1/2P4P/PP3PP1/R4RK1 w - - 0 23","m":["f5h6","g8h8","h6f7"],"alts":[]},
{"f":"2N3k1/1p5p/BP4p1/3n1p2/n3p3/6P1/5P1P/6K1 w - - 6 38","m":["a6c4","g8g7","c4d5"],"alts":[]},
{"f":"r4r2/2q1Nb2/5Qpk/2n4p/pp5P/8/1PP2PP1/2KR3R w - - 0 29","m":["e7f5","h6h7","f6g7"],"alts":[]},
{"f":"1k2r3/pp2r2p/2pqbpp1/3n4/3P1p2/1B3N1P/PPQB1PP1/1K1RR3 b - - 3 22","m":["e6f5","c2f5","g6f5"],"alts":[]},
{"f":"5q1k/pr4pp/2p4B/4Q3/7P/2P5/P1PK4/4R3 b - - 6 30","m":["b7d7","d2e2","d7e7","e5e7","f8e7"],"alts":[]},
{"f":"3r2k1/2B1P1pp/1Q3p2/2b5/P3n3/5N2/2q2PPP/5RK1 b - - 0 32","m":["c2f2","f1f2","d8d1","f3e1","d1e1"],"alts":[]},
{"f":"2k2b1r/ppp1ppp1/2n4p/8/3r2Nq/2NPB3/PPP2P2/R2QRBK1 b - - 0 14","m":["d4g4","f1g2","h4h3","d1g4","h3g4"],"alts":[]},
{"f":"2kr3r/1pp2p2/p2p3p/3P1bpB/2P2q2/1P6/P5PP/R2QR2K w - - 0 19","m":["e1f1","f4e5","f1f5","e5f5","h5g4","f5g4","d1g4"],"alts":[]}]},"4-4":{"src":"https://lichess.org/study/pibm2ud9/lDYc6ebt","puzzles":[{"f":"1r4k1/4Pp1p/p5pb/2q5/p2n4/P2Q2B1/r2N1PPP/3KR2R w - - 1 28","m":["e7e8q","b8e8","e1e8"],"alts":[]},
{"f":"2r5/3k1p2/5Pp1/PPBpP1P1/1K5P/5p2/8/8 b - - 2 45","m":["c8c5","b4c5","f3f2"],"alts":[]},
{"f":"8/3P4/8/2k2pbP/8/5K2/8/8 w - - 0 52","m":["h5h6","c5c6","h6h7","c6d7","h7h8q"],"alts":[]},
{"f":"4k3/R5R1/5K1p/1Pp3r1/8/6P1/4p2P/8 b - - 0 53","m":["g5g7","f6g7","e2e1q"],"alts":[]},
{"f":"6R1/8/8/2P5/1K6/3r4/PP3kp1/8 b - - 0 52","m":["d3g3","g8g3","f2g3","c5c6","g2g1q"],"alts":[]},
{"f":"8/8/N1k5/p7/2p5/1P4P1/P6P/6K1 b - - 0 51","m":["c4c3","b3b4","c3c2"],"alts":[]},
{"f":"8/6Rr/7P/3p4/2pk1p2/3R4/6PK/8 b - - 0 57","m":["c4d3","g7h7","d3d2","h7f7","d2d1q"],"alts":[]},
{"f":"2kr4/pp4R1/2p1p1P1/4P3/4p3/2P5/PP6/1K6 b - - 0 28","m":["e4e3","g7h7","e3e2","h7h1","d8d1"],"alts":[]},
{"f":"7R/8/8/P5p1/5k2/1KP5/6rp/8 w - - 2 52","m":["a5a6","g2e2","a6a7"],"alts":[]},
{"f":"8/8/8/3K2kp/2P5/4P3/8/8 b - - 0 50","m":["h5h4","d5e4","g5g4","c4c5","h4h3","e4e5","h3h2","c5c6","h2h1q"],"alts":[]},
{"f":"8/5KP1/R7/2k5/2pp4/8/8/6r1 w - - 2 51","m":["a6g6","g1g6","f7g6","d4d3","g7g8q"],"alts":[]},
{"f":"5r2/1p2Q3/6K1/pk3r2/5P2/3P3P/8/8 b - - 3 46","m":["f8f6","e7f6","f5f6","g6f6","a5a4","f4f5","a4a3","f6g6","a3a2","f5f6","a2a1q"],"alts":[]},
{"f":"6rk/5R2/3p1q1p/3P2pQ/1P2P3/3P1p1P/P1r3PB/1R5K b - - 1 28","m":["f3g2","h1g1","f6d4","f7f2","d4f2"],"alts":[]},
{"f":"8/6pk/8/R7/5Pp1/p5P1/3K3P/r7 b - - 3 46","m":["a3a2","d2c3","a1c1"],"alts":[]},
{"f":"1Q6/K4k2/8/5p2/8/8/1R2p3/2r5 b - - 0 56","m":["c1a1","a7b6","e2e1q","b8c7","e1e7","c7e7","f7e7"],"alts":[]}]},"4-5":{"src":"https://lichess.org/study/wrm58f4j/ZnUsBj0n","puzzles":[{"f":"8/8/8/8/8/1B1k1K2/3pp3/8 w - - 0 1","m":["b3c4","d3c4","f3e2","c4c3","e2d1"],"alts":[]},
{"f":"1n5k/6p1/p2q1rPp/1ppB4/8/3P4/PPP1rPQ1/2K4R w - - 0 26","m":["h1h6","g7h6","g6g7","h8h7","g7g8q"],"alts":[]},
{"f":"8/8/2p5/6R1/2B4P/KP2knp1/P1P5/8 b - - 1 45","m":["f3g5","h4g5","g3g2"],"alts":[]},
{"f":"8/7p/1P6/7P/2n1p3/8/2pBK3/1k6 w - - 2 48","m":["b6b7","c2c1q","d2c1"],"alts":[]},
{"f":"8/6kp/p2P2b1/2p5/2P5/P5P1/2rR1K2/8 w - - 0 41","m":["d2c2","g6c2","d6d7"],"alts":[]},
{"f":"4r1k1/8/2PP1b2/p5p1/1p5p/1P2p3/4K2B/8 w - - 0 41","m":["d6d7","e8d8","c6c7","d8d7","c7c8q"],"alts":[]},
{"f":"r1b5/R4pkp/3p2p1/2pPr3/2P5/1P1B4/5PPP/R5K1 b - - 0 24","m":["a8a7","a1a7","e5e1","d3f1","c8f5"],"alts":[]},
{"f":"3r2k1/pp4bp/4qpp1/3Pp3/8/4Q2P/4B1P1/2rR3K w - - 0 27","m":["d5e6","d8d1","e2d1","c1d1","h1h2"],"alts":[]},
{"f":"8/7K/6p1/5p2/4p3/1k4P1/5P1P/8 b - - 0 44","m":["g6g5","g3g4","f5f4"],"alts":[]},
{"f":"8/2p5/p1n5/1pP1p2k/1P1p4/P2P3q/5P2/R4KR1 w - - 0 35","m":["f1e2","e5e4","g1h1","e4d3","e2d2"],"alts":[]},
{"f":"7R/8/8/6p1/2p1p1k1/2Pb3p/P4K2/8 b - - 5 71","m":["e4e3","f2e3","g4g3"],"alts":[]},
{"f":"8/2p3k1/1p1p2Pn/p2P1K1P/P1P5/1P6/8/8 w - - 3 54","m":["f5e6","h6g8","e6d7"],"alts":[]},
{"f":"8/P1q4p/5pk1/6p1/5P2/6KP/5QP1/7r w - - 0 52","m":["a7a8q","c7c3","a8f3"],"alts":[]},
{"f":"3r2k1/p4B1p/1p3qp1/5b2/8/1Qr1PP1P/P2R1KP1/7R b - - 0 23","m":["g8g7","b3c3","f6c3"],"alts":[]},
{"f":"2r5/2r3k1/p3b1pp/3pn3/3R4/4P1N1/PQ4PP/R1q3K1 w - - 8 33","m":["a1c1","c7c1","g3f1"],"alts":[]}]},"4-6":{"src":"https://lichess.org/study/uNWgETUd/XtI3rvDK","puzzles":[{"f":"r6r/pb1k1p2/2nPp3/2b4p/1pP1B1q1/3Q1NB1/1P3PPP/R2R2K1 w - - 0 1","m":["e4c6","d7c6","f3e5","c6b6","e5d7","b6c6","d7c5"],"alts":[]},
{"f":"8/p7/2R3p1/4Nn2/2P2k1p/7K/Pr6/8 w - - 4 51","m":["e5d3","f4g5","d3b2"],"alts":[]},
{"f":"4Q3/p3r3/1pp1k1pR/5p2/4p1q1/8/PP3P2/5K2 w - - 4 47","m":["h6g6","g4g6","e8g6"],"alts":[]},
{"f":"8/Q7/7r/8/6K1/1r4p1/4k1P1/8 w - - 3 65","m":["a7a2","e2e3","a2b3"],"alts":[]},
{"f":"2r1r1k1/p3qpbp/1p1p1np1/4P3/3B1P2/1P3bP1/PQ1N3P/1R2R1K1 w - - 0 22","m":["e5f6","e7e1","b1e1","e8e1","g1f2"],"alts":[]},
{"f":"3r2k1/5ppp/b3p3/3q4/3r4/R2PQP1P/3R1NPK/8 b - - 0 35","m":["d5d6","h2h1","d6a3"],"alts":[]},
{"f":"2r5/pR5p/5p1k/4p3/4R3/B4nPP/PP3P2/1K6 b - - 0 27","m":["f3d2","b1a1","c8c1"],"alts":[]},
{"f":"5r1k/1pN3p1/7p/pP6/P3P3/2PP3P/3BnbPK/R7 b - - 0 27","m":["f2g3","h2h1","g3c7"],"alts":[]},
{"f":"8/2R2ppp/4p3/p6k/6R1/4P2P/3q1PP1/6K1 b - - 3 33","m":["d2d1","g1h2","d1d6","g2g3","d6c7"],"alts":[]},
{"f":"2rqr1k1/B2b1ppp/5n2/8/7Q/3B4/P1P2PPP/R3R1K1 b - - 4 22","m":["e8e1","a1e1","d8a5","e1a1","a5a7"],"alts":[]},
{"f":"8/pp4k1/2p3p1/3nRr2/3P1PK1/2P5/PP6/5R2 b - - 0 36","m":["f5e5","d4e5","d5e3","g4f3","e3f1"],"alts":[]},
{"f":"3r4/6p1/5p1p/r1kp4/Pp3q2/2pR3P/2Q2PP1/3R2K1 w - - 5 40","m":["d3c3","b4c3","c2c3","c5d6","c3a5"],"alts":[]}]},"4-7":{"src":"https://lichess.org/study/HDoz7iiZ/jtw6t01P","puzzles":[{"f":"5k1r/pp3pp1/n1p4p/5N2/7Q/8/PqPr1PPP/R3R1K1 w - - 0 1","m":["e1e8","f8e8","h4e7"],"alts":[]},
{"f":"2r5/2r3k1/1p2Qp1p/p2p2p1/3P4/4P1P1/PPq2P1R/KR6 b - - 0 30","m":["c2b1","a1b1","c7c1"],"alts":[]},
{"f":"r5k1/1p3p2/2p1ppp1/3p4/2nP4/1QB4P/rPP1BPP1/qNKR3R b - - 4 22","m":["a1b1","c1b1","a2a1"],"alts":[]},
{"f":"r2qk3/5p1r/p1p1p3/1p1pP1N1/P1nP2Pn/2P3B1/2P2P2/R1QR2K1 b q - 0 21","m":["d8g5","c1g5","h4f3","g1g2","f3g5"],"alts":[]},
{"f":"3r2k1/pR3pp1/8/5p1p/5q2/5n2/PP4R1/6QK w - - 0 30","m":["g2g7","g8h8","g7h7","h8h7","b7f7","h7h8","g1g7"],"alts":[]},
{"f":"2k4r/ppp1q1p1/3b2p1/3Q4/1P2NPn1/P1P5/6P1/R1B2RKN b - - 0 21","m":["h8h1","g1h1","e7h4","h1g1","h4h2"],"alts":[]},
{"f":"r3k1nr/pp3ppp/1q2b3/8/1n1B4/6P1/P2QPPBP/R3K1NR b KQkq - 0 13","m":["b6d4","d2d4","b4c2","e1f1","c2d4"],"alts":[]},
{"f":"5rk1/R5bp/q2p4/3Ppn1p/4Q3/4B2P/5PP1/5RK1 b - - 0 24","m":["a6f1","g1f1","f5g3","f1e1","g3e4"],"alts":[]},
{"f":"2b5/2Q2p2/k7/1q2P3/1p6/1N3P2/1PP5/2K5 b - - 0 38","m":["b5f1","c1d2","f1f2","d2d3","c8f5","d3c4","f2c2","c4b4","c2c7"],"alts":[]},
{"f":"7k/p5pp/8/3Q4/8/5r1b/PP3q1P/3N2RK b - - 1 28","m":["f2g1","h1g1","f3f1"],"alts":[]},
{"f":"5r2/pp3pk1/2p1pRp1/6Qp/2P5/P7/1q1r2PP/5R1K w - - 2 32","m":["f6g6","f7g6","g5e7","g7h6","e7f8","b2g7","f8f4","h6h7","f4d2"],"alts":[]},
{"f":"r4rk1/1q1p2pp/p3p3/2p1Q3/8/1B6/PPP2PbP/3RR1K1 w - - 0 22","m":["d1d7","b7d7","b3e6","g8h8","e6d7"],"alts":[]},
{"f":"q4r1k/5pbp/2Np1np1/3b2B1/pQ6/5B2/P4PPP/4R1K1 w - - 0 24","m":["g5f6","d5c6","f6g7","h8g7","b4c3"],"alts":[]},
{"f":"5Q2/pp1kpp2/3p1n2/2pP4/2P1P3/2q2PK1/8/5B2 w - - 2 34","m":["f1h3","d7c7","f8e7"],"alts":[]},
{"f":"4r1k1/1q3ppp/3B1n2/p2P4/8/PQ5P/5PPN/1R4K1 b - - 0 27","m":["e8e1","b1e1","b7b3"],"alts":[]}]},"4-8":{"src":"https://lichess.org/study/pvepHzju/NzJust3T","puzzles":[{"f":"r3r1k1/1p3p1p/p1p3p1/8/6bP/Q3b1P1/PP2B3/R3K2R b KQ - 0 20","m":["g4e2","e1e2","e3c5","e2f3","c5a3"],"alts":[]},
{"f":"r1b2rk1/ppq2p1p/6p1/4b2Q/4R3/3B4/PP3PPP/R1B3K1 w - - 0 16","m":["h5e5","c7e5","e4e5"],"alts":[]},
{"f":"2Q2bk1/5p1p/p5p1/2p3P1/4B3/7P/qPr2P2/2K4R w - - 0 33","m":["e4c2","a2a1","c2b1"],"alts":[]},
{"f":"r4rk1/5ppp/p3bp2/2q2N1Q/Ppp5/8/1PP2PPP/R2R2K1 w - - 0 22","m":["f5h6","g7h6","h5c5"],"alts":[]},
{"f":"r2r2k1/1p2qppp/2n1p3/5Q2/p2P4/P4N2/BP3PPP/2R1R1K1 b - - 0 20","m":["e6f5","e1e7","c6e7"],"alts":[]},
{"f":"5rk1/1p3ppp/pq1Q1b2/8/8/1P3N2/P4PPP/3R2K1 b - - 3 27","m":["f8d8","d6d8","f6d8"],"alts":[]},
{"f":"r3r1k1/p2Q1p1p/1p2p1p1/8/1P1P4/P3P3/1B2Nb1q/2KR3R b - - 1 19","m":["f2e3","c1b1","h2e2"],"alts":[]},
{"f":"3r1rk1/pp2bppp/2ppnn2/8/N1P1P3/q1P4P/P2N2PB/R2Q1R1K w - - 1 17","m":["d2b1","a3a4","d1a4"],"alts":[]},
{"f":"r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2b1/PqP3PP/7K w - - 0 25","m":["e6e7","b2b1","b3c1","b1c1","h6c1"],"alts":[]},
{"f":"6r1/3k4/1K1P4/2P5/R7/5b2/8/8 w - - 1 69","m":["a4a7","d7e6","a7e7","e6d5","d6d7"],"alts":[]}]},"4-9":{"src":"https://lichess.org/study/Vslcoxz5/4s1QtXma","puzzles":[{"f":"3qkb1r/p1p3pp/b3p3/nr3p2/8/P4NP1/1PQNPPBP/R3K2R w - - 0 1","m":["b2b4","f8e7","a1d1","c7c5","b4a5"],"alts":[]},
{"f":"4r3/7P/1p4Q1/1b4B1/1k4n1/8/1P2n1P1/4R2K b - - 3 41","m":["e2g3","h1g1","e8e1"],"alts":[]},
{"f":"1k5r/n1r3pp/5p2/ppN5/5P2/8/2R3PP/1R4K1 w - - 4 29","m":["c5a6","b8b7","a6c7"],"alts":[]},
{"f":"3qk2r/1p1bbppp/4pn2/1BPp1n2/3P4/4PN2/4QPPP/BN2K2R b Kk - 2 15","m":["d8a5","a1c3","a5b5"],"alts":[]},
{"f":"r1bq1rk1/pp2bppp/2pp1n2/8/5P2/2N2N2/PBPPB1PP/R2Q1RK1 b - - 6 11","m":["d8b6","g1h1","b6b2","a1b1","b2a3"],"alts":[]},
{"f":"6k1/5p1p/4p3/4q3/3n4/2Q3P1/PP1N1P1P/6K1 b - - 3 37","m":["d4e2","g1f1","e2c3"],"alts":[]},
{"f":"r3kbnr/ppp1qppp/2n5/1B1pP3/5B2/4PQ2/PPP2PPP/RN2K2R b KQkq - 2 7","m":["e7b4","b1c3","b4b2"],"alts":[]},
{"f":"r4k2/pp3p2/2pNR2p/5Qp1/1P3n2/2KP4/P1P2qPP/8 b - - 7 31","m":["f4d5","c3b3","f2f5","d6f5","f7e6"],"alts":[]},
{"f":"r2q1rk1/p3bpp1/2pp2b1/4p1Q1/4n3/1B3N1P/PPP3P1/R1B2RK1 w - - 1 19","m":["g5g6","d8b6","g1h2"],"alts":[]},
{"f":"r1b1B2k/pp4pp/2pb4/4q3/8/6P1/PPP4P/R2Q1R1K b - - 0 17","m":["e5e4","d1f3","e4e8"],"alts":[]},
{"f":"3r4/5p2/k3p1p1/2B1Pr2/2P3nN/1p4Pp/4QP1P/6K1 b - - 1 34","m":["f5e5","e2f1","e5c5"],"alts":[]},
{"f":"r4k2/ppp3p1/3p3r/2q5/1PNnP3/2Q2PBp/P4R1P/5RK1 b - - 0 25","m":["d4e2","g1h1","c5f2","c3g7","f8g7"],"alts":[]}]},"4-10":{"src":"https://lichess.org/study/zz7pwo79/NNBE4uIt","puzzles":[{"f":"2k5/P4p2/3Rp3/1P1p4/5K2/8/8/r7 w - - 0 1","m":["d6a6","a1a6","b5a6","c8c7","a7a8q"],"alts":[]},
{"f":"r4k1r/pp3pp1/4p3/3pP1np/6Pq/1PP5/P3B1PP/RN1Q1RK1 b - - 0 14","m":["h5g4","e2g4","h4h2"],"alts":[]},
{"f":"3r1rk1/pp2n1pp/3q4/8/N7/1PB5/P3QPPP/4R1K1 w - - 2 26","m":["e2e7","d6e7","e1e7"],"alts":[]},
{"f":"7r/6k1/2b1Rp2/8/P1N3p1/5nP1/5P2/Q4K2 b - - 0 38","m":["h8h1","f1e2","h1a1"],"alts":[]},
{"f":"rnbq1rk1/p4ppp/1p2p3/2p5/2QPn3/B1P1PN2/P3BPPP/R4RK1 b - - 1 11","m":["c8a6","c4a6","b8a6"],"alts":[]},
{"f":"4k2r/1p1qb1p1/p3Rp2/2p4p/8/1Q4B1/PP3PpP/6K1 w k - 2 23","m":["g3d6","d7d6","e6d6"],"alts":[]},
{"f":"8/p1r2p2/4r3/2P1PK2/1P4R1/3R2pk/8/8 b - - 3 46","m":["e6e5","f5e5","h3g4"],"alts":[]},
{"f":"r2q1rk1/p1p1bppp/2pp2b1/4p3/4n1PN/2NP3P/PPP2PK1/R1BQ1R2 w - - 0 12","m":["h4g6","e4c3","g6e7","d8e7","b2c3"],"alts":[]},
{"f":"r2qkb1r/pp4pp/4ppb1/3pN2B/3nnP2/2N5/PPP3PP/R1B1QRK1 w kq - 2 12","m":["e5g6","h7g6","h5g6"],"alts":[]},
{"f":"r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2b1/PqP3PP/7K w - - 0 25","m":["e6e7","b2b1","b3c1","b1c1","h6c1"],"alts":[]}]},"4-11":{"src":"https://lichess.org/study/eo7JyYza/ka7GUiIW","puzzles":[{"f":"6k1/pp3pbp/6p1/7q/2P3nP/PBN2PP1/1P6/3Q2K1 b - - 0 1","m":["h5c5","g1h1","g4f2","h1g2","f2d1","b3d1","c5f8"],"alts":[]},
{"f":"5k2/6p1/p1b3Pp/2N2P1r/p7/8/1KP5/5R2 w - - 0 37","m":["c5e6","f8e7","e6g7"],"alts":[]},
{"f":"r1q3k1/3nbppp/pp2p3/4B3/8/2N2Q2/PPPR1PPP/6K1 w - - 1 19","m":["d2d7","c8d7","f3a8"],"alts":[]},
{"f":"8/p3Q2p/5qp1/4p1k1/8/8/Pr4PP/6K1 w - - 2 37","m":["h2h4","g5f5","g2g4","f5g4","e7f6"],"alts":[]},
{"f":"2k1r3/pppn1pp1/3b2b1/3B2Pp/5P2/3P3P/PPPR4/2K3NR b - - 0 18","m":["e8e1","d2d1","d6f4","c1b1","e1d1"],"alts":[]},
{"f":"8/3R3p/6p1/4k3/2Bnp3/1P5P/P6r/4K3 w - - 2 41","m":["d7d5","e5f4","d5d4"],"alts":[]},
{"f":"5rk1/R4pp1/1p5p/3Q4/1PPp2q1/3P2P1/5P2/4K3 b - - 0 34","m":["f8e8","e1f1","g4h3","d5g2","e8e1","f1e1","h3g2"],"alts":[]},
{"f":"3r1bnr/2p2ppp/2bk4/R7/5P2/2N5/4N1PP/1R4K1 w - - 4 22","m":["b1d1","d6e7","a5e5","e7f6","d1d8"],"alts":[]},
{"f":"r2q1r2/ppp2p2/3p1nk1/4p1p1/2B1P3/2NP2Q1/PPP5/2K4R w - - 1 20","m":["g3h3","f8h8","h3f5","g6g7","f5g5"],"alts":[]},
{"f":"2r2rk1/pp2R3/5p2/3p1q2/3P2P1/4QP1p/PP3R1P/6K1 b - - 0 30","m":["f5b1","f2f1","b1b2","e3e6","g8h8"],"alts":[]}]},"4-12":{"src":"https://lichess.org/study/C1bi0HTS/HtyfEmM3","puzzles":[{"f":"5r1k/p3qp1p/bpr2b2/3p4/3B3P/4P3/PPP3Q1/1KR3R1 w - - 0 1","m":["g2g7","f6g7","d4g7","h8g8","g7f6"],"alts":[]},
{"f":"3r2k1/1p3pp1/pq1b3p/3P4/P7/3Q1N2/1r3PPP/1R1R2K1 b - - 1 23","m":["b6f2","g1h1","f2g2"],"alts":[]},
{"f":"r2qk2r/1p3ppp/2P5/4Pn2/1pPn2b1/3Q1NP1/PP3PBP/RN3RK1 b kq - 0 14","m":["d4f3","d3f3","g4f3"],"alts":[]},
{"f":"2k5/pp4pp/4pr2/2qp1n2/8/2PN2P1/PP4PP/R2Q1R1K b - - 3 20","m":["f5g3","h2g3","f6h6","d1h5","h6h5"],"alts":[]},
{"f":"rnb3k1/pp3p1p/3p2pQ/3Nr3/2P5/3BPN2/Pq1b2PP/3K3n w - - 0 17","m":["d5f6","g8h8","h6h7"],"alts":[]},
{"f":"4r2k/2q4r/2p4Q/p5P1/1p1Pp1P1/2P1N2P/PP6/4bRK1 w - - 1 29","m":["f1f8","e8f8","h6f8"],"alts":[]},
{"f":"r1q1r1k1/p1p2p2/1p3Qpp/3b4/3N4/3B4/PPP4P/3R1RK1 b - - 2 24","m":["c8g4","g1f2","g4g2"],"alts":[]},
{"f":"r6k/3nq1pp/3pBp2/2p1nP2/1p2R2Q/1P5P/r5P1/2B1R1K1 w - - 7 32","m":["h4h7","h8h7","e4h4"],"alts":[]},
{"f":"r2q1r1k/4b1p1/p3b2p/4B1pQ/4P3/1p1p3P/P2P1P2/2KR2R1 w - - 0 23","m":["h5h6","h8g8","h6g7"],"alts":[]},
{"f":"r2q1rk1/1pp2ppp/8/p2pn3/P3N3/3Bb2Q/1P3PPP/R4RK1 w - - 0 18","m":["e4f6","g7f6","h3h7"],"alts":[]},
{"f":"5r2/1bN3k1/5rp1/3Np2p/2PbP3/pP5P/P3R1P1/3R3K b - - 1 34","m":["f6f1","d1f1","f8f1","h1h2","d4g1"],"alts":[]},
{"f":"r4r1k/pppbq1pp/1b3p2/3Bp2R/3P4/2P3P1/PP3P1P/R1BQ2K1 w - - 1 17","m":["h5h7","h8h7","d1h5"],"alts":[]},
{"f":"r1b2rk1/ppp2ppp/8/1B1p4/3bn3/5N2/PPP2qPP/RNBQR2K b - - 1 12","m":["f2g1","f3g1","e4f2"],"alts":[]},
{"f":"3r2k1/1bqPn1pp/p3p3/1pp2pPQ/8/8/PPP4P/1K1R1R2 w - - 0 29","m":["h5e8","d8e8","d7e8q"],"alts":[]},
{"f":"r2q1rk1/pbpn1p1n/1p1bp2Q/8/8/1B1P1NN1/PPP2PPP/R3K2R w KQ - 1 13","m":["g3h5","d8f6","h5f6"],"alts":[]}]},"4-13":{"src":"https://lichess.org/study/7ojMv2O2","puzzles":[{"f":"6k1/p1B2ppp/3n1q2/3Q4/3P4/P5P1/1r1r3P/R4RK1 b - - 0 1","m":["f6d4","d5d4","d2g2","g1h1","g2h2","h1g1","b2g2"],"alts":[]},
{"f":"4r3/p5k1/2R4p/2Pp4/1P1pr1P1/P6P/8/3R3K b - - 0 35","m":["e4e1","d1e1","e8e1","h1g2","d4d3"],"alts":[]},
{"f":"8/7k/R6p/3p4/5r2/2P1p2P/P5P1/6K1 b - - 0 40","m":["e3e2","a6e6","f4f1"],"alts":[]},
{"f":"8/8/8/6R1/2pk2P1/1r5P/6K1/8 b - - 1 48","m":["c4c3","g5g7","c3c2"],"alts":[]},
{"f":"8/5R2/1p2P3/p4r2/P6p/1P3Pk1/4K3/8 b - - 2 64","m":["f5e5","e2f1","e5e6"],"alts":[]},
{"f":"8/8/1p6/k7/P7/1KR4r/8/8 b - - 27 64","m":["h3c3","b3c3","a5a4","c3b2","a4b4"],"alts":[]},
{"f":"8/4kr2/R2p4/1p1Pp3/5pp1/3K1P2/PPP5/8 w - - 0 40","m":["a6a7","e7f6","a7f7","f6f7","f3g4"],"alts":[]},
{"f":"r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2b1/PqP3PP/7K w - - 0 25","m":["e6e7","b2b1","b3c1","b1c1","h6c1"],"alts":[]},
{"f":"8/4k1K1/4P3/6pp/6rP/4R1P1/8/8 b - - 1 60","m":["g5h4","g7h6","h4g3"],"alts":[]},
{"f":"r4rk1/3p1p1p/p2NpQpq/1p1b4/3R4/P7/1P3PPP/3R2K1 w - - 10 24","m":["d4d5","h6g7","f6g7"],"alts":[]}]},"4-14":{"src":"https://lichess.org/study/MTh6EjHF/8TaknmFZ","puzzles":[{"f":"8/4p3/8/5P2/8/2k4P/8/1K6 w - - 0 1","m":["f5f6","e7f6","h3h4","c3d4","h4h5","d4e5","h5h6"],"alts":[]},
{"f":"8/8/5p2/1p1p1k1p/p1pP3P/P1P1K1P1/1P6/8 b - - 1 51","m":["f5g4","e3f2","f6f5","f2g2","f5f4","g3f4","g4f4"],"alts":[]},
{"f":"8/8/1p2pk1p/pP4P1/P2Pp1P1/4P3/3K4/8 b - - 0 43","m":["f6g5","d4d5","e6d5"],"alts":[]},
{"f":"8/8/8/pp6/4k1p1/P1P3P1/1P2K3/8 b - - 3 53","m":["a5a4","b2b3","a4b3"],"alts":[]},
{"f":"8/8/1Pk2p2/4p2p/2K5/5PP1/8/8 b - - 0 43","m":["f6f5","b6b7","c6b7"],"alts":[]},
{"f":"8/8/6p1/3kP3/8/4K3/8/8 b - - 2 56","m":["d5e5","e3f3","e5f5","f3g3","f5g5"],"alts":[]},
{"f":"8/8/5k2/5p1p/7P/4K1P1/8/8 w - - 1 46","m":["e3f4","f6e6","f4g5","e6e5","g5h5","e5f6","h5h6","f5f4","g3f4"],"alts":[]},
{"f":"8/8/6k1/3p1p2/3P2p1/4PPK1/8/8 w - - 1 56","m":["f3g4","g6h6","g4f5"],"alts":[]},
{"f":"8/8/4k1p1/2KpP2P/5P2/8/8/8 b - - 0 53","m":["g6h5","f4f5","e6e5","f5f6","e5f6"],"alts":[]},
{"f":"8/8/p2p4/1ppPpk2/2P5/PP1P1K2/8/8 w - - 0 45","m":["c4b5","a6b5","a3a4","b5a4","b3a4"],"alts":[]},
{"f":"8/1k3p2/1P3P1p/8/4K3/8/8/8 b - - 4 56","m":["b7b6","e4d5","b6c7"],"alts":[]},
{"f":"8/6p1/7p/6P1/4KPk1/8/8/8 w - - 0 52","m":["g5h6","g7h6","f4f5","g4g5","e4e5","h6h5","f5f6"],"alts":[]},
{"f":"8/8/6k1/p1p2ppp/2P2P2/5KPP/P7/8 w - - 0 38","m":["f4g5","g6g5","h3h4"],"alts":[]},
{"f":"8/8/1p1p4/p2P3p/P3pP2/4K1k1/8/8 w - - 0 45","m":["f4f5","h5h4","f5f6","h4h3","f6f7"],"alts":[]},
{"f":"8/8/p2p1ppp/2k5/2p2K1P/P1P2PP1/1P6/8 w - - 1 40","m":["h4h5","g6h5","f4f5"],"alts":[]}]},"4-15":{"src":"https://lichess.org/study/1Joelo2c","puzzles":[{"f":"6k1/Q4pp1/4pq1p/8/8/p7/r4PPP/3R2K1 w - - 0 1","m":["a7b8","g8h7","b8b1","f6g6","b1a2"],"alts":[]},
{"f":"6k1/pp2R3/6pp/8/2r5/P4BbP/1P4P1/6K1 w - - 4 39","m":["f3d5","g8f8","e7f7","f8e8","d5c4"],"alts":[]},
{"f":"1k1r1r2/pp4p1/6q1/2Qp4/5NP1/2P4p/PPN4P/R4R1K b - - 0 30","m":["g6e4","h1g1","f8f4"],"alts":[]},
{"f":"r1b3rk/2q2p2/1n2p2n/p2pP1NP/P1pP1QP1/1pP5/1P3PB1/R3R1K1 w - - 5 27","m":["f4f6","g8g7","f6h6"],"alts":[]},
{"f":"4r1k1/5pp1/7R/1p6/8/1PP3QP/2q2PP1/6K1 b - - 0 29","m":["c2c1","g1h2","c1h6"],"alts":[]},
{"f":"r3k2r/ppq1bppp/4pn2/2Ppn3/1P4bP/2P2N2/P3BPP1/RNBQ1RK1 w kq - 3 11","m":["f3e5","c7e5","e2g4"],"alts":[]},
{"f":"5Q1R/5p1p/1b3qp1/p6k/P2P4/8/1P2rPPP/5RK1 b - - 8 32","m":["f6f2","f1f2","e2e1","f2f1","b6d4","g1h1","e1f1"],"alts":[]},
{"f":"8/1N3k2/6p1/8/2P3P1/pr6/R7/5K2 b - - 2 56","m":["b3b1","f1e2","b1b2","e2d1","b2a2"],"alts":[]},
{"f":"4qr2/pR4pk/2b2p1p/4pPP1/3bB3/3P3Q/P1r4P/4BR1K w - - 1 25","m":["h3h6","h7g8","h6g7"],"alts":[]},
{"f":"5r1k/p5p1/1pb4p/3pR3/1Q6/P1P4P/1P3qP1/R6K b - - 1 24","m":["d5d4","e5e2","c6g2"],"alts":[]},
{"f":"1r3k2/5p1p/2p1pp2/P2n4/r3N3/P4PK1/2R2P1P/2R5 w - - 10 30","m":["e4c5","a4a5","c5d7","f8g7","d7b8"],"alts":[]}]},"4-16":{"src":"https://lichess.org/study/WQZY2uhR","puzzles":[{"f":"4k2r/1pb3pp/p4p2/2PNp2b/1PBn4/P5P1/3B1P1P/5RK1 b k - 4 23","m":["d4f3","g1g2","f3d2"],"alts":[]},
{"f":"R7/P4p2/7p/q3k1n1/5R2/7P/5PK1/8 w - - 3 47","m":["a8e8","e5f4","a7a8q","a5a8","e8a8"],"alts":[]},
{"f":"r1b1k2r/ppp2p2/3ppq1p/3Pn1p1/1bP3P1/2N2N2/PP2PPP1/2RQKB1R w Kkq - 1 12","m":["d1a4","e8f8","a4b4"],"alts":[]},
{"f":"8/2p1r1kp/5pp1/3P3r/4P3/2N1QbPq/PPP2R1P/5RK1 b - - 4 23","m":["h3g3","h2g3","h5h1"],"alts":[]},
{"f":"4r1k1/p5bp/1q2N1p1/2pPrp2/1pP5/6PP/P4QB1/1R3RK1 b - - 3 25","m":["e5e6","d5e6","g7d4"],"alts":[]},
{"f":"4r1k1/p1Q2pp1/1p5p/4P3/5r1q/5R2/P3B1PP/R5K1 b - - 0 22","m":["f4f3","g2f3","h4d4","g1g2","d4a1"],"alts":[]},
{"f":"3r1q2/5prk/p3pQpp/1p2P3/2p4R/2P2P1P/PPB2P2/6K1 w - - 3 30","m":["h4h6","h7g8","f6h4"],"alts":[]},
{"f":"2r4k/p4p1p/b4p2/8/4P2P/1P1r1QP1/P4PB1/2qR2K1 w - - 0 26","m":["f3f6","h8g8","d1c1"],"alts":[]},
{"f":"4r2k/p7/3p4/2pPbR1p/2P1R3/2B3qP/P3Q3/7K b - - 0 33","m":["g3h3","h1g1","e8g8"],"alts":[]},
{"f":"2r3nr/p5pp/b3k3/3p1p2/4p3/BP3P2/P1PN2PP/2KR3R w - - 0 19","m":["f3e4","f5e4","d2e4","d5e4","d1d6","e6f7","d6a6"],"alts":[]}]},"4-17":{"src":"https://lichess.org/study/HyE8ZFrO","puzzles":[{"f":"8/8/8/Q5K1/8/3k4/2p5/8 w - - 0 1","m":["a5e1","d3c4","g5f5","c4b3","e1c1"],"alts":[]},
{"f":"2k5/p7/8/4P2p/2Q5/1PPqP1PK/7P/8 b - - 4 44","m":["d3c4","b3c4","a7a5","h3h4","a5a4","h4h5","a4a3"],"alts":[]},
{"f":"8/6pk/8/8/Q2Pp3/PKP5/1P2q3/8 b - - 2 40","m":["e2d1","b3b4","d1a4","b4a4","e4e3"],"alts":[]},
{"f":"8/3Q2pp/6k1/3K4/6P1/8/7P/q7 w - - 10 47","m":["d7f5","g6h6","f5h5"],"alts":[]},
{"f":"8/5p2/6pk/3PQp2/8/4PP2/p5PK/4q3 w - - 0 40","m":["e5h8","h6g5","f3f4","g5g4","h8h3"],"alts":[]},
{"f":"2Q5/1p5k/1p3K2/8/5q2/P1P5/8/8 w - - 3 50","m":["c8f5","f4f5","f6f5"],"alts":[]},
{"f":"8/1p6/k7/1q5P/p7/6P1/4Q2K/8 w - - 6 78","m":["e2b5","a6b5","h5h6","a4a3","h6h7"],"alts":[]},
{"f":"8/8/5K2/5Q2/3k1p2/5Pp1/6P1/1q6 b - - 3 58","m":["b1f5","f6f5","d4e3"],"alts":[]},
{"f":"8/5p2/8/2Q3pk/PP4qp/6P1/5PKP/8 b - - 3 48","m":["h4h3","g2f1","g4d1"],"alts":[]},
{"f":"5Q2/7K/8/8/4p2P/3k2q1/8/8 w - - 2 54","m":["f8a3","d3d2","a3g3"],"alts":[]},
{"f":"5k2/7q/8/1p3Q2/6P1/8/6K1/8 b - - 2 62","m":["h7f5","g4f5","b5b4","g2f1","b4b3","f1e1","b3b2"],"alts":[]},
{"f":"8/6pk/7p/2pq4/3p4/5PP1/P3QK1P/8 w - - 2 41","m":["e2e4","d5e4","f3e4"],"alts":[]},
{"f":"8/6k1/p7/4P3/2q3Q1/6PK/8/8 b - - 1 49","m":["c4g4","h3g4","a6a5","g4f5","a5a4"],"alts":[]},
{"f":"8/1p5p/6p1/2P5/1P2k3/P3qp1Q/8/5K2 w - - 6 44","m":["h3e6","e4d4","e6e3","d4e3","b4b5","g6g5","c5c6"],"alts":[]},
{"f":"8/5k2/4p1p1/p6p/2Kp1P1P/1P2q3/P2Q4/8 w - - 2 46","m":["d2e3","d4e3","c4d3","e3e2","d3e2"],"alts":[]}]},"5-0":{"src":"https://lichess.org/study/ZSiXyT40/qo6SXDlt","puzzles":[{"f":"1k1r3r/8/pp1n2p1/2q5/1Q6/3R2P1/PPP2P1P/3R2K1 w - - 5 30","m":["b4c5","b6c5","d3d6","d8d6","d1d6"],"alts":[]},
{"f":"6k1/Bp3pp1/p3p3/2NpPn1p/5P1q/P2Q1R1P/1P4PK/2r5 b - - 1 28","m":["h4e1","f3f1","e1f1","d3f1","c1f1"],"alts":[]},
{"f":"1r2kb1r/3nnpp1/4p1bp/1NppP3/3P4/6N1/P2BBPPP/R3K2R w KQk - 1 18","m":["b5d6","e8d8","d2a5"],"alts":[]},
{"f":"r2qk2r/pp2ppbp/1n1p2p1/3P4/2n5/2NBBP1P/PP3P2/R2QK2R w KQkq - 0 13","m":["d3c4","b6c4","d1a4","d8d7","a4c4"],"alts":[]},
{"f":"r1bk2r1/ppq2NQp/3bpn2/1Bpn4/5P2/1P6/PBPP2PP/RN2K2R b KQ - 0 13","m":["d8e7","g7g8","f6g8"],"alts":[]},
{"f":"8/1q3kpp/1P2p3/4Q3/5P2/4B2P/2r3PK/8 w - - 1 44","m":["e5h5","f7e7","e3c5","c2c5","h5c5"],"alts":[]},
{"f":"k1r1b3/p1r1nppp/Bp1qpn2/2Np4/1P1P4/PQR1PN2/5PPP/2R3K1 b - - 1 19","m":["b6c5","a6c8","c5c4"],"alts":[]},
{"f":"r2q1rk1/p1p2pp1/3bbn1p/4N3/8/1P4P1/PBQPPP1P/RN2K2R b KQ - 2 12","m":["d6e5","b2e5","d8d5","f2f3","d5e5"],"alts":[]},
{"f":"r4rk1/5ppp/1np2q2/p1b5/2p1B3/P7/1P3PPP/R1BQ1RK1 w - - 2 18","m":["d1h5","h7h6","h5c5"],"alts":[]},
{"f":"r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2b1/PqP3PP/7K w - - 0 25","m":["e6e7","b2b1","b3c1","b1c1","h6c1"],"alts":[]},
{"f":"2r2rk1/6pp/3Q1q2/8/3N1B2/6P1/PP1K3P/5R2 b - - 0 24","m":["f6d6","f4d6","f8f1"],"alts":[]},
{"f":"6k1/1p4p1/1p3p1p/2r1p3/2n5/r3PN2/2RnNPPP/2R3K1 w - - 0 33","m":["f3d2","c4d2","c2d2","c5c1","e2c1"],"alts":[]},
{"f":"5r1k/5rp1/p7/1b2B2p/1P1P1Pq1/2R3Q1/P3p1P1/2R3K1 b - - 1 41","m":["f7f4","e5f4","f8f4"],"alts":[]},
{"f":"rnbq3r/1p3kpp/p4n2/2b5/2pNP3/2N5/PPP3PP/R1BQ1RK1 w - - 2 12","m":["d1h5","f7g8","h5c5"],"alts":[]},
{"f":"r1b2rk1/p3pp2/2B5/2Qpq3/3N2pp/4b3/2P2PPP/1R2K2R w K - 0 24","m":["f2e3","e5e3","e1d1"],"alts":[]}]},"5-1":{"src":"https://lichess.org/study/4kbUV3tO/3LguClAn","puzzles":[{"f":"1q4r1/p5pk/1p2r2p/3pNp1P/P2P4/1P4Q1/2P5/K5R1 w - - 0 1","m":["g3g6","e6g6","h5g6","h7h8","e5f7"],"alts":[]},
{"f":"r4k1r/p3nppp/3Qp3/8/B7/P1q5/2b2PPP/3R1RK1 w - - 0 19","m":["d6d8","a8d8","d1d8"],"alts":[]},
{"f":"6Q1/q1k5/3pB1p1/2pP1p2/2P2P2/rp2PK1P/8/8 w - - 3 38","m":["g8c8","c7b6","c8c6","b6a5","c6b5"],"alts":[]},
{"f":"r1b1k1nr/pppp2pp/3b1p2/3N2B1/3p4/8/PP1KBPPP/4R2R w kq - 0 12","m":["e2h5","e8f8","e1e8"],"alts":[]},
{"f":"2r3k1/R4ppp/8/4P3/4Q3/1qR3B1/5PPP/6K1 b - - 0 30","m":["b3d1","e4e1","d1e1"],"alts":[]},
{"f":"8/1b4p1/p3p1Pr/1p1p4/3N4/2PBk3/PP5r/1K3R2 w - - 21 42","m":["f1f3","e3d2","d4b3","d2e1","f3f1"],"alts":[]},
{"f":"1r1r3k/2q1b1pp/p7/4Q1pP/3B4/Pp6/1P3P2/1K1N2RR b - - 2 28","m":["c7c2","b1a1","c2c1"],"alts":[]},
{"f":"4r1k1/p4p2/1p3q1p/1P6/3B2p1/P5P1/Q1P2PKP/4R3 b - - 0 32","m":["f6f3","g2f1","f3h1"],"alts":[]},
{"f":"5rk1/8/8/p1pR4/P1Pb4/1P1p2P1/6P1/1R2K3 b - - 4 38","m":["d4c3","e1d1","f8f1"],"alts":[]},
{"f":"5k2/p1R4R/1p4p1/3r3q/3P4/2P3rp/PP5K/8 w - - 0 37","m":["c7c8","d5d8","c8d8"],"alts":[]},
{"f":"5rk1/R5p1/5q1p/8/3p2Q1/1P6/P3rPPP/5RK1 b - - 3 38","m":["f6f2","f1f2","e2e1","f2f1","e1f1"],"alts":[]},
{"f":"2bqkb1r/4p1p1/p6p/1pNPpp2/2r5/P1N1n3/1P2QPPP/R4RK1 w k - 0 19","m":["e2h5","g7g6","h5g6"],"alts":[]},
{"f":"4r1k1/pp1qn3/2p4R/6p1/3P2r1/3Q2P1/PP3P1P/6K1 w - - 0 32","m":["d3h7","g8f8","h6f6"],"alts":[]},
{"f":"3r4/ppN1kppp/5n2/8/1n3Nb1/4P3/1B3PPP/2R1KB1R b K - 1 18","m":["b4c2","c1c2","d8d1"],"alts":[]},
{"f":"r4r2/1ppb1p2/p2p2p1/5P1k/4P3/2PBB1R1/PKP2P1q/8 w - - 5 27","m":["d3e2","h5h4","e3g5"],"alts":[]}]},"5-2":{"src":"https://lichess.org/study/yCKqwlXK/RiNVgrf6","puzzles":[{"f":"8/1pp5/p7/1PP5/P2k4/8/3K4/8 w - - 0 1","m":["c5c6","b7c6","b5a6","d4c5","a6a7","c5b6","a7a8q"],"alts":[]},
{"f":"8/8/4n3/4BK2/2k5/1p6/5P2/8 b - - 1 56","m":["e6d4","f5e4","b3b2","e5d4","b2b1q"],"alts":[]},
{"f":"r5k1/pb2r1p1/1p2pQ2/2b1N3/5P2/PP5P/4p2K/4R1R1 b - - 1 33","m":["c5g1","e1g1","e2e1q","f6e6","e7e6"],"alts":[]},
{"f":"3r1rk1/p1p2p2/2Q4p/2P1q1p1/3p2P1/1P2P2P/P1P2P2/2K1RR2 b - - 3 23","m":["d4e3","c1b1","e3e2"],"alts":[]},
{"f":"8/8/3RP3/2Pn4/ppN1k2p/8/rP1K4/8 w - - 0 41","m":["d6d5","e4d5","e6e7"],"alts":[]},
{"f":"8/8/8/p3b3/P1B2p1K/1Pk1p2P/6P1/8 b - - 0 50","m":["c3d2","h4g4","e3e2","c4e2","d2e2"],"alts":[]},
{"f":"4rR2/3NP1kp/2p3p1/5p2/8/2rp3P/5PP1/4R1K1 b - - 3 34","m":["d3d2","e1d1","c3c1","g1h2","c1d1"],"alts":[]},
{"f":"8/p4p2/8/PP2B3/5P2/3ppk2/8/4K3 b - - 2 49","m":["d3d2","e1d1","e3e2","d1d2","f3f2","e5d4","f2f1","d2d3","e2e1q"],"alts":[]},
{"f":"2k2r2/1bNp4/pB1P4/8/P7/5n2/1P2KR1p/5R2 b - - 1 43","m":["f3g1","e2d2","f8f2","b6f2","h2h1q"],"alts":[]},
{"f":"8/8/1n4kP/1P2Kp2/3P4/2p1N3/8/8 b - - 5 49","m":["b6c4","e3c4","c3c2"],"alts":[]},
{"f":"8/k1p5/P7/3N4/3P2pp/4K1n1/6P1/8 b - - 2 47","m":["h4h3","e3f2","h3h2","f2g3","h2h1q"],"alts":[]},
{"f":"2r3k1/p4p1p/Pn2p1p1/3pP1P1/5P2/4B1P1/2r4R/R6K w - - 0 29","m":["h2c2","c8c2","e3b6","a7b6","a6a7"],"alts":[]},
{"f":"2R5/3Nb1pk/1r5p/2pP4/1p2P3/3P4/4K1PP/8 b - - 2 39","m":["b4b3","d5d6","e7d6","d7b6","b3b2","b6c4","b2b1q"],"alts":[]},
{"f":"8/4r2k/6p1/8/4qPPp/1P2pR1P/P3Q2K/8 b - g3 0 49","m":["e4f3","e2f3","e3e2","f3c3","e2e1q","c3e1","e7e1"],"alts":[]},
{"f":"8/8/3K4/4Pk2/p7/1pP5/1P6/8 b - - 1 45","m":["a4a3","e5e6","a3b2","e6e7","b2b1q"],"alts":[]}]},"5-3":{"src":"https://lichess.org/study/PQ7JcSOS/dNkZ0QBc","puzzles":[{"f":"8/8/3k4/3r4/3R4/3PK3/8/8 w - - 0 1","m":["e3e4","d5d4","e4d4","d6c6","d4e5","c6b5","e5d5"],"alts":[]},
{"f":"8/8/8/3pkPK1/4p2P/8/8/8 w - - 1 48","m":["f5f6","e5e6","g5g6"],"alts":[]},
{"f":"8/8/6p1/7p/p2k3P/PP3pP1/2K2P2/8 b - - 0 64","m":["a4b3","c2b2","d4d3","a3a4","d3e2","a4a5","e2f2"],"alts":[]},
{"f":"8/1k1K4/pp6/1P6/8/P7/8/8 w - - 0 56","m":["a3a4","a6b5","a4b5"],"alts":[]},
{"f":"8/pp6/2p5/PP3pp1/3k3p/4p2P/7P/4K3 w - - 0 43","m":["a5a6","b7a6","b5c6","d4c5","c6c7"],"alts":[]},
{"f":"8/8/2p5/1kP2p2/1P1pp3/1K1P1P2/8/8 w - - 0 37","m":["d3e4","f5e4","f3e4"],"alts":[]},
{"f":"8/8/2p4K/1p3kp1/1P6/2P4P/8/8 b - - 0 52","m":["g5g4","h3g4","f5g4"],"alts":[]},
{"f":"8/8/7p/pp3k2/6p1/PP2K1P1/7P/8 w - - 0 56","m":["e3d4","b5b4","a3b4"],"alts":[]},
{"f":"8/p5p1/1p3pk1/4p1p1/3p2P1/1P1P1K1P/P1P2P2/8 w - - 1 38","m":["f3e4","g6f7","e4d5"],"alts":[]},
{"f":"8/8/8/pp1p1k2/6pP/PPP3K1/8/8 b - - 0 41","m":["b5b4","c3b4","a5b4","a3a4","d5d4"],"alts":[]},
{"f":"6k1/5p2/p4P2/1p1pP3/2pP2P1/P7/1P6/7K b - - 0 50","m":["a6a5","h1g2","b5b4","a3b4","a5b4"],"alts":[]},
{"f":"8/5p2/4p1p1/1pp1PpP1/P2k1P2/1P4P1/3K4/8 b - - 0 36","m":["b5a4","b3a4","d4c4","a4a5","c4b5","d2c3","b5a5","c3c4","a5b6"],"alts":[]},
{"f":"8/1p3k2/p1p3pK/P1P5/1P5P/8/8/8 b - - 10 60","m":["f7f6","h6h7","g6g5","h4g5","f6g5"],"alts":[]},
{"f":"8/8/8/8/8/3K1p2/5P1k/8 w - - 4 64","m":["d3e4","h2g2","e4e3"],"alts":[]},
{"f":"8/7p/7p/4p2k/4P2P/6P1/6K1/8 b - - 2 48","m":["h5g4","g2f2","g4h3","f2f3","h6h5","f3f2","h3h2"],"alts":[]}]},"5-4":{"src":"https://lichess.org/study/8wlJJFgR/y1kgDU5P","puzzles":[{"f":"5k2/5P2/4K3/4p3/ppp1P1P1/2P1P3/PP6/8 b - - 0 50","m":["a4a3","c3b4","a3b2"],"alts":[]},
{"f":"8/pp6/2p1kpp1/3p2P1/3P1P1p/1P3K2/P1P4P/8 b - - 0 31","m":["f6g5","f3g4","g5f4","g4f4","e6f6"],"alts":[]},
{"f":"8/8/1p2k1p1/4P2p/P2K1p1P/5P2/8/8 b - - 0 66","m":["g6g5","d4e4","g5h4"],"alts":[]},
{"f":"8/8/3p4/2kP2P1/1p6/2pK4/P7/8 b - - 0 42","m":["c5d5","g5g6","d5e6","g6g7","e6f7","a2a4","b4a3","g7g8r","f7g8"],"alts":[]},
{"f":"8/8/2k5/1p6/1Pp1K3/2P5/8/8 w - - 3 55","m":["e4e5","c6d7","e5d5"],"alts":[]},
{"f":"8/1p6/6K1/2k4p/7P/5P2/8/8 w - - 1 51","m":["f3f4","c5d6","f4f5"],"alts":[]},
{"f":"8/6p1/8/8/4P2k/5KpP/8/8 w - - 4 47","m":["f3g2","h4g5","g2g3"],"alts":[]},
{"f":"8/1P6/8/7p/3P4/3k1p1P/4p3/4K3 b - - 1 49","m":["d3e3","h3h4","f3f2"],"alts":[]},
{"f":"8/8/7p/3k3P/5Kp1/6P1/8/8 w - - 6 47","m":["f4f5","d5d4","f5g6"],"alts":[]},
{"f":"8/7p/2k3p1/p5P1/P2K4/8/8/8 w - - 5 48","m":["d4c4","c6d6","c4b5"],"alts":[]},
{"f":"8/1p1k4/8/p1p5/P4P2/5K2/5P2/8 b - - 1 43","m":["b7b5","a4b5","a5a4","f3e4","a4a3"],"alts":[]},
{"f":"8/pp6/2p1k3/2Pp2pp/1P1P1p2/P2K1PP1/7P/8 b - - 0 42","m":["f4g3","h2g3","h5h4","g3h4","g5h4"],"alts":[]},
{"f":"6k1/7p/6p1/5p2/5PP1/7P/1K6/8 b - - 0 42","m":["f5g4","h3g4","h7h5","g4h5","g6h5"],"alts":[]},
{"f":"8/pp6/8/2p2k1P/3p4/2P3K1/PP6/8 w - - 0 40","m":["c3d4","c5d4","g3f3"],"alts":[]},
{"f":"8/1p6/8/3kp2p/4p1pP/4K1P1/PP4P1/8 b - h3 0 36","m":["b7b5","a2a3","d5c4","e3e4","c4b3"],"alts":[]}]},"5-5":{"src":"https://lichess.org/study/mE6rkIxV/33oS3dA7","puzzles":[{"f":"8/8/6PK/8/k7/p7/8/8 w - - 0 1","m":["g6g7","a4b3","g7g8q","b3b2","g8g7","b2b1","g7g1"],"alts":[]},
{"f":"8/3K4/B4k2/8/1P4p1/5p2/P7/8 b - - 0 46","m":["g4g3","b4b5","g3g2","b5b6","g2g1q"],"alts":[]},
{"f":"r5k1/2B2pp1/1P2p1p1/r2q4/3Pp3/R6P/5PP1/1R4K1 w - - 0 33","m":["a3a5","a8a5","b6b7","d5b7","b1b7","a5a1","g1h2"],"alts":[]},
{"f":"8/3r4/P1k2p1p/1pq1pNp1/2b1P1P1/2P2P1P/3r2BK/R5Q1 w - - 5 41","m":["g1c5","c6c5","a6a7","d7a7","a1a7","c4f1","f5e3","f1g2","e3g2"],"alts":[]},
{"f":"8/5p1k/pp3B2/3bPq2/6R1/6RP/1P1p2PK/8 b - - 1 47","m":["f5g4","g3g4","d2d1q","g4g7","h7h6"],"alts":[]},
{"f":"8/8/1k6/8/p7/1p1N2P1/5KP1/r3R3 b - - 1 55","m":["a1e1","f2e1","a4a3","e1d2","a3a2","d2c3","a2a1q"],"alts":[]},
{"f":"8/4rkb1/R5R1/5P1p/P6P/6P1/1r2p3/4K3 w - - 0 45","m":["g6g7","f7g7","f5f6","g7f7","f6e7"],"alts":[]},
{"f":"2kr4/2pR4/2P1K1P1/8/8/4n3/p7/8 w - - 0 50","m":["d7d8","c8d8","g6g7","a2a1q","g7g8q"],"alts":[]},
{"f":"6k1/8/4p1p1/1P5p/1B2PP2/3pbK1P/2p5/4R3 b - - 3 36","m":["d3d2","b4d2","e3d2","b5b6","d2e1"],"alts":[]},
{"f":"7k/p3b2p/Pp1n4/1PpPp3/2B1PpP1/1P6/5BK1/8 w - - 1 34","m":["f2c5","b6c5","b5b6","a7b6","a6a7"],"alts":[]},
{"f":"6k1/p7/2p3PP/2P2K2/8/2b5/P7/8 w - - 1 43","m":["f5e6","c3d2","h6h7"],"alts":[]},
{"f":"4r3/6K1/8/4R1P1/1PpP4/P1P3k1/8/4b3 b - - 6 52","m":["e8e5","d4e5","e1c3","g7g6","c3e5","g6f5","c4c3","f5e5","c3c2","g5g6","c2c1q"],"alts":[]},
{"f":"7Q/5R2/3k2p1/4p3/4P1P1/8/p4p1K/r7 b - - 0 46","m":["a1h1","h2h1","a2a1q","h1g2","a1g1"],"alts":[]},
{"f":"k7/7R/p1P5/4K3/1P6/1r5p/8/8 w - - 3 52","m":["h7h8","a8a7","c6c7"],"alts":[]},
{"f":"r5k1/p2Q1pp1/1p2P2p/2p5/P1Pp4/5q2/1P3PrP/3RRK2 w - - 1 32","m":["d7f7","f3f7","e6f7","g8f7","f1g2"],"alts":[]}]},"5-6":{"src":"https://lichess.org/study/mE6rkIxV/8dRywK39","puzzles":[{"f":"8/3k4/3P1K2/p4R2/5r2/5P2/8/8 b - - 2 57","m":["f4f5","f6f5","a5a4","f5e4","a4a3","e4d3","a3a2"],"alts":[]},
{"f":"5k2/1R6/3pp1P1/2p5/1p2PK2/5P2/8/2r5 w - - 1 61","m":["f4g5","c1g1","g5f6"],"alts":[]},
{"f":"7R/1K3p2/6k1/PP6/6p1/6rp/8/8 w - - 0 48","m":["a5a6","h3h2","h8h2"],"alts":[]},
{"f":"5R2/1p6/p1p1k3/2P1r3/2K3p1/2P1p1P1/1P5P/8 w - - 2 45","m":["f8e8","e6f5","e8e5","f5e5","c4d3","e5d5","d3e3","a6a5","e3f4","d5c4","f4g4"],"alts":[]},
{"f":"8/5k2/4R2p/p7/5rPK/8/7P/8 w - - 3 43","m":["e6h6","f4f6","h6h7","f7g6","h7a7"],"alts":[]},
{"f":"8/8/5k1p/6pP/1R4P1/1p2KP2/8/1r6 b - - 0 43","m":["b3b2","b4b6","f6e5","f3f4","g5f4"],"alts":[]},
{"f":"8/2p1pk1p/Pp4p1/8/2P2P2/p2r2P1/3PR2P/3K4 w - - 0 34","m":["a6a7","d3d8","e2e3","a3a2","e3a3"],"alts":[]},
{"f":"5kr1/pp3p1p/1q2pBb1/1B1p4/P7/5P2/1P5P/2Q1K1rR w K - 1 22","m":["h1g1","b6g1","b5f1","g6c2","c1f4"],"alts":[]},
{"f":"2r1kbnr/pp4pp/4p3/3pq1N1/8/1P2B3/P3Q1PP/nN3RK1 w k - 0 17","m":["f1f8","e8f8","e3c5","c8c5","e2e5","c5c1","g1f2"],"alts":[]},
{"f":"8/6pp/8/3kP3/1p1P2P1/1rpK3P/4R3/8 w - - 0 40","m":["e5e6","c3c2","d3c2","b3c3","c2d2"],"alts":[]}]},"5-7":{"src":"https://lichess.org/study/57XhbPB3/afi99YM8","puzzles":[{"f":"1n6/1P4p1/6k1/p7/4N3/P6Q/K6p/4q3 w - - 0 1","m":["h3e6","g6h5","e4f6","g7f6","e6e1"],"alts":[]},
{"f":"8/5p1k/6qp/1p2Q3/2bpp3/6PP/2P2R1K/8 b - - 3 34","m":["e4e3","f2f4","g6c2"],"alts":[]},
{"f":"2r4k/q2b1Q1p/2p2P2/1p2p3/4P3/p2P3R/4N1K1/R7 b - - 0 38","m":["d7h3","g2h3","a7f7"],"alts":[]},
{"f":"3q4/5kpQ/p1p5/1p1n4/2p3P1/P6P/1PPB4/1K6 b - - 0 33","m":["d5f6","h7f5","d8d2"],"alts":[]},
{"f":"2r3k1/6pp/2b5/3R4/3P4/2R1P1BP/5P1K/1r6 b - - 4 34","m":["b1h1","h2h1","c6d5","h1h2","c8c3"],"alts":[]},
{"f":"5r1k/4n2p/1p4p1/pP5Q/P2pB2K/6P1/2P4P/4q3 w - - 0 38","m":["h5e5","h8g8","e4d5","e7d5","e5e1"],"alts":[]},
{"f":"2r2rk1/pbq1bppp/8/8/2p1N3/P1Bn2P1/2Q2PBP/1R3RK1 w - - 4 24","m":["b1b7","c7b7","e4f6","e7f6","g2b7"],"alts":[]},
{"f":"r1b4r/pp1k2p1/2nb2qp/1B1p2B1/3p3Q/8/PPP2PPP/3RR1K1 w - - 0 18","m":["h4g4","d7c7","g5d8","h8d8","g4g6"],"alts":[]},
{"f":"r2qr1k1/p5bp/1pp1N1p1/8/2Q2p2/2P1n2P/PP3PP1/R1B1RNK1 b - - 0 18","m":["e3c4","e6d8","e8e1"],"alts":[]},
{"f":"4r2k/p3q1p1/7p/2R5/2PpN3/6P1/4Q2P/6K1 b - - 0 39","m":["e7c5","e4c5","e8e2"],"alts":[]},
{"f":"r2qr1k1/pb2bppp/2p2n2/3pN1B1/2P5/4P3/PPQ1BPPP/3RK2R b K - 4 13","m":["e7b4","e1f1","e8e5"],"alts":[]},
{"f":"6r1/1pp2rpk/p5R1/3qpP1n/8/2P3Q1/PP3P1K/6R1 w - - 0 36","m":["g6h6","g7h6","g3g8"],"alts":[]},
{"f":"r4r1k/pp4pp/2pp1b2/4p3/N2qP3/3Q4/PPP2PPP/3RR1K1 w - - 4 17","m":["d3b3","b7b5","d1d4"],"alts":[]},
{"f":"6k1/1p3r2/p1p1p3/4Pqpp/3P4/1P2R1QP/P4PP1/6K1 b - - 1 33","m":["h5h4","g3f3","f5b1","g1h2","f7f3"],"alts":[]},
{"f":"r1b2rk1/5p1p/p3pq2/1p1p4/7n/1P5P/P1P1QPB1/1K1R2R1 w - - 0 22","m":["g2d5","h4g6","d5a8"],"alts":[]}]},"5-8":{"src":"https://lichess.org/study/57XhbPB3/MvLHjVgH","puzzles":[{"f":"r4rk1/ppq2ppp/2p1p1n1/3p4/2PP4/1PNQP3/P4PPP/2R2RK1 w - - 0 1","m":["c4d5","e6d5","c3d5"],"alts":[]},
{"f":"1R3rk1/p4ppp/3bpn2/3p4/q2P4/2N3P1/P3PP1P/2B2RK1 w - - 0 18","m":["b8f8","g8f8","c3a4"],"alts":[]},
{"f":"4r1k1/pp2qR2/3p2pB/2nP4/P1P5/2P5/5QPP/4rRK1 b - - 0 24","m":["e1f1","g1f1","e7f7","f2f7","g8f7"],"alts":[]},
{"f":"r2qk2r/2pn1p1n/pp1p2Bp/3Pp1b1/PPP1P3/2N1B3/3N2PP/R2Q1RK1 b kq - 0 17","m":["g5e3","g1h1","f7g6"],"alts":[]},
{"f":"B4rk1/p3b1pp/1q2bp2/1p2p3/2p2P2/3PR1P1/PPPN3P/R1BQ2K1 b - - 0 16","m":["b6e3","g1g2","f8a8"],"alts":[]},
{"f":"2Q2rk1/3R1p1p/p3p1p1/1p4q1/5P2/P1N5/BPP3bP/2K4R b - - 0 20","m":["g5f4","c1b1","f8c8"],"alts":[]},
{"f":"r1r3k1/4pp1p/3p2p1/8/q2RPP2/1N6/1PP2QPP/1K3R2 b - - 0 26","m":["a4a2","b1c1","a2b3"],"alts":[]},
{"f":"1r3k2/p4ppp/2r5/5N2/P2P4/8/2P2PPP/3Q2K1 b - - 4 23","m":["c6b6","g1f1","b6b1","d1b1","b8b1"],"alts":[]},
{"f":"3r1rk1/1p3p1p/p1q3p1/4Pb1P/2p2P2/P5R1/2Q1B1P1/3R2K1 w - - 2 26","m":["c2f5","d8d1","e2d1"],"alts":[]},
{"f":"r4k2/8/2p3Bb/4p1R1/3q4/PQ6/2K2P2/1N6 b - - 0 30","m":["d4f2","b1d2","h6g5","b3f3","f2f3"],"alts":[]},
{"f":"r4bk1/2rqp2p/n1p3p1/3p1p2/3P1P1B/pP1BP3/P1Q2PRP/1KR5 w - - 1 27","m":["d3f5","e7e6","f5g6"],"alts":[]},
{"f":"3r2r1/Qpqkbp2/p1p1p2p/3nP3/8/2P1NP1N/PP6/1K1R3R w - - 4 26","m":["c3c4","b7b6","a7c7","d7c7","c4d5"],"alts":[]},
{"f":"r1b2rk1/1p3ppp/2p5/pq6/3b4/1BP2Q2/PP3PPP/R3R1K1 w - - 0 18","m":["f3f7","f8f7","e1e8"],"alts":[]},
{"f":"5rk1/pp1n1r2/3p2N1/2pQ4/2P5/4P1P1/qP2KPP1/7R w - - 2 25","m":["g6e7","g8g7","d5g5"],"alts":[]},
{"f":"8/p1B4p/1p3pk1/6p1/3PQ1P1/2P1nP1K/P3q2P/8 b - - 10 36","m":["g6h6","e4e3","e2e3"],"alts":[]}]},"5-9":{"src":"https://lichess.org/study/VLebVUHz","puzzles":[{"f":"r2qk2r/ppp2pp1/2p2n2/7p/3bP1b1/2N3QP/PPP2PP1/R1B1KB1R b KQkq - 0 9","m":["d4c3","g3c3","d8d1"],"alts":[]},
{"f":"r2qk2r/ppp1npbp/3p2p1/8/2n1P3/2N2BB1/PP3PPP/R2QK2R w KQkq - 0 11","m":["d1a4","e7c6","a4c4"],"alts":[]},
{"f":"r1bq1rk1/pp1p1ppp/4pn2/4n3/2B5/2B5/PPP2PPP/R2QK1NR w KQ - 0 10","m":["c3e5","d8a5","e5c3"],"alts":[]},
{"f":"r2qkb1r/1pp2ppp/p5P1/4n3/3p4/6N1/PPP1PP1P/R2QKBNR b KQkq - 0 12","m":["f8b4","c2c3","d4c3"],"alts":[]},
{"f":"r5k1/5pp1/p3qb1p/1pp5/8/P1N1PQ2/1P1r1PPP/3R2K1 w - - 0 25","m":["f3a8","d2d8","d1d8"],"alts":[]},
{"f":"r2qk1nr/p1pbb1pp/4p3/2p2P2/2p5/8/PPP1Q1PP/RNB2RK1 w kq - 0 14","m":["e2h5","g7g6","f5g6"],"alts":[]},
{"f":"r2qkb1r/1Q1npppp/B2pb3/8/4P3/5N2/PPP2PPP/R1B1K2R b KQkq - 0 9","m":["d8a5","b2b4","a5a6","b7a6","a8a6"],"alts":[]},
{"f":"4r1k1/1ppbrppB/7p/p2P4/3q1P2/P4P2/1P1Q2PP/3RR2K b - - 6 26","m":["g8h7","e1e7","d4d2","d1d2","e8e7"],"alts":[]},
{"f":"r1bqk2r/ppp2ppp/3p4/4p3/2PBP2b/5Pn1/PP4PP/RN1QKB1R w KQkq - 0 10","m":["h2g3","h4g3","d4f2","g3f2","e1f2"],"alts":[]},
{"f":"rnbqk2r/ppp3pp/5n2/3P1p2/1b2pB2/2N5/PP3PPP/R2QKBNR w KQkq - 1 8","m":["d1a4","c7c6","a4b4"],"alts":[]},
{"f":"r3k1nr/2pp1pp1/npbbp1q1/7p/2PP3B/2NBPN1P/PP3PP1/2RQK2R b Kkq - 4 12","m":["g6g2","h1g1","g2f3","d1f3","c6f3"],"alts":[]},
{"f":"r1bqk2r/pp5p/3b1p2/3pNn2/4p3/2N5/PPP2PPP/R2QKB1R w KQkq - 0 12","m":["d1h5","e8f8","h5f7"],"alts":[]},
{"f":"r2k1bnr/p1pp1Bpp/1p6/4N1q1/3p4/2P5/PP2QPbP/RN2K2R w KQ - 0 11","m":["e5c6","g2c6","e2e8"],"alts":[]},
{"f":"4r1k1/4Pp2/pQ3b1p/6pP/q1p5/P4P2/5BPK/8 w - - 3 32","m":["b6f6","c4c3","f2d4","a4d4","f6d4"],"alts":[]},
{"f":"2r3k1/1p3ppp/4p3/Q7/3q4/P1B5/1Pr2PPP/R5K1 w - - 0 23","m":["c3d4","c2c1","a5e1"],"alts":[]}]},"5-10":{"src":"https://lichess.org/study/ixNQgC8m","puzzles":[{"f":"1R6/2K5/8/2k5/1p6/8/8/8 w - - 0 1","m":["c7b7","c5b5","b7a7","b5a4","a7b6","a4a3","b6b5"],"alts":[]},
{"f":"8/8/6p1/PR3p2/1P3k1P/8/r5P1/7K b - - 0 39","m":["f4g3","b5d5","a2a1","d5d1","a1d1"],"alts":[]},
{"f":"6k1/1p3p1p/4p1p1/1P1pr3/P7/8/7P/1R4K1 w - - 0 34","m":["a4a5","d5d4","a5a6","e5b5","b1b5"],"alts":[]},
{"f":"8/8/8/4R2p/4p2k/4r2P/6PK/8 w - - 2 51","m":["g2g3","e3g3","e5e4","h4g5","h2g3"],"alts":[]},
{"f":"8/2k4p/p2p2p1/2pP1p2/2P4P/3K4/P3RPP1/4r3 b - - 1 28","m":["e1e2","d3e2","c7b6","e2f3","b6a5","a2a3","a5a4"],"alts":[]},
{"f":"8/2p4r/1p3k2/p2PR1p1/P1P2pP1/1P3P1r/4R1K1/8 b - - 0 46","m":["h3h2","g2f1","h2h1","f1f2","h7h2"],"alts":[]},
{"f":"8/8/1P5p/3R3P/8/2k5/3p3r/3K4 b - - 0 49","m":["h2h1","d1e2","h1e1"],"alts":[]},
{"f":"8/5R2/P7/2p2r2/2Pp2k1/3K4/5p2/8 w - - 2 55","m":["f7f5","g4f5","d3e2","f2f1q","e2f1"],"alts":[]},
{"f":"8/8/5kp1/R7/4p1PP/5p2/2r2P2/6K1 b - - 0 52","m":["c2c1","g1h2","e4e3"],"alts":[]},
{"f":"3R4/8/8/5p2/8/3p3P/1k3rP1/3K4 w - - 0 49","m":["d8d3","f2g2","d3d2","g2d2","d1d2"],"alts":[]},
{"f":"8/6k1/5R2/1K4Pp/1PP5/8/6r1/8 b - - 0 63","m":["g2g5","b5a6","g7f6"],"alts":[]},
{"f":"8/p7/6P1/4p3/R5K1/1r2kp1P/8/8 w - - 0 48","m":["g6g7","b3b8","a4a3"],"alts":[]},
{"f":"8/5p2/5pk1/8/4PPr1/8/5K2/7R w - - 3 47","m":["f2f3","g4g5","f4g5"],"alts":[]},
{"f":"8/1p6/p1p3r1/1kP5/6R1/5P1P/5K2/8 b - - 1 54","m":["g6g4","f3g4","b5c5"],"alts":[]},
{"f":"8/4k1r1/4pRp1/6Pp/3K1P1P/8/8/8 w - - 1 62","m":["d4e5","g7g8","f6e6","e7f7","f4f5"],"alts":[]}]},"5-11":{"src":"https://lichess.org/study/NZtUAixb","puzzles":[{"f":"6k1/5rp1/Q2B3p/P1Pp4/1P6/2q1P2P/6P1/6K1 b - - 0 34","m":["c3e1","g1h2","f7f1","a6f1","e1f1"],"alts":[]},
{"f":"5rk1/5ppp/4b3/1p1pPpPP/2pP4/b1P5/rqNQKP2/2RRN3 w - - 6 24","m":["c1b1","b2b3","b1b3"],"alts":[]},
{"f":"r1b2r2/pp2n1p1/1qn1ppk1/3pP1N1/3P3P/P7/1P1Q1PP1/RN2K2R w KQ - 0 14","m":["h4h5","g6h6","g5e6","h6h7","e6f8"],"alts":[]},
{"f":"r2q1r2/1n4pk/p6p/1ppN1pb1/3n1B2/P2PN2P/1PPQ1PP1/R3R1K1 b - - 1 21","m":["g5f4","d5f4","d8g5","d2d1","g5f4"],"alts":[]},
{"f":"1rr3k1/4Qppp/q3p3/p2pn3/3N4/4P2P/5PP1/RR4K1 w - - 0 30","m":["b1b8","c8b8","e7c7","b8c8","c7e5"],"alts":[]},
{"f":"8/pp1r2kp/q2P1ppb/4N3/4P3/1Q5P/PPR2PP1/6K1 b - - 0 32","m":["f6e5","c2c7","a6d6"],"alts":[]},
{"f":"4r3/pN3kpp/2N1b3/2R5/5b2/P5P1/1P3P1P/7K b - - 0 30","m":["e6h3","c5c1","f4c1"],"alts":[]},
{"f":"8/1p6/p1p2p2/P3b3/1PK3P1/2PB4/3k4/8 w - - 4 61","m":["d3f5","e5c7","f5c8","b7b6","a5b6","c7b6","c8a6"],"alts":[]},
{"f":"k3r3/p3q3/1pp5/3pnB2/1P1Q4/1KPP4/P3R3/8 b - - 1 41","m":["e5f3","e2e7","f3d4","c3d4","e8e7"],"alts":[]},
{"f":"6k1/5p2/4p3/P1B5/2P4P/4Pnp1/Rb2r3/5K2 w - - 0 34","m":["f1e2","g3g2","e3e4","f3d4","e2f2"],"alts":[]},
{"f":"6k1/4p1bp/6p1/1p1pP3/qPpPp3/2P1P3/Q2B1KPP/8 w - - 3 24","m":["a2a4","b5a4","b4b5","g8f7","b5b6"],"alts":[]},
{"f":"3r1k2/2p1R3/p2p2n1/1p6/1P1P2Q1/7P/5qPK/4R3 b - - 3 42","m":["g6e7","e1e4","f8e8"],"alts":[]}]},"5-12":{"src":"https://lichess.org/study/tqz28nOS/lAclawnI","puzzles":[{"f":"2rr1k2/p4p1Q/1pq2bpp/3N4/8/P2R3P/1P3PP1/4R1K1 w - - 0 1","m":["d5e7","f6e5","e7c6","e5g7","c6d8","c8c7","d8f7"],"alts":[]},
{"f":"3r1b1R/1pq3p1/p1k3P1/3p4/1P1Q4/4PP2/P1P5/2K5 w - - 0 27","m":["h8f8","d8f8","d4c5","c6d7","c5f8"],"alts":[]},
{"f":"5rk1/5ppp/1p6/1q3P1Q/2pp3P/6R1/6PK/8 w - - 0 31","m":["g3g7","g8g7","f5f6","g7f6","h5b5"],"alts":[]},
{"f":"r3r1k1/pp3pB1/2q3pp/3R4/8/P4Q2/BP3PPP/1b4K1 w - - 0 24","m":["f3f7","g8f7","d5d7"],"alts":[]},
{"f":"5r2/5p1k/6pp/ppqp1P2/7Q/5N2/6PP/5N1K w - - 0 32","m":["f3g5","h7g7","f5f6","g7f6","g5e4"],"alts":[]},
{"f":"r1b2rk1/1p2b1p1/pq2p1P1/3pn3/1P1P4/P1N1P3/6P1/R2QK2R w KQ - 0 18","m":["h1h8","g8h8","d1h5","h8g8","h5h7"],"alts":[]},
{"f":"r1b3k1/pp4b1/n1pqprQ1/4p3/2P2PP1/P2B4/1P6/R1B1K2R w KQ - 2 20","m":["h1h8","g8h8","g6h7"],"alts":[]},
{"f":"6k1/4pp2/p5pB/2p4n/3pP1Q1/P2P2qP/1r4P1/5RK1 w - - 2 31","m":["g4c8","g8h7","f1f7","h5g7","f7g7","h7h6","c8h8","h6g5","g7g6","g5g6","h8g8","g6f6","g8g3"],"alts":[]},
{"f":"2kr2r1/3q1p2/pp1B1n1p/2pP4/2Pp4/PQ1P3P/4B1PK/R4R2 b - - 0 21","m":["d7d6","h2g1","g8g2","g1g2","d8g8","e2g4","f6g4"],"alts":[]},
{"f":"7k/pb1qn1rn/1p2R2Q/2p2p2/2Pp4/3B4/PP3P1P/4RK2 w - - 2 28","m":["h6g7","h8g7","e6e7","d7e7","e1e7"],"alts":[]},
{"f":"r1b1k1nr/pp2p2p/2q1Npp1/2n1p3/2B5/2N3B1/PPPR1PPP/2K4R w kq - 0 15","m":["d2d8","e8f7","d8f8"],"alts":[]},
{"f":"8/7R/3k4/2pnp3/P1B5/3KP3/1r6/8 b - - 2 43","m":["e5e4","d3e4","d5f6"],"alts":[]},
{"f":"r3r1k1/p1p4p/3b4/6qN/4p3/1P1b1Q2/P2P1PP1/B5KR w - - 0 23","m":["h5f6","g8f8","f6h7","f8e7","a1f6","g5f6","f3f6"],"alts":[]},
{"f":"3r1rk1/4Qppp/8/1ppb4/2Pn1B1n/2N3P1/PP3P2/R2R1K2 b - - 0 21","m":["d5g2","f1e1","h4f3"],"alts":[]},
{"f":"r3kr2/p1p2pQp/bp2pP2/8/8/1P4P1/P2KNP1P/R1B4q w q - 1 18","m":["g7f8","e8f8","c1a3","f8e8","a1h1"],"alts":[]}]},"5-13":{"src":"https://lichess.org/study/ILOZM4m9","puzzles":[{"f":"1k6/1pp5/4p2p/Q2p4/1P1P4/5bPq/B4P1P/R3R1K1 w - - 0 1","m":["a5a8","b8a8","a2d5","a8b8","d5f3","h3f5","e1e3"],"alts":[]},
{"f":"r1b2rk1/p1p1q3/5n1p/2pp2p1/2Q1p3/2N2P2/PPP2KPP/4RB1R w - - 0 16","m":["c3d5","f6g4","f2g1"],"alts":[]},
{"f":"8/5p2/1k2p3/pp1rPp1p/5P1P/1P2K1P1/P2R4/8 w - - 0 33","m":["d2d5","e6d5","e3d4","b6c6","a2a3"],"alts":[]},
{"f":"1R6/p1p5/3b2kp/3K2r1/r3ppPR/2B5/1P3P2/8 w - - 0 38","m":["d5e6","g5e5","c3e5"],"alts":[]},
{"f":"8/1r3pkp/1b4p1/2RpQ3/7P/1qP3P1/1P3P2/2B3K1 b - - 6 33","m":["f7f6","c1h6","g7h6","e5f4","h6g7"],"alts":[]},
{"f":"1r3rk1/p4p2/2p4p/2q1p1p1/4Pnb1/2PB1PB1/P1Q3PP/3R1RK1 w - - 1 19","m":["g3f2","c5a3","f3g4","b8b2","c2c1"],"alts":[]},
{"f":"4k2R/2p1p3/4p2Q/3p4/3P2P1/1p2P3/1Pn5/3KNq2 b - - 5 34","m":["e8d7","h6h4","c2e3","d1d2","e3c4"],"alts":[]},
{"f":"Q2qr3/1P6/KP6/5k2/8/8/8/8 w - - 1 73","m":["a8d8","e8d8","a6a7"],"alts":[]},
{"f":"1r4k1/5p1p/3R2p1/1qN5/1r1Qp3/7P/5PPK/8 w - - 1 36","m":["d6d8","b8d8","d4d8","g8g7","c5d7"],"alts":[]},
{"f":"r1bq1rk1/pp3pBp/2pp2p1/8/B7/P1n4P/1PP2PP1/R2QK2R w KQ - 0 13","m":["g7c3","f8e8","e1f1"],"alts":[]},
{"f":"1k1r4/pb3p2/1pq2B2/4p3/PQ2p1p1/6P1/2P2P1P/1R3RK1 b - - 0 28","m":["e4e3","f2f3","g4f3","f6e5","b8a8"],"alts":[]},
{"f":"rnbqk2r/ppp2ppp/3bp3/8/4n3/1BN5/PPPP2PP/R1BQK1NR w KQkq - 0 7","m":["c3e4","d8h4","e4f2"],"alts":[]},
{"f":"8/8/4R3/3p1n1k/3P1P2/5K2/8/8 b - - 0 53","m":["f5d4","f3e3","d4e6","f4f5","e6c7"],"alts":[]},
{"f":"8/1p6/1p1p1k2/2p1p2K/P1P1P3/1P1P4/8/8 w - - 1 39","m":["h5h6","f6e6","h6g6","e6e7","g6g7"],"alts":[]},
{"f":"r5k1/p1pN1p2/1p1b2p1/3p1n2/3P4/2P3Pq/P2QRP1P/1R4K1 b - - 4 23","m":["f5h4","d7f6","g8g7"],"alts":[]}]},"5-14":{"src":"https://lichess.org/study/G5ILgPOq","puzzles":[{"f":"7R/K7/8/k7/Pp6/1r6/8/8 w - - 0 1","m":["h8a8","b3b1","a7b7"],"alts":[]},
{"f":"8/8/5k2/3R2p1/4K3/5P2/8/r7 b - - 3 57","m":["a1e1","e4d4","e1d1","d4c5","d1d5","c5d5","f6f5","d5d4","f5f4","d4d3","f4f3"],"alts":[]},
{"f":"8/8/8/8/3KPk2/8/2p2r2/6R1 b - - 0 59","m":["f2d2","d4c3","d2d1","c3c2","d1g1"],"alts":[]},
{"f":"8/8/5pkp/8/PP3rPp/7P/r4P2/1R1R1K2 b - - 0 37","m":["f4f2","f1g1","f2g2","g1h1","g2h2"],"alts":[]},
{"f":"2r3k1/5pp1/2P4p/2R5/1r6/6P1/p4PKP/2R5 b - - 3 32","m":["b4b1","c5a5","b1c1"],"alts":[]},
{"f":"8/8/1R5P/8/1p6/1k6/r1r5/1K5R w - - 5 54","m":["h1h3","b3c4","b6c6","c4d5","c6c2"],"alts":[]},
{"f":"4k3/R3P3/1p3Kpp/2p5/2P5/4r3/4p1P1/8 w - - 3 38","m":["a7a8","e8d7","a8d8","d7c7","e7e8q","e3e8","d8e8"],"alts":[]},
{"f":"8/p1r1k3/1P1R1p1p/8/1P6/7P/6PK/8 b - - 0 51","m":["e7d6","b6c7","d6c7"],"alts":[]},
{"f":"3r4/3r2k1/p7/3p2p1/3RP1Pp/1P3K2/P2R4/8 b - - 0 38","m":["d5e4","f3e3","d7d4"],"alts":[]},
{"f":"8/8/8/3p4/5p1R/r3k3/6K1/8 w - - 0 52","m":["h4h3","e3e2","h3a3","d5d4","a3a2"],"alts":[]},
{"f":"2R5/8/7p/2P2p1k/8/6KP/PP4R1/4rr2 b - - 2 41","m":["f5f4","g3h2","f1h1"],"alts":[]},
{"f":"8/2p1kp2/3p4/3Pp3/p3P2P/Pr3R2/6P1/4K3 w - - 3 43","m":["f3b3","a4b3","e1d2","b3b2","d2c2","b2b1r","c2b1"],"alts":[]},
{"f":"3R4/8/2k1p3/p2pP3/2rP2Pp/2pK3P/8/8 w - - 0 54","m":["d8c8","c6d7","c8c4","d5c4","d3c3"],"alts":[]},
{"f":"8/p7/6p1/P1KRrk1p/1P6/8/8/8 w - - 3 53","m":["d5e5","f5e5","b4b5"],"alts":[]},
{"f":"8/r7/P1p5/3p4/3K4/1P4kp/2P5/R7 w - - 2 45","m":["d4c5","h3h2","c5b6"],"alts":[]}]},"5-15":{"src":"https://lichess.org/study/G5ILgPOq/WUnq8bNf","puzzles":[{"f":"r4r2/5q1k/6Rp/p3pP2/1pn4P/5PQ1/PPP3P1/2K4R w - - 0 1","m":["g3g5","h7h8","g6h6","f7h7","h6h7","h8h7","g5h5"],"alts":[]},
{"f":"3r2k1/6pp/8/5Q2/2pP4/2q3P1/5RKP/8 w - - 0 36","m":["f5f7","g8h8","f7f8","d8f8","f2f8"],"alts":[]},
{"f":"r5k1/pp2q1p1/2p1p2p/3nP1pP/3P2P1/2PQ1r2/PPB5/R5K1 w - - 0 24","m":["d3h7","g8f7","c2g6","f7f8","h7h8"],"alts":[]},
{"f":"5k2/3b2q1/pn4p1/1rp2p2/8/8/1P2Q1P1/1K2R2R w - - 4 33","m":["h1h8","g7h8","e2e7","f8g8","e7d8"],"alts":[]},
{"f":"r1qr3k/pp3pb1/1np1p3/8/3P3P/2N2PR1/PP1Q2P1/2KR4 w - - 0 23","m":["d2g5","d8g8","g5h5","g7h6","h5h6"],"alts":[]},
{"f":"r4rk1/pp3ppp/3p1q2/P1P1p3/2B5/2B2n2/2P2P1P/R2Q1R1K b - - 1 16","m":["f6f4","d1f3","f4f3"],"alts":[]},
{"f":"4rrk1/1ppq2p1/p3Rp1p/3P4/2P2Q2/3B3P/PP4PK/8 w - - 2 26","m":["f4f5","e8e6","f5h7"],"alts":[]},
{"f":"1r4k1/r5q1/p2p1pP1/4pn2/2p1P2Q/2Pb1BK1/P6R/2R5 w - - 0 36","m":["e4f5","d3f5","f3d5"],"alts":[]},
{"f":"2r3k1/2r4p/4p1p1/1p1q1pP1/p2P1P1Q/P6R/4bB2/2R3K1 w - - 6 35","m":["h4h7","c7h7","c1c8","g8g7","c8c7"],"alts":[]},
{"f":"8/p7/5P2/PP1bp3/4N3/K7/2kp4/8 w - - 0 49","m":["e4d2","c2d2","b5b6","a7b6","a5b6"],"alts":[]},
{"f":"1r6/pp2kppQ/2n1p1n1/3p2P1/5P2/2PqP3/PP1N4/2KR3R b - - 4 27","m":["c6b4","c3b4","b8c8","d2c4","c8c4"],"alts":[]},
{"f":"r6k/q1p2p1p/1b2bPr1/p1ppP2Q/3P2p1/4B3/PP2NRPP/3R2K1 w - - 2 26","m":["e2f4","c5d4","f4g6","f7g6","h5h6"],"alts":[]},
{"f":"1r2r1k1/3p1pb1/p2q3p/1p3Pp1/3p4/P6Q/BPP3PP/4RRK1 w - - 0 24","m":["e1e8","b8e8","f5f6"],"alts":[]},
{"f":"5rk1/bpp3pp/p1npb3/4p3/1P2Nr2/P1PP3q/1B1QBPR1/2K3R1 w - - 0 22","m":["g2g7","g8h8","e4g5"],"alts":[]},
{"f":"rn3rk1/4pp1p/3p2pB/2q4P/3QP1b1/Pp6/1P2B3/1K1R2NR b - - 0 20","m":["c5c2","b1a1","a8a3","b2a3","c2a2"],"alts":[]}]},"5-16":{"src":"https://lichess.org/study/kFBNSeRd","puzzles":[{"f":"r1b2k1r/pp4pp/2pp2p1/4p3/4P3/1B1P4/PPPR1PPP/5RK1 w - - 0 1","m":["f2f4","e5f4","f1f4"],"alts":[]},
{"f":"2r3k1/p2B1pbp/1p2pnp1/n2p4/3P4/1Pr1P2P/P1QB1PP1/2R2RK1 b - - 0 19","m":["c3c2","d7c8","c2d2"],"alts":[]},
{"f":"4qk2/1b3R2/p7/1p2Q3/4P2P/P2P3K/2r5/3R4 b - - 0 41","m":["e8f7","e5h8","f8e7"],"alts":[]},
{"f":"r4rk1/3nqpp1/2N1bn1p/3p4/1p1P4/2NQP2P/1PB2PP1/R4RK1 b - - 0 18","m":["e7d6","a1a8","f8a8","c6b4","d6b4"],"alts":[]},
{"f":"N2k3r/1b1n1Bpp/p3P3/1pb5/6P1/4p3/PPP4P/1K1R3R b - - 0 20","m":["b7h1","d1d7","d8c8","d7c7","c8b8"],"alts":[]},
{"f":"2rr2k1/p5p1/1p5p/2pq1p1P/8/P4QR1/5PP1/4R1K1 w - - 0 32","m":["e1e8","g8f7","f3d5","d8d5","e8c8"],"alts":[]},
{"f":"r7/6pk/p2Q4/2p1p1qp/1pP1PrP1/1P3P1P/1P4K1/R4R2 b - - 0 25","m":["a8d8","d6d8","g5d8"],"alts":[]},
{"f":"r2k2nr/p3qBb1/1p1p3p/Q5p1/3n1B2/2N2R2/PPP3P1/R5K1 w - - 0 19","m":["a5d5","d4f3","g2f3","a8c8","f4d6"],"alts":[]},
{"f":"5rk1/p5p1/3bRr1p/1Pp4q/3p4/1P1Q1N2/P4PPP/4R1K1 b - - 0 22","m":["f6f3","g2f3","h5h2","g1f1","h2h3","f1e2","h3e6"],"alts":[]},
{"f":"8/pp3kp1/6p1/2p3P1/3n1NKP/6B1/PPqr2B1/4R3 w - - 6 41","m":["g2e4","c2a4","e4d5"],"alts":[]}]},"5-17":{"src":"https://lichess.org/study/4QvAxjvr","puzzles":[{"f":"7k/8/4PKR1/3r4/6Pb/8/8/8 w - - 3 47","m":["g4g5","h4g5","g6g5","d5g5","f6g5"],"alts":[]},
{"f":"5bk1/2Q2p1p/5qp1/p7/P1Bp4/1P5P/2r2PP1/3R2K1 w - - 6 28","m":["c4f7","g8g7","c7c2"],"alts":[]},
{"f":"8/8/8/6p1/5N2/3p3P/5kP1/3K4 b - - 0 56","m":["g5f4","h3h4","f2g2","h4h5","f4f3","d1d2","f3f2"],"alts":[]},
{"f":"3k2q1/p2p3p/1p1P4/2p5/2P2Q1K/8/P5b1/5R2 w - - 3 37","m":["f4f8","g8f8","f1f8"],"alts":[]},
{"f":"8/4bkp1/R6P/4p3/Pp2P3/1P2r3/6P1/6K1 w - - 0 34","m":["h6h7","e3e1","g1h2"],"alts":[]},
{"f":"r2q1rk1/p4p1p/1p3Qp1/2p4P/3p4/5R2/PPP2PP1/4R1K1 w - - 1 23","m":["e1e7","d8e7","f6e7"],"alts":[]},
{"f":"8/1bpp2k1/1p5r/1P2P3/3P1P2/2P1n1K1/Q5P1/8 b - - 1 30","m":["h6g6","g3f2","g6g2"],"alts":[]},
{"f":"8/2pR3p/pb4pk/8/5p1P/B6K/P1r5/6r1 w - - 4 40","m":["a3f8","h6h5","d7h7"],"alts":[]},
{"f":"8/6pp/3Bp2k/p2pP2P/P3p1PK/8/r4b2/5R2 w - - 3 38","m":["f1f2","g7g5","h4g3","a2f2","g3f2"],"alts":[]},
{"f":"7r/pppk4/2pN1r2/8/3P2p1/2P5/PP2RPP1/4R1K1 b - - 0 26","m":["f6h6","f2f4","g4g3","e2e7","d7d6","g1f1","h6h1"],"alts":[]},
{"f":"r5k1/2p1pp2/pp4p1/1q5r/5P2/2QP2R1/PP6/1K4R1 w - - 1 33","m":["g3g6","f7g6","g1g6","g8f7","c3g7","f7e8","g7g8","e8d7","g8e6","d7d8","g6g8"],"alts":[]},
{"f":"8/2p5/pp1p4/P2Pk2p/1PP1p2P/2n1K2P/3N4/8 w - - 0 46","m":["b4b5","c3d1","e3e2","a6b5","a5a6"],"alts":[]},
{"f":"2rr4/5pk1/p1Q1N1pp/1p4q1/3pP3/1B1P4/PPP3PP/6RK b - - 0 25","m":["f7e6","c6b7","g7h8"],"alts":[]},
{"f":"2nk4/8/2PBp3/1pK1P1p1/1P4Pn/8/8/8 w - - 3 43","m":["c5b5","h4g2","b5a6","g2e3","a6b7"],"alts":[]}]},"5-18":{"src":"https://lichess.org/study/6bKfsHPR","puzzles":[{"f":"8/k7/8/PK6/8/8/8/3B4 w - - 0 1","m":["d1f3","a7b8","b5b6","b8c8","b6c6","c8d8","f3g4"],"alts":[]},
{"f":"2k5/pp3b2/2p1N1p1/2P2p2/3K4/P4r2/8/R7 w - - 2 32","m":["e6g5","f7d5","g5f3"],"alts":[]},
{"f":"4b3/2k5/2P5/2K1p1p1/4BpP1/5P2/8/8 w - - 3 53","m":["c5d5","e8c6","d5e5"],"alts":[]},
{"f":"8/8/1k4p1/1P2Bp1p/2K5/4b2P/6P1/8 w - - 2 43","m":["e5d4","e3d4","c4d4","g6g5","d4e5"],"alts":[]},
{"f":"4b1B1/5pp1/1k2p2p/pp2P3/1P1K1P1P/P7/5P2/8 w - - 0 37","m":["b4a5","b6a5","d4c5"],"alts":[]},
{"f":"8/4Kbk1/p7/6Pp/4P2P/P1P5/8/8 w - - 7 58","m":["e4e5","f7c4","e5e6"],"alts":[]},
{"f":"7k/1p6/4p2p/pPPp4/3PP3/4b1P1/2B5/7K w - - 1 35","m":["c5c6","b7c6","b5c6"],"alts":[]},
{"f":"2b1k3/2P2p2/3K1P2/P6p/5P1P/8/8/8 w - - 1 47","m":["d6c6","c8a6","c6b6","e8d7","b6a6"],"alts":[]},
{"f":"3B4/3k1p2/bP4p1/3pPpKp/3P3P/6P1/8/8 b - - 3 58","m":["d7d8","g5f6","d8e8","e5e6","f7e6"],"alts":[]},
{"f":"8/8/3k1K2/p1pBp1p1/1pP3P1/1P3P2/Pb6/8 b - - 0 52","m":["e5e4","f6f7","e4e3"],"alts":[]},
{"f":"3b4/8/1pP1k3/P7/6Kp/7P/8/8 w - - 0 46","m":["a5a6","e6d6","a6a7"],"alts":[]},
{"f":"8/8/8/7p/p1b4k/P6P/2p3P1/2B3K1 w - - 8 47","m":["g1h2","c4f1","g2g3"],"alts":[]},
{"f":"8/8/p1p5/2B1k2p/3p1p2/1P2b2P/P1P1K1P1/8 b - - 0 37","m":["d4d3","e2d3","e3c5"],"alts":[]},
{"f":"8/8/P4k2/2b3p1/6Pp/4p2P/4pBK1/8 w - - 0 58","m":["f2e1","f6e5","g2f3"],"alts":[]},
{"f":"8/4kpp1/4b2p/2PB4/1K6/p5P1/5PP1/8 w - - 7 45","m":["d5e6","e7e6","b4a3"],"alts":[]}]}};

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
             hintsLeft: 3, hintUsed: false, hint: null, streak: 0, maxStreak: 0, demoTimer: null,
             miss: 0, autoMsg: false };
const hwT = (ar, en) => lang === "en" ? en : ar;   // ترجمة محلية آمنة (من غير DICT عشان ما ندوش نصوص تانية)

function hwLessonTitle(key) {
  const p = String(key).split("-"), st = STEPS.find(x => x.step === Number(p[0]));
  const les = st && st.lessons[Number(p[1])];
  return les ? les.t : "Homework";
}
function hwEntry(key) { return (typeof window.ECA_HOMEWORK === "object") ? window.ECA_HOMEWORK[key] : null; }

function openHomework(key) {
  const e = hwEntry(key); if (!e) return;
  HW.key = key; HW.entry = e; HW.finished = false;
  go("homework"); hwStartAttempt();
}
function hwStartAttempt() {
  clearTimeout(HW.demoTimer);
  HW.i = 0; HW.finished = false; HW.hintsLeft = 3; HW.streak = 0; HW.maxStreak = 0;
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
  if (ft) { HW.streak++; HW.maxStreak = Math.max(HW.maxStreak, HW.streak); }
  else HW.streak = 0;
  HW.status = "solved"; HW.flash = null; HW.sel = null; HW.hint = null;
  render();
}
// تلميح: بيعلّم على مربع القطعة اللي المفروض تتحرك — 3 مرات بس للواجب كله
// حماية: لو مربع القطعة فاضي أو القطعة من لون غلط (بيانات بايظ) مننزلش التلميح خالص
function hwHint() {
  if (!HW.game || HW.status !== "play" || HW.hintsLeft <= 0 || HW.idx % 2 === 1 || HW.idx >= HW.sol.length) return;
  const pc = HW.game.get((HW.sol[HW.idx] || "").slice(0, 2));
  if (!pc || pc.color !== HW.color) { HW.status = "wrong"; render(); setTimeout(() => { if (HW.status === "wrong") { HW.status = "play"; render(); } }, 900); return; }
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
    const prev = u.hwp[HW.key];
    u.hwp[HW.key] = { ft, t, att: ((prev && prev.att) || 0) + 1, ts: Date.now(), bs: HW.maxStreak };
    if (typeof markActiveDay === "function") markActiveDay(u);
    save();
  }
  HW.finished = true; render();
}
function hwRetry() { hwStartAttempt(); }
function hwExit() { go("lessons"); render(); }
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
  const srcLink = `<a href="${e.src}" target="_blank" rel="noopener" class="text-[11px] text-sky-400 hover:underline">${hwT("فتح الواجب على Lichess ↗", "Open homework on Lichess ↗")}</a>`;

  // واجب قراءة (مفيش موقف قابل للحل)
  if (e.reading || !e.puzzles || !e.puzzles.length) {
    return `<div class="max-w-xl mx-auto space-y-4 mt-4">
      <div class="gold-card rounded-2xl p-6 text-center space-y-3">
        <div class="text-xs text-gray-400">${hwT("واجب —", "Homework —")} ${esc(title)}</div>
        <h2 class="font-display font-bold text-xl gold-gradient-text">${hwT("الواجب ده للقراءة", "This homework is for reading")}</h2>
        <p class="text-xs text-gray-400">${hwT("الدرس ده واجبه شرح ومواقف على Lichess — افتحه وخلّي الكوتش يعلم لك إنك حللته.", "This lesson's homework is explanation & positions on Lichess — open it, and the coach will tick it for you.")}</p>
        <a href="${e.src}" target="_blank" rel="noopener" class="inline-block px-4 py-2 rounded-xl text-xs gold-btn">${hwT("فتح الواجب على Lichess ↗", "Open homework on Lichess ↗")}</a>
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
  const attN = u2 && u2.hwp && u2.hwp[HW.key] ? (u2.hwp[HW.key].att || 0) + 1 : 1;
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
  const hwPieceBtns = (typeof PIECE_SETS !== "undefined" ? PIECE_SETS : []).map(pk => `<button onclick="hwSetPieces('${pk[0]}')" aria-pressed="${pieceSet === pk[0]}" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${pieceSet === pk[0] ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/20"}">${pk[1]}</button>`).join("");
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
  const hwHintBtn = `<button onclick="hwHint()" ${solvedAll || HW.hintsLeft <= 0 || (HW.idx % 2 === 1) ? "disabled" : ""} title="${hwT("3 تلميحات بس للواجب كله", "Only 3 hints for the whole homework")}" class="tap rounded-xl text-xs bg-zinc-900 border border-sky-500/40 text-sky-300 disabled:opacity-40">💡 ${hwT("تلميح", "Hint")} (${HW.hintsLeft})</button>`;
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
          <span aria-hidden="true" class="w-px self-stretch bg-yellow-500/30"></span>
          <span class="font-bold text-yellow-300">${hwT("القطع:", "Pieces:")}</span>
          ${hwPieceBtns}
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
        ${u2 && u2.role === "student" && u2.hwp && u2.hwp[HW.key] ? `<div class="gold-card rounded-2xl p-4 text-center">
          <div class="text-lg font-extrabold text-emerald-300">${u2.hwp[HW.key].ft}/${u2.hwp[HW.key].t}</div>
          <div class="text-[11px] text-gray-400">${hwT("أفضل نتيجة مسجّلة — صح من أول محاولة", "Best recorded score — correct on the first try")}</div>
        </div>` : ""}
        <div class="lg:hidden">${hwBack}</div>
      </div>
    </div>`;
}
