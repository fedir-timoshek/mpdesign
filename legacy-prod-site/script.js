// ========================================
// Witraz Dealer Website - Main JavaScript
// ========================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Mobile Menu Toggle =====
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // ===== Active Navigation Highlighting =====
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });

    // ===== Smooth Scroll for Anchor Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    // ===== Contact Form Submission =====
    // ===== Contact Form - DISABLED for Google Sheets integration =====
    // Form now submits directly to Google Apps Script
    /*
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                message: document.getElementById('message').value
            };
            
            // Validate form
            if (!formData.name || !formData.email || !formData.message) {
                showNotification('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }

            if (!isValidEmail(formData.email)) {
                showNotification('Veuillez entrer une adresse email valide', 'error');
                return;
            }

            // Here you would typically send the form data to a server
            // For now, we'll just show a success message
            showNotification(`Merci, ${formData.name}! Nous avons reçu votre message et vous contacterons bientôt.`, 'success');
            
            // Reset form
            contactForm.reset();
        });
    }
    */

    // ===== Product Card Animation on Scroll =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // ===== Header Scroll Effect =====
    let lastScroll = 0;
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.padding = '0.5rem 0';
        } else {
            header.style.padding = '1rem 0';
        }
        
        lastScroll = currentScroll;
    });

    // ===== Image Lazy Loading Enhancement =====
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

});

// ===== Helper Functions =====

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show notification message
 */
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#c9a961' : '#d32f2f'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
        max-width: 400px;
        font-family: 'Montserrat', sans-serif;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Append to body
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.5s ease-out reverse';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 500);
    }, 5000);
}

/**
 * Scroll to top function
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ===== Back to Top Button =====
window.addEventListener('scroll', function() {
    let backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'backToTop';
        backToTopBtn.innerHTML = '↑';
        backToTopBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #c9a961;
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            z-index: 999;
            transition: all 0.3s ease;
            display: none;
        `;
        backToTopBtn.onclick = scrollToTop;
        document.body.appendChild(backToTopBtn);
    }
    
    if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

// ===== Product Filter (for product listing pages) =====
function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
            product.style.display = 'block';
            // Re-trigger animation
            product.style.opacity = '0';
            product.style.transform = 'translateY(30px)';
            setTimeout(() => {
                product.style.opacity = '1';
                product.style.transform = 'translateY(0)';
            }, 100);
        } else {
            product.style.display = 'none';
        }
    });
}

// ===== Newsletter Form (if applicable) =====
// Newsletter form not implemented - commented out to avoid errors
/*
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;

        if (isValidEmail(email)) {
            showNotification('Merci de votre inscription à notre newsletter!', 'success');
            this.reset();
        } else {
            showNotification('Veuillez entrer une adresse email valide', 'error');
        }
    });
}
*/

// ==========================================
// MPDESIGN LOGO SCROLL EFFECT
// ==========================================

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const scrollPosition = window.scrollY;
    
    if (scrollPosition > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// MPDESIGN LOGO PARTICLE EFFECT
document.addEventListener('DOMContentLoaded', function() {
    const mpdesignLogo = document.querySelector('.mpdesign-logo');
    
    if (mpdesignLogo) {
        mpdesignLogo.addEventListener('click', function(e) {
            // Create particle explosion effect
            for (let i = 0; i < 12; i++) {
                createParticle(e.clientX, e.clientY);
            }
        });
    }
    
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.borderRadius = '50%';
        particle.style.background = 'linear-gradient(45deg, #c69d5f, #f4d03f)';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '10000';
        particle.style.boxShadow = '0 0 10px #c69d5f';
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * Math.random());
        const velocity = 50 + Math.random() * 50;
        const lifetime = 1000 + Math.random() * 500;
        
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / lifetime;
            
            if (progress < 1) {
                const currentX = x + vx * progress;
                const currentY = y + vy * progress + (progress * progress * 100);
                const opacity = 1 - progress;
                const scale = 1 - progress * 0.5;
                
                particle.style.left = currentX + 'px';
                particle.style.top = currentY + 'px';
                particle.style.opacity = opacity;
                particle.style.transform = `scale(${scale})`;
                
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        }
        
        animate();
    }
});


// ==========================================
// LANGUAGE SWITCHER
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Language switcher initialized');
    
    // Language switcher buttons - DECLARE FIRST
    const langButtons = document.querySelectorAll('.lang-btn');
    console.log('Found language buttons:', langButtons.length);
    
    // Get saved language or default to French
    let currentLang = localStorage.getItem('selectedLanguage') || 'fr';
    console.log('Current language:', currentLang);
    
    // Set initial language
    setLanguage(currentLang);
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            console.log('Switching to language:', lang);
            setLanguage(lang);
            
            // Save to localStorage
            localStorage.setItem('selectedLanguage', lang);
            
            // Update active button
            langButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    function setLanguage(lang) {
        console.log('Setting language to:', lang);
        // Set body attribute
        document.body.setAttribute('data-current-lang', lang);
        
        // Update active button
        langButtons.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
});

