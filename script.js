const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// preloader — never wait on slow CDNs, just give the intro a beat
document.body.classList.add('loading');
setTimeout(() => {
    $('#loader').classList.add('done');
    document.body.classList.remove('loading');
}, reduceMotion ? 0 : 1100);

$('#year').textContent = new Date().getFullYear();

// theme
const root = document.documentElement;
const themeBtn = $('#themeToggle');

function setTheme(theme) {
    root.dataset.theme = theme;
    themeBtn.innerHTML = theme === 'dark' ? "<i class='bx bx-sun'></i>" : "<i class='bx bx-moon'></i>";
    try { localStorage.setItem('theme', theme); } catch (e) {}
}

let savedTheme = null;
try { savedTheme = localStorage.getItem('theme'); } catch (e) {}
setTheme(savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));

const toggleTheme = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
themeBtn.addEventListener('click', toggleTheme);

// mobile menu
const menuBtn = $('#menuBtn');
const navbar = $('#navbar');

menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    navbar.classList.toggle('open');
});

$$('.navbar a').forEach(a => a.addEventListener('click', () => {
    menuBtn.classList.remove('open');
    navbar.classList.remove('open');
}));

// nav indicator + active section
const navLinks = $$('.navbar a');
const indicator = $('#navIndicator');

function moveIndicator(link) {
    if (!link) return;
    indicator.style.left = link.offsetLeft + 'px';
    indicator.style.width = link.offsetWidth + 'px';
}

function setActive(id) {
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
    moveIndicator($('.navbar a.active'));
}

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
}, { rootMargin: '-45% 0px -50% 0px' });

navLinks.forEach(l => {
    const sec = $(l.getAttribute('href'));
    if (sec) sectionObserver.observe(sec);
});

window.addEventListener('load', () => moveIndicator($('.navbar a.active')));
window.addEventListener('resize', () => moveIndicator($('.navbar a.active')));

// scroll: header, progress, timeline
const header = $('#header');
const progress = $('#scrollProgress');
const timeline = $('.timeline');
const timelineFill = $('#timelineFill');

function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 30);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    const r = timeline.getBoundingClientRect();
    const t = Math.min(Math.max((window.innerHeight * .6 - r.top) / r.height, 0), 1);
    timelineFill.style.transform = `scaleY(${t})`;
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// reveal on scroll (staggered per parent)
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add('in');
        revealObserver.unobserve(el);
        // hand transitions back to the element's own hover styles once revealed
        const delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
        setTimeout(() => el.classList.remove('reveal'), (delay + 1.1) * 1000);
    });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => {
    const siblings = $$(':scope > .reveal', el.parentElement);
    el.style.setProperty('--d', (siblings.indexOf(el) * 0.08) + 's');
    revealObserver.observe(el);
});

// count-up numbers
const countObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = +el.dataset.count;
        const start = performance.now();
        const dur = reduceMotion ? 1 : 1600;
        (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
        })(start);
        countObserver.unobserve(el);
    });
}, { threshold: .6 });

$$('[data-count]').forEach(el => countObserver.observe(el));

// typing roles
const roles = [
    'Senior Software Engineer',
    'Full Stack Engineer',
    'React & Node.js Specialist',
    'Fintech Builder',
    'React Native Developer'
];
const typed = $('#typed');

if (!reduceMotion) {
    let r = 0, c = roles[0].length, deleting = true;
    setTimeout(function type() {
        const word = roles[r];
        c += deleting ? -1 : 1;
        typed.textContent = word.slice(0, c);

        let delay = deleting ? 35 : 75;
        if (!deleting && c === word.length) { deleting = true; delay = 2000; }
        else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }

        setTimeout(type, delay);
    }, 2800);
}

