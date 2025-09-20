// Import PayPal SDK
import paypal from 'paypal-js';

class PaymentManager {
    constructor() {
        this.selectedServices = new Map();
        this.isYearlyBilling = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializePayPal();
    }

    setupEventListeners() {
        // Service card selection
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.tier')) {
                    this.toggleServiceCard(card);
                }
            });
        });

        // Tier selection
        document.querySelectorAll('.tier').forEach(tier => {
            tier.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectTier(tier);
            });
        });

        // Yearly billing toggle
        document.getElementById('yearly-billing').addEventListener('change', (e) => {
            this.isYearlyBilling = e.target.checked;
            this.updateSummary();
            this.updatePayPalButton();
        });
    }

    toggleServiceCard(card) {
        const serviceId = card.dataset.service;
        
        if (card.classList.contains('selected')) {
            card.classList.remove('selected');
            card.querySelectorAll('.tier').forEach(tier => tier.classList.remove('selected'));
            this.selectedServices.delete(serviceId);
        } else {
            card.classList.add('selected');
            // Auto-select basic tier
            const basicTier = card.querySelector('.tier[data-tier="basic"]');
            if (basicTier) {
                basicTier.classList.add('selected');
                this.selectedServices.set(serviceId, {
                    name: card.querySelector('h3').textContent,
                    tier: 'basic',
                    price: parseFloat(basicTier.dataset.price)
                });
            }
        }
        
        this.updateSummary();
        this.updatePayPalButton();
    }

    selectTier(tier) {
        const card = tier.closest('.service-card');
        const serviceId = card.dataset.service;
        const tierName = tier.dataset.tier;
        const price = parseFloat(tier.dataset.price);

        // Remove selection from other tiers in the same service
        card.querySelectorAll('.tier').forEach(t => t.classList.remove('selected'));
        tier.classList.add('selected');

        // Ensure service card is selected
        card.classList.add('selected');

        // Update selected services
        this.selectedServices.set(serviceId, {
            name: card.querySelector('h3').textContent,
            tier: tierName,
            price: price
        });

        this.updateSummary();
        this.updatePayPalButton();
    }

    updateSummary() {
        const summaryContainer = document.getElementById('selected-services');
        const monthlyTotalElement = document.getElementById('monthly-total');
        const yearlyTotalElement = document.getElementById('yearly-total');
        const yearlyDiscountRow = document.querySelector('.yearly-discount');

        if (this.selectedServices.size === 0) {
            summaryContainer.innerHTML = '<p class="no-selection">Select services above to see your total</p>';
            monthlyTotalElement.textContent = '$0.00';
            yearlyTotalElement.textContent = '$0.00';
            yearlyDiscountRow.style.display = 'none';
            return;
        }

        // Build services list
        let servicesHTML = '';
        let monthlyTotal = 0;

        this.selectedServices.forEach((service, serviceId) => {
            monthlyTotal += service.price;
            servicesHTML += `
                <div class="selected-service">
                    <div class="service-info">
                        <h4>${service.name}</h4>
                        <p>${service.tier.charAt(0).toUpperCase() + service.tier.slice(1)} Tier</p>
                    </div>
                    <div class="service-price">$${service.price.toFixed(2)}/mo</div>
                </div>
            `;
        });

        summaryContainer.innerHTML = servicesHTML;
        monthlyTotalElement.textContent = `$${monthlyTotal.toFixed(2)}`;

        // Calculate yearly total with discount
        const yearlyTotal = monthlyTotal * 12 * 0.8; // 20% discount
        yearlyTotalElement.textContent = `$${yearlyTotal.toFixed(2)}`;
        yearlyDiscountRow.style.display = 'flex';
    }

    initializePayPal() {
        this.updatePayPalButton();
    }

    updatePayPalButton() {
        const container = document.getElementById('paypal-button-container');
        container.innerHTML = ''; // Clear existing button

        if (this.selectedServices.size === 0) {
            return;
        }

        const total = this.calculateTotal();
        
        paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: total.toFixed(2),
                            currency_code: 'USD'
                        },
                        description: this.getOrderDescription()
                    }]
                });
            },
            onApprove: (data, actions) => {
                return actions.order.capture().then((details) => {
                    this.handlePaymentSuccess(details);
                });
            },
            onError: (err) => {
                console.error('PayPal Error:', err);
                this.handlePaymentError(err);
            },
            style: {
                color: 'blue',
                shape: 'rect',
                label: 'pay',
                height: 50
            }
        }).render('#paypal-button-container');
    }

    calculateTotal() {
        let total = 0;
        this.selectedServices.forEach(service => {
            total += service.price;
        });

        if (this.isYearlyBilling) {
            total = total * 12 * 0.8; // 20% discount for yearly
        }

        return total;
    }

    getOrderDescription() {
        const services = Array.from(this.selectedServices.values())
            .map(service => `${service.name} (${service.tier})`)
            .join(', ');
        
        const billing = this.isYearlyBilling ? 'Yearly' : 'Monthly';
        return `NullTracker Premium - ${billing}: ${services}`;
    }

    handlePaymentSuccess(details) {
        // Show success message
        this.showNotification('Payment successful! Your premium services will be activated shortly.', 'success');
        
        // Here you would typically:
        // 1. Send payment details to your backend
        // 2. Activate premium services
        // 3. Send confirmation email
        
        console.log('Payment completed:', details);
        
        // Redirect to success page or show success modal
        setTimeout(() => {
            window.location.href = 'index.html?payment=success';
        }, 3000);
    }

    handlePaymentError(error) {
        this.showNotification('Payment failed. Please try again or contact support.', 'error');
        console.error('Payment error:', error);
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4ade80' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;
document.head.appendChild(style);

// Initialize payment manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PaymentManager();
});
