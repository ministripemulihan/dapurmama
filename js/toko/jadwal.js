/* js/toko/jadwal.js */
const tutupAktif=()=>{const t=S.tutup;return !!(t&&t.on&&(!t.sampai||tglWIB()<=t.sampai))};
const tutupPesan=()=>(S.tutup&&S.tutup.pesan)||'Toko sedang tutup. Anda bisa melihat produk, tetapi belum bisa memesan.';
const bukaLagi=t=>{if(!t||!t.sampai)return'';const d=new Date(t.sampai+'T00:00:00');d.setDate(d.getDate()+1);return d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})};
/* ===== v24: jam batas pesan, lacak resi, alamat tersimpan ===== */
/* --- 1. Jam batas pesan (makanan atau semua pesanan), hari libur mingguan --- */
const HARI=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const JAM0={on:0,cakup:'makanan',mulai:'08:00',batas:'15:00',libur:[],pesan:''};
const jamCfg=()=>{const j={...JAM0,...(S.jam||{})};j.libur=Array.isArray(j.libur)?[...new Set(j.libur.map(Number).filter(d=>d>=0&&d<=6))]:[];return j};
const hmMin=s=>{const m=/^(\d{2}):(\d{2})$/.exec(s||'');return m?(+m[1])*60+(+m[2]):0};
const jamFmt=s=>String(s||'').replace(':','.');
const jamLines=L=>(L&&L.length&&L.every(l=>l.po))?{ok:true,j:jamCfg()}:jamStatus((L||[]).some(l=>l.p&&l.p.t!='fashion'));
/* ===== v25: pre-order (pesan di luar jam / saat habis, dikirim hari buka berikutnya) + reset porsi harian ===== */
/* Kuota "porsi per hari" per menu disimpan di server (Script Properties kunci PO), dibaca publik lewat doGet (S.po). */
const PO0={on:0,reset:0,kuota:{},pakai:{},last:''};
const poCfg=()=>{const c={...PO0,...(S.po||{})};if(!c.kuota||typeof c.kuota!='object')c.kuota={};if(!c.pakai||typeof c.pakai!='object')c.pakai={};return c};
const poKuota=p=>Math.max(0,Math.floor(+poCfg().kuota[p.id]||0));
const POV=['verifikasi','dibayar','dikemas','dikirim','selesai'];
const poPakai=(d,pid)=>Math.max(+((poCfg().pakai[d]||{})[pid])||0,poPakaiLokal(d,pid));
const poSisa=(p,d)=>Math.max(0,poKuota(p)-poPakai(d,p.id));
const poTag=o=>o&&o.po?`<div class="ok" style="margin:6px 0"><b>📅 PRE-ORDER</b> · kirim ${esc(poFmt(o.po))}</div>`:'';
function tutupBanner(){return tutupBanner0()+jamBanner()}
function tutupBanner0(){if(!tutupAktif())return'';const t=S.tutup;return`<div class="box" style="border-color:var(--bad)"><b>🔴 Toko sedang tutup</b><p>${esc(tutupPesan())}</p>${t.sampai?`<p class="mut">Buka kembali: <b>${esc(bukaLagi(t))}</b></p>`:''}<button class="btn o s" onclick="wa()">Tanya lewat WhatsApp</button></div>`}
function tutupAdminBar(){if(!tutupAktif())return'';const t=S.tutup;return`<div class="box" style="border-color:var(--bad)"><div class="row"><b>🔴 Toko sedang TUTUP${t.sampai?' · buka kembali '+esc(bukaLagi(t)):''}</b><button class="btn g s" onclick="tutupToggle()">Buka toko</button></div><div class="mut">Pembeli bisa melihat produk tetapi tidak bisa memesan. Kasir dan pesanan offline tetap bisa dipakai.</div></div>`}
async function tutupSimpan(t,msg){S.tutup=t;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}draw();
 if(!(S.api||API_URL)||!gk())return toast(msg+' (hanya di perangkat ini, belum tersambung ke Google Sheet)');
 try{const r=await post({act:'tutup',t:{on:t.on?1:0,pesan:t.pesan||'',sampai:t.sampai||''}});
  if(r.ok){S.tutup=r.tutup;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}draw();toast(msg)}
  else toast('Gagal menyimpan ke server: '+(r.err=='Tidak diizinkan untuk peran ini'||r.err=='Kunci salah'?'tempel Code.gs v23, lalu Deploy > New version.':(r.err||'')))}
 catch(e){toast('Tidak bisa menghubungi Google Sheet. Perubahan belum sampai ke pembeli.')}}
