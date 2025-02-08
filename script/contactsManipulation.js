/**
 * Displays the add contact buttons (large and small) on the page.
 */
function displayAddContactButtons() {
    let contactList = document.querySelector('.contact-list');
    if (!contactList) {
        console.error("Contact list container not found.");
        return;
    }

    if (!document.getElementById('show-overlay')) {
        let addButtonLarge = generateAddButtonLargeHTML();
        contactList.insertAdjacentHTML('afterbegin', addButtonLarge);
    }

    if (!document.getElementById('add-contact-icon')) {
        let addButtonSmall = generateAddButtonSmallHTML();
        document.body.insertAdjacentHTML('beforeend', addButtonSmall);
    }

    attachAddContactButtonListeners();
}


/**
* Generates the HTML for the large add contact button.
* @returns {string} - HTML string for the large add contact button.
*/
function generateAddButtonLargeHTML() {
    return /*HTML*/`
        <div class="add-contact-button" id="show-overlay" onclick="closeContactOverlay(event)">
            <span>Add New Contact</span>
            <img src="../Assets/personAdd.svg" alt="Add Contact" class="add-icon" />
        </div>`;
}


/**
* Generates the HTML for the small add contact button.
* @returns {string} - HTML string for the small add contact button.
*/
function generateAddButtonSmallHTML() {
    return `
        <div class="add-contact-icon" id="add-contact-icon">
            <img src="../Assets/personAdd.svg" alt="Add Contact">
        </div>`;
}


/**
 * Displays contact details and toggles visibility if the same contact is clicked again.
 * @param {string} contactId - The ID of the contact to display.
 */
function showContactDetails(contactId) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('selected-contact');
    });
    if (currentContactId === contactId) {
        toggleElementVisibility('#contact-details', false);
        currentContactId = null;
        resetSmallScreenUI();
    } else {
        let contact = contacts.find(c => c.id === contactId);
        if (!contact) return;

        currentContactId = contact.id;
        updateContactDetailsUI(contact);
        handleSmallScreenAdjustments();
        attachEditAndDeleteListeners(contactId, contact);

        let selectedContactElement = document.querySelector(`.contact-item[data-id="${contactId}"]`);
        if (selectedContactElement) {
            selectedContactElement.classList.add('selected-contact');
        }
    }
}


/**
 * Updates the contact details UI with the provided contact data.
 * @param {object} contact - The contact object to display.
 */
function updateContactDetailsUI(contact) {
    document.getElementById('contact-name').textContent = contact.name;
    document.getElementById('contact-email').textContent = contact.email;
    document.getElementById('contact-phone').textContent = contact.phone;
    document.getElementById('contact-initials').textContent = getInitials(contact.name);
    document.getElementById('contact-initials').style.backgroundColor = contact.color;
    document.getElementById('contact-details').style.display = 'block';
}


/**
 * Adjusts the UI for smaller screens and attaches relevant listeners.
 */
function handleSmallScreenAdjustments() {
    if (window.innerWidth > 780) return;

    let contactList = document.querySelector('.contact-list');
    let contactDetails = document.querySelector('.contact');
    let backArrow = document.getElementById('back-arrow');
    let addContactIcon = document.getElementById('add-contact-icon');
    let dotsIcon = document.getElementById('dots-icon');
    let smallOverlay = document.getElementById('small-overlay');

    toggleSmallScreenUI(contactList, contactDetails, backArrow, addContactIcon, dotsIcon, smallOverlay);
}


/**
 * Toggles the UI elements for smaller screens.
 */
function toggleSmallScreenUI(contactList, contactDetails, backArrow, addContactIcon, dotsIcon, smallOverlay) {
    contactList.style.display = 'none';
    contactDetails.style.display = 'flex';
    backArrow.style.display = 'block';
    addContactIcon.style.display = 'none';
    if (dotsIcon) dotsIcon.style.display = 'flex';

    backArrow.onclick = () => resetSmallScreenUI(contactList, contactDetails, backArrow, addContactIcon, dotsIcon, smallOverlay);
    attachDotsIconListener(dotsIcon, smallOverlay);
}


