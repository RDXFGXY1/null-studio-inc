/**
 * Features Page JavaScript
 * Interactive tabs, dashboard animations, mobile menu, and dynamic content
 */

// ===== GLOBAL VARIABLES =====
let isScrolled = false;
let animationObserver = null;
let dashboardInterval = null;
let currentTime = new Date();
let dashboardMetrics = {
    threatsBlocked: 2847,
    uptime: 99.9,
    responseTime: 0.3
};

// ===== DOM ELEMENTS =====
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const dashboardTime = document.getElementById('dashboard-time');
const detailTabs = document.querySelectorAll('.detail-tab');
const detailPanels = document.querySelectorAll('.detail-panel');
const securityDashboard = document.querySelector('.security-dashboard');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
    initializeAnimations();
    initializeSmoothScrolling();
    initializeHamburgerMenu();
    initializeFeatureTabs();
    initializeSecurityDashboard();
    initializeInteractiveElements();
    initializeComparisionTable();
    initializeAnalytics();
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
        const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);
        
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

// ===== FEATURE TABS FUNCTIONALITY =====
function initializeFeatureTabs() {
    // Handle tab switching for each feature showcase
    const featureShowcases = document.querySelectorAll('.feature-showcase');
    
    featureShowcases.forEach(showcase => {
        const tabs = showcase.querySelectorAll('.detail-tab');
        const panels = showcase.querySelectorAll('.detail-panel');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetPanel = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and panels in this showcase
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding panel
                const panel = showcase.querySelector(`[data-panel="${targetPanel}"]`);
                if (panel) {
                    panel.classList.add('active');
                    
                    // Animate panel entrance
                    panel.style.opacity = '0';
                    panel.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        panel.style.opacity = '1';
                        panel.style.transform = 'translateY(0)';
                        panel.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                    }, 50);
                }
                
                // Track tab interaction
                if (typeof gtag !== 'undefined') {
                    const featureName = showcase.querySelector('.feature-meta h3').textContent;
                    gtag('event', 'feature_tab_click', {
                        feature_name: featureName,
                        tab_name: targetPanel,
                        event_category: 'features'
                    });
                }
            });
        });
    });
}

// ===== SECURITY DASHBOARD =====
function initializeSecurityDashboard() {
    if (dashboardTime) {
        // Update time every second
        function updateDashboardTime() {
            currentTime = new Date();
            const timeString = currentTime.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            dashboardTime.textContent = timeString;
        }
        
        updateDashboardTime();
        setInterval(updateDashboardTime, 1000);
    }
    
    // Animate dashboard metrics on scroll
    if (securityDashboard) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateDashboardMetrics();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(securityDashboard);
    }
    
    // Add live activity simulation
    initializeLiveActivity();
}

function animateDashboardMetrics() {
    const metricValues = document.querySelectorAll('.dashboard-metrics .metric-value');
    
    metricValues.forEach((element, index) => {
        const finalValue = element.textContent;
        element.textContent = '0';
        
        setTimeout(() => {
            animateValue(element, 0, extractNumber(finalValue), 2000, index);
        }, index * 200);
    });
}

function extractNumber(str) {
    const match = str.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
}

