/* js/inti/outbox.js (v60): antrean kirim LOKAL untuk catatan utang dan biaya Staf yang dibuat saat sinyal buruk atau offline.
   Setiap catatan diberi kunci unik (cid). Bila HP tidak bisa menghubungi server, catatan disimpan di HP (localStorage dm_ob) lalu dikirim otomatis saat internet kembali; server menolak kiriman ganda dengan cid yang sama, jadi aman dikirim ulang.
   Bila server MENOLAK karena aturan (mis. bulan sudah ditutup), catatan ditandai "ditolak" dengan alasannya dan tidak dikirim ulang. Hanya untuk act: sb_add, ut_beli, ut_bayar. */
const OB_KEY='dm_ob',OB_ACT=['sb_add','ut_beli','ut_bayar'];
function obAmbil(){try{return JSON.parse(localStorage.getItem(OB_KEY)||'[]')}catch(e){return[]}}
function obTulis(L){try{localStorage.setItem(OB_KEY,JSON.stringify(L));return true}catch(e){return false}}
function obId(p){return(p||'u')+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function obKirim(b,judul){const cid=obId(b.act=='sb_add'?'q':'u');b=Object.assign({},b,{cid});
 return post(b).then(r=>{if(!r||typeof r!='object')throw 0;return r}).catch(()=>{
  const L=obAmbil();L.push({cid,b,judul:judul||b.act,t:Date.now(),st:'tunggu'});
  return obTulis(L)?{ok:1,antre:1,cid}:{ok:0,err:'Memori HP penuh, catatan belum tersimpan. Kirim dulu catatan yang menunggu, atau kecilkan/hapus foto.'}})}
let OB_RUN=0;
function obJalan(){if(OB_RUN)return Promise.resolve();const L=obAmbil().filter(x=>x.st=='tunggu');if(!L.length||!(S.api||API_URL))return Promise.resolve();OB_RUN=1;let i=0,ok=0,tolak=0;
 const lanjut=()=>{if(i>=L.length)return Promise.resolve();const x=L[i++];return post(x.b).then(r=>{
   if(!r||typeof r!='object'||r.err=='Sesi habis')throw 0;
   const A=obAmbil(),k=A.findIndex(y=>y.cid==x.cid);
   if(r.ok){if(k>=0)A.splice(k,1);ok++}else{if(k>=0){A[k].st='ditolak';A[k].err=String(r.err||'Ditolak server').slice(0,160)}tolak++}
   obTulis(A);return lanjut()})};
 return lanjut().catch(()=>0).then(()=>{OB_RUN=0;if(ok||tolak){toast((ok?ok+' catatan offline terkirim.':'')+(tolak?' '+tolak+' ditolak server, lihat alasannya.':''));V.hu=null;V.sb=null;V.ven=null;try{draw()}catch(e){}}})}
function obBuang(cid){const A=obAmbil().filter(x=>x.cid!=cid);obTulis(A);draw()}
function obBox(acts){const L=obAmbil().filter(x=>acts.indexOf(x.b.act)>=0);if(!L.length)return'';
 return`<div class="box" style="border-color:#e0a800"><b>⏳ Catatan di HP ini (${L.length})</b><p class="mut">Disimpan di HP dan dikirim otomatis saat internet kembali.</p>${L.map(x=>`<div class="row" style="padding:4px 0;border-top:1px solid #0001"><span>${esc(x.judul)}<br><small class="${x.st=='ditolak'?'bad':'mut'}">${x.st=='ditolak'?'Ditolak: '+esc(x.err||''):'menunggu dikirim'}</small></span>${x.st=='ditolak'?`<button class="btn r s" onclick="obBuang('${esc(x.cid)}')">Hapus</button>`:''}</div>`).join('')}<button class="btn o s" style="margin-top:6px" onclick="obJalan().then(()=>draw())">Kirim sekarang</button></div>`}
/* foto nota: dikecilkan di HP (sisi terpanjang 1280 px, JPEG) supaya cepat dikirim dan muat di antrean */
function fotoKecil(f){return new Promise((ok,gagal)=>{const im=new Image(),u=URL.createObjectURL(f);im.onerror=()=>{URL.revokeObjectURL(u);gagal('Berkas bukan gambar.')};
 im.onload=()=>{try{let sisi=1280,q=.72,d='';for(let n=0;n<4;n++){const k=Math.min(1,sisi/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);d=c.toDataURL('image/jpeg',q);if(d.length<420000)break;sisi=Math.round(sisi*.75);q=Math.max(.45,q-.1)}URL.revokeObjectURL(u);d.length<690000?ok(d):gagal('Foto terlalu besar.')}catch(e){gagal('Foto gagal diproses.')}};im.src=u})}
function fotoPilih(cb){const i=document.createElement('input');i.type='file';i.accept='image/*';i.setAttribute('capture','environment');i.onchange=()=>{const f=i.files[0];if(!f)return;fotoKecil(f).then(cb).catch(e=>toast(String(e)))};i.click()}
function fotoLihat(du){const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;background:#000d;z-index:99999;display:flex;align-items:center;justify-content:center;padding:12px';d.onclick=()=>d.remove();const im=new Image();im.src=du;im.style.cssText='max-width:100%;max-height:100%;border-radius:8px';d.appendChild(im);document.body.appendChild(d)}
addEventListener('online',()=>{setTimeout(()=>{obJalan();try{if(typeof adm=='function'&&adm())sync()}catch(e){}},1500)});   /* penjualan Kasir/Offline sudah disimpan di HP lebih dulu; saat internet kembali, kirim ke Sheet otomatis */
setTimeout(()=>{obJalan()},4000);setInterval(()=>{if(obAmbil().some(x=>x.st=='tunggu'))obJalan()},60000);
(window.__muat=window.__muat||[]).push('js/inti/outbox.js');
