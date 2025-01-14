/**
 * Attaches click event listeners to the add contact buttons.
 */
function attachAddContactButtonListeners() {
    let showOverlayButton = document.getElementById('show-overlay');
    let addContactIconButton = document.getElementById('add-contact-icon');

    if (showOverlayButton) {
        showOverlayButton.addEventListener('click', () => {
            document.getElementById('overlay').style.display = 'block';
        });
    } else {
        console.warn("Add contact button (large) not found.");
    }

    if (addContactIconButton) {
        addContactIconButton.addEventListener('click', () => {
            document.getElementById('overlay').style.display = 'block';
        });
    } else {
        console.warn("Add contact button (small) not found.");
    }
}


/**
 * Opens the overlay and populates input fields with contact details and initials.
 * @param {object} contact - Contact object containing the details.
 * @param {string} initialsColor - Background color for the initials.
 */
function openEditOverlay(contact, initialsColor) {
    toggleElementVisibility('#contact-overlay', true);
    currentContactId = contact.id;

    updateElementContent('#edit-contact-name', contact.name);
    updateElementContent('#edit-contact-email', contact.email);
    updateElementContent('#edit-contact-phone', contact.phone);
    updateElementContent('#contact-initials-overlay', getInitials(contact.name));
    setElementBackgroundColor('#contact-initials-overlay', initialsColor);
}


/**
 * Closes the contact overlay.
 */
function closeContactOverlay() {
    toggleElementVisibility('#contact-overlay', false);
}


// Event listener to close the contact overlay
document.getElementById('close-contact-overlay')?.addEventListener('click', closeContactOverlay);


/**
 * Toggles the small overlay visibility.
 * @param {Event} event - The click event.
 */
function toggleSmallOverlay(event) {
    event.stopPropagation();
    let overlay = document.getElementById('small-overlay');
    if (overlay) {
        overlay.style.display = overlay.style.display === 'none' || overlay.style.display === '' ? 'block' : 'none';
    } else {
        console.warn("Small overlay element not found.");
    }
}


/**
 * Closes the small overlay.
 */
function closeSmallOverlay() {
    toggleElementVisibility('#small-overlay', false);
}