function animateValue(element, start, end, duration, type) {
    const startTime = performance.now();
    const originalText = element.textContent;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * easeOutQuart;
        
        if (type === 0) { // Threats blocked
            element.textContent = Math.floor(current).toLocaleString();
        } else if (type === 1) { // Uptime
            element.textContent = current.toFixed(1) + '%';
        } else if (type === 2) { // Response time
            element.textContent = current.toFixed(1) + 's';
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function initializeLiveActivity() {
    const activityContainer = document.querySelector('.dashboard-activity');
    if (!activityContainer) return;
    
    const activities = [
        { icon: 'fas fa-shield-check', text: 'Blocked malicious URL', color: 'var(--success)' },
        { icon: 'fas fa-ban', text: 'Spam message filtered', color: 'var(--warning)' },
        { icon: 'fas fa-eye', text: 'Activity logged', color: 'var(--info)' },
        { icon: 'fas fa-user-shield', text: 'User verified', color: 'var(--success)' },
        { icon: 'fas fa-lock', text: 'Channel secured', color: 'var(--purple-primary)' },
        { icon: 'fas fa-search', text: 'URL scanned', color: 'var(--info)' }
    ];
    
    function addActivity() {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        const timeAgo = Math.floor(Math.random() * 60) + 1;
        
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.innerHTML = `
            <i class="${activity.icon}" style="color: ${activity.color}"></i>
            <span>${activity.text}</span>
            <time>${timeAgo}s ago</time>
        `;
        
        // Add with animation
        activityElement.style.opacity = '0';
        activityElement.style.transform = 'translateX(-20px)';
        activityContainer.insertBefore(activityElement, activityContainer.firstChild);
        
        setTimeout(() => {
            activityElement.style.opacity = '1';
            activityElement.style.transform = 'translateX(0)';
            activityElement.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        }, 50);
        
        // Remove oldest activity if more than 3
        const activityItems = activityContainer.querySelectorAll('.activity-item');
        if (activityItems.length > 3) {
            const lastItem = activityItems[activityItems.length - 1];
            lastItem.style.opacity = '0';
            lastItem.style.transform = 'translateX(20px)';
            setTimeout(() => {
                if (lastItem.parentNode) {
                    lastItem.parentNode.removeChild(lastItem);
                }
            }, 300);
        }
    }
    
    // Add activity every 3-8 seconds
    function scheduleNextActivity() {
        const delay = (Math.random() * 5000) + 3000; // 3-8 seconds
        setTimeout(() => {
            addActivity();
            scheduleNextActivity();
        }, delay);
    }
    
    // Start after initial load
    setTimeout(scheduleNextActivity, 2000);
}

// ===== COMPARISON TABLE INTERACTIONS =====
function initializeComparisionTable() {
    const table = document.querySelector('.comparison-table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    const headers = table.querySelectorAll('thead th');
    
    // Add hover effects to table rows
    rows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
            this.style.transform = 'scale(1.01)';
            this.style.transition = 'all 0.2s ease';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
            this.style.transform = '';
        });
    });
    
    // Add click effects to plan columns
    const planColumns = table.querySelectorAll('.plan-column');
    planColumns.forEach(column => {
        column.addEventListener('click', function() {
            const planName = this.textContent.trim();
            
            // Track plan interest
            if (typeof gtag !== 'undefined') {
                gtag('event', 'plan_column_click', {
                    plan_name: planName,
                    event_category: 'pricing'
                });
            }
            
            // Visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Make table responsive with horizontal scroll indicator
    const tableWrapper = document.querySelector('.comparison-table-wrapper');
    if (tableWrapper) {
        let isScrollable = tableWrapper.scrollWidth > tableWrapper.clientWidth;
        
        if (isScrollable) {
            tableWrapper.classList.add('scrollable');
            
            // Add scroll indicators
            const scrollIndicator = document.createElement('div');
            scrollIndicator.className = 'scroll-indicator';
            scrollIndicator.innerHTML = '<i class="fas fa-chevron-right"></i> Scroll for more';
            tableWrapper.appendChild(scrollIndicator);
            
            tableWrapper.addEventListener('scroll', function() {
                const isAtEnd = this.scrollLeft + this.clientWidth >= this.scrollWidth - 1;
                scrollIndicator.style.opacity = isAtEnd ? '0' : '1';
            });
        }
    }
}

// ===== INTERACTIVE ELEMENTS =====
function initializeInteractiveElements() {
    // Feature showcase hover effects
    const featureShowcases = document.querySelectorAll('.feature-showcase');
    featureShowcases.forEach(showcase => {
        showcase.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        showcase.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = '';
            }
        });
    });
    
    // Advanced feature card interactions
    const advancedFeatures = document.querySelectorAll('.advanced-feature');
    advancedFeatures.forEach(feature => {
        feature.addEventListener('mouseenter', function() {
            const metrics = this.querySelectorAll('.metric-item');
            metrics.forEach((metric, index) => {
                setTimeout(() => {
                    metric.style.transform = 'translateY(-5px)';
                    metric.style.transition = 'transform 0.2s ease';
                }, index * 100);
            });
        });
        
        feature.addEventListener('mouseleave', function() {
            const metrics = this.querySelectorAll('.metric-item');
            metrics.forEach(metric => {
                metric.style.transform = '';
            });
        });
    });
    
    // Integration card interactions
    const integrationCards = document.querySelectorAll('.integration-card');
    integrationCards.forEach(card => {
        card.addEventListener('click', function() {
            const integrationName = this.querySelector('h4').textContent;
            
            // Track integration interest
            if (typeof gtag !== 'undefined') {
                gtag('event', 'integration_click', {
                    integration_name: integrationName,
                    event_category: 'integrations'
                });
            }
            
            // Visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // CTA button interactions
    const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            
            // Track CTA clicks
            if (typeof gtag !== 'undefined') {
                gtag('event', 'cta_click', {
                    button_text: buttonText,
                    event_category: 'cta',
                    event_label: 'features_page'
                });
            }
        });
    });
}

