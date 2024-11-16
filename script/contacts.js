// Initialize contacts array to store contact data temporarily
let contacts = [];
let currentContactId = null;


// Fetch and display contacts when the page loads
window.addEventListener('load', function() {
    loadContacts(); // Fetch contacts from Firebase on page load
});

// Function to load contacts from Firebase and display them in the contact list
async function loadContacts() {
    try {
        const response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app//contacts.json');
        const contactsData = await response.json();

        if (contactsData) {
            contacts = Object.keys(contactsData).map(key => ({ id: key, ...contactsData[key] })); // Store contacts with IDs
            displayContacts(); // Call the new function to display contacts
        } else {
            console.log('No contacts found');
        }
    } catch (error) {
        console.error('Error fetching contacts:', error);
    }
}

// Function to display contacts on the page
function displayContacts() {
    const contactList = document.querySelector('.contact-list');
    contactList.innerHTML = ''; // Clear current contact list

    // Helper function to create the add button or icon
    const createAddButton = (className, id, innerHTML, appendTo) => {
        const element = document.createElement('div');
        element.classList.add(className);
        element.id = id;
        element.innerHTML = innerHTML;
        element.addEventListener('click', () => document.getElementById('overlay').style.display = 'block');
        appendTo.appendChild(element);
    };

    // Add "Add New Contact" button for large screens
    createAddButton('add-contact-button', 'show-overlay', `
        <span>Add New Contact</span>
        <img src="../Assets/personAdd.svg" alt="Add Contact" class="add-icon" />
    `, contactList);

    // Add "Add Contact" icon for small screens
    createAddButton('add-contact-icon', 'add-contact-icon', `
        <img src="../Assets/personAdd.svg" alt="Add Contact">
    `, document.body);

    // Dynamically populate contacts
    contacts.forEach(addNewContactToDOM);
}


// Function to display all contacts in the DOM


// Event listener for submitting the contact form
// Event listener for the "Create Contact" button inside the overlay
// Validate email format using regex
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
}

// Example usage after saving the new contact
document.getElementById('create-contact-button').addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent form submission

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    // Validate input fields
    if (![name, email, phone].every(Boolean)) return showToast("Please fill in all fields.", "error");
    if (!validateEmail(email)) return showToast("Invalid email format.", "error");

    try {
        // Save contact and add to DOM
        const savedContact = await saveOrUpdateContactToFirebase({ name, email, phone });
        showToast("Contact created successfully.", "success");
        addNewContactToDOM(savedContact);

        // Reset form and close overlay
        ['name', 'email', 'phone'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('overlay').style.display = 'none';
    } catch (error) {
        console.error("Error saving contact:", error);
        showToast("Error saving contact. Please try again.", "error");
    }
});





