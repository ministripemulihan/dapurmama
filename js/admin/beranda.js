/* js/admin/beranda.js : v38 Beranda admin gaya myBCA: header biru, kartu pemasukan hari ini, Menu Utama (ketuk untuk masuk), Catatan Finansial, navigasi bawah. Isi tiap menu tetap fungsi lama (aVer, aOrd, ...). */
function admChrome(){const m=me();return route()=='/admin'&&!!m&&m.r!='customer'}
const ADM_IK={ver:'✅',ord:'📦',rek:'📊',lcs:'🔎',off:'🧾',kas:'💳',qrs:'🔳',bc:'📣',tm:'💬',uls:'⭐',stk:'🗃️',lap:'📈',bia:'💸',keu:'🏦',alat:'🧰',usr:'👥',set:'⚙️',inv:'🧾'};
const ADM_UTAMA=['ver','ord','off','kas','stk','keu','bia'];
function admGo(k){V.tab=k;V.kisk=null;draw();scrollTo(0,0)}
function admMata(){V.ahide=V.ahide===false?true:false;draw()}
function admMasukHariIni(){const hari=new Date(Date.now()+7*36e5).toISOString().slice(0,10),d=ms=>new Date((+ms||0)+7*36e5).toISOString().slice(0,10);let n=0;
 (S.o||[]).forEach(o=>{if(PAID.includes(o.status)&&d(o.paid||o.t)==hari)n+=+o.tf||+o.total||0});
 (typeof OF=='function'?OF():[]).forEach(o=>(o.pays||[]).forEach(x=>{if(x.st=='ok'&&x.j!='saldo'&&(+x.n||0)>0&&d(x.okt||x.t)==hari)n+=+x.n}));
 (typeof SE=='function'?SE():[]).forEach(x=>{if(x.st=='ok'&&d(x.okt||x.t)==hari)n+=+x.n});return n}
function admBars(m){return`${gk()?'':'<div class="box" style="border-color:#d29922"><b>Belum tersambung ke Google Sheet.</b> Buka Pengaturan, tempel Kunci sinkron (dari menu '+esc(NM())+' di Google Sheet), lalu tekan Tes sambungan. Tanpa kunci, perubahan hanya tersimpan di browser ini.</div>'}${m.r=='admin'?bkBanner()+tutupAdminBar()+jamAdminBar()+ringBar():''}`}
function admIkon(k,l,badge){return`<button type="button" class="atile" onclick="${k=='_all'?'V.amall=!V.amall;draw()':"admGo('"+k+"')"}"><span class="aic">${k=='_all'?'▦':ADM_IK[k]||'•'}${badge?`<i class="abd">${badge}</i>`:''}</span><span>${esc(l)}</span></button>`}
function admHome(m,T,pend){
 const staf=m.r=='staf',keys=Object.keys(T),utama=staf?keys:ADM_UTAMA.filter(k=>T[k]),lain=keys.filter(k=>utama.indexOf(k)<0),all=!!V.amall;
 const tiles=utama.concat(all?lain:[]).map(k=>admIkon(k,T[k],k=='ver'&&pend?pend:0)).join('')+(!staf&&lain.length?admIkon('_all',all?'Ringkas':'Semua Menu'):'');
 const hide=V.ahide!==false;
 const kartu=staf?'':`<div class="ac"><div class="act"><button type="button" class="acq" onclick="qFull(0,'')">🔳 QRIS ›</button><div class="acn">Toko: ${esc(NM())}</div></div><div class="acb"><div class="mut">Pemasukan Hari Ini</div><div class="row"><b class="acv">${hide?'IDR ●●●●●●●●':keuIDR(admMasukHariIni())}</b><button type="button" class="aeye" onclick="admMata()" aria-label="${hide?'Tampilkan jumlah':'Sembunyikan jumlah'}">${keuMata_svg(!hide)}</button></div><hr><a href="javascript:void(0)" onclick="admGo('keu')" class="acl">📋 Catatan Finansial</a></div></div>`;
 const tutup=m.r=='admin'?`<div class="astat"><span>${tutupAktif()?'🔴 Toko sedang <b>tutup</b>':'🟢 Toko sedang <b>buka</b>'}${pend?' · <b>'+pend+'</b> pesanan perlu dicek':''}</span><button type="button" onclick="tutupToggle()">${tutupAktif()?'Buka toko':'Tutup toko'}</button></div>`:'';
 return`<div class="ah"><div class="aht"><span class="alg">Dimsum <b>Mama</b></span><span class="ahi">${lebarBtn()}<button type="button" onclick="theme()" aria-label="Ganti tema">${document.documentElement.dataset.theme=='dark'?'☀':'☾'}</button>${m.r=='admin'?'<button type="button" onclick="admGo(\'set\')" aria-label="Pengaturan">⚙</button>':''}<button type="button" onclick="keluar()" aria-label="Keluar">⎋</button></span></div><div class="ahh">HALO, <b>${esc(String(m.u).toUpperCase())}</b></div></div><div class="ahs">${kartu}${tutup}${admBars(m)}<div class="row" style="margin:14px 2px 6px"><b style="font-size:20px">Menu Utama</b></div><div class="agrid">${tiles}</div>${m.r=='admin'?keuCatatan(true):''}</div>`}
function admInner(m,T,pend,isi){
 return`<div class="abar"><button type="button" onclick="admGo('home')" aria-label="Kembali ke Beranda">‹</button><b>${esc(T[V.tab]||'')}${V.tab=='ver'&&pend?' ('+pend+')':''}</b><span>${lebarBtn()}<button type="button" onclick="theme()" aria-label="Ganti tema">${document.documentElement.dataset.theme=='dark'?'☀':'☾'}</button></span></div><div class="ahs" style="padding-top:8px">${admBars(m)}<div class="tabs" style="display:none;padding:0"></div>${isi}</div>`}
function admNav(){const m=me(),t=V.tab||'home',staf=m.r=='staf';
 const it=(k,l,ic,fn)=>`<button type="button" class="an ${t==k?'on':''}" onclick="${fn||"admGo('"+k+"')"}"><span>${ic}</span>${l}</button>`;
 if(staf)return`<nav class="anav">${it('home','Beranda','🏠')}${it('stk','Stok','🗃️')}${it('inv','Invoice','🧾')}${it('_k','Keluar','⎋','keluar()')}</nav>`;
 return`<nav class="anav">${it('home','Beranda','🏠')}${it('ord','Pesanan','📄')}<button type="button" class="an anq" onclick="qFull(0,'')" aria-label="QRIS"><span class="anqc">🔳</span>QRIS</button>${it('keu','Keuangan','🏦')}${it('set','Akun Saya','👤')}</nav>`}
(window.__muat=window.__muat||[]).push('js/admin/beranda.js');
