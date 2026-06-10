/*
 * form.js
 * Purpose: Handles all contact form functionality including:
 * - Form validation
 * - Error message display
 * - Submit button state management
 */

/* ------------------------- DOM ELEMENTS ------------------------- */
// Get references to all form elements we need to work with
const form = document.querySelector('.contactForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
// Message textarea added to allow users to leave longer messages
const messageInput = document.getElementById('message');
const confirmCheckbox = document.getElementById('confirm');
const submitButton = form.querySelector('button[type="submit"]');

/* ------------------------- ERROR HANDLING ------------------------- */
// Creates and returns a new error message element with proper styling
const createErrorElement = () => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'var(--error-color)';
    errorDiv.style.fontSize = 'var(--font-size-sm)';
    errorDiv.style.marginTop = 'var(--space-xs)';
    return errorDiv;
};

/* ------------------------- VALIDATION FUNCTIONS ------------------------- */
// Validates the name field:
// - Must not be empty
// - Must not contain numbers
const validateName = (name) => {
    return name.trim() !== '' && !/\d/.test(name);
};

// Validates the email field:
// - Must contain '@' symbol
// - Must contain a domain (.)
const validateEmail = (email) => {
    return email.includes('@') && email.includes('.');
};

// Validates the message field (optional):
// - Empty message is allowed
// - Maximum length of 1000 characters
const validateMessage = (msg) => {
    if (!msg) return true; // message is optional
    return msg.length <= 1000;
};

// Update submit button state
const updateSubmitButton = () => {
    submitButton.disabled = !confirmCheckbox.checked;
};

/* ------------------------- EVENT LISTENERS ------------------------- */
// Listen for changes in the name input
// Validates in real-time and shows/hides error messages
nameInput.addEventListener('input', (e) => {
    const errorEl = nameInput.parentElement.querySelector('.error-message');
    if (errorEl) errorEl.remove(); // Remove any existing error message

    if (!validateName(e.target.value)) {
        const error = createErrorElement();
        error.textContent = 'Name must not contain numbers';
        nameInput.parentElement.appendChild(error);
    }
});

emailInput.addEventListener('input', (e) => {
    const errorEl = emailInput.parentElement.querySelector('.error-message');
    if (errorEl) errorEl.remove();

    if (!validateEmail(e.target.value)) {
        const error = createErrorElement();
        error.textContent = 'Please enter a valid email address';
        emailInput.parentElement.appendChild(error);
    }
});

// Validate message length in real-time (optional field)
if (messageInput) {
    messageInput.addEventListener('input', (e) => {
        const errorEl = messageInput.parentElement.querySelector('.error-message');
        if (errorEl) errorEl.remove();

        if (!validateMessage(e.target.value)) {
            const error = createErrorElement();
            error.textContent = 'Message must be 1000 characters or less';
            messageInput.parentElement.appendChild(error);
        }
    });
}
confirmCheckbox.addEventListener('change', updateSubmitButton);

// Form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = nameInput.value;
    const email = emailInput.value;
    const message = messageInput ? messageInput.value.trim() : '';
    
    // Validate all fields before proceeding
    if (!validateName(name) || !validateEmail(email) || !validateMessage(message) || !confirmCheckbox.checked) {
        alert('Please fix all errors before submitting');
        return;
    }
    
    // Here you would typically send the form data to a server
    console.log('Form submitted:', { name, email, message });
    alert('Form submitted successfully!');
    form.reset();
    updateSubmitButton();
});

//couner

const counter = document.createElement('span');

counter.className = 'char-counter';
counter.textContent = 'You have typed 0 characters';
messageInput.parentElement.appendChild(counter);

messageInput.addEventListener('input', (e) => {
    const length = e.target.value.length;
    counter.textContent = `You have typed: ${length} characters`;
});