async function saveOrUpdateContactToFirebase(contact) {
    const firebaseUrl = contact.id 
        ? `https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contact.id}.json`
        : 'https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json';

    const method = contact.id ? 'PUT' : 'POST';

    try {
        const response = await fetch(firebaseUrl, {
            method: method,
            body: JSON.stringify(contact),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to save or update contact');
        }

        const data = await response.json();
        
        if (!contact.id) {
            contact.id = data.name; // Assign the Firebase ID if it's a new contact
            contacts.push(contact); // Add new contact to contacts array
        } else {
            // Update the local `contacts` array for an existing contact
            const index = contacts.findIndex(c => c.id === contact.id);
            if (index !== -1) {
                contacts[index] = contact;
            }
        }

        return contact; // Return the contact for further use
    } catch (error) {
        console.error('Error saving or updating contact:', error);
        throw error;
    }
}




// Function to add a new contact to the contact list in the DOM
function addNewContactToDOM(contact) {
    const contactList = document.querySelector('.contact-list'); // Assuming '.contact-list' is the container

    // Extract initials from the contact name
    const initials = getInitials(contact.name);

    // Generate random color for the initials
    const randomColor = getRandomColor();

    // Use a template literal to create the contact item structure
    const newContactHTML = `
        <div class="contact-item" data-id="${contact.id}">
            <div class="contact-initials" style="background-color: ${randomColor};">${initials}</div>
            <span class="contact-name">${contact.name}</span>
            <span class="contact-email">${contact.email}</span>
            <span class="contact-phone">${contact.phone}</span>
        </div>
        <div class="divider"></div>
    `;

    // Append the new contact item to the contact list
    contactList.insertAdjacentHTML('beforeend', newContactHTML);

    // Add a click event listener to the newly created contact item
    const newContact = contactList.lastElementChild.previousElementSibling;
    newContact.addEventListener('click', function () {
        showContactDetails(contact.id);
    });
    
}

// Helper function to get initials from the contact name
function getInitials(name) {
    return name
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .join('');
}

// Function to add a new contact to the DOM with all the existing features



// Helper function to generate random colors for initials
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


// Helper function to generate a random color for initials


// Function to display contact details below the "Contacts" section


// Select elements
// Utility function to generate initials from a name
function getInitials(name) {
    const names = name.split(' ');
    return names[0].charAt(0) + (names[1] ? names[1].charAt(0) : '');
}

// Utility function to generate a random color for initials background
function getRandomColor() {
    const colors = ['#FFB6C1', '#FFA07A', '#FA8072', '#E9967A', '#F08080'];
    return colors[Math.floor(Math.random() * colors.length)];
}




// Function to go back to contact list on smaller screens
function showContactDetails(contactId) {
    const contact = contacts.find(c => c.id === contactId); 
    if (!contact) return; // Exit if contact not found
    currentContactId = contact.id;

    // Populate contact details
    document.getElementById('contact-name').textContent = contact.name;
    document.getElementById('contact-email').textContent = contact.email;
    document.getElementById('contact-phone').textContent = contact.phone;
    document.getElementById('contact-initials').textContent = getInitials(contact.name);

    // Generate and apply random color for initials
    const initialsColor = getRandomColor();
    document.getElementById('contact-initials').style.backgroundColor = initialsColor;

    // Display the contact details section
    document.getElementById('contact-details').style.display = 'block';

    // Cache elements
    const contactList = document.querySelector('.contact-list');
    const contactDetails = document.querySelector('.contact');
    const backArrow = document.getElementById('back-arrow');
    const addContactIcon = document.getElementById('add-contact-icon');
    const dotsIcon = document.getElementById('dots-icon');
    const smallOverlay = document.getElementById('small-overlay');
    const editLink = document.querySelector('.edit-link');
    const deleteLink = document.querySelector('.delete-link');

    if (window.innerWidth <= 780) {
        // Switch to contact details view
        contactList.style.display = 'none';
        contactDetails.style.display = 'flex';
        backArrow.style.display = 'block';
        addContactIcon.style.display = 'none';

        // Ensure dots icon is visible in contact details view
        if (dotsIcon) dotsIcon.style.display = 'flex';

        // Add back-arrow functionality
        backArrow.onclick = () => {
            // Transition to contact list view
            contactList.style.display = 'block';
            contactDetails.style.display = 'none';
            backArrow.style.display = 'none';
            addContactIcon.style.display = 'block';

            // Hide dots icon when in contact list
            if (dotsIcon) dotsIcon.style.display = 'none';

            // Ensure small overlay is closed
            if (smallOverlay) smallOverlay.style.display = 'none';
        };

        // Attach functionality to dots-icon
        if (dotsIcon) {
            dotsIcon.onclick = (event) => {
                event.stopPropagation(); // Prevent event bubbling
                if (smallOverlay) {
                    // Toggle the display of the small overlay
                    if (smallOverlay.style.display === 'block' || smallOverlay.style.display === '') {
                        smallOverlay.style.display = 'block';
                    } else {
                        smallOverlay.style.display = 'flex';
                    }
                }
            };
        }

        // Close overlay if it was open previously
        if (smallOverlay && smallOverlay.style.display !== 'none') {
            smallOverlay.style.display = 'none';
        }
    }

    // Edit link functionality (for both small and large screens)
    if (editLink) {
        editLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            openEditOverlay(contact, initialsColor); // Call function to show overlay with initials color
        });
    }

    // Delete link functionality (for both small and large screens)
    if (deleteLink) {
        deleteLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            deleteContact(contactId); // Call function to delete the contact
        });
    }
}


/*function showContactDetails(contactId) {
    const contact = contacts.find(c => c.id === contactId); 
    if (!contact) return; // Exit if contact not found
    currentContactId = contact.id;


    // Populate contact details in the contact-details section
    document.getElementById('contact-name').textContent = contact.name;
    document.getElementById('contact-email').textContent = contact.email;
    document.getElementById('contact-phone').textContent = contact.phone;
    document.getElementById('contact-initials').textContent = getInitials(contact.name);

    // Generate and apply random color for initials
    const initialsColor = getRandomColor();
    document.getElementById('contact-initials').style.backgroundColor = initialsColor;

    // Display the contact details section
    document.getElementById('contact-details').style.display = 'block';
    const editLink = document.querySelector('.edit-link');
    if (editLink) {
        editLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            openEditOverlay(contact, initialsColor); // Call function to show overlay with initials color
        });
    }
    const deleteLink = document.querySelector('.delete-link');
    if (deleteLink) {
        deleteLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            deleteContact(contactId); // Call function to delete the contact
        });
    }

    // Toggle visibility based on screen width
    if (window.innerWidth <= 780) {
        document.querySelector('.contact-list').style.display = 'none'; // Hide contact list
        document.querySelector('.contact').style.display = 'flex';      // Show contact details
        document.getElementById('add-contact-icon').style.display = 'none';

        // Show the back arrow for smaller screens
        document.getElementById('back-arrow').style.display = 'block';
        
    }
}*/