function tutupUbah(k,v){const t={on:0,pesan:'',sampai:'',...(S.tutup||{})};t[k]=v;tutupSimpan(t,'Pengaturan toko tutup disimpan.')}
function tutupToggle(){const t={on:0,pesan:'',sampai:'',...(S.tutup||{})};
 if(tutupAktif()){t.on=0;t.sampai='';tutupSimpan(t,'Toko dibuka. Pembeli bisa memesan lagi.')}
 else konfirm('Tutup toko sekarang? Pembeli masih bisa melihat produk, tetapi tidak bisa memesan sampai Anda membuka toko lagi.',()=>{t.on=1;if(t.sampai&&tglWIB()>t.sampai)t.sampai='';tutupSimpan(t,'Toko ditutup. Pembeli tidak bisa memesan.')},'Ya, tutup toko')}
function tutupBox(){const t={on:0,pesan:'',sampai:'',...(S.tutup||{})},a=tutupAktif();
 return`<div class="box"${a?' style="border-color:var(--bad)"':''}><b>Toko tutup / libur</b><p class="mut">Saat toko ditutup, pembeli masih bisa melihat produk tetapi tidak bisa memasukkan ke keranjang atau memesan. Pesanan yang sudah dibuat, Kasir, dan Pesanan offline tidak terpengaruh.</p>
<label style="display:flex;gap:10px;align-items:center;color:var(--ink)"><input type="checkbox" style="width:auto;min-height:0" ${t.on?'checked':''} onchange="tutupUbah('on',this.checked?1:0)">Toko sedang tutup</label>
<label>Pesan untuk pembeli</label><input value="${esc(t.pesan||'')}" maxlength="200" placeholder="Contoh: Libur Lebaran, buka lagi tanggal 5. Terima kasih 🙏" onchange="tutupUbah('pesan',this.value.trim())">
<label>Tutup sampai tanggal (opsional). Toko buka sendiri keesokan harinya.</label><input type="date" value="${esc(t.sampai||'')}" onchange="tutupUbah('sampai',this.value)">
<p class="${a?'bad':'ok'}" style="margin-bottom:0">${a?'🔴 Sekarang: TUTUP'+(t.sampai?', buka kembali '+esc(bukaLagi(t)):''):(t.on&&t.sampai?'🟢 Sekarang: BUKA (tanggal tutup sudah lewat)':'🟢 Sekarang: BUKA')}</p>${gk()?'':'<p class="mut">Belum tersambung ke Google Sheet: pengaturan ini hanya berlaku di perangkat ini.</p>'}</div>`}
function jamStatus(food){const j=jamCfg();if(!j.on||!(j.cakup=='semua'||food))return{ok:true,j};
 const n=wibNow(),a=hmMin(j.mulai),b=hmMin(j.batas),win=jamFmt(j.mulai)+' sampai '+jamFmt(j.batas)+' WIB',lbl=j.cakup=='semua'?'Pesanan':'Pesanan makanan';
 let why='';if(j.libur.includes(n.wd))why='libur';else if(n.min<a)why='belum';else if(n.min>=b)why='lewat';
 if(!why)return{ok:true,j,win,sisa:b-n.min};
 let buka='';if(why=='belum')buka='hari ini pukul '+jamFmt(j.mulai);else{let k=1;while(k<=7&&j.libur.includes((n.wd+k)%7))k++;if(k<=7)buka=(k==1?'besok':'hari '+HARI[(n.wd+k)%7])+' pukul '+jamFmt(j.mulai)}
 const pesan=j.pesan||(lbl+' diterima pukul '+win+(why=='libur'?'. Hari '+HARI[n.wd]+' libur':'')+'.'+(buka?' Buka lagi '+buka+'.':''));
 return{ok:false,why,j,win,pesan,buka}}
