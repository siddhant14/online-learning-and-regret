import {N,initial,probabilities,nextAdvice,presetOutcome,advance} from './engine.js';
const $ = id=>document.getElementById(id);
const names=['Always 0','Always 1','Last outcome','Alternator'];
const letters=['A','B','C','D'];
let state=initial(), timer=null, manual=[0,1,0,1], outcome=0;
const config=()=>({eta:Number($('eta').value),horizon:Number($('horizon').value),mode:$('mode').value,scenario:$('scenario').value});
const fixed=(n,d=2)=>Math.abs(n)<1e-10 ? (0).toFixed(d) : n.toFixed(d);
function stop() { if(timer!==null) clearInterval(timer); timer=null; }
function reset() { stop();state=initial();manual=[0,1,0,1];outcome=0;render(); }
function step() {
 const c=config();
 if(state.history.length>=c.horizon) {stop();render();return;}
 const advice=c.scenario==='manual' ? manual : nextAdvice(state);
 const y=c.scenario==='manual' ? outcome : presetOutcome(c.scenario,state,c.horizon,c.eta);
 state=advance(state,advice,y,c.eta,c.mode);
 if(state.history.length>=c.horizon)stop();
 render();
}
function toggleRun() {
 if(timer!==null) {stop();render();return;}
 if(config().scenario==='manual') return;
 timer=setInterval(step,90);
 step();
}
function plot(c) {
 const W=760,H=280,L=42,R=17,T=18,B=31;
 const maxLoss=Math.max(4,state.algorithm,state.uniform,...state.history.map(x=>x.best));
 const ymax=Math.ceil(maxLoss/4)*4;
 const x=t=>L+(W-L-R)*t/c.horizon, y=v=>H-B-(H-B-T)*v/ymax;
 let svg='<title id="chart-title">Cumulative losses by round</title><desc id="chart-desc">'+state.history.length+' rounds. Learner loss '+fixed(state.algorithm)+'. Best fixed expert '+Math.min(...state.losses)+'. Exact values in the round log.</desc>';
 for(let j=0;j<=4;j++){
  const v=ymax*j/4;
  svg+='<line class="grid" x1="'+L+'" x2="'+(W-R)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text x="'+(L-9)+'" y="'+(y(v)+3)+'" text-anchor="end">'+v+'</text>';
 }
 for(let j=0;j<=4;j++){
  const t=c.horizon*j/4;
  svg+='<text x="'+x(t)+'" y="'+(H-11)+'" text-anchor="middle">'+t+'</text>';
 }
 svg+='<text class="axis-label" x="'+L+'" y="9">LOSS</text><text class="axis-label" x="'+(W-R)+'" y="'+(H-1)+'" text-anchor="end">ROUND</text>';
 const series=[['uniform','#a6adbb','5 5'],['best','#3c755f','7 4'],['algorithm','#263fcc','']];
 for(const [key,color,dash] of series) {
  const points=[[0,0],...state.history.map(r=>[r.t,r[key]])].map(([t,v])=>x(t)+','+y(v)).join(' ');
  svg+='<polyline class="line" stroke="'+color+'" stroke-dasharray="'+dash+'" points="'+points+'"/>';
 }
 if(state.history.length)svg+='<circle cx="'+x(state.history.length)+'" cy="'+y(state.algorithm)+'" r="4" fill="#263fcc" stroke="#fafbff" stroke-width="2"/>';
 $('chart').innerHTML=svg;
}
function render() {
 const c=config(), n=state.history.length, done=n>=c.horizon, last=state.history.at(-1);
 const manualMode=c.scenario==='manual';
 const p=probabilities(state.losses,c.eta);
 const advice=manualMode ? manual : nextAdvice(state);
 const q=advice.reduce((s,v,i)=>s+v*p[i],0);
 $('eta-value').textContent=fixed(c.eta);
 $('horizon-value').textContent=c.horizon;
 $('beta-value').textContent=fixed(Math.exp(-c.eta),4);
 $('round-counter').textContent='Round '+String(n).padStart(2,'0')+' / '+c.horizon;
 $('algorithm-label').textContent=c.mode==='hedge' ? 'Expected learner loss' : 'Learner mistakes';
 $('regret-label').textContent=c.mode==='hedge' ? 'Expected regret' : 'Regret';
 $('algorithm-value').textContent=fixed(state.algorithm,c.mode==='hedge'?2:0);
 $('best-value').textContent=Math.min(...state.losses);
 $('regret-value').textContent=fixed(state.algorithm-Math.min(...state.losses));
 $('bound-label').textContent=c.mode==='hedge' ? 'REGRET UPPER BOUND' : 'MISTAKE UPPER BOUND';
 $('bound-formula').textContent=c.mode==='hedge' ? 'ln(4)/η + ηt/8' : '(ln(4) + ηL*) / −ln((1+β)/2)';
 $('bound-value').textContent=last ? fixed(last.bound) : '—';
 $('step').disabled=done||timer!==null;
 $('play').disabled=done||manualMode;
 $('play').innerHTML=timer!==null ? 'Pause <span>Ⅱ</span>' : 'Run all <span>▶</span>';
 $('play-status').textContent=done?'Complete':timer!==null?'Running':n?'Paused':'Ready';
 $('export').disabled=!n;
 $('manual-outcome').hidden=!manualMode;
 document.querySelectorAll('[data-outcome]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.outcome)===outcome)));
 $('advice-help').textContent=done ? 'Final normalized weights after all outcomes.' : manualMode ? 'Click each prediction to change it, choose an outcome, then reveal the round.' : 'Normalized weights before the next outcome is revealed.';
 $('experts').innerHTML=p.map((w,i)=>'<div class="expert"><div class="expert-head"><span class="expert-letter">'+letters[i]+'</span><span>'+(manualMode?'Expert '+letters[i]:names[i])+'</span><span class="expert-weight">'+fixed(w*100,1)+'%</span></div><div class="weight-track"><div class="weight-fill" style="width:'+(100*w)+'%"></div></div><div class="expert-bottom"><span>'+state.losses[i]+' mistakes</span><button class="prediction-button" type="button" data-expert="'+i+'" aria-label="Expert '+letters[i]+' prediction '+advice[i]+(manualMode?'; click to toggle':'')+'" '+(!manualMode||done?'disabled':'')+'>'+advice[i]+'</button></div></div>').join('');
 $('forecast-text').textContent=done ? 'Experiment complete. Reset to try another setup.' : c.mode==='hedge' ? 'Next P(prediction = 1) = '+fixed(q,3) : 'Next weighted vote = '+(q>=.5?1:0)+' · ties → 1';
 $('last-result').textContent=last ? 'Last outcome: '+last.outcome+' · round loss: '+fixed(last.roundLoss) : 'No outcomes revealed yet.';
 $('log-count').textContent=n+' round'+(n===1?'':'s');
 $('log-body').innerHTML=n?state.history.map(r=>'<tr><td>'+r.t+'</td><td>'+r.predictions.join(' / ')+'</td><td>'+r.outcome+'</td><td>'+fixed(r.q,3)+'</td><td>'+fixed(r.roundLoss,3)+'</td><td>'+fixed(r.algorithm,3)+'</td><td>'+r.best+'</td><td>'+fixed(r.regret,3)+'</td></tr>').join(''):'<tr><td colspan="8">Reveal a round to begin.</td></tr>';
 $('measurement-note').textContent=c.mode==='hedge' ? 'Hedge displays the weighted average of the experts’ 0–1 losses, equal to randomized prediction’s conditional expected loss. No random expert is sampled.' : 'Deterministic Weighted Majority predicts the weighted vote, breaking ties toward 1. Its displayed guarantee bounds mistakes, not additive sublinear regret. The adversarial preset chooses the opposite weighted vote.';
 plot(c);
}
function download() {
 const c=config();
 const columns=['mode','scenario','eta','horizon','round','prediction_A','prediction_B','prediction_C','prediction_D','weight_A','weight_B','weight_C','weight_D','outcome','probability_1','deterministic_vote','round_loss','learner_total','best_expert_total','uniform_total','regret','bound'];
 const rows=state.history.map(r=>[c.mode,c.scenario,c.eta,c.horizon,r.t,...r.predictions,...r.weights,r.outcome,r.q,r.prediction,r.roundLoss,r.algorithm,r.best,r.uniform,r.regret,r.bound].join(','));
 const blob=new Blob([columns.join(',')+'\n'+rows.join('\n')+'\n'],{type:'text/csv;charset=utf-8;'});
 const url=URL.createObjectURL(blob), a=document.createElement('a');
 a.href=url;a.download='expert-advice-'+c.mode+'-'+c.scenario+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('step').addEventListener('click',step);
$('play').addEventListener('click',toggleRun);
$('reset').addEventListener('click',reset);
$('export').addEventListener('click',download);
for(const id of ['mode','scenario','eta','horizon']) $(id).addEventListener(id==='eta'||id==='horizon'?'input':'change',reset);
$('tune').textContent='Use approximately tuned η';
$('tune').addEventListener('click',()=>{$('eta').value=(Math.round(Math.sqrt(8*Math.log(N)/config().horizon)/.05)*.05).toFixed(2);reset();});
$('experts').addEventListener('click',e=>{
 const b=e.target.closest('[data-expert]');
 if(!b||b.disabled)return;
 const i=Number(b.dataset.expert);manual[i]=1-manual[i];render();
 const replacement=$('experts').querySelector('[data-expert="'+i+'"]');replacement?.focus();
});
document.querySelectorAll('[data-outcome]').forEach(b=>b.addEventListener('click',()=>{outcome=Number(b.dataset.outcome);render();}));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&timer!==null){stop();render();}});
render();

