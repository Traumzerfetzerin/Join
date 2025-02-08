let selectedContacts = [];


/**
 * Fetches contacts from Firebase and populates the dropdown with checkboxes.
 * 
 * @async
 * @function loadContactsForDropdown
 * @returns {Promise<void>} Resolves when contacts are loaded and dropdown is populated.
 * @throws {Error} If fetching contacts fails.
 */
async function loadContactsForDropdown() {
    try {
        let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
        let contactsData = await response.json();

        if (contactsData) {
            contacts = Object.keys(contactsData).map(key => ({ id: key, ...contactsData[key] }));
            populateCheckboxDropdown();
        } else {
            console.log("No contacts found");
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}


/**
 * Creates a span element displaying the initials of a contact.
 * 
 * @param {Object} contact - The contact object containing the name.
 * @returns {HTMLElement} The span element with the contact's initials.
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
 * @param {string} name - The full name of the contact.
 * @returns {string} The initials derived from the name.
 */
function generateInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('');
}


/**
 * Sets the background color of the initials span based on the contact's color or a random color.
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
 * @param {Object} contact - The contact object containing name and other details.
 * @returns {HTMLElement} The container with initials and contact name.
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
 * Creates a contact entry with name and checkbox elements.
 * 
 * @param {Object} contact - The contact object containing details.
 * @returns {HTMLElement} The container with name and checkbox for the contact.
 */
function createContactEntry(contact) {
    let entryContainer = generateDiv('entry-container');
    let nameContainer = createNameContainer(contact);
    let checkbox = createCheckbox(contact);

    let checkboxLabel = document.createElement('label');
    checkboxLabel.setAttribute('for', checkbox.id);
    checkboxLabel.innerHTML = `${nameContainer.outerHTML}`;

    entryContainer.innerHTML = `${checkboxLabel.outerHTML}${checkbox.outerHTML}`;

    entryContainer.addEventListener('click', function(event) {
        if (event.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            updateAssignedContacts();
        }
    });

    return entryContainer;
}


/**
 * Creates a checkbox for a contact entry.
 * 
 * @param {Object} contact - The contact object containing details.
 * @returns {HTMLElement} The checkbox element for the contact.
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
 * 
 * @param {string} className - The class name to assign to the div.
 * @returns {HTMLElement} The created div element.
 */
function generateDiv(className) {
    let div = document.createElement('div');
    div.classList.add(className);
    return div;
}


/**
 * Populates the task assignment dropdown with contact entries and makes it visible.
 */
function populateCheckboxDropdown() {
    let dropdown = document.getElementById("assignTaskDropdown");
    if (!dropdown) return;
    clearDropdown(dropdown);
    addContactsToDropdown(dropdown);
    showDropdown(dropdown);
}


/**
 * Clears all options in the dropdown.
 * 
 * @param {HTMLElement} dropdown - The dropdown element to clear.
 */
function clearDropdown(dropdown) {
    dropdown.innerHTML = '';
}


/**
 * Adds contact entries to the dropdown.
 * 
 * @param {HTMLElement} dropdown - The dropdown element to populate with contacts.
 */
function addContactsToDropdown(dropdown) {
    let entries = contacts.map(contact => createContactEntry(contact).outerHTML);
    dropdown.innerHTML = entries.join('');
}


/**
 * Makes the dropdown visible by removing the 'd-none' class.
 * 
 * @param {HTMLElement} dropdown - The dropdown element to show.
 */
function showDropdown(dropdown) {
    dropdown.classList.remove('d-none');
}


/**
 * Updates the list of selected contacts and displays them in the 'assigned-to' input field.
 * 
 * @returns {void}
 */
function updateAssignedContacts() {
    selectedContacts = Array.from(document.querySelectorAll('#assignTaskDropdown input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    document.getElementById('assigned-to').value = selectedContacts.join(', ');

    displaySelectedContacts();
}


/**
 * Displays the selected contacts with their initials in the 'selectedContactsContainer'.
 * 
 * @returns {void}
 */
let displayedCount = 4;

/**
 * Renders the selected contacts into the container.
 */
function displaySelectedContacts() {
    let selectedContainer = document.getElementById('selectedContactsContainer');
    selectedContainer.innerHTML = '';
    renderSelectedContacts(selectedContainer);
    renderShowMoreCircle(selectedContainer);
}

/**
 * Creates and appends selected contacts to the container.
 * @param {HTMLElement} container - The container to append selected contacts.
 */
function renderSelectedContacts(container) {
    selectedContacts.slice(0, displayedCount).forEach(contactName => {
        let contact = contacts.find(c => c.name === contactName);
        if (contact) {
            let initialsSpan = createInitialsSpan(contact);
            let contactDiv = document.createElement('div');
            contactDiv.classList.add('selected-contact');
            contactDiv.appendChild(initialsSpan);
            container.appendChild(contactDiv);
        }
    });
}

/**
 * Creates and appends the 'show more' circle if necessary.
 * @param {HTMLElement} container - The container to append the show more circle.
 */
function renderShowMoreCircle(container) {
    let remainingContacts = selectedContacts.length - displayedCount;
    if (remainingContacts > 0) {
        let showMoreCircle = document.createElement('div');
        showMoreCircle.classList.add('show-more-circle');
        showMoreCircle.textContent = `+${remainingContacts}`;
        showMoreCircle.addEventListener('click', function() {
            displayedCount += 1;
            displaySelectedContacts();
        });
        container.appendChild(showMoreCircle);
    }
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

    updateAssignedContacts();
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
    updateAssignedContacts();
});