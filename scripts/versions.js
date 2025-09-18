// NullTracker Versions Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initVersionsPage();
    initSearch();
    initFilters();
    initAnimations();
    initStatCounters();
});

// Initialize the versions page
function initVersionsPage() {
    // Add loaded class for smooth entry animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 300);

    // Enhanced navbar scroll effect
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.1)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScrollY = currentScrollY;
    });

    // Initialize version card animations
    initVersionCardAnimations();
}

// Initialize search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const versionCards = document.querySelectorAll('.version-card');
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        versionCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const isVisible = cardText.includes(searchTerm);
            
            if (isVisible) {
                card.classList.remove('hidden');
                card.style.display = 'flex';
            } else {
                card.classList.add('hidden');
                card.style.display = 'none';
            }
        });
        
        // Update visible count
        updateVisibleCount();
    });
}

// Initialize filter functionality
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const versionCards = document.querySelectorAll('.version-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filterType = this.dataset.type;
            
            versionCards.forEach(card => {
                const cardType = card.dataset.type;
                const isVisible = filterType === 'all' || cardType === filterType;
                
                if (isVisible) {
                    card.classList.remove('hidden');
                    card.style.display = 'flex';
                } else {
                    card.classList.add('hidden');
                    card.style.display = 'none';
                }
            });
            
            // Re-animate visible cards
            setTimeout(() => {
                animateVisibleCards();
            }, 100);
            
            // Update visible count
            updateVisibleCount();
        });
    });
}

// Update visible version count
function updateVisibleCount() {
    const visibleCards = document.querySelectorAll('.version-card:not(.hidden)');
    const totalVersionsElement = document.getElementById('totalVersions');
    
    if (totalVersionsElement) {
        animateCounter(totalVersionsElement, visibleCards.length);
    }
}

// Initialize animations
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe version cards
    document.querySelectorAll('.version-card').forEach(card => {
        observer.observe(card);
    });

    // Observe stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        observer.observe(card);
    });
}

// Initialize version card animations with staggered delays
function initVersionCardAnimations() {
    const versionCards = document.querySelectorAll('.version-card');
    
    versionCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });
}

// Animate visible cards
function animateVisibleCards() {
    const visibleCards = document.querySelectorAll('.version-card:not(.hidden)');
    
    visibleCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Initialize stat counters
function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const finalValue = entry.target.textContent;
                animateCounter(entry.target, finalValue);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => observer.observe(stat));
}

// Animate counter numbers
function animateCounter(element, finalValue) {
    const isNumeric = /^\d+$/.test(finalValue);
    
    if (isNumeric) {
        const finalNumber = parseInt(finalValue);
        const duration = 2000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(finalNumber * easeOut);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = finalValue;
            }
        };
        
        element.textContent = '0';
        requestAnimationFrame(animate);
    }
}

// Discord bot integration
function initDiscordIntegration() {
    const addToDiscordBtns = [
        document.getElementById('addToDiscord'),
        document.getElementById('ctaAddToDiscord')
    ].filter(btn => btn);
    
    addToDiscordBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Replace with your actual Discord bot invite URL
            const inviteURL = 'https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=8&scope=bot';
            
            // Add loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening Discord...';
            this.disabled = true;
            
            // Simulate opening Discord
            setTimeout(() => {
                window.open(inviteURL, '_blank');
                
                // Reset button after a delay
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 2000);
            }, 500);
        });
    });
}

// Initialize Discord integration
initDiscordIntegration();

