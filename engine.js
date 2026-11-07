export const N = 4;
export function probabilities(losses, eta) {
  const low = Math.min(...losses);
  const raw = losses.map(x => Math.exp(-eta * (x - low)));
  const total = raw.reduce((a,b) => a+b,0);
  return raw.map(x=>x/total);
}
export function initial() { return {losses:[0,0,0,0], algorithm:0, uniform:0, history:[]}; }
export function nextAdvice(state) {
  const t = state.history.length;
  return [0,1,t ? state.history[t-1].outcome : 0,t%2];
}
export function presetOutcome(scenario, state, horizon, eta) {
  const t = state.history.length;
  if (scenario === 'switch') return t < Math.floor(horizon/2) ? 0 : 1;
  if (scenario === 'alternate') return t%2;
  if (scenario === 'adversary') {
    const p = probabilities(state.losses,eta);
    const q = nextAdvice(state).reduce((s,x,i)=>s+x*p[i],0);
    return q >= .5 ? 0 : 1;
  }
  return t%7 === 6 ? 0 : 1;
}
export function advance(state, predictions, outcome, eta, mode) {
  if (predictions.length!==N || predictions.some(x=>x!==0&&x!==1) || ![0,1].includes(outcome) || !(eta>0)) throw new Error('Invalid round');
  const weights = probabilities(state.losses,eta);
  const q = predictions.reduce((s,x,i)=>s+x*weights[i],0);
  const prediction = q>=.5 ? 1 : 0;
  const expertLoss = predictions.map(x=>Number(x!==outcome));
  const expectedLoss = expertLoss.reduce((s,x,i)=>s+x*weights[i],0);
  const roundLoss = mode==='hedge' ? expectedLoss : Number(prediction!==outcome);
  const losses = state.losses.map((x,i)=>x+expertLoss[i]);
  const algorithm = state.algorithm + roundLoss;
  const uniform = state.uniform + expertLoss.reduce((a,b)=>a+b,0)/N;
  const best = Math.min(...losses);
  const t = state.history.length+1;
  const bound = mode==='hedge' ? Math.log(N)/eta+eta*t/8 : (Math.log(N)+eta*best)/(-Math.log((1+Math.exp(-eta))/2));
  const row = {t,predictions:[...predictions],outcome,weights,q,prediction,roundLoss,expertLoss,losses:[...losses],algorithm,uniform,best,regret:algorithm-best,bound};
  return {losses,algorithm,uniform,history:[...state.history,row]};
}

