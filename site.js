(function(){
  'use strict';
  const menu=document.querySelector('.menu-button');const nav=document.querySelector('.site-nav');
  if(menu&&nav)menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
  document.querySelectorAll('.site-nav a').forEach(a=>a.addEventListener('click',()=>{nav&&nav.classList.remove('open');menu&&menu.setAttribute('aria-expanded','false');}));
  const qs=new URLSearchParams(location.search);['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(k=>{if(qs.get(k))sessionStorage.setItem('forma_'+k,qs.get(k));});
  const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.08}):null;
  document.querySelectorAll('.reveal').forEach(el=>observer?observer.observe(el):el.classList.add('is-visible'));
})();
