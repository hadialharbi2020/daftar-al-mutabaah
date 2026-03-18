let currentLang = localStorage.getItem('guide-lang') || 'ar';

function setLanguage(lang) {
    currentLang = lang;
    const html = document.documentElement;
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.getElementById('langBtn').textContent = lang === 'ar' ? 'English' : '\u0627\u0644\u0639\u0631\u0628\u064a\u0629';
    const isDark = !document.body.getAttribute('data-theme');
    document.getElementById('themeBtn').textContent = lang === 'ar'
        ? (isDark ? '\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0641\u0627\u062a\u062d' : '\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062f\u0627\u0643\u0646')
        : (isDark ? 'Light Mode' : 'Dark Mode');
    if (T[lang]) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (T[lang][key] !== undefined) el.innerHTML = T[lang][key];
        });
    }
    // Update search placeholder
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = lang === 'ar' ? '\u{1F50D} ابحث في الدليل...' : '\u{1F50D} Search the guide...';
    }
    localStorage.setItem('guide-lang', lang);

    // Re-init Lucide icons (in case innerHTML replaced them)
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleLang() { setLanguage(currentLang === 'ar' ? 'en' : 'ar'); }

function toggleTheme() {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'light') body.removeAttribute('data-theme');
    else body.setAttribute('data-theme', 'light');
    const isDark = !body.getAttribute('data-theme');
    document.getElementById('themeBtn').textContent = currentLang === 'ar'
        ? (isDark ? '\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0641\u0627\u062a\u062d' : '\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062f\u0627\u0643\u0646')
        : (isDark ? 'Light Mode' : 'Dark Mode');
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('mobile-open'); }
document.querySelectorAll('.toc-list a').forEach(link => {
    link.addEventListener('click', () => { document.getElementById('sidebar').classList.remove('mobile-open'); });
});

function toggleFaq(btn) { btn.parentElement.classList.toggle('open'); }

// === Reading Progress Bar + Circle ===
const circumference = 2 * Math.PI * 20; // r=20
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const pct = Math.round(progress);

    // Top bar
    document.getElementById('readingProgress').style.width = progress + '%';

    // Circle
    const circle = document.getElementById('progressCircle');
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');

    circle.classList.toggle('visible', scrollTop > 300);
    fill.style.strokeDashoffset = circumference - (circumference * progress / 100);
    text.textContent = pct + '%';
});

// === Active TOC Highlight ===
const sections = document.querySelectorAll('.section, .subsection[id]');
const tocLinks = document.querySelectorAll('.toc-list a');
const tocObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            tocLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.toc-list a[href="#${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    });
}, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });
sections.forEach(section => { if (section.id) tocObserver.observe(section); });

// === Search ===
let searchTimeout;
function handleSearch(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => performSearch(query), 200);
}

function performSearch(query) {
    // Remove old highlights
    document.querySelectorAll('.search-highlight').forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });

    const noResults = document.getElementById('searchNoResults');
    const allSections = document.querySelectorAll('.section');

    if (!query || query.trim().length < 2) {
        allSections.forEach(s => s.style.display = '');
        noResults.style.display = 'none';
        return;
    }

    const q = query.trim().toLowerCase();
    let found = 0;

    allSections.forEach(section => {
        const text = section.textContent.toLowerCase();
        if (text.includes(q)) {
            section.style.display = '';
            found++;
            // Highlight matches in visible text nodes
            highlightInElement(section, query.trim());
        } else {
            section.style.display = 'none';
        }
    });

    noResults.style.display = found === 0 ? 'block' : 'none';

    // Scroll to first matching section
    if (found > 0) {
        const firstVisible = [...allSections].find(s => s.style.display !== 'none');
        if (firstVisible) firstVisible.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function highlightInElement(el, query) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    nodes.forEach(node => {
        if (node.parentElement.closest('.search-box, .nav, script, style')) return;
        if (regex.test(node.textContent)) {
            const span = document.createElement('span');
            span.innerHTML = node.textContent.replace(regex, '<mark class="search-highlight">$1</mark>');
            node.parentNode.replaceChild(span, node);
        }
    });
}

// === Keyboard Shortcuts ===
document.addEventListener('keydown', (e) => {
    const searchInput = document.getElementById('searchInput');
    const isTyping = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';

    // "/" to focus search (when not already typing)
    if (e.key === '/' && !isTyping) {
        e.preventDefault();
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Escape to clear search and blur
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        handleSearch('');
        searchInput.blur();
    }

    // Escape to close mobile sidebar
    if (e.key === 'Escape') {
        document.getElementById('sidebar').classList.remove('mobile-open');
    }
});

// Apply saved language on load
if (currentLang !== 'ar') setLanguage(currentLang);
