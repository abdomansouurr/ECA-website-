// Faithful JS port of the new student-update rules, to check logic against real client payloads.
const get = (m, k, d) => (m && Object.prototype.hasOwnProperty.call(m, k)) ? m[k] : d;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function makeCtx({ uid, old, neu, before, after, now }) {
  const ex = id => id in before, exA = id => id in after;
  const num = (m, k) => get(m, k, 0);
  const newL = () => get(neu, 'lastAttempt', ''), oldL = () => get(old, 'lastAttempt', '');
  const newAttempt = kind => typeof newL() === 'string' && new RegExp('^' + uid + '_' + kind + '_[A-Za-z0-9-]{1,40}$').test(newL())
    && !ex(newL()) && exA(newL()) && (oldL() === '' || !ex(oldL()) || now > before[oldL()].at + 3000);
  const newOk = () => after[newL()].ok === true;
  const puzSame = (o, n) => num(o,'t') === num(n,'t') && num(o,'c') === num(n,'c');
  const arenaSame = (o, n) => ['puzTried','puzSolved','puzStreak','puzBestStreak'].every(k => num(o,k) === num(n,k));
  const dailyStep = (o, n) => num(n,'t') === num(o,'t') + 1 && ((newOk() && num(n,'c') === num(o,'c') + 1) || (!newOk() && num(n,'c') === num(o,'c')));
  const arenaStep = (o, n) => num(n,'puzTried') === num(o,'puzTried') + 1
    && ((newOk() && num(n,'puzSolved') === num(o,'puzSolved') + 1 && num(n,'puzStreak') === num(o,'puzStreak') + 1)
        || (!newOk() && num(n,'puzSolved') === num(o,'puzSolved') && num(n,'puzStreak') === 0))
    && num(n,'puzBestStreak') >= num(o,'puzBestStreak')
    && (num(n,'puzBestStreak') === num(o,'puzBestStreak') || num(n,'puzBestStreak') === num(n,'puzStreak'));
  const countersOk = () => { const op = get(old,'puz',{}), np = get(neu,'puz',{}), oa = get(old,'arena',{}), na = get(neu,'arena',{});
    return (puzSame(op,np) && arenaSame(oa,na)) || (!puzSame(op,np) && arenaSame(oa,na) && newAttempt('daily') && dailyStep(op,np))
      || (puzSame(op,np) && !arenaSame(oa,na) && newAttempt('arena') && arenaStep(oa,na)); };
  const dateNear = p => { if (p.length < 3) return false; const t = Date.UTC(+p[0], +p[1]-1, +p[2]); return now > t - 864e5 && now < t + 2*864e5; };
  const daysOk = () => { const od = get(get(old,'arena',{}),'days',[]), nd = get(get(neu,'arena',{}),'days',[]);
    return eq(nd, od) || (Array.isArray(nd) && nd.length >= 1 && nd.length <= 800
      && ((nd.length === od.length + 1 && eq(nd.slice(0, od.length), od))
          || (od.length >= 800 && nd.length === 800 && eq(nd.slice(0, 799), od.slice(od.length - 799))))
      && typeof nd[nd.length-1] === 'string' && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(nd[nd.length-1]) && dateNear(nd[nd.length-1].split('-'))); };
  const lvl = String(get(old,'level',1));
  const size = m => Object.keys(m).length;
  const examStart = (k, a, b) => (size(a) === 0 || get(a,'status','') === 'retry') && k === lvl
    && get(b,'status','') === 'failed' && get(b,'score',-1) === 0 && get(b,'inProgress',false) === true
    && get(b,'attempts',0) === get(a,'attempts',0) + 1 && newAttempt('exam') && after[newL()].key === k + '-' + String(get(b,'attempts',0));
  const examInTime = (k, a) => { const id = uid + '_exam_' + k + '-' + String(get(a,'attempts',0)); return ex(id) && now < before[id].at + 20*60000; };
  const examEnd = (k, a, b) => get(a,'inProgress',false) === true && get(a,'status','') === 'failed' && get(b,'inProgress',false) === false
    && get(b,'attempts',0) === get(a,'attempts',0) && typeof get(b,'score',-1) === 'number' && b.score >= 0 && b.score <= 100
    && ((get(b,'status','') === 'passed' && b.score >= 70) || (get(b,'status','') === 'failed' && b.score < 70 && get(b,'reqRetry',false) === false))
    && examInTime(k, a);
  const diffKeys = (n, o) => [...new Set([...Object.keys(n), ...Object.keys(o)])].filter(k => !eq(n[k], o[k]));
  const examFlags = (a, b) => get(a,'status','') === 'failed' && diffKeys(b, a).every(k => ['reqRetry','rejected','reqDate'].includes(k));
  const examOk = () => { const o = get(old,'examState',{}), n = get(neu,'examState',{}), ch = diffKeys(n, o);
    if (!ch.length) return true; if (!ch.every(k => k === lvl)) return false;
    const a = get(o,lvl,{}), b = get(n,lvl,{}); return typeof b === 'object' && (examStart(lvl,a,b) || examEnd(lvl,a,b) || examFlags(a,b)); };
  const passedNow = lv => get(get(get(neu,'examState',{}),String(lv),{}),'status','') === 'passed' && get(get(get(old,'examState',{}),String(lv),{}),'status','') !== 'passed';
  const levelOk = () => { const ol = get(old,'level',1), nl = get(neu,'level',1); return nl === ol || (nl === ol + 1 && nl <= 6 && passedNow(ol)); };
  const certsOk = () => { const oc = get(old,'certificates',[]), nc = get(neu,'certificates',[]), ol = get(old,'level',1);
    return eq(nc, oc) || (nc.length === oc.length + 1 && eq(nc.slice(0, oc.length), oc) && passedNow(ol) && get(nc[oc.length],'step',0) === ol
      && get(nc[oc.length],'score',-1) === neu.examState[String(ol)].score); };
  const economyOk = () => {
    const oa = get(old, 'arena', {}), na = get(neu, 'arena', {}), os = get(old, 'shop', {}), ns = get(neu, 'shop', {});
    const sameProtected = ['stars','xp','missionDate','missionDone'].every(k => get(oa,k,k === 'missionDate' ? '' : k === 'missionDone' ? false : 0) === get(na,k,k === 'missionDate' ? '' : k === 'missionDone' ? false : 0));
    const sameShopCore = ['titles','bots','hints'].every(k => eq(get(os,k,k === 'hints' ? 0 : []), get(ns,k,k === 'hints' ? 0 : [])));
    const active = get(ns,'activeTitle','');
    const equipOk = sameShopCore && (active === get(os,'activeTitle','') || active === '' || (get(os,'titles',[]).includes(active)));
    const id = get(neu,'lastEconomy','');
    if (sameProtected && equipOk && id === get(old,'lastEconomy','')) return true;
    if (!id || id === get(old,'lastEconomy','') || before['econ:' + id] || !after['econ:' + id]) return false;
    const r = after['econ:' + id], deltaStars = num(na,'stars') - num(oa,'stars'), deltaXp = num(na,'xp') - num(oa,'xp');
    if (r.uid !== uid || r.at !== now || r.starsDelta !== deltaStars || r.xpDelta !== deltaXp || num(na,'stars') < 0 || num(na,'xp') < 0) return false;
    const titles = get(os,'titles',[]), newTitles = get(ns,'titles',[]), bots = get(os,'bots',[]), newBots = get(ns,'bots',[]);
    const hints = num(os,'hints'), newHints = num(ns,'hints'), activeSame = get(os,'activeTitle','') === get(ns,'activeTitle','');
    const changedBy = source => r.kind === 'earn' && source === 'earn' && sameShopCore && activeSame;
    if (r.kind === 'earn') {
      if (!changedBy('earn') || r.item !== '' || r.score && r.source !== 'vision') return false;
      if (r.source === 'lesson') return id === 'lesson-' + r.key && old.att && old.att[r.key] === true && r.starsDelta === 1 && r.xpDelta === 20;
      if (r.source === 'puzzle') {
        const values = { daily: 1, easiest: 1, easier: 2, normal: 3, harder: 4, hardest: 5 }, baseStars = values[r.key] || 0;
        const bonus = r.missionBonus === true;
        return baseStars > 0 && id === 'puzzle-' + r.day + '-' + r.key && r.starsDelta === baseStars + (bonus ? 1 : 0)
          && r.xpDelta === baseStars * 20 && (bonus
            ? get(oa,'missionDate','') !== r.day && get(na,'missionDate','') === r.day && get(na,'missionDone',false) === true
            : get(oa,'missionDate','') === get(na,'missionDate','') && get(oa,'missionDone',false) === get(na,'missionDone',false));
      }
      if (r.source === 'bot') return /^[0-7]$/.test(r.key) && id === 'bot-' + r.day + '-' + r.key
        && (r.key === '0' || (get(os,'bots',[]).includes(Number(r.key))))
        && r.starsDelta === Number(r.key) + 1 && r.xpDelta === r.starsDelta * 20;
      if (r.source === 'pawn') return id === 'pawn-' + r.day && r.starsDelta === 2 && r.xpDelta === 40;
      if (r.source === 'vision') return Number.isInteger(r.score) && r.score >= 3 && id === 'vision-' + r.day && r.starsDelta === Math.min(10, Math.floor(r.score / 3)) && r.xpDelta === r.starsDelta * 20;
      return false;
    }
    if (r.kind === 'purchase') {
      if (r.xpDelta !== 0 || r.source !== '' || r.key !== '' || r.score !== 0 || r.missionBonus !== false || !activeSame) return false;
      const costs = { 'title-tactics': 50, 'title-knight': 120, 'title-master': 250, hint: 20, 'bot-1': 20, 'bot-2': 40, 'bot-3': 70, 'bot-4': 100, 'bot-5': 150, 'bot-6': 220, 'bot-7': 300 };
      if (costs[r.item] !== -r.starsDelta) return false;
      if (r.item.startsWith('title-')) return !titles.includes(r.item) && newTitles.length === titles.length + 1 && newTitles.includes(r.item) && titles.every(x => newTitles.includes(x)) && eq(bots,newBots) && hints === newHints;
      if (r.item === 'hint') return newHints === hints + 1 && eq(titles,newTitles) && eq(bots,newBots);
      if (r.item.startsWith('bot-')) { const level = Number(r.item.slice(4)); return !bots.includes(level) && newBots.length === bots.length + 1 && newBots.includes(level) && bots.every(x => newBots.includes(x)) && eq(titles,newTitles) && hints === newHints; }
      return false;
    }
    return r.kind === 'spend-hint' && id.startsWith('hint-use-') && r.starsDelta === 0 && r.xpDelta === 0 && hints > 0 && newHints === hints - 1
      && eq(titles,newTitles) && eq(bots,newBots) && activeSame && r.source === '' && r.key === '' && r.item === '' && r.score === 0 && r.missionBonus === false;
  };
  const blocked = ['role','username','group','mode','coachName','stuCode','parentPhone','parentCode','note','courseFee','amountPaid','remaining','lastPayDate','lastPayAmount','att','hw'];
  const nickname = get(neu, 'nickname', '');
  const r = { blocked: !diffKeys(neu, old).some(k => blocked.includes(k)), nicknameOk: nickname === '' || (typeof nickname === 'string' && nickname.length >= 2 && nickname.length <= 24 && !/[<>"'`]/.test(nickname)), countersOk: countersOk(), daysOk: daysOk(), examOk: examOk(), levelOk: levelOk(), certsOk: certsOk(), economyOk: economyOk() };
  r.allow = Object.values(r).every(Boolean); return r;
}
module.exports = { makeCtx };
