/**
 * Helper function to update the text content of an element.
 * @param {string} selector - The CSS selector of the element.
 * @param {string} content - The content to set.
 */
function updateElementContent(selector, content) {
    let element = document.querySelector(selector);
    if (element) {
        element.textContent = content;
    } else {
        console.warn(`Element with selector "${selector}" not found.`);
    }
}


/**
 * Helper function to set the background color of an element.
 * @param {string} selector - The CSS selector of the element.
 * @param {string} color - The background color to set.
 */
function setElementBackgroundColor(selector, color) {
    let element = document.querySelector(selector);
    if (element) {
        element.style.backgroundColor = color;
    } else {
        console.warn(`Element with selector "${selector}" not found.`);
    }
}


/**
 * Helper function to toggle visibility of an element.
 * @param {string} selector - The CSS selector of the element.
 * @param {boolean} isVisible - True to show the element, false to hide it.
 */
function toggleElementVisibility(selector, isVisible) {
    let element = document.querySelector(selector);
    if (element) {
        element.style.display = isVisible ? 'block' : 'none';
    } else {
        console.warn(`Element with selector "${selector}" not found.`);
    }
}


/**
 * Generates the HTML structure for a contact.
 * @param {object} contact - Contact object containing name, email, phone, and id.
 * @returns {string} - HTML string for the contact.
 */
function generateContactHTML(contact) {
    let initials = getInitials(contact.name);
    let randomColor = getRandomColor();
    contact.initialsColor = randomColor;

    return `
        <div class="contact-item" data-id="${contact.id}">
            <div class="contact-initials" style="background-color: ${randomColor};">${initials}</div>
            <span class="contact-name">${contact.name}</span>
            <span class="contact-email">${contact.email}</span>
            <span class="contact-phone">${contact.phone}</span>
        </div>
        <div class="divider"></div>`;
}

/**
 * Generates a random color for initials background.
 * @returns {string} - Hexadecimal color code.
 */
function getRandomColor() {
    let colors = ['#FFB6C1', '#FFA07A', '#FA8072', '#E9967A', '#F08080'];
    return colors[Math.floor(Math.random() * colors.length)];
}


/**
 * Extracts the initials from a contact name.
 * @param {string} name - The full name of the contact.
 * @returns {string} - The initials of the contact.
 */
function getInitials(name) {
    if (!name || typeof name !== "string") {
        return "?";
    }
    let parts = name.split(" ");
    let initials = parts.map(part => part.charAt(0).toUpperCase()).join("");
    return initials.slice(0, 2);
}