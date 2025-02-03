/**
 * Attaches click event listeners to the add contact buttons.
 */
function attachAddContactButtonListeners() {
    let showOverlayButton = document.getElementById('show-overlay');
    let addContactIconButton = document.getElementById('add-contact-icon');

    if (showOverlayButton && !showOverlayButton.hasAttribute('data-event-added')) {
        showOverlayButton.addEventListener('click', () => {
            toggleOverlay('overlay');
        });
        showOverlayButton.setAttribute('data-event-added', 'true');
    }

    if (addContactIconButton && !addContactIconButton.hasAttribute('data-event-added')) {
        addContactIconButton.addEventListener('click', () => {
            toggleOverlay('overlay');
        });
        addContactIconButton.setAttribute('data-event-added', 'true');
    }
}


/**
 * Adds event listeners to buttons to open the contact overlay.
 * Triggered when the DOM content is fully loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Add event listeners to the buttons for adding new contacts
    attachAddContactButtonListeners();

    // Add event listener for clicking on the background overlay
    let contactBackgroundOverlay = document.getElementById('contactBackgroundOverlay');
    if (contactBackgroundOverlay) {
        contactBackgroundOverlay.addEventListener('click', closeContactOverlayBackground);
    }
});


/**
 * Toggles the visibility of the specified overlay and its background.
 * @param {string} overlayId - The ID of the overlay element to be toggled.
 */
function toggleOverlay(overlayId) {
    let overlay = document.getElementById(overlayId);
    let contactBackgroundOverlay = document.getElementById('contactBackgroundOverlay');

    if (overlay) {
        if (overlay.style.display === "none" || overlay.style.display === "") {
            overlay.style.display = "block";
            contactBackgroundOverlay.classList.remove('dNone');
            contactBackgroundOverlay.style.display = "block";

        } else {
            overlay.style.display = "none";
            contactBackgroundOverlay.classList.add('dNone');
            contactBackgroundOverlay.style.display = "none";
        }
    }
}


/**
 * Closes the contact overlay and its background overlay when the background is clicked.
 * @param {Event} event - The click event triggered when the background overlay is clicked.
 */
function closeContactOverlayBackground(event) {
    document.getElementById('contact-overlay').style.display = "none";
    let contactBackgroundOverlay = document.getElementById('contactBackgroundOverlay');
    let overlay = document.getElementById('overlay');

    if (event.target === contactBackgroundOverlay) {
        if (overlay) {
            overlay.style.display = "none";
        }

        contactBackgroundOverlay.classList.add('dNone');
        contactBackgroundOverlay.style.display = "none";
    }
}


/**
 * Listens for a click event on the 'overlay' element and toggles its visibility
 * when the click target is the overlay itself.
 * @param {Event} event - The click event triggered on the overlay.
 */
document.getElementById('overlay').addEventListener('click', function (event) {
    if (event.target.id === 'overlay') {
        toggleOverlay('overlay');
    }
});


/**
 * Closes the contact overlay.
 */
function closeContactOverlay() {
    toggleElementVisibility('#contact-overlay', false);
}


/**
 * Closes the add contact overlay.
 */
function closeAddContactOverlay() {
    document.getElementById('overlay').style.display = 'none';
}


// Attach event listeners for add contact buttons on page load
document.addEventListener('DOMContentLoaded', () => {
    attachAddContactButtonListeners();
});


// Event listener to close the contact overlay
document.getElementById('close-contact-overlay')?.addEventListener('click', closeContactOverlay);


// Event listener to close the add contact overlay by clicking the "X" button
document.getElementById('close-overlay')?.addEventListener('click', (event) => {
    event.preventDefault();
    closeAddContactOverlay();
});


// Event listener to close the add contact overlay by clicking the "Cancel" button
document.getElementById('cancel-button')?.addEventListener('click', (event) => {
    event.preventDefault();
    closeAddContactOverlay();
});


// Event listener to close the add contact overlay by clicking outside of it
window.addEventListener('click', (event) => {
    let overlay = document.getElementById('overlay');
    if (overlay && !overlay.contains(event.target) && overlay.classList.contains('active')) {
        toggleOverlay('overlay');
    }
    let overlayContent = document.querySelector('.overlay-content');
    if (overlay && overlayContent && event.target === overlay) {
        closeAddContactOverlay();
    }
});


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


/**
 * Toggles the visibility of the options menu and the add contact icon.
 */
function toggleOptions() {
    let menu = document.getElementById('options-menu');
    menu.classList.toggle('dNone');

    let addContactIcon = document.getElementById('add-contact-icon');
    addContactIcon.classList.toggle('dNone');
}