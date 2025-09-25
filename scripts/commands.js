/**
 * Commands Page JavaScript
 * Advanced filtering, search, and interactive features
 */

// ===== GLOBAL VARIABLES =====
let currentFilter = 'all';
let searchTerm = '';
let isSearchActive = false;
let commandsData = [];

// ===== DOM ELEMENTS =====
const searchInput = document.getElementById('commandSearch');
const searchResults = document.getElementById('searchResults');
const filterButtons = document.querySelectorAll('.filter-btn');
const commandCards = document.querySelectorAll('.command-card');
const categories = document.querySelectorAll('.command-category');
const statNumbers = document.querySelectorAll('.stat-number');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeCommands();
    initializeSearch();
    initializeFilters();
    initializeKeyboardShortcuts();
    initializeCopyButtons();
    initializeStatCounters();
    initializeDonationPopup();
    initializeScrollAnimations();
});

// ===== COMMAND INITIALIZATION =====
function initializeCommands() {
    // Extract command data from DOM for better performance
    commandCards.forEach(card => {
        const commandData = {
            element: card,
            name: card.querySelector('.command-name').textContent.toLowerCase(),
            description: card.querySelector('.command-description').textContent.toLowerCase(),
            type: card.dataset.type || 'free',
            category: card.dataset.category || 'utility',
            usage: card.querySelector('.command-usage code')?.textContent || '',
            example: card.querySelector('.command-example code')?.textContent || ''
        };
        commandsData.push(commandData);
    });
    
    // Initial display
    performSearch();
    updateCommandStats();
}

// ===== SEARCH FUNCTIONALITY =====
function initializeSearch() {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.classList.add('focused');
    });
    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.classList.remove('focused');
    });
}

function handleSearch() {
    searchTerm = searchInput.value.toLowerCase().trim();
    isSearchActive = searchTerm.length > 0;
    performSearch();
}

function performSearch() {
    let visibleCount = 0;
    let visibleCategories = new Set();
    
    commandsData.forEach(command => {
        const matchesSearch = !isSearchActive || 
            command.name.includes(searchTerm) || 
            command.description.includes(searchTerm) ||
            command.usage.toLowerCase().includes(searchTerm) ||
            command.example.toLowerCase().includes(searchTerm);
            
        const matchesFilter = currentFilter === 'all' || 
            command.type === currentFilter || 
            command.category === currentFilter;
        
        const isVisible = matchesSearch && matchesFilter;
        
        if (isVisible) {
            command.element.style.display = 'block';
            command.element.classList.remove('hidden');
            visibleCategories.add(command.category);
            visibleCount++;
            
            // Highlight search terms
            if (isSearchActive) {
                highlightSearchTerm(command.element, searchTerm);
            } else {
                removeHighlights(command.element);
            }
        } else {
            command.element.style.display = 'none';
            command.element.classList.add('hidden');
        }
    });
    
    // Update category visibility
    updateCategoriesVisibility(visibleCategories);
    
    // Update search results count
    updateSearchResults(visibleCount);
    
    // Update URL if search is active
    updateURL();
}

function highlightSearchTerm(element, term) {
    if (!term) return;
    
    const textNodes = getTextNodes(element);
    textNodes.forEach(node => {
        if (node.textContent.toLowerCase().includes(term)) {
            const parent = node.parentNode;
            const html = node.textContent.replace(
                new RegExp(`(${escapeRegExp(term)})`, 'gi'),
                '<mark class="search-highlight">$1</mark>'
            );
            
            const wrapper = document.createElement('span');
            wrapper.innerHTML = html;
            parent.replaceChild(wrapper, node);
        }
    });
}

function removeHighlights(element) {
    const highlights = element.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
}

function updateCategoriesVisibility(visibleCategories) {
    categories.forEach(category => {
        const categoryName = category.dataset.category;
        const shouldShow = currentFilter === 'all' || 
            currentFilter === categoryName || 
            visibleCategories.has(categoryName);
        
        if (shouldShow) {
            category.style.display = 'block';
            category.classList.remove('hidden');
        } else {
            category.style.display = 'none';
            category.classList.add('hidden');
        }
    });
}

function updateSearchResults(count) {
    if (!searchResults) return;
    
    let message = '';
    if (isSearchActive) {
        message = `Found ${count} command${count !== 1 ? 's' : ''} matching "${searchTerm}"`;
    } else {
        const filterName = currentFilter === 'all' ? 'total' : currentFilter;
        message = `Showing ${count} ${filterName} command${count !== 1 ? 's' : ''}`;
    }
    
    searchResults.textContent = message;
    searchResults.classList.toggle('has-results', count > 0);
}

