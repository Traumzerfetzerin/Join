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
    } else {
    }

    if (addContactIconButton && !addContactIconButton.hasAttribute('data-event-added')) {
        addContactIconButton.addEventListener('click', () => {
            toggleOverlay('overlay');
        });
        addContactIconButton.setAttribute('data-event-added', 'true');
    } else {
    }
}


function toggleOverlay(overlayId) {
    let overlay = document.getElementById(overlayId);
    if (overlay.style.display === 'block') {
        overlay.style.display = 'none';
    } else {
        overlay.style.display = 'block';
    }
}


document.getElementById('overlay').addEventListener('click', function(event) {
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
