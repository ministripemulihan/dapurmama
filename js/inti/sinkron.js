/* js/inti/sinkron.js */
const connBox=()=>`<div class="box"><b>Perangkat baru? Sambungkan ke Google Sheet</b><p class="mut">Admin kedua/ketiga dan staf: <b>jangan buat akun baru</b>. Tempel kunci dari pemilik toko (kunci ADMIN untuk admin, kunci STAF untuk staf), lalu masuk dengan nama pengguna dan password yang sama.</p>${API_URL?'':'<label>URL Web App</label><input id="cu" value="'+esc(S.api||'')+'">'}<label>Kunci sinkron</label><input id="ck" type="password"><button class="btn o" style="margin-top:10px" onclick="connect()">Sambungkan &amp; tarik data</button></div>`;
const KS='tokokey',tk=()=>localStorage.getItem('tokotok')||'',gk=()=>tk()||localStorage.getItem(KS)||'';
const post=b=>fetch(S.api||API_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({...b,key:localStorage.getItem(KS)||'',tok:tk()})}).then(r=>r.json()).then(r=>{if(r&&r.err=='Sesi habis'){localStorage.removeItem('tokotok');localStorage.removeItem('tokoses');toast('Sesi habis. Silakan masuk lagi.');draw()}if(r&&r.tok2)localStorage.setItem('tokotok',r.tok2);return r});
const pubPost=b=>fetch(S.api||API_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(b)}).then(x=>x.json());
/* ===== v21: edit pesanan terkirim, ekspor .xlsx, gabung data dua admin ===== */
const RKU={menunggu:0,tolak:1,ok:2},RKO={baru:0,dikirim:1,selesai:2,batal:3},SNAP={},SNK=['off','pel','setor','rf'];
const snapJ=x=>JSON.stringify({...x,u:0});
function sync(){if(!(S.api||API_URL)||!adm()||!gk())return;clearTimeout(sync.t);sync.t=setTimeout(()=>{sync.t=0;push(0)},900)}
async function push(t){if(!(S.api||API_URL))return toast('URL Web App belum diisi.');const m=me();if(!m)return;push.b=1;try{const r=await post(m.r=='staf'?{act:'stok',p:S.p.map(p=>({id:p.id,t:p.t,habis:p.habis,v:p.v}))}:{act:'push',state:{...S,qris:'',dl:undefined,tutup:undefined,jam:undefined,po:undefined},base:S.rev||0,dl:S.dl||[]});if(!r.ok)toast('Sync gagal: '+(r.err=='Kunci salah'?'Kunci salah atau kosong. Cek Admin > Pengaturan.':(r.err||'')));else{S.rev=r.rev||S.rev;S.dl=[];if(r.merged){mergeIn(r.merged);toast('Data dari admin lain digabung. Cek stok jika Anda baru mengubahnya.')}else{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}t&&toast('Terkirim ke Google Sheet.')}}catch(e){toast('Tidak bisa menghubungi Google Sheet.')}push.b=0}
async function pull(t){if(!(S.api||API_URL))return toast('URL Web App belum diisi.');try{const r=await post({act:'pull'});if(!r.ok)return toast('Gagal: '+(r.err||'tidak diketahui'));if(r.state){const st=r.state;if(st.lim){S.p=st.p;if(st.qrisUrl)S.qrisUrl=st.qrisUrl;if(st.wa)S.wa=st.wa;if(!(me()&&me().r=='admin')){S.users=st.users;S.o=st.o||[]}}else{const q=S.qris,a=S.api,b=S.bc,bp=S.bcp,tt=S.tutup,jj=S.jam,pp=S.po,tk0=S.toko,vc0=S.vc;S=st;S.qris=q;S.api=a;S.tutup=tt;S.jam=jj;S.po=pp;if(tk0)S.toko=tk0;S.vc=vc0;if(!S.bc&&b)S.bc=b;if(!S.bcp&&bp)S.bcp=bp}localStorage.setItem(KEY,JSON.stringify(S));try{snapAll()}catch(e){}await poll(1);t&&toast('Data ditarik dari Google Sheet.')}else t&&toast('Sheet masih kosong. Tekan Kirim ke Sheet dulu.');draw()}catch(e){toast('Tidak bisa menghubungi Google Sheet.')}}
async function connect(){const u=API_URL||($('#cu')?$('#cu').value.trim():'');if(!u)return toast('Isi URL Web App.');S.api=u;localStorage.setItem(KS,$('#ck').value.trim());await pull(1)}
function pub(){const u=S.api||API_URL;if(!u)return;fetch(u).then(r=>r.json()).then(r=>{if(!r||!r.ok)return;const a0=JSON.stringify([S.qrisUrl,S.wa,S.chat,S.testi,S.tutup,S.jam,S.po,S.toko,S.vc,adm()?0:S.p]);if(r.p&&!adm())S.p=r.p;if(r.qris)S.qrisUrl=r.qris;if(r.wa)S.wa=r.wa;if(r.chat)S.chat=r.chat;if(r.testi)S.testi=r.testi;if(r.tutup)S.tutup=r.tutup;if(r.jam)S.jam=r.jam;if(r.po)S.po=r.po;if(r.toko)S.toko=r.toko;S.vc=r.vc?1:0;localStorage.setItem(KEY,JSON.stringify(S));try{terapkanToko()}catch(e){}if(a0!=JSON.stringify([S.qrisUrl,S.wa,S.chat,S.testi,S.tutup,S.jam,S.po,S.toko,S.vc,adm()?0:S.p])&&(route()=='/'||adm()))draw()}).catch(()=>{})}
async function tes(){const el=$('#gst');const set=h=>{if(el)el.innerHTML=h};set('Menguji sambungan...');
 if(!(S.api||API_URL))return set('<span style="color:#e5484d">URL Web App belum diisi.</span>');
 if(!gk())return set('<span style="color:#e5484d">Kunci belum ditempel.</span> Tempel kunci ADMIN di kolom di atas.');
 try{const r=await post({act:'ping'});
  if(r.ok)return set('<span style="color:#2ea043">Tersambung. Peran: <b>'+esc(r.role)+'</b>.</span> Tekan Tarik untuk mengambil barang, lalu Kirim untuk menyimpan.');
  if(/Kunci salah/.test(r.err||''))return set('<span style="color:#e5484d">Kunci salah.</span> Salin ulang kunci dari menu '+esc(NM())+' &gt; Buat kunci ADMIN baru (kunci lama tidak berlaku lagi).');
  set('<span style="color:#d29922">Kunci benar, tetapi kode Apps Script belum versi terbaru.</span> Tempel Code.gs baru, lalu Deploy &gt; Manage deployments &gt; New version.')
 }catch(e){set('<span style="color:#e5484d">Tidak bisa menghubungi Web App.</span> Cek: Deploy sebagai Web App, Who has access = <b>Anyone</b>, dan URL berakhiran /exec.')}}
