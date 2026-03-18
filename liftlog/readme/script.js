let currentLang = localStorage.getItem('guide-lang') || 'ar';

function setLanguage(lang) {
    currentLang = lang;
    const html = document.documentElement;
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    document.getElementById('langBtn').textContent = lang === 'ar' ? 'English' : '\u0627\u0644\u0639\u0631\u0628\u064a\u0629';

    // Update theme button text
    const isDark = !document.body.getAttribute('data-theme');
    document.getElementById('themeBtn').textContent = lang === 'ar'
        ? (isDark ? '\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0641\u0627\u062a\u062d' : '\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062f\u0627\u0643\u0646')
        : (isDark ? 'Light Mode' : 'Dark Mode');

    if (T[lang]) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (T[lang][key] !== undefined) {
                el.innerHTML = T[lang][key];
            }
        });
    }

    localStorage.setItem('guide-lang', lang);
}

function toggleLang() {
    setLanguage(currentLang === 'ar' ? 'en' : 'ar');
}

function toggleTheme() {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'light') {
        body.removeAttribute('data-theme');
    } else {
        body.setAttribute('data-theme', 'light');
    }
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

window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTop');
    btn.classList.toggle('visible', window.scrollY > 400);
});

const sections = document.querySelectorAll('.section, .subsection[id]');
const tocLinks = document.querySelectorAll('.toc-list a');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            tocLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.toc-list a[href="#${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    });
}, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });
sections.forEach(section => { if (section.id) observer.observe(section); });

// Apply saved language on load
if (currentLang !== 'ar') setLanguage(currentLang);
