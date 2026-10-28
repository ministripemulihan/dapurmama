/* js/inti/tampilan.js */
/* ===== Tampilan HP: bar atas bersembunyi saat scroll ke bawah ===== */
let LY=0;
function route(){return location.hash.slice(1)||'/'}
function go(h){location.hash=h}
function draw(){expire();const r=route();let c='';
 if(r=='/')c=home();else if(r=='/keranjang')c=cart();else if(r=='/checkout')c=checkout();else if(r.startsWith('/bayar/'))c=pay(r.slice(7));else if(r=='/cek')c=cek();else if(r=='/faq')c=faq();else if(r=='/akun')c=akun();else if(r=='/qris'||r.startsWith('/qris/'))c=qrisHal(r.slice(6));else if(r=='/admin')c=admin();else c=home();
 const n=S.cart.reduce((a,c)=>a+c.q,0),AC=typeof admChrome=='function'&&admChrome();document.body.classList.toggle('admapp',AC);
 $('#app').innerHTML=`${AC?'':`<header><div class="hd"><div class="logo" onclick="go('/')"><span class="lm">DM</span>Dimsum&nbsp;<span>Mama</span></div><input id="q" placeholder="Cari produk…" value="${esc(V.q)}" oninput="V.q=this.value;if(route()!='/')go('/');else grid()"><button class="ib" onclick="theme()" aria-label="Ganti tema">${document.documentElement.dataset.theme=='dark'?'☀':'☾'}</button><button class="btn o s" onclick="go('/cek')">Cek pesanan</button><button class="btn o s" onclick="go('/faq')">FAQ</button><button class="btn o s" onclick="go('/akun')">${me()?'👤 '+esc(me().u):'Masuk'}</button><button class="btn s" onclick="go('/keranjang')">Keranjang (${n})</button></div></header>`}<div class="w">${c}</div>${AC?admNav():''}${V.open?modal():''}${lbHTML()}${qfHTML()}<button class="fab" onclick="wa()" aria-label="WhatsApp"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.5 8.5 0 1 1 21 11.5z"/></svg></button>`;
 if(r=='/')grid();if(r=='/checkout'){wilInit('co');kurUI()}}
function lebarMode(){return document.documentElement.dataset.lebar||'auto'}
function lebarIkon(){return{auto:'↔',pc:'🖥',hp:'📱'}[lebarMode()]}
function lebarBtn(){return`<button type="button" class="alb" onclick="lebar()" aria-label="Ganti lebar tampilan" title="Lebar tampilan: ${{auto:'Otomatis',pc:'Komputer',hp:'HP'}[lebarMode()]}">${lebarIkon()}</button>`}
function lebar(){const o=['auto','pc','hp'],n=o[(o.indexOf(lebarMode())+1)%3];document.documentElement.dataset.lebar=n;try{localStorage.setItem('tokolebar',n)}catch(e){}draw();toast('Lebar tampilan: '+{auto:'Otomatis (mengikuti layar)',pc:'Komputer (lebar)',hp:'HP (sempit)'}[n])}
function theme(){const t=document.documentElement.dataset.theme=='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('tokotema',t)}catch(e){}draw()}
function wa(){if(!S.wa)return toast('Isi nomor WhatsApp toko di Admin > Pengaturan.');open('https://wa.me/'+S.wa.replace(/\D/g,'')+'?text='+encodeURIComponent('Halo, saya mau tanya produk di '+NM()))}
function hue(p){return[18,212,32,335,160,205,48,262,12,26,125,6][(+p.id.slice(1)-1)%12]}
(window.__muat=window.__muat||[]).push('js/inti/tampilan.js');