function gsBox(){return`<div class="box"><b>Sambungan Google Sheet</b><p class="mut">Langkah: (1) di Google Sheet pilih menu ${esc(NM())} &gt; Buat kunci ADMIN baru, (2) salin kunci, (3) tempel di kolom <b>Kunci sinkron</b> di bawah, (4) tekan <b>Tes sambungan</b>.</p><label>URL Web App</label><input value="${esc(S.api||API_URL)}" onchange="S.api=this.value.trim();save()"><label>Kunci sinkron (kunci ADMIN atau STAF)</label><input id="gkey" type="password" autocomplete="off" value="${esc(localStorage.getItem(KS)||'')}" oninput="localStorage.setItem(KS,this.value.trim())" onchange="localStorage.setItem(KS,this.value.trim());tes()"><div class="row" style="margin-top:10px"><button class="btn s" onclick="tes()">Tes sambungan</button><button class="btn o s" onclick="pull(1)">Tarik dari Sheet</button><button class="btn o s" onclick="push(1)">Kirim ke Sheet</button></div><p id="gst" class="mut" style="margin-top:10px">${gk()?'Tekan Tes sambungan untuk memeriksa.':'<span style="color:#d29922">Belum ada kunci tersimpan di perangkat ini.</span>'}</p><p class="mut"><b>Tarik</b> = ambil barang, foto, harga, stok dari tab Barang (Sheet jadi acuan). <b>Kirim</b> = simpan akun, pesanan, dan perubahan stok toko ke Sheet. Setelah mengubah tab Barang di Sheet, selalu <b>Tarik</b> dulu.</p></div>`}
async function poll(silent){const m=me();if(!m||m.r=='customer'||!gk()||!(S.api||API_URL))return 0;if(m.r!='admin')return polStaf(silent);
 try{const kn={};S.o.forEach(o=>kn[o.inv]=o.status);const r=await post({act:'masuk',known:kn});if(!r.ok)return 0;
  const before=JSON.stringify([S.p,S.o,S.users]);let n=0,ch=0,nb=0,nn=0;
  (r.add||[]).forEach(o=>{if(S.o.some(x=>x.inv==o.inv))return;o.items.forEach(i=>{const p=P(i.pid);if(p&&p.v[i.key]&&!o.po&&['menunggu','verifikasi'].includes(o.status))p.v[i.key].r+=i.q});S.o.push(o);n++;if(['menunggu','verifikasi'].includes(o.status))nn++});
  Object.keys(r.upd||{}).forEach(inv=>{const o=S.o.find(x=>x.inv==inv),u=r.upd[inv];if(!o||!((RK[u.s]||0)>(RK[o.status]||0)))return;
   const open=['menunggu','verifikasi'].includes(o.status);if(u.s=='verifikasi'&&o.status=='menunggu')nb++;
   if(open&&!['menunggu','verifikasi'].includes(u.s))rel(o);
   if(open&&PAID.includes(u.s)){o.items.forEach(i=>{const p=P(i.pid);if(p)p.sold+=i.q});o.paid=o.paid||Date.now()}
   o.status=u.s;if(u.r)o.resi=u.r;if(u.b)o.by=u.b;ch++});
  if(!sync.t&&!push.b){(r.stok||[]).forEach(x=>{const p=P(x[0]);if(p&&p.v[x[1]])p.v[x[1]].s=x[2]});if(r.users&&r.users.length&&JSON.stringify(r.users)!=JSON.stringify(S.users))S.users=r.users}
  if(JSON.stringify([S.p,S.o,S.users])==before)return 0;
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  if(!silent){ring('baru',nn);ring('bayar',nb);if(n)toast(n+' pesanan baru masuk. Cek tab Verifikasi.');else if(nb)toast(nb+' pembeli menekan "Saya sudah bayar". Cek tab Verifikasi.');else if(ch)toast('Ada pembaruan pesanan dari perangkat lain.');if(idle())draw()}
  if(n)sync();return n+ch+1}catch(e){return 0}}
