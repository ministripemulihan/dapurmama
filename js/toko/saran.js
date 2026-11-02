/* js/toko/saran.js : v64 Saran dan masukan pembeli untuk usaha.
   Pembeli: kotak "Beri Kami Masukan" di beranda toko (tanpa login; nama dan WhatsApp boleh dikosongkan). Penjual: Admin > Saran Pembeli
   (daftar, tanda Baru/Dibaca/Selesai, catatan sendiri, balas lewat WhatsApp), jumlah saran baru tampil di menu.
   Server: Code.gs saranAdd_ (publik, dibatasi 3 per hari per perangkat), saran_list, saran_set, saran_n; tab Saran. */
const SRK=['Produk','Rasa/kualitas','Pelayanan','Pengiriman','Harga','Tampilan toko','Lainnya'];
function srDid(){try{let d=localStorage.getItem('dm_did');if(!d){d='d'+Math.random().toString(36).slice(2,12)+Date.now().toString(36);localStorage.setItem('dm_did',d)}return d}catch(e){return'anon'}}
function srDraf(k,v){(V.srd=V.srd||{})[k]=v}
function saranBox(){const d=V.srd||{},opt=SRK.map(x=>`<option${x==(d.k||'Lainnya')?' selected':''}>${esc(x)}</option>`).join('');
 if(V.srOk)return`<div class="sec" id="saran"><span class="pill"><i></i>Saran</span><h2>Terima Kasih!</h2></div><div class="box"><p>Masukan Anda sudah kami terima dan akan dibaca langsung oleh penjual.</p><button class="btn o s" onclick="V.srOk=0;draw()">Kirim masukan lagi</button></div>`;
 return`<div class="sec" id="saran"><span class="pill"><i></i>Saran</span><h2>Beri Kami Masukan</h2></div><div class="box"><p class="mut">Ada saran untuk produk, pelayanan, atau pengiriman? Tulis di sini, langsung dibaca oleh penjual.</p>
<label>Tentang</label><select id="srK" onchange="srDraf('k',this.value)">${opt}</select>
<label>Saran atau masukan Anda</label><textarea id="srT" rows="4" maxlength="600" placeholder="mis. Rasanya enak, tapi kemasan kurang rapat" oninput="srDraf('t',this.value)">${esc(d.t||'')}</textarea>
<label>Nama (boleh dikosongkan)</label><input id="srN" maxlength="40" value="${esc(d.n||'')}" oninput="srDraf('n',this.value)">
<label>WhatsApp (boleh dikosongkan, bila ingin dibalas)</label><input id="srW" inputmode="tel" maxlength="20" value="${esc(d.w||'')}" oninput="srDraf('w',this.value)">
<input id="srWeb" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
<button class="btn" style="margin-top:10px;width:100%" onclick="saranKirim()" ${V.srb?'disabled':''}>Kirim masukan</button></div>`}
async function saranKirim(){if(V.srb)return;const t=($('#srT').value||'').trim();if(t.length<5)return toast('Tulis saran atau masukan Anda dulu.');
 if(!(S.api||API_URL))return toast('Toko belum tersambung ke Google Sheet.');
 const b={act:'saran_add',tok:(typeof tk=='function'?tk():''),did:srDid(),kat:($('#srK')||{}).value||(V.srd||{}).k||'Lainnya',t,nama:($('#srN')||{}).value||'',wa:($('#srW')||{}).value||'',web:($('#srWeb')||{}).value||''};   // dibaca SEBELUM layar digambar ulang
 V.srb=1;draw();
 try{const r=await pubPost(b);if(r&&r.ok){V.srd={};V.srOk=1}else toast((r&&r.err)||'Gagal mengirim. Coba lagi.')}catch(e){toast('Tidak bisa menghubungi Google Sheet. Coba lagi.')}
 V.srb=0;draw()}
/* ----- sisi penjual ----- */
function saranMuat(force){if(V.sarq||(V.sar&&!force))return;V.sarq=1;
 post({act:'saran_list'}).then(r=>{V.sar=(r&&r.ok)?r:{err:(r&&r.err)||'Gagal memuat saran.'};if(r&&r.ok)V.sarN=r.baru}).catch(()=>{V.sar={err:'Tidak ada koneksi ke Google Sheet.'}}).then(()=>{V.sarq=0;draw()})}
function saranSet(i,st){const x=((V.sar||{}).l||[])[i];if(!x)return;
 post({act:'saran_set',row:x.row,t:x.t,st}).then(r=>{if(r&&r.ok){x.st=st;V.sar.baru=V.sar.l.filter(z=>String(z.st).toLowerCase()=='baru').length;V.sarN=V.sar.baru;draw()}else toast((r&&r.err)||'Gagal menyimpan.')}).catch(()=>toast('Tidak ada koneksi.'))}
