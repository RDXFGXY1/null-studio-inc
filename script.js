// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Commands page functionality
    if (document.getElementById('commandSearch')) {
        initializeCommandsPage();
    }
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(15, 15, 35, 0.98)';
        } else {
            navbar.style.background = 'rgba(15, 15, 35, 0.95)';
        }
    });
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe feature cards and other elements
    document.querySelectorAll('.feature-card, .pricing-card, .command-card').forEach(el => {
        observer.observe(el);
    });
});

// Commands page specific functionality
function initializeCommandsPage() {
    const searchInput = document.getElementById('commandSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const commandCategories = document.querySelectorAll('.command-category');
    const commandCards = document.querySelectorAll('.command-card');
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterCommands(searchTerm, getActiveFilter());
    });
    
    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            const searchTerm = searchInput.value.toLowerCase();
            filterCommands(searchTerm, filter);
        });
    });
    
    function getActiveFilter() {
        const activeButton = document.querySelector('.filter-btn.active');
        return activeButton ? activeButton.getAttribute('data-filter') : 'all';
    }
    
    function filterCommands(searchTerm, filter) {
        commandCategories.forEach(category => {
            const categoryType = category.getAttribute('data-category');
            let hasVisibleCards = false;
            
            // Check each command card in this category
            const cardsInCategory = category.querySelectorAll('.command-card');
            cardsInCategory.forEach(card => {
                const commandName = card.querySelector('h3').textContent.toLowerCase();
                const commandDescription = card.querySelector('.command-description').textContent.toLowerCase();
                const commandUsage = card.querySelector('.command-usage') ? 
                    card.querySelector('.command-usage').textContent.toLowerCase() : '';
                
                const matchesSearch = searchTerm === '' || 
                    commandName.includes(searchTerm) || 
                    commandDescription.includes(searchTerm) ||
                    commandUsage.includes(searchTerm);
                
                const matchesFilter = filter === 'all' || 
                    categoryType === filter ||
                    (filter === 'premium' && card.querySelector('.command-badge.premium'));
                
                if (matchesSearch && matchesFilter) {
                    card.style.display = 'block';
                    hasVisibleCards = true;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Show/hide entire category based on whether it has visible cards
            if (hasVisibleCards) {
                category.style.display = 'block';
            } else {
                category.style.display = 'none';
            }
        });
        
        // Show "no results" message if no commands are visible
        updateNoResultsMessage();
    }
    
    function updateNoResultsMessage() {
        const visibleCards = document.querySelectorAll('.command-card[style="display: block"], .command-card:not([style*="display: none"])');
        const existingMessage = document.querySelector('.no-results-message');
        
        if (visibleCards.length === 0) {
            if (!existingMessage) {
                const message = document.createElement('div');
                message.className = 'no-results-message';
                message.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #94a3b8;">
                        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <h3 style="color: #cbd5e1; margin-bottom: 0.5rem;">No commands found</h3>
                        <p>Try adjusting your search terms or filters</p>
                    </div>
                `;
                document.querySelector('.commands-grid').appendChild(message);
            }
        } else {
            if (existingMessage) {
                existingMessage.remove();
            }
        }
    }
    
    // Copy command to clipboard functionality
    document.querySelectorAll('code').forEach(codeElement => {
        codeElement.addEventListener('click', function() {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(() => {
                // Show temporary feedback
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                this.style.background = '#10b981';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = 'rgba(0, 0, 0, 0.3)';
                }, 1000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Show feedback
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                this.style.background = '#10b981';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = 'rgba(0, 0, 0, 0.3)';
                }, 1000);
            });
        });
        
        // Add hover effect to indicate clickability
        codeElement.style.cursor = 'pointer';
        codeElement.title = 'Click to copy';
    });
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Add hover effects to donation cards
    document.querySelectorAll('.donation-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click tracking for donation links (for analytics)
    document.querySelectorAll('.donation-card').forEach(card => {
        card.addEventListener('click', function() {
            const platform = this.querySelector('h4').textContent;
            console.log(`Donation link clicked: ${platform}`);
            // Here you could add analytics tracking
        });
    });
    
    // Add loading animation for buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // Don't add loading effect to anchor links
            if (this.tagName === 'A' && this.getAttribute('href').startsWith('#')) {
                return;
            }
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);