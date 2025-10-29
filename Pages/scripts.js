/* helpers */
const q = sel => document.querySelector(sel);
const qa = sel => Array.from(document.querySelectorAll(sel));

/* year */
q('#year').textContent = new Date().getFullYear();

/* custom cursor */
const cursor = q('#cursor');
document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});
qa('a, button, .btn, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%,-50%) scale(1.7)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
});

/* blob morph animation (simple Perlin-like using sin) */
const blobPath = q('#blob');
let t = 0;
function blobFrame() {
    // generate 8-point blob path from sin waves
    let points = [];
    const rBase = 140;
    for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const r = rBase + Math.sin(t + i * 0.9) * 25 + Math.cos(t * 0.7 + i) * 12;
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
        points.push([x, y]);
    }
    // catmull/Bezier smoothing to path
    let d = '';
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const prev = points[(i - 1 + points.length) % points.length];
        const next = points[(i + 1) % points.length];
        const cx1 = (prev[0] + p[0]) / 2;
        const cy1 = (prev[1] + p[1]) / 2;
        const cx2 = (p[0] + next[0]) / 2;
        const cy2 = (p[1] + next[1]) / 2;
        if (i === 0) d += `M ${cx1.toFixed(2)} ${cy1.toFixed(2)} `;
        d += `Q ${p[0].toFixed(2)} ${p[1].toFixed(2)} ${cx2.toFixed(2)} ${cy2.toFixed(2)} `;
    }
    d += 'Z';
    blobPath.setAttribute('d', d);
    t += 0.02;
    requestAnimationFrame(blobFrame);
}
blobFrame();

/* Intersection Observer reveal */
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('show');
    });
}, { threshold: 0.12 });
qa('.reveal').forEach(el => io.observe(el));


/* Projects filter */
const filterButtons = qa('.filters button');
const projectCards = qa('.project-card');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tag = btn.dataset.filter;
        projectCards.forEach(card => {
            if (tag === 'all' || card.dataset.tags.includes(tag)) {
                card.style.display = '';
                setTimeout(() => card.classList.add('show'), 50);
            } else {
                card.style.display = 'none';
                card.classList.remove('show');
            }
        });
    });
});

/* Simple parallax effect on hero */
document.addEventListener('mousemove', e => {
    const hx = (e.clientX / window.innerWidth - 0.5) * 8;
    const hy = (e.clientY / window.innerHeight - 0.5) * 8;
    const heroCard = q('.hero-card');
    if (heroCard) heroCard.style.transform = `translate3d(${hx}px, ${hy}px, 0)`;
});

/* Nav toggle */
const navToggle = q('.nav-toggle');
const navLinks = q('.nav-links');
navToggle?.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

/* Smooth scroll for internal links */
qa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href.length > 1) {
            e.preventDefault();
            const el = q(href);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* small helper: enable resume download if resume.pdf present */
fetch('resume.pdf', { method: 'HEAD' }).then(r => {
    if (!r.ok) q('#download-resume').style.display = 'none';
}).catch(() => q('#download-resume').style.display = 'none');

/* === Skills Filter Interactivity === */
const techButtons = document.querySelectorAll(".tech-btn");
const techCards = document.querySelectorAll(".tech-card");

techButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        // Remove "active" class from all buttons
        techButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const category = btn.dataset.category;

        techCards.forEach(card => {
            if (category === "all" || card.dataset.category === category) {
                card.classList.remove("hide");
            } else {
                card.classList.add("hide");
            }
        });
    });
});
