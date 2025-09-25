class DonationManager {
    constructor() {
        this.selectedAmount = 0;
        this.donors = [];
        this.init();
    }

    init() {
        this.loadDonors();
        this.setupEventListeners();
        this.initializePayPal();
        this.displayDonors();
    }

    setupEventListeners() {
        // Amount button selection
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectAmount(parseFloat(e.target.dataset.amount));
                document.getElementById('custom-amount').value = '';
            });
        });

        // Custom amount input
        document.getElementById('custom-amount').addEventListener('input', (e) => {
            const amount = parseFloat(e.target.value);
            if (amount && amount > 0) {
                this.selectAmount(amount);
                document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('selected'));
            }
        });

        // Export donors button
        document.getElementById('export-donors-btn').addEventListener('click', () => {
            this.exportDonors();
        });
    }

    selectAmount(amount) {
        this.selectedAmount = amount;
        
        // Update UI
        document.querySelectorAll('.amount-btn').forEach(btn => {
            if (parseFloat(btn.dataset.amount) === amount) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });

        // Update PayPal button
        this.updatePayPalButton();
    }

    initializePayPal() {
        this.updatePayPalButton();
    }

    updatePayPalButton() {
        const container = document.getElementById('paypal-button-container');
        container.innerHTML = '';

        if (this.selectedAmount <= 0) {
            container.innerHTML = '<p style="text-align: center; color: #94a3b8; font-style: italic;">Select an amount to continue</p>';
            return;
        }

        paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: this.selectedAmount.toFixed(2),
                            currency_code: 'USD'
                        },
                        description: `Donation to NullTracker - $${this.selectedAmount.toFixed(2)} USD`
                    }]
                });
            },
            onApprove: (data, actions) => {
                return actions.order.capture().then((details) => {
                    this.handleDonationSuccess(details);
                });
            },
            onError: (err) => {
                console.error('PayPal Error:', err);
                this.handleDonationError(err);
            },
            style: {
                color: 'blue',
                shape: 'rect',
                label: 'donate',
                height: 50
            }
        }).render('#paypal-button-container');
    }

    handleDonationSuccess(details) {
        const donorName = document.getElementById('donor-name').value.trim() || 'Anonymous';
        const donorEmail = document.getElementById('donor-email').value.trim();
        const donorMessage = document.getElementById('donor-message').value.trim();
        const showPublicly = document.getElementById('show-publicly').checked;
        
        const donation = {
            id: details.id,
            payerId: details.payer?.payer_id || 'N/A',
            payerEmail: details.payer?.email_address || donorEmail || 'N/A',
            amount: parseFloat(details.purchase_units[0].amount.value),
            currency: details.purchase_units[0].amount.currency_code,
            donorName: showPublicly ? donorName : 'Anonymous',
            donorEmail: donorEmail,
            donorMessage: donorMessage,
            showPublicly: showPublicly,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };

        // Add to donors list
        this.addDonor(donation);
        
        // Show success modal
        this.showDonationSuccessModal(donation);
        
        // Reset form
        this.resetForm();
        
        console.log('Donation completed:', donation);
    }

    handleDonationError(error) {
        this.showNotification('Donation failed. Please try again or contact support.', 'error');
        console.error('Donation error:', error);
    }

    addDonor(donation) {
        this.donors.unshift(donation); // Add to beginning of array
        this.saveDonors();
        this.displayDonors();
    }

    loadDonors() {
        try {
            const storedDonors = localStorage.getItem('nulltracker_donors');
            if (storedDonors) {
                this.donors = JSON.parse(storedDonors);
            }
        } catch (error) {
            console.error('Error loading donors:', error);
            this.donors = [];
        }
    }

    saveDonors() {
        try {
            localStorage.setItem('nulltracker_donors', JSON.stringify(this.donors));
        } catch (error) {
            console.error('Error saving donors:', error);
        }
    }

    displayDonors() {
        const donorsList = document.getElementById('donors-list');
        
        if (this.donors.length === 0) {
            donorsList.innerHTML = `
                <div class="empty-donors">
                    <i class="fas fa-heart-broken"></i>
                    <p>No donations yet. Be the first to support NullTracker!</p>
                </div>
            `;
            return;
        }

        const donorsHTML = this.donors.map((donor, index) => `
            <div class="donor-item">
                <span class="donor-rank">#${index + 1}</span>
                <div class="donor-info-display">
                    <div class="donor-name">${this.escapeHtml(donor.donorName)}</div>
                    ${donor.donorMessage ? `<div class="donor-message">"${this.escapeHtml(donor.donorMessage)}"</div>` : ''}
                    <div class="donor-date">${donor.date}</div>
                </div>
                <div class="donor-amount">$${donor.amount.toFixed(2)}</div>
            </div>
        `).join('');

        donorsList.innerHTML = donorsHTML;
    }

    exportDonors() {
        if (this.donors.length === 0) {
            this.showNotification('No donors to export yet!', 'error');
            return;
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            totalDonors: this.donors.length,
            totalAmount: this.donors.reduce((sum, donor) => sum + donor.amount, 0),
            donors: this.donors.map(donor => ({
                id: donor.id,
                payerId: donor.payerId,
                payerEmail: donor.payerEmail,
                amount: donor.amount,
                currency: donor.currency,
                donorName: donor.donorName,
                donorEmail: donor.donorEmail,
                donorMessage: donor.donorMessage,
                timestamp: donor.timestamp,
                date: donor.date
            }))
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `nulltracker_donors_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Donors list exported successfully!', 'success');
    }

    resetForm() {
        document.getElementById('donor-name').value = '';
        document.getElementById('donor-email').value = '';
        document.getElementById('donor-message').value = '';
        document.getElementById('custom-amount').value = '';
        document.getElementById('show-publicly').checked = true;
        
        document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('selected'));
        this.selectedAmount = 0;
        this.updatePayPalButton();
    }

    showDonationSuccessModal(donation) {
        const modal = document.createElement('div');
        modal.className = 'donation-success-modal';
        
        const verificationInfo = `Donation ID: ${donation.id}
Payer ID: ${donation.payerId}
Payer Email: ${donation.payerEmail}
Amount: ${donation.amount} ${donation.currency}
Donor Name: ${donation.donorName}
Message: ${donation.donorMessage || 'None'}
Timestamp: ${donation.timestamp}`;
        
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <i class="fas fa-heart success-icon"></i>
                        <h2>Thank You for Your Donation! 💝</h2>
                        <p>Your support helps keep NullTracker running for everyone</p>
                    </div>
                    
                    <div class="donation-details">
                        <h3>Donation Details</h3>
                        <div class="details-card">
                            <div class="detail-row">
                                <span class="label">Donation ID:</span>
                                <span class="value">${donation.id}</span>
                                <button class="copy-btn" data-copy="${donation.id}">📋</button>
                            </div>
                            <div class="detail-row">
                                <span class="label">Amount:</span>
                                <span class="value">$${donation.amount.toFixed(2)} ${donation.currency}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Date:</span>
                                <span class="value">${donation.date}</span>
                            </div>
                            ${donation.donorMessage ? `
                            <div class="detail-row">
                                <span class="label">Your Message:</span>
                                <span class="value">"${this.escapeHtml(donation.donorMessage)}"</span>
                            </div>` : ''}
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="copy-all-btn" data-copy-all='${JSON.stringify(verificationInfo).replace(/'/g, "\\'")}'>
                            <i class="fas fa-copy"></i> Copy All Details
                        </button>
                        <button class="close-modal-btn">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                    
                    <div class="thank-you-message">
                        <h4>🌟 You're Now Part of Our Community!</h4>
                        <p>Your donation helps us:</p>
                        <ul>
                            <li>Keep our servers running 24/7</li>
                            <li>Develop new security features</li>
                            <li>Provide free protection to communities</li>
                            <li>Respond quickly to new threats</li>
                        </ul>
                        <p><strong>Thank you for making Discord safer for everyone! ❤️</strong></p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.copyToClipboard(btn.dataset.copy);
            });
        });
        
        modal.querySelector('.copy-all-btn').addEventListener('click', () => {
            this.copyToClipboard(verificationInfo);
            this.showNotification('All details copied to clipboard!', 'success');
        });
        
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
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
                this.fallbackCopyToClipboard(text);
            });
        } else {
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
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4ade80' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add CSS for modals and animations
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
    
    .donation-success-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2000;
        animation: modalFadeIn 0.3s ease;
    }
    
    .donation-success-modal .modal-overlay {
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
    
    .donation-success-modal .modal-content {
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
    
    .donation-success-modal .modal-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .donation-success-modal .success-icon {
        font-size: 4rem;
        color: #ff6b6b;
        margin-bottom: 1rem;
        filter: drop-shadow(0 4px 8px rgba(255, 107, 107, 0.3));
    }
    
    .donation-success-modal .modal-header h2 {
        color: white;
        font-size: 2rem;
        margin-bottom: 0.5rem;
        font-weight: 700;
    }
    
    .donation-success-modal .modal-header p {
        color: #94a3b8;
        font-size: 1.1rem;
    }
    
    .donation-details h3 {
        color: white;
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        font-weight: 600;
    }
    
    .details-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(124, 58, 237, 0.2);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .detail-row:last-child {
        border-bottom: none;
    }
    
    .detail-row .label {
        color: #94a3b8;
        font-weight: 500;
        min-width: 100px;
    }
    
    .detail-row .value {
        color: white;
        font-weight: 600;
        flex: 1;
        text-align: center;
        margin: 0 0.5rem;
    }
    
    .detail-row .copy-btn {
        background: rgba(124, 58, 237, 0.2);
        border: 1px solid rgba(124, 58, 237, 0.3);
        border-radius: 6px;
        padding: 0.25rem 0.5rem;
        color: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }
    
    .detail-row .copy-btn:hover {
        background: rgba(124, 58, 237, 0.4);
        transform: scale(1.05);
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
    
    .thank-you-message {
        background: rgba(255, 107, 107, 0.1);
        border: 1px solid rgba(255, 107, 107, 0.3);
        border-radius: 12px;
        padding: 1.5rem;
    }
    
    .thank-you-message h4 {
        color: #ff6b6b;
        font-size: 1.25rem;
        margin-bottom: 1rem;
        font-weight: 600;
    }
    
    .thank-you-message p {
        color: #e2e8f0;
        line-height: 1.6;
        margin-bottom: 1rem;
    }
    
    .thank-you-message ul {
        color: #cbd5e1;
        line-height: 1.6;
        padding-left: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .thank-you-message li {
        margin-bottom: 0.5rem;
    }
    
    @media (max-width: 768px) {
        .donation-success-modal .modal-overlay {
            padding: 1rem;
        }
        
        .donation-success-modal .modal-content {
            padding: 1.5rem;
        }
        
        .modal-actions {
            flex-direction: column;
        }
        
        .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
        
        .detail-row .value {
            margin: 0;
            text-align: left;
        }
    }
`;
document.head.appendChild(style);

// Initialize donation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DonationManager();
    initializeModernFeatures();
});

