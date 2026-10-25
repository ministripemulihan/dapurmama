/* js/toko/alamat.js */
/* --- 3. Alamat tersimpan (maks. 5). Di perangkat ini; pelanggan yang masuk juga disinkronkan ke tab Alamat di Google Sheet --- */
const ADR_MAX=5,adrUser=()=>String((me()||{}).u||'tamu').toLowerCase(),adrKey=()=>'dm_addr_'+adrUser(),adrTKey=()=>'dm_addrT_'+adrUser();
const adrT=()=>{try{return+localStorage.getItem(adrTKey())||0}catch(e){return 0}};
const adrNewId=()=>'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const adrRingkas=a=>[a.alamat,a.kel&&'Kel. '+a.kel,a.kec&&'Kec. '+a.kec,a.kota,a.prov,a.pos].filter(Boolean).join(', ');
const adrSama=(a,b)=>String(a.alamat||'').trim().toLowerCase()==String(b.alamat||'').trim().toLowerCase()&&a.kota==b.kota&&String(a.pos||'')==String(b.pos||'')&&String(a.kel||'')==String(b.kel||'');
/* --- 2. Pindahkan alamat ke HP lain (tamu tanpa akun) --- */
const adrHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)};
const ADR_F=['label','nama','wa','alamat','kota','pos','ct','kel','kec','prov','pid','rid','did'];
function adrL(){try{const a=JSON.parse(localStorage.getItem(adrKey()));return Array.isArray(a)?a.filter(x=>x&&x.id&&x.alamat).slice(0,ADR_MAX):[]}catch(e){return[]}}
function adrWrite(L,t){try{localStorage.setItem(adrKey(),JSON.stringify(L));if(t!=null)localStorage.setItem(adrTKey(),String(t))}catch(e){}}
function adrNorm(L){L=L.slice(0,ADR_MAX);if(L.length&&!L.some(x=>x.utama))L[0].utama=1;let s=0;L.forEach(x=>{if(x.utama){if(s)x.utama=0;s=1}});return L}
async function adrSync(L){const m=me();if(!m||m.r!='customer'||!tk()||!(S.api||API_URL))return;
 try{const r=await pubPost({act:'alamat_set',tok:tk(),a:L});if(r.ok&&r.t)adrWrite(adrL(),r.t)}catch(e){}}
function adrSave(L){L=adrNorm(L);adrWrite(L,Date.now());adrSync(L);return L}
async function adrLoad(){const m=me();if(!m||m.r!='customer'||!tk()||!(S.api||API_URL)||V.adrQ===adrUser())return;V.adrQ=adrUser();
 try{const r=await pubPost({act:'alamat_get',tok:tk()});if(!r.ok)return;const loc=adrL();
  if(Array.isArray(r.a)&&r.t>adrT()){adrWrite(r.a,r.t);draw()}
  else if(loc.length&&r.t<adrT())adrSync(loc)}catch(e){}}
function adrIsi(id){const a=adrL().find(x=>x.id==id);if(!a)return;const set=(i,v)=>{const e=$('#'+i);if(e)e.value=v==null?'':v};
 set('nm',a.nama);set('wa',a.wa);set('al',a.alamat);set('ct',a.ct);
 V.w=wilDariAdr(a);V.kur='';wilPrep('co');wilSinkron();wilInit('co');kurUI();
 V.adrId=id;document.querySelectorAll('.adrc').forEach(e=>e.style.borderColor=e.dataset.id==id?'var(--acc)':'var(--line)');toast('Alamat "'+(a.label||'tersimpan')+'" dipakai.')}
function adrCheckout(){adrLoad();const L=adrL();
 if(!L.length)return`<div class="box"><b>Alamat tersimpan</b><p class="mut" style="margin:4px 0 0">Belum ada. Isi alamat di bawah, lalu centang "Simpan alamat ini" supaya pesanan berikutnya tidak perlu mengetik ulang.</p><button class="btn o s" style="margin-top:8px" onclick="adrKelola()">Punya kode dari HP lain? Pulihkan alamat</button></div>`;
 return`<div class="box"><div class="row"><b>Alamat tersimpan</b><button class="btn o s" onclick="adrKelola()">Kelola</button></div>${L.map(a=>`<div class="box adrc" data-id="${esc(a.id)}" style="cursor:pointer;margin:8px 0 0;border-color:${V.adrId==a.id?'var(--acc)':'var(--line)'}" onclick="adrIsi('${esc(a.id)}')"><div class="row"><b>${esc(a.label||'Alamat')}</b>${a.utama?'<span class="st">Utama</span>':''}</div><div>${esc(a.nama||'')} · ${esc(a.wa||'')}</div><div class="mut">${esc(adrRingkas(a))}</div></div>`).join('')}</div>`}