// ===== ANIMATIONS =====
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    // Elements to animate
    const animatedElements = document.querySelectorAll(
        '.feature-showcase, .advanced-feature, .integration-card, .highlight-item'
    );
    
    // Ensure all elements are visible immediately
    animatedElements.forEach(element => {
        element.style.opacity = '1';
        element.style.visibility = 'visible';
    });
    
    // Create animation observer
    animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                entry.target.style.animationDelay = `${index * 0.1}s`;
                
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

// ===== ANALYTICS =====
function initializeAnalytics() {
    // Track page engagement
    const engagementStartTime = Date.now();
    
    // Track section visibility
    const sections = document.querySelectorAll('section[class*="section"]');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionName = entry.target.className.split(' ')[0];
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'section_view', {
                        section_name: sectionName,
                        event_category: 'engagement'
                    });
                }
            }
        });
    }, { threshold: 0.5 });
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Track time on page
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - engagementStartTime) / 1000);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'time_on_page', {
                value: timeOnPage,
                event_category: 'engagement'
            });
        }
    });
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
    // Use passive event listeners where possible
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    
    // Preload critical resources on hover
    const criticalLinks = document.querySelectorAll('a[href]');
    criticalLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            const href = this.getAttribute('href');
            if (href && href.startsWith('./') || href.startsWith('../')) {
                const preloadLink = document.createElement('link');
                preloadLink.rel = 'prefetch';
                preloadLink.href = href;
                document.head.appendChild(preloadLink);
            }
        }, { passive: true });
    });
}

// ===== INITIALIZE PERFORMANCE OPTIMIZATIONS =====
window.addEventListener('load', optimizePerformance);

// ===== CLEANUP ON PAGE UNLOAD =====
window.addEventListener('beforeunload', () => {
    if (animationObserver) {
        animationObserver.disconnect();
    }
    
    if (dashboardInterval) {
        clearInterval(dashboardInterval);
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

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('Features page error:', e.error);
    
    // Track errors in analytics if available
    if (typeof gtag !== 'undefined') {
        gtag('event', 'javascript_error', {
            error_message: e.error.message,
            error_filename: e.filename,
            error_lineno: e.lineno,
            event_category: 'errors'
        });
    }
});

// ===== ACCESSIBILITY ENHANCEMENTS =====
function initializeAccessibility() {
    // Add keyboard navigation for tabs
    detailTabs.forEach(tab => {
        tab.setAttribute('tabindex', '0');
        tab.setAttribute('role', 'tab');
        
        tab.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Add aria labels to interactive elements
    const interactiveElements = document.querySelectorAll('.btn, .feature-showcase, .integration-card');
    interactiveElements.forEach(element => {
        if (!element.getAttribute('aria-label')) {
            const text = element.textContent.trim() || element.querySelector('h3, h4')?.textContent.trim();
            if (text) {
                element.setAttribute('aria-label', text);
            }
        }
    });
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', initializeAccessibility);

// ===== DEVELOPMENT HELPERS =====
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Features page JavaScript loaded successfully');
    
    // Add development helpers
    window.featuresDebug = {
        metrics: dashboardMetrics,
        resetAnimations: () => {
            const elements = document.querySelectorAll('.animate-in');
            elements.forEach(el => el.classList.remove('animate-in'));
        },
        triggerActivity: () => addActivity()
    };
}