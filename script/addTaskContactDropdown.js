/**
 * Loads contacts from the Firebase database and populates the checkbox dropdown.
 * 
 * @async
 * @returns {Promise<void>} Resolves when contacts are loaded and the dropdown is populated.
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
 * Generates initials from the contact name and creates a span element to display them.
 * 
 * @param {Object} contact - The contact object containing the name and color.
 * @returns {HTMLElement} The span element displaying the contact's initials.
 */
function createInitialsSpan(contact) {
    let initials = generateInitials(contact.name);

    let initialsSpan = document.createElement('span');
    initialsSpan.classList.add('contact-initials');
    initialsSpan.textContent = initials;

    setInitialsBackgroundColor(initialsSpan, contact);

    return initialsSpan;
}


/**
 * Generates initials from a contact's name.
 * 
 * @param {string} name - The name of the contact.
 * @returns {string} The initials derived from the name.
 */
function generateInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('');
}


/**
 * Sets the background color for the initials span element.
 * 
 * @param {HTMLElement} initialsSpan - The span element displaying the initials.
 * @param {Object} contact - The contact object containing the color property.
 */
function setInitialsBackgroundColor(initialsSpan, contact) {
    if (contact.color) {
        initialsSpan.style.backgroundColor = contact.color;
    } else {
        let randomColor = getRandomColor();
        initialsSpan.style.backgroundColor = randomColor;
        contact.color = randomColor;
    }
}


/**
 * Creates a container with the contact's initials and name.
 * 
 * @param {Object} contact - The contact object.
 * @returns {HTMLElement} The name container.
 */
function createNameContainer(contact) {
    let initialsSpan = createInitialsSpan(contact);
    
    let nameSpan = document.createElement('span');
    nameSpan.classList.add('contact-name');
    nameSpan.textContent = contact.name;
    
    let nameContainer = document.createElement('div');
    nameContainer.classList.add('name-container');
    nameContainer.appendChild(initialsSpan);
    nameContainer.appendChild(nameSpan);
    
    return nameContainer;
}


/**
 * Creates a contact entry with a name container and checkbox.
 * 
 * @param {Object} contact - The contact object containing name and other details.
 * @returns {HTMLElement} The entry container with name and checkbox elements.
 */
function createContactEntry(contact) {
    let entryContainer = document.createElement('div');
    entryContainer.classList.add('entry-container');

    // Create name container
    let nameContainer = createNameContainer(contact);

    // Create checkbox element
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `checkbox_${contact.name.replace(/\s+/g, '_')}`;
    checkbox.value = contact.name;
    checkbox.addEventListener('change', updateAssignedContacts);

    // Append name container and checkbox to entry container
    entryContainer.appendChild(nameContainer);
    entryContainer.appendChild(checkbox);

    return entryContainer;
}


/**
 * Populates the task assignment dropdown with contact entries.
 * 
 * This function clears the existing dropdown options, creates a contact entry for each contact, 
 * and appends it to the dropdown. Finally, it ensures the dropdown is visible.
 * 
 * @returns {void}
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
 * @returns {string} A random hex color code (e.g., '#A3F4D2').
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
 * Updates the 'assigned-to' input field with a comma-separated list of selected contact names.
 *
 * @returns {void}
 */
function updateAssignedContacts() {
    selectedContacts = Array.from(document.querySelectorAll('#assignTaskDropdown input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    // Update the input field with the selected contacts
    document.getElementById('assigned-to').value = selectedContacts.join(', ');
}


/**
 * Toggles the visibility of the task assignment dropdown and changes the dropdown icon.
 * 
 * @returns {void}
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
 * Closes the task assignment dropdown when clicking outside the input container.
 * 
 * @param {Event} event - The click event.
 * @returns {void}
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