/**
 * Payment Page JavaScript - Modern Enhanced Version
 * Advanced payment processing, service selection, and UI interactions
 */

// ===== GLOBAL VARIABLES =====
let selectedServices = {};
let isYearlyBilling = false;
let paypalButtonRendered = false;

// ===== DOM ELEMENTS =====
const tierSelects = document.querySelectorAll('.tier-select');
const selectedServicesContainer = document.getElementById('selected-services');
const monthlyTotalElement = document.getElementById('monthly-total');
const yearlyTotalElement = document.getElementById('yearly-total');
const yearlyBillingToggle = document.getElementById('yearly-billing');
const yearlyDiscountRow = document.querySelector('.yearly-discount');
const paypalContainer = document.getElementById('paypal-button-container');

// Service configuration
const serviceConfig = {
    'anti-nuke': {
        name: 'Anti-Nuke Premium',
        tiers: {
            basic: { name: 'Basic', price: 4.99 },
            pro: { name: 'Pro', price: 8.99 },
            enterprise: { name: 'Enterprise', price: 15.99 }
        }
    },
    'url-scanner': {
        name: 'URL Scanner Premium',
        tiers: {
            basic: { name: 'Basic', price: 2.99 },
            pro: { name: 'Pro', price: 4.99 },
            enterprise: { name: 'Enterprise', price: 9.99 }
        }
    },
    'api-limits': {
        name: 'API Limits Premium',
        tiers: {
            basic: { name: 'Basic', price: 3.99 },
            pro: { name: 'Pro', price: 7.99 },
            enterprise: { name: 'Enterprise', price: 14.99 }
        }
    },
    'advanced-logging': {
        name: 'Advanced Logging',
        tiers: {
            basic: { name: 'Basic', price: 1.99 },
            pro: { name: 'Pro', price: 3.99 },
            enterprise: { name: 'Enterprise', price: 6.99 }
        }
    },
    'spam-protection': {
        name: 'Spam Protection Premium',
        tiers: {
            basic: { name: 'Basic', price: 2.49 },
            pro: { name: 'Pro', price: 4.49 },
            enterprise: { name: 'Enterprise', price: 7.99 }
        }
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeServiceSelectors();
    initializeBillingToggle();
    initializeAnimations();
    renderPayPalButton();
    updateSummary();
});

// ===== SERVICE SELECTION =====
function initializeServiceSelectors() {
    tierSelects.forEach(select => {
        // Enhanced select styling
        select.addEventListener('change', function() {
            handleServiceSelection(this);
            updateSelectStyling(this);
        });

        // Add focus and blur effects
        select.addEventListener('focus', function() {
            this.parentElement.parentElement.classList.add('service-focused');
        });

        select.addEventListener('blur', function() {
            this.parentElement.parentElement.classList.remove('service-focused');
        });

        // Add hover effects for options
        select.addEventListener('mouseenter', function() {
            if (this.value) {
                this.classList.add('selected-hover');
            }
        });

        select.addEventListener('mouseleave', function() {
            this.classList.remove('selected-hover');
        });
    });
}

function handleServiceSelection(selectElement) {
    const serviceId = selectElement.dataset.service;
    const selectedTier = selectElement.value;
    const price = parseFloat(selectElement.options[selectElement.selectedIndex].dataset.price);

    if (selectedTier && price > 0) {
        selectedServices[serviceId] = {
            service: serviceConfig[serviceId].name,
            tier: serviceConfig[serviceId].tiers[selectedTier].name,
            price: price
        };
    } else {
        delete selectedServices[serviceId];
    }

    updateSummary();
    updatePayPalButton();
    animateServiceCard(selectElement.closest('.service-row'));
}

function updateSelectStyling(selectElement) {
    if (selectElement.value && selectElement.value !== '') {
        selectElement.classList.add('selected');
        selectElement.closest('.service-row').classList.add('service-selected');
    } else {
        selectElement.classList.remove('selected');
        selectElement.closest('.service-row').classList.remove('service-selected');
    }
}

