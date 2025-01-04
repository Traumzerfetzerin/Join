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
 * @param {Array} allContacts - Array of all contact objects.
 * @param {Array} assignedContactIds - Array of assigned contact objects or IDs.
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
    dropdownContainer.innerHTML = `
        <strong>Assigned To:</strong>
        <div class="dropdown-header" onclick="toggleEditDropdown()">
            <input type="text" id="editAssignedTo" placeholder="Selected contacts to assign" readonly>
            <span class="dropdown-arrow">▼</span>
        </div>
        <div id="editAssignTaskDropdown" class="dropdown-container dNone">
            ${allContacts.map(contact => `
                <div class="dropdown-entry">
                    <label>
                        <input type="checkbox" value="${contact.id}" ${assignedContactIds.includes(contact.id) ? 'checked' : ''}>
                        ${contact.name}
                    </label>
                </div>
            `).join('')}
        </div>
        <div id="contact-icons-container" class="contact-icons">
            ${assignedContacts.map(contact => `
                <div class="contact-icon" style="background-color: ${getRandomColor()};">
                    ${contact.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}
                </div>
            `).join('')}
        </div>
    `;
}


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

