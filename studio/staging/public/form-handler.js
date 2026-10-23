(function(){
  'use strict';
  const EMAILJS_KEY='alap2C2Fda-y4hFG8';
  const SERVICE_ID='service_d8l3yh6';
  const ADMIN_TEMPLATE='template_f5ctunh';
  const CLIENT_TEMPLATE='template_ebamer7';
  const PARTNER_TEMPLATE='template_o16az14';
  const PARTNER_REPLY='template_sm2woll';
  if(window.emailjs) emailjs.init(EMAILJS_KEY);
  function values(form){const data=new FormData(form);const out={};data.forEach((value,key)=>{if(key!=='website')out[key]=value;});out.page_url=location.href;out.referrer=document.referrer||'Direct';out.utm_source=sessionStorage.getItem('forma_utm_source')||'';out.utm_campaign=sessionStorage.getItem('forma_utm_campaign')||'';return out;}
  function bind(form,adminTemplate,replyTemplate){
    if(!form)return;const started=Date.now();
    form.addEventListener('submit',async(event)=>{event.preventDefault();const button=form.querySelector('button[type=submit]');const status=form.querySelector('[role=status]');if(form.elements.website&&form.elements.website.value)return;if(Date.now()-started<2500){status.textContent='Please take a moment to review your details.';return;}button.disabled=true;button.textContent='Sending…';status.textContent='';
      try{const params=values(form);await Promise.all([emailjs.send(SERVICE_ID,adminTemplate,params),emailjs.send(SERVICE_ID,replyTemplate,params)]);button.textContent='Inquiry sent';status.textContent='Thank you. Your project details were received and the Forma team will follow up.';status.style.color='#176b35';form.reset();window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'lead_form_submit',form_id:form.id,project_type:params.project_type||'unknown'});}
      catch(error){console.error(error);button.disabled=false;button.textContent='Try again';status.textContent='We could not send the form. Please try again in a moment.';status.style.color='#a12424';}
    });
  }
  bind(document.getElementById('contact-form'),ADMIN_TEMPLATE,CLIENT_TEMPLATE);
  bind(document.getElementById('contractor-form'),PARTNER_TEMPLATE,PARTNER_REPLY);
})();
