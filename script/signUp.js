/**
 * Processes the sign-up logic after form data is collected.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {string} confirmPassword - The user's password confirmation.
 */
function processSignUp(name, email, password, confirmPassword) {
    if (!validateEmail(email)) return handleSignUpError('Invalid email format');
    isEmailExists(email)
        .then(exists => {
            if (exists) return handleSignUpError('Email already exists');
            if (!validatePassword(password)) return handleSignUpError('Password must be at least 6 characters, contain an uppercase letter and a number', true);
            if (password !== confirmPassword) return handleSignUpError('Passwords do not match', true);
            storeUserData(name, email, password);
        })
        .catch(error => showToast('Error checking email: ' + error));
}


/**
 * Handles sign-up errors by displaying a toast.
 * @param {string} message - The error message to display.
 * @param {boolean} clearPasswords - Whether to clear the password fields.
 */
function handleSignUpError(message, clearPasswords = false) {
    showToast(message);
    if (clearPasswords) {
        clearErrorFields();
    }
}


/**
 * Clears specific input fields related to errors in the sign-up form.
 */
function clearErrorFields() {
    let passwordField = document.getElementById('password');
    let confirmPasswordField = document.getElementById('confirm-password');
    if (passwordField && confirmPasswordField) {
        passwordField.value = '';
        confirmPasswordField.value = '';
    }
}

/**
 * Stores user data in Firebase Realtime Database.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 */
function storeUserData(name, email, password) {
    saveUserData(name, email, password)
        .then(() => {
            showToast('Sign up successful!');
            clearForm();
            redirectToLogin();
        })
        .catch(error => showToast('Error saving user data: ' + error));
}


/**
 * Redirects the user to the login page after a delay.
 */
function redirectToLogin() {
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}


/**
 * Validates the email format.
 * @param {string} email - The email to validate.
 * @returns {boolean} True if valid, otherwise false.
 */
function validateEmail(email) {
    let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}


/**
 * Validates the password strength.
 * @param {string} password - The password to validate.
 * @returns {boolean} True if valid, otherwise false.
 */
function validatePassword(password) {
    let re = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?/~`-]{6,}$/;
    return re.test(password);
}


// Add event listeners to the password input field
document.getElementById('password').addEventListener('click', function () {
    document.getElementById('password-hint').style.display = 'block';
});

document.getElementById('password').addEventListener('blur', function () {
    document.getElementById('password-hint').style.display = 'none';
});

/**
 * Saves user data to Firebase Realtime Database.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<void>} Resolves on success.
 */
async function saveUserData(name, email, password) {
    let userData = { name: name, email: email, password: password };
    return fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/users.json', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' }
    }).then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    });
}


/**
 * Checks if an email already exists in Firebase.
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} True if the email exists, otherwise false.
 */
async function isEmailExists(email) {
    return fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app//users.json')
        .then(response => response.json())
        .then(data => Object.values(data || {}).some(user => user.email === email));
}


/**
 * Clears all input fields in the sign-up form.
 */
function clearForm() {
    let nameField = document.getElementById('name');
    let emailField = document.getElementById('email');
    let passwordField = document.getElementById('password');
    let confirmPasswordField = document.getElementById('confirm-password');
    let termsCheckbox = document.getElementById('terms-checkbox');
    if (nameField && emailField && passwordField && confirmPasswordField) {
        nameField.value = '';
        emailField.value = '';
        passwordField.value = '';
        confirmPasswordField.value = '';
        termsCheckbox.checked = false;
    }
}


/**
 * Initializes the sign-up page by clearing the form and disabling the button.
 */
window.onload = function () {
    clearForm();
    initializeSignUpButton();
};

document.addEventListener('DOMContentLoaded', function () {
    let passwordField = document.getElementById('password');
    let passwordHint = document.getElementById('password-hint');

    if (passwordField && passwordHint) {
        passwordField.addEventListener('focus', function () {
            passwordHint.style.display = 'block';
        });

        passwordField.addEventListener('blur', function () {
            passwordHint.style.display = 'none';
        });
    }
});


/**
 * Initializes the sign-up button with checkbox functionality.
 */
function initializeSignUpButton() {
    let termsCheckbox = document.getElementById('terms-checkbox');
    let signupButton = document.getElementById('signup-btn');
    disableButton(signupButton);
    termsCheckbox.addEventListener('change', () => toggleButtonState(termsCheckbox, signupButton));
}


/**
 * Toggles the state of the sign-up button based on checkbox status.
 * @param {HTMLElement} checkbox - The terms and conditions checkbox.
 * @param {HTMLElement} button - The sign-up button.
 */
function toggleButtonState(checkbox, button) {
    checkbox.checked ? enableButton(button) : disableButton(button);
}


/**
 * Disables the button and updates its style.
 * @param {HTMLElement} button - The button to disable.
 */
function disableButton(button) {
    button.disabled = true;
    button.style.cursor = 'not-allowed';
}


/**
 * Enables the button and updates its style.
 * @param {HTMLElement} button - The button to enable.
 */
function enableButton(button) {
    button.disabled = false;
    button.style.cursor = 'pointer';
}


/**
 * Toggles the visibility of the password input field.
 * @param {string} inputId - The ID of the password input field.
 * @param {string} toggleIconId - The ID of the toggle icon container.
 */
function togglePasswordVisibility(inputId, toggleIconId) {
    let passwordInput = document.getElementById(inputId);
    let toggleIconElement = document.getElementById(toggleIconId);
    if (!passwordInput || !toggleIconElement) return console.error('Element not found');
    togglePasswordIcon(passwordInput, toggleIconElement);
}


/**
 * Toggles the password visibility icon and input type.
 * @param {HTMLElement} passwordInput - The password input field.
 * @param {HTMLElement} toggleIconElement - The toggle icon container.
 */
function togglePasswordIcon(passwordInput, toggleIconElement) {
    let toggleIcon = toggleIconElement.getElementsByTagName('img')[0];
    if (!toggleIcon) return console.error('Image element not found');
    let isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleIcon.src = isPassword ? '../Assets/visibility.svg' : '../Assets/visibility_off - Copy.svg';
    toggleIcon.alt = isPassword ? 'Hide Password' : 'Show Password';
}


/**
 * Displays a toast notification with a message.
 * @param {string} message - The message to display.
 * @param {string} [type='success'] - The type of toast ('success' or 'error').
 */
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.add('hide'), 3000);
    setTimeout(() => {
        toast.className = toast.className.replace('show', '').replace('hide', '');
    }, 3500);
}
