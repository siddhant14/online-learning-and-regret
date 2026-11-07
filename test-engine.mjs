import assert from 'node:assert/strict';
import {initial,probabilities,advance,nextAdvice,presetOutcome} from './engine.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9, a+' != '+b);
let s=advance(initial(),[0,1,0,0],1,Math.log(2),'hedge');
near(s.algorithm,.75);assert.deepEqual(s.losses,[1,0,1,1]);
const w=probabilities(s.losses,Math.log(2));
[.2,.4,.2,.2].forEach((v,i)=>near(w[i],v));
s=advance(s,[0,1,1,1],1,Math.log(2),'hedge');
near(s.algorithm,.95);near(s.history[1].q,.8);
let wm=advance(initial(),[0,1,0,1],0,.4,'wm');
near(wm.algorithm,1);assert.equal(wm.history[0].prediction,1);
let seed=117;
const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
let checked=0;
for(const eta of [.05,.4,.75,2])for(const mode of ['hedge','wm'])for(let run=0;run<30;run++){
 let st=initial();
 for(let t=0;t<200;t++){
  st=advance(st,Array.from({length:4},()=>Number(rand()<.5)),Number(rand()<.5),eta,mode);
  const r=st.history.at(-1);
  assert.ok((mode==='hedge'?r.regret:r.algorithm)<=r.bound+1e-8);
  near(r.weights.reduce((a,b)=>a+b),1);
  assert.ok(r.weights.every(x=>Number.isFinite(x)&&x>=0));
  checked++;
 }
}
for(const scenario of ['steady','switch','alternate','adversary'])for(const mode of ['hedge','wm']){
 let st=initial();
 for(let t=0;t<200;t++)st=advance(st,nextAdvice(st),presetOutcome(scenario,st,200,.4),.4,mode);
 assert.equal(st.history.length,200);
 if(mode==='wm'&&scenario==='adversary')assert.equal(st.algorithm,200);
}
const stable=probabilities([100000,100005,100010,100020],2);
near(stable.reduce((a,b)=>a+b),1);assert.ok(stable.every(Number.isFinite));
assert.throws(()=>advance(initial(),[0,2,0,1],1,.4,'hedge'));
console.log('Passed: hand-checked rounds, tie rule, '+checked+' prefix-bound checks, all presets, and stable normalization.');

