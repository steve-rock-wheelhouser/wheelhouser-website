// Register service worker for minimal PWA offline support
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js')
			.then((reg) => {
				console.log('Service worker registered.', reg);
				if (reg.waiting) {
					console.log('SW waiting to activate.');
				}
				reg.addEventListener('updatefound', () => {
					const newWorker = reg.installing;
					newWorker.addEventListener('statechange', () => {
						console.log('SW state:', newWorker.state);
					});
				});
			})
			.catch((err) => console.error('SW registration failed:', err));
	});
}

// Optional: simple beforeinstallprompt handler to allow app install UI later
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
	e.preventDefault();
	deferredPrompt = e;
	console.log('beforeinstallprompt fired');
});

// Robust clipboard copy with visual feedback for terminal command blocks
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
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showCopiedState(btn);
    } catch (err) {
        console.error("Failed to copy:", err);
    }
    document.body.removeChild(textArea);
}

function showCopiedState(btn) {
    const label = btn.querySelector('.copy-label') || btn;
    const originalText = label.textContent;
    label.textContent = "Copied!";
    btn.classList.add('copied');
    setTimeout(() => {
        label.textContent = originalText;
        btn.classList.remove('copied');
    }, 2000);
}
