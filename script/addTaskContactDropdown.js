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
    if (!dropdown) {
        // console.error("Dropdown element with ID 'assignTaskDropdown' not found!");
        return; // Abbrechen, wenn das Dropdown nicht existiert
    }
    // Bestehende Optionen im Dropdown löschen
    dropdown.innerHTML = '';
    contacts.forEach(contact => {
        // Erstelle einen Container für den Eintrag
        const entryContainer = document.createElement('div');
        entryContainer.classList.add('entry-container'); // Für Styling
        // Initialen aus dem Namen generieren
        const initials = contact.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
        // Erstellt ein <span>-Element für die Initialen
        const initialsSpan = document.createElement('span');
        initialsSpan.classList.add('contact-initials');
        initialsSpan.textContent = initials;
        // Hintergrundfarbe anwenden (falls vorhanden oder generieren)
        if (contact.color) {
            initialsSpan.style.backgroundColor = contact.color;
        } else {
            const randomColor = getRandomColor();
            initialsSpan.style.backgroundColor = randomColor;
            contact.color = randomColor; // Speichert die generierte Farbe zurück
        }
        // Erstellt ein <span>-Element für den Namen
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('contact-name');
        nameSpan.textContent = contact.name;
        // Erstellt das Checkbox-Element
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
 checkbox.id = `checkbox_${contact.name.replace(/\s+/g, '_')}`;
        checkbox.value = contact.name;
        checkbox.addEventListener('change', updateAssignedContacts);
        // Verpacke Initialen und Namen
        const nameContainer = document.createElement('div');
        nameContainer.classList.add('name-container');
        nameContainer.appendChild(initialsSpan);
        nameContainer.appendChild(nameSpan);
        // Füge den Namen und die Checkbox dem Container hinzu
        entryContainer.appendChild(nameContainer);
        entryContainer.appendChild(checkbox);
        // Füge den Eintrag dem Dropdown hinzu
        dropdown.appendChild(entryContainer);
    });
    dropdown.classList.remove('d-none'); // Macht das Dropdown sichtbar
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