/**
 * Resets the UI elements to their default state for small screens.
 */
function resetSmallScreenUI() {
    let contactList = document.querySelector('.contact-list');
    let backArrow = document.getElementById('back-arrow');
    let dotsIcon = document.getElementById('dots-icon');
    let smallOverlay = document.getElementById('small-overlay');
    contactList.style.display = 'block';
    document.querySelector('.contact-details').style.display = 'none';
    backArrow.style.display = 'none';
    if (dotsIcon) dotsIcon.style.display = 'none';
    if (smallOverlay) smallOverlay.style.display = 'none';
}


/**
 * Attaches the click listener to the dots icon to toggle the small overlay.
 */
function attachDotsIconListener(dotsIcon, smallOverlay) {
    if (!dotsIcon) return;

    dotsIcon.onclick = (event) => {
        event.stopPropagation();
        if (smallOverlay) {
            smallOverlay.style.display = smallOverlay.style.display === 'block' || smallOverlay.style.display === ''
                ? 'none'
                : 'flex';
        }
    };
}


/**
 * Attaches edit and delete listeners to the respective buttons.
 * @param {string} contactId - The ID of the contact to edit or delete.
 * @param {object} contact - The contact object.
 */
function attachEditAndDeleteListeners(contactId, contact) {
    let editLink = document.querySelector(`#edit-link-${contactId}`);
    let deleteLink = document.querySelector(`#delete-link-${contactId}`);
    let initialsColor = getRandomColor();

    if (editLink) {
        editLink.addEventListener('click', function (event) {
            event.preventDefault();
            openEditOverlay(contact, initialsColor);
        });
    }

    if (deleteLink) {
        deleteLink.addEventListener('click', function (event) {
            event.preventDefault();
            deleteContact(contactId);
        });
    }
}


// Event listener for back arrow click
document.getElementById('back-arrow')?.addEventListener('click', handleBackArrowClick);


/**
 * Handles the back arrow click to reset the view for small screens.
 */
function handleBackArrowClick() {
    if (window.innerWidth <= 780) {
        toggleElementVisibility('.contact-list', true);
        toggleElementVisibility('.contact', false);
    }
    toggleElementVisibility('#dots-icon', false);
    toggleElementVisibility('#add-contact-icon', true);
}


/**
 * Clears the contact details section.
 */
function clearContactDetails() {
    updateElementContent('#contact-name', '');
    updateElementContent('#contact-email', '');
    updateElementContent('#contact-phone', '');
    updateElementContent('#contact-initials', '');
    setElementBackgroundColor('#contact-initials', '');
    toggleElementVisibility('#contact-details', false);
}


/**
 * Resets the contact view to show the contact list.
 */
function resetContactView() {
    toggleElementVisibility('.contact', false);
    toggleElementVisibility('.contact-list', true);
}


/**
 * Opens the overlay and populates input fields with contact details and initials.
 * @param {object} contact - Contact object containing the details.
 */
function openEditOverlay(contact, initialsColor) {
    toggleElementVisibility('#contact-overlay', true);

    let contactBackgroundOverlay = document.getElementById('contactBackgroundOverlay');
    contactBackgroundOverlay.classList.remove('dNone');
    contactBackgroundOverlay.style.display = 'block';

    document.getElementById('edit-contact-name').value = contact.name || '';
    document.getElementById('edit-contact-email').value = contact.email || '';
    document.getElementById('edit-contact-phone').value = contact.phone || '';
    document.getElementById('contact-initials-overlay').textContent = getInitials(contact.name);
    document.getElementById('contact-initials-overlay').style.backgroundColor = initialsColor || getRandomColor();
}


// Close overlay event listener
document.getElementById('close-contact-overlay')?.addEventListener('click', (event) => {
    event.preventDefault();
    toggleElementVisibility('#contact-overlay', false);
    document.getElementById('contactBackgroundOverlay').classList.add('dNone');
});


// Delete contact button event listener
document.getElementById('delete-contact-button')?.addEventListener('click', () => {
    if (currentContactId) deleteContact(currentContactId);
});


