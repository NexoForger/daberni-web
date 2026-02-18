// Countdown Timer
function initCountdown() {
    // Set launch date (30 days from now)
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30);
    launchDate.setHours(0, 0, 0, 0);

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = launchDate - now;

        if (distance < 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Email Subscription Handler
function initSubscription() {
    const form = document.getElementById('subscriptionForm');
    const emailInput = document.getElementById('emailInput');
    const message = document.getElementById('subscriptionMessage');

    if (!form || !emailInput || !message) {
        return;
    }
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
            showMessage('Please enter your email address', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        // Simulate subscription (in real app, this would call an API)
        showMessage('Thank you! We\'ll notify you when we launch! 🚀', 'success');
        emailInput.value = '';
        
        // Add to localStorage for demo purposes
        const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
        }
    });

    function showMessage(text, type) {
        message.textContent = text;
        message.className = `subscription-message ${type}`;
        
        setTimeout(() => {
            message.textContent = '';
            message.className = 'subscription-message';
        }, 5000);
    }

    function isValidEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }
}

// Add parallax effect to floating elements
function initParallax() {
    const floatItems = document.querySelectorAll('.float-item');
    let ticking = false;
    let mouseX = 0;
    let mouseY = 0;
    
    function updateParallax() {
        floatItems.forEach((item, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 50;
            const y = (mouseY - 0.5) * speed * 50;
            
            item.style.transform = `translate(${x}px, ${y}px)`;
        });
        ticking = false;
    }
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
        
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add intersection observer for animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements (if any need scroll animations)
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initSubscription();
    initParallax();
    initSmoothScroll();
    initScrollAnimations();

    // Add console message for developers (only in local/development environments)
    if (window && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        console.log('%c🚖 Daberni - Coming Soon! ', 'background: #FFD700; color: #000; font-size: 20px; padding: 10px; font-weight: bold;');
        console.log('%cWe\'re building something amazing for Lebanon! 🇱🇧', 'font-size: 14px; color: #ED1C24;');
    }
});
