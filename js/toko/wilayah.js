/* js/toko/wilayah.js */
const WP={},WILC={};
const wilKosong=()=>({pid:'',rid:'',did:'',kel:'',pos:'',posOv:0,lama:'',kn:'',kecT:'',kelT:''});
const wilP=()=>window.WIL_P||[],wilR=pid=>(window.WIL_R||{})[pid]||[];
const wilKd=pid=>(window.WIL_K||{})[pid]||null;
const wilDariAdr=a=>({pid:a.pid||'',rid:a.rid||'',did:a.did||'',kel:a.kel||'',pos:a.pos||'',posOv:0,lama:a.pid?'':(a.kota||''),kn:a.kota||'',kecT:'',kelT:''});
function wilMuat(f){if(WILC[f])return WILC[f];return WILC[f]=new Promise((ok,no)=>{const e=document.createElement('script');e.src='wilayah/'+f+'?v=26';e.onload=()=>ok(1);e.onerror=()=>{delete WILC[f];e.remove();no(new Error('gagal memuat '+f))};document.head.appendChild(e)})}
function wilKec(st){const k=wilKd(st.pid);return(k&&st.rid&&k[st.rid])||[]}
function wilKelList(st){const d=wilKec(st).find(x=>x[0]==st.did);return d?d[2]:[]}
function wilPosSet(st){return[...new Set(wilKelList(st).map(x=>x[1]).filter(Boolean))]}
function wilNama(st){st=st||{};const p=wilP().find(x=>x[0]==st.pid),r=wilR(st.pid).find(x=>x[0]==st.rid),d=wilKec(st).find(x=>x[0]==st.did);
 return{prov:p?p[1]:'',kota:r?r[1]:(st.kn||''),kec:d?d[1]:(st.kecT||''),kel:st.kel||st.kelT||''}}
function wilAlamat(jalan,st){if(!st||!st.pid)return jalan;const n=wilNama(st);return[jalan,n.kel&&'Kel. '+n.kel,n.kec&&'Kec. '+n.kec,n.prov].filter(Boolean).join(', ')}
function wilDariPre(pre){V.w=wilDariAdr(pre);V.kur='';wilPrep('co');wilSinkron()}
function wilPrep(pfx,st,posId){const w=WP[pfx]||(WP[pfx]={});if(pfx=='co'){V.w=V.w||wilKosong();w.st=V.w;w.on=()=>{V.kur='';wilSinkron();kurUI()}}else w.st=st||wilKosong();w.posId=posId||(pfx=='co'?'ps':pfx+'_ps');return w}
function wilSinkron(){const st=V.w||{};let k='',z='';if(st.pid&&st.rid){k=wilNama(st).kota||st.kn||'';z=zonaWil(k,st.pid,st.rid)}else if(st.lama&&KOTA[st.lama]){k=st.lama;z=KOTA[k]}V.kota=k;V.zona=z}
function wilCariLama(nama){const P=wilP();if(!nama||!P.length)return null;const n=String(nama).toLowerCase();let kab=null;
 for(const p of P)for(const r of wilR(p[0])){const t=r[1].toLowerCase();if(t=='kota '+n)return{pid:p[0],rid:r[0],kn:r[1]};if(!kab&&t=='kabupaten '+n)kab={pid:p[0],rid:r[0],kn:r[1]}}return kab}
function wilRender(pfx){const e=document.getElementById('wil_'+pfx);if(e)e.innerHTML=wilHTML(pfx)}
function wilHTML(pfx){const w=WP[pfx];if(!w)return'';const st=w.st,pid=w.posId;
 const posIn=`<label>Kode pos</label><input id="${pid}" inputmode="numeric" maxlength="5" value="${esc(st.pos||'')}" oninput="wilPos('${pfx}',this.value)"><div id="wilh_${pfx}">${wilHint(pfx)}</div>`;
 if(w.gagal)return`<p class="mut">Daftar wilayah lengkap belum bisa dimuat (cek internet atau berkas folder wilayah). Memakai daftar kota awal.</p><label>Kota tujuan</label><select onchange="wilSet('${pfx}','lama',this.value)"><option value="">Pilih kota…</option>${Object.keys(KOTA).map(k=>`<option ${st.lama==k?'selected':''}>${esc(k)}</option>`).join('')}</select>${posIn}`;
 if(!window.WIL_P)return'<p class="mut">Memuat daftar provinsi dan kota…</p>';
 const opt=(ar,sel)=>ar.map(o=>`<option value="${esc(o[0])}" ${o[0]==sel?'selected':''}>${esc(o[1])}</option>`).join('');
 const kecs=wilKec(st),kels=wilKelList(st);let ki=kels.findIndex(x=>x[0]==st.kel&&x[1]==st.pos);if(ki<0)ki=kels.findIndex(x=>x[0]==st.kel);
 let h=`<label>Provinsi</label><select onchange="wilSet('${pfx}','p',this.value)"><option value="">Pilih provinsi…</option>${opt(wilP(),st.pid)}</select>`;
 if(st.lama&&!st.pid)h+=`<p class="mut">Alamat lama memakai kota "${esc(st.lama)}". Pilih ulang wilayahnya di bawah.</p>`;
 if(st.pid){h+=`<label>Kota / Kabupaten</label><select onchange="wilSet('${pfx}','r',this.value)"><option value="">Pilih kota/kabupaten…</option>${opt(wilR(st.pid),st.rid)}</select>`}
 if(st.pid&&st.rid){
  if(w.muat)h+='<p class="mut">Memuat data kecamatan…</p>';
  else if(w.gagalProv)h+=`<p class="mut">Data kecamatan provinsi ini belum bisa dimuat. Ketik manual.</p><label>Kecamatan</label><input value="${esc(st.kecT||'')}" maxlength="60" oninput="V_wilT('${pfx}','kecT',this.value)"><label>Kelurahan / Desa</label><input value="${esc(st.kelT||'')}" maxlength="60" oninput="V_wilT('${pfx}','kelT',this.value)">`;
  else{h+=`<label>Kecamatan</label><select onchange="wilSet('${pfx}','d',this.value)"><option value="">Pilih kecamatan…</option>${opt(kecs.map(x=>[x[0],x[1]]),st.did)}</select>`;
   if(st.did)h+=`<label>Kelurahan / Desa</label><select onchange="wilSet('${pfx}','k',this.value)"><option value="">Pilih kelurahan/desa…</option>${kels.map((x,i)=>`<option value="${i}" ${i==ki?'selected':''}>${esc(x[0])}</option>`).join('')}</select>`}}
 if(st.pid&&st.rid)h+=posIn;return h}
