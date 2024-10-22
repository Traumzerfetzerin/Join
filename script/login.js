// Base URL for Firebase
const BASE_URL = "https://join382-19b27-default-rtdb.europe-west1.firebasedatabase.app/";

// Store user data globally
let users = [];
let tasks = [];
let contacts = [];
let loggedUserContact;

// Call this function once DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    includeHTML(); // Load external HTML
    // After including HTML, display the user's initials
    displayUserInitials();
});

/**
 * Function to include external HTML content.
 * It fetches the content from HTML files and inserts them into the current page.
 */
function includeHTML() {
    var z, i, elmnt, file, xhttp;
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        file = elmnt.getAttribute("w3-include-html");
        if (file) {
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        elmnt.innerHTML = this.responseText;
                    }
                    if (this.status == 404) {
                        elmnt.innerHTML = "Page not found.";
                    }
                    elmnt.removeAttribute("w3-include-html");
                    // Ensure user initials are displayed after HTML is included
                    displayUserInitials();
                }
            };
            xhttp.open("GET", file, true);
            xhttp.send();
            return;
        }
    }
}

/**
 * Display the user's initials in the `name_menu` div after content is loaded.
 * It checks if there are initials stored in localStorage and updates the UI accordingly.
 */
function displayUserInitials() {
    let currentUserInitial = localStorage.getItem('currentUserInitial');
    const userIcon = document.getElementById('name_menu');

    // Ensure the user icon element is present before trying to update
    if (userIcon) {
        if (currentUserInitial) {
            userIcon.textContent = currentUserInitial;
        } else {
            userIcon.textContent = 'G'; // Default to 'G' for guest
        }
    } else {
        console.error('Element with ID "name_menu" not found.');
    }
}

/**
 * Function to log in a user.
 * Handles email validation, password checking, and updating the UI with the user's initials.
 * @param {Event} event - The form submit event
 */
function logIn(event) {
    event.preventDefault();

    let email = document.getElementById('name').value.trim();
    let password = document.getElementById('login-password').value.trim();
    let responseMessage = document.getElementById('response-message');

    isEmailExists(email)
        .then(exists => {
            if (!exists) {
                responseMessage.textContent = 'Email does not exist';
                responseMessage.style.color = 'red';
                return;
            }
            return fetchUserData(email);
        })
        .then(user => {
            if (user && user.password === password) {
                // Extract the initials from the user's name
                const initials = getInitials(user.name || user.email);
                localStorage.setItem('currentUserInitial', initials);

                const userIcon = document.getElementById('name_menu');
                if (userIcon) {
                    userIcon.textContent = initials; // Update UI with initials
                }

                responseMessage.textContent = 'Login successful! Redirecting...';
                responseMessage.style.color = 'green';

                setTimeout(() => {
                    window.location.href = 'summary.html';
                }, 1500);
            } else {
                responseMessage.textContent = 'Invalid password';
                responseMessage.style.color = 'red';
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            responseMessage.textContent = 'An error occurred. Please try again.';
            responseMessage.style.color = 'red';
        });
}

/**
 * Function to extract initials from a user's name or email.
 * If the name is available, use the initials from the name.
 * Otherwise, use the first letter of the email address.
 * @param {string} nameOrEmail - The user's name or email
 * @returns {string} - The initials to display
 */
function getInitials(nameOrEmail) {
    if (!nameOrEmail) return 'G'; // Return 'G' for guest

    const nameParts = nameOrEmail.split(' '); // Split full name into parts
    if (nameParts.length > 1) {
        // Return initials from the first two parts of the name
        return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
    } else {
        // If only one name or using email, just return the first letter
        return nameOrEmail.charAt(0).toUpperCase();
    }
}

/**
 * Function to log in as a guest.
 * Sets 'G' as the guest initial and redirects to the board page.
 */
function guestLogin() {
    const guestInitial = 'G';

    const userIcon = document.getElementById('name_menu');
    if (userIcon) {
        userIcon.textContent = guestInitial;
    }

    localStorage.setItem('currentUserInitial', guestInitial);
    window.location.href = 'summary.html';
}

/**
 * Check if email already exists in the Firebase database.
 * @param {string} email - The email to check
 * @returns {Promise<boolean>}
 */
async function isEmailExists(email) {
    return fetch(`${BASE_URL}/users.json`)
        .then(response => response.json())
        .then(data => {
            return Object.values(data || {}).some(user => user.email === email);
        });
}

/**
 * Fetch user data from Firebase based on the provided email.
 * @param {string} email - The email of the user
 * @returns {Promise<object>}
 */
async function fetchUserData(email) {
    return fetch(`${BASE_URL}/users.json`)
        .then(response => response.json())
        .then(data => {
            const user = Object.values(data || {}).find(user => user.email === email);
            return user ? user : null;
        });
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
        toggleIcon.src = '/Assets/visibility.svg'; // Show password icon
    } else {
        passwordInput.type = 'password';
        toggleIcon.src = '/Assets/visibility_off - Copy.svg'; // Hide password icon
    }
}

/**
 * Function to handle logging out.
 * Clears the user's initials from localStorage and redirects to the login page.
 */
function logout() {
    // Clear the stored user data (e.g., initials)
    localStorage.removeItem('currentUserInitial');

    // Reset the user icon to 'G' for guest
    const userIcon = document.getElementById('name_menu');
    if (userIcon) {
        userIcon.textContent = 'G';
    }
    
    // Redirect to login page
    window.location.href = 'html/summary.html'; // Update the path if needed
}
