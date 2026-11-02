/* js/tambahan/nominal.js : v64 input nominal cepat. Di semua isian uang (catat bayar, cicilan, titip uang, biaya, CALK, Staf) muncul tombol
   +5rb +10rb +20rb +50rb +100rb (ketuk berkali-kali = menambah), tombol Pas (bila ada sisa tagihan: atribut data-pas), tombol Hapus, dan tulisan
   "= Rp 15.000" di bawah isian. Tidak mengubah isian yang sudah terisi otomatis (mis. total transfer). Membungkus draw(). */
const QK_ID=/^(bj|sj|mj|kj|dj|tn|fn|hj|cn.+|n.+|rn.+)$/,QK_NOM=[5000,10000,20000,50000,100000];
function qkRp(n){n=Math.round(+n||0);return typeof rp=='function'?rp(n):'Rp'+n.toLocaleString('id-ID')}
function qkSet(id,delta){const e=document.getElementById(id);if(!e)return;let v=Math.round(+e.value||0);
 if(delta=='pas')v=Math.round(+e.dataset.pas||0);else if(delta=='x')v=0;else v+=delta;
 const mx=+e.getAttribute('max');if(mx>0&&v>mx)v=mx;if(v<0)v=0;e.value=v?String(v):'';
 try{e.dispatchEvent(new Event('input',{bubbles:true}))}catch(x){}qkInfo(e)}
function qkInfo(e){const t=document.getElementById('qki_'+e.id);if(t)t.textContent=(+e.value>0)?'= '+qkRp(e.value):''}
function qkPasang(){try{document.querySelectorAll('input[type=number]').forEach(e=>{
  if(!e.id||e.dataset.qk||!QK_ID.test(e.id)||e.disabled||e.readOnly)return;if(e.hasAttribute('value')&&String(e.getAttribute('value')).trim()!=='')return;
  e.dataset.qk='1';const pas=+e.dataset.pas>0,b=(l,a,c)=>`<button type="button" class="btn o s" style="padding:5px 9px;margin:2px 3px 2px 0${c||''}" onclick="qkSet('${e.id}',${a})">${l}</button>`;
  const h=document.createElement('div');h.className='qk';h.style.cssText='margin:4px 0 6px';
  h.innerHTML=QK_NOM.map(n=>b('+'+(n/1000)+'rb',n)).join('')+(pas?b('Pas '+qkRp(e.dataset.pas),"'pas'",';font-weight:700'):'')+b('Hapus',"'x'")+`<span id="qki_${e.id}" class="mut" style="margin-left:6px;font-weight:600"></span>`;
  const row=e.parentNode&&e.parentNode.classList&&e.parentNode.classList.contains('row')?e.parentNode:e;row.insertAdjacentElement('afterend',h);
  e.addEventListener('input',()=>qkInfo(e));qkInfo(e)})}catch(x){}}
(function(){const d0=draw;draw=function(){const r=d0.apply(this,arguments);qkPasang();return r};setTimeout(qkPasang,300)})();
(window.__muat=window.__muat||[]).push('js/tambahan/nominal.js');
