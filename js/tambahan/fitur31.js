/* js/tambahan/fitur31.js
   v31: nama toko dari tab Setup (judul tab browser dan nama di layar utama iPhone). Dimuat paling akhir. */
(function(){'use strict';
window.terapkanToko=function(){try{
 var t=(typeof S=='object'&&S&&S.toko)||{},adm=typeof ADMAPP!='undefined'&&ADMAPP;
 if(!/^🔔/.test(document.title))document.title=adm?(String(t.a||NM()+' Penjual').replace(/[<>"`\\$]/g,'')):NM()+' — Toko Online';
 var m=document.querySelector('meta[name="apple-mobile-web-app-title"]');
 if(m)m.setAttribute('content',adm?String(t.ap||'Penjual').replace(/[<>"`\\$]/g,''):String(t.p||NM()).replace(/[<>"`\\$]/g,''));
}catch(e){}};
try{window.terapkanToko()}catch(e){}
(window.__muat=window.__muat||[]).push('js/tambahan/fitur31.js');
})();