async function polStaf(silent){if(sync.t||push.b)return 0;
 try{const r=await post({act:'pull'});if(!r.ok||!r.state||!r.state.lim)return 0;const st=r.state,before=JSON.stringify([S.p,S.o]);
  S.p=st.p;S.o=st.o||[];S.users=st.users;if(JSON.stringify([S.p,S.o])==before)return 0;
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}if(!silent&&idle())draw();return 1}catch(e){return 0}}
/* Pembeli: ikuti status pesanan (disetujui/dikirim) dari Sheet */
async function stat(inv){const o=S.o.find(x=>x.inv==inv),u=S.api||API_URL;if(!o||!u||adm()||['selesai','dibatalkan','kedaluwarsa'].includes(o.status))return;
 try{const r=await fetch(u,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({act:'status',inv})}).then(x=>x.json());if(r.ok&&/^\d{4}-\d{2}-\d{2}$/.test(String(r.d||''))&&r.d!=o.siap){o.siap=r.d;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}if(!r.s||r.s==o.status||r.s=='menunggu'){draw();return}}
  if(!r.ok||!r.s||r.s==o.status||r.s=='menunggu')return;
  if(['dibatalkan','kedaluwarsa'].includes(r.s)&&['menunggu','verifikasi'].includes(o.status))rel(o);
  if(r.s=='verifikasi'&&o.status!='menunggu')return;
  o.status=r.s;if(r.r)o.resi=r.r;if(PAID.includes(r.s)&&!o.paid)o.paid=Date.now();localStorage.setItem(KEY,JSON.stringify(S));draw()}catch(e){}}
function mergeU(a,b,isOrd){const m={},ord=[];(a||[]).forEach(x=>{m[x.id]=x;ord.push(x.id)});
 (b||[]).forEach(y=>{const x=m[y.id];if(!x){m[y.id]=y;ord.push(y.id);return}let w;
  if(!isOrd&&y.st!==undefined&&x.st!==undefined){const rx=RKU[x.st]||0,ry=RKU[y.st]||0;w=ry!=rx?(ry>rx?y:x):((+y.u||0)>=(+x.u||0)?y:x)}else w=(+y.u||0)>=(+x.u||0)?y:x;
  if(isOrd){const pm={};(x.pays||[]).concat(y.pays||[]).forEach(p=>{const q=pm[p.id];if(!q||(RKU[p.st]||0)>(RKU[q.st]||0))pm[p.id]=p});w=Object.assign({},w,{pays:Object.keys(pm).map(k=>pm[k]),st:(RKO[x.st]||0)>=(RKO[y.st]||0)?x.st:y.st})}
  m[y.id]=w});return ord.map(i=>m[i])}
function snapAll(){SNK.forEach(k=>(S[k]||[]).forEach(x=>{SNAP[x.id]=snapJ(x);if(!x.u)x.u=x.t||1}))}
function stampU(){SNK.forEach(k=>(S[k]||[]).forEach(x=>{const j=snapJ(x);if(SNAP[x.id]!==j){x.u=Date.now();SNAP[x.id]=j}}))}
function mergeIn(m){SNK.forEach(k=>{if(m[k])S[k]=mergeU(S[k],m[k],k=='off')});if(m.p)S.p=m.p;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}snapAll();if(!(V.od&&V.os=='baru'))draw()}
async function offPoll(){if(!adm()||!gk()||!(S.api||API_URL)||sync.t||push.b||(S.dl||[]).length||(V.od&&V.os=='baru'))return;try{const r=await post({act:'off_pull'});if(!r||!r.ok||!r.merged||r.rev==S.rev)return;S.rev=r.rev;mergeIn(r.merged)}catch(e){}}
(window.__muat=window.__muat||[]).push('js/inti/sinkron.js');