// Modern Dark Theme Features
function initializeModernFeatures() {
    // Animate counter numbers on scroll
    const counterElements = document.querySelectorAll('.stat-number[data-count]');
    const progressBar = document.querySelector('.progress-fill[data-progress]');
    const navbarScrollEffect = document.querySelector('.navbar');
    
    // Initialize Intersection Observer for animations
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate counters
                if (entry.target.hasAttribute('data-count')) {
                    animateCounter(entry.target);
                }
                
                // Animate progress bar
                if (entry.target.classList.contains('progress-fill')) {
                    animateProgressBar(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe counter elements
    counterElements.forEach(element => {
        observer.observe(element);
    });
    
    // Observe progress bar
    if (progressBar) {
        observer.observe(progressBar);
    }
    
    // Enhanced navbar scroll effect
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbarScrollEffect.style.background = 'rgba(10, 10, 10, 0.98)';
            navbarScrollEffect.style.backdropFilter = 'blur(20px)';
        } else {
            navbarScrollEffect.style.background = 'rgba(10, 10, 10, 0.95)';
            navbarScrollEffect.style.backdropFilter = 'blur(12px)';
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Add Discord integration
    const addToDiscordBtn = document.getElementById('addToDiscord');
    if (addToDiscordBtn) {
        addToDiscordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening Discord...';
            this.disabled = true;
            
            // Replace with your actual Discord bot invite URL
            const inviteURL = 'https://discord.com/oauth2/authorize?client_id=1361385084233580698&permissions=8&scope=bot%20applications.commands';
            
            setTimeout(() => {
                window.open(inviteURL, '_blank');
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 2000);
            }, 500);
        });
    }
    
    // Update supporters count in footer
    updateSupportersCount();
    
    console.log('🎨 Modern dark theme features initialized!');
}

// Animate counter numbers
function animateCounter(element) {
    if (element.classList.contains('animated')) return;
    element.classList.add('animated');
    
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const counter = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Animate progress bar
function animateProgressBar(element) {
    if (element.classList.contains('animated')) return;
    element.classList.add('animated');
    
    const progress = parseInt(element.getAttribute('data-progress'));
    element.style.width = '0%';
    
    setTimeout(() => {
        element.style.width = progress + '%';
    }, 500);
}

// Update supporters count
function updateSupportersCount() {
    const supportersElement = document.getElementById('total-supporters');
    if (supportersElement) {
        try {
            const storedDonors = localStorage.getItem('nulltracker_donors');
            const donors = storedDonors ? JSON.parse(storedDonors) : [];
            const count = donors.length;
            
            // Animate the count
            let current = 0;
            const increment = count / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= count) {
                    supportersElement.textContent = count;
                    clearInterval(timer);
                } else {
                    supportersElement.textContent = Math.floor(current);
                }
            }, 20);
        } catch (error) {
            supportersElement.textContent = '0';
        }
    }
}

// Enhanced hover effects for cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.donation-form-card, .impact-info-card, .community-card, .stat-item');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});
