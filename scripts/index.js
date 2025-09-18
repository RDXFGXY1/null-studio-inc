/**
 * Index Page JavaScript
 * Modern animations, smooth scrolling, and interactive features
 */

// ===== GLOBAL VARIABLES =====
let isScrolled = false;
let animationObserver = null;

// ===== DOM ELEMENTS =====
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const heroStats = document.querySelectorAll('.stat-number');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
    initializeAnimations();
    initializeSmoothScrolling();
    initializeStatCounters();
    initializeHamburgerMenu();
    initializeDonationInteractions();
    initializeFloatingElements();
});

// ===== NAVBAR FUNCTIONALITY =====
function initializeNavbar() {
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        if (scrollY > 100 && !isScrolled) {
            navbar.classList.add('scrolled');
            isScrolled = true;
        } else if (scrollY <= 100 && isScrolled) {
            navbar.classList.remove('scrolled');
            isScrolled = false;
        }
    });
    
    // Active nav link highlighting
    updateActiveNavLink();
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // Add active class to current nav link
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

// ===== HAMBURGER MENU =====
function initializeHamburgerMenu() {
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

// ===== SMOOTH SCROLLING =====
function initializeSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== ANIMATIONS ===== 
function initializeAnimations() {
    // Safe animations that never hide text
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    // Ensure all elements are visible immediately
    const animatedElements = document.querySelectorAll(
        '.feature-card, .pricing-card, .donation-card, .hero-stats, .support-content'
    );
    
    animatedElements.forEach(element => {
        // Ensure visibility first
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.transform = 'translateY(0)';
        
        // Add subtle hover effects instead of fade animations
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Simple scroll reveal without opacity changes
    animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Ensure element remains visible
                entry.target.style.opacity = '1';
                entry.target.style.visibility = 'visible';
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        animationObserver.observe(element);
    });
}

// ===== STATISTICS COUNTER =====
function initializeStatCounters() {
    const stats = [
        { element: heroStats[0], target: 10000, suffix: '+' },
        { element: heroStats[1], target: 99.9, suffix: '%' },
        { element: heroStats[2], target: 24, suffix: '/7' }
    ];
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });
    
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
    
    function animateCounters() {
        stats.forEach(stat => {
            if (!stat.element) return;
            
            const target = stat.target;
            const suffix = stat.suffix;
            const duration = 2500;
            const start = performance.now();
            
            function updateCounter(timestamp) {
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = easeOutQuart * target;
                
                if (suffix === '%') {
                    stat.element.textContent = current.toFixed(1) + suffix;
                } else if (suffix === '+') {
                    stat.element.textContent = Math.floor(current).toLocaleString() + suffix;
                } else {
                    stat.element.textContent = Math.floor(current) + suffix;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }
            
            requestAnimationFrame(updateCounter);
        });
    }
}

// ===== DONATION INTERACTIONS =====
function initializeDonationInteractions() {
    // Add hover effects to donation cards
    const donationCards = document.querySelectorAll('.donation-card');
    
    donationCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '';
        });
        
        // Add click analytics (if needed)
        card.addEventListener('click', function() {
            const platform = this.querySelector('h4').textContent;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'donation_link_click', {
                    platform: platform,
                    event_category: 'donations'
                });
            }
        });
    });
}

// ===== FLOATING ELEMENTS =====
function initializeFloatingElements() {
    // Add floating animation to the security shield
    const shield = document.querySelector('.security-shield');
    if (shield) {
        let floatAnimation;
        
        function startFloating() {
            let start = performance.now();
            
            function float(timestamp) {
                const elapsed = timestamp - start;
                const y = Math.sin(elapsed * 0.001) * 10;
                shield.style.transform = `translateY(${y}px)`;
                floatAnimation = requestAnimationFrame(float);
            }
            
            floatAnimation = requestAnimationFrame(float);
        }
        
        startFloating();
        
        // Pause animation when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(floatAnimation);
            } else {
                startFloating();
            }
        });
    }
}

// ===== PREMIUM PRICING INTERACTIONS =====
function initializePricingCards() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        const button = card.querySelector('.btn');
        
        if (button) {
            button.addEventListener('click', function(e) {
                const planName = card.querySelector('h3').textContent;
                
                // Analytics tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'pricing_plan_click', {
                        plan_name: planName,
                        event_category: 'premium'
                    });
                }
                
                // Add visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        }
    });
}

// ===== FEATURE CARD INTERACTIONS =====
function initializeFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.feature-icon');
            const items = this.querySelectorAll('.feature-list li');
            
            // Animate icon
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
            
            // Animate list items
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.transform = 'translateX(10px)';
                    item.style.color = 'var(--purple-light)';
                }, index * 50);
            });
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.feature-icon');
            const items = this.querySelectorAll('.feature-list li');
            
            // Reset icon
            if (icon) {
                icon.style.transform = '';
            }
            
            // Reset list items
            items.forEach(item => {
                item.style.transform = '';
                item.style.color = '';
            });
        });
    });
}

// ===== SCROLL-TRIGGERED ANIMATIONS =====
function initializeScrollAnimations() {
    let ticking = false;
    
    function updateScrollAnimations() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax effect for hero background
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
        
        ticking = false;
    }
    
    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateScrollAnimations);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestScrollUpdate);
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
function optimizePerformance() {
    // Use passive event listeners for better scroll performance
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    
    // Preload critical resources
    const criticalLinks = document.querySelectorAll('a[href^="#"]');
    criticalLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            if (target) {
                target.style.willChange = 'scroll-position';
            }
        }, { passive: true });
        
        link.addEventListener('mouseleave', function() {
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            if (target) {
                target.style.willChange = 'auto';
            }
        }, { passive: true });
    });
}

// ===== ADD TO DISCORD BUTTON =====
function initializeDiscordButton() {
    const discordButtons = document.querySelectorAll('a[href*="discord.com"]');
    
    discordButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'discord_invite_click', {
                    event_category: 'bot_invite',
                    event_label: 'header_button'
                });
            }
            
            // Visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// ===== INITIALIZE ALL FEATURES =====
function initializeAllFeatures() {
    initializePricingCards();
    initializeFeatureCards();
    initializeScrollAnimations();
    optimizePerformance();
    initializeDiscordButton();
}

// Initialize additional features when DOM is fully loaded
window.addEventListener('load', initializeAllFeatures);

// ===== CLEANUP ON PAGE UNLOAD =====
window.addEventListener('beforeunload', () => {
    if (animationObserver) {
        animationObserver.disconnect();
    }
});

// ===== EXPORT FUNCTIONS FOR GLOBAL ACCESS =====
window.scrollToSection = function(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
};