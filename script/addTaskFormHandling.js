/**
 * Sets the minimum allowed due date to today's date in the due date input field.
 */
function calculateDueDate() {
    let duoDate = new Date();
    let formattedDate = duoDate.toISOString().split('T')[0];
    document.getElementById('dueDate').setAttribute('min', formattedDate);
}


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
    document.getElementById('selectedContactsContainer').innerHTML = "";
    contacts.forEach(contact => {
        let checkbox = document.getElementById(`checkbox_${contact.name.replace(/\s+/g, '_')}`);
        if (checkbox) {
            checkbox.checked = false;
        }
    });
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
 * Handles the creation of a new task, including validation, saving to Firebase, 
 * and populating contacts if required.
 * 
 * @async
 * @param {Event} event - The event object from the form submission.
 * @returns {Promise<void>} Resolves when the task creation process is complete.
 */
async function createTasks(event) {
    event.preventDefault();

    let taskData = collectTaskData();

    let form = document.querySelector('form');
    if (!form.checkValidity()) {
        await redBorder();
        await popUpRequired();
        return;
    }

    try {
        let selectedContacts = taskData.contacts || [];
        await fetchAndPopulateContacts(selectedContacts);
    } catch (error) {
        console.error("Error fetching and populating contacts:", error);
        alert("Failed to load contacts. Please try again.");
        return;
    }

    let isValid = await validateTaskData(taskData);
    if (!isValid) return;

    let taskId = await saveTaskToFirebase(taskData);
    if (!taskId) {
        alert("Failed to save the task. Please try again.");
        return;
    }

    await popUpAddTask();
    await changeToBoard();
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