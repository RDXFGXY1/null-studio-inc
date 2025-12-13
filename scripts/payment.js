class PaymentManager {
    constructor() {
        this.selectedServices = new Map();
        this.userIdInput = document.getElementById('user-id');
        this.guildIdInput = document.getElementById('guild-id');
        this.paymentErrorMessage = document.getElementById('payment-error-message');
        this.promoCodeInput = document.getElementById('promo-code');
        this.applyPromoBtn = document.getElementById('apply-promo-btn');
        this.promoMessage = document.getElementById('promo-message');
        this.discountRow = document.querySelector('.discount-row');
        this.discountAmountElement = document.getElementById('discount-amount');
        this.appliedDiscount = null;
        this.promoCodes = {
            'SAVE10': { type: 'percent', value: 0.10 },
            '5OFF': { type: 'fixed', value: 5 },
            'HINATA2024': { type: 'percent', value: 0.25 }
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updatePayPalButton();
    }

    setupEventListeners() {
        document.querySelectorAll('.tier-select').forEach(select => {
            select.addEventListener('change', () => this.handleSelectChange(select));
        });

        this.userIdInput.addEventListener('input', () => this.updatePayPalButton());
        this.guildIdInput.addEventListener('input', () => this.updatePayPalButton());
        
        if (this.applyPromoBtn) {
            this.applyPromoBtn.addEventListener('click', () => this.applyPromoCode());
        }
    }

    applyPromoCode() {
        const code = this.promoCodeInput.value.trim().toUpperCase();
        if (this.promoCodes[code]) {
            this.appliedDiscount = this.promoCodes[code];
            this.promoMessage.textContent = 'Promo code applied!';
            this.promoMessage.className = 'success';
        } else {
            this.appliedDiscount = null;
            this.promoMessage.textContent = 'Invalid promo code.';
            this.promoMessage.className = 'error';
        }
        this.updateSummary();
        this.updatePayPalButton();
    }

    handleSelectChange(select) {
        const serviceId = select.dataset.service;
        const tier = select.dataset.tier;
        const price = parseFloat(select.dataset.price);

        // Find the service name from the preceding header
        let headerElement = select.closest('li').previousElementSibling;
        while(headerElement && !headerElement.classList.contains('service-header')) {
            headerElement = headerElement.previousElementSibling;
        }
        const serviceName = headerElement ? headerElement.textContent.trim() : 'Unknown Service';


        if (select.value === 'select') {
            this.selectedServices.set(serviceId, {
                name: serviceName,
                tier: tier,
                price: price
            });
        } else {
            this.selectedServices.delete(serviceId);
        }
        
        this.updateSummary();
        this.updatePayPalButton();
    }

    updateSummary() {
        const summaryContainer = document.getElementById('selected-services');
        const monthlyTotalElement = document.getElementById('monthly-total');
        const grandTotalElement = document.getElementById('grand-total');

        if (this.selectedServices.size === 0) {
            summaryContainer.innerHTML = '<p class="no-selection">Your cart is empty.</p>';
            monthlyTotalElement.textContent = '$0.00';
            if (this.discountRow) this.discountRow.style.display = 'none';
            grandTotalElement.textContent = '$0.00';
            return;
        }

        let subtotal = 0;
        let servicesHTML = '';
        this.selectedServices.forEach((service) => {
            subtotal += service.price;
            servicesHTML += `
                <div class="selected-service">
                    <div class="service-info">
                        <h4>${service.name}</h4>
                        <p>${service.tier.charAt(0).toUpperCase() + service.tier.slice(1)}</p>
                    </div>
                    <div class="service-price">$${service.price.toFixed(2)}</div>
                </div>
            `;
        });

        summaryContainer.innerHTML = servicesHTML;
        monthlyTotalElement.textContent = `$${subtotal.toFixed(2)}`;

        const { total, discountAmount } = this.calculateTotal(subtotal);

        if (this.appliedDiscount && discountAmount > 0) {
            this.discountAmountElement.textContent = `-$${discountAmount.toFixed(2)}`;
            this.discountRow.style.display = 'flex';
        } else if (this.discountRow) {
            this.discountRow.style.display = 'none';
        }

        grandTotalElement.textContent = `$${total.toFixed(2)}`;
    }

    calculateTotal(subtotal) {
        let discountAmount = 0;
        if (this.appliedDiscount) {
            if (this.appliedDiscount.type === 'percent') {
                discountAmount = subtotal * this.appliedDiscount.value;
            } else if (this.appliedDiscount.type === 'fixed') {
                discountAmount = this.appliedDiscount.value;
            }
        }
        let total = subtotal - discountAmount;
        return { total: total < 0 ? 0 : total, discountAmount };
    }

    updatePayPalButton() {
        const container = document.getElementById('paypal-button-container');
        if (!container) return;
        container.innerHTML = '';

        const userId = this.userIdInput.value.trim();
        const guildId = this.guildIdInput.value.trim();

        if (this.selectedServices.size === 0) {
            this.paymentErrorMessage.textContent = 'Please select a service plan.';
            this.paymentErrorMessage.style.display = 'block';
            return;
        }
        if (!userId) {
            this.paymentErrorMessage.textContent = 'User ID is required.';
            this.paymentErrorMessage.style.display = 'block';
            return;
        }
        if (!guildId) {
            this.paymentErrorMessage.textContent = 'Guild ID is required.';
            this.paymentErrorMessage.style.display = 'block';
            return;
        }

        this.paymentErrorMessage.style.display = 'none';
        
        let subtotal = 0;
        this.selectedServices.forEach(service => { subtotal += service.price; });
        const { total } = this.calculateTotal(subtotal);
        
        paypal.Buttons({
            createOrder: (data, actions) => actions.order.create({
                purchase_units: [{
                    amount: { value: total.toFixed(2), currency_code: 'USD' },
                    description: this.getOrderDescription(),
                    custom_id: `USER:${userId}|GUILD:${guildId}`
                }]
            }),
            onApprove: (data, actions) => actions.order.capture().then(details => {
                this.handlePaymentSuccess(details, userId, guildId);
            }),
            onError: (err) => this.handlePaymentError(err),
            style: {
                layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay', height: 50
            }
        }).render('#paypal-button-container');
    }

    getOrderDescription() {
        const services = Array.from(this.selectedServices.values())
            .map(s => `${s.name} (${s.tier})`).join(', ');
        return `Hinata Premium: ${services}${this.appliedDiscount ? ' (Promo applied)' : ''}`;
    }

    handlePaymentSuccess(details, userId, guildId) {
        this.showPaymentVerificationModal(details, userId, guildId);
    }

    handlePaymentError(error) {
        this.showNotification('Payment failed. Please try again.', 'error');
        console.error('PayPal Error:', error);
    }

    showPaymentVerificationModal(details, userId, guildId) {
        const modal = document.createElement('div');
        modal.className = 'payment-verification-modal';
        
        const timestamp = new Date().toISOString();
        const paymentId = details.id || 'N/A';
        const payerId = details.payer?.payer_id || 'N/A';
        const payerEmail = details.payer?.email_address || 'N/A';
        const amount = details.purchase_units?.[0]?.amount?.value || '0.00';
        const currency = details.purchase_units?.[0]?.amount?.currency_code || 'USD';

        let subtotal = 0;
        this.selectedServices.forEach(service => { subtotal += service.price; });
        const { discountAmount } = this.calculateTotal(subtotal);

        const selectedServicesInfo = Array.from(this.selectedServices.values()).map(service => {
            return `${service.name} (${service.tier.charAt(0).toUpperCase() + service.tier.slice(1)}) - $${service.price.toFixed(2)}/mo`;
        }).join('\n');
        
        const verificationInfo = `Payment ID: ${paymentId}\nPayer ID: ${payerId}\nPayer Email: ${payerEmail}\nAmount Paid: ${amount} ${currency}\nTimestamp: ${timestamp}\nUser ID: ${userId}\nGuild ID: ${guildId}\n\nServices:\n${selectedServicesInfo}`;
        
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <i class="fas fa-check-circle success-icon"></i>
                        <h2>Payment Successful!</h2>
                        <p>Please save this information for verification.</p>
                    </div>
                    <div class="verification-info">
                        <h3>Payment Verification Details</h3>
                        <div class="info-card">
                            <div class="info-row">
                                <span class="label">Payment ID:</span>
                                <span class="value">${paymentId}</span>
                                <button class="copy-btn" data-copy="${paymentId}">📋</button>
                            </div>
                            <div class="info-row">
                                <span class="label">Payer ID:</span>
                                <span class="value">${payerId}</span>
                                <button class="copy-btn" data-copy="${payerId}">📋</button>
                            </div>
                             <div class="info-row">
                                <span class="label">User ID:</span>
                                <span class="value">${userId}</span>
                                <button class="copy-btn" data-copy="${userId}">📋</button>
                            </div>
                             <div class="info-row">
                                <span class="label">Guild ID:</span>
                                <span class="value">${guildId}</span>
                                <button class="copy-btn" data-copy="${guildId}">📋</button>
                            </div>
                            <div class="info-row">
                                <span class="label">Amount Paid:</span>
                                <span class="value">${amount} ${currency}</span>
                            </div>
                            ${this.appliedDiscount ? `
                            <div class="info-row">
                                <span class="label">Discount:</span>
                                <span class="value">-$${discountAmount.toFixed(2)}</span>
                            </div>` : ''}
                            <div class="info-row">
                                <span class="label">Timestamp:</span>
                                <span class="value">${timestamp}</span>
                                <button class="copy-btn" data-copy="${timestamp}">📋</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="copy-all-btn"><i class="fas fa-copy"></i> Copy All Details</button>
                        <button class="close-modal-btn"><i class="fas fa-times"></i> Close</button>
                    </div>
                     <div class="instructions">
                        <h4>📝 Next Steps:</h4>
                        <ol>
                            <li>Copy your verification details.</li>
                            <li>Contact support with your Payment ID to activate your premium services.</li>
                            <li>Keep this information for your records.</li>
                        </ol>
                    </div>
                </div>
            </div>`;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.copy-all-btn').addEventListener('click', () => {
            this.copyToClipboard(verificationInfo);
        });
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        modal.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.dataset.copy;
                this.copyToClipboard(text);
            });
        });
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.body.removeChild(modal);
            }
        });
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard!', 'success');
        }).catch(() => this.fallbackCopyToClipboard(text));
    }

    fallbackCopyToClipboard(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            this.showNotification('Copied to clipboard!', 'success');
        } catch (err) {
            this.showNotification('Failed to copy', 'error');
        }
        document.body.removeChild(ta);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i><span>${message}</span>`;
        document.body.appendChild(notification);
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PaymentManager();
});
