const CREATETASK_URL = 'https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks';


/**
 * Sets the minimum allowed due date to today's date in the due date input field.
 */
function calculateDueDate() {
    let duoDate = new Date();
    let formattedDate = duoDate.toISOString().split('T')[0];
    document.getElementById('dueDate').setAttribute('min', formattedDate);
}


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
 * Resets all task-related fields to their default state.
 * Clears inputs, dropdowns, checkboxes, and hides the category dropdown.
 * 
 * @async
 * @returns {Promise<void>} Resolves when all fields are cleared.
 */
async function clearTasks() {
    document.getElementById('inputTitle').value = "";
    document.getElementById('textareaDescription').value = "";
    document.getElementById('dueDate').value = "";
    document.getElementById('categorySelect').value = "";
    document.getElementById('editSubtasks').value = "";
    document.getElementById('assigned-to').value = "";
    document.getElementById('assignTaskDropdown').value = "";
    document.getElementById('categorySelect').selectedIndex = 0;
    document.getElementById('categoryDropdown').classList.add('d-none');
    document.getElementById('subtaskSelect').value = "";
    contacts.forEach(contact => {
        const checkbox = document.getElementById(`checkbox_${contact.name.replace(/\s+/g, '_')}`);
        if (checkbox) {
            checkbox.checked = false;
        }
    });
    clearPrioButtons();
}


let taskCategory = "";


/**
 * Handles task creation, validates data, and saves it to Firebase.
 * Clears subtasks, finalizes task creation, and navigates to the board.
 * 
 * @async
 * @param {Event} event - The event object from the form submission.
 * @returns {Promise<void>} Resolves when the task is created and board is updated.
 */
async function createTasks(event) {
    event.preventDefault();

    let taskData = collectTaskData();

    let isValid = await validateTaskData(taskData);
    if (!isValid) return;

    document.getElementById('editSubtasks').innerHTML = "";

    await saveTaskToFirebase(taskData);
    await finalizeTaskCreation();
    await changeToBoard();
}


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
 * Collects and returns task data from the form.
 * 
 * @returns {Object} The task data object containing title, description, due date, priority, contacts, subtasks, and category.
 */
function collectTaskData() {
    let subtasks = Array.from(
        document.querySelectorAll('#editSubtasks li')
    ).map(li => ({
        text: li.textContent.trim(),
        completed: false
    }));
    return {
        title: document.getElementById('inputTitle').value.trim(),
        description: document.getElementById('textareaDescription').value.trim(),
        dueDate: document.getElementById('dueDate').value,
        prio: selectedPrio,
        column: "toDo",
        contacts: selectedContacts,
        subtasks: subtasks,
        category: document.getElementById('categorySelect').value
    };
}


/**
 * Validates the task data to ensure all required fields are present.
 * 
 * @async
 * @param {Object} data - The task data to be validated.
 * @returns {Promise<boolean>} `true` if the data is valid, `false` otherwise.
 */
async function validateTaskData(data) {
    if (!data.title || !data.dueDate || !data.contacts || !data.category || !data.prio) {
        console.error("Task validation failed. Missing required fields:", data);
        await popUpRequired();
        await redBorder();
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
 * Prepares task data by ensuring all required fields are properly formatted for saving.
 * 
 * @param {Object} taskData - The task data to be prepared.
 * @param {string} taskData.prio - The priority of the task.
 * @param {Array} [taskData.subtasks] - The subtasks associated with the task.
 * @returns {Object|null} The prepared task data, or `null` if priority is missing.
 */
function prepareTaskDataForFirebase(taskData) {
    if (!taskData.prio) {
        console.error("Priority is missing. Cannot save task.");
        return null;
    }

    if (taskData.subtasks) {
        taskData.subtasks = processSubtasks(taskData.subtasks);
    }

    return taskData;
}


/**
 * Saves the task data to Firebase after preparing it.
 * 
 * @async
 * @param {Object} taskData - The task data to be saved.
 * @returns {Promise<string|null>} The generated task ID or null if an error occurred.
 */
async function saveTaskToFirebase(taskData) {
    try {
        let preparedTaskData = prepareTaskDataForFirebase(taskData);
        if (!preparedTaskData) return null;

        let response = await fetch(`${CREATETASK_URL}/${preparedTaskData.category}.json`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preparedTaskData),
        });

        if (!response.ok) {
            console.error("Failed to save task to Firebase:", response.statusText);
            return null;
        }

        let data = await response.json();
        return data.name; // The generated ID
    } catch (error) {
        console.error("Error saving task to Firebase:", error);
        return null;
    }
}


/**
 * Finalizes the task creation process by triggering UI updates.
 * 
 * @async
 * @returns {Promise<void>} Resolves when the UI updates are completed.
 */
async function finalizeTaskCreation() {
    await redBorder();
    await popUpAddTask();
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
        const checkbox = document.getElementById(`checkbox_${contact.name.replace(/\s+/g, '_')}`);
        if (checkbox) {
            checkbox.checked = false;
        }
    });
    setTimeout(() => {
        document.getElementById("popUpAddTask").style.display = "none";
    }, 1000);
}


/**
 * Highlights invalid or missing required fields and resets borders after a delay.
 * 
 * @async
 * @returns {Promise<void>}
 */
async function redBorder() {
    let inputs = document.querySelectorAll('input:required:invalid');
    let assignedTo = document.getElementById('assigned-to');
    let categorySelect = document.getElementById('categorySelect');

    highlightInvalid(inputs);
    if (!assignedTo.value) highlightElement(assignedTo);
    if (!categorySelect.value) highlightElement(categorySelect);

    setTimeout(() => resetBorders([...inputs, assignedTo, categorySelect]), 2000);
}


/**
 * Highlights invalid form elements by setting a red border.
 * 
 * @param {HTMLElement[]} elements - The elements to highlight.
 */
function highlightInvalid(elements) {
    elements.forEach(el => el.style.border = '2px solid #FF3D00');
}


/**
 * Highlights a single element by setting a red border.
 * 
 * @param {HTMLElement} element - The element to highlight.
 */
function highlightElement(element) {
    element.style.border = '2px solid #FF3D00';
}


/**
 * Resets the border style of the given elements.
 * 
 * @param {HTMLElement[]} elements - The elements whose borders will be reset.
 */
function resetBorders(elements) {
    elements.forEach(el => (el.style.border = ''));
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