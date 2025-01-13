let contacts = [];
let currentContactId = null;

window.addEventListener('load', loadContacts);

/**
 * Fetches all contacts from Firebase.
 * @returns {Promise<void>}
 */
async function loadContacts() {
    let databaseUrl = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
    try {
        let response = await fetch(databaseUrl);
        if (!response.ok) throw new Error("Failed to fetch contacts.");

        let data = await response.json();
        contacts = data ? Object.keys(data).map(id => ({ id, ...data[id] })) : [];
        displayContacts();
    } catch (error) {
        console.error("Error loading contacts:", error);
    }
}

/**
 * Validates email format.
 * @param {string} email - Email address to validate.
 * @returns {boolean} - True if the email format is valid, otherwise false.
 */
function validateEmail(email) {
    let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
}

document.getElementById('create-contact-button')?.addEventListener('click', async (event) => {
    event.preventDefault();

    let name = document.getElementById('name').value.trim();
    let email = document.getElementById('email').value.trim();
    let phone = document.getElementById('phone').value.trim();

    if (![name, email, phone].every(Boolean)) {
        return showToast("Please fill in all fields.", "error");
    }
    if (!validateEmail(email)) {
        return showToast("Invalid email format.", "error");
    }

    try {
        let savedContact = await saveOrUpdateContactToFirebase({ name, email, phone });
        showToast("Contact created successfully.", "success");
        addNewContactToDOM(savedContact);

        ['name', 'email', 'phone'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('overlay').style.display = 'none';
    } catch (error) {
        console.error("Error saving contact:", error);
        showToast("Error saving contact. Please try again.", "error");
    }
});

/**
 * Saves or updates a contact in Firebase.
 * @param {object} contact - Contact object to save or update.
 * @returns {Promise<object>} - Saved or updated contact object.
 */
async function saveOrUpdateContactToFirebase(contact) {
    let firebaseUrl = contact.id 
        ? `https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contact.id}.json`
        : 'https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json';

    let method = contact.id ? 'PUT' : 'POST';

    try {
        let response = await fetch(firebaseUrl, {
            method: method,
            body: JSON.stringify(contact),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to save or update contact');
        }

        let data = await response.json();

        if (!contact.id) {
            contact.id = data.name;
            contacts.push(contact);
        } else {
            let index = contacts.findIndex(c => c.id === contact.id);
            if (index !== -1) {
                contacts[index] = contact;
            }
        }

        return contact;
    } catch (error) {
        console.error('Error saving or updating contact:', error);
        throw error;
    }
}


/**
 * Deletes a contact.
 * @param {string} contactId - ID of the contact to be deleted.
 */
async function deleteContact(contactId) {
    let url = `https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`;
    try {
        let response = await fetch(url, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Network response was not ok');
        showToast('Contact deleted successfully');
        loadContacts();
        closeContactOverlay();
        clearContactDetails();
    } catch (error) {
        showToast('Error deleting contact: ' + error);
    }
}


/**
* Updates a contact in Firebase.
* @param {object} contact - The contact object to update.
* @returns {Promise<void>}
*/
async function updateContactInFirebase(contact) {
   if (!contact.id) {
       console.error("Error: Contact ID is missing.");
       showToast("Error updating contact. Contact ID is missing.", "error");
       return;
   }

   let url = `https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contact.id}.json`;
   try {
       let response = await fetch(url, {
           method: 'PUT',
           body: JSON.stringify(contact),
           headers: { 'Content-Type': 'application/json' },
       });

       if (!response.ok) {
           throw new Error('Failed to update contact.');
       }

       updateLocalContacts(contact);
       showToast('Contact updated successfully', 'success');
   } catch (error) {
       console.error('Error updating contact:', error);
       showToast('Error updating contact. Please try again.', 'error');
   }
}

/**
* Updates the local contacts array with the updated contact.
* @param {object} contact - The updated contact object.
*/
function updateLocalContacts(contact) {
   let contactIndex = contacts.findIndex(c => c.id === contact.id);
   if (contactIndex === -1) {
       console.warn(`Contact with ID ${contact.id} not found locally.`);
       return;
   }
   contacts[contactIndex] = contact;
}

/**
* Event listener for saving a contact.
*/
document.getElementById('save-contact-button')?.addEventListener('click', async function () {
   if (!currentContactId) {
       console.error('Error: No contact ID found for updating.');
       showToast('Error: No contact selected for saving.', 'error');
       return;
   }

   let updatedContact = {
       id: currentContactId,
       name: document.getElementById('edit-contact-name')?.value.trim(),
       email: document.getElementById('edit-contact-email')?.value.trim(),
       phone: document.getElementById('edit-contact-phone')?.value.trim(),
   };

   if (![updatedContact.name, updatedContact.email, updatedContact.phone].every(Boolean)) {
       showToast('Please fill in all fields before saving.', 'error');
       return;
   }

   try {
       await updateContactInFirebase(updatedContact);

       document.getElementById('contact-overlay').style.display = 'none';
       resetEditForm();
       updateContactDetailsSection(updatedContact);
       loadContacts();

       currentContactId = null;
   } catch (error) {
       console.error('Error saving contact:', error);
   }
});

/**
* Resets the contact edit form fields.
*/
function resetEditForm() {
   document.getElementById('edit-contact-name').value = '';
   document.getElementById('edit-contact-email').value = '';
   document.getElementById('edit-contact-phone').value = '';
}

/**
* Updates the contact details section with the updated contact information.
* @param {object} contact - The updated contact object.
*/
function updateContactDetailsSection(contact) {
   document.getElementById('contact-name').textContent = contact.name;
   document.getElementById('contact-email').textContent = contact.email;
   document.getElementById('contact-phone').textContent = contact.phone;
   document.getElementById('contact-initials').textContent = getInitials(contact.name);

   let initialsColor = getRandomColor();
   document.getElementById('contact-initials').style.backgroundColor = initialsColor;
}

/**
* Displays a toast message with a specific type.
* @param {string} message - The message to display.
* @param {string} [type='success'] - The type of the toast ('success' or 'error').
*/
function showToast(message, type = 'success') {
   let toast = document.getElementById('toast');
   if (!toast) return;

   toast.textContent = message;
   toast.className = `toast show ${type}`;
   setTimeout(() => toast.classList.remove('show'), 3000);
}

/**
 * Opens the add contact overlay.
 */
function openAddContactOverlay() {
    let overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.style.display = 'block';
    } else {
        console.error("Error: Overlay element not found.");
    }
}

/**
 * Hides the small overlay if a click occurs outside of it.
 * @param {Event} event - The click event.
 */
function handleOutsideClick(event) {
    let overlay = document.getElementById('small-overlay');
    let dotsIcon = document.getElementById('dots-icon');
    if (overlay && dotsIcon && event.target !== overlay && event.target !== dotsIcon && !overlay.contains(event.target)) {
        overlay.style.display = 'none';
    }
}

/**
 * Handles the edit link click event.
 * @param {Event} event - The click event.
 */
function handleEditLinkClick(event) {
    event.preventDefault();

    if (!currentContactId) {
        console.error("Error: No contact selected for editing.");
        showToast("Error: No contact selected for editing.", "error");
        return;
    }

    let contact = contacts.find(c => c.id === currentContactId);
    if (!contact) {
        console.warn(`Contact with ID ${currentContactId} not found.`);
        return;
    }

    let initialsColor = getRandomColor();
    openEditOverlay(contact, initialsColor);
    closeSmallOverlay();
}

/**
 * Handles the delete link click event.
 * @param {Event} event - The click event.
 */
function handleDeleteLinkClick(event) {
    event.preventDefault();

    if (!currentContactId) {
        console.error("Error: No contact selected to delete.");
        showToast("Error: No contact selected to delete.", "error");
        return;
    }

    deleteContact(currentContactId)
        .then(() => processSuccessfulDeletion())
        .catch(handleDeletionError);
}

/**
 * Processes a successful contact deletion.
 */
function processSuccessfulDeletion() {
    let contactElement = document.querySelector(`.contact-item[data-id="${currentContactId}"]`);
    if (contactElement) {
        contactElement.remove();
    } else {
        console.warn(`Contact element with ID ${currentContactId} not found.`);
    }

    loadContacts();
    closeSmallOverlay();
    showToast("Contact deleted successfully.", "success");
    resetContactView();
    currentContactId = null;
}

/**
 * Handles errors during contact deletion.
 * @param {Error} error - The error object.
 */
function handleDeletionError(error) {
    console.error("Error deleting contact:", error);
    showToast("Error deleting contact. Please try again.", "error");
}

// Event listeners
document.addEventListener('click', handleOutsideClick);

let editLink = document.getElementById('overlay-edit-link');
if (editLink) {
    editLink.addEventListener('click', handleEditLinkClick);
} else {
}

let deleteLink = document.getElementById('overlay-delete-link');
if (deleteLink) {
    deleteLink.addEventListener('click', handleDeleteLinkClick);
} else {
}
