/**
* Shows the overlay with task details.
* @param {string} category - Task category.
* @param {string} taskId - Task ID.
*/
async function showTaskOverlay(category, taskId) {
    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`);
        let task = await response.json();
        console.log("Fetched Task:", task);
        if (!task) {
            alert("Task not found!");
            return;
        }
 task.id = taskId;
        let overlayHtml = getBoardOverlayTemplate(category, task);
        let overlayDetails = document.getElementById("overlayDetails");
        if (!overlayDetails) {
            console.error("Overlay Details element not found!");
            return;
        }
        overlayDetails.innerHTML = overlayHtml;
        let taskOverlay = document.getElementById("taskOverlay");
        if (!taskOverlay) {
            console.error("Task Overlay element not found!");
            return;
        }
        taskOverlay.classList.remove("dNone");
    } catch (error) {
        console.error("Error loading task:", error);
    }
 }
 /**
 * Closes the task overlay and resets its content.
 * @param {Event} event - Event that triggered the function.
 */
 function closeTaskOverlay(event) {
    let taskOverlay = document.getElementById("taskOverlay");
    if (event && event.target === taskOverlay) {
        taskOverlay.classList.add("dNone");
    } else if (!event || event.target.tagName === "BUTTON") {
        taskOverlay.classList.add("dNone");
    }
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
    selectedPrio = null;
    document.getElementById('urgent').classList.remove('active');
    document.getElementById('medium').classList.remove('active');
    document.getElementById('low').classList.remove('active');
 }
 window.onload = function () {
    let taskOverlay = document.getElementById("taskOverlay");
    taskOverlay.classList.add("dNone");
 };
 /**
 * Gets the initials from a contact name.
 * @param {string} name - Contact name.
 * @returns {string} - Initials.
 */
 function getInitials(name) {
    return name
        .split(' ')
        .map(part => part[0]?.toUpperCase())
        .join('');
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
 * Calculates the progress of subtasks.
 * @param {Array} subtasks - The subtasks array.
 * @returns {number} - Progress percentage.
 */
 function calculateProgress(subtasks) {
    let total = subtasks.length;
    let completed = subtasks.filter(subtask => subtask.completed).length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
 }
 /**
 * Updates the progress bar of a task on the board.
 * @param {string} taskId - The ID of the task.
 * @param {number} progressPercentage - The percentage of completed subtasks.
 */
 function updateProgressBar(taskId, progressPercentage) {
    let progressBar = document.querySelector(`#task-${taskId} .progress-bar-fill`);
    if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.style.backgroundColor = progressPercentage === 0 ? "lightgray" : "blue";
    } else {
        console.warn(`Progress bar for Task ID ${taskId} not found.`);
    }
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