function adrSimpanBox(){const L=adrL(),penuh=L.length>=ADR_MAX;
 return`<div class="box"><label style="display:flex;gap:10px;align-items:center;color:var(--ink);margin:0"><input id="adrOn" type="checkbox" style="width:auto;min-height:0" ${V.adrOn===0?'':'checked'} onchange="V.adrOn=this.checked?1:0">Simpan alamat ini untuk pesanan berikutnya</label><label>Nama alamat (Rumah, Kantor, Rumah Ibu, ...)</label><input id="adrLb" maxlength="30" placeholder="Rumah" value="${esc(V.adrLb||'')}" oninput="V.adrLb=this.value">${penuh?'<p class="mut" style="margin-bottom:0">Sudah ada '+ADR_MAX+' alamat. Alamat baru menggantikan yang paling lama dipakai, kecuali alamat utama.</p>':''}</div>`}
function adrPrefill(){if(V.pre&&V.pre.alamat)return;const u=adrL().find(a=>a.utama);if(u&&V.adrAuto!==adrUser()+'|'+u.id){V.adrAuto=adrUser()+'|'+u.id;V.pre={nama:u.nama,wa:u.wa,alamat:u.alamat,kota:u.kota,pos:u.pos,pid:u.pid,rid:u.rid,did:u.did,kel:u.kel};V.adrId=u.id;V.w=wilDariAdr(u);V.kur='';wilSinkron()}}
function adrSetelahOrder(o){if(V.adrOn===0)return;const L=adrL(),a={id:adrNewId(),label:(V.adrLb||'').trim().slice(0,30),nama:o.nama,wa:o.wa,alamat:o.jalan||o.alamat,kota:o.kota,pos:o.pos,kel:o.kel||'',kec:o.kec||'',prov:o.prov||'',pid:o.pid||'',rid:o.rid||'',did:o.did||'',ct:o.cat||'',utama:0,t:Date.now()};
 const i=L.findIndex(x=>adrSama(x,a));
 if(i>=0){const e=L[i];L[i]={...e,nama:a.nama,wa:a.wa,ct:a.ct,label:a.label||e.label,t:a.t}}
 else{if(!a.label)a.label=L.length?'Alamat '+(L.length+1):'Rumah';if(!L.length)a.utama=1;
  if(L.length>=ADR_MAX){const c=L.map((x,n)=>({x,n})).filter(z=>!z.x.utama).sort((p,q)=>(p.x.t||0)-(q.x.t||0))[0];if(c)L.splice(c.n,1)}
  L.push(a)}
 adrSave(L);V.adrLb='';V.adrId=null}
