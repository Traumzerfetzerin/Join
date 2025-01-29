/**
 * Collects the title, description, and due date from the overlay.
 * @returns {Object} - Contains title, description, and dueDate.
 */
function collectBasicInfo() {
    let titleElement = document.querySelector('#edit-task-title');
    let descriptionElement = document.querySelector('#edit-task-description');
    let dueDateElement = document.querySelector('#edit-task-due-date');

    return {
        title: titleElement && titleElement.value ? titleElement.value.trim() : "",
        description: descriptionElement && descriptionElement.value ? descriptionElement.value.trim() : "",
        dueDate: dueDateElement && dueDateElement.value ? dueDateElement.value.trim() : "",
    };
}


/**
 * Collects the currently selected priority.
 * @returns {string} - The priority level (e.g., "low", "medium", "urgent").
 */
function collectPriority() {
    return selectedPrio || "low"; 
}


/**
 * Collects subtasks from the overlay.
 * @returns {Array<Object>} - List of subtasks with text and completion status.
 */
function collectBoardSubtasks() {
    return Array.from(document.querySelectorAll('.subtasks-section .subtask-item')).map(subtask => ({
        text: subtask.querySelector('.editSubtaskText')?.textContent.trim() || "",
        completed: subtask.querySelector('.subtask-checkbox')?.checked || false
    }));
}


/**
 * Collects selected contact names from the overlay.
 * @returns {Array<string>} - List of selected contact names.
 */
function collectContacts() {
    return Array.from(document.querySelectorAll('.contacts-section input[type="checkbox"]:checked'))
        .map(input => input.value.trim());
}


/**
 * Handles the save action from the Edit Overlay using collected data.
 * @param {string} taskId - The ID of the task being edited.
 * @param {string} category - The category of the task being edited.
 */
async function handleEditOverlaySave(taskId, category) {
    let updatedTask = collectOverlayData();
    updatedTask.id = taskId;
    updatedTask.category = category;

    await updateTaskInDatabase(category, taskId, updatedTask);
    closeTaskOverlay();
}


/**
 * Combines all collected data into a single task object.
 * @returns {Object} - Task data including all properties.
 */
function collectOverlayData() {
    let basicInfo = collectBasicInfo();
    let currentColumn = document.querySelector('.column .task-item.selected')?.closest('.column').id || 'toDoColumn';
    let data = {
        ...basicInfo,
        prio: collectPriority(),
        subtasks: collectBoardSubtasks(),
        contacts: collectContacts(),
        column: currentColumn.replace('Column', '') 
    };
    return data;
}


/**
 * Validates the task data to ensure required fields are present.
 * @param {Object} task - Task data object.
 * @returns {boolean} - True if valid, otherwise false.
 */
function validateTaskData(task) {
    return task.title && task.description && task.dueDate;
}


/**
 * Handles the save action for the edited task.
 * @param {string} taskId - The ID of the task being edited.
 * @param {string} category - The category of the task being edited.
 */
async function saveChanges(taskId, category) {
    let updatedTask = collectOverlayData();
    updatedTask.id = taskId;
    updatedTask.category = category;
    updatedTask.prio = collectPriority();
    updatedTask.contacts = collectContacts();
    updatedTask.column = updatedTask.column || 'toDo';
    try {
        await updateTaskInDatabase(category, taskId, updatedTask);
        closeTaskOverlay();
        location.reload();
    } catch (error) {
        console.error("Error saving task:", error);
    }
}


/**
 * Updates task data in Firebase.
 * @param {string} taskId - ID of the task being edited.
 * @param {string} category - Category of the task.
 * @param {Object} taskData - Task data to save.
 */
async function updateTaskInFirebase(taskId, category, taskData) {
    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData),
        });

        if (response.ok) {
            alert("Task changes saved successfully.");
        } else {
            alert("Failed to save changes. Please try again.");
        }
    } catch (error) {
        console.error("Error saving task changes:", error);
        alert("An error occurred while saving changes.");
    }
}