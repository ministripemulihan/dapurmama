/* js/toko/ongkir.js */
const KOTA={Surabaya:'sby',Sidoarjo:'jt',Malang:'jt',Jakarta:'jw',Bandung:'jw',Semarang:'jw',Denpasar:'lj',Makassar:'lj',Medan:'lj'};
const TR={JNE:{sby:9000,jt:10000,jw:18000,lj:32000,e:'2–4 hari'},TIKI:{sby:10000,jt:11000,jw:19000,lj:34000,e:'2–5 hari'},Wahana:{sby:8000,jt:9000,jw:16000,lj:28000,e:'3–6 hari'},'J&T':{sby:9000,jt:10000,jw:18000,lj:33000,e:'2–4 hari'},'Pos Indonesia':{sby:8000,jt:9000,jw:16000,lj:28000,e:'3–6 hari'}};
/* ===== v26: wilayah lengkap + kode pos, pindah alamat tamu, lacak banyak resi, kurir J&T/Pos/Grab ===== */
const KURIR_ALL=['JNE','TIKI','Wahana','J&T','Pos Indonesia','Gojek','Grab'];
const isInstan=k=>k=='Gojek'||k=='Grab';
const trFee=(k,z)=>TR[k][z]||Math.round(TR[k].lj*1.5/1000)*1000;
/* --- 1. Wilayah: provinsi > kota/kabupaten > kecamatan > kelurahan + kode pos --- */
/* Data: folder wilayah/ (indeks.js + p<kode provinsi>.js), dimuat sesuai kebutuhan. Sumber: data wilayah terbuka (emsifa/api-wilayah-indonesia). */
const WIL_JAWA=['31','32','33','34','36'],WIL_TIMUR=['81','82','91','92','93','94','95','96'];
function kur(kota,L){const z=V.zona||KOTA[kota];if(!z)return[];const food=L[0].p.t=='makanan',luar=L.every(l=>l.p.luar),kg=Math.max(1,Math.ceil(L.reduce((a,l)=>a+l.p.g*l.q,0)/1000)),o=[];
 if(S.kurir.Gojek&&z=='sby')o.push({k:'Gojek',fee:15000,e:L[0].po?'Dikirim '+poFmt(L[0].po):'Hari ini (instan)'});
 if(S.kurir.Grab&&z=='sby')o.push({k:'Grab',fee:16000,e:L[0].po?'Dikirim '+poFmt(L[0].po):'Hari ini (instan)'});
 if(!food||luar)for(const k in TR)if(S.kurir[k])o.push({k,fee:trFee(k,z)*kg,e:TR[k].e});return o}
function kurUI(){const L=lines();if(!L.length||!$('#kur'))return;const o=V.kota?kur(V.kota,L):[];
 $('#kur').innerHTML=!V.kota?'<p class="mut">Pilih kota tujuan untuk melihat kurir.</p>':o.length?o.map(x=>`<label style="display:flex;gap:10px;align-items:center;color:var(--ink)"><input type="radio" name="kr" style="width:auto;min-height:0" ${V.kur==x.k?'checked':''} onchange="V.kur='${x.k}';kurUI()">${x.k} · ${rp(x.fee)} · ${x.e}</label>`).join('')+'<small class="mut">Tarif simulasi. Tarif asli memakai API ekspedisi.</small>':'<p class="bad">Tidak ada kurir untuk tujuan ini. Makanan non tahan lama hanya dikirim ke Surabaya via Gojek/Grab.</p>';
 const sub=L.reduce((a,l)=>a+price(l.p)*l.q,0),k=o.find(x=>x.k==V.kur),fee=k?k.fee:0,vh=vchSum(sub,fee);
 $('#sum').innerHTML=`<div class="row"><span>Subtotal</span><b>${rp(sub)}</b></div>${vh.html}<div class="row"><span>Ongkir</span><b>${k?rp(fee):'-'}</b></div><div class="row"><span>Total</span><b class="big">${rp(sub-vh.pot+fee-vh.ong)}</b></div><p class="mut">Pembayaran: QRIS BCA. Kode unik ditambahkan di langkah berikutnya.</p><button class="btn" style="width:100%" ${tutupAktif()||!jamLines(L).ok?'disabled':''} onclick="order()">Bayar Sekarang</button>`}
function zonaWil(kota,pid,rid){if(rid=='35.78')return'sby';if(pid=='35')return'jt';if(WIL_JAWA.includes(pid))return'jw';if(WIL_TIMUR.includes(pid))return'tm';if(pid)return'lj';return KOTA[kota]||''}
(window.__muat=window.__muat||[]).push('js/toko/ongkir.js');
