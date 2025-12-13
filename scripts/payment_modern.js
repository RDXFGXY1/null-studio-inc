/**
 * Payment Page JavaScript - Modern Enhanced Version
 * Advanced payment processing, service selection, and UI interactions
 */

// ===== GLOBAL VARIABLES =====
let selectedServices = {};

// ===== DOM ELEMENTS =====
const tierSelects = document.querySelectorAll('.tier-select');
const selectedServicesContainer = document.getElementById('selected-services');
const monthlyTotalElement = document.getElementById('monthly-total');
const paypalContainer = document.getElementById('paypal-button-container');
const userIdInput = document.getElementById('user-id');
const guildIdInput = document.getElementById('guild-id');

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
    renderPayPalButton();
    updateSummary();
});

// ===== SERVICE SELECTION =====
function initializeServiceSelectors() {
    tierSelects.forEach(select => {
        select.addEventListener('change', function() {
            handleServiceSelection(this);
            updateSelectStyling(this);
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
}

function updateSelectStyling(selectElement) {
    if (selectElement.value && selectElement.value !== '') {
        selectElement.classList.add('selected');
    } else {
        selectElement.classList.remove('selected');
    }
}

// ===== SUMMARY UPDATES =====
function updateSummary() {
    const servicesKeys = Object.keys(selectedServices);
    
    if (servicesKeys.length === 0) {
        selectedServicesContainer.innerHTML = '<p class="no-selection">Select services to see your total</p>';
        monthlyTotalElement.textContent = '$0.00';
        return;
    }

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
                <span class="service-price">${service.price.toFixed(2)}</span>
            </div>
        `;
    });

    selectedServicesContainer.innerHTML = servicesHTML;
    monthlyTotalElement.textContent = `${monthlyTotal.toFixed(2)}`;
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

            if (!userIdInput.value || !guildIdInput.value) {
                alert('Please enter your User ID and Guild ID.');
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
                savePayment(details);
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

    updatePayPalButton();
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
    return total;
}

function generateOrderDescription() {
    const services = Object.keys(selectedServices).map(serviceId => {
        const service = selectedServices[serviceId];
        return `${service.service} (${service.tier})`;
    });
    return `Hinata Premium Services - Monthly: ${services.join(', ')}`;
}

// ===== BACKEND COMMUNICATION =====
function savePayment(details) {
    const paymentData = {
        userId: userIdInput.value,
        guildId: guildIdInput.value,
        services: selectedServices,
        orderId: details.id
    };

    fetch('http://localhost:3000/api/save-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error saving payment:', error));
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