/**
 * Validates the sign-up form and handles user registration.
 */
function validateSignUp(event) {
    if (event) event.preventDefault();
    clearErrors();
    let errorMessage = "";
    if (!validateName()) errorMessage = "Name is required";
    else if (!validateEmailField()) errorMessage = "Invalid email format";
    else if (!validatePasswordField()) errorMessage = "Password must be at least 6 characters, contain an uppercase letter, a number, and at least one special character";
    else if (!validatePasswordMatch()) errorMessage = "Passwords do not match";
    else if (!validateTerms()) errorMessage = "You must accept the Privacy Policy";
    
    if (errorMessage) {
        showToast(errorMessage, 'error');
    } else {
        processSignUp(
            document.getElementById('name').value.trim(),
            document.getElementById('email').value.trim(),
            document.getElementById('password').value.trim(),
            document.getElementById('confirm-password').value.trim()
        );
    }
}

/**
 * Validates the name field.
 * @returns {boolean} True if valid, otherwise false.
 */
function validateName() {
    let nameField = document.getElementById('name');
    let name = nameField.value.trim();
    if (!name) {
        showError(nameField, 'Name is required');
        return false;
    }
    return true;
}

/**
 * Validates the email field.
 * @returns {boolean} True if valid, otherwise false.
 */
function validateEmailField() {
    let emailField = document.getElementById('email');
    let email = emailField.value.trim();
    if (!validateEmail(email)) {
        showError(emailField, 'Invalid email format');
        return false;
    }
    return true;
}

/**
 * Validates the password field.
 * @returns {boolean} True if valid, otherwise false.
 */
function validatePasswordField() {
    let passwordField = document.getElementById('password');
    let password = passwordField.value.trim();
    if (password.length < 6) {
        showError(passwordField, 'Password must be at least 6 characters, contain an uppercase letter, a number, and at least one special character from !@#$%^&*()_+{}[]:;<>,.?/~`-.');
        return false;
    }
    return true;
}

/**
 * Validates if the password confirmation matches the original password.
 * @returns {boolean} True if valid, otherwise false.
 */
function validatePasswordMatch() {
    let passwordField = document.getElementById('password');
    let confirmPasswordField = document.getElementById('confirm-password');
    if (passwordField.value.trim() !== confirmPasswordField.value.trim()) {
        showError(confirmPasswordField, 'Passwords do not match');
        return false;
    }
    return true;
}

/**
 * Validates if the terms checkbox is checked.
 * @returns {boolean} True if checked, otherwise false.
 */
function validateTerms() {
    let termsCheckbox = document.getElementById('terms-checkbox');
    if (!termsCheckbox.checked) {
        showError(termsCheckbox, 'You must accept the Privacy Policy');
        return false;
    }
    return true;
}

/**
 * Displays an error message below the input field.
 * @param {HTMLElement} field - The input field.
 * @param {string} message - The error message.
 */
function showError(field, message) {
    let errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerText = message;
    field.classList.add('input-error');
    field.parentNode.appendChild(errorElement);
}

/**
 * Clears all error messages and resets input styles.
 */
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}


// Add event listeners to remove the error class when the user starts typing
document.getElementById('name').addEventListener('input', function() {
    this.classList.remove('input-error');
});

document.getElementById('email').addEventListener('input', function() {
    this.classList.remove('input-error');
});

document.getElementById('password').addEventListener('input', function() {
    this.classList.remove('input-error');
});

document.getElementById('confirm-password').addEventListener('input', function() {
    this.classList.remove('input-error');
});

window.onload = function () {
    clearForm();
};

/**
 * Attaches event listener to the sign-up button on page load.
 */
document.addEventListener("DOMContentLoaded", () => {
    let signupButton = document.getElementById("signup-btn");
        signupButton.disabled = false;
        signupButton.addEventListener("click", validateSignUp);
});