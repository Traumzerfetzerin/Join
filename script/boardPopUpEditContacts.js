/**
 * Syncs contact icons in the overlay with the task details.
 * @param {Array} contactIds - An array of contact IDs.
 * @returns {Promise<void>}
 */
async function syncContactIcons(contactIds) {
    if (!contactIds || contactIds.length === 0) {
        return;
    }

    if (typeof contactIds[0] === 'object') {
        contactIds = contactIds.map(contact => contact.id || contact.name);
    }

    try {
        let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
        let contactsData = await response.json();

        if (contactsData) {
            let contacts = Object.keys(contactsData).map(key => ({
                id: key,
                ...contactsData[key],
            }));

            let assignedContacts = contacts.filter(contact => contactIds.includes(contact.id) || contactIds.includes(contact.name));

            let contactIconsContainer = document.getElementById('contact-icons-container');
            if (contactIconsContainer) {
                contactIconsContainer.innerHTML = assignedContacts
                    .map(contact => {
                        let initials = contact.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
                        let bgColor = contact.color || getRandomColor();
                        return `
                            <div class="contact-icon" style="background-color: ${bgColor};">
                                ${initials}
                            </div>
                        `;
                    })
                    .join('');
            }
        } else {
            console.error("Failed to fetch contacts from Firebase.");
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
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


/**
 * Updates the contact icons displayed in the designated container.
 *
 * @function updateContactIcons
 * @param {Array<Object>} assignedContacts - An array of contact objects, each containing a name.
 * @throws Will log an error if the contact icons container is not found.
 * @returns {void}
 */
function updateContactIcons(assignedContacts) {
    let contactIconsContainer = document.getElementById('contact-icons-container');
    if (!contactIconsContainer) {
        console.error("contact-icons-container not found");
        return;
    }

    contactIconsContainer.innerHTML = assignedContacts
        .map(contact => `
            <div class="contact-icon" style="background-color: ${getRandomColor()};">
                ${contact.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}
            </div>
        `)
        .join('');
}