// ===== FILTER FUNCTIONALITY =====
function initializeFilters() {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            setFilter(filter);
        });
    });
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update button states
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    // Add ripple effect
    const activeBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
    if (activeBtn) {
        createRipple(activeBtn);
    }
    
    performSearch();
    updateCommandStats();
}

// ===== COPY FUNCTIONALITY =====
function initializeCopyButtons() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.copy-btn')) {
            const btn = e.target.closest('.copy-btn');
            const commandName = btn.closest('.command-card').querySelector('.command-name').textContent.trim();
            copyCommand(commandName, btn);
        }
    });
}

function copyCommand(command, btn) {
    navigator.clipboard.writeText(command).then(() => {
        showCopyFeedback(btn, true);
        
        // Analytics tracking (if needed)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'copy_command', {
                command_name: command,
                event_category: 'commands'
            });
        }
    }).catch(err => {
        console.error('Failed to copy command:', err);
        showCopyFeedback(btn, false);
    });
}

function showCopyFeedback(btn, success) {
    const originalHTML = btn.innerHTML;
    const originalClasses = btn.className;
    
    if (success) {
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.classList.add('copy-success');
    } else {
        btn.innerHTML = '<i class="fas fa-times"></i>';
        btn.classList.add('copy-error');
    }
    
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.className = originalClasses;
    }, 2000);
}

// ===== KEYBOARD SHORTCUTS =====
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+K or Cmd+K for search focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            if (document.activeElement === searchInput) {
                clearSearch();
            }
        }
        
        // Number keys for quick filter
        if (e.key >= '1' && e.key <= '6' && !e.ctrlKey && !e.altKey && document.activeElement !== searchInput) {
            const filterIndex = parseInt(e.key) - 1;
            const filterBtn = filterButtons[filterIndex];
            if (filterBtn) {
                setFilter(filterBtn.dataset.filter);
            }
        }
    });
}

function clearSearch() {
    searchInput.value = '';
    searchTerm = '';
    isSearchActive = false;
    searchInput.blur();
    performSearch();
}

// ===== STATISTICS COUNTERS =====
function initializeStatCounters() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });
    
    const statsSection = document.querySelector('.command-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

function animateCounters() {
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent.replace('+', ''));
        const duration = 2000;
        const start = performance.now();
        
        function updateCounter(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * target);
            
            stat.textContent = current + (target >= 10 ? '+' : '');
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    });
}

function updateCommandStats() {
    const stats = {
        all: commandsData.length,
        free: commandsData.filter(cmd => cmd.type === 'free').length,
        premium: commandsData.filter(cmd => cmd.type === 'premium').length,
        moderation: commandsData.filter(cmd => cmd.category === 'moderation').length,
        security: commandsData.filter(cmd => cmd.category === 'security').length,
        utility: commandsData.filter(cmd => cmd.category === 'utility').length
    };
    
    // Update category badges
    document.querySelectorAll('.category-badge').forEach(badge => {
        const category = badge.closest('.command-category').dataset.category;
        if (stats[category]) {
            badge.textContent = `${stats[category]} Commands`;
        }
    });
}

// ===== DONATION POPUP =====
function initializeDonationPopup() {
    createDonationButton();
    
// Show popup after user interaction
    let interactionCount = 0;
    const maxInteractions = 3;
    let popupShown = false;
    
    document.addEventListener('click', () => {
        interactionCount++;
        if (interactionCount >= maxInteractions && !popupShown) {
            setTimeout(() => {
                if (!popupShown) {
                    showDonationPopup();
                    popupShown = true;
                }
            }, 5000);
        }
    });
    
    // Show popup after short delay for immediate testing
    setTimeout(() => {
        if (!popupShown) {
            showDonationPopup();
            popupShown = true;
        }
    }, 5000); // 5 seconds for immediate testing
}