// Event listeners for global actions
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('back-arrow')?.addEventListener('click', handleBackArrowClick);
    loadContacts();
    attachGlobalEventListeners();
    displayContacts();
    displayAddContactButtons();
});


/**
 * Attaches global event listeners for actions like back arrow and overlays.
 */
function attachGlobalEventListeners() {
    document.getElementById('dots-icon')?.addEventListener('click', toggleSmallOverlay);
    document.getElementById('close-contact-overlay')?.addEventListener('click', closeContactOverlay);
    document.getElementById('delete-contact-button')?.addEventListener('click', handleDeleteContact);
}


/**
 * Handles the back arrow click to switch views on smaller screens.
 */
function handleBackArrowClick() {
    if (window.innerWidth <= 780) {
        toggleElementVisibility('.contact-list', true);
        toggleElementVisibility('.contact', false);
    }
    toggleElementVisibility('#dots-icon', false);
    toggleElementVisibility('#add-contact-icon', true);
}


/**
 * Groups contacts by their first letter.
 * @param {Array} contacts - Array of contact objects.
 * @returns {Object} - Grouped contacts by first letter.
 */
function groupContactsByFirstLetter(contacts) {
    return contacts.reduce((groups, contact) => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!groups[firstLetter]) {
            groups[firstLetter] = [];
        }
        groups[firstLetter].push(contact);
        return groups;
    }, {});
}


/**
 * Attaches the click event listeners to the contact items.
 */
function attachContactClickListeners() {
    contacts.forEach(contact => {
        let contactElement = document.querySelector(`.contact-item[data-id="${contact.id}"]`);
        if (contactElement) {
            contactElement.addEventListener('click', () => {
                showContactDetails(contact.id);
            });
        } else {
            console.warn(`Failed to attach event listener to contact with ID: ${contact.id}`);
        }
    });
}


/**
* Generates the HTML for the edit section with a specific ID.
* @returns {string} - HTML string for the edit section.
*/
function generateEditSectionHTML(currentContactId) {
    return /*HTML*/`
        <div class="editSection dNone" id="edit-section-small-contact">
            <a href="#" class="edit-link" onclick="handleEditLinkClick()">
                <img src="../Assets/edit_21dp_5F6368_FILL0_wght400_GRAD0_opsz20.svg" alt="Edit Icon" class="icon"> Edit
            </a>
            <a href="#" class="delete-link" onclick="handleDeleteContact()">
                <img src="../Assets/delete_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg" alt="Delete Icon" class="icon"> Delete
            </a>
        </div>`;
}


/**
 * Toggles the visibility of the editSection and the dots-icon.
 * @param {Event} event - The event object.
 */
function toggleEditSection(event) {
    event.stopPropagation();
    let editSectionHTML = generateEditSectionHTML();
    let dotsIcon = event.target.closest('.dots-icon');
    if (dotsIcon) {
        let existingEditSection = document.getElementById('edit-section-small-contact');
        if (existingEditSection) {
            existingEditSection.classList.toggle('dNone');
        } else {
            dotsIcon.insertAdjacentHTML('afterend', editSectionHTML);
            let editSection = document.getElementById('edit-section-small-contact');
            if (editSection) {
                editSection.classList.remove('dNone');
            }
        }
        dotsIcon.classList.toggle('dNone');
    }
}


/**
 * Closes the editSection if clicked outside.
 * @param {Event} event - The event object.
 */
function handleOutsideClick(event) {
    let editSection = document.getElementById('edit-section-small-contact');
    let dotsIcon = document.getElementById('dots-icon');

    if (editSection && event.target !== editSection && event.target !== dotsIcon && !editSection.contains(event.target)) {
        editSection.classList.add('dNone');
        if (dotsIcon) {
            dotsIcon.classList.remove('dNone');
        }
    }
}


// Attach the toggleEditSection function to the dots-icon click event
document.getElementById('dots-icon')?.addEventListener('click', toggleEditSection);
document.addEventListener('click', handleOutsideClick);