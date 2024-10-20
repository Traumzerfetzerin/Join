// Base URL for Firebase
const BASE_URL = "https://join382-19b27-default-rtdb.europe-west1.firebasedatabase.app/";

// Call this function when the page is loaded or when the user logs in
document.addEventListener("DOMContentLoaded", async function () {
    await showFirstLetter(); // Display initials or guest 'G' on load
});

// Function to display the first letter of the currently logged-in user's name
async function showFirstLetter() {
    const userIcon = document.getElementById('user-initial'); // ID from HTML

    if (!userIcon) {
        console.error("User icon element not found");
        return; // Exit the function if the element is not found
    }

    // Fetch user data from Firebase
    const username = await getUsernameFromFirebase();

    // Set the initials or default to 'G' for guest
    userIcon.textContent = username ? generateNameInitials(username) : 'G';
}

/**
 * Fetches the username from Firebase.
 * @returns {Promise<string|null>} The username or null if not found.
 */
async function getUsernameFromFirebase() {
    const userId = getCurrentUserId(); // Get the current user ID
    console.log('Retrieved User ID:', userId); // Log User ID for debugging

    if (!userId) {
        console.warn('No user ID available, skipping username fetch.');
        return null; // Skip fetching username if user ID is not available
    }

    try {
        const response = await fetch(`${BASE_URL}/users.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        const user = Object.entries(data).find(([key, user]) => key === userId); // Adjust according to your user structure

        console.log('Fetched user:', user); // Log user data for debugging
        return user ? user[1].name : null; // Return the username or null if not found
    } catch (error) {
        console.error('Error fetching user data from Firebase:', error);
        return null; // Return null if there's an error
    }
}

/**
 * Retrieves a value from localStorage and parses it from JSON.
 * @param {string} key - The key to retrieve from localStorage.
 * @returns {*} The parsed value from localStorage or null if not found.
 */
function getFromLocalStorage(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null; // Parse only if the value exists
}

/**
 * Gets the current user ID from localStorage.
 * @returns {string|null} The current user ID or null if not found.
 */
function getCurrentUserId() {
    const userId = getFromLocalStorage('userId');
    if (userId) {
        return userId; // Return the user ID if found
    }
    console.error('User ID not found in localStorage.');
    return null; // Return null if the user ID is not found
}

/**
 * Generates initials from a given name (first letter of first and last name).
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

// Function to show/hide mobile navigation
function showHeaderNav() {
    const menu = document.getElementById('mobile_headerNav');
    const userIcon = document.getElementById('user-initial');
    menu.classList.toggle('active');

    // Add an event listener to close the menu when clicking outside of it
    document.addEventListener('click', function closeClickOutside(event) {
        if (!menu.contains(event.target) && !userIcon.contains(event.target)) {
            menu.classList.remove('active'); // Close the menu if clicked outside
            document.removeEventListener('click', closeClickOutside); // Remove listener once the menu is closed
        }
    });
}

// Logout function remains unchanged
function logout() {
    // Clear the stored user data if applicable
    localStorage.removeItem('userId'); // Clear user ID from local storage
    window.location.href = '/html/login.html'; // Ensure the correct path for your login page
}
function pageBack() {
    window.history.back();
}