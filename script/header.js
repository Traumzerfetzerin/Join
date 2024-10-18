/**
 * Fetches the user data and displays the first letter of the currently logged-in user's name.
 * If no user is logged in, it sets the display to "Guest" with the initial "G".
 *
 * @async
 *
 * @throws Will alert the user if there is a problem fetching the data.
 */
// Make sure BASE_URL is defined at the top of header.js
const BASE_URL = "https://join382-19b27-default-rtdb.europe-west1.firebasedatabase.app/";




// Call this function when the page is loaded or when the user logs in
/*document.addEventListener("DOMContentLoaded", showFirstLetter);
async function logout() {
    try {
        // Remove the user's initials from localStorage
        localStorage.removeItem('currentUserInitial');
        
        // If you are saving the user's session on Firebase or using any server-side session,
        // you may need to add additional logout logic here

        // Redirect to login page
        window.location.href = 'index.html'; // Redirect to login page
    } catch (error) {
        console.error("Error during logout:", error);
    }
}*/


 //* @function showHeaderNav
 //
function showHeaderNav() {
    const menu = document.getElementById('mobile_headerNav');
    const userIcon = document.getElementById('name_menu');
    menu.classList.toggle('active');
    // Add now an eventlistener
    document.addEventListener('click', function closeClickOutside(event) {
        if (!menu.contains(event.target) && !userIcon.contains(event.target)) {
            menu.classList.remove('active'); // Close the menu if clicked outside
            document.removeEventListener('click', closeClickOutside); // Remove listener once the menu is closed
        }
    });
}
function logout() {
    // Clear stored user data (e.g., initials)
    localStorage.removeItem('currentUserInitial');
    
    // Reset the user icon to 'G' for guest
    const userIcon = document.getElementById('name_menu');
    if (userIcon) {
        userIcon.textContent = 'G';
    }
    window.location.href = '/html/login.html'; // Update the path if your login page is different
  }
document.addEventListener('DOMContentLoaded', function () {
    w3.includeHTML(); // Include HTML first

    // Attach the pageBack function after content is loaded
    document.querySelector('.back-arrow').addEventListener('click', pageBack);
});

function pageBack() {
    window.history.back();
}
