let selectedContacts = [];


/**
 * Loads contacts from the Firebase database and populates the checkbox dropdown.
 * 
 * @async
 * @returns {Promise<void>} Resolves when contacts are loaded and the dropdown is populated.
 */
async function loadContactsForDropdown() {
    try {
        let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app//contacts.json');
        let contactsData = await response.json();
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
 * @param {Object} contact - The contact object.
 * @returns {HTMLElement} The name container.
 */
function createNameContainer(contact) {
    let initialsSpan = createInitialsSpan(contact);
    let nameContainer = generateDiv('name-container');
    nameContainer.innerHTML = `
        ${initialsSpan.outerHTML}
        <span class="contact-name">${contact.name}</span>
    `;
    return nameContainer;
}


/**
 * Creates a contact entry with a name container and checkbox.
 * @param {Object} contact - The contact object containing name and other details.
 * @returns {HTMLElement} The entry container with name and checkbox elements.
 */
function createContactEntry(contact) {
    let entryContainer = generateDiv('entry-container');
    let nameContainer = createNameContainer(contact);
    let checkbox = createCheckbox(contact);
    entryContainer.innerHTML = `${nameContainer.outerHTML}${checkbox.outerHTML}`;
    return entryContainer;
}


/**
 * Creates a checkbox for a contact entry.
 * @param {Object} contact - The contact object containing name and other details.
 * @returns {HTMLElement} The checkbox element.
 */
function createCheckbox(contact) {
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'addTaskCheckbox';
    checkbox.id = `checkbox_${contact.name.replace(/\s+/g, '_')}`;
    checkbox.dataset.id = contact.id;
    checkbox.value = contact.name;
    checkbox.addEventListener('change', updateAssignedContacts);
    return checkbox;
}



/**
 * Generates a div element with the specified class.
 * @param {string} className - The class name to assign to the div.
 * @returns {HTMLElement} The created div element.
 */
function generateDiv(className) {
    let div = document.createElement('div');
    div.classList.add(className);
    return div;
}


/**
 * Populates the task assignment dropdown with contact entries.
 * Clears existing options, adds new contact entries, and makes the dropdown visible.
 * @returns {void}
 */
function populateCheckboxDropdown() {
    let dropdown = document.getElementById("assignTaskDropdown");
    if (!dropdown) return;
    clearDropdown(dropdown);
    addContactsToDropdown(dropdown);
    showDropdown(dropdown);
}


/**
 * Clears all existing options in the dropdown.
 * @param {HTMLElement} dropdown - The dropdown element.
 */
function clearDropdown(dropdown) {
    dropdown.innerHTML = '';
}


/**
 * Adds contact entries to the dropdown.
 * @param {HTMLElement} dropdown - The dropdown element.
 */
function addContactsToDropdown(dropdown) {
    let entries = contacts.map(contact => createContactEntry(contact).outerHTML);
    dropdown.innerHTML = entries.join('');
}


/**
 * Makes the dropdown visible by removing the 'd-none' class.
 * @param {HTMLElement} dropdown - The dropdown element.
 */
function showDropdown(dropdown) {
    dropdown.classList.remove('d-none');
}


/**
 * Updates the 'assigned-to' input field with a comma-separated list of selected contact names.
 *
 * @returns {void}
 */
function updateAssignedContacts() {
    selectedContacts = Array.from(document.querySelectorAll('#assignTaskDropdown input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    document.getElementById('assigned-to').value = selectedContacts.join(', ');
}


/**
 * Toggles the visibility of the task assignment dropdown and changes the dropdown icon.
 * 
 * @returns {void}
 */
function toggleDropdown() {
    let dropdown = document.getElementById('assignTaskDropdown');
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
    let dropdown = document.getElementById('assignTaskDropdown');
    let inputContainer = document.querySelector('.input-with-icon');
    let dropdownImg = document.getElementById('dropdown');
    let dropdownImg1 = document.getElementById('dropdown1');

    if (!inputContainer.contains(event.target)) {
        dropdown.style.display = 'none';
        dropdownImg1.style.display = 'none';
        dropdownImg.style.display = 'block';
    }
});