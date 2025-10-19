// Payment Page JavaScript

let currentBooking = null;

// Initialize payment page
document.addEventListener('DOMContentLoaded', function() {
    const bookingId = getUrlParameter('booking');
    
    if (!bookingId) {
        window.location.href = 'client-dashboard.html';
        return;
    }
    
    currentBooking = getBookingById(bookingId);
    
    if (!currentBooking) {
        window.location.href = 'client-dashboard.html';
        return;
    }
    
    loadOrderSummary();
});

// Load order summary
function loadOrderSummary() {
    const venue = getVenueById(currentBooking.venueId);
    const orderSummary = document.getElementById('orderSummary');
    
    orderSummary.innerHTML = `
        ${venue ? `<img src="${venue.images[0]}" alt="${currentBooking.venueName}" class="venue-image-small">` : ''}
        
        <h3 style="margin-bottom: 1rem;">${currentBooking.venueName}</h3>
        
        <div class="summary-item">
            <span class="summary-label">Booking ID</span>
            <span class="summary-value">${currentBooking.id}</span>
        </div>
        
        <div class="summary-item">
            <span class="summary-label">Event Date</span>
            <span class="summary-value">${formatDate(currentBooking.date)}</span>
        </div>
        
        <div class="summary-item">
            <span class="summary-label">Number of Guests</span>
            <span class="summary-value">${currentBooking.guests}</span>
        </div>
        
        <div class="summary-item">
            <span class="summary-label">Per Plate</span>
            <span class="summary-value">${formatCurrency(currentBooking.pricePerPlate)}</span>
        </div>
        
        <div class="summary-item">
            <span class="summary-label">Catering Cost</span>
            <span class="summary-value">${formatCurrency(currentBooking.guests * currentBooking.pricePerPlate)}</span>
        </div>
        
        <div class="summary-item">
            <span class="summary-label">Hall Rental</span>
            <span class="summary-value">${formatCurrency(currentBooking.hallRental)}</span>
        </div>
        
        <div class="summary-item">
            <span class="summary-label">Total Amount</span>
            <span class="summary-value">${formatCurrency(currentBooking.total)}</span>
        </div>
    `;
    
    // Update total amount in button
    document.getElementById('totalAmount').textContent = formatCurrency(currentBooking.total);
}

// Show payment form
function showPaymentForm(method) {
    // Hide all forms
    document.querySelectorAll('.payment-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Show selected form
    const formMap = {
        'card': 'cardForm',
        'netbanking': 'netbankingForm',
        'upi': 'upiForm'
    };
    
    document.getElementById(formMap[method]).style.display = 'block';
}

// Pay with UPI app
function payWithApp(app) {
    const appNames = {
        'gpay': 'Google Pay',
        'phonepe': 'PhonePe',
        'paytm': 'Paytm'
    };
    
    showNotification(`Redirecting to ${appNames[app]}...`, 'info');
    
    setTimeout(() => {
        processPaymentSuccess();
    }, 2000);
}

// Process payment
function processPayment(event) {
    event.preventDefault();
    
    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        processPaymentSuccess();
    }, 2000);
}

// Process payment success
function processPaymentSuccess() {
    // Update booking status
    const paymentDate = new Date().toISOString();
    updateBooking(currentBooking.id, {
        paymentStatus: 'Paid',
        status: 'Confirmed',
        paidAt: paymentDate,
        paymentDate: paymentDate,
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Card'
    });
    
    // Update current booking object for display
    currentBooking.paymentStatus = 'Paid';
    currentBooking.status = 'Confirmed';
    currentBooking.paidAt = paymentDate;
    
    // Show success notification
    showNotification('Payment successful!', 'success');
    
    // Redirect to success page with animation
    setTimeout(() => {
        showPaymentSuccessModal();
    }, 1000);
}

// Show payment success modal
function showPaymentSuccessModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-in-out;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 3rem;
            text-align: center;
            max-width: 500px;
            animation: slideIn 0.3s ease-in-out;
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #10b981, #059669);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 2rem;
            ">
                <i class="fas fa-check" style="font-size: 3rem; color: white;"></i>
            </div>
            <h2 style="font-size: 2rem; color: var(--text-dark); margin-bottom: 1rem;">
                Payment Successful!
            </h2>
            <p style="color: var(--text-light); margin-bottom: 2rem; line-height: 1.6;">
                Your booking has been confirmed. You will receive a confirmation email shortly.
            </p>
            <div style="
                background: var(--bg-light);
                padding: 1.5rem;
                border-radius: 12px;
                margin-bottom: 2rem;
            ">
                <div style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 0.5rem;">
                    Booking ID
                </div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">
                    ${currentBooking.id}
                </div>
            </div>
            <button onclick="window.location.href='client-dashboard.html'" class="btn btn-primary btn-block btn-large">
                <i class="fas fa-th-large"></i> Go to Dashboard
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}
