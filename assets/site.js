const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.primary-nav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}

document.querySelectorAll('.smart-form').forEach(form=>{
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const data=new FormData(form);
    const lines=[];
    for(const [k,v] of data.entries()) if(String(v).trim()) lines.push(`${k}: ${v}`);
    const subject=form.dataset.subject||'Νέο αίτημα από Pimenidis Travel';
    const body=encodeURIComponent(lines.join('\n'));
    const url=`mailto:info@pimenidistravel.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href=url;
  });
});