// ==========================================
// PRODUCT IMAGE GALLERY (Centralized)
// ==========================================

/**
 * Change main product image when thumbnail is clicked
 * Used on all product detail pages
 */
function changeMainImage(thumbnail) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage && thumbnail && thumbnail.src) {
        mainImage.src = thumbnail.src;

        // Remove active class from all thumbnails
        const thumbnails = document.querySelectorAll('.image-thumbnails img');
        thumbnails.forEach(img => img.classList.remove('active'));

        // Add active class to clicked thumbnail
        thumbnail.classList.add('active');
    }
}

// Make function globally available for inline onclick handlers
window.changeMainImage = changeMainImage;

// ==========================================
// CONTACT FORM AJAX SUBMISSION
// ==========================================

document.querySelectorAll('#contactForm-fr, #contactForm-de').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const submitBtn = form.querySelector('.submit-button');
        const originalText = submitBtn.textContent;
        const lang = form.querySelector('[name="_language"]').value;

        const name = String(form.querySelector('[name="name"]').value || '').trim();
        const phone = String(form.querySelector('[name="phone"]').value || '').trim();
        const email = String(form.querySelector('[name="email"]').value || '').trim();
        const message = String(form.querySelector('[name="message"]').value || '').trim();
        const consent = Boolean(form.querySelector('[name="consent"]') && form.querySelector('[name="consent"]').checked);
        const honeypot = String(form.querySelector('[name="honeypot"]')?.value || '').trim();

        // Reset any previous messages
        form.parentNode.querySelectorAll('.form-success-message, .form-error-message').forEach(node => node.remove());

        if (!name || !email || !message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error-message';
            errorDiv.innerHTML = lang === 'fr'
                ? '<h3>Erreur</h3><p>Merci de renseigner votre nom, email et message.</p>'
                : '<h3>Fehler</h3><p>Bitte Name, E-Mail und Nachricht ausfüllen.</p>';
            form.parentNode.insertBefore(errorDiv, form.nextSibling);
            return;
        }

        if (!consent) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error-message';
            errorDiv.innerHTML = lang === 'fr'
                ? '<h3>Consentement requis</h3><p>Merci de confirmer que nous pouvons vous contacter concernant votre demande.</p>'
                : '<h3>Einwilligung erforderlich</h3><p>Bitte bestätigen Sie, dass wir Sie zu Ihrer Anfrage kontaktieren dürfen.</p>';
            form.parentNode.insertBefore(errorDiv, form.nextSibling);
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = lang === 'fr' ? 'Envoi en cours...' : 'Wird gesendet...';

        const sourcePage = window.location.pathname || '/';
        const match = sourcePage.match(/product-([a-z0-9-]+)\.html$/i);
        const productSlug = match ? match[1].toLowerCase() : '';

        const payload = {
            locale: lang,
            sourcePage: sourcePage,
            productSlug: productSlug,
            name: name,
            phone: phone,
            email: email,
            message: message,
            consent: true,
            honeypot: honeypot
        };

        // Google Apps Script Web Apps don't support OPTIONS preflight.
        // Sending JSON as a plain string avoids preflight and still parses as JSON server-side.
        fetch(form.action, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        .then(response => response.json().catch(() => null).then(body => ({ response, body })))
        .then(({ response, body }) => {
            if (!response.ok || !body || body.ok !== true) {
                throw new Error(body?.errorCode || `HTTP_${response.status}`);
            }

            // Hide form and show success message
            form.style.display = 'none';

            const successDiv = document.createElement('div');
            successDiv.className = 'form-success-message';
            successDiv.innerHTML = lang === 'fr'
                ? '<h3>Merci!</h3><p>Votre message a été envoyé avec succès. Nous vous contacterons bientôt.</p>'
                : '<h3>Vielen Dank!</h3><p>Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns bald bei Ihnen melden.</p>';

            form.parentNode.insertBefore(successDiv, form.nextSibling);
            form.reset();
        })
        .catch(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error-message';
            errorDiv.innerHTML = lang === 'fr'
                ? '<h3>Erreur</h3><p>Impossible d\'envoyer la demande pour le moment. Utilisez email ou téléphone en attendant.</p>'
                : '<h3>Fehler</h3><p>Die Anfrage konnte aktuell nicht gesendet werden. Bitte nutzen Sie E-Mail oder Telefon.</p>';

            form.parentNode.insertBefore(errorDiv, form.nextSibling);
        });
    });
});
