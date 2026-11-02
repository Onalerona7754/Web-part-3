S/**
 * WEDE5020 - Part 3 Enhancement Script
 * Author: Student
 * Description: Interactive elements, form validation, AJAX handlers, and dynamic content rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAccordion();
    initLightbox();
    initSearchFilter();
    initDynamicContent();
    initLeafletMap();
    initFormHandlers();
});


/**
 * Toggles accordion elements found on FAQ sections
 */
function initAccordion() {
    const accordionButtons = document.querySelectorAll('.accordion-header');

    accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const isOpen = button.classList.contains('active');

            // Close all open panels for standard accordion behavior
            document.querySelectorAll('.accordion-header').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.accordion-body').forEach(body => body.style.maxHeight = null);

            if (!isOpen) {
                button.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}

/**
 * Initializes Lightbox image viewer for gallery elements
 */
function initLightbox() {
    const galleryItems = document.querySelectorAll('.lightbox-trigger');
    if (galleryItems.length === 0) return;

    // Create modal DOM structure dynamically if not present
    let modal = document.getElementById('lightbox-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'lightbox-modal';
        modal.className = 'lightbox-modal';
        modal.innerHTML = `
            <span class="lightbox-close">&times;</span>
            <img class="lightbox-content" id="lightbox-img" alt="Gallery detail view">
            <div id="lightbox-caption"></div>
        `;
        document.body.appendChild(modal);
    }

    const modalImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('lightbox-caption');
    const closeBtn = modal.querySelector('.lightbox-close');

    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
            modalImg.src = item.getAttribute('href') || item.src;
            captionText.innerHTML = item.getAttribute('data-caption') || item.alt || '';
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * Loads Leaflet Map if container exists on page
 */
function initLeafletMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof L === 'undefined') return;

    // Default coordinates: Johannesburg region
    const map = L.map('map').setView([-26.2041, 28.0473], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([-26.2041, 28.0473]).addTo(map)
        .bindPopup('<b>Our Main Office</b><br>Visit us for enquiries and services.')
        .openPopup();
}

/**
 * Live search and filter functionality for listings
 */
function initSearchFilter() {
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('category-filter');
    const itemsContainer = document.getElementById('card-grid');

    if (!searchInput && !filterSelect) return;

    function filterItems() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const category = filterSelect ? filterSelect.value.toLowerCase() : 'all';
        const cards = itemsContainer ? itemsContainer.querySelectorAll('.card-item') : [];

        cards.forEach(card => {
            const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('.card-text')?.textContent.toLowerCase() || '';
            const cardCategory = card.getAttribute('data-category')?.toLowerCase() || 'all';

            const matchesSearch = title.includes(query) || desc.includes(query);
            const matchesCategory = (category === 'all' || cardCategory === category);

            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (searchInput) searchInput.addEventListener('input', filterItems);
    if (filterSelect) filterSelect.addEventListener('change', filterItems);
}

/**
 * Dynamic content loading example for items/posts
 */
function initDynamicContent() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    const dynamicContainer = document.getElementById('dynamic-posts');

    if (!loadMoreBtn || !dynamicContainer) return;

    const sampleItems = [
        { title: "Pet Adoption Day", desc: "Join us this weekend for our community adoption event.", category: "events" },
        { title: "Grooming Essentials", desc: "Tips and tricks for keeping your pets healthy and clean.", category: "tips" },
        { title: "Volunteer Drive", desc: "Sign up today to assist in animal rescue operations.", category: "volunteer" }
    ];

    loadMoreBtn.addEventListener('click', () => {
        loadMoreBtn.innerText = "Loading...";
        
        setTimeout(() => {
            sampleItems.forEach(item => {
                const col = document.createElement('div');
                col.className = 'card-item';
                col.setAttribute('data-category', item.category);
                col.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title">${item.title}</h3>
                            <p class="card-text">${item.desc}</p>
                        </div>
                    </div>
                `;
                dynamicContainer.appendChild(col);
            });
            loadMoreBtn.style.display = 'none';
        }, 600);
    });
}



function initFormHandlers() {
    const enquiryForm = document.getElementById('enquiry-form');
    const contactForm = document.getElementById('contact-form');

    if (enquiryForm) {
        enquiryForm.addEventListener('submit', (e) => handleFormSubmission(e, 'enquiry'));
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => handleFormSubmission(e, 'contact'));
    }
}

/**
 * Generic Form Processing with Client-Side Validation and AJAX Handling
 */
function handleFormSubmission(event, type) {
    event.preventDefault();
    const form = event.target;
    const responseBox = document.getElementById('form-response');

    // Validation Rules
    let isValid = true;
    const errors = [];

    const name = form.querySelector('[name="fullName"]');
    const email = form.querySelector('[name="email"]');
    const phone = form.querySelector('[name="phone"]');
    const message = form.querySelector('[name="message"]');
    const optionSelect = form.querySelector('[name="serviceType"]') || form.querySelector('[name="messageType"]');

    // Name Validation
    if (name && name.value.trim().length < 3) {
        isValid = false;
        errors.push("Full Name must be at least 3 characters long.");
    }

    // Email Validation (Regex standard)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email.value.trim())) {
        isValid = false;
        errors.push("Please provide a valid email address.");
    }

    // Phone Validation (Optional format check)
    if (phone && phone.value.trim() !== '') {
        const phoneRegex = /^[0-9\+\-\s\(\)]{7,15}$/;
        if (!phoneRegex.test(phone.value.trim())) {
            isValid = false;
            errors.push("Please enter a valid phone number (digits and spaces only).");
        }
    }

    // Message validation
    if (message && message.value.trim().length < 10) {
        isValid = false;
        errors.push("Message details must be at least 10 characters long.");
    }

    // Display validation messages
    if (!isValid) {
        if (responseBox) {
            responseBox.className = 'response-container error';
            responseBox.innerHTML = `<h4>Validation Errors:</h4><ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`;
            responseBox.style.display = 'block';
        } else {
            alert("Validation Errors:\n- " + errors.join("\n- "));
        }
        return;
    }

    // Display sending state (AJAX Simulation)
    if (responseBox) {
        responseBox.className = 'response-container info';
        responseBox.innerHTML = '<p>Processing your submission... Please wait.</p>';
        responseBox.style.display = 'block';
    }

    // Process forms via AJAX logic simulation / Formspree / mailto fallback
    setTimeout(() => {
        if (type === 'enquiry') {
            const selectedService = optionSelect ? optionSelect.value : 'General Enquiry';
            let estimatedCost = "R250 - R500";
            let timeline = "1-2 business days";

            if (selectedService.toLowerCase().includes('volunteer')) {
                estimatedCost = "No cost (Volunteer Application)";
                timeline = "Immediate onboarding review";
            } else if (selectedService.toLowerCase().includes('sponsor')) {
                estimatedCost = "Custom contribution amount";
                timeline = "Same-day coordinator response";
            }

            if (responseBox) {
                responseBox.className = 'response-container success';
                responseBox.innerHTML = `
                    <h3>Thank you for your enquiry, ${escapeHtml(name.value)}!</h3>
                    <p><strong>Enquiry Type:</strong> ${escapeHtml(selectedService)}</p>
                    <p><strong>Estimated Cost / Tier:</strong> ${estimatedCost}</p>
                    <p><strong>Expected Turnaround:</strong> ${timeline}</p>
                    <p>A representative has received your request and will follow up at <em>${escapeHtml(email.value)}</em> shortly.</p>
                `;
            }
        } else if (type === 'contact') {
            const msgType = optionSelect ? optionSelect.value : 'General Contact';
            
            // Mailto pre-formatted string setup as fallback requirement
            const mailtoLink = `mailto:support@organization.org?subject=${encodeURIComponent(msgType + ' - ' + name.value)}&body=${encodeURIComponent("From: " + name.value + "\nEmail: " + email.value + "\n\nMessage:\n" + message.value)}`;

            if (responseBox) {
                responseBox.className = 'response-container success';
                responseBox.innerHTML = `
                    <h3>Message Prepared Successfully!</h3>
                    <p>Thank you ${escapeHtml(name.value)}. Your message topic <strong>"${escapeHtml(msgType)}"</strong> is registered.</p>
                    <p>Click below to complete sending through your email client if it does not launch automatically:</p>
                    <a href="${mailtoLink}" class="btn btn-primary" style="display:inline-block; margin-top:10px; padding:8px 16px; background:#007bff; color:#fff; text-decoration:none; border-radius:4px;">Send Mail via Email App</a>
                `;
            }

            // Launch standard client mail application fallback
            window.location.href = mailtoLink;
        }

        form.reset();
    }, 800);
}

/**
 * Helper to prevent basic HTML injection in responses
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}