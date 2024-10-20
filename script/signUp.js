// Function to validate sign-up form
function validateSignUp(event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get form data
    let name = document.getElementById('name').value.trim(); // Get the name input
    let email = document.getElementById('email').value.trim(); // Trimming input
    let password = document.getElementById('password').value.trim();
    let confirmPassword = document.getElementById('confirm-password').value.trim();
    let responseMessage = document.getElementById('response-message');

    // Validate email format
    if (!validateEmail(email)) {
        responseMessage.textContent = 'Invalid email format';
        responseMessage.style.color = 'red';
        clearForm();  // Clear form if email format is invalid
        return;
    }

    // Check if email already exists in Firebase
    isEmailExists(email)
        .then(exists => {
            if (exists) {
                responseMessage.textContent = 'Email already exists';
                responseMessage.style.color = 'red';
                clearForm();  // Clear form if email exists
                return;
            }

            // Validate password strength
            if (!validatePassword(password)) {
                responseMessage.textContent = 'Password must be at least 6 characters long, contain at least one uppercase letter, and one number';
                responseMessage.style.color = 'red';
                clearForm();  // Clear form if password doesn't meet the strength requirements
                return;
            }

            // Validate password matching
            if (password !== confirmPassword) {
                responseMessage.textContent = 'Passwords do not match';
                responseMessage.style.color = 'red';
                clearForm();  // Clear form if passwords don't match
                return;
            }

            // Store user data in Firebase Realtime Database
            saveUserData(name, email, password)
                .then(() => {
                    // Show success message and clear form fields after successful sign-up
                    responseMessage.textContent = 'Sign up successful!';
                    responseMessage.style.color = 'green';

                    // Clear the form after successful sign-up
                    clearForm();

                    // Redirect to the login page after a short delay
                    setTimeout(() => {
                        window.location.href = '/html/login.html'; // Redirect to login page
                    }, 1500);
                })
                .catch(error => {
                    responseMessage.textContent = 'Error saving user data: ' + error;
                    responseMessage.style.color = 'red';
                });
        });
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex pattern
    return re.test(email);
}

// Validate password strength
function validatePassword(password) {
    // At least 6 characters long, contains at least one uppercase letter and one number
    const re = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return re.test(password);
}

// Save user data in Firebase Realtime Database
async function saveUserData(name, email, password) {
    const userData = {
        name: name,    // Add the name field
        email: email,
        password: password, // In a real app, store a hashed password!
    };
    
    return fetch('https://join382-19b27-default-rtdb.europe-west1.firebasedatabase.app/users.json', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    });
}

// Check if email already exists in Firebase
async function isEmailExists(email) {
    return fetch('https://join382-19b27-default-rtdb.europe-west1.firebasedatabase.app/users.json')
        .then(response => response.json())
        .then(data => {
            // Check if any user has the same email
            return Object.values(data || {}).some(user => user.email === email);
        });
}

// Clear all input fields in the form
function clearForm() {
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirm-password');

    if (nameField && emailField && passwordField && confirmPasswordField) {
        nameField.value = '';
        emailField.value = '';
        passwordField.value = '';
        confirmPasswordField.value = '';
    } 
}

// Ensure form fields are cleared when the page loads
window.onload = function() {
    clearForm();
};

// Function to toggle password visibility
function togglePasswordVisibility(inputId, toggleIconId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIconElement = document.getElementById(toggleIconId);

    // Check if elements are found
    if (!passwordInput || !toggleIconElement) {
        console.error('Element not found');
        return;
    }

    const toggleIcon = toggleIconElement.getElementsByTagName('img')[0];

    // Check if image element is found
    if (!toggleIcon) {
        console.error('Image element not found inside toggleIconId:', toggleIconId);
        return;
    }

    // Toggle password visibility
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text'; // Show the password
        toggleIcon.src = '../Assests/visibility.svg'; // Show visible icon
        toggleIcon.alt = 'Hide Password'; // Update alt text
        console.log('Password is now visible.'); // Debugging log
    } else {
        passwordInput.type = 'password'; // Hide the password
        toggleIcon.src = '../Assests/visibility_off - Copy.svg'; // Show hidden icon
        toggleIcon.alt = 'Show Password'; // Update alt text
        console.log('Password is now hidden.'); // Debugging log
    }
}
/**
 * Toggle password visibility.
 * @param {string} inputId - The ID of the password input field
 * @param {string} toggleIconId - The ID of the eye icon for toggling
 */
function togglePasswordVisibility(inputId, toggleIconId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(toggleIconId);

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.src = '../Assests/visibility.svg'; // Show password icon
    } else {
        passwordInput.type = 'password';
        toggleIcon.src = '../Assests/visibility_off - Copy.svg'; // Hide password icon
    }
}


