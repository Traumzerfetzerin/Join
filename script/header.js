// Base URL for Firebase
let BASE_URL = "https://join382-19b27-default-rtdb.europe-west1.firebasedatabase.app/";


/**
 * Initializes the application on page load.
 */
document.addEventListener("DOMContentLoaded", async function () {
    await showFirstLetter();
});


/**
 * Displays the first letter of the currently logged-in user's name.
 * @returns {Promise<void>}
 */
async function showFirstLetter() {
    let userIcon = document.getElementById('user-initial');
    if (!userIcon) return;

    let username = await getUsernameFromFirebase();
    userIcon.textContent = username ? generateNameInitials(username) : 'G';
}


/**
 * Fetches the username from Firebase.
 * @returns {Promise<string|null>} The username or null if not found.
 */
async function getUsernameFromFirebase() {
    let userId = getCurrentUserId();
    if (!userId) return null;

    try {
        let response = await fetch(`${BASE_URL}/users.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        let data = await response.json();
        let user = Object.entries(data).find(([key]) => key === userId);
        return user ? user[1].name : null;
    } catch (error) {
        console.error('Error fetching user data from Firebase:', error);
        return null;
    }
}


/**
 * Retrieves a value from localStorage and parses it from JSON.
 * @param {string} key - The key to retrieve from localStorage.
 * @returns {*} The parsed value from localStorage or null if not found.
 */
function getFromLocalStorage(key) {
    let value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}


/**
 * Gets the current user ID from localStorage.
 * @returns {string|null} The current user ID or null if not found.
 */
function getCurrentUserId() {
    let userId = getFromLocalStorage('userId');
    return userId || null;
}


/**
 * Generates initials from a given name.
 * @param {string} name - The full name to generate initials from.
 * @returns {string} The generated initials (up to two characters).
 */
function generateNameInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}


/**
 * Toggles the visibility of the mobile navigation menu.
 */
function showHeaderNav() {
    let menu = document.getElementById('mobile_headerNav');
    let userIcon = document.getElementById('user-initial');
    menu.classList.toggle('active');

    document.addEventListener('click', function closeClickOutside(event) {
        if (!menu.contains(event.target) && !userIcon.contains(event.target)) {
            menu.classList.remove('active');
            document.removeEventListener('click', closeClickOutside);
        }
    });
}


/**
 * Logs out the current user and redirects to the login page.
 */
function logout() {
    localStorage.removeItem('userId');
    window.location.href = '/html/login.html';
}


/**
 * Navigates back to the previous page.
 */
function pageBack() {
    window.history.back();
}