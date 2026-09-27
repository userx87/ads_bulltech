(function(){
  const GTM_ID='GTM-MX6XC96N';
  const WHATSAPP_URL='';
  const consentKey='bulltech_ads_consent_v1';
  const attributionKey='bulltech_ads_attribution_v1';
  const params=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid'];

  function readAttribution(){
    const q=new URLSearchParams(location.search), existing=JSON.parse(sessionStorage.getItem(attributionKey)||'{}');
    const data={...existing};
    params.forEach(k=>{if(q.get(k)) data[k]=q.get(k)});
    if(!data.landing_url) data.landing_url=location.href;
    data.current_url=location.href;
    sessionStorage.setItem(attributionKey,JSON.stringify(data));
    window.bulltechAdsAttribution=data;
  }
  function loadGTM(){
    if(document.getElementById('gtm-loader')) return;
    const s=document.createElement('script'); s.id='gtm-loader'; s.async=true;
    s.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(GTM_ID);
    document.head.appendChild(s);
  }
  function setConsent(value){
    localStorage.setItem(consentKey,value);
    if(value==='granted'){
      gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});
      loadGTM();
    } else {
      gtag('consent','update',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    }
    document.getElementById('cookie-banner').hidden=true;
  }
  function initConsent(){
    const saved=localStorage.getItem(consentKey), banner=document.getElementById('cookie-banner');
    if(saved==='granted'){setConsent('granted')} else if(saved==='denied'){setConsent('denied')} else {banner.hidden=false}
    document.getElementById('cookie-accept').addEventListener('click',()=>setConsent('granted'));
    document.getElementById('cookie-reject').addEventListener('click',()=>setConsent('denied'));
    document.getElementById('cookie-settings').addEventListener('click',()=>{banner.hidden=false});
  }
  function pushEvent(name,extra){
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push({event:name,...(window.bulltechAdsAttribution||{}),...(extra||{})});
  }
  function initTracking(){
    document.querySelectorAll('.track-phone').forEach(el=>el.addEventListener('click',()=>pushEvent('phone_click',{phone:'+390395787212'})));
    document.querySelectorAll('.track-cta').forEach(el=>el.addEventListener('click',()=>pushEvent('cta_click',{cta:el.textContent.trim()})));
  }
  function initWhatsApp(){
    if(!WHATSAPP_URL) return;
    ['whatsapp-top','whatsapp-bottom'].forEach(id=>{
      const el=document.getElementById(id); if(!el) return;
      el.href=WHATSAPP_URL; el.classList.remove('disabled'); el.removeAttribute('aria-disabled'); el.removeAttribute('tabindex');
      el.innerHTML='WhatsApp'; el.addEventListener('click',()=>pushEvent('whatsapp_click'));
    });
  }
  readAttribution(); initConsent(); initTracking(); initWhatsApp();
})();