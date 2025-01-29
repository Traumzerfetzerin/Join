let contacts = [];
let currentContactId = null;
let contactsWithColors = {};

/**
 * Validates email format.
 * @param {string} email - Email address to validate.
 * @returns {boolean} - True if the email format is valid, otherwise false.
 */
function validateEmail(email) {
    let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
}


/**
 * Validates that all required fields are filled.
 * @param {string} name - Name of the contact.
 * @param {string} email - Email of the contact.
 * @param {string} phone - Phone number of the contact.
 * @returns {boolean} - True if all fields are filled, otherwise false.
 */
function validateFields(name, email, phone) {
    return [name, email, phone].every(Boolean);
}


/**
 * Validates the email format.
 * @param {string} email - Email to validate.
 * @returns {boolean} - True if email is valid, otherwise false.
 */
function validateEmail(email) {
    let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
}


/**
 * Shows an error message if fields are invalid.
 * @param {string} message - Message to display.
 */
function showError(message) {
    showToast(message, "error");
}


/**
 * Generates a random hex color code.
 * @returns {string} A random hex color code (e.g., '#A3F4D2').
 */
function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


/**
 * Clears input fields after creating or updating a contact.
 */
function clearInputFields() {
    ['name', 'email', 'phone'].forEach(id => document.getElementById(id).value = '');
}


/**
 * Hides the overlay after the contact is created or updated.
 */
function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
}


/**
 * Fetches the contact data from input fields.
 * @returns {object} - The contact data object containing name, email, and phone.
 */
function getContactData() {
    return {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
    };
}


/**
 * Event listener for the create contact button.
 * @param {Event} event - The click event.
 */
document.getElementById('create-contact-button')?.addEventListener('click', (event) => {
    event.preventDefault();

    let { name, email, phone } = getContactData();

    if (!validateFields(name, email, phone)) {
        return showError("Please fill in all fields.");
    }

    if (!validateEmail(email)) {
        return showError("Invalid email format.");
    }

    handleContactCreation({ name, email, phone });
});


/**
 * Checks if the contact has an ID.
 * @param {object} contact - The contact object.
 * @returns {boolean} - True if the contact has an ID, otherwise false.
 */
function validateContactId(contact) {
    if (!contact.id) {
        console.error("Error: Contact ID is missing.");
        showToast("Error updating contact. Contact ID is missing.", "error");
        return false;
    }
    return true;
}


/**
 * Validates the updated contact fields before saving.
 * @param {object} updatedContact - The updated contact object.
 * @returns {boolean} - True if all fields are valid, otherwise false.
 */
function validateUpdatedContact(updatedContact) {
    return [updatedContact.name, updatedContact.email, updatedContact.phone].every(Boolean);
}


/**
 * Creates an updated contact object based on the form input.
 * @returns {object} - The updated contact object.
 */
function getUpdatedContact() {
    return {
        id: currentContactId,
        name: document.getElementById('edit-contact-name')?.value.trim(),
        email: document.getElementById('edit-contact-email')?.value.trim(),
        phone: document.getElementById('edit-contact-phone')?.value.trim(),
    };
}


/**
 * Hides the contact overlay and resets the form.
 */
function hideContactOverlayAndResetForm() {
    document.getElementById('contact-overlay').style.display = 'none';
    resetEditForm();
}


/**
 * Updates the contact details section on the page.
 * @param {object} updatedContact - The updated contact object.
 */
function updateContactDetailsAndReload(updatedContact) {
    updateContactDetailsSection(updatedContact);
    loadContacts();
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

    let updatedContact = getUpdatedContact();

    if (!validateUpdatedContact(updatedContact)) {
        showToast('Please fill in all fields before saving.', 'error');
        return;
    }

    try {
        await updateContactInFirebase(updatedContact);
        hideContactOverlayAndResetForm();
        updateContactDetailsAndReload(updatedContact);
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
    if (!currentContactId) {
        showToast("Error: No contact selected for editing.", "error");
        return;
    }

    let contact = contacts.find(c => c.id === currentContactId);
    if (contact) {
        openEditOverlay(contact);
    } else {
        console.warn(`Contact with ID ${currentContactId} not found.`);
    }

    let initialsColor = getRandomColor();
    openEditOverlay(contact, initialsColor);
    closeSmallOverlay();
}

    document.querySelectorAll('.edit-link').forEach(link => {
    link.addEventListener('click', handleEditLinkClick);
});


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
