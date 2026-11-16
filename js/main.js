// ==========================================================================
// Wheelhouser LLC — Core Site Interactions & Progressive Enhancements
// ==========================================================================

// 1. Register Service Worker for minimal PWA offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((reg) => {
                if (reg.waiting) {
                    console.log('SW waiting to activate.');
                }
            })
            .catch((err) => console.error('SW registration failed:', err));
    });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

// 2. Mobile Navigation Drawer Toggle
function initMobileNavigation() {
    const headerContainer = document.querySelector('.site-header .container');
    const nav = document.querySelector('.site-header nav');
    if (!headerContainer || !nav) return;

    let toggleBtn = document.getElementById('mobile-menu-toggle');
    if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.id = 'mobile-menu-toggle';
        toggleBtn.className = 'mobile-menu-toggle';
        toggleBtn.type = 'button';
        toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        headerContainer.insertBefore(toggleBtn, nav);
    }

    const setOpen = (open) => {
        nav.classList.toggle('nav-open', open);
        toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggleBtn.innerHTML = open
            ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
            : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    };

    toggleBtn.addEventListener('click', () => {
        setOpen(!nav.classList.contains('nav-open'));
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
            setOpen(false);
        }
    });
}

// 3. Forefront Workstation Spotlight Switcher & Live Version Hydration
function initWorkstationSpotlight() {
    const tabs = document.querySelectorAll('.workstation-tab[data-target]');
    const cards = document.querySelectorAll('.forefront-card[id]');
    if (tabs.length > 0 && cards.length > 0) {
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('data-target');
                tabs.forEach((t) => t.classList.remove('active'));
                cards.forEach((c) => c.classList.remove('spotlight-active'));
                tab.classList.add('active');
                const targetCard = document.getElementById(targetId);
                if (targetCard) {
                    targetCard.classList.add('spotlight-active');
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });
    }

    // Live-hydrate Forefront 4 version badges from /updates/<app>/version.json
    const feedMap = [
        { slug: 'web-browser', badgeIds: ['ver-web-browser', 'tab-ver-web-browser'] },
        { slug: 'file-browser', badgeIds: ['ver-file-browser', 'tab-ver-file-browser'] },
        { slug: 'text-editor', badgeIds: ['ver-text-editor', 'tab-ver-text-editor'] },
        { slug: 'terminal', badgeIds: ['ver-terminal', 'tab-ver-terminal'] }
    ];

    feedMap.forEach(async ({ slug, badgeIds }) => {
        const targets = badgeIds.map((id) => document.getElementById(id)).filter(Boolean);
        if (targets.length === 0) return;
        try {
            const resp = await fetch(`updates/${slug}/version.json`);
            if (!resp.ok) return;
            const data = await resp.json();
            const ver = data.windows?.latest_version
                || data.macos_arm64?.latest_version
                || data.macos?.latest_version
                || data.linux?.latest_version;
            if (ver) {
                targets.forEach((el) => {
                    el.textContent = `v${ver}`;
                });
            }
        } catch (_) {
            // Keep static HTML fallback version cleanly
        }
    });
}

// 4. Interactive Custom Desktop App Project Brief Composer (services.html)
function initProjectBriefComposer() {
    const form = document.getElementById('project-brief-form');
    if (!form) return;

    const buildBriefPayload = () => {
        const name = (document.getElementById('client-name')?.value || '').trim() || 'Prospective Client';
        const company = (document.getElementById('client-company')?.value || '').trim() || 'Not specified';
        const email = (document.getElementById('client-email')?.value || '').trim() || 'Not specified';
        const category = document.getElementById('project-category')?.value || 'Custom Cross-Platform Desktop Application';
        const timeline = document.getElementById('project-timeline')?.value || 'Flexible / Exploratory';
        const summary = (document.getElementById('project-summary')?.value || '').trim() || 'Interested in discussing a custom cross-platform desktop application.';

        const selectedOS = Array.from(form.querySelectorAll('input[name="target_os"]:checked'))
            .map((cb) => cb.value);
        const platforms = selectedOS.length > 0 ? selectedOS.join(', ') : 'Windows, macOS, Linux';

        const subject = `Custom Desktop App Inquiry — ${company !== 'Not specified' ? company : name}`;
        const body = [
            `Hello Steve,`,
            ``,
            `We would like to discuss commissioning a custom cross-platform desktop application with Wheelhouser LLC.`,
            ``,
            `--- EXECUTIVE PROJECT BRIEF ---`,
            `Contact Name: ${name}`,
            `Organization: ${company}`,
            `Reply Email: ${email}`,
            `Application Type: ${category}`,
            `Target Platforms: ${platforms}`,
            `Target Timeline: ${timeline}`,
            ``,
            `Project Vision & Requirements:`,
            `${summary}`,
            `-------------------------------`
        ].join('\n');

        return { subject, body };
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const { subject, body } = buildBriefPayload();
        const mailtoUrl = `mailto:steve.rock@wheelhouser.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
    });

    const copyBriefBtn = document.getElementById('copy-brief-btn');
    if (copyBriefBtn) {
        copyBriefBtn.addEventListener('click', () => {
            const { subject, body } = buildBriefPayload();
            const fullText = `To: steve.rock@wheelhouser.com\nSubject: ${subject}\n\n${body}`;
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(fullText).then(() => showCopiedState(copyBriefBtn)).catch(() => fallbackCopy(fullText, copyBriefBtn));
            } else {
                fallbackCopy(fullText, copyBriefBtn);
            }
        });
    }
}

// 5. Robust clipboard copy with visual feedback for terminal command blocks
function copyCodeSnippet(elementId, btn) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = (el.innerText || el.textContent || '').trim();
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopiedState(btn);
        }).catch(() => {
            fallbackCopy(text, btn);
        });
    } else {
        fallbackCopy(text, btn);
    }
}

function fallbackCopy(text, btn) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showCopiedState(btn);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
    document.body.removeChild(textArea);
}

function showCopiedState(btn) {
    const label = btn.querySelector('.copy-label') || btn;
    const originalText = label.textContent;
    label.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
        label.textContent = originalText;
        btn.classList.remove('copied');
    }, 2200);
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileNavigation();
    initWorkstationSpotlight();
    initProjectBriefComposer();
});
