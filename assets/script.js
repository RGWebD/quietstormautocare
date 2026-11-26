(()=>{
const d=document,root=d.documentElement;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
const $=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* live open/closed, America/New_York. Hours as Google listed them (Thanksgiving week 2026).
   Friday's regular hours were hidden behind the Black Friday override -> 'unk'. Appointment required. */
const WEEK={0:null,1:[540,1080],2:[540,1080],3:[540,1080],4:[540,1080],5:'unk',6:null};
const HOLI={'2026-11-26':{h:[540,1080],n:'Thanksgiving, hours may differ'},'2026-11-27':{h:null,n:'Black Friday'}};
function etNow(t=new Date()){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(t);const o={};p.forEach(x=>o[x.type]=x.value);
 return{day:DN.indexOf(o.weekday),min:(+o.hour%24)*60+(+o.minute),date:`${o.year}-${o.month}-${o.day}`}}
const hoursFor=n=>HOLI[n.date]?HOLI[n.date].h:WEEK[n.day];
const fmt=m=>{const h=Math.floor(m/60),mi=m%60,ap=h<12?'AM':'PM',h12=h%12||12;return h12+(mi?':'+String(mi).padStart(2,'0'):'')+' '+ap};
function status(){const n=etNow(),h=hoursFor(n);let st='closed',t;
 if(h==='unk'){st='unk';t='Call to confirm Friday hours'}
 else if(h&&n.min>=h[0]&&n.min<h[1]){st='open';t='Open now · until '+fmt(h[1])+' ET · by appt.'}
 else if(h&&n.min<h[0]){t='Closed · opens '+fmt(h[0])+' ET'}
 else{t='Closed now';for(let k=1;k<8;k++){const nx=etNow(new Date(Date.now()+k*864e5)),hx=hoursFor(nx);if(hx==='unk')continue;if(hx){t='Closed · opens '+(k===1?'tomorrow':DN[nx.day])+' '+fmt(hx[0])+' ET';break}}}
 if(HOLI[n.date])t+=' · '+HOLI[n.date].n;
 $$('[data-status]').forEach(el=>{el.classList.remove('open','closed','unk');el.classList.add(st);const s=$('span',el);if(s)s.textContent=t});
 $$('.hours tr').forEach(tr=>tr.classList.toggle('today',+tr.dataset.d===n.day))}
status();setInterval(status,30000);

/* header, charge bar, mobile bar, scroll-driven sky */
const hdr=$('.hdr'),mbar=$('.mbar');
function onScroll(){const y=scrollY,h=root.scrollHeight-innerHeight,p=h>0?Math.min(1,y/h):0;hdr&&hdr.classList.toggle('scrolled',y>30);root.style.setProperty('--p',p.toFixed(4));if(mbar)mbar.classList.toggle('show',y>300)}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* mobile nav */
const bg=$('.burger'),mn=$('.mnav');
if(bg&&mn){const set=o=>{bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Close menu':'Open menu');mn.classList.toggle('open',o);mn.setAttribute('aria-hidden',!o);mn.inert=!o;d.body.style.overflow=o?'hidden':''};
 mn.inert=true;bg.addEventListener('click',()=>set(bg.getAttribute('aria-expanded')!=='true'));
 $$('a',mn).forEach(a=>a.addEventListener('click',()=>set(false)));
 addEventListener('keydown',e=>{if(e.key==='Escape'&&mn.classList.contains('open')){set(false);bg.focus()}})}

/* split headings */
$$('.split-h').forEach(h=>{if(RM)return;const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=d.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.appendChild(d.createTextNode(w));return}const ws=d.createElement('span');ws.style.whiteSpace='nowrap';ws.style.display='inline-block';[...w].forEach(ch=>{const s=d.createElement('span');s.className='ch1';s.textContent=ch;ws.appendChild(s)});f.appendChild(ws)});c.replaceWith(f)}else if(c.nodeType===1)walk(c)})};
 h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());walk(h);$$('span,em',h).forEach(s=>s.setAttribute('aria-hidden','true'));$$('.ch1',h).forEach((c,i)=>c.style.transitionDelay=(i*16)+'ms')});

/* reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -5% 0px'});
$$('[data-r],.split-h').forEach(el=>{if(RM)el.classList.add('in');else io.observe(el)});
const ph=$('.phero');if(ph)requestAnimationFrame(()=>ph.classList.add('go'));

/* intro: bolt draws, flash, reveal (home, once per session) */
const hero=$('.hero'),intro=$('.intro');
const goHero=()=>hero&&hero.classList.add('go');
if(intro){let seen=false;try{seen=sessionStorage.getItem('qs-intro')==='1';sessionStorage.setItem('qs-intro','1')}catch(e){}
 const skip=()=>{intro.classList.add('gone');goHero()};
 if(RM||seen)skip();else{setTimeout(skip,1500);addEventListener('keydown',e=>{if(e.key==='Escape')skip()},{once:true});intro.addEventListener('click',skip)}}
else goHero();