// ===== BILLING TOGGLE =====
function initializeBillingToggle() {
    if (yearlyBillingToggle) {
        yearlyBillingToggle.addEventListener('change', function() {
            isYearlyBilling = this.checked;
            updateSummary();
            updatePayPalButton();
            
            // Animate the toggle
            animateBillingToggle();
            
            // Show/hide yearly discount info
            if (isYearlyBilling) {
                yearlyDiscountRow.style.display = 'flex';
                yearlyDiscountRow.style.animation = 'fadeInUp 0.3s ease-out';
            } else {
                yearlyDiscountRow.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    yearlyDiscountRow.style.display = 'none';
                }, 300);
            }
        });
    }
}

function animateBillingToggle() {
    const toggle = document.querySelector('.billing-toggle');
    toggle.style.transform = 'scale(1.02)';
    toggle.style.transition = 'transform 0.2s ease-out';
    
    setTimeout(() => {
        toggle.style.transform = 'scale(1)';
    }, 200);
}

// ===== SUMMARY UPDATES =====
function updateSummary() {
    const servicesKeys = Object.keys(selectedServices);
    
    if (servicesKeys.length === 0) {
        selectedServicesContainer.innerHTML = '<p class="no-selection">Select services to see your total</p>';
        monthlyTotalElement.textContent = '$0.00';
        yearlyTotalElement.textContent = '$0.00';
        return;
    }

    // Render selected services
    let servicesHTML = '';
    let monthlyTotal = 0;

    servicesKeys.forEach(serviceId => {
        const service = selectedServices[serviceId];
        monthlyTotal += service.price;
        
        servicesHTML += `
            <div class="selected-service" data-service="${serviceId}">
                <div>
                    <span class="service-name">${service.service}</span>
                    <span class="service-tier">${service.tier}</span>
                </div>
                <span class="service-price">$${service.price.toFixed(2)}</span>
            </div>
        `;
    });

    selectedServicesContainer.innerHTML = servicesHTML;

    // Update totals
    monthlyTotalElement.textContent = `$${monthlyTotal.toFixed(2)}`;
    
    if (isYearlyBilling && monthlyTotal > 0) {
        const yearlyTotal = monthlyTotal * 12 * 0.8; // 20% discount
        yearlyTotalElement.textContent = `$${yearlyTotal.toFixed(2)}/year`;
    }

    // Add hover effects to selected services
    document.querySelectorAll('.selected-service').forEach(serviceElement => {
        serviceElement.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(4px)';
        });
        
        serviceElement.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Animate the summary update
    animateSummaryUpdate();
}

function animateSummaryUpdate() {
    const summaryCard = document.querySelector('.summary-card');
    summaryCard.style.transform = 'scale(1.02)';
    summaryCard.style.transition = 'transform 0.2s ease-out';
    
    setTimeout(() => {
        summaryCard.style.transform = 'scale(1)';
    }, 200);
}

// ===== PAYPAL INTEGRATION =====
function renderPayPalButton() {
    if (typeof paypal === 'undefined') {
        console.warn('PayPal SDK not loaded');
        return;
    }

    paypal.Buttons({
        createOrder: function(data, actions) {
            const total = calculateTotal();
            
            if (total <= 0) {
                alert('Please select at least one service before proceeding.');
                return false;
            }

            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: total.toFixed(2)
                    },
                    description: generateOrderDescription()
                }]
            });
        },
        
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                showPaymentSuccess(details);
            });
        },
        
        onError: function(err) {
            console.error('PayPal error:', err);
            showPaymentError();
        },
        
        onCancel: function(data) {
            showPaymentCancellation();
        },

        style: {
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 50,
            tagline: false
        }
    }).render('#paypal-button-container');

    paypalButtonRendered = true;
}

function updatePayPalButton() {
    const total = calculateTotal();
    
    if (total <= 0) {
        paypalContainer.classList.add('paypal-disabled');
    } else {
        paypalContainer.classList.remove('paypal-disabled');
    }
}

function calculateTotal() {
    let total = 0;
    Object.keys(selectedServices).forEach(serviceId => {
        total += selectedServices[serviceId].price;
    });

    if (isYearlyBilling && total > 0) {
        total = total * 12 * 0.8; // 20% discount for yearly
    }

    return total;
}

function generateOrderDescription() {
    const services = Object.keys(selectedServices).map(serviceId => {
        const service = selectedServices[serviceId];
        return `${service.service} (${service.tier})`;
    });

    const billing = isYearlyBilling ? 'Yearly' : 'Monthly';
    return `NullTracker Premium Services - ${billing}: ${services.join(', ')}`;
}

