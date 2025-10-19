// Contact Form Handling
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value,
        timestamp: new Date().toISOString()
    };

    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Phone validation (optional field, but if provided should be valid)
    if (formData.phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 10) {
            showNotification('Please enter a valid phone number', 'error');
            return;
        }
    }

    // Submit to backend
    submitContactForm(formData);
}

async function submitContactForm(formData) {
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Thank you for contacting us! We will get back to you soon.', 'success');
            
            // Reset form
            document.getElementById('contactForm').reset();
            
            // Store in localStorage as backup
            storeContactMessage(formData);
        } else {
            throw new Error(data.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        
        // Fallback to localStorage if API fails
        storeContactMessage(formData);
        showNotification('Message saved! We will contact you soon.', 'success');
        document.getElementById('contactForm').reset();
    }
}

// Store contact message in localStorage as backup
function storeContactMessage(formData) {
    try {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        messages.push(formData);
        localStorage.setItem('contactMessages', JSON.stringify(messages));
    } catch (error) {
        console.error('Failed to store message:', error);
    }
}

// FAQ Toggle
function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add styles if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fff;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .notification-success {
                border-left: 4px solid #10b981;
            }
            
            .notification-error {
                border-left: 4px solid #ef4444;
            }
            
            .notification-info {
                border-left: 4px solid #3b82f6;
            }
            
            .notification i:first-child {
                font-size: 1.3rem;
            }
            
            .notification-success i:first-child {
                color: #10b981;
            }
            
            .notification-error i:first-child {
                color: #ef4444;
            }
            
            .notification-info i:first-child {
                color: #3b82f6;
            }
            
            .notification span {
                flex: 1;
                font-size: 0.95rem;
                color: #333;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                color: #666;
                transition: color 0.2s;
            }
            
            .notification-close:hover {
                color: #333;
            }
            
            @media (max-width: 768px) {
                .notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (user) {
        // Update navigation for logged-in users
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            const dashboardUrl = user.role === 'owner' ? 'admin-dashboard.html' : 'client-dashboard.html';
            navActions.innerHTML = `
                <a href="${dashboardUrl}" class="btn btn-outline">
                    <i class="fas fa-user"></i> ${user.name}
                </a>
                <button onclick="logout()" class="btn btn-primary">Logout</button>
            `;
        }
        
        // Pre-fill contact form with user data
        if (user.name) document.getElementById('contactName').value = user.name;
        if (user.email) document.getElementById('contactEmail').value = user.email;
        if (user.phone) document.getElementById('contactPhone').value = user.phone;
    }
    
    // Clear navigation flags
    sessionStorage.removeItem('navigatingHome');
    sessionStorage.removeItem('navigatingSearch');
});

// Logout function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Add slideOut animation
const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(slideOutStyle);