function saranCat(i){const x=((V.sar||{}).l||[])[i];if(!x)return;const e=document.getElementById('sc'+i);if(!e)return;
 post({act:'saran_set',row:x.row,t:x.t,st:x.st,cat:e.value}).then(r=>{if(r&&r.ok){x.cat=e.value.trim();toast('Catatan disimpan.')}else toast((r&&r.err)||'Gagal menyimpan.')}).catch(()=>toast('Tidak ada koneksi.'))}
function saranWA(i){const x=((V.sar||{}).l||[])[i],n=x&&waNum(x.wa);if(!n)return toast('Pengirim tidak mengisi nomor WhatsApp.');
 window.open('https://wa.me/'+n+'?text='+encodeURIComponent('Halo'+(x.nama?' '+x.nama:'')+', terima kasih atas masukan Anda untuk '+NM()+': "'+x.s.slice(0,120)+'"'),'_blank')}
function aSaran(){
 if(!gk())return'<div class="box">Belum tersambung ke Google Sheet. Buka tab Pengaturan, tempel Kunci sinkron, lalu kembali ke sini.</div>';
 if(!V.sar&&!V.sarq)saranMuat();const d=V.sar,f=V.sarf||'baru';
 if(!d)return'<div class="box"><p class="mut">Memuat…</p></div>';
 if(d.err)return`<div class="box"><p class="bad">${esc(d.err)}</p><button class="btn o s" onclick="V.sar=null;draw()">Coba lagi</button></div>`;
 const L=d.l.map((x,i)=>({x,i})).filter(z=>f=='semua'||String(z.x.st).toLowerCase()=='baru');
 return`<div class="box"><div class="row"><b>Saran dan masukan pembeli</b><button class="btn o s" onclick="V.sar=null;V.sarq=0;draw()">Muat ulang</button></div>
<p class="mut">Pembeli mengisinya di beranda toko (tanpa login). ${d.baru} baru dari ${d.jumlah} saran.</p>
<div class="chips"><div class="chip ${f=='baru'?'on':''}" onclick="V.sarf='baru';draw()">Baru (${d.baru})</div><div class="chip ${f=='semua'?'on':''}" onclick="V.sarf='semua';draw()">Semua (${d.jumlah})</div></div></div>`+
 (L.length?L.map(({x,i})=>`<div class="box"><div class="row"><span><b>${esc(x.nama||'Anonim')}</b> <small class="mut">${esc(x.t)}${x.akun?' · akun '+esc(x.akun):''}</small></span><span class="st">${esc(x.st)}</span></div>
<div class="mut" style="margin:2px 0">${esc(x.kat)}</div><p style="white-space:pre-wrap;margin:6px 0">${esc(x.s)}</p>
<textarea id="sc${i}" rows="2" maxlength="300" placeholder="Catatan Anda (tidak terlihat pembeli)">${esc(x.cat||'')}</textarea>
<div style="margin-top:6px"><button class="btn o s" onclick="saranCat(${i})">Simpan catatan</button> ${String(x.st).toLowerCase()=='baru'?`<button class="btn s" onclick="saranSet(${i},'Dibaca')">Tandai dibaca</button> `:''}${x.st!='Selesai'?`<button class="btn g s" onclick="saranSet(${i},'Selesai')">Selesai</button> `:`<button class="btn o s" onclick="saranSet(${i},'Dibaca')">Buka lagi</button> `}${waNum(x.wa)?`<button class="btn o s" onclick="saranWA(${i})">Balas WhatsApp</button>`:''}</div></div>`).join(''):`<div class="box"><p class="mut">${f=='baru'?'Tidak ada saran baru.':'Belum ada saran dari pembeli.'}</p></div>`)}
/* jumlah saran baru di menu: dicek berkala saat penjual membuka aplikasi */
function saranCek(){try{const m=me();if(!m||['customer','staf','akuntan'].indexOf(m.r)>=0||!gk()||V.sarp||(V.sarT&&Date.now()-V.sarT<18e4))return;V.sarT=Date.now();V.sarp=1;
 post({act:'saran_n'}).then(r=>{if(r&&r.ok&&r.n!==V.sarN){V.sarN=r.n;draw()}}).catch(()=>{}).then(()=>{V.sarp=0})}catch(e){}}
(function(){const d0=draw;draw=function(){const r=d0.apply(this,arguments);saranCek();return r}})();
(window.__muat=window.__muat||[]).push('js/toko/saran.js');