/* pengelola alamat (jendela) */
function adrKelola(e){const L=adrL();let f=V.adrEd;if(f){if(!f.w)f.w=wilDariAdr(f);wilPrep('ea',f.w,'ea_ps')}
 const form=f?`<div class="box"><b>${f.id?'Ubah alamat':'Tambah alamat'}</b><label>Nama alamat</label><input id="ea_lb" maxlength="30" value="${esc(f.label||'')}" placeholder="Rumah"><label>Nama penerima</label><input id="ea_nm" value="${esc(f.nama||'')}"><label>Nomor WhatsApp</label><input id="ea_wa" inputmode="tel" value="${esc(f.wa||'')}"><label>Alamat lengkap (jalan, nomor rumah, RT/RW)</label><textarea id="ea_al" rows="2" maxlength="160">${esc(f.alamat||'')}</textarea><div id="wil_ea">${wilHTML('ea')}</div><label>Catatan kurir (opsional)</label><input id="ea_ct" value="${esc(f.ct||'')}" placeholder="Pagar hitam, titip satpam"><div class="row" style="margin-top:10px"><button class="btn o" onclick="V.adrEd=null;adrKelola()">Batal</button><button class="btn" onclick="adrForm()">Simpan</button></div></div>`:'';
 let d=document.getElementById('adrM');if(!d){d=document.createElement('div');d.id='adrM';d.className='mod';d.onclick=ev=>{if(ev.target==d)adrTutup()};document.body.appendChild(d)}
 d.innerHTML=`<div style="max-height:90vh;overflow:auto"><div class="row"><b>Alamat saya</b><button class="btn o s" onclick="adrTutup()">Tutup</button></div>${L.map(a=>`<div class="box"><div class="row"><b>${esc(a.label||'Alamat')}</b>${a.utama?'<span class="st">Utama</span>':''}</div><div>${esc(a.nama||'')} · ${esc(a.wa||'')}</div><div class="mut">${esc(adrRingkas(a))}${a.ct?' · '+esc(a.ct):''}</div><div class="row" style="justify-content:flex-start;gap:8px;flex-wrap:wrap;margin-top:8px">${a.utama?'':`<button class="btn o s" onclick="adrUtama('${esc(a.id)}')">Jadikan utama</button>`}<button class="btn o s" onclick="adrEdit('${esc(a.id)}')">Ubah</button><button class="btn r s" onclick="adrHapus('${esc(a.id)}')">Hapus</button></div></div>`).join('')||'<p class="mut">Belum ada alamat tersimpan.</p>'}${form}${!f&&L.length<ADR_MAX?'<button class="btn" style="width:100%" onclick="adrEdit(\'\')">+ Tambah alamat</button>':''}${!f&&L.length>=ADR_MAX?'<p class="mut">Maksimal '+ADR_MAX+' alamat. Hapus satu untuk menambah.</p>':''}<p class="mut">Alamat tersimpan di perangkat ini${(me()||{}).r=='customer'?' dan di akun Anda (bisa dipakai di HP lain setelah masuk)':'. Masuk ke akun agar alamat ikut tersimpan di HP lain'}.</p>${f?'':adrPindahBox()}</div>`;if(f)wilInit('ea')}
function adrTutup(){const d=document.getElementById('adrM');if(d)d.remove();V.adrEd=null;draw()}
function adrEdit(id){V.adrEd=id?{...adrL().find(x=>x.id==id)}:{id:'',label:'',nama:(me()||{}).nama||'',wa:(me()||{}).wa||''};adrKelola()}
function adrForm(){const v=i=>($('#'+i).value||'').trim(),f=V.adrEd||{},st=f.w||wilKosong();const a={id:f.id||adrNewId(),label:v('ea_lb').slice(0,30),nama:v('ea_nm').slice(0,80),wa:v('ea_wa'),alamat:v('ea_al').slice(0,160),ct:v('ea_ct').slice(0,150),utama:f.utama?1:0,t:Date.now()};
 if(!a.nama||!/^[0-9+]{9,15}$/.test(a.wa.replace(/[\s-]/g,''))||a.alamat.length<10)return toast('Lengkapi nama, WhatsApp, dan alamat (min. 10 huruf).');
 {const wc=wilCek('ea');if(wc)return toast(wc)}
 const n=wilNama(st);Object.assign(a,{kota:n.kota||st.lama||'',pos:st.pos,kel:n.kel,kec:n.kec,prov:n.prov,pid:st.pid||'',rid:st.rid||'',did:st.did||''});
 if(!a.label)a.label='Alamat';let L=adrL();const i=L.findIndex(x=>x.id==a.id);if(i>=0)L[i]=a;else{if(L.length>=ADR_MAX)return toast('Maksimal '+ADR_MAX+' alamat.');L.push(a)}
 adrSave(L);V.adrEd=null;adrKelola();toast('Alamat disimpan.')}
