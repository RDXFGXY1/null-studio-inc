/**
 * Setup Page JavaScript
 * Interactive tabs, copy functionality, animations, and setup guides
 */

// ===== GLOBAL VARIABLES =====
let currentTab = 'permissions';
let animationObserver = null;

// ===== DOM ELEMENTS =====
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const copyButtons = document.querySelectorAll('.copy-btn');
const stepIndicators = document.querySelectorAll('.step-indicator');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeCopyButtons();
    initializeAnimations();
    initializeStepAnimation();
    initializeScrollEffects();
});

// ===== TAB FUNCTIONALITY =====
function initializeTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            switchTab(targetTab);
        });
    });
    
    // Set initial active tab
    switchTab(currentTab);
}

function switchTab(targetTab) {
    // Remove active class from all buttons and contents
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to selected button and content
    const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
    const activeContent = document.querySelector(`[data-tab-content="${targetTab}"]`);
    
    if (activeButton && activeContent) {
        activeButton.classList.add('active');
        activeContent.classList.add('active');
        currentTab = targetTab;
        
        // Animate tab change
        animateTabChange(activeContent);
    }
}

function animateTabChange(content) {
    content.style.opacity = '0';
    content.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
        content.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    }, 50);
}

// ===== COPY TO CLIPBOARD FUNCTIONALITY =====
function initializeCopyButtons() {
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const textToCopy = this.dataset.copy;
            copyToClipboard(textToCopy, this);
        });
    });
}

async function copyToClipboard(text, buttonElement) {
    try {
        await navigator.clipboard.writeText(text);
        showCopySuccess(buttonElement);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showCopySuccess(buttonElement);
        } catch (err) {
            showCopyError(buttonElement);
        }
        
        document.body.removeChild(textArea);
    }
}

function showCopySuccess(buttonElement) {
    const originalIcon = buttonElement.innerHTML;
    buttonElement.classList.add('copied');
    buttonElement.innerHTML = '<i class="fas fa-check"></i>';
    
    // Create ripple effect
    createRipple(buttonElement);
    
    setTimeout(() => {
        buttonElement.classList.remove('copied');
        buttonElement.innerHTML = originalIcon;
    }, 2000);
}

function showCopyError(buttonElement) {
    const originalIcon = buttonElement.innerHTML;
    buttonElement.style.background = 'var(--error)';
    buttonElement.innerHTML = '<i class="fas fa-times"></i>';
    
    setTimeout(() => {
        buttonElement.style.background = '';
        buttonElement.innerHTML = originalIcon;
    }, 2000);
}

function createRipple(element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.pointerEvents = 'none';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation to CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ===== STEP ANIMATION =====
function initializeStepAnimation() {
    let currentStep = 1;
    const totalSteps = stepIndicators.length;
    
    setInterval(() => {
        // Remove active class from current step
        stepIndicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to next step
        stepIndicators[currentStep - 1].classList.add('active');
        
        // Move to next step
        currentStep = currentStep >= totalSteps ? 1 : currentStep + 1;
    }, 3000);
}

// ===== SCROLL ANIMATIONS =====
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                
                // Special handling for cards with staggered animation
                if (entry.target.classList.contains('quick-step') || 
                    entry.target.classList.contains('trouble-card') || 
                    entry.target.classList.contains('tip-card')) {
                    animateCard(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(`
        .quick-step,
        .permission-card,
        .config-card,
        .trouble-card,
        .tip-card
    `);
    
    animatedElements.forEach(element => {
        // Set initial state
        element.style.opacity = '0.8';
        element.style.transform = 'translateY(20px)';
        animationObserver.observe(element);
    });
}

function animateCard(card) {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
        this.style.transition = 'all 0.3s ease-out';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
}

// ===== SCROLL EFFECTS =====
function initializeScrollEffects() {
    const navbar = document.querySelector('.navbar');
    let isScrolled = false;
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        if (scrollY > 100 && !isScrolled) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.backdropFilter = 'blur(16px)';
            isScrolled = true;
        } else if (scrollY <= 100 && isScrolled) {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.backdropFilter = 'blur(12px)';
            isScrolled = false;
        }
    });
}

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 100; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== COMMAND HIGHLIGHTING =====
function highlightCommands() {
    const commandBoxes = document.querySelectorAll('.command-box');
    
    commandBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.borderColor = 'var(--purple-primary)';
            this.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.2)';
            this.style.transform = 'scale(1.02)';
        });
        
        box.addEventListener('mouseleave', function() {
            this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            this.style.boxShadow = 'none';
            this.style.transform = 'scale(1)';
        });
    });
}

