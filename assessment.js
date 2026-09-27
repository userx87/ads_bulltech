(function(){
  const GTM_ID='GTM-MX6XC96N';
  const consentKey='bulltech_ads_consent_v1';
  const attributionKey='bulltech_ads_attribution_v1';
  const params=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','oppref'];
  let openaiConsentGranted=false;
  let openaiPageViewSent=false;

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

  function openaiCustom(name){
    if(!openaiConsentGranted || typeof window.oaiq!=='function') return;
    window.oaiq('measure','custom',{type:'custom'},{custom_event_name:name});
  }

  function openaiPageView(){
    if(!openaiConsentGranted || openaiPageViewSent || typeof window.oaiq!=='function') return;
    window.oaiq('measure','page_viewed',{
      type:'contents',
      contents:[{
        id:location.pathname || '/',
        name:document.title || 'BullTech landing',
        content_type:'page'
      }]
    });
    openaiPageViewSent=true;
  }

  function setConsent(value){
    localStorage.setItem(consentKey,value);
    const granted=value==='granted';
    openaiConsentGranted=granted;

    gtag('consent','update',{
      ad_storage:granted?'granted':'denied',
      analytics_storage:granted?'granted':'denied',
      ad_user_data:granted?'granted':'denied',
      ad_personalization:granted?'granted':'denied'
    });

    if(typeof window.oaiq==='function'){
      window.oaiq('consent',granted);
    }

    if(granted){
      loadGTM();
      openaiPageView();
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
      el.addEventListener('click',()=>{
        const placement=el.classList.contains('track-sticky')?'sticky':'page';
        pushEvent('phone_click',{phone:'+390395787212',placement});
        openaiCustom('phone_click_'+placement);
      });
    });

    document.querySelectorAll('.track-email').forEach(el=>{
      el.addEventListener('click',()=>{
        const placement=el.classList.contains('track-sticky')?'sticky':'page';
        pushEvent('email_click',{email:'info@bulltech.it',placement});
        openaiCustom('email_click_'+placement);
      });
    });

    document.querySelectorAll('.track-cta').forEach(el=>{
      el.addEventListener('click',()=>{
        pushEvent('cta_click',{cta:el.textContent.trim()});
        openaiCustom('cta_click');
      });
    });

    document.querySelectorAll('.faq-list details').forEach((el,index)=>{
      el.addEventListener('toggle',()=>{
        if(!el.open) return;
        pushEvent('faq_open',{faq_index:index+1,question:el.querySelector('summary')?.textContent.trim()||''});
        openaiCustom('faq_open');
      });
    });

    const thresholds=[25,50,75,90];
    const seen=new Set();
    window.addEventListener('scroll',()=>{
      const max=document.documentElement.scrollHeight-window.innerHeight;
      if(max<=0) return;
      const pct=Math.round((window.scrollY/max)*100);
      thresholds.forEach(t=>{
        if(pct>=t && !seen.has(t)){
          seen.add(t);
          pushEvent('scroll_depth',{percent:t});
          openaiCustom('scroll_'+t);
        }
      });
    },{passive:true});

    const contact=document.getElementById('contatti');
    if(contact && 'IntersectionObserver' in window){
      const io=new IntersectionObserver(entries=>{
        if(entries.some(e=>e.isIntersecting)){
          pushEvent('contact_section_view',{});
          openaiCustom('contact_section_view');
          io.disconnect();
        }
      },{threshold:.35});
      io.observe(contact);
    }
  }

  readAttribution();
  initConsent();
  initTracking();
})();