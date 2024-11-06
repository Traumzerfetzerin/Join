const CREATETASK_URL = 'https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks';


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
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block'; // Show dropdown
    } else {
        dropdown.style.display = 'none'; // Hide dropdown
    }
}

// Close the dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('assignTaskDropdown');
    const inputContainer = document.querySelector('.input-with-icon');

    if (!inputContainer.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});


// Call the function to load contacts when the page loads
window.onload = function () {
    loadContactsForDropdown();
    setMinDueDate(); // Restore the date functionality
};


function calculateDueDate() {
    let duoDate = new Date();
    let formattedDate = duoDate.toISOString().split('T')[0];
    document.getElementById('dueDate').setAttribute('min', formattedDate);
}

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

    let priorityButton = event.currentTarget.id;

    if (priorityButton === "low") {
        lowPrioButton(priorityButton);
    } else if (priorityButton === "medium") {
        mediumPrioButton(priorityButton);
    } else if (priorityButton === "urgent") {
        urgentPrioButton(priorityButton);
    }
}


// PRIO BUTTON LOW
function lowPrioButton(priorityButton) {
    document.getElementById(priorityButton).classList.add('lowWhite');
    document.getElementById(`${priorityButton}Svg`).src = "../Assets/addTask/Prio_baja_white.svg";
    document.getElementById('medium').classList.remove('mediumWhite');
    document.getElementById('urgent').classList.remove('urgentWhite');
    document.getElementById(`mediumSvg`).src = "../Assets/addTask/Prio media.svg";
    document.getElementById(`urgentSvg`).src = "../Assets/addTask/Prio alta.svg";
}


// PRIO BUTTON MEDIUM
function mediumPrioButton(priorityButton) {
    document.getElementById(priorityButton).classList.add('mediumWhite');
    document.getElementById(`${priorityButton}Svg`).src = "../Assets/addTask/Prio media white.svg";
    document.getElementById('low').classList.remove('lowWhite');
    document.getElementById('urgent').classList.remove('urgentWhite');
    document.getElementById(`lowSvg`).src = "../Assets/addTask/Prio baja.svg";
    document.getElementById(`urgentSvg`).src = "../Assets/addTask/Prio alta.svg";
}


// PRIO BUTTON URGENT
function urgentPrioButton(priorityButton) {
    document.getElementById(priorityButton).classList.add('urgentWhite');
    document.getElementById(`${priorityButton}Svg`).src = "../Assets/addTask/Prio_alta_white.svg";
    document.getElementById('low').classList.remove('lowWhite');
    document.getElementById('medium').classList.remove('mediumWhite');
    document.getElementById(`lowSvg`).src = "../Assets/addTask/Prio baja.svg";
    document.getElementById(`mediumSvg`).src = "../Assets/addTask/Prio media.svg";
}

// CATEGORY
function selectTechnicalTask() {
    document.getElementById('categorySelect').value = "Technical Task";
    toggleDropdownCategory();
}


function selectUserStory() {
    document.getElementById('categorySelect').value = "User Story";
    toggleDropdownCategory();
}


function toggleDropdownCategory() {
    let dropdownCategory = document.getElementById('categoryDropdown');
    dropdownCategory.classList.toggle('d-none');
}


// CLEAR BUTTON
async function clearTasks() {
    document.getElementById('inputTitle').value = "";
    document.getElementById('textareaDescription').value = "";
    document.getElementById('dueDate').value = "";
    document.getElementById('categorySelect').value = "";
    document.getElementById('inputSubtasks').value = "";
    document.getElementById('assigned-to').value = "";
    document.getElementById('assignTaskDropdown').value = "";
    document.getElementById('categorySelect').selectedIndex = 0;
    contacts.forEach(contact => {
        document.getElementById(`checkbox_${contact.name.replace(/\s+/g, '_')}`).checked = false;
    });
    clearPrioButtons();
}


// CLEAR PRIO BUTTON
async function clearPrioButtons() {
    document.getElementById('low').classList.remove('lowWhite');
    document.getElementById('medium').classList.remove('mediumWhite');
    document.getElementById('urgent').classList.remove('urgentWhite');
    document.getElementById(`lowSvg`).src = "../Assets/addTask/Prio baja.svg"
    document.getElementById(`mediumSvg`).src = "../Assets/addTask/Prio media white.svg";
    document.getElementById(`urgentSvg`).src = "../Assets/addTask/Prio alta.svg";
    document.getElementById('medium').classList.add('mediumWhite');
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
        await popUpRequired();
        return;
    }

    // Structure the task data
    const taskData = {
        title: title,
        description: description,
        dueDate: dueDate,
        prio: selectedPrio,
        status: "to do",
        contacts: selectedContacts
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

    await popUpAddTask();
    await closeTask();
}


// POP UP REQUIRED FIELDS
async function popUpRequired() {
    let popUpElement = document.getElementById('popUpRequired');

    popUpElement.classList.remove('d-none');

    popUpElement.innerHTML = /*HTML*/`
        <div class="space-evently">
            <p class="center">Please, <br> fill in all required fields.</p>
        </div>`;

    setTimeout(() => {
        popUpElement.classList.add('d-none');
    }, 1000);
}


// POP UP ADD TASK
async function popUpAddTask() {
    document.getElementById('popUpAddTask').classList.remove('d-none');
    document.getElementById('popUpAddTask').innerHTML = /*HTML*/`
    <div class="space-evently flex">
        <p>Task added to board</p>
        <img src="../Assets/addTask/Icons.svg" alt="">
    </div>`;
    document.getElementById('inputTitle').value = "";
    document.getElementById('textareaDescription').value = "";
    document.getElementById('dueDate').value = "";
    document.getElementById('categorySelect').value = "";

    setTimeout(() => {
        document.getElementById("popUpAddTask").style.display = "none";
    }, 1000);
}