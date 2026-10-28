/* js/tambahan/fitur33.js : v33 Alat Toko: cek ikon aplikasi (ukuran berkas, piksel, nama di manifest) dan "Mulai dari nol di perangkat ini". Dimuat paling akhir. */
(function(){'use strict';
var IK=[['icon-192.png',192,'Ikon Android dan tab browser'],['icon-512.png',512,'Ikon besar, layar pembuka'],['icon-maskable-512.png',512,'Ikon Android bentuk bulat'],['apple-touch-icon.png',180,'Ikon iPhone/iPad']];
function kb(n){return (n/1024).toFixed(1).replace('.',',')+' KB'}
function esc2(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ukur(x){return fetch(x[0]+'?cek='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.blob()}).then(function(b){return new Promise(function(ok){var u=URL.createObjectURL(b),im=new Image();
 im.onload=function(){URL.revokeObjectURL(u);ok({n:x[0],e:x[1],f:x[2],b:b.size,w:im.naturalWidth,h:im.naturalHeight})};im.onerror=function(){ok({n:x[0],e:x[1],f:x[2],b:b.size,w:0,h:0})};im.src=u})}).catch(function(){return{n:x[0],e:x[1],f:x[2],hilang:1}})}
function manifest(f,kunci){return fetch(f+'?cek='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){return{f:f,nama:j.short_name||j.name||'',penuh:j.name||'',kunci:kunci}}).catch(function(){return{f:f,nama:'(tidak terbaca)',kunci:kunci}})}
window.ikonCek=function(){var el=document.getElementById('ikonHasil');if(!el)return;el.innerHTML='<p class="mut">Mengukur…</p>';
 Promise.all(IK.map(ukur).concat([manifest('manifest.json','p'),manifest('manifest-admin.json','ap')])).then(function(L){
  var t=(typeof S=='object'&&S&&S.toko)||{},h='<table style="width:100%;border-collapse:collapse;font-size:13px"><tr><th align="left">Berkas</th><th align="right">Ukuran</th><th align="right">Piksel</th><th></th></tr>';
  L.slice(0,4).forEach(function(x){var s,c;
   if(x.hilang){s='✖ tidak ditemukan';c='bad'}else if(!x.w){s='✖ bukan gambar';c='bad'}else if(x.w!=x.e||x.h!=x.e){s='✖ harus '+x.e+' x '+x.e;c='bad'}else if(x.b>100*1024){s='⚠ berat (>100 KB)';c='mut'}else{s='✔ sesuai';c='ok'}
   h+='<tr style="border-top:1px solid #eee"><td>'+esc2(x.n)+'<br><small class="mut">'+esc2(x.f)+'</small></td><td align="right">'+(x.hilang?'-':kb(x.b))+'</td><td align="right">'+(x.w?x.w+' x '+x.h:'-')+'</td><td class="'+c+'">'+s+'</td></tr>'});
  h+='</table><p style="margin-top:10px"><b>Nama di bawah ikon saat dipasang di HP</b></p>';
  L.slice(4).forEach(function(m){var mau=String(t[m.kunci]||'').trim(),sama=!mau||mau==m.nama;
   h+='<div class="row"><span>'+(m.kunci=='p'?'Pembeli':'Penjual')+' ('+m.f+')</span><b>'+esc2(m.nama)+'</b></div><div class="'+(sama?'ok':'bad')+'" style="margin-bottom:6px">'+(mau?(sama?'✔ sama dengan tab Setup':'✖ tab Setup tertulis "'+esc2(mau)+'". Ubah name dan short_name di '+m.f+' lalu unggah ulang.'):'Tab Setup belum diisi.')+'</div>'});
  el.innerHTML=h})};
window.resetLokal33=function(){konfirm('Hapus SEMUA data toko yang tersimpan di perangkat ini (pesanan, keranjang, sesi masuk)? Data di Google Sheet tidak ikut terhapus. Pakai setelah toko direset (TOKO BARU) atau saat perangkat ini ganti toko.',function(){
  try{var k=[];for(var i=0;i<localStorage.length;i++)k.push(localStorage.key(i));k.forEach(function(x){localStorage.removeItem(x)});sessionStorage.clear()}catch(e){}
  if(window.caches)caches.keys().then(function(L){L.forEach(function(c){caches.delete(c)})});location.hash='';setTimeout(function(){location.reload()},300)},'Ya, hapus dari awal')};
var a0=window.aAlat;
window.aAlat=function(){var h=(typeof a0=='function')?a0():'';
 return h+'<div class="box"><b>Cek ikon aplikasi</b><p class="mut">Mengukur 4 gambar ikon dan nama di bawah ikon langsung dari situs yang sedang dibuka, lalu membandingkannya dengan tab Setup.</p><button class="btn o s" onclick="ikonCek()">Ukur sekarang</button><div id="ikonHasil" style="margin-top:8px"></div></div>'
  +'<div class="box"><b>Mulai dari nol di perangkat ini</b><p class="mut">Setelah menjalankan TOKO BARU di Google Sheet, jalankan ini di setiap HP/komputer admin lama agar data lama tidak terkirim lagi ke Sheet.</p><button class="btn r s" onclick="resetLokal33()">Hapus data toko di perangkat ini</button></div>'};
(window.__muat=window.__muat||[]).push('js/tambahan/fitur33.js');
})();
