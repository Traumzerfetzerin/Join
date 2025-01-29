/**
 * Handles the creation or updating of the contact.
 * @param {object} contact - The contact object.
 */
async function handleContactCreation(contact) {
    try {
        if (!contact.color) {
            contact.color = getRandomColor();
        }
        let savedContact = await saveOrUpdateContactToFirebase(contact);
        showToast("Contact created successfully.", "success");
        addNewContactToDOM(savedContact);
        clearInputFields();
        hideOverlay();
        setTimeout(() => {
            window.location.href = 'contacts.html'; 
        }, 500);
    } catch (error) {
        console.error("Error saving contact:", error);
        showError("Error saving contact. Please try again.");
    }
}


/**
 * Handles the delete contact action.
 */
function handleDeleteContact() {
    if (currentContactId) {
        deleteContact(currentContactId);
    } else {
        console.warn("No current contact selected for deletion.");
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
        closeContactOverlay();
        clearContactDetails();
        setTimeout(() => {
            window.location.href = 'contacts.html'; 
        }, 500);
    } catch (error) {
        showToast('Error deleting contact: ' + error);
    }
}

/** 
 * Saves or updates a contact in Firebase.
 * @param {object} contact - The contact object to save or update.
 * @returns {Promise<object>} - The saved or updated contact object.
 */
async function saveOrUpdateContactToFirebase(contact) {
    let { firebaseUrl, method } = getFirebaseUrlAndMethod(contact);
    let data = await saveContactToFirebase(firebaseUrl, method, contact);
    contact = addContactIdIfNeeded(contact, data);
    if (!firebaseUrl.includes(contact.id)) {
        await updateContactWithIdInFirebase(contact);
    }
    return updateLocalContacts(contact, data);
}


/**
 * Sends a contact to Firebase and retrieves the response.
 * @param {string} url - The Firebase URL.
 * @param {string} method - The HTTP method (POST or PUT).
 * @param {object} contact - The contact object to save or update.
 * @returns {Promise<object>} - The response data from Firebase.
 */
async function saveContactToFirebase(url, method, contact) {
    let response = await fetch(url, {
        method: method,
        body: JSON.stringify(contact),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error("Failed to save or update contact");
    }

    return await response.json();
}


/**
 * Adds the Firebase-generated ID to the contact if not already present.
 * @param {object} contact - The contact object to check and update.
 * @param {object} data - The data returned from Firebase.
 * @returns {object} - The updated contact object.
 */
function addContactIdIfNeeded(contact, data) {
    if (!contact.id && data.name) {
        contact.id = data.name;
    }
    return contact;
}


/**
 * Updates the contact in Firebase with its generated ID.
 * @param {object} contact - The contact object to update.
 * @returns {Promise<void>} - Resolves when the update is successful.
 */
async function updateContactWithIdInFirebase(contact) {
    let url = `https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contact.id}.json`;

    let response = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(contact),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error("Failed to update contact with ID in Firebase");
    }
}


/**
 * Handles the update process of a contact in Firebase.
 * @param {object} contact - The contact object to update.
 */
async function updateContactInFirebase(contact) {
    if (!validateContactId(contact)) {
        return;
    }

    let url = buildFirebaseUrl(contact.id);

    try {
        let response = await sendUpdateRequest(url, contact);

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