/* js/media/bunyi.js */
/* Bunyi pesanan baru (lagu bisa dipilih penjual; pengaturan per perangkat) */
const LAGU={
 lonceng:{n:'Lonceng toko (ding-dong)',u:300,w:'bel',t:'E6:2 C6:3'},
 kasir:{n:'Ting-ting kasir',u:140,w:'bel',t:'G6:1 C7:1 E7:1 G7:4'},
 elise:{n:'Für Elise (Beethoven)',u:125,w:'tri',t:'E5:1 D#5:1 E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 A4:3 R:1 C4:1 E4:1 A4:1 B4:3 R:1 E4:1 G#4:1 B4:1 C5:4'},
 ode:{n:'Ode to Joy (Beethoven)',u:240,w:'tri',t:'E5:1 E5:1 F5:1 G5:1 G5:1 F5:1 E5:1 D5:1 C5:1 C5:1 D5:1 E5:1 E5:1.5 D5:.5 D5:2'},
 twinkle:{n:'Twinkle Twinkle Little Star',u:260,w:'tri',t:'C5:1 C5:1 G5:1 G5:1 A5:1 A5:1 G5:2 F5:1 F5:1 E5:1 E5:1 D5:1 D5:1 C5:2'},
 jingle:{n:'Jingle Bells',u:220,w:'tri',t:'E5:1 E5:1 E5:2 E5:1 E5:1 E5:2 E5:1 G5:1 C5:1.5 D5:.5 E5:4'},
 ultah:{n:'Selamat Ulang Tahun',u:260,w:'tri',t:'G4:.75 G4:.25 A4:1 G4:1 C5:1 B4:2 G4:.75 G4:.25 A4:1 G4:1 D5:1 C5:2'},
 pentatonik:{n:'Pentatonik lembut (nada asli)',u:200,w:'bel',t:'E5:1 G5:1 A5:1 G5:1 E5:1 D5:1 C5:2 R:1 E5:1 G5:1 A5:2 C6:3'}};
