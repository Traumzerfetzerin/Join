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
                const firstLetter = user.email.charAt(0).toUpperCase();
                localStorage.setItem('currentUserInitial', firstLetter);

                const userIcon = document.getElementById('name_menu');
                if (userIcon) {
                    userIcon.textContent = firstLetter; // Update UI
                }

                responseMessage.textContent = 'Login successful! Redirecting...';
                responseMessage.style.color = 'green';

                setTimeout(() => {
                    window.location.href = 'board.html';
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
            return user || null;
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
        toggleIcon.src = '../Assests/visibility.svg'; // Show password icon
    } else {
        passwordInput.type = 'password';
        toggleIcon.src = '../Assests/visibility_off - Copy.svg'; // Hide password icon
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




































/*// Function to toggle password visibility
function togglePasswordVisibility(inputId, toggleIconId) {
  var passwordInput = document.getElementById(inputId);
  var toggleIcon = document.getElementById(toggleIconId);

  if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.src = 'login-img/visibility.svg'; // Change to show password icon
  } else {
      passwordInput.type = 'password';
      toggleIcon.src = 'login-img/visibility_off.svg'; // Change to hide password icon
  }
}

window.onload = function() {
  // Retrieve the current logged-in user's initial from localStorage
  let currentUserInitial = localStorage.getItem('currentUserInitial');

  // Check if initials exist and set the text content
  if (currentUserInitial) {
      document.getElementById('name_menu').textContent = currentUserInitial; // Update the user icon with the initial
  } else {
      console.log("No logged-in user found.");
  }
};

// Function to log in
function logIn(event) {
  event.preventDefault(); // Prevent the form from submitting

  // Get login form data
  let email = document.getElementById('name').value.trim(); // Trimming input
  let password = document.getElementById('login-password').value.trim(); // Trimming input
  let responseMessage = document.getElementById('response-message');

  // Retrieve stored user data from localStorage
  let users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Find the user by email and password
  let currentUser = users.find(user => user.email === email && user.password === password);

  console.log("Email entered:", email); // Debugging
  console.log("Password entered:", password); // Debugging
  console.log("Stored Users:", users); // Debugging

  // Validate login
  if (currentUser) {
      // Save the current user's first character for later use
      localStorage.setItem('currentUserInitial', currentUser.email[0].toUpperCase()); // Save first letter in uppercase

      // Show success message
      responseMessage.textContent = 'Login successful! Redirecting...';
      responseMessage.style.color = 'green';

      // Redirect to the board page upon successful login
      setTimeout(() => {
          window.location.href = 'board.html'; // Redirect to board page
      }, 1500);
  } else {
      responseMessage.textContent = 'Invalid email or password';
      responseMessage.style.color = 'red';
  }
};

window.onload = function() {
  // Retrieve the current logged-in user's initial from localStorage
  let currentUserInitial = localStorage.getItem('currentUserInitial');

  if (currentUserInitial) {
      document.getElementById('name_menu').textContent = currentUserInitial; // Update the user icon with the initial
  } else {
      console.log("No logged-in user found.");
  }
};





// Function to run on page load
/*window.onload = function() {
  // Retrieve the current logged-in user from localStorage
  let currentUserEmail = localStorage.getItem('currentUserEmail');

  if (currentUserEmail) {
      let initials = getInitialsFromEmail(currentUserEmail);
      document.getElementById('name_menu').textContent = initials; // Update the user icon with initials
  } else {
      console.log("No logged-in user found.");
  }
};*/

/*/ Function to extract initials from email
function getInitialsFromEmail(email) {
  let namePart = email.split('@')[0]; // Get the part before '@'
  let nameSegments = namePart.split('.'); // Split by '.' (e.g., 'first.last')

  // Handle the case where there may not be a '.' in the email's username part
  let initials = nameSegments.length >= 2
      ? nameSegments[0][0].toUpperCase() + nameSegments[1][0].toUpperCase()  // First letter of both parts
      : nameSegments[0][0].toUpperCase();  // Just take the first letter of the single name

  return initials;
}*/