// Version card interaction enhancements
function enhanceVersionCards() {
    const versionCards = document.querySelectorAll('.version-card');
    
    versionCards.forEach(card => {
        // Add hover effect to version dots
        const versionDot = card.querySelector('.version-dot');
        
        card.addEventListener('mouseenter', () => {
            versionDot.style.transform = 'scale(1.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            versionDot.style.transform = 'scale(1)';
        });
        
        // Add click to expand/collapse functionality
        const versionContent = card.querySelector('.version-content');
        const versionChanges = card.querySelector('.version-changes');
        const versionHeader = card.querySelector('.version-header');
        
        // Initially collapse older versions (except current and milestones)
        if (!card.classList.contains('current') && !card.classList.contains('milestone')) {
            versionChanges.style.maxHeight = '0';
            versionChanges.style.overflow = 'hidden';
            versionChanges.style.opacity = '0.5';
            
            // Add expand/collapse toggle
            versionHeader.style.cursor = 'pointer';
            versionHeader.addEventListener('click', () => {
                const isCollapsed = versionChanges.style.maxHeight === '0px';
                
                if (isCollapsed) {
                    versionChanges.style.maxHeight = versionChanges.scrollHeight + 'px';
                    versionChanges.style.opacity = '1';
                } else {
                    versionChanges.style.maxHeight = '0';
                    versionChanges.style.opacity = '0.5';
                }
            });
        }
    });
}

// Initialize enhanced version cards
enhanceVersionCards();

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Press '/' to focus search
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Press 'Escape' to clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.blur();
        }
    }
});

// Add scroll to top functionality
function addScrollToTop() {
    // Create scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 2rem;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    document.body.appendChild(scrollBtn);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effect
    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.transform = 'translateY(-5px)';
        scrollBtn.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
    });
    
    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.transform = 'translateY(0)';
        scrollBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
}

// Initialize scroll to top
addScrollToTop();

// Version comparison functionality
function initVersionComparison() {
    // Add comparison checkboxes to version cards (optional feature)
    const versionCards = document.querySelectorAll('.version-card');
    let selectedVersions = [];
    
    // Note: This could be extended to show a comparison modal
    // For now, it's just a placeholder for future enhancement
}

// Easter egg: Konami code for special animation
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.code);
    konamiCode = konamiCode.slice(-konamiSequence.length);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        triggerVersionEasterEgg();
    }
});

function triggerVersionEasterEgg() {
    // Create a fun animation showing all versions at once
    const versionCards = document.querySelectorAll('.version-card');
    
    versionCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'bounce 0.8s ease';
            card.style.transform = 'scale(1.05)';
            
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 800);
        }, index * 100);
    });
    
    // Show a special message
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            z-index: 10001;
            animation: bounceIn 1s ease;
        ">
            <h2><i class="fas fa-code"></i> Developer Mode Activated!</h2>
            <p>You've discovered the version history Easter egg!</p>
            <p>All ${versionCards.length} versions are dancing for you!</p>
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 4000);
}

// Add bounce animation styles
const easterEggStyles = document.createElement('style');
easterEggStyles.textContent = `
    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0) scale(1);
        }
        40%, 43% {
            transform: translate3d(0,-30px,0) scale(1.05);
        }
        70% {
            transform: translate3d(0,-15px,0) scale(1.02);
        }
        90% {
            transform: translate3d(0,-4px,0) scale(1.01);
        }
    }
    
    @keyframes bounceIn {
        0% {
            transform: translate(-50%, -50%) scale(0);
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
        }
    }
`;
document.head.appendChild(easterEggStyles);

// Initialize tooltips for version badges
function initTooltips() {
    const versionBadges = document.querySelectorAll('.version-badge, .version-type');
    
    versionBadges.forEach(badge => {
        let tooltipText = '';
        
        if (badge.classList.contains('current')) {
            tooltipText = 'This is the latest version currently available';
        } else if (badge.classList.contains('milestone')) {
            tooltipText = 'This version represents a major milestone in development';
        } else if (badge.classList.contains('major')) {
            tooltipText = 'Major release with significant new features and changes';
        } else if (badge.classList.contains('minor')) {
            tooltipText = 'Minor release with improvements and bug fixes';
        } else if (badge.classList.contains('patch')) {
            tooltipText = 'Patch release with bug fixes and small improvements';
        }
        
        if (tooltipText) {
            badge.title = tooltipText;
        }
    });
}

// Initialize tooltips
initTooltips();

console.log('🚀 NullTracker Versions page loaded successfully!');
console.log('💡 Pro tip: Press "/" to search, or try the Konami code for a surprise!');