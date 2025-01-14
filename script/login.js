// Base URL for Firebase
let BASE_URL_LOGIN = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/";


// Store user data globally
let users = [];
let tasks = [];
let contacts = [];
let loggedUserContact;


/**
 * Initializes the application after DOM content is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
    includeHTML();
    displayUserInitials();
});


/**
 * Includes external HTML content into the current page.
 * It fetches content from HTML files and inserts them into corresponding elements with the `w3-include-html` attribute.
 */
function includeHTML() {
    let elements = document.getElementsByTagName("*");
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        let file = element.getAttribute("w3-include-html");
        if (file) {
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        element.innerHTML = this.responseText;
                    }
                    if (this.status == 404) {
                        element.innerHTML = "Page not found.";
                    }
                    element.removeAttribute("w3-include-html");
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
 * Displays the user's initials in the UI after content is loaded.
 * Updates the `name_menu` element with initials from localStorage or defaults to 'G'.
 */
function displayUserInitials() {
    let currentUserInitial = localStorage.getItem('currentUserInitial');
    let userIcon = document.getElementById('name_menu');
    if (userIcon) {
        userIcon.textContent = currentUserInitial || 'G';
    }
}


/**
 * Shows a toast notification with a provided message.
 * @param {string} message - The message to display in the toast.
 */
function showToast(message) {
    let toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}


/**
 * Logs in a user by validating email and password.
 * Updates the UI and redirects to the summary page if successful.
 * @param {Event} event - The form submit event.
 */
function logIn(event) {
    event.preventDefault();
    let email = document.getElementById('name').value.trim();
    let password = document.getElementById('login-password').value.trim();
    let responseMessage = document.getElementById('response-message');

    validateEmailAndPassword(email, password, responseMessage);
}


/**
 * Validates the email and password input.
 * Handles error messages if the email does not exist or the password is invalid.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {HTMLElement} responseMessage - The response message element for feedback.
 */
function validateEmailAndPassword(email, password, responseMessage) {
    isEmailExists(email)
        .then(exists => {
            if (!exists) {
                responseMessage.textContent = 'Email does not exist';
                responseMessage.style.color = 'red';
                return;
            }
            return fetchUserData(email);
        })
        .then(user => handleLoginResponse(user, email, password, responseMessage))
        .catch(() => {
            responseMessage.textContent = 'An error occurred. Please try again.';
            responseMessage.style.color = 'red';
        });
}


/**
 * Handles the response from the email and password validation.
 * Updates the UI and redirects if the login is successful.
 * @param {object|null} user - The user object or null if not found.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {HTMLElement} responseMessage - The response message element for feedback.
 */
function handleLoginResponse(user, email, password, responseMessage) {
    if (user && user.password === password) {
        let fullName = user.name || email;
        localStorage.setItem('loggedInUserName', fullName);
        showToast('Login successful! Redirecting...');
        redirectToSummary();
    } else {
        responseMessage.textContent = 'Invalid password';
        responseMessage.style.color = 'red';
    }
}


/**
 * Redirects the user to the summary page after a short delay.
 */
function redirectToSummary() {
    setTimeout(() => {
        window.location.href = 'summary.html';
    }, 1500);
}



/**
 * Extracts initials from a user's name or email.
 * If the name is available, initials are derived from the name.
 * Otherwise, the first letter of the email is used.
 * @param {string} nameOrEmail - The user's name or email.
 * @returns {string} - The initials to display.
 */
function getInitials(nameOrEmail) {
    if (!nameOrEmail) return 'G';
    let nameParts = nameOrEmail.split(' ');
    if (nameParts.length > 1) {
        return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
    } else {
        return nameOrEmail.charAt(0).toUpperCase();
    }
}


/**
 * Logs in as a guest.
 * Sets 'G' as the guest initial and redirects to the board page.
 * @returns {Promise<void>}
 */
async function guestLogin() {
    let guestInitial = 'G';
    let userIcon = document.getElementById('name_menu');
    if (userIcon) {
        userIcon.textContent = guestInitial;
    }
    localStorage.setItem('currentUserInitial', guestInitial);
    if (window.matchMedia("(max-width: 1000px)").matches) {
        greetingTemplate();
    }
    setTimeout(() => {
        window.location.href = 'summary.html';
    }, 1000);
}


/**
 * Displays a greeting template on smaller devices.
 */
async function greetingTemplate() {
    document.getElementById('greetingLogin').classList.remove('dnone');
    document.getElementById('forGreeting').classList.add('dnone');
    document.getElementById('sidefoot').classList.add('dnone');
    document.getElementById('buttonLoginForGreeting').classList.add('d-none');
}


/**
 * Checks if an email exists in the Firebase database.
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} - True if the email exists, otherwise false.
 */
async function isEmailExists(email) {
    return fetch(`${BASE_URL_LOGIN}/users.json`)
        .then(response => response.json())
        .then(data => {
            return Object.values(data || {}).some(user => user.email === email);
        });
}


/**
 * Fetches user data from Firebase based on the provided email.
 * @param {string} email - The email of the user.
 * @returns {Promise<object|null>} - The user object if found, otherwise null.
 */
async function fetchUserData(email) {
    return fetch(`${BASE_URL_LOGIN}/users.json`)
        .then(response => response.json())
        .then(data => {
            let user = Object.values(data || {}).find(user => user.email === email);
            return user ? user : null;
        });
}


/**
 * Toggles the visibility of the password input field.
 * @param {string} inputId - The ID of the password input field.
 * @param {string} toggleIconId - The ID of the toggle icon element.
 */
function togglePasswordVisibility(inputId, toggleIconId) {
    let passwordInput = document.getElementById(inputId);
    let toggleIcon = document.getElementById(toggleIconId);
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.src = '/Assets/visibility.svg';
    } else {
        passwordInput.type = 'password';
        toggleIcon.src = '/Assets/visibility_off - Copy.svg';
    }
}


/**
 * Logs out the user by clearing stored data and redirecting to the login page.
 */
function logout() {
    localStorage.removeItem('currentUserInitial');
    let userIcon = document.getElementById('name_menu');
    if (userIcon) {
        userIcon.textContent = 'G';
    }
    window.location.href = '/html/login.html';
}