// Event listener to show `contact-list` when back arrow is clicked
document.getElementById('back-arrow').addEventListener('click', function() {
    // Only show `contact-list` on screens 780px and below
    if (window.innerWidth <= 780) {
        document.querySelector('.contact-list').style.display = 'flex'; // Show contact list
        document.querySelector('.contact').style.display = 'none';      // Hide contact details        
    }
    const dotsIcon = document.getElementById('dots-icon');
    if (dotsIcon) {
        dotsIcon.style.display = 'none'; // Ensure the dots icon is hidden
    }
    const addContactIcon = document.getElementById('add-contact-icon');
    if (addContactIcon) {
        addContactIcon.style.display = 'block';
    }


});





// Function to open the overlay and populate input fields with contact details and initials
function openEditOverlay(contact, initialsColor) {
    // Show the overlay
    const overlay = document.getElementById('contact-overlay');
    overlay.style.display = 'flex';

    // Set the global variable to the current contact's ID
    currentContactId = contact.id;

    // Populate the overlay input fields with the contact data
    document.getElementById('edit-contact-name').value = contact.name;
    document.getElementById('edit-contact-email').value = contact.email;
    document.getElementById('edit-contact-phone').value = contact.phone;

    // Populate initials in the overlay and set the background color
    document.getElementById('contact-initials-overlay').textContent = getInitials(contact.name);
    document.getElementById('contact-initials-overlay').style.backgroundColor = initialsColor;
}


// Function to close the overlay
document.getElementById('close-contact-overlay').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('contact-overlay').style.display = 'none';
});

document.getElementById('delete-contact-button').addEventListener('click', function() {
    if (currentContactId) {
        deleteContact(currentContactId);
    }
});

// Function to delete a contact
async function deleteContact(contactId) {
    const url = `https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`; // Construct the URL
    try {
        // Send DELETE request to Firebase
        const response = await fetch(url, {
            method: 'DELETE'
        });
        // Check if the response is successful
        if (!response.ok) throw new Error('Network response was not ok');        
        showToast('Contact deleted successfully');
        // Reload contacts to update the contact list after deletion
        loadContacts();
        // Close the contact overlay (if open)
        closeContactOverlay();
        // Clear the contact details section
        clearContactDetails();
    } catch (error) {
        // Show error toast message if something went wrong
        showToast('Error deleting contact: ' + error);
    }
}

// Function to clear the contact details section
function clearContactDetails() {
    // Clear the text content of the contact details fields
    document.getElementById('contact-name').textContent = '';
    document.getElementById('contact-email').textContent = '';
    document.getElementById('contact-phone').textContent = '';
    document.getElementById('contact-initials').textContent = '';
    
    // Reset the initials background color
    document.getElementById('contact-initials').style.backgroundColor = ''; 

    // Hide the contact details section entirely
    document.getElementById('contact-details').style.display = 'none'; // Hide the section
    
    // Hide the edit and delete links (if they exist)
    const editLink = document.querySelector('.edit-link');
    const deleteLink = document.querySelector('.delete-link');
    
}
// Function to update a contact in Firebase
async function updateContactInFirebase(contact) {
    const url = `https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contact.id}.json`;
    try {
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(contact),
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to update contact');
        updateLocalContacts(contact);
        showToast('Contact updated successfully');
    } catch (error) {
        console.error('Error updating contact:', error);
        showToast('Error updating contact');
    }
}

function updateLocalContacts(contact) {
    const contactIndex = contacts.findIndex(c => c.id === contact.id);
    if (contactIndex !== -1) {
        contacts[contactIndex] = contact;
    }
}




