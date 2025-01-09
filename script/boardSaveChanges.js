/**
 * Collects the title, description, and due date from the overlay.
 * @returns {Object} - Contains title, description, and dueDate.
 */
function collectBasicInfo() {
    let titleElement = document.querySelector('.overlay-content .task-title');
    let descriptionElement = document.querySelector('.overlay-content .task-description'); 
    let dueDateElement = document.querySelector('.overlay-content input[type="date"]'); 

    return {
        title: titleElement && titleElement.value ? titleElement.value.trim() : "",
        description: descriptionElement && descriptionElement.value ? descriptionElement.value.trim() : "",
        dueDate: dueDateElement && dueDateElement.value ? dueDateElement.value.trim() : "",
    };
}


/**
 * Collects priority from the overlay.
 * @returns {string} - Priority value (e.g., "low").
 */
function collectPriority() {
    let priorityElement = document.querySelector('.overlay-content .prio-button.active');
    return priorityElement ? priorityElement.getAttribute("data-priority") : "low";
}

/**
 * Collects subtasks from the overlay.
 * @returns {Array<Object>} - List of subtasks with text and completion status.
 */
function collectSubtasks() {
    return Array.from(
        document.querySelectorAll('.subtasks-section .subtasks-list li')
    ).map(li => ({
        text: li.querySelector('.subtask-text').value.trim(), 
        completed: li.querySelector('.subtask-checkbox').checked, 
    }));
}

/**
 * Collects contacts from the overlay.
 * @returns {Array<string>} - List of selected contact names.
 */
function collectContacts() {
    return Array.from(
        document.querySelectorAll('.contacts-section .contact-list input[type="checkbox"]:checked')
    ).map(input => input.closest('.contact').querySelector('.contact-name').textContent.trim());
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
        contacts: collectContacts(),
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
 * Saves the edited task data to Firebase and reloads the page.
 * @param {string} taskId - ID of the task being edited.
 * @param {string} category - Category of the task.
 */
async function saveChanges(taskId, category) {
    let updatedTask = collectOverlayData();
    updatedTask.id = taskId;
    updatedTask.category = category;

    try {
        await updateTaskInDatabase(category, taskId, updatedTask);
        console.log("Task successfully updated.");
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