const NN={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
let AC=null;
const bn=()=>{let b={};try{b=JSON.parse(localStorage.getItem('tokobunyi'))||{}}catch(e){}return{on:b.on==null?1:b.on,lagu:b.lagu||'kasir',vol:b.vol==null?.8:+b.vol,ulang:b.ulang==null?3:+b.ulang,bayar:b.bayar==null?1:b.bayar,getar:b.getar==null?1:b.getar}};
let BF=null,BFk='';
const RG={t:0,left:0,gap:0};
function laguNada(id){const L=LAGU[id]||LAGU.kasir;return L.t.split(/\s+/).map(x=>{const a=x.split(':'),u=+a[1]||1;if(a[0]=='R')return{r:1,u};const m=a[0].match(/^([A-G])([#b]?)(\d)$/);const s=NN[m[1]]+(m[2]=='#'?1:m[2]=='b'?-1:0);return{f:440*Math.pow(2,((+m[3]+1)*12+s-69)/12),u}})}
function acx(){try{if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C()}return AC}catch(e){return null}}
function bunyiBuka(){if(!adm()&&!/admin/.test(route()))return;const c=acx();if(c&&c.state!='running'&&c.resume)c.resume().then(()=>{const e=document.getElementById('bnbn');if(e&&c.state=='running')e.remove()}).catch(()=>{})}
function bnSet(k,v){const b=bn();b[k]=v;try{localStorage.setItem('tokobunyi',JSON.stringify(b))}catch(e){toast('Penyimpanan penuh.')}}
function nada(c,t,f,d,v,w){const o=c.createOscillator(),g=c.createGain();o.type=w=='bel'?'sine':'triangle';o.frequency.value=f;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.05);
 if(w=='bel'){const o2=c.createOscillator(),g2=c.createGain();o2.type='sine';o2.frequency.value=f*2.76;g2.gain.setValueAtTime(.0001,t);g2.gain.exponentialRampToValueAtTime(Math.max(.0002,v*.35),t+.01);g2.gain.exponentialRampToValueAtTime(.0001,t+d*.45);o2.connect(g2);g2.connect(c.destination);o2.start(t);o2.stop(t+d*.5+.05)}}
async function mainFile(c,vol){const d=localStorage.getItem('tokobunyifile');if(!d)return 0;
 try{if(BFk!=d){const b=atob(d.split(',')[1]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);BF=await new Promise((ok,no)=>{const p=c.decodeAudioData(a.buffer,ok,no);if(p&&p.catch)p.catch(no)});BFk=d}
  const s=c.createBufferSource(),g=c.createGain();s.buffer=BF;g.gain.value=vol;s.connect(g);g.connect(c.destination);const dur=Math.min(BF.duration,15);s.start();s.stop(c.currentTime+dur);return Math.round(dur*1000)}
 catch(e){toast('File nada tidak bisa diputar. Pilih file mp3/wav/m4a yang lain.');return 0}}
async function mainkan(id,vol){const b=bn(),c=acx();id=id||b.lagu;vol=vol==null?b.vol:vol;if(!c)return 0;
 try{if(c.state!='running'&&c.resume)await c.resume()}catch(e){}
 if(c.state!='running')return 0;
 if(id=='sendiri')return mainFile(c,vol);
 const L=LAGU[id]||LAGU.kasir,u=L.u/1000;let t=c.currentTime+.05;const t0=t;
 laguNada(id).forEach(n=>{if(!n.r)nada(c,t,n.f,Math.max(.18,n.u*u*1.6),.32*vol,L.w);t+=n.u*u});
 return Math.round((t-t0)*1000)}
function bnFile(i){const f=i.files[0];if(!f)return;if(f.size>7e5)return toast('File maksimal 700 KB. Potong lagunya jadi sekitar 10–15 detik.');
 const r=new FileReader();r.onload=()=>{try{localStorage.setItem('tokobunyifile',r.result);localStorage.setItem('tokobunyinama',f.name.slice(0,60));BFk='';bnSet('lagu','sendiri');draw();mainkan()}catch(e){toast('Penyimpanan penuh. Pakai file yang lebih kecil.')}};r.readAsDataURL(f)}
async function ring(jenis,n){const b=bn();if(!b.on||!adm()||!(n>0)||(jenis=='bayar'&&!b.bayar))return;
 const r=V.ring=V.ring||{baru:0,bayar:0};r[jenis]+=n;
 if(!TT0)TT0=document.title;document.title='🔔 ('+(r.baru+r.bayar)+') Pesanan masuk — '+NM();
 if(b.getar&&navigator.vibrate)try{navigator.vibrate([200,100,200])}catch(e){}
 const ms=await mainkan();clearInterval(RG.t);RG.left=Math.max(0,b.ulang-1);RG.gap=Math.max(20000,(ms||0)+15000);
 if(RG.left>0)RG.t=setInterval(()=>{if(!adm()||!V.ring||RG.left<=0){clearInterval(RG.t);return}RG.left--;mainkan()},RG.gap)}
function ringStop(){clearInterval(RG.t);V.ring=null;if(TT0){document.title=TT0;TT0=''}}
function ringLihat(){ringStop();V.tab='ver';draw()}
function ringBar(){const r=V.ring;let h='';
 if(bn().on&&!(AC&&AC.state=='running'))h+=`<div class="box" id="bnbn" style="border-color:#d29922"><div class="row"><span>🔇 Bunyi pesanan belum aktif di perangkat ini. Ketuk sekali agar boleh berbunyi.</span><button class="btn s" onclick="bunyiBuka();mainkan(null,.5);setTimeout(draw,500)">Aktifkan bunyi</button></div></div>`;
 if(r&&(r.baru+r.bayar)>0)h+=`<div class="box" style="border-color:var(--acc)"><div class="row"><b>🔔 ${r.baru?r.baru+' pesanan baru':''}${r.baru&&r.bayar?' · ':''}${r.bayar?r.bayar+' sudah bayar, menunggu dicek':''}</b><span><button class="btn s" onclick="ringLihat()">Buka Verifikasi</button> <button class="btn o s" onclick="ringStop();draw()">Diamkan</button></span></div></div>`;
 return h}
function bunyiBox(){const b=bn(),nf=localStorage.getItem('tokobunyinama')||'',ck=(k,v,t)=>`<label style="display:flex;gap:10px;align-items:center;color:var(--ink)"><input type="checkbox" style="width:auto;min-height:0" ${v?'checked':''} onchange="bnSet('${k}',this.checked?1:0);draw()">${t}</label>`;
 return`<div class="box"><b>🔔 Bunyi pesanan online baru</b><p class="mut">Berbunyi di perangkat ini saat ada pesanan online baru atau pembeli menekan "Saya sudah bayar". Pengaturan ini per perangkat, jadi HP dan laptop boleh berbeda. Aplikasi harus sedang terbuka (di HP: biarkan layar menyala, jangan tutup aplikasinya).</p>
${ck('on',b.on,'Bunyikan saat ada pesanan baru')}${ck('bayar',b.bayar,'Juga saat pembeli menekan "Saya sudah bayar"')}${ck('getar',b.getar,'Getar (di HP)')}
<label>Pilih nada lagu</label><div class="row"><select style="flex:1" onchange="bnSet('lagu',this.value);mainkan()">${Object.keys(LAGU).map(k=>`<option value="${k}" ${b.lagu==k?'selected':''}>${esc(LAGU[k].n)}</option>`).join('')}<option value="sendiri" ${b.lagu=='sendiri'?'selected':''} ${nf?'':'disabled'}>${nf?'Nada saya: '+esc(nf):'Nada saya sendiri (unggah dulu)'}</option></select><button class="btn o s" onclick="bunyiBuka();mainkan()">▶ Coba</button></div>
<label>Volume</label><input type="range" min="10" max="100" value="${Math.round(b.vol*100)}" style="padding:0" onchange="bnSet('vol',this.value/100);mainkan()">
<label>Ulangi bunyi jika belum dibuka</label><select onchange="bnSet('ulang',+this.value)">${[[1,'Sekali saja'],[3,'3 kali (tiap ± 30 detik)'],[5,'5 kali'],[10,'10 kali']].map(x=>`<option value="${x[0]}" ${b.ulang==x[0]?'selected':''}>${x[1]}</option>`).join('')}</select>
<label>Pakai lagu sendiri (mp3/wav/m4a, maks 700 KB, diputar maks 15 detik)</label><input type="file" accept="audio/*" onchange="bnFile(this)">
<p class="mut">Lagu bawaan memakai melodi domain publik. Untuk lagu sendiri, pastikan Anda berhak memakainya.</p></div>`}
(window.__muat=window.__muat||[]).push('js/media/bunyi.js');
