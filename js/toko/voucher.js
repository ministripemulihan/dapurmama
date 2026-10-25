/* js/toko/voucher.js
   v31: kode promo di checkout. Aturan dan harga akhir DIHITUNG ULANG di server (Code.gs, fungsi vch_ dan order_);
   hitungan di sini hanya untuk menampilkan potongan. Rumus vchHit harus sama dengan vchHitung_ di Code.gs. */
function vchHit(r,sub,fee){var pot=0,ong=0;
 if(r.jenis=='persen'){pot=Math.floor(sub*Math.min(r.nilai,100)/100);if(r.maks>0)pot=Math.min(pot,Math.round(r.maks))}
 else if(r.jenis=='rupiah')pot=Math.min(Math.round(r.nilai),sub);
 else if(r.jenis=='gratis')ong=Math.min(fee,r.nilai>0?Math.round(r.nilai):fee);
 return{pot:Math.max(0,pot),ong:Math.max(0,ong)}}
/* Baris ringkasan di checkout */
function vchSum(sub,fee){var r=V.vk;if(!r)return{pot:0,ong:0,html:''};
 if(r.min>0&&sub<r.min)return{pot:0,ong:0,html:'<div class="row bad"><span>Kode '+esc(r.kode)+'</span><b>Minimal belanja '+rp(r.min)+'</b></div>'};
 var h=vchHit(r,sub,fee),html='';
 if(h.pot)html+='<div class="row ok"><span>Promo '+esc(r.kode)+'</span><b>−'+rp(h.pot)+'</b></div>';
 if(r.jenis=='gratis')html+=h.ong?'<div class="row ok"><span>Gratis ongkir '+esc(r.kode)+'</span><b>−'+rp(h.ong)+'</b></div>':'<div class="row mut"><span>Kode '+esc(r.kode)+'</span><b>Pilih kurir dulu</b></div>';
 return{pot:h.pot,ong:h.ong,html:html}}
/* Angka yang dikirim ke server saat membuat pesanan */
function vchFinal(sub,fee){var r=V.vk;if(!r)return{pot:0,ong:0,kode:''};
 if(r.min>0&&sub<r.min)return{err:'Kode '+r.kode+' butuh minimal belanja '+rp(r.min)+'. Lepas kode atau tambah belanjaan.',pot:0,ong:0,kode:''};
 var h=vchHit(r,sub,fee);return{pot:h.pot,ong:h.ong,kode:r.kode}}
function vchInner(){var r=V.vk;
 if(r)return'<div class="row"><b>Kode promo</b><button class="btn o s" onclick="vchLepas()">Lepas</button></div><div class="ok">✓ '+esc(r.kode)+' dipakai'+(r.ket?': '+esc(r.ket):'')+'</div>';
 return'<b>Kode promo</b><div class="row" style="gap:8px;margin-top:6px"><input id="vki" placeholder="Masukkan kode" autocapitalize="characters" autocomplete="off" maxlength="30" style="flex:1" onkeydown="if(event.key==\'Enter\'){event.preventDefault();vchPakai()}"><button class="btn o s" id="vkb" onclick="vchPakai()">Pakai</button></div><div id="vkm" class="mut" style="margin-top:6px"></div>'}
/* Kotak kode promo hanya tampil bila toko punya kode aktif (S.vc dari Google Sheet) atau kode sedang dipakai */
function vchBox(){return(S.vc||V.vk)?'<div class="box" id="vcb">'+vchInner()+'</div>':''}
function vchRender(){var b=$('#vcb');if(b)b.innerHTML=vchInner()}
async function vchPakai(){var i=$('#vki'),m=$('#vkm'),b=$('#vkb');if(!i)return;var kode=i.value.trim().toUpperCase();
 var say=function(t,bad){if(m){m.className=bad?'bad':'ok';m.textContent=t}};
 if(!kode)return say('Ketik kode promo dulu.',1);
 var u=S.api||API_URL;if(!u)return say('Toko belum tersambung ke server.',1);
 var L=lines();if(!L.length)return say('Keranjang kosong.',1);
 var sub=L.reduce(function(a,l){return a+price(l.p)*l.q},0),k=V.kota?kur(V.kota,L).find(function(x){return x.k==V.kur}):null,wa=($('#wa')||{}).value||'';
 if(b){b.disabled=true;b.textContent='Memeriksa…'}
 var r=null;try{r=await fetch(u,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({act:'voucher',kode:kode,sub:sub,fee:k?k.fee:0,wa:wa})}).then(function(x){return x.json()})}catch(e){}
 if(b){b.disabled=false;b.textContent='Pakai'}
 if(!r)return say('Tidak bisa terhubung ke toko. Cek internet lalu coba lagi.',1);
 if(!r.ok)return say(r.err||'Kode tidak bisa dipakai.',1);
 V.vk={kode:r.kode,jenis:r.jenis,nilai:+r.nilai||0,min:+r.min||0,maks:+r.maks||0,ket:String(r.ket||'')};
 vchRender();try{kurUI()}catch(e){}}
function vchLepas(){V.vk=null;vchRender();try{kurUI()}catch(e){}}
(window.__muat=window.__muat||[]).push('js/toko/voucher.js');
