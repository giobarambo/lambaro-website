//------------- burger button
function toggleMenu(){
    const nav = document.querySelector('nav');
    nav.classList.toggle('openedMenu');
    document.body.classList.toggle('no-scroll');
}


//------------- clock
(function(){
const el = document.getElementById('clockDigits');
let remaining = 24 * 60 * 60;


function updateCountdown(){
if(remaining < 0) remaining = 0;
const hh = String(Math.floor(remaining / 3600)).padStart(2,'0');
const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2,'0');
const ss = String(remaining % 60).padStart(2,'0');


el.textContent = hh + mm + ss;
el.classList.add('tick');
setTimeout(()=> el.classList.remove('tick'), 120);
remaining--;
}


if(el){ updateCountdown(); setInterval(updateCountdown, 1000); }
})();



//------------- pills
const rowCount = 10;           
const minPillWidth = 36;       
const maxPillWidth = 160;     

const minSpeed = 0.02;
const maxSpeed = 0.09;


const wrap = document.getElementById('wrap');
const rows = [];


for (let i = 0; i < rowCount; i++) {
    const row = document.createElement('div');
    row.className = 'row';

    const pill = document.createElement('div');
    pill.className = 'pill';

    
    if (Math.random() < 0.25) pill.classList.add('small');

    row.appendChild(pill);
    wrap.appendChild(row);

    
    const initialOffset = Math.random();

    
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    const offset = (Math.random() - 0.5) * 0.5;

    rows.push({ row, pill, speed, offset, initialOffset, pillWidth: 0, targetX: 0, currentX: 0 });
}


function recomputeSizes() {
    rows.forEach(r => {
    
    const measured = r.pill.getBoundingClientRect().width || minPillWidth;
    r.pillWidth = Math.max(minPillWidth, Math.min(maxPillWidth, Math.round(measured)));

    const rect = r.row.getBoundingClientRect();
    const maxX = Math.max(0, rect.width - r.pillWidth - 4);
    
    r.currentX = Math.round(r.initialOffset * maxX);
    
    r.pill.style.transform = `translate3d(${r.currentX}px, -50%, 0)`;
    });
}


requestAnimationFrame(() => {
    recomputeSizes();
    
    window.dispatchEvent(new Event('resize'));
});


function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }


let pointerX = null;
function setPointerFromEvent(e) {
    const rect = wrap.getBoundingClientRect();
    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    pointerX = clamp((clientX - rect.left) / rect.width, 0, 1);
}

function clearPointer() { pointerX = null; }


window.addEventListener('mousemove', (e) => { setPointerFromEvent(e); });
window.addEventListener('touchmove', (e) => { setPointerFromEvent(e); }, { passive: false });
window.addEventListener('mouseleave', clearPointer);
window.addEventListener('touchend', clearPointer);


function animate() {
    rows.forEach((r, idx) => {
    const rect = r.row.getBoundingClientRect();
    const maxX = Math.max(0, rect.width - r.pillWidth - 4);

    let t;
    if (pointerX === null) {
        
        const tNow = performance.now() / 1000;
        const drift = Math.sin(tNow * (0.5 + (idx % 4) * 0.1) + idx) * 0.12;
        const base = 0.5 + drift + r.offset;
        t = clamp(base, 0, 1);
    } else {
        
        t = clamp(pointerX + r.offset, 0, 1);
    }

    r.targetX = Math.round(t * maxX);
    
    r.currentX += (r.targetX - r.currentX) * r.speed;

    
    r.pill.style.transform = `translate3d(${Math.round(r.currentX)}px, -50%, 0)`;
    });

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);


let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
    recomputeSizes();
    
    rows.forEach(r => {
    const rect = r.row.getBoundingClientRect();
    const maxX = Math.max(0, rect.width - r.pillWidth - 4);
        r.currentX = clamp(r.currentX, 0, maxX);
        r.pill.style.transform = `translate3d(${Math.round(r.currentX)}px, -50%, 0)`;
    });
    }, 80);
});