// Initialize contacts array to store contact data temporarily
let contacts = [];
let editingContactId = null; // Variable to store the ID of the contact being edited

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
    clearContactForm(); // Clear form when opening the overlay
    editingContactId = null; // Reset editing mode when opening overlay
});

// Function to close the overlay
document.getElementById('close-overlay').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default behavior (if it's an anchor tag)
    document.getElementById('overlay').style.display = 'none';
});

// Function to validate the contact form and save or update the contact data
document.getElementById('add-contact-button').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get form data
    let name = document.getElementById('name').value.trim();
    let email = document.getElementById('email').value.trim();
    let phone = document.getElementById('phone').value.trim(); // Get phone number from form

    // Validate form data
    if (!validateEmail(email)) {
        alert('Invalid email format');
        return;
    }

    if (!name) {
        alert('Name is required');
        return;
    }

    // Check if email already exists
    isContactExists(email)
        .then(exists => {
            if (exists && editingContactId === null) {
                alert('Contact with this email already exists');
                return;
            }

            // If editing an existing contact
            if (editingContactId) {
                updateContactData(editingContactId, name, email, phone)
                    .then(() => {
                        alert('Contact updated successfully');
                        clearContactForm(); // Clear form after saving
                        document.getElementById('overlay').style.display = 'none'; // Close overlay
                        loadContacts(); // Reload contacts
                        editingContactId = null; // Reset editing mode
                    })
                    .catch(error => {
                        alert('Error updating contact: ' + error);
                    });
            } else {
                // Save new contact data to Firebase
                saveContactData(name, email, phone) // Pass phone number to be saved
                    .then(() => {
                        alert('Contact created successfully');
                        clearContactForm(); // Clear form after saving

                        // Close overlay
                        document.getElementById('overlay').style.display = 'none';

                        // Reload contacts to show the newly created contact
                        loadContacts();
                    })
                    .catch(error => {
                        alert('Error saving contact: ' + error);
                    });
            }
        })
        .catch(error => {
            alert('Error checking email: ' + error);
        });
});

// Function to validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Function to save contact data in Firebase
async function saveContactData(name, email, phone) { // Added phone to parameters
    const contactData = {
        name: name,
        email: email,
        phone: phone // Include phone number in contact data
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
    document.getElementById('phone').value = ''; // Clear phone input field
    editingContactId = null; // Reset editing contact ID
}

// Function to add a new contact to the contact list in the DOM
function addContactToDOM(name, email, phone, id) { // Added phone to parameters
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
    contactPhone.classList.add('contact-phone'); // Add class for styling
    contactPhone.textContent = phone; // Display phone number

    // Add click event to the contact item to show details
    newContact.addEventListener('click', function() {
        showContactDetails(id); // Show details in the overlay when contact is clicked
    });

    // Append initials, name, email, and phone to the new contact item
    newContact.appendChild(initialsDiv); // Add initials at the top
    newContact.appendChild(contactName);
    newContact.appendChild(contactEmail);
    newContact.appendChild(contactPhone); // Append phone number

    // Append the new contact item to the contact list
    contactList.appendChild(newContact);
}

// Function to show contact details in an overlay
function showContactDetails(contactId) {
    const contact = contacts.find(c => c.id === contactId); // Find the contact by ID
    if (!contact) return; // Exit if contact not found

    // Populate the overlay with contact details
    document.getElementById('contact-details-name').innerHTML = `<strong>Name:</strong><br> ${contact.name}`;
    document.getElementById('contact-details-email').innerHTML = `<strong>Email:</strong> ${contact.email}`;
    document.getElementById('contact-details-phone').innerHTML = `<strong>Phone:</strong> ${contact.phone}`; // Show phone number

    document.getElementById('delete-contact-button').onclick = function() {
        deleteContact(contactId); // Set the delete function on the button
    };

    document.getElementById('edit-contact').onclick = function() {
        openEditForm(contactId); // Open the edit form for the contact
    };

    document.getElementById('contact-overlay').style.display = 'flex'; // Show overlay
}

// Function to open the edit form with pre-filled data
function openEditForm(contactId) {
    const contact = contacts.find(c => c.id === contactId); // Find the contact by ID
    if (!contact) return; // Exit if contact not found

    // Pre-fill the form fields with contact data
    document.getElementById('name').value = contact.name;
    document.getElementById('email').value = contact.email;
    document.getElementById('phone').value = contact.phone; // Pre-fill phone number

    editingContactId = contactId; // Set editing ID to the current contact

    document.getElementById('overlay').style.display = 'block'; // Show overlay for editing

    closeContactOverlay(); // Close the details overlay
}

// Function to delete a contact from Firebase
function deleteContact(contactId) {
    const url = `https://join-c3b28-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`;
    fetch(url, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete contact');
            }
            alert('Contact deleted successfully');
            loadContacts(); // Reload contacts after deletion
            closeContactOverlay(); // Close the contact details overlay
        })
        .catch(error => {
            alert('Error deleting contact: ' + error);
        });
}

// Function to close the contact details overlay
function closeContactOverlay() {
    document.getElementById('contact-overlay').style.display = 'none'; // Hide contact overlay
}
document.getElementById('close-contact-overlay').addEventListener('click', closeContactOverlay);

// Function to get initials from the contact name
function getInitials(name) {
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
}

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color; // Return random hex color
}

// Function to update contact data in Firebase
async function updateContactData(contactId, name, email, phone) {
    const updatedContactData = { name, email, phone }; // Create an object for updated data
    const url = `https://join-c3b28-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`;

    return fetch(url, {
        method: 'PUT', // Use PUT method to update
        body: JSON.stringify(updatedContactData),
        headers: { 'Content-Type': 'application/json' }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to update contact');
        }
        return response.json(); // Return the response data
    });
}





































// Initialize contacts array to store contact data temporarily
