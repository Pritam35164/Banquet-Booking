// Authentication JavaScript

// Show login form
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('signupTab').classList.remove('active');
}

// Show signup form
function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('signupTab').classList.add('active');
}

// Select role
function selectRole(role) {
    const clientForm = document.getElementById('clientSignupForm');
    const ownerForm = document.getElementById('ownerSignupForm');
    
    if (role === 'client') {
        clientForm.style.display = 'block';
        ownerForm.style.display = 'none';
        document.getElementById('roleClient').checked = true;
    } else {
        clientForm.style.display = 'none';
        ownerForm.style.display = 'block';
        document.getElementById('roleOwner').checked = true;
    }
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification('Login successful!', 'success');
        
        // Redirect based on role
        setTimeout(() => {
            if (user.role === 'owner') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'client-dashboard.html';
            }
        }, 1000);
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

// Handle signup
function handleSignup(event, role) {
    event.preventDefault();
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    let userData = {
        id: generateId(),
        role: role,
        createdAt: new Date().toISOString()
    };
    
    if (role === 'client') {
        const email = document.getElementById('clientEmail').value;
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            showNotification('Email already registered', 'error');
            return;
        }
        
        userData = {
            ...userData,
            name: document.getElementById('clientName').value,
            email: email,
            phone: document.getElementById('clientPhone').value,
            password: document.getElementById('clientPassword').value
        };
    } else {
        const email = document.getElementById('ownerEmail').value;
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            showNotification('Email already registered', 'error');
            return;
        }
        
        userData = {
            ...userData,
            name: document.getElementById('ownerName').value,
            email: email,
            phone: document.getElementById('ownerPhone').value,
            venueName: document.getElementById('venueName').value,
            venueAddress: document.getElementById('venueAddress').value,
            password: document.getElementById('ownerPassword').value
        };
    }
    
    // Add user
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Store current user
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    showNotification('Account created successfully!', 'success');
    
    // Redirect based on role
    setTimeout(() => {
        if (role === 'owner') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'client-dashboard.html';
        }
    }, 1000);
}

// Check URL parameters on load
document.addEventListener('DOMContentLoaded', function() {
    const signup = getUrlParameter('signup');
    const role = getUrlParameter('role');
    
    if (signup === 'true') {
        showSignup();
        if (role === 'owner') {
            selectRole('owner');
        }
    }
});
