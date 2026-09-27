(function(){
  const GTM_ID='GTM-MX6XC96N';
  const OPENAI_PIXEL_ID='81rwBC2brbap1uYMRAQYtN';
  const OPENAI_PIXEL_SRC='https://bzrcdn.openai.com/sdk/oaiq.min.js';
  const consentKey='bulltech_ads_consent_v1';
  const attributionKey='bulltech_ads_attribution_v1';
  const params=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid'];

  function readAttribution(){
    const q=new URLSearchParams(location.search);
    let existing={};
    try{existing=JSON.parse(sessionStorage.getItem(attributionKey)||'{}')}catch(e){}
    const data={...existing};
    params.forEach(k=>{if(q.get(k)) data[k]=q.get(k)});
    if(!data.landing_url) data.landing_url=location.href;
    data.current_url=location.href;
    sessionStorage.setItem(attributionKey,JSON.stringify(data));
    window.bulltechAdsAttribution=data;
  }

  function loadGTM(){
    if(!GTM_ID || document.getElementById('gtm-loader')) return;
    const s=document.createElement('script');
    s.id='gtm-loader';
    s.async=true;
    s.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(GTM_ID);
    document.head.appendChild(s);
  }

  function loadOpenAIPixel(){
    if(!OPENAI_PIXEL_ID || window.__bulltechOpenAIPixelInitialized) return;

    if(!window.oaiq){
      const q=function(){q.q.push(arguments)};
      q.q=[];
      window.oaiq=q;
    }

    if(!document.getElementById('openai-pixel-loader')){
      const j=document.createElement('script');
      j.id='openai-pixel-loader';
      j.async=true;
      j.src=OPENAI_PIXEL_SRC;
      const firstScript=document.getElementsByTagName('script')[0];
      if(firstScript?.parentNode) firstScript.parentNode.insertBefore(j,firstScript);
      else document.head.appendChild(j);
    }

    window.oaiq('init',{pixelId:OPENAI_PIXEL_ID,debug:true});
    window.__bulltechOpenAIPixelInitialized=true;
  }

  function setConsent(value){
    localStorage.setItem(consentKey,value);
    const granted=value==='granted';
    gtag('consent','update',{
      ad_storage:granted?'granted':'denied',
      analytics_storage:granted?'granted':'denied',
      ad_user_data:granted?'granted':'denied',
      ad_personalization:granted?'granted':'denied'
    });
    if(granted){
      loadGTM();
      loadOpenAIPixel();
    }
    document.getElementById('cookie-banner')?.setAttribute('hidden','');
  }

  function initConsent(){
    const banner=document.getElementById('cookie-banner');
    const saved=localStorage.getItem(consentKey);
    if(saved==='granted') setConsent('granted');
    else if(saved==='denied') setConsent('denied');
    else if(banner) banner.removeAttribute('hidden');

    document.getElementById('cookie-accept')?.addEventListener('click',()=>setConsent('granted'));
    document.getElementById('cookie-reject')?.addEventListener('click',()=>setConsent('denied'));
    document.getElementById('cookie-settings')?.addEventListener('click',()=>banner?.removeAttribute('hidden'));
  }

  function pushEvent(name,extra){
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push({
      event:name,
      ...(window.bulltechAdsAttribution||{}),
      ...(extra||{})
    });
  }

  function initTracking(){
    document.querySelectorAll('.track-phone').forEach(el=>{
      el.addEventListener('click',()=>pushEvent('phone_click',{phone:'+390395787212',placement:el.classList.contains('track-sticky')?'sticky':'page'}));
    });

    document.querySelectorAll('.track-email').forEach(el=>{
      el.addEventListener('click',()=>pushEvent('email_click',{email:'info@bulltech.it',placement:el.classList.contains('track-sticky')?'sticky':'page'}));
    });

    document.querySelectorAll('.track-cta').forEach(el=>{
      el.addEventListener('click',()=>pushEvent('cta_click',{cta:el.textContent.trim()}));
    });

    document.querySelectorAll('.faq-list details').forEach((el,index)=>{
      el.addEventListener('toggle',()=>{
        if(el.open) pushEvent('faq_open',{faq_index:index+1,question:el.querySelector('summary')?.textContent.trim()||''});
      });
    });
  }

  readAttribution();
  initConsent();
  initTracking();
})();