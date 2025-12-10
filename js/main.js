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
