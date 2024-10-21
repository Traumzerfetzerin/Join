// Initialize contacts array to store contact data temporarily
let contacts = [];

// Fetch and display contacts when the page loads
window.addEventListener('load', function() {
    loadContacts(); // Fetch contacts from Firebase on page load
});

// Function to load contacts from Firebase and display them in the contact list
async function loadContacts() {
    try {
        const response = await fetch('https://join-c3b28-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
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

    contacts.forEach(contact => {
        addContactToDOM(contact.name, contact.email, contact.phone, contact.id); // Display each contact in the list
    });
}

// Function to open the overlay
document.getElementById('show-overlay').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'block';
});

// Function to close the overlay
document.getElementById('close-overlay').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default behavior (if it's an anchor tag)
    document.getElementById('overlay').style.display = 'none';
});

// Function to validate the contact form and save the contact data
document.getElementById('add-contact-button').addEventListener('click', function(event) {
    event.preventDefault();

    // Get form data
    let name = document.getElementById('name').value.trim();
    let email = document.getElementById('email').value.trim();
    let phone = document.getElementById('phone').value.trim(); // Get the phone number

    // Validate form data
    if (!validateEmail(email)) {
        showToast('Invalid email format');
        return;
    }

    if (!name) {
        showToast('Name is required');
        return;
    }

    if (!phone) {
        showToast('Phone number is required');
        return;
    }

    // Check if email already exists
    isContactExists(email)
        .then(exists => {
            if (exists) {
                showToast('Contact with this email already exists');
                return;
            }

            // Save contact data to Firebase
            saveContactData(name, email, phone)
                .then(() => {
                    showToast('Contact created successfully', 'success');

                    clearContactForm();
                    document.getElementById('overlay').style.display = 'none';
                    loadContacts();
                })
                .catch(error => {
                    showToast('Error saving contact: ' + error);
                });
        })
        .catch(error => {
            showToast('Error checking email: ' + error);
        });
});


