document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded',()=>{
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.primary-nav');
  if(toggle&&nav){
    const close=()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');};
    toggle.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded',String(open));
    });
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&nav.classList.contains('open')){close();toggle.focus();}
    });
    document.addEventListener('click',e=>{
      if(!nav.contains(e.target)&&!toggle.contains(e.target))close();
    });
    nav.addEventListener('click',e=>{if(e.target.closest('a'))close();});
    matchMedia('(min-width:901px)').addEventListener('change',close);
  }
  document.querySelectorAll('.smart-form').forEach(form=>{
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const data=new FormData(form);
      const lines=[];
      for(const [k,v] of data.entries())if(String(v).trim())lines.push(`${k}: ${v}`);
      const subject=form.dataset.subject||'Νέο αίτημα από Pimenidis Travel';
      const body=encodeURIComponent(lines.join('\n'));
      const url=`mailto:info@pimenidistravel.com?subject=${encodeURIComponent(subject)}&body=${body}`;
      window.location.href=url;
    });
  });
});