function createDonationButton() {
    const donationBtn = document.createElement('div');
    donationBtn.className = 'floating-donation-btn';
    donationBtn.innerHTML = `
        <div class="donation-btn-inner">
            <i class="fas fa-heart"></i>
            <span>Support Us</span>
        </div>
    `;
    donationBtn.onclick = showDonationPopup;
    
    // Add CSS for floating button
    if (!document.getElementById('donation-styles')) {
        const style = document.createElement('style');
        style.id = 'donation-styles';
        style.textContent = `
            .floating-donation-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 1000;
                background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
                border-radius: 50px;
                box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
                cursor: pointer;
                transition: all 0.3s ease;
                animation: pulse 2s infinite;
            }
            
            .floating-donation-btn:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 15px 35px rgba(255, 107, 107, 0.4);
            }
            
            .donation-btn-inner {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                color: white;
                font-weight: 600;
                font-size: 14px;
            }
            
            .floating-donation-btn i {
                font-size: 16px;
                animation: heartbeat 1.5s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes heartbeat {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            
            .donation-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .donation-popup.show {
                opacity: 1;
                visibility: visible;
            }
            
            .donation-popup-content {
                background: var(--bg-card);
                border-radius: 20px;
                padding: 40px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                transform: translateY(50px);
                transition: transform 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .donation-popup.show .donation-popup-content {
                transform: translateY(0);
            }
            
            .donation-popup h3 {
                color: var(--text-primary);
                font-size: 24px;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .donation-popup p {
                color: var(--text-secondary);
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            
            .donation-popup-buttons {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .donation-popup .btn {
                padding: 12px 24px;
                border-radius: 12px;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.3s ease;
                border: none;
                cursor: pointer;
                font-size: 14px;
            }
            
            .donation-popup .btn-primary {
                background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
                color: white;
            }
            
            .donation-popup .btn-secondary {
                background: var(--bg-accent);
                color: var(--text-secondary);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .donation-popup .btn:hover {
                transform: translateY(-2px);
            }
            
            .donation-popup-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                color: var(--text-tertiary);
                font-size: 20px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .donation-popup-close:hover {
                background: var(--bg-accent);
                color: var(--text-primary);
            }
            
            @media (max-width: 768px) {
                .floating-donation-btn {
                    bottom: 20px;
                    right: 20px;
                }
                
                .donation-popup-content {
                    padding: 30px 20px;
                    margin: 20px;
                }
                
                .donation-popup-buttons {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(donationBtn);
}

function showDonationPopup() {
    // Don't show if already shown recently
    if (localStorage.getItem('donationPopupShown')) {
        const lastShown = parseInt(localStorage.getItem('donationPopupShown'));
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000; // 24 hours
        
        if (now - lastShown < oneDay) {
            return;
        }
    }
    
    const popup = document.createElement('div');
    popup.className = 'donation-popup';
    popup.innerHTML = `
        <div class="donation-popup-content">
            <button class="donation-popup-close">&times;</button>
            <h3>
                <i class="fas fa-heart" style="color: #ff6b6b;"></i>
                Support Secure Sentry
            </h3>
            <p>
                Help us keep Secure Sentry running and add new features! 
                Your support helps us protect Discord communities worldwide. 
                Every contribution makes a difference! ❤️
            </p>
            <div class="donation-popup-buttons">
                <a href="donate.html" class="btn btn-primary">
                    <i class="fas fa-heart"></i>
                    Donate Now
                </a>
                <button class="btn btn-secondary" onclick="closeDonationPopup()">
                    Maybe Later
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Show popup with animation
    setTimeout(() => {
        popup.classList.add('show');
    }, 100);
    
    // Close handlers
    popup.querySelector('.donation-popup-close').onclick = closeDonationPopup;
    popup.onclick = function(e) {
        if (e.target === popup) {
            closeDonationPopup();
        }
    };
    
    // Remember that popup was shown
    localStorage.setItem('donationPopupShown', Date.now().toString());
    
    // Auto close after 10 seconds
    setTimeout(closeDonationPopup, 10000);
}

function closeDonationPopup() {
    const popup = document.querySelector('.donation-popup');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.remove();
        }, 300);
    }
}

// ===== SCROLL ANIMATIONS =====
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.command-card, .command-category, .setup-step');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
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

function createRipple(element) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    return textNodes;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateURL() {
    const params = new URLSearchParams();
    
    if (currentFilter !== 'all') {
        params.set('filter', currentFilter);
    }
    
    if (isSearchActive) {
        params.set('search', searchTerm);
    }
    
    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    history.replaceState(null, '', newURL);
}

// ===== URL PARAMETER HANDLING =====
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    const filter = params.get('filter');
    if (filter && filter !== 'all') {
        setFilter(filter);
    }
    
    const search = params.get('search');
    if (search) {
        searchInput.value = search;
        handleSearch();
    }
}

// Load URL parameters on page load
window.addEventListener('load', loadFromURL);

// ===== EXPORT FUNCTIONS FOR GLOBAL ACCESS =====
window.copyCommand = copyCommand;
window.setFilter = setFilter;
window.showDonationPopup = showDonationPopup;
window.closeDonationPopup = closeDonationPopup;