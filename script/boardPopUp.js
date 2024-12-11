/**
 * Shows the overlay with task details.
 * @param {string} category - Task category.
 * @param {string} taskId - Task ID.
 */
async function showTaskOverlay(category, taskId) {
    console.log("showTaskOverlay called with:", category, taskId);
    let task = findTaskInData(taskId);
    if (!task) return Promise.resolve(null); 
    updateOverlayContent(category, task);
    showOverlay();
    return Promise.resolve("Overlay displayed successfully");
}


/**
 * Opens the task overlay.
 */
function showOverlay() {
    let taskOverlay = document.getElementById("taskOverlay");
    if (!taskOverlay) return;

    taskOverlay.classList.remove("dNone");
    taskOverlay.style.display = "block";
}


/**
 * Closes the task overlay.
 * @param {Event} event - The event triggering the close action.
 */
function closeTaskOverlay(event) {
    let taskOverlay = document.getElementById("taskOverlay");
    if (!taskOverlay) return;

    if (event && event.target !== taskOverlay && event.target.tagName !== "BUTTON") {
        return;
    }

    taskOverlay.classList.add("dNone");
    taskOverlay.style.display = "none";
}



/**
 * Updates the overlay content with task details.
 * @param {string} category - Task category.
 * @param {Object} task - The task object.
 */
function updateOverlayContent(category, task) {
    let overlayHtml = getBoardOverlayTemplate(category, task);
    let overlayDetails = document.getElementById("overlayDetails");
    if (overlayDetails) overlayDetails.innerHTML = overlayHtml;
}

/**
 * Hides the task overlay if the event matches the conditions.
 * @param {Event} event - Event that triggered the function.
 */
function hideOverlay(event) {
    let taskOverlay = document.getElementById("taskOverlay");
    if (!taskOverlay) return;
    if (event && event.target === taskOverlay) {
        taskOverlay.classList.add("dNone");
    } else if (!event || event.target.tagName === "BUTTON") {
        taskOverlay.classList.add("dNone");
    }
}

/**
 * Resets the values of the form fields in the overlay.
 */
function resetFormFields() {
    let titleField = document.getElementById('inputTitle');
    let descriptionField = document.getElementById('textareaDescription');
    let dueDateField = document.getElementById('dueDate');
    let categoryField = document.getElementById('categorySelect');
    let subtaskContainer = document.getElementById('editSubtasks');
    let contactsDropdown = document.getElementById('assigned-to');

    if (titleField) titleField.value = '';
    if (descriptionField) descriptionField.value = '';
    if (dueDateField) dueDateField.value = '';
    if (categoryField) categoryField.value = '';
    if (subtaskContainer) subtaskContainer.innerHTML = '';
    if (contactsDropdown) contactsDropdown.innerHTML = '';
}

/**
 * Resets the priority selection in the overlay.
 */
function resetPriority() {
    selectedPrio = null;
    document.getElementById('urgent').classList.remove('active');
    document.getElementById('medium').classList.remove('active');
    document.getElementById('low').classList.remove('active');
}

/**
 * Closes the task overlay and resets its content.
 * @param {Event} event - Event that triggered the function.
 */
function closeOverlay(event) {
    hideOverlay(event);
    resetFormFields();
    resetPriority();
}


window.onload = function () {
    let taskOverlay = document.getElementById("taskOverlay");
    taskOverlay.classList.add("dNone");
};

async function fetchContactFromFirebase(contactId) {
    try {
        let encodedContactId = encodeURIComponent(contactId);
        let response = await fetch(`https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts/${encodedContactId}.json`);
        if (response.ok) {
            let contact = await response.json();
            return contact || { name: "Unknown" };
        } else {
            console.error(`Error fetching contact with ID ${encodedContactId}: ${response.statusText}`);
            return { name: "Unknown" };
        }
    } catch (error) {
        console.error("Error fetching contact:", error);
        return { name: "Unknown" };
    }
}

/**
 * Generates a random RGB color.
 * @returns {string} - RGB color string.
 */
function getRandomColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Toggles the completion status of a subtask and updates the progress bar.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask in the subtasks array.
 */
function toggleSubtaskCompletion(taskId, subtaskIndex) {
    let task = findTaskInData(taskId);
    if (!task) {
        console.error(`Task with ID ${taskId} not found.`);
        return;
    }
    let subtasks = task.subtasks || [];
    subtasks[subtaskIndex].completed = !subtasks[subtaskIndex].completed;
    let progressPercentage = calculateProgressPercentage(subtasks);
    updateProgressBar(taskId, progressPercentage);
    updateSubtasksInFirebase(taskId, subtasks, task.category);

    let completed = subtasks.filter(st => st.completed).length;
    let total = subtasks.length;
    let subtaskCounter = document.querySelector(`#task-${taskId} .progress-bar-container span`);
    if (subtaskCounter) {
        subtaskCounter.textContent = `${completed}/${total} Subtasks`;
    }
}

/**
 * Calculates the progress percentage for subtasks.
 * @param {Array} subtasks - Array of subtasks.
 * @returns {number} - Progress percentage.
 */
function calculateProgressPercentage(subtasks) {
    let completed = subtasks.filter(subtask => subtask.completed).length;
    return subtasks.length === 0 ? 0 : Math.round((completed / subtasks.length) * 100);
}

/**
 * Updates the state of a subtask and triggers UI updates.
 * @param {object} task - The task object.
 * @param {number} subtaskIndex - The index of the subtask.
 */
function updateSubtaskState(task, subtaskIndex) {
    let subtasks = task.subtasks || [];
    if (!subtasks[subtaskIndex]) {
        console.error(`Subtask with index ${subtaskIndex} not found.`);
        return;
    }
    subtasks[subtaskIndex].completed = !subtasks[subtaskIndex].completed;
    updateSubtaskProgress(task.id, subtasks, task.category);
}

/**
 * Updates progress bar and syncs with Firebase.
 * @param {string} taskId - The ID of the task.
 * @param {Array} subtasks - The list of subtasks.
 * @param {string} category - The category of the task.
 */
function updateSubtaskProgress(taskId, subtasks, category) {
    let progress = calculateProgress(subtasks);
    updateProgressBar(taskId, progress);
    syncSubtasksWithFirebase(taskId, subtasks, category);
}

/**
 * Syncs subtasks with Firebase.
 * @param {string} taskId - The ID of the task.
 * @param {Array} subtasks - The updated subtasks array.
 * @param {string} category - The task category.
 */
async function syncSubtasksWithFirebase(taskId, subtasks, category) {
    try {
        console.log(`Syncing subtasks for Task ID ${taskId} in category ${category}:`, subtasks);
        let response = await fetch(`${TASK_URL}/${category}/${taskId}/subtasks.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subtasks)
        });
        if (!response.ok) {
            console.error(`Failed to sync subtasks: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error syncing subtasks for Task ID ${taskId}:`, error);
    }
}

/**
 * Updates the subtasks for a specific task in Firebase.
 * @param {string} taskId - ID of the task to update.
 * @param {Array} subtasks - Array of updated subtasks.
 * @param {string} category - Category of the task (e.g., "Technical Task").
 */
async function updateSubtasksInFirebase(taskId, subtasks, category) {
    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}/subtasks.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subtasks)
        });
        if (response.ok) {
            // Optional: Additional actions upon successful update
        } else {
            console.error(`Failed to update subtasks for Task ID ${taskId}:`, response.statusText);
        }
    } catch (error) {
        console.error(`Error updating subtasks for Task ID ${taskId}:`, error);
    }
}
