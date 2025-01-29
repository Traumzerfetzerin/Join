/**
 * Syncs contact icons in the overlay with the task details.
 * @param {Array} contactIds - An array of contact IDs.
 * @returns {Promise<void>}
 */
async function syncContactIcons(contactIds) {
    if (!contactIds || contactIds.length === 0) return;
    contactIds = normalizeContactIds(contactIds);
    let contacts = await fetchContacts();
    let contactIconsContainer = document.getElementById('contact-icons-container');
    updateContactIcons(contactIds, contacts);
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
 * Fetches all contacts from Firebase.
 * @returns {Promise<Array>} - Array of contact objects.
 */
async function fetchContacts() {
    try {
        let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
        let contactsData = await response.json();
        return contactsData ? Object.keys(contactsData).map(key => ({ id: key, ...contactsData[key] })) : [];
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return [];
    }
}

/**
 * Updates the contact icons displayed in the designated container, ensuring the overlay is loaded.
 * @param {Array} contactIds - List of contact IDs.
 * @param {Array} contacts - List of all contacts.
 */
function updateContactIcons(contactIds, contacts) {
    let contactIconsContainer = document.getElementById('contact-icons-container');
    if (!contactIconsContainer) return;
    
    let assignedContacts = contacts.filter(contact => contactIds.includes(contact.id) || contactIds.includes(contact.name));
    contactIconsContainer.innerHTML = assignedContacts.map(createContactIcon).join('');
}

/**
 * Creates a contact icon HTML string.
 * @param {Object} contact - Contact object.
 * @returns {string} - HTML string for contact icon.
 */
function createContactIcon(contact) {
    if (!contact || !contact.name) return "";
    
    let initials = contact.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
    let bgColor = contact.color || getRandomColor();
    
    return `<div class="contact-icon" style="background-color: ${bgColor};">${initials}</div>`;
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
    
    console.log("Updated contacts:", taskData.contacts);
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



