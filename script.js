/**
 * Daberni Landing Page Interactivity
 * Focus: H3 Hex Grid Background & Request Handling
 */

document.addEventListener('DOMContentLoaded', () => {
    initHexGrid();
    initFormHandler();
    initLangToggle();
    initScrollReveal();
});

/**
 * Animated Hexagonal Grid Background
 */
function initHexGrid() {
    const canvas = document.getElementById('hexGridCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let hexagons = [];

    const hexSize = 40;
    const hexWidth = hexSize * Math.sqrt(3);
    const hexHeight = hexSize * 2;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createHexagons();
    }

    function createHexagons() {
        hexagons = [];
        const cols = Math.ceil(width / hexWidth) + 1;
        const rows = Math.ceil(height / (hexHeight * 0.75)) + 1;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * hexWidth + (r % 2 === 0 ? 0 : hexWidth / 2);
                const y = r * hexHeight * 0.75;
                hexagons.push({
                    x, y,
                    opacity: Math.random() * 0.5,
                    targetOpacity: Math.random() * 0.5,
                    pulseSpeed: 0.005 + Math.random() * 0.01
                });
            }
        }
    }

    function drawHex(x, y, size, opacity) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + Math.PI / 6;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(0, 242, 255, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        hexagons.forEach(h => {
            if (Math.abs(h.opacity - h.targetOpacity) < 0.01) {
                h.targetOpacity = Math.random() * 0.5;
            }
            h.opacity += (h.targetOpacity - h.opacity) * h.pulseSpeed;
            drawHex(h.x, h.y, hexSize - 2, h.opacity);
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}

/**
 * Form Submission Handling
 */
function initFormHandler() {
    const form = document.getElementById('requestForm');
    const status = document.getElementById('formStatus');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            idea: document.getElementById('idea').value,
            timestamp: new Date().toISOString()
        };

        // Simulate API call
        status.textContent = "TRANSMITTING TO THE GRID...";
        status.className = "text-center text-sm font-bold text-cyan opacity-100";
        
        try {
            // In a real scenario, this would POST to /api/request or a Cloudflare Worker
            console.log('Service Request:', data);
            
            setTimeout(() => {
                status.textContent = "REQUEST SORTED. THANK YOU.";
                status.className = "text-center text-sm font-bold text-emerald opacity-100";
                form.reset();
            }, 1500);
        } catch (err) {
            status.textContent = "TRANSMISSION FAILED. TRY AGAIN.";
            status.className = "text-center text-sm font-bold text-red opacity-100";
        }
    });
}

/**
 * Language Toggling (EN/AR)
 */
function initLangToggle() {
    const btn = document.getElementById('langToggle');
    const html = document.documentElement;

    btn.addEventListener('click', () => {
        const isEn = html.getAttribute('lang') === 'en';
        if (isEn) {
            html.setAttribute('lang', 'ar');
            html.setAttribute('dir', 'rtl');
            btn.textContent = 'English';
            // Here you would typically swap text content via a dictionary
        } else {
            html.setAttribute('lang', 'en');
            html.setAttribute('dir', 'ltr');
            btn.textContent = 'العربية';
        }
    });
}

/**
 * Scroll Reveal Animations
 */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.glass-card, #request').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}
