let BASE_URL = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/";


/**
 * Displays the initials of the logged-in user in the element with class "name".
 * If no user is found, it defaults to "G".
 */
function displayFullName() {
    let fullName = localStorage.getItem('loggedInUserName');
    let nameElement = document.querySelector(".name");

    if (nameElement) {
        if (fullName) {
            let nameParts = fullName.split(' ');
            let firstLetter = nameParts[0].charAt(0).toUpperCase();
            let lastLetter = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : '';
            nameElement.textContent = firstLetter + (lastLetter ? lastLetter : "");
        } else {
            nameElement.textContent = "G";
        }
    }
}


window.addEventListener("load", async function () {
    await testIcon();
});


/**
 * Retrieves the logged-in user's name from localStorage and displays the initials in the element with ID "name_menu".
 * If no user is found, it defaults to "G".
 * Logs a warning if the element is not found and logs an error if retrieval fails.
 */
async function testIcon() {
    try {
        let userIcon = localStorage.getItem('loggedInUserName');
        let nameMenu = document.getElementById('name_menu');

        if (nameMenu) {
            if (userIcon) {
                let nameParts = userIcon.split(' ');
                let firstLetter = nameParts[0].charAt(0).toUpperCase();
                let lastLetter = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : '';
                nameMenu.innerHTML = firstLetter + (lastLetter ? lastLetter : "");
            } else {
                nameMenu.innerHTML = "G";
            }
        } else {
            console.warn("Element with ID 'name_menu' was not found.");
        }
    } catch (error) {
        console.error("Error retrieving the username:", error);
    }
}


/**
 * Displays the first letter of the currently logged-in user's name.
 * @returns {Promise<void>}
 */
async function showFirstLetter() {
    let userIcon = document.getElementById('name_menu');

    if (!userIcon) {
        console.error('User icon element not found');
        return;
    }
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
    return localStorage.getItem('userId');
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
    let userIcon = document.getElementById('name_menu');
    menu.classList.toggle('active');

    document.addEventListener('click', function closeClickOutside(event) {
        if (!menu.contains(event.target) && !userIcon.contains(event.target)) {
            menu.classList.remove('active');
            document.removeEventListener('click', closeClickOutside);
        }
    });
}

/**
 * Logs out the user by clearing stored data and redirecting to the login page.
 */
function logout() {
    localStorage.removeItem('currentUserInitial');
    localStorage.removeItem('userId');
    let userIcon = document.getElementById('name_menu');
    if (userIcon) {
        userIcon.textContent = 'G';
    }
    window.location.href = '../html/login.html';
    resetUserInfo();
}

/**
 * Resets the user icon and name after logout.
 */
function resetUserInfo() {
    localStorage.removeItem('loggedInUserName');

    let nameElement = document.querySelector(".name");
    let nameMenu = document.getElementById("name_menu");

    if (nameElement) {
        nameElement.textContent = "G";
    }

    if (nameMenu) {
        nameMenu.innerHTML = "G";
    }

    let nameText = document.querySelector('.greeting-text');
    if (nameText) {
        nameText.textContent = 'Guest';
        nameText.style.color = 'black';
    }
}


/**
 * Navigates back to the previous page.
 */
function pageBack() {
    window.history.back();
}