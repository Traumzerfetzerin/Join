/**
 * Loads contact data from a remote Firebase database and populates the contact dropdown.
 * 
 * This asynchronous function fetches the contacts data from the specified Firebase Realtime Database URL.
 * It processes the response to extract contact information and stores it in the `contacts` array. 
 * If the data is successfully retrieved, the function then calls `populateCheckboxDropdown` to update the UI.
 * If no contacts are found or an error occurs during the fetch process, an appropriate message is logged to the console.
 * 
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the contacts have been loaded and the dropdown populated.
 */
async function loadContactsForDropdown() {
    try {
        const response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app//contacts.json');
        const contactsData = await response.json();
        if (contactsData) {
            contacts = Object.keys(contactsData).map(key => ({ id: key, ...contactsData[key] }));
            populateCheckboxDropdown(); 
        } else {
            console.log('No contacts found');
        }
    } catch (error) {
        console.error('Error fetching contacts:', error);
    }
}


/**
 * Creates a span element for the contact's initials.
 * 
 * This function generates a span element displaying the initials of the contact's name.
 * If the contact has a color, it applies that color to the initials. Otherwise, it generates a random color.
 * 
 * @param {Object} contact - The contact object containing the name and color (optional).
 * @returns {HTMLElement} The span element with the initials and background color.
 */
function createInitialsSpan(contact) {
    let initials = contact.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('');

    let initialsSpan = document.createElement('span');
    initialsSpan.classList.add('contact-initials');
    initialsSpan.textContent = initials;

    if (contact.color) {
        initialsSpan.style.backgroundColor = contact.color;
    } else {
        let randomColor = getRandomColor();
        initialsSpan.style.backgroundColor = randomColor;
        contact.color = randomColor;
    }

    return initialsSpan;
}


/**
 * Creates a contact entry element with initials, name, and a checkbox.
 * 
 * This function generates a container for a contact entry, including the initials, name, and checkbox.
 * It calls the `createInitialsSpan` function to generate the initials for the contact.
 * 
 * @param {Object} contact - The contact object containing the name and color (optional).
 * @returns {HTMLElement} The contact entry container with the initials, name, and checkbox.
 */
function createContactEntry(contact) {
    let entryContainer = document.createElement('div');
    entryContainer.classList.add('entry-container');

    // Create initials span using the helper function
    let initialsSpan = createInitialsSpan(contact);

    // Create name span
    let nameSpan = document.createElement('span');
    nameSpan.classList.add('contact-name');
    nameSpan.textContent = contact.name;

    // Create checkbox element
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `checkbox_${contact.name.replace(/\s+/g, '_')}`;
    checkbox.value = contact.name;
    checkbox.addEventListener('change', updateAssignedContacts);

    // Create name container and append initials and name
    let nameContainer = document.createElement('div');
    nameContainer.classList.add('name-container');
    nameContainer.appendChild(initialsSpan);
    nameContainer.appendChild(nameSpan);

    // Append name container and checkbox to entry container
    entryContainer.appendChild(nameContainer);
    entryContainer.appendChild(checkbox);

    return entryContainer;
}


/**
 * Populates the task assignment dropdown with contact options and checkboxes.
 * 
 * This function loops through the contacts array and calls the `createContactEntry` function
 * to generate the HTML for each contact. It then appends each entry to the dropdown.
 * 
 * @function
 * @returns {void} This function does not return any value.
 */
function populateCheckboxDropdown() {
    let dropdown = document.getElementById("assignTaskDropdown");
    if (!dropdown) {
        return;
    }

    // Clear the existing dropdown options
    dropdown.innerHTML = '';

    // Create and append contact entries
    contacts.forEach(contact => {
        let contactEntry = createContactEntry(contact);
        dropdown.appendChild(contactEntry);
    });

    // Make the dropdown visible
    dropdown.classList.remove('d-none');
}


/**
 * Generates a random hex color code.
 * 
 * This function generates a random hexadecimal color code (e.g., "#A3C1F7") by selecting
 * random characters from the set of hexadecimal digits (0-9 and A-F). The color code 
 * is returned as a string.
 * 
 * @returns {string} A randomly generated hex color code.
 */
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


// Maintain an array of selected contacts
let selectedContacts = [];


/**
 * Updates the list of assigned contacts based on selected checkboxes.
 * 
 * This function retrieves all checked checkboxes within the `#assignTaskDropdown` element,
 * collects their values (contact names), and updates the input field with the ID `assigned-to` 
 * with a comma-separated list of the selected contact names.
 * 
 * @returns {void} This function does not return any value.
 */
function updateAssignedContacts() {
    selectedContacts = Array.from(document.querySelectorAll('#assignTaskDropdown input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    // Update the input field with the selected contacts
    document.getElementById('assigned-to').value = selectedContacts.join(', ');
}


/**
 * Toggles the visibility of the task assignment dropdown.
 * 
 * This function checks the current display state of the dropdown with the ID `assignTaskDropdown`.
 * If the dropdown is currently hidden or has no display style set, it will be shown, and the 
 * corresponding dropdown icon will be swapped. If the dropdown is visible, it will be hidden.
 * 
 * @returns {void} This function does not return any value.
 */
function toggleDropdown() {
    const dropdown = document.getElementById('assignTaskDropdown');
    let dropdownImg = document.getElementById('dropdown');
    let dropdownImg1 = document.getElementById('dropdown1');
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        dropdownImg.style.display = 'none';
        dropdownImg1.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
        dropdownImg1.style.display = 'none';
        dropdownImg.style.display = 'block';
    }
}


/**
 * Closes the task assignment dropdown when clicking outside of the input container.
 * 
 * This event listener listens for a `click` event on the document. If the user clicks outside of the 
 * input container with the class `input-with-icon`, the dropdown with the ID `assignTaskDropdown` 
 * is hidden, and the corresponding dropdown icons are toggled accordingly.
 * 
 * @param {Event} event - The click event that triggered this function.
 * @returns {void} This function does not return any value.
 */
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('assignTaskDropdown');
    const inputContainer = document.querySelector('.input-with-icon');
    let dropdownImg = document.getElementById('dropdown');
    let dropdownImg1 = document.getElementById('dropdown1');

    if (!inputContainer.contains(event.target)) {
        dropdown.style.display = 'none';
        dropdownImg1.style.display = 'none';
        dropdownImg.style.display = 'block';
    }
});