async function loadContactsForDropdown() {
    try {
        const response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app//contacts.json');
        const contactsData = await response.json();
        if (contactsData) {
            contacts = Object.keys(contactsData).map(key => ({ id: key, ...contactsData[key] }));
            populateCheckboxDropdown(); // Populate checkboxes
        } else {
            console.log('No contacts found');
        }
    } catch (error) {
        console.error('Error fetching contacts:', error);
    }
}


// Populate the custom dropdown with checkboxes for each contact
function populateCheckboxDropdown() {
    const dropdown = document.getElementById("assignTaskDropdown");
    dropdown.innerHTML = ''; // Clear previous options

    contacts.forEach(contact => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `checkbox_${contact.name.replace(/\s+/g, '_')}`;
        checkbox.value = contact.name; // Use contact name as value
        checkbox.addEventListener('change', updateAssignedContacts); // Add event listener

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(contact.name)); // Display contact name
        dropdown.appendChild(label);
        dropdown.appendChild(document.createElement('br')); // Line break for better UI
    });
}


// Maintain an array of selected contacts
let selectedContacts = [];


// Update the selected contacts based on checked checkboxes
function updateAssignedContacts() {
    selectedContacts = Array.from(document.querySelectorAll('#assignTaskDropdown input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    // Update the input field with the selected contacts
    document.getElementById('assigned-to').value = selectedContacts.join(', ');
}


// Toggle dropdown visibility
function toggleDropdown() {
    const dropdown = document.getElementById('assignTaskDropdown');
    let dropdownImg = document.getElementById('dropdown');
    let dropdownImg1 = document.getElementById('dropdown1');
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block'; // Show dropdown
        dropdownImg.style.display = 'none';
        dropdownImg1.style.display = 'block';
    } else {
        dropdown.style.display = 'none'; // Hide dropdown
        dropdownImg1.style.display = 'none';
        dropdownImg.style.display = 'block';
    }
}

// Close the dropdown when clicking outside
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