/* rain: canvas streaks per storm section, paused off-screen */
$$('canvas.rain').forEach(cv=>{const ctx=cv.getContext('2d'),host=cv.parentElement;let W,H,drops=[],on=false,raf;
 const dpr=Math.min(2,devicePixelRatio||1);
 function size(){W=host.clientWidth;H=host.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  const n=Math.round(W*H/(RM?14000:5200));drops=Array.from({length:n},()=>mk(true))}
 function mk(init){const z=Math.random();return{x:Math.random()*(W+200)-100,y:init?Math.random()*H:-40-Math.random()*H*.3,z,l:10+z*26,v:7+z*13,a:.08+z*.32}}
 function frame(){ctx.clearRect(0,0,W,H);const slant=.18+(+getComputedStyle(root).getPropertyValue('--p')||0)*.35;ctx.lineCap='round';
  for(const p of drops){ctx.strokeStyle=`rgba(200,225,255,${p.a})`;ctx.lineWidth=.6+p.z*.9;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.l*slant,p.y+p.l);ctx.stroke();
   if(!RM){p.y+=p.v;p.x-=p.v*slant;if(p.y>H+20||p.x<-60)Object.assign(p,mk(false),{x:Math.random()*(W+200)})}}
  if(on&&!RM)raf=requestAnimationFrame(frame)}
 size();addEventListener('resize',()=>{size();if(RM)frame()});
 if(RM){frame();return}
 new IntersectionObserver(es=>{on=es[0].isIntersecting;cancelAnimationFrame(raf);if(on)raf=requestAnimationFrame(frame)}).observe(host)});

/* lightning: random strikes on visible storm sections */
if(!RM){const hosts=$$('.hero,.phero,.cta-band,.nf');const vis=new Set();
 const vo=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?vis.add(e.target):vis.delete(e.target)),{threshold:.25});hosts.forEach(h=>vo.observe(h));
 function strike(){vis.forEach(h=>{const f=$('.flash',h);if(!f)return;f.style.setProperty('--fx',(20+Math.random()*60)+'%');f.classList.remove('strike');void f.offsetWidth;f.classList.add('strike');
   h.classList.add('lit');setTimeout(()=>h.classList.remove('lit'),90);setTimeout(()=>{h.classList.add('lit');setTimeout(()=>h.classList.remove('lit'),70)},170)});
  setTimeout(strike,6500+Math.random()*7000)}
 setTimeout(strike,hero?2600:2200)}

/* counters with thunder rumble on landing */
function runCount(el){const end=+el.dataset.count,dec=+(el.dataset.dec||0),out=$('b',el)||el,card=el.closest('.stat,.score-big');
 if(RM){out.textContent=end.toFixed(dec);return}
 const t0=performance.now(),D=1600;(function f(t){const k=Math.min(1,(t-t0)/D),q=1-Math.pow(1-k,4);out.textContent=(end*q).toFixed(dec);
  if(k<1)requestAnimationFrame(f);else{out.textContent=end.toFixed(dec);if(card){card.classList.add('rumble','landed');setTimeout(()=>card.classList.remove('rumble'),600)}}})(t0)}
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){runCount(e.target);cio.unobserve(e.target)}}),{threshold:.3});
$$('[data-count]').forEach(el=>cio.observe(el));

/* histogram */
$$('[data-hist]').forEach(h=>{if(RM){h.classList.add('go');return}const o=new IntersectionObserver(es=>{if(es[0].isIntersecting){h.classList.add('go');o.disconnect()}},{threshold:.3});o.observe(h)});

