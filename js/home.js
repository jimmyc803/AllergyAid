document.addEventListener('DOMContentLoaded', () => {
  // ======================
  // Service Worker Registration
  // ======================
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered');
        
        // Check for updates every hour
        setInterval(() => registration.update(), 60 * 60 * 1000);
        
        // Listen for controller change (update available)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }

  // ======================
  // Cache Update Functionality
  // ======================
  const updateCache = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.update().then(() => {
            console.log('Service Worker updated');
            window.location.reload();
          });
        }
      });
    }
  };

  // Add update banner (only shows when update available)
  const updateBanner = document.createElement('div');
  updateBanner.innerHTML = `
    <div class="update-banner" style="display:none; position: fixed; top: 0; left: 0; width: 100%; background: var(--primary-light); padding: 10px; text-align: center; z-index: 1000;">
      <p style="margin: 0; display: inline-block;">New version available!</p>
      <button id="updateBtn" style="margin-left: 10px; background: var(--primary); color: white; border: none; padding: 5px 15px; border-radius: 20px; cursor: pointer;">Update Now</button>
    </div>
  `;
  document.body.prepend(updateBanner);
  
  document.getElementById('updateBtn')?.addEventListener('click', updateCache);

  // Check for updates when page gains focus
  window.addEventListener('focus', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        reg?.update();
      });
    }
  });

  // ======================
  // PWA Installation Logic
  // ======================
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
          installBtn.classList.add('installed');
          installBtn.innerHTML = '<i class="fas fa-home"></i> Open App';
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

  // ======================
  // Restaurant Card Animations
  // ======================
  const cards = document.querySelectorAll('.restaurant-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = `fadeInUp 0.6s ease-out forwards`;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    observer.observe(card);
  });
});