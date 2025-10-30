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

(function () {
    const codeEl = document.getElementById('code');
    const lineNumbers = document.getElementById('lineNumbers');
    const playBtn = document.getElementById('play-typed');
    const pauseBtn = document.getElementById('pause-typed');
    const toggleView = document.getElementById('toggle-view');

    // Lines to "type" (you can edit these to reflect your resume content)
    const lines = [
        `// About me - Full Stack & DevOps`,
        `const name = "Atif Mulla";`,
        `const role = "Full Stack Developer & DevOps Enthusiast";`,
        `const tech = ["HTML","CSS","JavaScript","React","Node.js","Express","MySQL","Postgres","Docker","AWS","CI/CD"];`,
        `function summary(){`,
        `  return \`I build scalable, secure web apps, design CI/CD pipelines, and optimize reliable deployments.\`;`,
        `}`,
        `// Education`,
        `// 2021-2025 - B.E in Computer Science - Angadi Institute of Technology and Management`,
        `// Interests: Automation, Performance, UX & Motion Design`
    ];

    // Typing controls
    let currentLine = 0;
    let charIndex = 0;
    let typing = true;
    let paused = false;
    let typingSpeed = 16; // ms per char (increase -> faster)

    function renderLineNumbers(count) {
        const nums = Array.from({ length: count }, (_, i) => (i + 1)).join('\n');
        lineNumbers.textContent = nums;
    }

    function updateCodeDisplay() {
        codeEl.textContent = lines.slice(0, currentLine).join('\n') + (currentLine < lines.length ? '\n' + lines[currentLine].slice(0, charIndex) : '');
        renderLineNumbers(currentLine + 1);
    }

    function syntaxHighlight(raw) {
        // very small token-based highlight using regex
        // order matters — strings first
        let html = raw
            .replace(/(\/\/.*?$)/gm, '<span class="token comment">$1</span>')             // comments
            .replace(/"([^"]*)"/g, '<span class="token string">"$1"</span>')             // strings
            .replace(/\b(const|let|var|function|return|new|if|else)\b/g, '<span class="token keyword">$1</span>')
            .replace(/\b([A-Za-z_]\w*)(?=\s*\()/g, '<span class="token fn">$1</span>')   // function names
            .replace(/\b([A-Z][A-Za-z0-9_]+)\b/g, '<span class="token type">$1</span>'); // types / classes

        // replace special chars for HTML
        html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // but above replace would break spans, so we apply HTML escaping first, then do token wrap differently:
        // simpler approach: rebuild by lines and highlight only using innerHTML carefully
        return html;
    }

    // A safer highlighting approach: convert text to escaped, then apply simple replacements
    function highlightAndRender(fullText) {
        // escape HTML
        const esc = fullText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // apply token regex on escaped text
        let out = esc
            .replace(/(\/\/.*?$)/gm, '<span class="token comment">$1</span>')
            .replace(/"([^"]*)"/g, '<span class="token string">"$1"</span>')
            .replace(/\b(const|let|var|function|return|new|if|else)\b/g, '<span class="token keyword">$1</span>')
            .replace(/\b([A-Za-z_]\w*)(?=\s*\()/g, '<span class="token fn">$1</span>')
            .replace(/\b([A-Z][A-Za-z0-9_]+)\b/g, '<span class="token type">$1</span>');
        codeEl.innerHTML = out;
    }

    function typeStep() {
        if (paused) return;
        if (currentLine >= lines.length) {
            // finished typing — apply highlight and stop
            highlightAndRender(lines.join('\n'));
            return;
        }
        if (charIndex < lines[currentLine].length) {
            charIndex++;
            updateCodeDisplay();
            setTimeout(typeStep, typingSpeed);
        } else {
            // move to next line
            currentLine++;
            charIndex = 0;
            updateCodeDisplay();
            setTimeout(typeStep, typingSpeed + 60);
        }
    }

    function startTyping() {
        paused = false;
        if (currentLine >= lines.length) {
            // restart
            currentLine = 0; charIndex = 0;
            codeEl.textContent = '';
        }
        typeStep();
    }

    function pauseTyping() {
        paused = true;
    }

    // Buttons
    playBtn.addEventListener('click', () => { startTyping(); });
    pauseBtn.addEventListener('click', () => { pauseTyping(); });

    // Toggle view: make readable formatted summary or editor
    let viewMode = 'editor';
    toggleView.addEventListener('click', () => {
        if (viewMode === 'editor') {
            // show readable summary in the right panel (or replace code with formatted text)
            codeEl.innerHTML = `<div style="color:var(--muted);font-family:inherit;">
          <strong>Your Name</strong><br/>
          Full Stack Developer & DevOps Enthusiast — builds scalable cloud-native apps and CI/CD pipelines.
        </div>`;
            viewMode = 'read';
            toggleView.textContent = 'Code';
        } else {
            // restore typed editor content (highlighted)
            highlightAndRender(lines.join('\n'));
            viewMode = 'editor';
            toggleView.textContent = 'View';
        }
    });

    // initialize line numbers and start typing automatically
    renderLineNumbers(1);
    startTyping();

    // allow keyboard play/pause (space toggles)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && document.activeElement !== codeEl) {
            e.preventDefault();
            paused = !paused;
            if (!paused) typeStep();
        }
    });

})();