// ===== PAYMENT FEEDBACK =====
function showPaymentSuccess(details) {
    const successModal = createModal('success', 'Payment Successful!', 
        `Thank you for your purchase! Your payment has been processed successfully.
         <br><br><strong>Transaction ID:</strong> ${details.id}
         <br><br>You will receive a confirmation email shortly with your premium access details.`);
    
    document.body.appendChild(successModal);
    setTimeout(() => showModal(successModal), 100);
}

function showPaymentError() {
    const errorModal = createModal('error', 'Payment Error', 
        'There was an issue processing your payment. Please try again or contact support if the problem persists.');
    
    document.body.appendChild(errorModal);
    setTimeout(() => showModal(errorModal), 100);
}

function showPaymentCancellation() {
    const cancelModal = createModal('info', 'Payment Cancelled', 
        'Your payment was cancelled. No charges were made to your account.');
    
    document.body.appendChild(cancelModal);
    setTimeout(() => showModal(cancelModal), 100);
}

// ===== MODAL SYSTEM =====
function createModal(type, title, message) {
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    
    const iconClass = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    const iconColor = type === 'success' ? 'var(--green)' : 
                     type === 'error' ? 'var(--red)' : 'var(--blue)';

    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <i class="fas ${iconClass}" style="color: ${iconColor}"></i>
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="modal-close-btn">Close</button>
            </div>
        </div>
    `;

    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .payment-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease-out;
        }
        
        .payment-modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
        }
        
        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: var(--bg-card);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-2xl);
            padding: var(--spacing-2xl);
            max-width: 500px;
            width: 90%;
            box-shadow: var(--shadow-xl);
            transition: transform 0.3s ease-out;
        }
        
        .payment-modal.show .modal-content {
            transform: translate(-50%, -50%) scale(1);
        }
        
        .modal-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
        }
        
        .modal-header i {
            font-size: 2rem;
        }
        
        .modal-header h3 {
            color: var(--text-primary);
            margin: 0;
            font-size: 1.5rem;
        }
        
        .modal-body p {
            color: var(--text-secondary);
            line-height: 1.6;
            margin: 0;
        }
        
        .modal-footer {
            margin-top: var(--spacing-2xl);
            text-align: right;
        }
        
        .modal-close-btn {
            background: var(--gradient-purple);
            color: white;
            border: none;
            padding: var(--spacing-md) var(--spacing-xl);
            border-radius: var(--radius-lg);
            font-weight: 600;
            cursor: pointer;
            transition: all var(--transition-normal);
        }
        
        .modal-close-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-purple);
        }
    `;
    
    document.head.appendChild(style);

    // Add close functionality
    modal.querySelector('.modal-close-btn').addEventListener('click', () => hideModal(modal));
    modal.querySelector('.modal-backdrop').addEventListener('click', () => hideModal(modal));

    return modal;
}

function showModal(modal) {
    modal.classList.add('show');
}

function hideModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

// ===== ANIMATIONS =====
function initializeAnimations() {
    // Observe service rows for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.service-row').forEach(row => {
        observer.observe(row);
    });
}

function animateServiceCard(serviceRow) {
    // Pulse animation for selected service
    serviceRow.style.transform = 'scale(1.02)';
    serviceRow.style.transition = 'transform 0.2s ease-out';
    
    setTimeout(() => {
        serviceRow.style.transform = 'scale(1)';
    }, 200);

    // Add a subtle glow effect
    serviceRow.style.boxShadow = '0 0 30px rgba(139, 92, 246, 0.3)';
    setTimeout(() => {
        serviceRow.style.boxShadow = '';
    }, 1000);
}

// ===== UTILITY FUNCTIONS =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

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

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('Payment page error:', e.error);
});

// ===== KEYBOARD ACCESSIBILITY =====
document.addEventListener('keydown', function(e) {
    // ESC key to close modals
    if (e.key === 'Escape') {
        const modal = document.querySelector('.payment-modal.show');
        if (modal) {
            hideModal(modal);
        }
    }
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        selectedServices,
        calculateTotal,
        generateOrderDescription,
        formatCurrency
    };
}