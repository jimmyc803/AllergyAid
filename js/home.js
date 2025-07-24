// Service Worker and PWA Installation Code
document.addEventListener('DOMContentLoaded', () => {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered');
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }

  let installPrompt = null;
  const installBtn = document.getElementById('installBtn');

  // Only proceed if install button exists
  if (installBtn) {
    // Initially hide the button (we'll show it when needed)
    installBtn.style.display = 'none';

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      installPrompt = e;
      
      // Always show the button if installation is available
      installBtn.style.display = 'inline-flex';
      installBtn.style.animation = 'fadeIn 0.3s ease-out';
      
      // Mobile adjustments
      if (window.innerWidth <= 768) {
        installBtn.style.width = '100%';
        installBtn.style.marginTop = '0.5rem';
      }
    });

    installBtn.addEventListener('click', installApp);
  }

  function installApp() {
    if (installPrompt) {
      // If PWA isn't installed yet, show the prompt
      installPrompt.prompt();
      installPrompt.userChoice.then(choice => {
        if (choice.outcome === 'accepted') {
          console.log('User accepted install');
        } else {
          console.log('User dismissed install');
        }
        installPrompt = null;
      });
    } else {
      // If already installed, just launch the app
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Already installed - launching PWA');
      } else {
        console.log('Installation not available');
      }
    }
  }

  // This ensures the button stays visible even after installation
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installPrompt = null;
    
    // Optional: Change button text after installation
    if (installBtn) {
      installBtn.innerHTML = '<i class="fas fa-home"></i> Open App';
    }
  });
});