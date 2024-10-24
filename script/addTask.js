const CREATETASK_URL = 'https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks';


let selectedPrio = null;

/**
 * Sets the selected priority and highlights the selected button.
 * 
 * @param {string} prio - The priority to be set (e.g., 'Urgent', 'Medium', 'Low').
 * @param {Event} event - The event to prevent default behavior.
 */
function setPrio(prio, event) {
    // Prevent default action (in case it's triggering form submission or reset)
    event.preventDefault();

    // Set the selected priority
    selectedPrio = prio;

    // Remove 'active' class from all buttons
    const prioButtons = document.querySelectorAll('.prioButton');
    prioButtons.forEach(button => button.classList.remove('active'));

    // Add 'active' class to the clicked button
    event.target.classList.add('active');

    let priorityButton = event.target.id;
    if (event.target.id == "low") {
        document.getElementById(priorityButton).classList.add('lowWhite');
        document.getElementById(`${priorityButton}Svg`).src = "../Assets/addTask/Prio_baja_white.svg";

    } if (event.target.id == "medium") {
        document.getElementById(priorityButton).classList.add('mediumWhite');
        document.getElementById(`${priorityButton}Svg`).src = "../Assets/addTask/Prio media white.svg";

    } if (event.target.id == "urgent") {
        document.getElementById(priorityButton).classList.add('urgentWhite');
        document.getElementById(`${priorityButton}Svg`).src = "../Assets/addTask/Prio_alta_white.svg";
    }
}


let taskCategory = ""; // Variable zum Speichern der ausgewählten kategorie

/**
 * Creates a new task and sends the task data to Firebase.
 * 
 * The function collects data from the form (title, description, due date, category, and priority),
 * validates that the required fields are filled, and posts the task data to the Firebase database
 * under the selected category.
 * 
 * @param {Event} event - The click event to prevent the default form submission.
 */
async function createTasks(event) {
    // Prevent the form from reloading the page
    event.preventDefault();

    // Collect task data
    let title = document.getElementById('inputTitle').value;
    let description = document.getElementById('textareaDescription').value;
    let dueDate = document.getElementById('dueDate').value;
    let category = document.getElementById('categorySelect').value;

    // Validate that all required fields are filled
    if (!title || !dueDate || !selectedPrio || category === '0') {
        alert('Please fill in all required fields.');
        return;
    }

    // Structure the task data
    const taskData = {
        title: title,
        description: description,
        dueDate: dueDate,
        prio: selectedPrio
    };

    // Send the task data to Firebase using the selected category as the key
    try {
        let response = await fetch(CREATETASK_URL + '/' + category + '.json', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        // Check if the task was successfully created
        if (response.ok) {
            let responseToJson = await response.json();
            console.log('Task successfully created:', responseToJson);
            showToast('Task successfully created under the category: ' + category);
        } else {
            console.error('Error creating task:', response.statusText);
        }
    } catch (error) {
        console.error('Error saving to Firebase:', error);
    }
}


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
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block'; // Show dropdown
    } else {
        dropdown.style.display = 'none'; // Hide dropdown
    }
}

// Close the dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('assignTaskDropdown');
    const inputContainer = document.querySelector('.input-with-icon');

    if (!inputContainer.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

// Call the function to load contacts when the page loads
window.onload = function() {
    loadContactsForDropdown();
    setMinDueDate(); // Restore the date functionality
};