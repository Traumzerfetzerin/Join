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


// Populate the custom dropdown with checkboxes for each contact
function populateCheckboxDropdown() {
    const dropdown = document.getElementById("assignTaskDropdown");
    dropdown.innerHTML = ''; // Clear previous options

    contacts.forEach(contact => {
        // Create a container for each entry
        const entryContainer = document.createElement('div');
        entryContainer.classList.add('entry-container'); // Add a class for styling

        // Generate initials from the name
        const initials = contact.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');

        // Create a span for initials
        const initialsSpan = document.createElement('span');
        initialsSpan.classList.add('contact-initials'); // Add a class for styling
        initialsSpan.textContent = initials;
        
        // Apply the background color from the contact
        if (contact.color) {
            initialsSpan.style.backgroundColor = contact.color; // Use color from the contact object
        } else {
            // Generate and assign a color if not already present
            const randomColor = getRandomColor();
            initialsSpan.style.backgroundColor = randomColor;
            contact.color = randomColor; // Save the generated color back to the contact
        }

        // Create a span for the contact name
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('contact-name'); // Add a class for styling
        nameSpan.textContent = contact.name;

        // Create checkbox element
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `checkbox_${contact.name.replace(/\s+/g, '_')}`;
        checkbox.value = contact.name; // Use contact name as value
        checkbox.addEventListener('change', updateAssignedContacts); // Add event listener

        // Append initials and name to the left side
        const nameContainer = document.createElement('div');
        nameContainer.classList.add('name-container'); // Wrapper for initials and name
        nameContainer.appendChild(initialsSpan);
        nameContainer.appendChild(nameSpan);

        // Append name container and checkbox to the entry container
        entryContainer.appendChild(nameContainer);
        entryContainer.appendChild(checkbox);

        // Append the entry to the dropdown
        dropdown.appendChild(entryContainer);
    });

    dropdown.classList.remove('d-none'); // Ensure the dropdown is visible
}
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