// custom cursor + spotlight
if (finePointer && !reduceMotion) {
    document.body.classList.add('has-cursor');
    const dot = $('#cursorDot');
    const ring = $('#cursorRing');
    const spot = $('#spotlight');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    window.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px)`;
        spot.style.setProperty('--mx', mx + 'px');
        spot.style.setProperty('--my', my + 'px');
    });

    (function follow() {
        rx += (mx - rx) * .18;
        ry += (my - ry) * .18;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(follow);
    })();

    document.addEventListener('mouseover', e => {
        ring.classList.toggle('hover', !!e.target.closest('a, button, summary, .skill, input, textarea'));
    });
}

// card glow follows mouse
$$('.glow-card').forEach(card => {
    card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--y', (e.clientY - r.top) + 'px');
    });
});

// magnetic buttons + 3D tilt
if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(el => {
        el.addEventListener('pointermove', e => {
            const r = el.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            el.style.transform = `translate(${x * .25}px, ${y * .35}px)`;
        });
        el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    $$('.tilt').forEach(el => {
        el.addEventListener('pointermove', e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - .5;
            const y = (e.clientY - r.top) / r.height - .5;
            el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
        });
        el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
}

// toast
const toastEl = $('#toast');
let toastTimer;
function toast(msg) {
    $('span', toastEl).textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

// copy email
const EMAIL = 'imran.14ali110@gmail.com';
async function copyEmail() {
    try {
        await navigator.clipboard.writeText(EMAIL);
        toast('Email copied to clipboard!');
    } catch (e) {
        window.location.href = 'mailto:' + EMAIL;
    }
}
$('#copyEmail').addEventListener('click', copyEmail);

// command palette
const palette = $('#palette');
const pInput = $('#paletteInput');
const pList = $('#paletteList');
const go = sel => () => $(sel).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
const open = url => () => window.open(url, '_blank', 'noopener');

const commands = [
    { group: 'Navigate', label: 'Home', icon: 'bx-home-alt', run: go('#home') },
    { group: 'Navigate', label: 'About me', icon: 'bx-user', run: go('#about') },
    { group: 'Navigate', label: 'Experience', icon: 'bx-briefcase', run: go('#experience') },
    { group: 'Navigate', label: 'Skills', icon: 'bx-code-alt', run: go('#skills') },
    { group: 'Navigate', label: 'Education', icon: 'bx-book', run: go('#education') },
    { group: 'Navigate', label: 'Contact', icon: 'bx-envelope', run: go('#contact') },
    { group: 'Actions', label: 'Copy email address', icon: 'bx-copy', run: copyEmail },
    { group: 'Actions', label: 'Download CV', icon: 'bx-download', run: () => { const a = document.createElement('a'); a.href = './pdf/SrSoftwareEngineer.pdf'; a.download = ''; a.click(); } },
    { group: 'Actions', label: 'View projects', icon: 'bx-folder-open', run: open('https://drive.google.com/file/d/1WBObDvaFHJ-9ZKQS9p61WyTuGAT34DoP/view?usp=drive_link') },
    { group: 'Actions', label: 'Toggle light / dark theme', icon: 'bx-adjust', run: toggleTheme },
    { group: 'Social', label: 'GitHub', icon: 'bxl-github', run: open('https://github.com/imranali14/') },
    { group: 'Social', label: 'LinkedIn', icon: 'bxl-linkedin', run: open('https://www.linkedin.com/in/imranali92110/') },
    { group: 'Social', label: 'WhatsApp', icon: 'bxl-whatsapp', run: open('https://wa.me/923312134450') },
    { group: 'Social', label: 'Call +92 331 2134450', icon: 'bx-phone', run: () => { window.location.href = 'tel:03312134450'; } }
];

let filtered = commands;
let activeIdx = 0;

function renderPalette() {
    const q = pInput.value.trim().toLowerCase();
    filtered = commands.filter(c => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
    activeIdx = Math.min(activeIdx, Math.max(filtered.length - 1, 0));

    if (!filtered.length) {
        pList.innerHTML = '<li class="palette-empty">No results found</li>';
        return;
    }

    let html = '', lastGroup = '';
    filtered.forEach((c, i) => {
        if (c.group !== lastGroup) { html += `<li class="palette-group">${c.group}</li>`; lastGroup = c.group; }
        html += `<li class="palette-item${i === activeIdx ? ' active' : ''}" data-i="${i}"><i class='bx ${c.icon}'></i>${c.label}<span class="pi-hint">${i === activeIdx ? '↵' : ''}</span></li>`;
    });
    pList.innerHTML = html;
    $('.palette-item.active', pList)?.scrollIntoView({ block: 'nearest' });
}

function openPalette() {
    palette.classList.add('open');
    pInput.value = '';
    activeIdx = 0;
    renderPalette();
    setTimeout(() => pInput.focus(), 50);
}

function closePalette() {
    palette.classList.remove('open');
}

function runCommand(i) {
    const cmd = filtered[i];
    if (!cmd) return;
    closePalette();
    cmd.run();
}

$('#openPalette').addEventListener('click', openPalette);
palette.addEventListener('click', e => {
    if (e.target.dataset.close !== undefined) closePalette();
    const item = e.target.closest('.palette-item');
    if (item) runCommand(+item.dataset.i);
});
pList.addEventListener('mousemove', e => {
    const item = e.target.closest('.palette-item');
    if (item && +item.dataset.i !== activeIdx) { activeIdx = +item.dataset.i; renderPalette(); }
});
pInput.addEventListener('input', () => { activeIdx = 0; renderPalette(); });

document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        palette.classList.contains('open') ? closePalette() : openPalette();
        return;
    }
    if (!palette.classList.contains('open')) return;
    if (e.key === 'Escape') closePalette();
    else if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = (activeIdx + 1) % filtered.length; renderPalette(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = (activeIdx - 1 + filtered.length) % filtered.length; renderPalette(); }
    else if (e.key === 'Enter') { e.preventDefault(); runCommand(activeIdx); }
});
