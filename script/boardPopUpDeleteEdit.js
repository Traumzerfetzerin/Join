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
    loadContacts(task.contacts || []); 
    setTaskSubtasks(task.subtasks || []); 
    addTaskOnBoard(); 
}

/**
 * Fills the fields of the AddTask overlay with the provided task data.
 * @param {object} task - Task data.
 */
function fillFields(task) {
    document.getElementById('taskTitle').value = task.title || '';
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskDueDate').value = task.dueDate || '';
    document.getElementById('taskCategory').value = task.category || '';
    setTaskPriority(task.prio); 
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
 * Saves the updated task to Firebase.
 * @param {string} taskId - The ID of the task being saved.
 * @param {string} category - The category of the task being saved.
 * @param {object} updatedTask - The updated task data.
 */
async function saveTaskToFirebase(taskId, category, updatedTask) {
    let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask)
    });

    if (!response.ok) {
        throw new Error(`Failed to update task with ID ${taskId}: ${response.statusText}`);
    }

    console.log(`Task with ID ${taskId} updated successfully.`);
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
