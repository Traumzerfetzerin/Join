let CREATETASK_URL = 'https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks';
let taskCategory = "";


/**
 * Sets the category to "Technical Task" and toggles the category dropdown.
 */
function selectTechnicalTask() {
    document.getElementById('categorySelect').value = "Technical Task";
    toggleDropdownCategory();
}


/**
 * Sets the category to "User Story" and toggles the category dropdown.
 */
function selectUserStory() {
    document.getElementById('categorySelect').value = "User Story";
    toggleDropdownCategory();
}


/**
 * Toggles the visibility of the category dropdown and updates the dropdown icons.
 */
function toggleDropdownCategory() {
    let categoryDropdown = document.getElementById('categoryDropdown');
    let dropdownImg = document.getElementById('dropdownCategory');
    let dropdownImg1 = document.getElementById('dropdownCategory1');

    if (categoryDropdown.classList.contains('d-none')) {
        categoryDropdown.classList.remove('d-none');
        dropdownImg.classList.add('d-none');
        dropdownImg1.classList.remove('d-none');
    } else {
        categoryDropdown.classList.add('d-none');
        dropdownImg.classList.remove('d-none');
        dropdownImg1.classList.add('d-none');
    }
}


/**
 * Hides the category dropdown and resets the dropdown icons when clicking outside the input container.
 * @param {Event} event - The click event triggered by the user.
 */
document.addEventListener('click', function (event) {
    let categoryDropdown = document.getElementById('categoryDropdown');
    let categoryInputContainer = document.getElementById('inputCategory');
    let dropdownImg = document.getElementById('dropdownCategory');
    let dropdownImg1 = document.getElementById('dropdownCategory1');

    if (!categoryInputContainer.contains(event.target)) {
        categoryDropdown.classList.add('d-none');
        dropdownImg.classList.remove('d-none');
        dropdownImg1.classList.add('d-none');
    }
});


/**
 * Redirects to the board page after a brief delay.
 * 
 * @async
 * @returns {Promise<void>} Resolves after the delay and redirects to the board.
 */
async function changeToBoard() {
    setTimeout(() => {
        window.location.href = "board.html";
    }, 1000);
}


/**
 * Collects subtasks from the DOM.
 * 
 * @returns {Array<Object>} The array of subtasks with text and completion status.
 */
function collectSubtasks() {
    return Array.from(document.querySelectorAll('#editSubtasks li')).map(li => ({
        text: li.textContent.trim(),
        completed: false
    }));
}


/**
 * Collects selected contact IDs from the dropdown.
 * @returns {Array<string>} The array of selected contact IDs.
 */
function collectContactIDs() {
    let checkboxes = document.querySelectorAll('#assignTaskDropdown input[type="checkbox"]:checked');
    let selectedIDs = Array.from(checkboxes).map(input => input.dataset.id); 
    return selectedIDs;
}


/**
 * Collects task data from the form.
 * @returns {Object} The task data object containing title, description, due date, priority, contacts, subtasks, and category.
 */
function collectTaskData() {
    let data = {
        title: document.getElementById('inputTitle').value.trim(),
        description: document.getElementById('textareaDescription').value.trim(),
        dueDate: document.getElementById('dueDate').value,
        prio: selectedPrio,
        column: "toDo",
        contacts: collectContactIDs(),
        subtasks: collectSubtasks(),
        category: document.getElementById('categorySelect').value
    };
    return data;
}


/**
 * Populates the contact dropdown with fetched contact data.
 * @param {Array<Object>} allContacts - The list of all contacts to populate.
 * @param {Array<string>} selectedContacts - List of pre-selected contact IDs.
 */
function populateContactSection(allContacts, selectedContacts) {
    let contactSection = document.querySelector('#assignTaskDropdown');
    if (!contactSection) {
        console.error("assignTaskDropdown not found in DOM");
        return;
    }

    contactSection.innerHTML = allContacts.map(contact => `
        <label>
            <input type="checkbox" data-id="${contact.id}" ${selectedContacts.includes(contact.id) ? 'checked' : ''} />
            ${contact.name}
        </label>
    `).join('');
}


/**
 * Fetches contact data from Firebase.
 * 
 * @async
 * @returns {Promise<Array<Object>>} The list of all contacts fetched from Firebase.
 */