// Function to validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
async function saveContactData(name, email, phone) {
    const contactData = {
        name: name,
        email: email,
        phone: phone // Add phone to the contact data
    };

    return fetch('https://join-c3b28-default-rtdb.europe-west1.firebasedatabase.app/contacts.json', {
        method: 'POST',
        body: JSON.stringify(contactData),
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


// Function to save contact data in Firebase


// Function to check if a contact with the same email already exists in Firebase
async function isContactExists(email) {
    return fetch('https://join-c3b28-default-rtdb.europe-west1.firebasedatabase.app/contacts.json')
        .then(response => response.json())
        .then(data => {
            // Check if any contact has the same email
            return Object.values(data || {}).some(contact => contact.email === email);
        });
}

// Function to clear the contact form
function clearContactForm() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
}

// Function to add a new contact to the contact list in the DOM
function addContactToDOM(name, email, phone, id) {
    const contactList = document.querySelector('.contact-list'); // Assuming '.contact-list' is the container

    // Create new contact item
    const newContact = document.createElement('div');
    newContact.classList.add('contact-item');
    
    // Set the contact ID as a data attribute for later use
    newContact.setAttribute('data-id', id);

    // Extract initials from the name
    const initials = getInitials(name);

    // Create a div for the initials and set its styles
    const initialsDiv = document.createElement('div');
    initialsDiv.classList.add('contact-initials');
    initialsDiv.textContent = initials;

    // Generate random color for initials
    const randomColor = getRandomColor();
    initialsDiv.style.backgroundColor = randomColor; // Set the random color

    // Add styles for initials
    initialsDiv.style.width = '40px';
    initialsDiv.style.height = '40px';
    initialsDiv.style.borderRadius = '50%';
    initialsDiv.style.color = 'white';
    initialsDiv.style.display = 'flex';
    initialsDiv.style.alignItems = 'center';
    initialsDiv.style.justifyContent = 'center';
    initialsDiv.style.fontSize = '16px';
    initialsDiv.style.fontWeight = 'bold';
    initialsDiv.style.marginBottom = '8px';

    // Add contact name, email, and phone to the new contact item
    const contactName = document.createElement('span');
    contactName.classList.add('contact-name');
    contactName.textContent = name;

    const contactEmail = document.createElement('span');
    contactEmail.classList.add('contact-email');
    contactEmail.textContent = email;

    const contactPhone = document.createElement('span');
    contactPhone.classList.add('contact-phone');
    contactPhone.textContent = phone; // Ensure this is set correctly

    // Add click event to the contact item to show details
    newContact.addEventListener('click', function() {
        showContactDetails(id); // Show details in the overlay when contact is clicked
    });

    // Append initials, name, email, and phone to the new contact item
    newContact.appendChild(initialsDiv); // Add initials at the top
    newContact.appendChild(contactName);
    newContact.appendChild(contactEmail);
    newContact.appendChild(contactPhone); // Append phone number to the contact item

    // Append the new contact item to the contact list
    contactList.appendChild(newContact);
}


// Function to show contact details in an overlay
// Function to show contact details in an overlay
// Function to show contact details in an overlay
// Function to show contact details in an overlay
function showContactDetails(contactId) {
    const contact = contacts.find(c => c.id === contactId); // Find the contact by ID
    if (!contact) return; // Exit if contact not found

    // Populate the overlay with contact details as plain text initially
    document.getElementById('contact-details-name').innerHTML = `<strong>Name:</strong> <p id="name-display">${contact.name}</p>`;
    document.getElementById('contact-details-email').innerHTML = `<strong>Email:</strong> <p id="email-display">${contact.email}</p>`;
    document.getElementById('contact-details-phone').innerHTML = `<strong>Phone:</strong> <p id="phone-display">${contact.phone}</p>`;

    // Show edit and delete buttons
    document.getElementById('edit-contact-button').style.display = 'block';
    document.getElementById('save-contact-button').style.display = 'none'; // Hide save button initially
    document.getElementById('delete-contact-button').style.display = 'block'; // Ensure delete button is visible

    // Edit button functionality
    document.getElementById('edit-contact-button').onclick = function() {
        // Show input fields with the current contact values
        document.getElementById('contact-details-name').innerHTML = `<strong>Name:</strong> <input type="text" class="edit-form" id="edit-name" value="${contact.name}">`;
        document.getElementById('contact-details-email').innerHTML = `<strong>Email:</strong> <input type="text" class="edit-form" id="edit-email" value="${contact.email}">`;
        document.getElementById('contact-details-phone').innerHTML = `<strong>Phone:</strong> <input type="text"class="edit-form" id="edit-phone" value="${contact.phone}">`;

        // Switch to update mode
        document.getElementById('edit-contact-button').style.display = 'none'; // Hide the edit button
        document.getElementById('save-contact-button').style.display = 'block'; // Show the save button
    };

    // Save button functionality
    document.getElementById('save-contact-button').onclick = function() {
        // Get updated values
        const updatedName = document.getElementById('edit-name').value.trim();
        const updatedEmail = document.getElementById('edit-email').value.trim();
        const updatedPhone = document.getElementById('edit-phone').value.trim();

        // Validate updated email format
        if (!validateEmail(updatedEmail)) {
            showToast('Invalid email format');
            return;
        }

        // Update contact in Firebase
        updateContact(contactId, updatedName, updatedEmail, updatedPhone)
            .then(() => {
                showToast('Contact updated successfully');
                loadContacts(); // Reload contacts after updating
                closeContactOverlay(); // Close the overlay
            })
            .catch(error => {
                alert('Error updating contact: ' + error);
            });
    };

    // Delete button functionality
    document.getElementById('delete-contact-button').onclick = function() {
        deleteContact(contactId); // Call the delete function when delete button is clicked
    };

    // Show overlay
    document.getElementById('contact-overlay').style.display = 'flex'; 
}

// Function to delete a contact
async function deleteContact(contactId) {
    const url = `https://join-c3b28-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`; // Construct the URL

    try {
        const response = await fetch(url, {
            method: 'DELETE' // Send a DELETE request to Firebase
        });
        if (!response.ok) throw new Error('Network response was not ok');
        
        showToast('Contact deleted successfully');
        loadContacts(); // Reload contacts after deletion
        closeContactOverlay(); // Close the overlay
    } catch (error) {
        showToast('Error deleting contact: ' + error);
    }
}

// Function to update a contact in Firebase
async function updateContact(contactId, name, email, phone) {
    const contactData = {
        name: name,
        email: email,
        phone: phone // Include the updated phone number
    };

    const url = `https://join-c3b28-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`; // Construct the URL

    return fetch(url, {
        method: 'PUT', // Use PUT to update the existing contact
        body: JSON.stringify(contactData),
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
    toast.className = `toast show ${type}`; // Add the 'show' class and type ('success' or 'error')

    // After 3 seconds, remove the 'show' class to hide the toast with sliding effect
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}




















