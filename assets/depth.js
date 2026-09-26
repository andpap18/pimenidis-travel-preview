/* Independent, bounded depth layers. No scroll hijacking or hidden content. */
(()=>{'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 document.querySelectorAll('[data-depth]').forEach(stage=>{
  const cards=[...stage.querySelectorAll('[data-depth-card]')],floats=cards.map(c=>c.firstElementChild);
  const home=stage.classList.contains('home-depth'),born=performance.now();
  let active=false,frame=0,x=0,y=0,tx=0,ty=0,t=0,last=0,entrance=0,scroll=0,rect;
  let settled=reduce.matches||document.hidden,poses=[],limits,gentle=false,viewportWidth=innerWidth;
  const coefficients=[1,.55,.75,.85,.65];
  const reset=()=>{cards.forEach(c=>c.style.transform='');floats.forEach(c=>c.style.transform='');};
  const measure=()=>{
   rect=stage.getBoundingClientRect();scroll=Math.max(-1,Math.min(1,-rect.top/innerHeight));
   if(!home||settled)return;
   gentle=innerWidth<=680||!fine.matches;
   const copy=document.querySelector('.hero-copy').getBoundingClientRect(),contact=document.querySelector('.hero-card').getBoundingClientRect(),header=document.querySelector('.site-header').getBoundingClientRect();
   // Use the art's real free space, never a viewport-wide orbit. Geometry is
   // read only on initialization/resize/scroll, not inside the animation loop.
   limits={left:Math.max(6-rect.left,innerWidth>680?copy.right+12-rect.left:-10),right:Math.min(innerWidth-6-rect.left,rect.width+10),top:Math.max(header.bottom+8-rect.top,-12),bottom:Math.min(contact.top-12-rect.top,rect.height+18)};
   poses=cards.map(c=>({cx:c.offsetLeft+c.offsetWidth/2,cy:c.offsetTop+c.offsetHeight/2,w:c.offsetWidth,h:c.offsetHeight,angle:parseFloat(getComputedStyle(c).getPropertyValue('--angle'))||0}));
  };
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const draw=now=>{
   const elapsed=now-born;
   if(home&&elapsed>=2020)settled=true;
   cards.forEach((c,i)=>{
    const d=coefficients[i],e=1-Math.pow(1-Math.max(0,Math.min(1,entrance*1.25-i*.055)),3),angle=home&&poses[i]?`${poses[i].angle}deg`:getComputedStyle(c).getPropertyValue('--angle').trim()||'0deg';
    let dx=0,dy=0,z=home?12*d:e*12*d,rz=0,rx=0,ry=0,scale=1;
    if(home&&!settled&&poses[i]){
     const p=poses[i],duration=gentle?1450:1740,u=clamp((elapsed-i*55)/duration,0,1),q=Math.pow(1-u,3),progress=1-q;
     // An expanding elliptical spiral: polar angle unwinds as its radius
     // grows from the core into each photograph's approved final position.
     // The main photo is already legible while the smaller photos orbit it.
     const vx=p.cx-rect.width*.5,vy=p.cy-rect.height*.5,turn=q*(gentle?1.15:4.6),radius=1-(gentle?.38:.76)*q;
     let cx=rect.width*.5+radius*(vx*Math.cos(turn)-vy*.62*Math.sin(turn)),cy=rect.height*.5+radius*(vx/.62*Math.sin(turn)+vy*Math.cos(turn));
     scale=1-q*(i===0?(gentle?.12:.32):(gentle?.22:.62));
     if(gentle){cx=p.cx+(cx-p.cx)*.22;cy=p.cy+(cy-p.cy)*.22;}
     z=12*d-q*(gentle?65:220+28*i);rz=q*(gentle?5:22)*(i%2?-1:1);rx=q*(gentle?4:15)*Math.sin(turn+i);ry=q*(gentle?5:19)*Math.cos(turn+i);
     // Conservative projected extents include tilt, idle and pointer motion.
     // At the end these bounds have spare room, so no clamp changes the pose.
     const a=(p.angle+rz)*Math.PI/180,hx=(Math.abs(Math.cos(a))*p.w+Math.abs(Math.sin(a))*p.h)*scale*.515+10,hy=(Math.abs(Math.sin(a))*p.w+Math.abs(Math.cos(a))*p.h)*scale*.515+10;
     cx=clamp(cx,limits.left+hx,limits.right-hx);cy=clamp(cy,limits.top+hy,limits.bottom-hy);
     dx=cx-p.cx;dy=cy-p.cy;
     if(u===1){dx=dy=rz=rx=ry=0;scale=1;z=12*d;}
    }
    c.style.transform=`translate3d(${(x*8*d+dx).toFixed(3)}px,${(y*6*d+scroll*9*d+(home?dy:(1-e)*12)).toFixed(3)}px,${z.toFixed(3)}px) rotateX(${(-y*3*d+rx).toFixed(3)}deg) rotateY(${(x*4*d+ry).toFixed(3)}deg) rotate(calc(${angle} + ${rz.toFixed(3)}deg)) scale(${scale.toFixed(5)})`;
    floats[i].style.transform=`translateY(${(Math.sin(t/1800+i*1.7)*3*d).toFixed(3)}px) rotateX(${(Math.sin(t/2400+i)*.7).toFixed(3)}deg)`;
   });
  };
  const run=now=>{
   frame=0;if(!active||document.hidden||reduce.matches){last=0;if(home&&reduce.matches){settled=true;reset();}return;}
   const dt=last?Math.min(now-last,40):16;last=now;t+=dt;entrance=Math.min(1,entrance+dt/1150);
   x+=(tx-x)*.09;y+=(ty-y)*.09;draw(now);frame=requestAnimationFrame(run);
  };
  const start=()=>{if(!frame&&active&&!document.hidden&&!reduce.matches){measure();frame=requestAnimationFrame(run);}};
  stage.addEventListener('pointermove',ev=>{if(!fine.matches||reduce.matches)return;rect=stage.getBoundingClientRect();tx=Math.max(-1,Math.min(1,(ev.clientX-rect.left)/rect.width*2-1));ty=Math.max(-1,Math.min(1,(ev.clientY-rect.top)/rect.height*2-1));},{passive:true});
  stage.addEventListener('pointerleave',()=>{tx=ty=0;},{passive:true});
  let scrollFrame=0;addEventListener('scroll',()=>{if(!active||scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;measure();});},{passive:true});
  addEventListener('resize',()=>{if(home&&innerWidth!==viewportWidth){settled=true;if(reduce.matches)reset();else draw(performance.now());}viewportWidth=innerWidth;measure();},{passive:true});
  new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)start();else{cancelAnimationFrame(frame);frame=0;last=0;}},{threshold:0}).observe(stage);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;if(home){settled=true;if(!reduce.matches)draw(performance.now());}}else start();});
  reduce.addEventListener('change',()=>{if(home)settled=true;if(reduce.matches){cancelAnimationFrame(frame);frame=0;reset();}else start();});
  // Progressive enhancement: CSS/no-JS is the original static composition.
  // Prime the first pose before paint; the clock never restarts on scroll.
  if(home&&!settled){measure();draw(born);}
 });
})();
