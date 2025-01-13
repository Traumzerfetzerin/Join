/**
 * Handles the creation or updating of the contact.
 * @param {object} contact - The contact object.
 */
async function handleContactCreation(contact) {
    try {
        let savedContact = await saveOrUpdateContactToFirebase(contact);
        showToast("Contact created successfully.", "success");
        addNewContactToDOM(savedContact);
        clearInputFields();
        hideOverlay();
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
        loadContacts();
        closeContactOverlay();
        clearContactDetails();
    } catch (error) {
        showToast('Error deleting contact: ' + error);
    }
}


/**
 * Saves or updates a contact in Firebase.
 * @param {object} contact - Contact object to save or update.
 * @returns {Promise<object>} - Saved or updated contact object.
 */
async function saveOrUpdateContactToFirebase(contact) {
    let { firebaseUrl, method } = getFirebaseUrlAndMethod(contact);
    let data = await fetchFromFirebase(firebaseUrl, method, contact);
    return updateLocalContacts(contact, data);
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