function adrUtama(id){adrSave(adrL().map(x=>({...x,utama:x.id==id?1:0})));adrKelola()}
function adrHapus(id){konfirm('Hapus alamat ini?',()=>{adrSave(adrL().filter(x=>x.id!=id));adrKelola();if(V.adrId==id)V.adrId=null},'Ya, hapus')}
function adrAkunBox(){adrLoad();const L=adrL();return`<div class="box"><div class="row"><b>Alamat saya</b><button class="btn o s" onclick="adrKelola()">Kelola</button></div>${L.length?L.map(a=>`<div class="mut" style="margin-top:6px"><b style="color:var(--ink)">${esc(a.label||'Alamat')}</b>${a.utama?' · Utama':''}<br>${esc(adrRingkas(a))}</div>`).join(''):'<p class="mut">Belum ada alamat tersimpan. Tambahkan di sini, atau centang "Simpan alamat ini" saat checkout.</p>'}</div>`}
function adrKodeBuat(){const L=adrL().map(a=>{const o={};ADR_F.forEach(k=>{if(a[k])o[k]=a[k]});o.u=a.utama?1:0;return o});if(!L.length)return'';
 const b=btoa(unescape(encodeURIComponent(JSON.stringify({v:1,a:L})))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');return'DMADR1.'+b+'.'+adrHash(b)}
function adrKodeBaca(t){t=String(t||'').replace(/\s+/g,'');const m=t.match(/DMADR1\.([A-Za-z0-9_-]+)\.([a-z0-9]+)/);
 if(!m)return{err:'Kode tidak dikenali. Salin seluruh kode yang diawali DMADR1.'};if(adrHash(m[1])!=m[2])return{err:'Kode rusak atau terpotong. Salin ulang seluruhnya.'};
 let j;try{let b=m[1].replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';j=JSON.parse(decodeURIComponent(escape(atob(b))))}catch(e){return{err:'Isi kode tidak bisa dibaca.'}}
 if(!j||j.v!==1||!Array.isArray(j.a))return{err:'Versi kode tidak cocok.'};
 const c=(v,n)=>String(v==null?'':v).slice(0,n);
 const L=j.a.slice(0,ADR_MAX).map(x=>x&&typeof x=='object'?{id:adrNewId(),label:c(x.label,30),nama:c(x.nama,80),wa:c(x.wa,20),alamat:c(x.alamat,300),kota:c(x.kota,60),pos:c(x.pos,10),ct:c(x.ct,150),kel:c(x.kel,60),kec:c(x.kec,60),prov:c(x.prov,40),pid:c(x.pid,10),rid:c(x.rid,10),did:c(x.did,12),utama:x.u?1:0,t:Date.now()}:null).filter(a=>a&&a.alamat.trim());
 return L.length?{L}:{err:'Kode tidak berisi alamat.'}}
function adrKode(aksi){const k=adrKodeBuat();if(!k)return toast('Belum ada alamat untuk dipindahkan.');
 if(aksi=='salin')return salinTeks(k,'Kode disalin. Tempel di HP lain.');
 open('https://wa.me/?text='+encodeURIComponent('Kode alamat '+NM()+' (simpan sendiri, jangan dibagikan):\n'+k),'_blank','noopener')}
function adrImpor(){const r=adrKodeBaca(($('#adrImp')||{}).value);if(r.err)return toast(r.err);const L=adrL();let n=0,lewat=0;
 r.L.forEach(a=>{if(L.some(x=>adrSama(x,a)))return;if(L.length>=ADR_MAX){lewat++;return}a.utama=L.length?0:1;L.push(a);n++});
 adrSave(L);adrKelola();toast(n?n+' alamat dipulihkan'+(lewat?' ('+lewat+' dilewati karena penuh)':'')+'.':(lewat?'Alamat sudah penuh (maks. '+ADR_MAX+'). Hapus satu dulu.':'Semua alamat itu sudah ada di perangkat ini.'))}
function adrPindahBox(){return`<div class="box" style="margin-top:12px"><b>Pindahkan alamat ke HP lain</b><p class="mut">Alamat tamu hanya tersimpan di perangkat ini. Buat kode, kirim ke WhatsApp Anda sendiri, lalu tempel di HP lain. Kode berisi alamat dan nomor WhatsApp Anda dan <b>tidak disimpan di server</b>: kirim hanya ke diri sendiri, siapa pun yang memegang kode bisa membaca alamatnya.</p><div class="row" style="justify-content:flex-start;gap:8px;flex-wrap:wrap"><button class="btn o s" onclick="adrKode('salin')">Salin kode</button><button class="btn o s" onclick="adrKode('wa')">Kirim ke WhatsApp</button></div><label>Di HP baru: tempel kode di sini</label><textarea id="adrImp" rows="2" placeholder="DMADR1.…"></textarea><button class="btn s" style="margin-top:8px" onclick="adrImpor()">Pulihkan alamat</button>${(me()||{}).r=='customer'?'':'<p class="mut" style="margin-bottom:0">Mau otomatis ikut ke semua HP tanpa kode? <a href="#/akun" onclick="adrTutup()">Buat akun pelanggan</a>: alamat tersimpan di akun.</p>'}</div>`}
(window.__muat=window.__muat||[]).push('js/toko/alamat.js');