// Event listener for save button in the edit overlay
document.getElementById('save-contact-button').addEventListener('click', async function() {
    if (!currentContactId) {
        console.error('Error: No contact ID found for updating.');
        showToast('Error: No contact selected for saving');
        return;
    }

    // Get the updated contact data from input fields
    const updatedContact = {
        id: currentContactId,
        name: document.getElementById('edit-contact-name').value,
        email: document.getElementById('edit-contact-email').value,
        phone: document.getElementById('edit-contact-phone').value,
    };

    // Call function to update contact in Firebase
    await updateContactInFirebase(updatedContact);

    // Close the overlay after saving
    document.getElementById('contact-overlay').style.display = 'none';

    // Clear the input fields in the overlay
    document.getElementById('edit-contact-name').value = '';
    document.getElementById('edit-contact-email').value = '';
    document.getElementById('edit-contact-phone').value = '';

    // Update the contact details section with the updated information
    updateContactDetailsSection(updatedContact);

    // Reload contacts to reflect the updated contact
    loadContacts();

    // Clear the global variable to reset
    currentContactId = null;
});

function updateContactDetailsSection(contact) {
    // Update the contact details section with the updated contact information
    document.getElementById('contact-name').textContent = contact.name;
    document.getElementById('contact-email').textContent = contact.email;
    document.getElementById('contact-phone').textContent = contact.phone;
    document.getElementById('contact-initials').textContent = getInitials(contact.name);

    // Update the initials background color
    const initialsColor = getRandomColor(); // Or you can retain the previous color logic if needed
    document.getElementById('contact-initials').style.backgroundColor = initialsColor;
}

// Function to close the contact overlay
function closeContactOverlay() {
    document.getElementById('contact-overlay').style.display = 'none'; // Hide overlay
}

// Event listener for the close button of the contact overlay
document.getElementById('close-contact-overlay').addEventListener('click', closeContactOverlay);

// Function to extract initials from a name
function getInitials(name) {
    const nameParts = name.split(' '); // Split the name by spaces
    let initials = nameParts[0].charAt(0).toUpperCase(); // Get the first letter of the first name

    if (nameParts.length > 1) {
        initials += nameParts[1].charAt(0).toUpperCase(); // Get the first letter of the second name if available
    }

    return initials;
}

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF'; // Hexadecimal characters
    let color = '#'; // Start with #
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]; // Generate random color
    }
    return color;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message; // Set the message
    toast.className = `toast show ${type}`; 

    // After 3 seconds, add the 'hide' class to slide the toast out
    setTimeout(() => {
        toast.classList.add('hide');
    }, 3000);

    // Remove the 'show' and 'hide' classes after the slide-out animation completes
    setTimeout(() => {
        toast.className = toast.className.replace('show', '').replace('hide', '');
    }, 3500); // Wait an additional 0.5 seconds to match the CSS transition
}
function openAddContactOverlay() {
    document.getElementById('overlay').style.display = 'block';
}

// Function to open the small overlay
document.getElementById('dots-icon').addEventListener('click', function(event) {
    event.stopPropagation(); // Prevent click from bubbling up
    const overlay = document.getElementById('small-overlay');
    overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
});

// Hide overlay when clicking outside of it
document.addEventListener('click', function(event) {
    const overlay = document.getElementById('small-overlay');
    const dotsIcon = document.getElementById('dots-icon');
    if (event.target !== overlay && event.target !== dotsIcon && !overlay.contains(event.target)) {
        overlay.style.display = 'none';
    }
});

// Link the "Edit" and "Delete" options to existing functions
document.getElementById('overlay-edit-link').addEventListener('click', function(event) {
    event.preventDefault();
    
    // Retrieve the contact using the global `currentContactId` or another means
    const contact = contacts.find(c => c.id === currentContactId);
    if (!contact) return; // Exit if contact not found

    // Generate a random color for the initials background
    const initialsColor = getRandomColor();

    // Call openEditOverlay with the contact and initials color
    openEditOverlay(contact, initialsColor);

    // Close the small overlay
    document.getElementById('small-overlay').style.display = 'none';
});


document.getElementById('overlay-delete-link').addEventListener('click', function (event) {
    event.preventDefault();

    if (!currentContactId) {
        showToast("Error: No contact selected to delete", "error");
        return;
    }

    // Call deleteContact and pass the current contact ID
    deleteContact(currentContactId)
        .then(() => {
            // Remove the contact from the DOM
            const contactElement = document.querySelector(`.contact-item[data-id="${currentContactId}"]`);
            if (contactElement) contactElement.remove();

            // Reload the contact list to reflect changes
            loadContacts();

            // Hide the overlay
            document.getElementById('small-overlay').style.display = 'none';

            // Show success toast
            showToast("Contact deleted successfully", "success");
            document.querySelector('.contact').style.display = 'none';    
            document.querySelector('.contact-list').style.display = 'block'; // Show contact list

            

            // Clear the global variable
            currentContactId = null;
        })
        .catch((error) => {
            console.error("Error deleting contact:", error);
            showToast("Error deleting contact. Please try again.", "error");
            
        });

        
});



