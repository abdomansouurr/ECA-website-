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
    return eq(nd, od) || (Array.isArray(nd) && nd.length >= 1 && nd.length <= od.length + 1 && nd.length <= 800
      && eq(nd.slice(0, nd.length - 1), od.slice(od.length - (nd.length - 1), od.length)) && typeof nd[nd.length-1] === 'string' && dateNear(nd[nd.length-1].split('-'))); };
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
  const blocked = ['role','username','group','mode','coachName','stuCode','parentPhone','parentCode','note','courseFee','amountPaid','remaining','lastPayDate','lastPayAmount','att','hw'];
  const r = { blocked: !diffKeys(neu, old).some(k => blocked.includes(k)), countersOk: countersOk(), daysOk: daysOk(), examOk: examOk(), levelOk: levelOk(), certsOk: certsOk() };
  r.allow = Object.values(r).every(Boolean); return r;
}
module.exports = { makeCtx };
