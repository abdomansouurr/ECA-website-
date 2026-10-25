const { makeCtx } = require('./rules-sim.js');
const uid = 'stuA1', now = Date.now(), today = new Date(now).toISOString().slice(0,10);
const C = x => JSON.parse(JSON.stringify(x));
const base = { name: 'Y', role: 'student', level: 1, puz: { t: 3, c: 2 }, arena: { days: ['2026-10-20','2026-10-21'], puzTried: 5, puzSolved: 4, puzStreak: 2, puzBestStreak: 3 }, att: {}, hw: {} };
let pass = 0, fail = 0;
function T(name, expect, args) { const r = makeCtx(Object.assign({ uid, now, before: {}, after: {} }, args)); const ok = r.allow === expect;
  ok ? pass++ : fail++; console.log((ok ? '✅' : '❌'), name, '→', r.allow ? 'ALLOW' : 'DENY', ok ? '' : JSON.stringify(r)); }
// 1) daily correct, with day appended
{ const neu = C(base); neu.puz = { t: 4, c: 3 }; neu.arena.days.push(today); const id = `${uid}_daily_${today}-L1`; neu.lastAttempt = id;
  T('daily correct', true, { old: base, neu, after: { [id]: { ok: true, at: now } } });
  T('daily: claims correct but attempt says wrong', false, { old: base, neu, after: { [id]: { ok: false, at: now } } });
  T('daily: attempt already existed (retry)', false, { old: base, neu, before: { [id]: { ok: true, at: now - 9e5 } }, after: { [id]: { ok: true, at: now } } });
  T('daily: no attempt doc at all', false, { old: base, neu }); }
// 2) +5 inflation
{ const neu = C(base); neu.puz = { t: 8, c: 7 }; const id = `${uid}_daily_${today}-L1`; neu.lastAttempt = id;
  T('daily: +5 inflation', false, { old: base, neu, after: { [id]: { ok: true, at: now } } }); }
// 3) arena wrong / right
{ const neu = C(base); Object.assign(neu.arena, { puzTried: 6, puzStreak: 0 }); const id = `${uid}_arena_AbC12`; neu.lastAttempt = id;
  T('arena wrong', true, { old: base, neu, after: { [id]: { ok: false, at: now } } }); }
{ const neu = C(base); Object.assign(neu.arena, { puzTried: 6, puzSolved: 5, puzStreak: 3, puzBestStreak: 3 }); const id = `${uid}_arena_XyZ99`; neu.lastAttempt = id;
  T('arena right (streak 3, best 3)', true, { old: base, neu, after: { [id]: { ok: true, at: now } } });
  const n2 = C(neu); n2.arena.puzBestStreak = 50; T('arena: best streak forged', false, { old: base, neu: n2, after: { [id]: { ok: true, at: now } } });
  const prevId = `${uid}_arena_PREV1`; const o2 = C(base); o2.lastAttempt = prevId;
  T('arena: 1s after previous attempt (rate limit)', false, { old: o2, neu, before: { [prevId]: { ok: true, at: now - 1000 } }, after: { [id]: { ok: true, at: now }, [prevId]: { ok: true, at: now - 1000 } } });
  T('arena: 10s after previous attempt', true, { old: o2, neu, before: { [prevId]: { ok: true, at: now - 10000 } }, after: { [id]: { ok: true, at: now }, [prevId]: { ok: true, at: now - 10000 } } }); }
// 4) unrelated save (games), days append ok / forged
{ const neu = C(base); neu.arena.games = { w: 1, l: 0, d: 0 }; neu.arena.days.push(today); T('game result + today', true, { old: base, neu }); }
{ const neu = C(base); neu.arena.days = ['2026-01-01','2026-01-02','2026-01-03', today]; T('days history rewritten', false, { old: base, neu }); }
{ const neu = C(base); neu.arena.days.push('2027-05-05'); T('future day appended', false, { old: base, neu }); }
{ const neu = C(base); neu.att = { '1-0': true }; T('student marks own attendance', false, { old: base, neu }); }
// 5) exam start → pass
const exId = `${uid}_exam_1-1`;
const started = C(base); started.examState = { '1': { status: 'failed', score: 0, attempts: 1, reqRetry: false, inProgress: true, date: today } }; started.lastAttempt = exId;
T('exam start', true, { old: base, neu: started, after: { [exId]: { ok: false, key: '1-1', at: now } } });
T('exam start again (attempt exists)', false, { old: base, neu: started, before: { [exId]: { at: now } }, after: { [exId]: { ok: false, key: '1-1', at: now } } });
{ const neu = C(started); neu.examState['1'] = { status: 'passed', score: 80, attempts: 1, date: today }; neu.level = 2;
  neu.certificates = [{ step: 1, score: 80, studentName: 'Y', coachName: 'C', date: today }];
  T('exam pass within time', true, { old: started, neu, before: { [exId]: { at: now - 5*60000 } } });
  T('exam pass after 25 min', false, { old: started, neu, before: { [exId]: { at: now - 25*60000 } } });
  const n3 = C(neu); n3.level = 4; T('exam pass but jumps to level 4', false, { old: started, neu: n3, before: { [exId]: { at: now - 60000 } } });
  const n4 = C(neu); n4.certificates[0].score = 100; T('exam pass, certificate score forged', false, { old: started, neu: n4, before: { [exId]: { at: now - 60000 } } }); }
{ const neu = C(started); neu.examState['1'] = { status: 'failed', score: 40, attempts: 1, reqRetry: false, date: today };
  T('exam fail within time', true, { old: started, neu, before: { [exId]: { at: now - 60000 } } });
  const failed = neu;
  const n2 = C(failed); n2.examState['1'] = { status: 'passed', score: 90, attempts: 1, date: today }; n2.level = 2;
  T('failed → passed flip', false, { old: failed, neu: n2, before: { [exId]: { at: now - 60000 } } });
  const n3 = C(failed); Object.assign(n3.examState['1'], { reqRetry: true, rejected: false, reqDate: today });
  T('request retry', true, { old: failed, neu: n3 });
  const n5 = C(failed); delete n5.examState['1']; T('delete failed exam to retake', false, { old: failed, neu: n5 });
  const retry = C(failed); retry.examState['1'] = { status: 'retry', prevScore: 40, attempts: 1, approvedDate: today };
  const s2 = C(retry); s2.examState['1'] = { status: 'failed', score: 0, attempts: 2, reqRetry: false, inProgress: true, date: today }; s2.lastAttempt = `${uid}_exam_1-2`;
  T('start after coach approved retry', true, { old: retry, neu: s2, before: { [exId]: { at: now - 864e5 } }, after: { [`${uid}_exam_1-2`]: { ok: false, key: '1-2', at: now }, [exId]: { at: now - 864e5 } } }); }
{ const neu = C(base); neu.level = 3; T('level edited directly', false, { old: base, neu }); }
{ const neu = C(base); neu.name = 'New Name'; neu.puzDone = { 1: { i: 0, ok: true } }; T('ordinary profile save', true, { old: base, neu }); }
console.log(`\n${pass} passed, ${fail} failed`);
