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
{ const neu = C(base); neu.arena.days = [today]; T('days history wiped down to today', false, { old: base, neu }); }
{ const neu = C(base); neu.arena.days = ['2026-10-21', today]; T('oldest day dropped before the 800 cap', false, { old: base, neu }); }
{ const neu = C(base); neu.arena.days.push(today + '-x'); T('malformed day appended', false, { old: base, neu }); }
{ const old = C(base); old.arena.days = Array.from({ length: 800 }, (_, i) => 'd' + i); const neu = C(old); neu.arena.days.shift(); neu.arena.days.push(today);
  T('oldest day rolls off at the 800 cap', true, { old, neu }); }
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
{ const neu = C(base); neu.nickname = 'star-knight'; T('preset student nickname', true, { old: base, neu }); }
{ const neu = C(base); neu.nickname = 'Mona real name'; T('free-form student nickname', true, { old: base, neu }); }
{ const neu = C(base); neu.nickname = ' <img>'; T('unsafe nickname rejected', false, { old: base, neu }); }
{ const neu = C(base); neu.arena.stars = 10; neu.arena.xp = 200; T('stars and XP cannot be edited without a receipt', false, { old: base, neu }); }
{
  const old = C(base); old.att['1-0'] = true; old.arena.stars = 0; old.arena.xp = 0;
  const neu = C(old); neu.arena.stars = 1; neu.arena.xp = 20; neu.lastEconomy = 'lesson-1-0';
  const receipt = { uid, kind: 'earn', source: 'lesson', key: '1-0', day: today, item: '', score: 0, starsDelta: 1, xpDelta: 20, missionBonus: false, at: now };
  T('attended interactive lesson reward', true, { old, neu, after: { ['econ:' + neu.lastEconomy]: receipt } });
  const noAttendance = C(old); delete noAttendance.att['1-0'];
  const noAttendanceNeu = C(noAttendance); noAttendanceNeu.arena.stars = 1; noAttendanceNeu.arena.xp = 20; noAttendanceNeu.lastEconomy = neu.lastEconomy;
  T('interactive lesson reward requires attendance', false, { old: noAttendance, neu: noAttendanceNeu, after: { ['econ:' + neu.lastEconomy]: receipt } });
  T('interactive lesson reward cannot be collected twice', false, { old, neu, before: { ['econ:' + neu.lastEconomy]: receipt }, after: { ['econ:' + neu.lastEconomy]: receipt } });
}
{
  const old = C(base); old.arena.stars = 0; old.arena.xp = 0;
  const neu = C(old); neu.arena.stars = 2; neu.arena.xp = 20; neu.arena.missionDate = today; neu.arena.missionDone = true;
  neu.lastEconomy = `puzzle-${today}-easiest`;
  const receipt = { uid, kind: 'earn', source: 'puzzle', key: 'easiest', day: today, item: '', score: 0, starsDelta: 2, xpDelta: 20, missionBonus: true, at: now };
  T('puzzle reward includes one-time mission bonus', true, { old, neu, after: { ['econ:' + neu.lastEconomy]: receipt } });
}
{
  // coach hints lower the reward: 'hardest' is 5 stars / 100 xp, with hint stage 2 (x0.75) it is 3 stars / 75 xp
  const old = C(base); old.arena.stars = 0; old.arena.xp = 0; old.arena.missionDate = today; old.arena.missionDone = true;
  const pay = (stars, xp) => { const neu = C(old); neu.arena.stars = stars; neu.arena.xp = xp; neu.lastEconomy = `puzzle-${today}-hardest`;
    return { old, neu, after: { ['econ:' + neu.lastEconomy]: { uid, kind: 'earn', source: 'puzzle', key: 'hardest', day: today, item: '', score: 0, starsDelta: stars, xpDelta: xp, missionBonus: false, at: now } } }; };
  T('puzzle reward lowered by coach hints', true, pay(3, 75));
  T('puzzle reward at half (last hint)', true, pay(2, 50));
  T('puzzle reward of zero stars', false, pay(0, 75));
  T('puzzle reward above the full amount', false, pay(6, 100));
  T('puzzle reward with a fractional amount', false, pay(2.5, 50));
}
{
  const old = C(base); old.arena.stars = 100; old.arena.xp = 0;
  const neu = C(old); neu.arena.stars = 50; neu.shop = { titles: ['title-tactics'], bots: [], hints: 0, activeTitle: '' };
  neu.lastEconomy = 'buy-title-tactics-abcd1234';
  const receipt = { uid, kind: 'purchase', source: '', key: '', day: today, item: 'title-tactics', score: 0, starsDelta: -50, xpDelta: 0, missionBonus: false, at: now };
  T('shop purchase spends stars atomically', true, { old, neu, after: { ['econ:' + neu.lastEconomy]: receipt } });
  const direct = C(old); direct.shop = { titles: ['title-tactics'], bots: [], hints: 0, activeTitle: '' };
  T('shop item cannot be granted without a receipt', false, { old, neu: direct });
}
{
  const old = C(base); old.shop = { titles: ['title-tactics'], bots: [], hints: 0, activeTitle: '' };
  const neu = C(old); neu.shop.activeTitle = 'title-tactics';
  T('owned title can be equipped', true, { old, neu });
}
{
  const old = C(base); old.arena.stars = 0; old.arena.xp = 0;
  const neu = C(old); neu.arena.stars = 8; neu.arena.xp = 160; neu.lastEconomy = `bot-${today}-7`;
  const receipt = { uid, kind: 'earn', source: 'bot', key: '7', day: today, item: '', score: 0, starsDelta: 8, xpDelta: 160, missionBonus: false, at: now };
  T('locked bot reward rejected', false, { old, neu, after: { ['econ:' + neu.lastEconomy]: receipt } });
}
{
  const old = C(base); old.shop = { titles: [], bots: [], hints: 1, activeTitle: '' };
  const neu = C(old); neu.shop.hints = 0; neu.lastEconomy = 'hint-use-abcd1234';
  const receipt = { uid, kind: 'spend-hint', source: '', key: '', day: today, item: '', score: 0, starsDelta: 0, xpDelta: 0, missionBonus: false, at: now };
  T('purchased homework hint is consumed once', true, { old, neu, after: { ['econ:' + neu.lastEconomy]: receipt } });
  const noStock = C(base); const forged = C(noStock); forged.shop = { titles: [], bots: [], hints: -1, activeTitle: '' }; forged.lastEconomy = neu.lastEconomy;
  T('hint balance cannot be overspent', false, { old: noStock, neu: forged, after: { ['econ:' + forged.lastEconomy]: receipt } });
}
console.log(`\n${pass} passed, ${fail} failed`);