// Initialize command highlighting
document.addEventListener('DOMContentLoaded', highlightCommands);

// ===== PROGRESS TRACKING =====
function trackSetupProgress() {
    const completedSteps = new Set();
    const totalSteps = 3;
    
    // Track when user clicks on invite button
    const inviteBtn = document.querySelector('.invite-btn');
    if (inviteBtn) {
        inviteBtn.addEventListener('click', function() {
            completedSteps.add('invite');
            updateProgress();
        });
    }
    
    // Track when user copies setup command
    const setupCopyBtn = document.querySelector('[data-copy="/setup"]');
    if (setupCopyBtn) {
        setupCopyBtn.addEventListener('click', function() {
            completedSteps.add('setup');
            updateProgress();
        });
    }
    
    function updateProgress() {
        const progressPercentage = (completedSteps.size / totalSteps) * 100;
        
        // Visual feedback
        if (completedSteps.size === totalSteps) {
            showCompletionMessage();
        }
    }
    
    function showCompletionMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gradient-success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        message.innerHTML = `
            <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
            Great! You've completed the basic setup steps!
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => message.remove(), 300);
        }, 5000);
    }
}

// Add slide animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize progress tracking
document.addEventListener('DOMContentLoaded', trackSetupProgress);

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    // Tab navigation with keyboard
    if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        const tabs = ['permissions', 'anti-nuke', 'logging', 'moderation', 'advanced'];
        if (tabs[tabIndex]) {
            switchTab(tabs[tabIndex]);
        }
    }
    
    // Copy current tab's first command with Ctrl+C
    if (e.ctrlKey && e.key === 'c') {
        const activeTab = document.querySelector('.tab-content.active');
        const firstCopyBtn = activeTab?.querySelector('.copy-btn');
        if (firstCopyBtn) {
            firstCopyBtn.click();
        }
    }
});

// ===== MOBILE MENU TOGGLE =====
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

// Initialize mobile menu
document.addEventListener('DOMContentLoaded', initializeMobileMenu);

// ===== PERFORMANCE MONITORING =====
function monitorPerformance() {
    // Monitor animation performance
    let frameCount = 0;
    let startTime = Date.now();
    
    function countFrames() {
        frameCount++;
        
        if (frameCount === 60) { // Check every 60 frames
            const fps = 60000 / (Date.now() - startTime);
            
            if (fps < 30) {
                // Reduce animations for better performance
                document.documentElement.style.setProperty('--transition-normal', '0.1s ease-out');
                document.documentElement.style.setProperty('--transition-slow', '0.2s ease-out');
            }
            
            frameCount = 0;
            startTime = Date.now();
        }
        
        requestAnimationFrame(countFrames);
    }
    
    requestAnimationFrame(countFrames);
}

// Start performance monitoring
monitorPerformance();

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('Setup page error:', e.error);
    
    // Graceful degradation
    if (e.error?.message?.includes('animation')) {
        // Disable animations on error
        document.documentElement.style.setProperty('--transition-normal', '0s');
        document.documentElement.style.setProperty('--transition-slow', '0s');
    }
});

// ===== ACCESSIBILITY IMPROVEMENTS =====
function improveAccessibility() {
    // Add ARIA labels to interactive elements
    copyButtons.forEach((button, index) => {
        button.setAttribute('aria-label', `Copy command ${index + 1} to clipboard`);
    });
    
    tabButtons.forEach(button => {
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', button.classList.contains('active'));
    });
    
    tabContents.forEach(content => {
        content.setAttribute('role', 'tabpanel');
        content.setAttribute('aria-hidden', !content.classList.contains('active'));
    });
    
    // Add focus indicators
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `
        .tab-btn:focus,
        .copy-btn:focus,
        .btn:focus {
            outline: 2px solid var(--purple-primary);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(focusStyle);
}

// Initialize accessibility improvements
document.addEventListener('DOMContentLoaded', improveAccessibility);

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        switchTab,
        copyToClipboard,
        currentTab
    };
}