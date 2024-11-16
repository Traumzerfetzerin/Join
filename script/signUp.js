// Function to validate sign-up form
function validateSignUp(event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get form data
    let name = document.getElementById('name').value.trim(); // Get the name input
    let email = document.getElementById('email').value.trim(); // Trimming input
    let password = document.getElementById('password').value.trim();
    let confirmPassword = document.getElementById('confirm-password').value.trim();

    // Validate email format
    if (!validateEmail(email)) {
        showToast('Invalid email format');
        clearForm();  // Clear form if email format is invalid
        return;
    }

    // Check if email already exists in Firebase
    isEmailExists(email)
        .then(exists => {
            if (exists) {
                showToast('Email already exists');
                clearForm();  // Clear form if email exists
                return;
            }

            // Validate password strength
            if (!validatePassword(password)) {
                showToast('must be atleast 6 characters, at least one uppercase letter and number');
                clearForm();  // Clear form if password doesn't meet the strength requirements
                return;
            }

            // Validate password matching
            if (password !== confirmPassword) {
                showToast('Passwords do not match');
                clearForm();  // Clear form if passwords don't match
                return;
            }

            // Store user data in Firebase Realtime Database
            saveUserData(name, email, password)
                .then(() => {
                    // Show success toast
                    showToast('Sign up successful!');

                    // Clear the form after successful sign-up
                    clearForm();

                    // Redirect to the login page after a short delay
                    setTimeout(() => {
                        window.location.href = '/html/login.html'; // Redirect to login page
                    }, 1500);
                })
                .catch(error => {
                    showToast('Error saving user data: ' + error);
                });
        });
}

// Function to display the toast

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
    
    return fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app//users.json', {
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
    return fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app//users.json')
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
    const termsCheckbox = document.getElementById('terms-checkbox');

    if (nameField && emailField && passwordField && confirmPasswordField) {
        nameField.value = '';
        emailField.value = '';
        passwordField.value = '';
        confirmPasswordField.value = '';
        termsCheckbox.checked = false; 
    } 
}

// Ensure form fields are cleared when the page loads
window.onload = function() {
    // Retain existing functionality (clear form)
    clearForm();

    // Get references to the checkbox and signup button
    const termsCheckbox = document.getElementById('terms-checkbox');
    const signupButton = document.getElementById('signup-btn');

    // Initially disable the signup button visually and functionally
    disableButton(signupButton);

    // Event listener for checkbox to toggle button disable state
    termsCheckbox.addEventListener('change', function() {
        if (termsCheckbox.checked) {
            // Enable the button if the checkbox is checked
            enableButton(signupButton);
        } else {
            // Disable the button if the checkbox is unchecked
            disableButton(signupButton);
        }
    });
};

// Function to disable the button
function disableButton(button) {
    button.disabled = true;

    button.style.cursor = 'not-allowed';  // Non-clickable cursor
}

// Function to enable the button
function enableButton(button) {
    button.disabled = false;
    
    button.style.cursor = 'pointer';  // Clickable cursor
}



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
        toggleIcon.src = '/Assets/visibility.svg'; // Show visible icon
        toggleIcon.alt = 'Hide Password'; // Update alt text
        console.log('Password is now visible.'); // Debugging log
    } else {
        passwordInput.type = 'password'; // Hide the password
        toggleIcon.src = '/Assets/visibility_off - Copy.svg'; // Show hidden icon
        toggleIcon.alt = 'Show Password'; // Update alt text
        console.log('Password is now hidden.'); // Debugging log
    }
}
// Ensure the signup button is disabled initially
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message; // Set the message
    toast.className = `toast show ${type}`; // Add the 'show' class and type ('success' or 'error')

    // After 3 seconds, add the 'hide' class to slide the toast out
    setTimeout(() => {
        toast.classList.add('hide');
    }, 3000);

    // Remove the 'show' and 'hide' classes after the slide-out animation completes
    setTimeout(() => {
        toast.className = toast.className.replace('show', '').replace('hide', '');
    }, 3500); // Wait an additional 0.5 seconds to match the CSS transition
}




