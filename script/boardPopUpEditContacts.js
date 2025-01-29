/**
 * Syncs contact icons in the overlay with the task details.
 * Fetches the latest contact data from Firebase.
 * @param {Array} contactIds - An array of contact IDs.
 */
async function syncContactIcons(contactIds) {
    if (!contactIds || contactIds.length === 0) {
        console.log("Keine Kontakt-IDs vorhanden:", contactIds);
        return;
    }
    let allContacts = await fetchContactsFromFirebase();

    let contactIconsContainer = document.getElementById('contact-icons-container');
    if (!contactIconsContainer) {
        console.log("Fehler: contact-icons-container nicht gefunden!");
        return;
    }

    let relevantContacts = contactIds.map(id => 
        allContacts.find(contact => contact.id === id) || { id, name: "Unknown" }
    );

    contactIconsContainer.innerHTML = relevantContacts.map(contact => `
        <div class="contact-icon" style="background-color: ${contact.color || '#ccc'}">
            ${contact.name || "Unknown"}
        </div>
    `).join('');
}



/**
 * Normalizes contact IDs by ensuring they are stored as strings.
 * @param {Array} contactIds - Contact IDs or objects.
 * @returns {Array} - Normalized contact IDs.
 */
function normalizeContactIds(contactIds) {
    if (!Array.isArray(contactIds) || contactIds.length === 0) return [];
    return typeof contactIds[0] === 'object' 
        ? contactIds.map(contact => contact.id || contact.name) 
        : contactIds;
}

/**
 * Fetches contacts from Firebase and maps them into an object for easy lookup.
 * @returns {Promise<Object>} - A map of contact IDs to contact details.
 */
async function fetchContacts() {
    try {
        let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
        let contactsData = await response.json();
        let contactMap = {};
        for (let key in contactsData) {
            let contact = contactsData[key];
            contactMap[contact.id] = contact; 
        }
        return contactMap;
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return {};
    }
}

/**
 * Updates the contact icons displayed in the designated container, ensuring the overlay is loaded.
 * @param {Array} contactIds - List of contact IDs assigned to a task.
 */
async function updateContactIcons(contactIds) {
    let contacts = await fetchContacts();
    let contactIconsContainer = document.getElementById('contact-icons-container');
    
    if (!contactIconsContainer) return;
    contactIconsContainer.innerHTML = '';

    let assignedContacts = contactIds
        .map(id => contacts[id])
        .filter(contact => contact); 

    contactIconsContainer.innerHTML = assignedContacts
        .map(contact => createContactIcon(contact))
        .join('');
}

/**
 * Extracts initials from a full name.
 * @param {string} name - The full name of the contact.
 * @returns {string} - The initials of the name.
 */
function getInitials(name) {
    if (!name) return "U"; 
    return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}


/**
 * Generates a contact icon HTML string.
 * @param {Object} contact - Contact object containing name and color.
 * @returns {string} - HTML string for the contact icon.
 */
function createContactIcon(contact) {
    let initials = getInitials(contact.name);
    return `<div class="contact-icon" style="background-color: ${contact.color}">${initials}</div>`;
}


/**
 * Assigns or unassigns a contact when a checkbox is clicked.
 * @param {string} contactId - The ID of the contact.
 */
function assignContact(contactId) {
    let checkbox = document.getElementById(`checkbox-${contactId}`);
    if (!checkbox) return;

    let isChecked = checkbox.checked;
    if (isChecked) {
        taskData.contacts.push(contactId);
    } else {
        taskData.contacts = taskData.contacts.filter(id => id !== contactId);
    }
}


/**
 * Updates the dropdown with all contacts and ensures icons are displayed.
 *
 * @function updateContactDropdown
 * @param {Array} allContacts - Array of all contact objects.
 * @param {Array} assignedContactIds - Array of assigned contact objects or IDs.
 * @returns {void}
 */
function updateContactDropdown(allContacts, assignedContactIds) {
    let dropdownContainer = document.querySelector('.contacts-section');

    if (!dropdownContainer) {
        console.error("Dropdown container not found.");
        return;
    }
    if (typeof assignedContactIds[0] === 'object') {
        assignedContactIds = assignedContactIds.map(contact => contact.id);
    }

    let assignedContacts = allContacts.filter(contact => assignedContactIds.includes(contact.id));
    dropdownContainer.innerHTML = generateContactDropdownHTML(allContacts, assignedContacts, assignedContactIds);
}