function jamBanner(){const j=jamCfg();if(!j.on)return'';const r=route();if((r=='/keranjang'||r=='/checkout')&&lines().some(l=>l.po))return'';
 if((r=='/keranjang'||r=='/checkout')&&j.cakup!='semua'&&!lines().some(l=>l.p&&l.p.t!='fashion'))return'';
 const s=jamStatus(true),lb=j.cakup=='semua'?'Toko':'Pesan makanan',lib=j.libur.length?' · libur '+j.libur.map(d=>HARI[d]).join(', '):'';
 if(s.ok)return`<div class="box" style="border-color:var(--ok)"><b class="ok">🟢 ${lb} dibuka sampai ${jamFmt(j.batas)} WIB</b><div class="mut">Jam pesan: ${esc(s.win)}${esc(lib)}</div></div>`;
 return`<div class="box" style="border-color:var(--bad)"><b class="bad">🕘 ${lb} sedang di luar jam pesan</b><p>${esc(s.pesan)}</p>${poHomeInfo(s)}<div class="mut">Anda tetap bisa melihat produk${j.cakup=='semua'?'':' dan memesan barang non-makanan'}.</div></div>`}
function jamModalNote(p){const s=jamStatus(p.t!='fashion');return(s.ok||poOk(p))?'':`<p class="bad">🕘 ${esc(s.pesan)}</p>`}
function jamAdminBar(){const j=jamCfg();if(!j.on)return'';const s=jamStatus(true);return s.ok?'':`<div class="box" style="border-color:var(--bad)"><b>🕘 ${j.cakup=='semua'?'Toko':'Pesan makanan'} sedang di luar jam pesan</b><div class="mut">${esc(s.pesan)} Atur di Pengaturan > Jam batas pesan.</div></div>`}
async function jamSimpan(j,msg){S.jam=j;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}draw();
 if(!(S.api||API_URL)||!gk())return toast(msg+' (hanya di perangkat ini, belum tersambung ke Google Sheet)');
 try{const r=await post({act:'jam',j:{on:j.on?1:0,cakup:j.cakup,mulai:j.mulai,batas:j.batas,libur:j.libur,pesan:j.pesan||''}});
  if(r.ok){S.jam=r.jam;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}draw();toast(msg)}
  else toast('Gagal menyimpan ke server: '+(r.err=='Tidak diizinkan untuk peran ini'||r.err=='Kunci salah'?'tempel Code.gs v24, lalu Deploy > New version.':(r.err||'')))}
 catch(e){toast('Tidak bisa menghubungi Google Sheet. Perubahan belum sampai ke pembeli.')}}
function jamUbah(k,v){const j=jamCfg();j[k]=v;
 if((k=='mulai'||k=='batas')&&!(hmMin(j.mulai)<hmMin(j.batas))){draw();return toast('Jam mulai harus lebih awal dari jam batas (dalam satu hari yang sama).')}
 jamSimpan(j,'Jam batas pesan disimpan.')}
