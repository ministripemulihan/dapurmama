/* js/toko/artikel.js (v44): Artikel. Pembeli: daftar (judul, gambar kecil, 10 kata, Baca selengkapnya) lalu halaman penuh
   (penulis, tanggal, judul, gambar besar, isi, link referensi), terbaru dulu. Admin: tab Artikel (tulis, ubah, hapus, unggah gambar).
   Data di tab Artikel Google Sheet; daftar dan isi diambil terpisah (?art=list / ?art=ID) agar halaman utama tetap ringan. */
const ART_KEY='tokoart';
const artUrl=q=>{const u=S.api||API_URL;return u?u+(u.indexOf('?')<0?'?':'&')+'art='+encodeURIComponent(q):''};
const artTgl=d=>{try{return new Date(d+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}catch(e){return d||''}};
const artImg=u=>{u=typeof drv=='function'?drv(u):u;return(/^https:\/\//.test(u||'')||/^img\/[\w.\-\/]+$/.test(u||''))?u:''};
function artLoad(){if(V.artQ||(V.artT&&Date.now()-V.artT<60000))return;V.artQ=1;V.artT=Date.now();const u=artUrl('list');if(!u){V.art=V.art||[];V.artQ=0;return}
 fetch(u).then(r=>r.json()).then(r=>{V.artQ=0;if(r&&r.ok&&Array.isArray(r.list)){V.art=r.list;try{localStorage.setItem(ART_KEY,JSON.stringify(r.list))}catch(e){}}else V.art=V.art||[];if(/^\/artikel$|^\/$/.test(route()))draw()}).catch(()=>{V.artQ=0;V.artErr=1;V.art=V.art||[];if(route()=='/artikel')draw()})}
function artCache(){if(V.art)return V.art;try{const c=JSON.parse(localStorage.getItem(ART_KEY)||'null');if(Array.isArray(c))return c}catch(e){}return null}
function artKartu(a){const g=artImg(a.g);return`<a class="box" href="#/artikel/${esc(a.id)}" style="display:flex;gap:12px;align-items:flex-start;text-decoration:none;color:inherit">${g?`<img src="${esc(g)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'" style="width:76px;height:76px;object-fit:cover;border-radius:10px;flex:none">`:'<div style="width:76px;height:76px;border-radius:10px;background:var(--line,#eee);flex:none;display:flex;align-items:center;justify-content:center;font-size:26px">📰</div>'}<div style="min-width:0"><b>${esc(a.j)}</b>${a.x?`<div class="mut" style="margin:4px 0">${esc(a.x)}</div>`:''}<span style="color:var(--o,#ff5a1f);font-weight:600">Baca selengkapnya →</span></div></a>`}
function artList(){artLoad();const L=artCache();
 return`<h2>Artikel</h2>${L==null?'<div class="box mut">Memuat artikel…</div>':L.length?L.map(artKartu).join(''):`<div class="box mut">${V.artErr?'Tidak bisa memuat artikel. Periksa koneksi internet.':'Belum ada artikel.'}</div>`}`}
function artDetail(id){id=decodeURIComponent(id||'');V.artD=V.artD||{};const a=V.artD[id];
 if(a===undefined){V.artD[id]=null;const u=artUrl(id);if(u)fetch(u).then(r=>r.json()).then(r=>{V.artD[id]=r&&r.ok?r.a:false;if(route()=='/artikel/'+encodeURIComponent(id)||route()=='/artikel/'+id)draw()}).catch(()=>{V.artD[id]=false;draw()});else V.artD[id]=false}
 const back='<p><a href="#/artikel">← Semua artikel</a></p>';
 if(a==null)return back+'<div class="box mut">Memuat artikel…</div>';if(a===false)return back+'<div class="box">Artikel tidak ditemukan atau tidak bisa dimuat.</div>';
 const g=artImg(a.g),par=String(a.i||'').split(/\n{2,}/).map(t=>t.trim()).filter(Boolean).map(t=>'<p style="line-height:1.65;margin:0 0 14px">'+esc(t).replace(/\n/g,'<br>')+'</p>').join('');
 const rf=(a.refs||[]).filter(r=>/^https?:\/\//.test(r.u));
 return back+`<article><h2 style="margin:0 0 6px">${esc(a.j)}</h2><div class="mut" style="margin-bottom:12px">Ditulis oleh <b>${esc(a.p||NM())}</b> · ${esc(artTgl(a.d))}</div>${g?`<img src="${esc(g)}" alt="${esc(a.j)}" referrerpolicy="no-referrer" onerror="this.style.display='none'" style="width:100%;max-height:420px;object-fit:cover;border-radius:14px;margin-bottom:14px">`:''}${par}${rf.length?`<div class="box"><b>Link referensi</b><ul style="margin:8px 0 0;padding-left:18px">${rf.map(r=>`<li style="margin:4px 0;word-break:break-all"><a href="${esc(r.u)}" target="_blank" rel="noopener nofollow ugc">${esc(r.t||r.u)}</a></li>`).join('')}</ul></div>`:''}</article>${back}`}
/* Cuplikan 3 artikel terbaru di bawah beranda */
const homeArt0=home;home=function(){const h=homeArt0.apply(this,arguments);artLoad();const L=artCache();return h+(L&&L.length?`<div style="margin-top:18px"><div class="row"><h3 style="margin:0">Artikel terbaru</h3><a href="#/artikel">Lihat semua</a></div>${L.slice(0,3).map(artKartu).join('')}</div>`:'')};
/* ---------- Admin ---------- */
const AE0=()=>({id:'',j:'',p:(typeof me=='function'&&me()&&me().n)||'',d:cmHariIni(),g:'',i:'',r:'',v:true});
function artAdmLoad(){if(V.aal||V.aaQ)return;V.aaQ=1;post({act:'art_all'}).then(r=>{V.aaQ=0;V.aal=r&&r.ok?r.list:[];if(!(r&&r.ok))toast('Gagal memuat artikel: '+((r&&r.err)||''));if(V.tab=='art')draw()}).catch(()=>{V.aaQ=0;V.aal=[];toast('Tidak bisa menghubungi Google Sheet.');if(V.tab=='art')draw()})}
function aeSet(k,v){V.ae[k]=v}
function aeBaru(){V.ae=AE0();draw()}
function aeUbah(id){const a=(V.aal||[]).find(x=>x.id==id);if(!a)return;V.ae={id:a.id,j:a.j,p:a.p,d:a.d||cmHariIni(),g:a.g,i:a.i,r:a.r,v:!!a.v};draw();scrollTo(0,0)}
function aeBatal(){V.ae=null;draw()}
function aeFoto(){if(typeof pilihFoto!='function')return toast('Fitur foto tidak tersedia.');pilihFoto(async d=>{toast('Mengunggah gambar…');try{const r=await post({act:'foto',id:'artikel',data:d,only:1});if(!r.ok)return toast('Gagal: '+(r.err||''));V.ae.g=drv(r.url);draw()}catch(e){toast('Gagal mengunggah gambar.')}})}
async function aeSimpan(){const a=V.ae;if(!a)return;if(!String(a.j).trim())return toast('Judul wajib diisi.');if(!String(a.i).trim())return toast('Isi tulisan wajib diisi.');
 const r=await post({act:'art_save',id:a.id,j:a.j,p:a.p,d:a.d,g:a.g,i:a.i,r:a.r,v:a.v?1:0}).catch(()=>null);if(!r||!r.ok)return toast('Gagal menyimpan: '+((r&&r.err)||'tidak bisa menghubungi Sheet'));
 toast('Artikel tersimpan.');V.ae=null;V.aal=null;V.art=null;localStorage.removeItem(ART_KEY);if(V.artD)V.artD={};draw()}
async function aeHapus(id){if(!confirm('Hapus artikel ini? Tidak bisa dikembalikan.'))return;const r=await post({act:'art_del',id}).catch(()=>null);if(!r||!r.ok)return toast('Gagal menghapus: '+((r&&r.err)||''));toast('Artikel dihapus.');V.aal=null;V.art=null;localStorage.removeItem(ART_KEY);if(V.artD)V.artD={};draw()}
function aArt(){artAdmLoad();const a=V.ae,L=V.aal;
 if(a)return`<div class="box"><b>${a.id?'Ubah artikel':'Artikel baru'}</b>
<label>Judul</label><input value="${esc(a.j)}" maxlength="150" oninput="aeSet('j',this.value)">
<label>Penulis (tampil di halaman artikel)</label><input value="${esc(a.p)}" maxlength="60" oninput="aeSet('p',this.value)">
<label>Tanggal</label><input type="date" value="${esc(a.d)}" onchange="aeSet('d',this.value)">
<label>Gambar</label>${a.g?`<img src="${esc(artImg(a.g))}" alt="" style="max-width:100%;max-height:160px;border-radius:10px;display:block;margin-bottom:8px">`:''}<button class="btn o s" onclick="aeFoto()">📷 ${a.g?'Ganti gambar':'Pilih gambar dari HP'}</button>${a.g?' <button class="btn o s" onclick="aeSet(\'g\',\'\');draw()">Hapus gambar</button>':''}
<input placeholder="atau tempel link gambar (https://…)" value="${esc(a.g)}" onchange="aeSet('g',this.value.trim());draw()" style="margin-top:8px">
<label>Isi tulisan (kosongkan satu baris untuk paragraf baru)</label><textarea rows="12" oninput="aeSet('i',this.value)">${esc(a.i)}</textarea>
<label>Link referensi (satu per baris; boleh "Nama sumber | https://…")</label><textarea rows="4" oninput="aeSet('r',this.value)">${esc(a.r)}</textarea>
<label style="display:flex;gap:10px;align-items:center;color:var(--ink)"><input type="checkbox" style="width:auto;min-height:0" ${a.v?'checked':''} onchange="aeSet('v',this.checked)"><span>Publikasikan ke pembeli<br><small class="mut">Tanpa centang = catatan pribadi penjual, tidak pernah tampil ke pembeli.</small></span></label>
<div style="display:flex;gap:8px;margin-top:12px"><button class="btn" onclick="aeSimpan()">Simpan</button><button class="btn o" onclick="aeBatal()">Batal</button></div></div>`;
 return`<div class="box"><b>📰 Artikel &amp; catatan</b><p class="mut">Artikel yang <b>dipublikasikan</b> tampil ke pembeli: judul, gambar kecil, 10 kata pertama, lalu halaman penuh lewat "Baca selengkapnya" (terbaru ke terlama). Tanpa publikasi = <b>catatan pribadi</b>, hanya Anda yang melihatnya.</p><button class="btn" onclick="aeBaru()">+ Tulis artikel / catatan</button></div>`+afBar()+'<div id="aal">'+afList()+'</div>'}
/* Filter, pencarian, dan halaman daftar artikel (sisi penjual). Awal: semua tanggal, semua status, 10 per halaman. */
const AF0=()=>({q:'',tgl:'all',dari:'',sampai:'',st:'all',per:10,hal:1});
const afS=()=>V.af=V.af||AF0();
function afQ(){const f=afS(),q=f.q.trim().toLowerCase(),hr=cmHariIni();
 return(V.aal||[]).filter(x=>{if(f.st=='pub'&&!x.v)return false;if(f.st=='pri'&&x.v)return false;if(f.tgl=='hari'&&x.d!=hr)return false;
  if(f.tgl=='rentang'){if(f.dari&&x.d<f.dari)return false;if(f.sampai&&x.d>f.sampai)return false}
  return!q||(String(x.j)+' '+String(x.i)).toLowerCase().includes(q)})}
function afSet(k,v,full){const f=afS();f[k]=v;if(k!='hal')f.hal=1;full?draw():afRef()}
function afRef(){const e=$('#aal');if(e)e.innerHTML=afList()}
function afHal(d){const f=afS();f.hal=Math.max(1,f.hal+d);afRef()}
function afReset(){V.af=AF0();draw()}
function afBar(){const f=afS(),o=(v,l,c)=>`<option value="${v}"${c==v?' selected':''}>${l}</option>`;
 return`<div class="box"><input type="search" placeholder="Cari judul atau isi…" value="${esc(f.q)}" oninput="afSet('q',this.value)">
<label>Tanggal</label><select onchange="afSet('tgl',this.value,1)">${o('all','Semua tanggal',f.tgl)}${o('hari','Hari ini',f.tgl)}${o('rentang','Pilih rentang tanggal',f.tgl)}</select>
${f.tgl=='rentang'?`<div style="display:flex;gap:8px"><input type="date" value="${esc(f.dari)}" onchange="afSet('dari',this.value)"><input type="date" value="${esc(f.sampai)}" onchange="afSet('sampai',this.value)"></div>`:''}
<label>Status</label><select onchange="afSet('st',this.value)">${o('all','Semua',f.st)}${o('pub','Dipublikasikan ke pembeli',f.st)}${o('pri','Catatan pribadi',f.st)}</select>
<label>Tampil per halaman</label><select onchange="afSet('per',+this.value)">${o(10,'10',f.per)}${o(0,'Semua',f.per)}</select>
<button class="btn o s" style="margin-top:8px" onclick="afReset()">Atur ulang filter</button></div>`}
function afList(){const f=afS(),L=V.aal==null?null:afQ();if(L==null)return'<div class="box mut">Memuat…</div>';
 const per=f.per>0?f.per:Math.max(1,L.length),n=Math.max(1,Math.ceil(L.length/per));if(f.hal>n)f.hal=n;if(f.hal<1)f.hal=1;const a=(f.hal-1)*per,P=L.slice(a,a+per),tot=(V.aal||[]).length;
 const nav=n>1?`<div class="box" style="display:flex;gap:8px;align-items:center;justify-content:space-between"><button class="btn o s"${f.hal<=1?' disabled':''} onclick="afHal(-1)">‹ Sebelumnya</button><span class="mut" style="text-align:center">Halaman ${f.hal} dari ${n}</span><button class="btn o s"${f.hal>=n?' disabled':''} onclick="afHal(1)">Berikutnya ›</button></div>`:'';
 return`<p class="mut" style="margin:6px 2px">${L.length?`Menampilkan ${a+1}-${a+P.length} dari ${L.length}`:'Tidak ada hasil'}${L.length!=tot?` (total ${tot})`:''}</p>`
 +(P.length?P.map(x=>`<div class="box"><b>${esc(x.j)}</b><br><small class="mut">${x.v?'🌐 Dipublikasikan':'🔒 Catatan pribadi'} · ${esc(x.p)} · ${esc(artTgl(x.d))}</small><div style="display:flex;gap:8px;margin-top:8px"><button class="btn o s" onclick="aeUbah('${esc(x.id)}')">Ubah</button><button class="btn o s" onclick="aeHapus('${esc(x.id)}')">Hapus</button>${x.v?`<a class="btn o s" href="#/artikel/${esc(x.id)}" target="_blank">Lihat</a>`:''}</div></div>`).join(''):`<div class="box mut">${tot?'Tidak ada artikel yang cocok dengan filter.':'Belum ada artikel.'}</div>`)+nav}
(window.__muat=window.__muat||[]).push('js/toko/artikel.js');
