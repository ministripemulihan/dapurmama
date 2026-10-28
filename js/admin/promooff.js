/* js/admin/promooff.js : v33 kode promo untuk Kasir dan Pesanan Offline.
   Aturan kode diperiksa server (act:'voucher', sama seperti checkout). Hitungan potongan memakai vchHit (js/toko/voucher.js).
   Kasir: potongan dari harga barang. Pesanan Offline: persen/rupiah dari harga barang, gratis ongkir dari ongkos kirim. */
async function vkFetch(kode,sub,fee,wa){try{const r=await pubPost({act:'voucher',kode:kode,sub:sub,fee:fee,wa:wa||''});
 if(!r)return{err:'Tidak ada jawaban dari server.'};if(!r.ok)return{err:r.err||'Kode tidak bisa dipakai.'};
 return{kode:r.kode,jenis:r.jenis,nilai:+r.nilai||0,min:+r.min||0,maks:+r.maks||0,ket:String(r.ket||'')}}catch(e){return{err:'Tidak bisa terhubung ke server.'}}}
/* ----- Kasir ----- */
function kvPot(sub){const r=V.kv;if(!r||r.jenis=='gratis')return 0;if(r.min>0&&sub<r.min)return 0;return vchHit(r,sub,0).pot}
const kvNet=sub=>sub-kvPot(sub),kvKode=sub=>kvPot(sub)>0?V.kv.kode:'';
function kvBox(sub){const r=V.kv;
 if(r){const p=kvPot(sub);return`<div class="row" style="margin-top:6px"><span>🏷️ Promo ${esc(r.kode)}${p?'':' <span class="bad">(belum memenuhi minimal belanja '+rp(r.min)+')</span>'}</span><span>${p?'<b class="ok">−'+rp(p)+'</b> ':''}<button class="btn o s" onclick="kvLepas()">Lepas</button></span></div>`}
 return`<div class="row" style="gap:6px;margin-top:6px"><input id="kvi" placeholder="Kode promo (opsional)" autocapitalize="characters" autocomplete="off" maxlength="30" style="flex:1" onkeydown="if(event.key=='Enter'){event.preventDefault();kvPakai()}"><button class="btn o s" onclick="kvPakai()">Pakai</button></div><div id="kvm" class="mut"></div>`}
async function kvPakai(){const i=$('#kvi'),m=$('#kvm');if(!i)return;const say=(t,b)=>{if(m){m.className=b?'bad':'ok';m.textContent=t}},kode=i.value.trim().toUpperCase();
 if(!kode)return say('Ketik kode promo dulu.',1);const sub=(V.kas||[]).reduce((a,l)=>a+price(P(l.pid))*l.q,0);if(!sub)return say('Isi nota dulu, baru pakai kode.',1);
 say('Memeriksa…');const r=await vkFetch(kode,sub,0,'');if(r.err)return say(r.err,1);if(r.jenis=='gratis')return say('Kode gratis ongkir tidak berlaku di kasir.',1);V.kv=r;draw()}
function kvLepas(){V.kv=null;draw()}
/* ----- Pesanan Offline (draf V.od: vr = aturan kode, vk/pot = kode dan potongan tersimpan saat edit) ----- */
function ovSub(d){return d.items.reduce((a,i)=>a+i.hd*i.q,0)}
function ovFee(d){return d.kirim=='ambil'?0:(+d.ongkir||0)}
function ovPot(d){const r=d.vr;if(!r)return +d.pot||0;const sub=ovSub(d);if(r.min>0&&sub<r.min)return 0;const h=vchHit(r,sub,ovFee(d));return h.pot+h.ong}
const ovKode=d=>d.vr?(ovPot(d)>0?d.vr.kode:''):(d.vk||'');
const ovTotal=d=>Math.max(0,ovSub(d)+ovFee(d)-ovPot(d));
function ovBox(d){const r=d.vr;
 if(r){const p=ovPot(d);return`<div class="row" style="margin-top:8px"><span>🏷️ Promo ${esc(r.kode)}${p?'':' <span class="bad">('+(r.min>0?'belum memenuhi minimal belanja '+rp(r.min):'belum ada potongan; kode gratis ongkir butuh ongkos kirim')+')</span>'}</span><span>${p?'<b class="ok">−'+rp(p)+'</b> ':''}<button class="btn o s" onclick="ovLepas()">Lepas</button></span></div>`}
 if(d.vk)return`<div class="row" style="margin-top:8px"><span>🏷️ Promo ${esc(d.vk)} tersimpan <b class="ok">−${rp(+d.pot||0)}</b></span><button class="btn o s" onclick="ovLepas()">Lepas</button></div>`;
 return`<label>Kode promo (opsional)</label><div class="row" style="gap:6px"><input id="ovi" placeholder="Masukkan kode" autocapitalize="characters" autocomplete="off" maxlength="30" style="flex:1" onkeydown="if(event.key=='Enter'){event.preventDefault();ovPakai()}"><button class="btn o s" onclick="ovPakai()">Pakai</button></div><div id="ovm" class="mut"></div>`}
async function ovPakai(){const d=D(),i=$('#ovi'),m=$('#ovm');if(!i)return;const say=(t,b)=>{if(m){m.className=b?'bad':'ok';m.textContent=t}},kode=i.value.trim().toUpperCase();
 if(!kode)return say('Ketik kode promo dulu.',1);if(!d.items.length)return say('Tambah barang dulu, baru pakai kode.',1);
 say('Memeriksa…');const r=await vkFetch(kode,ovSub(d),ovFee(d),d.wa||'');if(r.err)return say(r.err,1);d.vr=r;d.vk='';d.pot=0;draw()}
function ovLepas(){const d=D();d.vr=null;d.vk='';d.pot=0;draw()}
(window.__muat=window.__muat||[]).push('js/admin/promooff.js');
