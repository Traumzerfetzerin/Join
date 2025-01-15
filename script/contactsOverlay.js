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