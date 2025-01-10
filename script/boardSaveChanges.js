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
 * Collects priority from the overlay.
 * @returns {string} - Priority value (e.g., "urgent", "medium", "low").
 */
function collectPriority() {
    let activePriorityButton = document.querySelector('.prio-button.active'); 
    return activePriorityButton ? activePriorityButton.getAttribute('data-prio') : "low";
}


/**
 * Collects subtasks from the overlay.
 * @returns {Array<Object>} - List of subtasks with text and completion status.
 */
function collectSubtasks() {
    return Array.from(document.querySelectorAll('.subtasks-section .subtask-item')).map(subtask => ({
        text: subtask.querySelector('.editSubtaskText')?.textContent.trim() || "",
        completed: subtask.querySelector('.subtask-checkbox')?.checked || false
    }));
}


/**
 * Collects contacts from the overlay.
 * @returns {Array<string>} - List of selected contact names.
 */
function collectContacts() {
    return Array.from(document.querySelectorAll('.contacts-section input[type="checkbox"]:checked')).map(input => {
        let contactElement = input.closest('.contact-item'); // Geht von Checkbox zur Kontakt-Info
        return contactElement?.querySelector('.contact-name')?.textContent.trim() || "";
    });
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
    let data = {
        ...basicInfo,
        prio: collectPriority(),
        subtasks: collectSubtasks(), 
        contacts: collectContacts() 
    };
    console.log("Collected Data:", data);
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

    try {
        await updateTaskInDatabase(category, taskId, updatedTask);
        console.log("Task successfully updated:", updatedTask);
        closeTaskOverlay();
        location.reload();
    } catch (error) {
        console.error("Error saving task:", error);
        alert("Failed to save the changes. Please try again.");
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
            method: "PUT",
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