function V_wilT(pfx,k,v){const w=WP[pfx];if(w)w.st[k]=v.slice(0,60)}
function wilPos(pfx,v){const w=WP[pfx];if(!w)return;w.st.pos=String(v).replace(/\D/g,'').slice(0,5);const h=document.getElementById('wilh_'+pfx);if(h)h.innerHTML=wilHint(pfx)}
function wilHint(pfx){const w=WP[pfx];if(!w)return'';const st=w.st;if(w.gagal||w.gagalProv||!st.did||!/^\d{5}$/.test(st.pos||''))return'';
 const set=wilPosSet(st);if(!set.length)return'';const kec=wilNama(st).kec;
 if(set.includes(st.pos))return`<small class="ok">✓ Kode pos cocok dengan Kec. ${esc(kec)}</small>`;
 return`<small class="bad">Kode pos ${esc(st.pos)} tidak ada di daftar Kec. ${esc(kec)}. Kode pos di kecamatan ini: ${esc(set.join(', '))}.</small><label style="display:flex;gap:10px;align-items:center;color:var(--ink)"><input type="checkbox" style="width:auto;min-height:0" ${st.posOv?'checked':''} onchange="WP['${pfx}'].st.posOv=this.checked?1:0">Kode pos saya benar (data wilayah bisa terlambat)</label>`}
async function wilSet(pfx,l,v){const w=WP[pfx];if(!w)return;const st=w.st,rs={posOv:0};
 if(l=='p'){Object.assign(st,rs,{pid:v,rid:'',did:'',kel:'',pos:'',lama:'',kn:'',kecT:'',kelT:''});w.gagalProv=0}
 else if(l=='r'){const r=wilR(st.pid).find(x=>x[0]==v);Object.assign(st,rs,{rid:v,did:'',kel:'',pos:'',lama:'',kn:r?r[1]:'',kecT:'',kelT:''})}
 else if(l=='d'){Object.assign(st,rs,{did:v,kel:'',pos:''});const s=wilPosSet(st);if(s.length==1)st.pos=s[0]}
 else if(l=='k'){const x=wilKelList(st)[+v];if(x){st.kel=x[0];st.pos=x[1]||st.pos;st.posOv=0}else{st.kel='';st.pos=''}}
 else if(l=='lama'){Object.assign(st,rs,{lama:v,pid:'',rid:'',did:'',kel:'',kn:v})}
 if(l=='p'&&v&&!wilKd(v)){w.muat=1;wilRender(pfx);try{await wilMuat('p'+v+'.js')}catch(e){w.gagalProv=1}w.muat=0}
 wilRender(pfx);if(w.on)w.on()}
async function wilInit(pfx){const w=WP[pfx];if(!w)return;
 try{if(!window.WIL_P)await wilMuat('indeks.js')}catch(e){w.gagal=1;wilRender(pfx);if(w.on)w.on();return}
 const st=w.st;
 if(st.lama&&!st.pid){const h=wilCariLama(st.lama);if(h){Object.assign(st,{pid:h.pid,rid:h.rid,kn:h.kn});}}
 if(st.pid&&!wilKd(st.pid)){w.muat=1;wilRender(pfx);try{await wilMuat('p'+st.pid+'.js')}catch(e){w.gagalProv=1}w.muat=0}
 wilRender(pfx);if(w.on)w.on()}
function wilCek(pfx){const w=WP[pfx];if(!w)return'Pilih wilayah tujuan.';const st=w.st;
 if(w.gagal){if(!KOTA[st.lama])return'Pilih kota tujuan.';return/^\d{5}$/.test(st.pos||'')?'':'Kode pos harus 5 angka.'}
 if(!st.pid||!st.rid)return'Pilih provinsi dan kota/kabupaten tujuan.';
 if(w.gagalProv){if(!(st.kecT||'').trim()||!(st.kelT||'').trim())return'Isi kecamatan dan kelurahan/desa.'}
 else{if(!st.did)return'Pilih kecamatan.';if(!st.kel)return'Pilih kelurahan/desa.'}
 if(!/^\d{5}$/.test(st.pos||''))return'Kode pos harus 5 angka.';
 if(!w.gagalProv){const set=wilPosSet(st);if(set.length&&!set.includes(st.pos)&&!st.posOv)return'Kode pos '+st.pos+' tidak ada di Kec. '+wilNama(st).kec+' (kode pos yang ada: '+set.join(', ')+'). Periksa lagi, atau centang "Kode pos saya benar".'}
 return''}
(window.__muat=window.__muat||[]).push('js/toko/wilayah.js');
