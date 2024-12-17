/**
 * Shows the overlay with task details.
 * @param {string} category - Task category.
 * @param {string} taskId - Task ID.
 */
async function showTaskOverlay(category, taskId) {
    let task = findTaskInData(taskId);
    if (!task) return Promise.resolve(null); 
    updateOverlayContent(category, task);
    showOverlay();
    return Promise.resolve("Overlay displayed successfully");
}


/**
 * Opens the task overlay and the background overlay, disabling interactions with the background.
 */
function showOverlay() {
    let taskOverlay = document.getElementById("taskOverlay");
    let backgroundOverlay = document.getElementById("backgroundOverlay");
    if (!taskOverlay || !backgroundOverlay) return;

    taskOverlay.classList.remove("dNone");
    taskOverlay.style.display = "block";

    backgroundOverlay.classList.add("active");
    document.body.classList.add("no-scroll");
}

/**
 * Closes the task overlay when the background or close button is clicked.
 * @param {Event} [event] - The event that triggers the overlay close.
 */
function closeTaskOverlay(event) {
    let taskOverlay = document.getElementById("taskOverlay");
    let backgroundOverlay = document.getElementById("backgroundOverlay");
    if (!taskOverlay || !backgroundOverlay) return;

    if (!event || event.target === backgroundOverlay || event.target === taskOverlay || event.target.tagName === "BUTTON") {
        taskOverlay.classList.add("dNone");
        taskOverlay.style.display = "none";
        backgroundOverlay.classList.remove("active");
        document.body.classList.remove("no-scroll");
    }
}

/**
 * Updates the overlay content with the latest task data.
 * @param {string} category - The category of the task.
 * @param {Object} task - The updated task data.
 * @returns {Promise<void>}
 */
async function updateOverlayContent(category, task) {
    let overlayHtml = getBoardOverlayTemplate(category, task);
    let overlayDetails = document.getElementById('overlayDetails');
    if (overlayDetails) {
        overlayDetails.innerHTML = overlayHtml;
    }

    let contactIconsContainer = document.getElementById('contact-icons-container');
    if (contactIconsContainer && task.contacts) {
        await syncContactIcons(task.contacts);
    }
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

/**
 * Fetches contact data from Firebase.
 * @param {string} contactId - The ID of the contact.
 * @returns {Promise<Object>} - The contact data.
 */
async function fetchContactFromFirebase(contactId) {
    try {
        let encodedContactId = encodeURIComponent(contactId);
        let response = await fetch(`https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts/${encodedContactId}.json`);
        if (response.ok) {
            let contact = await response.json();
            return contact || { name: "Unknown" };
        } else {
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
 * Toggles the completion status of a subtask and updates the UI and database.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask in the subtasks array.
 */
async function toggleSubtaskCompletion(taskId, subtaskIndex) {
    let task = findTaskInData(taskId);
    if (!task || !task.subtasks) return;

    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;

    try {
        await fetch(`${TASK_URL}/${task.category}/${taskId}/subtasks.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task.subtasks),
        });

        let completed = task.subtasks.filter(st => st.completed).length;
        let total = task.subtasks.length;
        let progressPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        let progressBarFill = document.querySelector(`#task-${taskId} .progress-bar-fill`);
        if (progressBarFill) {
            progressBarFill.style.width = `${progressPercentage}%`;
            progressBarFill.style.backgroundColor = progressPercentage === 0 ? "lightgray" : "blue";
        }

        let subtaskCounter = document.querySelector(`#task-${taskId} .progress-bar-container span`);
        if (subtaskCounter) {
            subtaskCounter.textContent = `${completed}/${total} Subtasks`;
        }

        if (document.getElementById('taskOverlay').style.display === 'block') {
            let overlayDetails = document.getElementById('overlayDetails');
            if (overlayDetails) {
                overlayDetails.innerHTML = getBoardOverlayTemplate(task.category, task);
            }
        }
    } catch (error) {
        console.error(`Failed to save updated subtasks for Task ID ${taskId}:`, error);
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
