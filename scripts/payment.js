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
        // Dropdown selection
        document.querySelectorAll('.tier-select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.handleSelectChange(select);
            });
        });

        // Yearly billing toggle
        document.getElementById('yearly-billing').addEventListener('change', (e) => {
            this.isYearlyBilling = e.target.checked;
            this.updateSummary();
            this.updatePayPalButton();
        });
    }

    handleSelectChange(select) {
        const serviceId = select.dataset.service;
        const selectedOption = select.options[select.selectedIndex];
        const tierName = selectedOption.value;
        const price = parseFloat(selectedOption.dataset.price);
        
        if (tierName === '' || price === 0) {
            // "Select Plan" option chosen, remove service
            this.selectedServices.delete(serviceId);
        } else {
            // Get service name from the h3 element in the same service row
            const serviceRow = select.closest('.service-row');
            const serviceName = serviceRow.querySelector('h3').textContent;
            
            // Update selected services
            this.selectedServices.set(serviceId, {
                name: serviceName,
                tier: tierName,
                price: price
            });
        }
        
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
        // Show payment verification modal
        this.showPaymentVerificationModal(details);
        
        console.log('Payment completed:', details);
    }

    handlePaymentError(error) {
        this.showNotification('Payment failed. Please try again or contact support.', 'error');
        console.error('Payment error:', error);
    }

    showPaymentVerificationModal(details) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'payment-verification-modal';
        
        // Get current timestamp
        const timestamp = new Date().toISOString();
        const paymentId = details.id || 'N/A';
        const payerId = details.payer?.payer_id || 'N/A';
        const payerEmail = details.payer?.email_address || 'N/A';
        const amount = details.purchase_units?.[0]?.amount?.value || '0.00';
        const currency = details.purchase_units?.[0]?.amount?.currency_code || 'USD';
        
        // Get selected services info
        const selectedServicesInfo = Array.from(this.selectedServices.entries()).map(([serviceId, service]) => {
            return `${service.name} (${service.tier.charAt(0).toUpperCase() + service.tier.slice(1)}) - $${service.price.toFixed(2)}/mo`;
        }).join('\n');
        
        const billingType = this.isYearlyBilling ? 'Yearly (20% discount applied)' : 'Monthly';
        
        // Create verification info text
        const verificationInfo = `Payment ID: ${paymentId}
Payer ID: ${payerId}
Payer Email: ${payerEmail}
Amount: ${amount} ${currency}
Billing: ${billingType}
Timestamp: ${timestamp}
Services:
${selectedServicesInfo}`;
        
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <i class="fas fa-check-circle success-icon"></i>
                        <h2>Payment Successful!</h2>
                        <p>Please save this information for verification</p>
                    </div>
                    
                    <div class="verification-info">
                        <h3>Payment Verification Details</h3>
                        <div class="info-card">
                            <div class="info-row">
                                <span class="label">Payment ID:</span>
                                <span class="value" id="payment-id">${paymentId}</span>
                                <button class="copy-btn" data-copy="${paymentId}">📋</button>
                            </div>
                            <div class="info-row">
                                <span class="label">Payer ID:</span>
                                <span class="value" id="payer-id">${payerId}</span>
                                <button class="copy-btn" data-copy="${payerId}">📋</button>
                            </div>
                            <div class="info-row">
                                <span class="label">Email:</span>
                                <span class="value" id="payer-email">${payerEmail}</span>
                                <button class="copy-btn" data-copy="${payerEmail}">📋</button>
                            </div>
                            <div class="info-row">
                                <span class="label">Amount:</span>
                                <span class="value">${amount} ${currency}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Billing:</span>
                                <span class="value">${billingType}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Timestamp:</span>
                                <span class="value" id="timestamp">${timestamp}</span>
                                <button class="copy-btn" data-copy="${timestamp}">📋</button>
                            </div>
                        </div>
                        
                        <div class="services-info">
                            <h4>Selected Services:</h4>
                            <div class="services-list">
                                ${Array.from(this.selectedServices.entries()).map(([serviceId, service]) => `
                                    <div class="service-item">
                                        <span>${service.name}</span>
                                        <span>${service.tier.charAt(0).toUpperCase() + service.tier.slice(1)} - $${service.price.toFixed(2)}/mo</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="copy-all-btn" id="copy-all-btn">
                            <i class="fas fa-copy"></i> Copy All Information
                        </button>
                        <button class="close-modal-btn" id="close-modal-btn">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                    
                    <div class="instructions">
                        <h4>📝 Next Steps:</h4>
                        <ol>
                            <li>Copy the Payment ID and other verification details above</li>
                            <li>Contact support with your Payment ID to activate your premium services</li>
                            <li>Keep this information for your records</li>
                        </ol>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for copy buttons
        modal.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.dataset.copy;
                this.copyToClipboard(text);
            });
        });
        
        // Add event listener for copy all button
        modal.querySelector('#copy-all-btn').addEventListener('click', () => {
            this.copyToClipboard(verificationInfo);
            this.showNotification('All information copied to clipboard!', 'success');
        });
        
        // Add event listener for close button
        modal.querySelector('#close-modal-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close modal when clicking outside
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                document.body.removeChild(modal);
            }
        });
    }
    
    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Copied to clipboard!', 'success');
            }).catch(() => {
                // Fallback for older browsers
                this.fallbackCopyToClipboard(text);
            });
        } else {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(text);
        }
    }
    
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Copied to clipboard!', 'success');
        } catch (err) {
            this.showNotification('Failed to copy to clipboard', 'error');
        }
        
        document.body.removeChild(textArea);
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
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Add CSS animations and modal styles
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
    
    @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .payment-verification-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2000;
        animation: modalFadeIn 0.3s ease;
    }
    
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }
    
    .modal-content {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid rgba(124, 58, 237, 0.3);
        border-radius: 20px;
        padding: 2rem;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }
    
    .modal-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .success-icon {
        font-size: 4rem;
        color: #4ade80;
        margin-bottom: 1rem;
        filter: drop-shadow(0 4px 8px rgba(74, 222, 128, 0.3));
    }
    
    .modal-header h2 {
        color: white;
        font-size: 2rem;
        margin-bottom: 0.5rem;
        font-weight: 700;
    }
    
    .modal-header p {
        color: #94a3b8;
        font-size: 1.1rem;
    }
    
    .verification-info h3 {
        color: white;
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        font-weight: 600;
    }
    
    .info-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(124, 58, 237, 0.2);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .info-row:last-child {
        border-bottom: none;
    }
    
    .info-row .label {
        color: #94a3b8;
        font-weight: 500;
        min-width: 100px;
    }
    
    .info-row .value {
        color: white;
        font-weight: 600;
        font-family: monospace;
        background: rgba(124, 58, 237, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        margin-right: 0.5rem;
        flex: 1;
        text-align: center;
    }
    
    .copy-btn {
        background: rgba(124, 58, 237, 0.2);
        border: 1px solid rgba(124, 58, 237, 0.3);
        border-radius: 6px;
        padding: 0.25rem 0.5rem;
        color: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        min-width: 30px;
    }
    
    .copy-btn:hover {
        background: rgba(124, 58, 237, 0.4);
        transform: scale(1.05);
    }
    
    .services-info h4 {
        color: white;
        font-size: 1.25rem;
        margin-bottom: 1rem;
        font-weight: 600;
    }
    
    .services-list {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(124, 58, 237, 0.2);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 2rem;
    }
    
    .service-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
    }
    
    .service-item:last-child {
        border-bottom: none;
    }
    
    .service-item span:first-child {
        font-weight: 500;
    }
    
    .service-item span:last-child {
        color: #7c3aed;
        font-weight: 600;
    }
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .copy-all-btn, .close-modal-btn {
        flex: 1;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        border: none;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .copy-all-btn {
        background: linear-gradient(135deg, #7c3aed, #3b82f6);
        color: white;
        box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
    }
    
    .copy-all-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
    }
    
    .close-modal-btn {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .close-modal-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }
    
    .instructions {
        background: rgba(74, 222, 128, 0.1);
        border: 1px solid rgba(74, 222, 128, 0.3);
        border-radius: 12px;
        padding: 1.5rem;
    }
    
    .instructions h4 {
        color: #4ade80;
        font-size: 1.25rem;
        margin-bottom: 1rem;
        font-weight: 600;
    }
    
    .instructions ol {
        color: #e2e8f0;
        line-height: 1.6;
        padding-left: 1.5rem;
    }
    
    .instructions li {
        margin-bottom: 0.5rem;
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
        .modal-overlay {
            padding: 1rem;
        }
        
        .modal-content {
            padding: 1.5rem;
        }
        
        .modal-actions {
            flex-direction: column;
        }
        
        .info-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
        
        .info-row .value {
            margin-right: 0;
            text-align: left;
        }
    }
`;
document.head.appendChild(style);

// Initialize payment manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PaymentManager();
});