async function fetchContactsFromFirebase() {
    try {
        let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
        let contactsData = await response.json();

        if (contactsData) {
            return Object.keys(contactsData).map(key => ({ id: key, ...contactsData[key] }));
        } else {
            console.warn("No contacts found in Firebase.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return [];
    }
}


/**
 * Validates the task data to ensure all required fields are present.
 * @param {Object} data - The task data to validate.
 * @returns {boolean} True if validation passes, false otherwise.
 */
async function validateTaskData(data) {
    if (!data.title || !data.contacts.length || !data.dueDate || !data.category || !data.prio) {
        finalizeTaskCreation();
        return false;
    }
    return true;
}


/**
 * Processes an array of subtasks, ensuring each subtask is an object with text and completion status.
 * 
 * @param {(string|Object)[]} subtasks - The list of subtasks to process.
 * @returns {Object[]} The processed subtasks, each containing `text` and `completed` properties.
 */
function processSubtasks(subtasks) {
    return subtasks.map(subtask => {
        if (typeof subtask === 'object' && subtask.text) {
            return subtask;
        }
        return {
            text: subtask.trim(),
            completed: false
        };
    });
}


/**
 * Prepares task data for Firebase by mapping contact IDs.
 * 
 * @param {Object} taskData - The task data to prepare.
 * @returns {Object} The prepared task data for Firebase.
 */
function prepareTaskDataForFirebase(taskData) {
    let preparedData = {
        ...taskData,
        contacts: Array.isArray(taskData.contacts)
            ? taskData.contacts.map(contactId => ({ id: contactId }))
            : []
    };
    return preparedData;
}


/**
 * Finalizes the task creation process by triggering UI updates.
 * 
 * @async
 * @returns {Promise<void>} Resolves when the UI updates are completed.
 */
async function finalizeTaskCreation() {
    await redBorder();
    await popUpRequired();
}


/**
 * Opens the popup for adding a new task, resets form fields, and clears any previously selected contacts.
 * After a brief delay, hides the popup.
 * 
 * @async
 * @function
 */
async function popUpAddTask() {
    document.getElementById('popUpAddTask').classList.remove('d-none');
    document.getElementById('popUpAddTask').innerHTML = popUpAddTaskHTML();
    document.getElementById('inputTitle').value = "";
    document.getElementById('textareaDescription').value = "";
    document.getElementById('dueDate').value = "";
    document.getElementById('categorySelect').value = "";
    document.getElementById('assigned-to').value = "";
    contacts.forEach(contact => {
        let checkbox = document.getElementById(`checkbox_${contact.name.replace(/\s+/g, '_')}`);
        if (checkbox) {
            checkbox.checked = false;
        }
    });
    setTimeout(() => {
        document.getElementById("popUpAddTask").style.display = "none";
    }, 1000);
}


/**
 * Displays a pop-up message indicating that required fields are missing.
 * The pop-up will be shown for 1 second before disappearing.
 * 
 * @async
 */
async function popUpRequired() {
    let popUpElement = document.getElementById('popUpRequired');

    popUpElement.classList.remove('d-none');

    popUpElement.innerHTML = popUpRequiredHTML();

    setTimeout(() => {
        popUpElement.classList.add('d-none');
    }, 1000);
}


/**
 * Shows the "Add Task" popup and sets its content.
 * 
 * @async
 * @returns {Promise<void>} Resolves when the popup is displayed.
 */
async function showPopUpAddTask() {
    document.getElementById('popUpAddTask').classList.remove('d-none');
    document.getElementById('popUpAddTask').innerHTML = popUpAddTaskHTML();
}


/**
 * Resets the task form fields and hides the "Add Task" popup.
 * 
 * @async
 * @returns {Promise<void>} Resolves after resetting the form and hiding the popup.
 */
async function resetTaskForm() {
    document.getElementById('inputTitle').value = "";
    document.getElementById('textareaDescription').value = "";
    document.getElementById('dueDate').value = "";
    document.getElementById('categorySelect').value = "";
    document.getElementById('assigned-to').value = "";

    contacts.forEach(contact => {
        const checkbox = document.getElementById(`checkbox_${contact.name.replace(/\s+/g, '_')}`);
        if (checkbox) {
            checkbox.checked = false;
        }
    });

    setTimeout(() => {
        document.getElementById("popUpAddTask").style.display = "none";
    }, 1000);
}