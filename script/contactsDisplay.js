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
 * Displays contacts on the page.
 */
function displayContacts() {
    clearContactList();

    let contactList = document.querySelector('.contact-list');
    if (contactList) {
        let contactsHTML = '';

        if (Array.isArray(contacts) && contacts.length > 0) {
            let groupedContacts = groupContactsByFirstLetter(contacts);
            contactsHTML = generateGroupedContactsHTML(groupedContacts);
        } else {
            contactsHTML = '<p>No contacts available.</p>';
        }
        contactList.innerHTML = contactsHTML;
        attachContactClickListeners();
        displayAddContactButtons(); 
    } else {
    }
}


/**
 * Clears the contact list container on the page.
 */
function clearContactList() {
    let contactList = document.querySelector('.contact-list');
    if (contactList) {
        contactList.innerHTML = '';
    } else {
    }
}


/**
 * Adds all contacts to the DOM.
 */
function addContactsToDOM() {
    if (!Array.isArray(contacts) || contacts.length === 0) {
        return;
    }

    contacts.forEach(contact => addNewContactToDOM(contact));
}


/**
 * Adds a new contact to the contact list in the DOM.
 * @param {object} contact - Contact object containing name, email, phone, and id.
 */
function addNewContactToDOM(contact) {
    let contactList = document.querySelector('.contact-list');
    if (!contactList) {
        console.error("Contact list container not found.");
        return;
    }

    let contactHTML = generateContactHTML(contact);
    contactList.insertAdjacentHTML('beforeend', contactHTML);

    let newContact = contactList.querySelector(`.contact-item[data-id="${contact.id}"]`);
    if (newContact) {
        newContact.addEventListener('click', () => {
            showContactDetails(contact.id);
        });
    } else {
        console.warn(`Failed to attach event listener to contact with ID: ${contact.id}`);
    }
}