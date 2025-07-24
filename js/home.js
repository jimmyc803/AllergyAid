document.addEventListener('DOMContentLoaded', () => {

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

 
  if (installBtn) {
 
    installBtn.style.display = 'none';

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      installPrompt = e;
      
   
      installBtn.style.display = 'inline-flex';
      installBtn.style.animation = 'fadeIn 0.3s ease-out';
      
   
      if (window.innerWidth <= 768) {
        installBtn.style.width = '100%';
        installBtn.style.marginTop = '0.5rem';
      }
    });

    installBtn.addEventListener('click', installApp);
  }

  function installApp() {
    if (installPrompt) {
   
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

      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Already installed - launching PWA');
      } else {
        console.log('Installation not available');
      }
    }
  }


  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installPrompt = null;
    

    if (installBtn) {
      installBtn.innerHTML = '<i class="fas fa-home"></i> Open App';
    }
  });
});