function jamLibur(d,on){const j=jamCfg();j.libur=on?[...new Set([...j.libur,d])]:j.libur.filter(x=>x!=d);jamSimpan(j,'Hari libur disimpan.')}
function jamBox(){const j=jamCfg(),s=jamStatus(true);
 return`<div class="box"><b>Jam batas pesan</b><p class="mut">Pembeli hanya bisa memasukkan ke keranjang dan membayar pada jam ini. Pesanan yang sudah dibuat, Kasir, dan Pesanan offline tidak terpengaruh. Dijaga juga di server (jam WIB).</p>
<label style="display:flex;gap:10px;align-items:center;color:var(--ink)"><input type="checkbox" style="width:auto;min-height:0" ${j.on?'checked':''} onchange="jamUbah('on',this.checked?1:0)">Pakai jam batas pesan</label>
<label>Berlaku untuk</label><select onchange="jamUbah('cakup',this.value)"><option value="makanan" ${j.cakup=='makanan'?'selected':''}>Makanan saja (fashion bisa dipesan kapan saja)</option><option value="semua" ${j.cakup=='semua'?'selected':''}>Semua pesanan</option></select>
<div class="row" style="gap:10px"><div style="flex:1"><label>Mulai menerima pesanan</label><input type="time" value="${esc(j.mulai)}" onchange="jamUbah('mulai',this.value)"></div><div style="flex:1"><label>Batas akhir pesanan</label><input type="time" value="${esc(j.batas)}" onchange="jamUbah('batas',this.value)"></div></div>
<label>Hari libur mingguan</label><div style="display:flex;flex-wrap:wrap;gap:8px 14px">${HARI.map((h,d)=>`<label style="display:flex;gap:6px;align-items:center;color:var(--ink);margin:0"><input type="checkbox" style="width:auto;min-height:0" ${j.libur.includes(d)?'checked':''} onchange="jamLibur(${d},this.checked)">${h}</label>`).join('')}</div>
<label>Pesan untuk pembeli di luar jam (kosongkan untuk pesan otomatis)</label><input value="${esc(j.pesan||'')}" maxlength="200" placeholder="Contoh: Pesan makanan sampai jam 3 sore. Pesan sekarang akan diproses besok." onchange="jamUbah('pesan',this.value.trim())">
<p class="${j.on?(s.ok?'ok':'bad'):'mut'}" style="margin-bottom:0">${j.on?(s.ok?'🟢 Sekarang: DIBUKA ('+esc(s.win)+')':'🔴 Sekarang: DI LUAR JAM. '+esc(s.pesan)):'Belum diaktifkan.'}</p>${gk()?'':'<p class="mut">Belum tersambung ke Google Sheet: pengaturan ini hanya berlaku di perangkat ini.</p>'}</div>`}
function poFmt(t){try{return new Date(t+'T00:00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})}catch(e){return String(t)}}
/* Tanggal pre-order = hari buka berikutnya setelah hari ini (lewati hari libur mingguan dan masa toko tutup). */
function poTgl(){const c=poCfg();if(!c.on)return'';const n=wibNow(),j=jamCfg(),tt=S.tutup,base=tglWIB();
 for(let k=1;k<=14;k++){const d=addHari(base,k),wd=(n.wd+k)%7;
  if(j.on&&j.libur.includes(wd))continue;
  if(tt&&tt.on&&tt.sampai&&d<=tt.sampai)continue;
  return d}
 return''}
function poPakaiLokal(d,pid){return S.o.reduce((a,o)=>{if(o.po!=d)return a;if(!(POV.includes(o.status)||(o.status=='menunggu'&&Date.now()<=o.exp)))return a;return a+o.items.reduce((b,i)=>b+(i.pid==pid?i.q:0),0)},0)}
/* Boleh dipesan sebagai pre-order sekarang? Makanan dengan porsi per hari, toko tidak tutup, dan (di luar jam pesan, bukan "belum buka" hari ini) atau stok hari ini habis. */
function poOk(p){if(!p||p.t!='makanan'||tutupAktif())return false;const c=poCfg();if(!c.on||!(poKuota(p)>0)||!poTgl())return false;
 const js=jamStatus(true);if(!js.ok&&js.why!='belum')return true;
 return tot(p)<=0}
function poBtnOff(p){if(tutupAktif())return true;const po=poOk(p);if(!po)return !jamStatus(p.t!='fashion').ok;return poSisa(p,poTgl())<=0}
function poModalInfo(p){if(!p||p.t!='makanan'||!poCfg().on||!poKuota(p))return'';const d=poTgl();if(!d||tutupAktif()||!poOk(p))return'';const sp=poSisa(p,d);
 return sp>0?`<div class="box" style="border-color:var(--ok)"><b class="ok">📅 Pre-order tersedia</b><div>Dikirim <b>${esc(poFmt(d))}</b>. Sisa kuota pre-order: <b>${sp} porsi</b>.</div><div class="mut">Anda membayar sekarang. Porsi hari ini tidak berkurang.</div></div>`
  :`<div class="box" style="border-color:var(--bad)"><b class="bad">Pre-order untuk ${esc(poFmt(d))} sudah penuh.</b></div>`}
function poHomeInfo(s){const c=poCfg();if(!c.on||tutupAktif()||(s&&s.why=='belum'))return'';const d=poTgl();if(!d||!S.p.some(p=>p.t=='makanan'&&poKuota(p)>0&&poSisa(p,d)>0))return'';
 return`<p class="ok"><b>📅 Pre-order dibuka:</b> pesan makanan sekarang, dikirim ${esc(poFmt(d))}.</p>`}
function poCartNote(L){if(!(L&&L.length&&L.some(l=>l.po)))return'';
 if(!poCfg().on)return'<div class="box" style="border-color:var(--bad)"><b class="bad">Pre-order sedang ditutup toko.</b><p>Kosongkan keranjang, lalu pesan lagi saat toko buka.</p></div>';
 return`<div class="box" style="border-color:var(--ok)"><b class="ok">📅 Pre-order · dikirim ${esc(poFmt(L[0].po))}</b><p>Anda membayar sekarang. Porsinya diambil dari kuota hari itu, bukan dari stok hari ini. Pesanan dikirim pada tanggal tersebut.</p></div>`}
/* Isi keranjang pre-order yang tanggalnya sudah tiba dibuang (supaya tidak jadi pesanan hari ini tanpa sengaja). */
function poBersih(){const t=tglWIB(),n=S.cart.length;S.cart=S.cart.filter(c=>!c.po||c.po>t);if(S.cart.length!=n){try{toast('Pre-order di keranjang dihapus karena tanggalnya sudah tiba. Silakan pesan lagi.')}catch(e){}return 1}return 0}
/* Penjual: rekap porsi yang harus disiapkan per tanggal */
function poRekapBox(){const t=tglWIB(),g={};
 S.o.forEach(o=>{if(!o.po||o.po<t)return;const ok=['dibayar','dikemas','dikirim','selesai'].includes(o.status);if(!ok&&o.status!='verifikasi')return;const e=g[o.po]||(g[o.po]={m:{},v:{}});o.items.forEach(i=>{const x=ok?e.m:e.v;x[i.n]=(x[i.n]||0)+i.q})});
 const ks=Object.keys(g).sort();if(!ks.length)return'';const L=m=>Object.keys(m).map(n=>esc(n)+' ×'+m[n]).join(' · ');
 return`<div class="box" style="border-color:var(--ok)"><b>📅 Rekap pre-order (siapkan porsinya)</b>${ks.map(d=>`<div style="margin-top:8px"><b>${esc(poFmt(d))}${d==t?' (hari ini)':''}</b><div>${L(g[d].m)||'<span class="mut">belum ada yang dibayar</span>'}</div>${Object.keys(g[d].v).length?`<div class="mut">Menunggu verifikasi: ${L(g[d].v)}</div>`:''}</div>`).join('')}</div>`}
/* Pengaturan admin */
async function poSimpan(c,msg){S.po=c;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}draw();
 if(!(S.api||API_URL)||!gk())return toast(msg+' (hanya di perangkat ini, belum tersambung ke Google Sheet)');
 try{const r=await post({act:'po',c:{on:c.on?1:0,reset:c.reset?1:0,kuota:c.kuota}});
  if(r.ok){S.po=r.po;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}draw();toast(msg)}
  else toast('Gagal menyimpan ke server: '+(r.err=='Tidak diizinkan untuk peran ini'||r.err=='Kunci salah'?'tempel Code.gs v25, lalu Deploy > New version.':(r.err||'')))}
 catch(e){toast('Tidak bisa menghubungi Google Sheet. Perubahan belum sampai ke pembeli.')}}
function poUbah(k,v){const c=poCfg();c[k]=v;poSimpan(c,k=='on'?(v?'Pre-order dibuka.':'Pre-order ditutup.'):(v?'Reset porsi harian dihidupkan.':'Reset porsi harian dimatikan.'));if(k=='reset'&&v)poResetLokal()}
function poKuotaSet(pid,v){const c=poCfg(),n=Math.max(0,Math.min(9999,Math.floor(+v||0)));c.kuota={...c.kuota};if(n>0)c.kuota[pid]=n;else delete c.kuota[pid];poSimpan(c,'Porsi per hari disimpan.')}
function poResetLokal(force){if(S.api||API_URL)return;const c=S.po;if(!c||!c.reset||!c.kuota||!Object.keys(c.kuota).length)return;const t=tglWIB();if(!force&&c.last==t)return;
 if(!force&&!c.last){c.last=t;save();return}
 const paid=pid=>S.o.reduce((a,o)=>a+(o.po==t&&PAID.includes(o.status)?o.items.reduce((b,i)=>b+(i.pid==pid?i.q:0),0):0),0);
 S.p.forEach(p=>{const k=+c.kuota[p.id]||0;if(p.t!='makanan'||!(k>0)||!p.v.porsi)return;p.v.porsi.s=Math.max(0,k-paid(p.id));p.v.porsi.r=0;p.habis=false});
 c.last=t;S.po=c;save();draw()}
function poResetSekarang(){const c=poCfg();if(!Object.keys(c.kuota).length)return toast('Isi dulu "Porsi per hari" untuk minimal satu menu.');
 konfirm('Atur ulang porsi makanan hari ini sekarang? Sisa porsi tiap menu yang diisi akan diganti dengan porsi per hari dikurangi pre-order yang sudah dibayar untuk hari ini, dan tanda HABIS dilepas.',async()=>{
  if(!(S.api||API_URL)||!gk()){poResetLokal(true);return toast('Porsi hari ini sudah diatur ulang (hanya di perangkat ini).')}
  try{if(sync.t){clearTimeout(sync.t);sync.t=0;await push(0)}
   const r=await post({act:'po_reset'});if(!r.ok)return toast('Gagal: '+(r.err=='Tidak diizinkan untuk peran ini'||r.err=='Kunci salah'?'tempel Code.gs v25, lalu Deploy > New version.':(r.err||'tidak diketahui')));
   S.po=r.po||S.po;await pull(1);toast('Porsi hari ini sudah diatur ulang.')}
  catch(e){toast('Tidak bisa menghubungi Google Sheet.')}},'Ya, atur ulang')}
function poBox(){const c=poCfg(),d=poTgl(),F=S.p.filter(p=>p.t=='makanan');
 return`<div class="box"><b>Pre-order &amp; reset porsi harian</b><p class="mut">Pre-order: pembeli bisa memesan makanan di luar jam pesan (atau saat habis hari ini) untuk dikirim di hari buka berikutnya. Jumlahnya dibatasi oleh <b>porsi per hari</b> tiap menu. Reset harian: tiap tengah malam (WIB) sisa porsi diisi ulang sebesar porsi per hari, dikurangi pre-order yang sudah dibayar untuk hari itu.</p>
<label style="display:flex;gap:10px;align-items:center;color:var(--ink)"><input type="checkbox" style="width:auto;min-height:0" ${c.on?'checked':''} onchange="poUbah('on',this.checked?1:0)">Izinkan pre-order makanan</label>
<label style="display:flex;gap:10px;align-items:center;color:var(--ink)"><input type="checkbox" style="width:auto;min-height:0" ${c.reset?'checked':''} onchange="poUbah('reset',this.checked?1:0)">Reset porsi otomatis tiap hari</label>
<label>Porsi per hari tiap menu (0 = tidak dipakai, menu itu tidak bisa pre-order dan tidak ikut reset)</label>
${F.map(p=>{const k=poKuota(p);return`<div class="row" style="margin:6px 0;gap:10px"><span>${p.e||''} ${esc(p.n)}${k&&d?`<br><small class="mut">Pre-order ${esc(poFmt(d))}: ${poPakai(d,p.id)} dari ${k} porsi</small>`:''}</span><input type="number" min="0" max="9999" style="width:92px" value="${k}" onchange="poKuotaSet('${p.id}',this.value)"></div>`}).join('')||'<p class="mut">Belum ada produk makanan.</p>'}
<p class="${c.on&&d?'ok':'mut'}" style="margin-bottom:6px">${c.on?(d?'🟢 Pre-order berikutnya dikirim: <b>'+esc(poFmt(d))+'</b>':'Tidak ada hari buka dalam 14 hari ke depan (cek hari libur dan toko tutup).'):'Pre-order belum dibuka.'}</p>
<p class="mut" style="margin:0 0 8px">Reset terakhir: ${c.last?esc(poFmt(c.last)):'belum pernah'}. Porsi baru yang Anda isi berlaku saat reset berikutnya (tengah malam), atau tekan tombol di bawah untuk menerapkannya sekarang.</p>
<button class="btn o s" onclick="poResetSekarang()">Terapkan porsi hari ini sekarang</button>${gk()?'':'<p class="mut">Belum tersambung ke Google Sheet: pengaturan ini hanya berlaku di perangkat ini.</p>'}</div>`}
(window.__muat=window.__muat||[]).push('js/toko/jadwal.js');
