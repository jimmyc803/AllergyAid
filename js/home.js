document.addEventListener('DOMContentLoaded', function() {
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('Service Worker registered');
                
                // Check for updates every hour
                setInterval(function() {
                    registration.update().catch(function(err) {
                        console.log('Update check failed:', err);
                    });
                }, 60 * 60 * 1000);
                
                // Listen for controller change
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                    window.location.reload();
                });
            })
            .catch(function(error) {
                console.log('Service Worker registration failed:', error);
            });
    }

    // Cache Update Functionality
    function updateCache() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration()
                .then(function(reg) {
                    if (reg) {
                        return reg.update();
                    }
                })
                .then(function() {
                    console.log('Service Worker updated');
                    window.location.reload();
                })
                .catch(function(err) {
                    console.log('Update failed:', err);
                });
        }
    }

    // Create update banner
    var updateBanner = document.createElement('div');
    updateBanner.innerHTML = '<div class="update-banner" style="display:none; position: fixed; top: 0; left: 0; width: 100%; background: var(--primary-light); padding: 10px; text-align: center; z-index: 1000;">' +
                             '<p style="margin: 0; display: inline-block;">New version available!</p>' +
                             '<button id="updateBtn" style="margin-left: 10px; background: var(--primary); color: white; border: none; padding: 5px 15px; border-radius: 20px; cursor: pointer;">Update Now</button>' +
                             '</div>';
    
    document.body.insertBefore(updateBanner, document.body.firstChild);
    
    var updateBtn = document.getElementById('updateBtn');
    if (updateBtn) {
        updateBtn.addEventListener('click', updateCache);
    }

    // Check for updates on focus
    window.addEventListener('focus', function() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration()
                .then(function(reg) {
                    if (reg) {
                        return reg.update();
                    }
                })
                .catch(function(err) {
                    console.log('Focus update check failed:', err);
                });
        }
    });

    // PWA Installation Logic
    var installPrompt = null;
    var installBtn = document.getElementById('installBtn');

    if (installBtn) {
        installBtn.style.display = 'none';

        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            installPrompt = e;
            installBtn.style.display = 'inline-flex';
            installBtn.style.animation = 'fadeIn 0.3s ease-out';
            
            if (window.innerWidth <= 768) {
                installBtn.style.width = '100%';
                installBtn.style.marginTop = '0.5rem';
            }
        });

        installBtn.addEventListener('click', function() {
            if (installPrompt) {
                installPrompt.prompt();
                installPrompt.userChoice.then(function(choice) {
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
        });
    }

    window.addEventListener('appinstalled', function() {
        console.log('PWA was installed');
        installPrompt = null;
        if (installBtn) {
            installBtn.innerHTML = '<i class="fas fa-home"></i> Open App';
        }
    });

    // Restaurant Card Animations
    var cards = document.querySelectorAll('.restaurant-card');
    
    if (cards.length > 0) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(function(card, index) {
            card.style.animationDelay = (index * 0.1) + 's';
            observer.observe(card);
        });
    }

    // Mobile Restaurant Display Fix
    function fixMobileRestaurantDisplay() {
        if (window.innerWidth <= 600) {
            var restaurantCards = document.querySelectorAll('.restaurant-card');
            restaurantCards.forEach(function(card) {
                if (card) {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                    card.style.transform = 'none';
                }
            });
        }
    }

    fixMobileRestaurantDisplay();
    window.addEventListener('resize', fixMobileRestaurantDisplay);
});