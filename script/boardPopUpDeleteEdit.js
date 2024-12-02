/**
 * Deletes a task from Firebase, updates the board, and closes the overlay.
 * @param {string} category - The category of the task.
 * @param {string} taskId - The ID of the task to delete.
 */
async function deleteTask(category, taskId) {
    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`, {
            method: "DELETE"
        });

        if (response.ok) {
            console.log(`Task with ID ${taskId} deleted successfully.`);
            delete taskData[category][taskId];
            loadTasks(taskData);
            closeTaskOverlay();
        } else {
            console.error(`Failed to delete task with ID ${taskId}: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error deleting task with ID ${taskId}:`, error);
    }
}


/**
 * Opens the AddTask overlay and fills it with the data of the selected task.
 * @param {string} taskId - The ID of the task to be edited.
 * @param {string} category - The category of the task.
 */
function editTask(taskId, category) {
    let task = taskData[category]?.[taskId];
    if (!task) {
        console.error(`Task with ID ${taskId} in category ${category} not found.`);
        return;
    }

    closeTaskOverlay(); 
    fillFields(task); 
    loadContactsForDropdown(task.contacts || []); 
    setTaskSubtasks(task.subtasks || []); 
    addTaskOnBoard(); 
}

/**
 * Fills the fields of the AddTask overlay with the provided task data.
 * @param {object} task - Task data.
 */
function fillFields(task) {
    let titleField = document.getElementById('inputTitle');
    let descriptionField = document.getElementById('textareaDescription');
    let dueDateField = document.getElementById('dueDate');
    let categoryField = document.getElementById('categorySelect');

    if (titleField) titleField.value = task.title || '';
    if (descriptionField) descriptionField.value = task.description || '';
    if (dueDateField) dueDateField.value = task.dueDate || '';
    if (categoryField) categoryField.value = task.category || '';

    setPrio(task.prio); // Funktion zur Prioritätsauswahl
}


/**
 * Fills the subtasks in the AddTask overlay.
 * @param {Array} subtasks - Subtasks of the task.
 */
function fillSubtasks(subtasks) {
    clearSubtasks();
    subtasks.forEach(subtask => addSubtask(subtask.text, subtask.completed));
}

/**
 * Loads the contacts into the AddTask overlay.
 * @param {Array} contacts - Contacts of the task.
 */
function loadContactsIntoOverlay(contacts) {
    loadContactsForDropdown();
    contacts.forEach(contact => selectContact(contact));
}

function setTaskSubtasks(subtasks) {
    let subtaskContainer = document.getElementById('editSubtasks');
    if (!subtaskContainer) {
        console.error('Subtask container not found');
        return;
    }

    subtaskContainer.innerHTML = ''; // Clear existing subtasks

    subtasks.forEach((subtask, index) => {
        let subtaskHTML = `
            <div class="subtask-item">
                <input type="checkbox" id="subtask-${index}" ${subtask.completed ? 'checked' : ''}>
                <label for="subtask-${index}">${subtask.text}</label>
                <img src="../Assets/addTask/delete-icon.svg" onclick="deleteSubtask(${index})">
            </div>
        `;
        subtaskContainer.insertAdjacentHTML('beforeend', subtaskHTML);
    });
}


function loadContactsForEdit(taskContacts) {
    let contactsDropdown = document.getElementById('assigned-to');
    if (!contactsDropdown) {
        console.error('Contacts dropdown not found');
        return;
    }

    // Clear existing contacts
    contactsDropdown.innerHTML = '';

    // Load all available contacts and mark selected ones
    allContacts.forEach(contact => {
        let isSelected = taskContacts.includes(contact.id);
        let contactOption = `<option value="${contact.id}" ${isSelected ? 'selected' : ''}>${contact.name}</option>`;
        contactsDropdown.insertAdjacentHTML('beforeend', contactOption);
    });
}

/**
 * Saves the edited task to Firebase and updates the board.
 * @param {string} taskId - The ID of the task being edited.
 * @param {string} category - The category of the task being edited.
 */
async function saveEditedTask(taskId, category) {
    let updatedTask = getUpdatedTaskData(); // Retrieve task data from the overlay

    try {
        await saveTaskToFirebase(taskId, category, updatedTask); // Save task to Firebase
        updateLocalTaskData(taskId, category, updatedTask); // Update local taskData
        loadTasks(taskData); // Refresh the board
        closeTaskOnBoard(); // Close the AddTask overlay
    } catch (error) {
        console.error(`Error updating task with ID ${taskId}:`, error);
    }
}

/**
 * Retrieves updated task data from the AddTask overlay fields.
 * @returns {object} - The updated task object.
 */
function getUpdatedTaskData() {
    return {
        title: document.getElementById("taskTitle").value,
        description: document.getElementById("taskDescription").value,
        dueDate: document.getElementById("taskDueDate").value,
        prio: document.getElementById("taskPrio").value,
        contacts: getSelectedContacts(),
        subtasks: getSubtaskInputs()
    };
}

/**
 * Updates the local taskData object with the edited task data.
 * @param {string} taskId - The ID of the task being updated.
 * @param {string} category - The category of the task being updated.
 * @param {object} updatedTask - The updated task data.
 */
function updateLocalTaskData(taskId, category, updatedTask) {
    taskData[category][taskId] = updatedTask;
}
