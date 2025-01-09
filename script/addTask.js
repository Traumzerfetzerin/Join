const CREATETASK_URL = 'https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks';


/**
 * Updates the minimum allowed value for an input field with ID 'dueDate' to the current date.
 * 
 * This function calculates the current date, formats it as a string in 'YYYY-MM-DD' format,
 * and sets it as the 'min' attribute of the input element with the ID 'dueDate'.
 */
function calculateDueDate() {
    let duoDate = new Date();
    let formattedDate = duoDate.toISOString().split('T')[0];
    document.getElementById('dueDate').setAttribute('min', formattedDate);
}


/**
 * Selects the "Technical Task" category in a dropdown menu and toggles the category dropdown.
 * 
 * This function sets the value of the dropdown element with the ID 'categorySelect' to "Technical Task"
 * and then calls the `toggleDropdownCategory` function to update the dropdown's visibility or state.
 */
function selectTechnicalTask() {
    document.getElementById('categorySelect').value = "Technical Task";
    toggleDropdownCategory();
}


/**
 * Selects the "User Story" category in a dropdown menu and toggles the category dropdown.
 * 
 * This function sets the value of the dropdown element with the ID 'categorySelect' to "User Story"
 * and then calls the `toggleDropdownCategory` function to update the dropdown's visibility or state.
 */
function selectUserStory() {
    document.getElementById('categorySelect').value = "User Story";
    toggleDropdownCategory();
}


/**
 * Toggles the visibility of the category dropdown and updates the state of dropdown icons.
 * 
 * This function checks if the element with the ID 'categoryDropdown' has the 'd-none' class,
 * which indicates it is hidden. If hidden, the function removes the 'd-none' class to display it
 * and updates the icons by toggling the 'd-none' class on elements with IDs 'dropdownCategory' 
 * and 'dropdownCategory1'. If the dropdown is visible, the function reverses these actions.
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
 * Adds a click event listener to the document to hide the category dropdown when clicking outside its container.
 * 
 * This event listener checks if the click event target is outside the element with the ID 'inputCategory'.
 * If so, it hides the dropdown menu by adding the 'd-none' class to the element with the ID 'categoryDropdown'.
 * Additionally, it resets the dropdown icons by toggling the 'd-none' class on the elements with IDs
 * 'dropdownCategory' and 'dropdownCategory1'.
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
 * Clears all task-related input fields and resets dropdowns, subtasks, and assigned contacts.
 * 
 * This asynchronous function performs the following actions:
 * - Clears the values of input fields for title, description, due date, category, subtasks, and assigned tasks.
 * - Resets the category dropdown to its default state and hides it.
 * - Unchecks all contact checkboxes associated with the task.
 * - Calls `clearPrioButtons` to reset priority button states.
 * 
 * It also ensures that the `contacts` array is iterated over to uncheck dynamically generated contact checkboxes.
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
 * Creates a new task and sends it to Firebase.
 * @param {Event} event - Prevents default form submission.
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
 * Redirects the user to the "board.html" page after a 1-second delay.
 * 
 * This asynchronous function uses `setTimeout` to wait for 1 second (1000 milliseconds) 
 * before changing the `window.location.href` to "board.html", effectively navigating 
 * the user to the board page.
 */
async function changeToBoard() {
    setTimeout(() => {
        window.location.href = "board.html";
    }, 1000);
}


/**
 * Collects data from the form and returns it as an object.
 * @returns {Object} - Task data.
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
 * Validates the task data.
 * @param {Object} data - The task data to validate.
 * @returns {boolean} - Returns true if valid, otherwise false.
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
 * Sends the task data to Firebase.
 * @param {Object} taskData - The task data to save.
 * @returns {Promise<string|undefined>} - Returns the generated task ID or undefined on failure.
 */
async function saveTaskToFirebase(taskData) {
    try {
        if (!taskData.prio) {
            console.error("Priority is missing. Cannot save task.");
            return;
        }

        if (taskData.subtasks) {
            taskData.subtasks = taskData.subtasks.map(subtask => {
                if (typeof subtask === 'object' && subtask.text) {
                    return subtask;
                }
                return {
                    text: subtask.trim(),
                    completed: false      
                };
            });
        }

        let response = await fetch(`${CREATETASK_URL}/${taskData.category}.json`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
        });

        if (!response.ok) {
            console.error("Failed to save task to Firebase:", response.statusText);
            return;
        }

        let data = await response.json();
        return data.name; // The generated ID
    } catch (error) {
        console.error("Error saving task to Firebase:", error);
    }
}


/**
 * Finalizes the task creation process by applying visual feedback and displaying a confirmation popup.
 * 
 * This asynchronous function performs the following steps:
 * 1. Calls `redBorder()` to apply visual feedback (e.g., highlighting invalid inputs or required fields).
 * 2. Calls `popUpAddTask()` to display a confirmation popup indicating the task was successfully added.
 * 
 * Both functions are awaited to ensure sequential execution and proper timing of the task creation flow.
 */
async function finalizeTaskCreation() {
    await redBorder();
    await popUpAddTask();
}


/**
 * Highlights invalid inputs and resets their border after 2 seconds.
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
 * Adds a red border to invalid elements.
 * @param {NodeList} elements - List of elements to highlight.
 */
function highlightInvalid(elements) {
    elements.forEach(el => el.style.border = '2px solid #FF3D00');
}


/**
 * Highlights a specific element.
 * @param {HTMLElement} element - Element to highlight.
 */
function highlightElement(element) {
    element.style.border = '2px solid #FF3D00';
}


/**
 * Resets the border for given elements.
 * @param {HTMLElement[]} elements - Elements to reset.
 */
function resetBorders(elements) {
    elements.forEach(el => (el.style.border = ''));
}


/**
 * Displays a temporary "required fields" popup to notify the user of missing inputs.
 * 
 * This asynchronous function performs the following steps:
 * 1. Retrieves the popup element with the ID 'popUpRequired'.
 * 2. Removes the 'd-none' class to make the popup visible.
 * 3. Sets the popup's inner HTML using the `popUpRequiredHTML()` function.
 * 4. Uses `setTimeout` to reapply the 'd-none' class after 1 second, hiding the popup.
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
 * Displays a popup confirming the addition of a task and resets the task input fields.
 * 
 * This asynchronous function performs the following actions:
 * 1. Makes the popup element with the ID 'popUpAddTask' visible by removing the 'd-none' class.
 * 2. Sets the inner HTML of the popup using the `popUpAddTaskHTML()` function.
 * 3. Clears the values of task input fields: title, description, due date, category, and assigned user.
 * 4. Unchecks all contact checkboxes associated with the task.
 * 5. Uses `setTimeout` to hide the popup after 1 second by setting its `display` style to "none".
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