/* tilt + magnetic */
if(FINE&&!RM)$$('.tcard,.tilt').forEach(c=>{c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.setProperty('--ry',(x*10).toFixed(2)+'deg');c.style.setProperty('--rx',(-y*10).toFixed(2)+'deg')});c.addEventListener('pointerleave',()=>{c.style.setProperty('--ry','0deg');c.style.setProperty('--rx','0deg')})});
if(FINE&&!RM)$$('.btn.mag').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform=`translate(${(x*.2).toFixed(1)}px,${(y*.3).toFixed(1)}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});

/* before/after sliders */
$$('.ba-stage').forEach(s=>{const r=$('.ba-range',s);const set=v=>s.style.setProperty('--x',v+'%');r.addEventListener('input',()=>set(r.value));
 if(!RM){const o=new IntersectionObserver(es=>{if(es[0].isIntersecting){o.disconnect();let t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/1800);const v=50+Math.sin(k*Math.PI*2)*28*(1-k);set(v.toFixed(1));if(k<1&&r.value=='50')requestAnimationFrame(f);else if(r.value=='50')set(50)})(t0)}},{threshold:.6});o.observe(s)}});

/* scroll-charged timeline; steps stay lit */
$$('[data-tl]').forEach(tl=>{const line=$('.tl-line',tl),steps=$$('.step',tl);
 function upd(){const r=tl.getBoundingClientRect();const k=RM?1:Math.min(1,Math.max(0,(innerHeight*.7-r.top)/(r.height*.9)));line.style.setProperty('--k',k.toFixed(3));
  steps.forEach(s=>{const sr=s.getBoundingClientRect();if(RM||sr.top<innerHeight*.75)s.classList.add('lit')})}
 addEventListener('scroll',()=>requestAnimationFrame(upd),{passive:true});addEventListener('resize',upd);upd()});

/* reviews carousel */
$$('.car').forEach(c=>{const tr=$('.car-track',c),sl=$$('.slide',c),dots=$('.dots',c);let i=0,tm;
 sl.forEach((s,k)=>{const b=d.createElement('button');b.type='button';b.setAttribute('aria-label','Show review '+(k+1));b.onclick=()=>go(k,1);dots.appendChild(b)});
 function go(k,user){i=(k+sl.length)%sl.length;tr.style.transform=`translateX(${-100*i}%)`;$$('button',dots).forEach((b,j)=>b.setAttribute('aria-current',j===i));sl.forEach((s,j)=>{s.setAttribute('aria-hidden',j!==i);s.inert=j!==i});if(user)auto()}
 function auto(){clearInterval(tm);if(!RM)tm=setInterval(()=>go(i+1),7000)}
 $('.car-p',c).onclick=()=>go(i-1,1);$('.car-n',c).onclick=()=>go(i+1,1);
 c.addEventListener('mouseenter',()=>clearInterval(tm));c.addEventListener('mouseleave',auto);c.addEventListener('focusin',()=>clearInterval(tm));c.addEventListener('focusout',auto);
 let sx=null;tr.addEventListener('pointerdown',e=>sx=e.clientX);addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>50)go(i+(dx<0?1:-1),1)});
 go(0);auto()});

/* gallery filters + lightbox */
const chipsF=$$('.chip-f');
chipsF.forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.f;chipsF.forEach(x=>x.setAttribute('aria-pressed',x===b));$$('.mason .gal-item').forEach(it=>it.classList.toggle('hide',f!=='all'&&it.dataset.cat!==f))}));
const lb=$('.lbx');
if(lb){const im=$('img',lb),cap=$('figcaption',lb),cnt=$('.lbx-c',lb),btns=$$('button',lb);let list=[],k=0,last=null;
 const vis=it=>[...it.parentElement.children].filter(i=>i.classList.contains('gal-item')&&!i.classList.contains('hide'));
 function show(n){k=(n+list.length)%list.length;const it=list[k],ti=$('img',it);im.src=it.dataset.full;im.alt=ti.alt;cap.textContent=ti.alt;cnt.textContent=(k+1)+' / '+list.length}
 $$('.gal-item').forEach(it=>it.addEventListener('click',()=>{list=vis(it);last=it;show(list.indexOf(it));lb.classList.add('open');lb.setAttribute('aria-hidden','false');d.body.style.overflow='hidden';$('.lbx-x',lb).focus()}));
 const close=()=>{lb.classList.remove('open');lb.setAttribute('aria-hidden','true');d.body.style.overflow='';last&&last.focus()};
 $('.lbx-x',lb).onclick=close;$('.lbx-p',lb).onclick=()=>show(k-1);$('.lbx-n',lb).onclick=()=>show(k+1);
 lb.addEventListener('click',e=>{if(e.target===lb)close()});
 let tx=null;lb.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});lb.addEventListener('touchend',e=>{if(tx===null)return;const dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>50)show(k+(dx<0?1:-1))});
 addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(k-1);if(e.key==='ArrowRight')show(k+1);
  if(e.key==='Tab'){const i=btns.indexOf(d.activeElement);e.preventDefault();btns[(i+(e.shiftKey?-1:1)+btns.length)%btns.length].focus()}})}

/* appointment note builder (nothing is sent from the page) */
const pf=$('.planner');
if(pf){const out=$('.out',pf),pre=$('pre',out),cp=$('.copy',pf),sms=$('.smsb',pf),mail=$('.mailb',pf);
 pf.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(pf);const L=[];
  const add=(k,l)=>{const v=(fd.get(k)||'').trim();if(v)L.push(l+': '+v)};
  add('name','Name');add('phone','Phone');add('veh','Vehicle');add('day','Best day');add('what','What it’s doing');
  if(fd.get('pickup'))L.push('I’d like pickup & delivery (within 5 miles), if available.');
  if(fd.get('disc'))L.push('I’m a teacher / military / senior. Is a discount available?');
  if(!L.length)L.push('I’d like to book an appointment.');
  const txt='Appointment request for Quiet Storm Auto Care\n'+L.join('\n');pre.textContent=txt;out.hidden=false;
  const body=encodeURIComponent(txt);const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);sms.href='sms:+17068145930'+(ios?'&':'?')+'body='+body;
  mail.href='mailto:quietstormauto@yahoo.com?subject='+encodeURIComponent('Appointment request')+'&body='+body;out.scrollIntoView({behavior:RM?'auto':'smooth',block:'nearest'})});
 cp.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.textContent);$('.lbl',cp).textContent='Copied'}catch(e){$('.lbl',cp).textContent='Select & copy'}})}

/* demo pill */
const dm=$('.demo');if(dm){try{if(sessionStorage.getItem('qs-demo')==='x')dm.remove()}catch(e){};const x=$('button',dm);x&&x.addEventListener('click',()=>{dm.remove();try{sessionStorage.setItem('qs-demo','x')}catch(e){}})}
})();
