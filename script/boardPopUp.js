/**
 * Shows the overlay with task details.
 * @param {string} category - Task category.
 * @param {string} taskId - Task ID.
 */
async function showTaskOverlay(category, taskId) {
    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`);
        let task = await response.json();

        if (!task) {
            alert("Task not found!");
            return;
        }

        // Stellen Sie sicher, dass die ID der Aufgabe vorhanden ist
        task.id = taskId;

        let overlayHtml = getBoardOverlayTemplate(category, task);
        let overlayDetails = document.getElementById("overlayDetails");
        overlayDetails.innerHTML = overlayHtml;

        let taskOverlay = document.getElementById("taskOverlay");
        taskOverlay.classList.remove("dNone");
    } catch (error) {
        console.error("Fehler beim Laden der Aufgabe:", error);
    }
}


/**
 * Closes the task overlay.
 * @param {Event} event - Event that triggered the function.
 */
function closeTaskOverlay(event) {
    let taskOverlay = document.getElementById("taskOverlay");

    if (event && event.target === taskOverlay) {
        taskOverlay.classList.add("dNone");
    } else if (!event || event.target.tagName === "BUTTON") {
        taskOverlay.classList.add("dNone");
    }
}



window.onload = function () {
    let taskOverlay = document.getElementById("taskOverlay");
    taskOverlay.classList.add("dNone");
};


function addTaskToColumn(task, category, taskId, columns) {

    task.id = taskId;

    let contactList = task.contacts
        ? task.contacts.map(contact => {
              const initials = getInitials(contact); 
              const bgColor = getRandomColor(); 
              return `<span class="contact-initial" style="background-color: ${bgColor};">${initials}</span>`;
          }).join('') 
        : '';

    let subtaskCount = task.subtasks ? task.subtasks.length : 0;
    let taskClass = getTaskClass(task.title);

    let taskHtml = getTaskBoardTemplate(category, task, taskId, contactList, taskClass, subtaskCount);

    let columnId = task.column ? task.column : "toDo";
    let columnElement = document.getElementById(columns[columnId]);
    columnElement.innerHTML += `<div id="task-${taskId}">${taskHtml}</div>`;
}


function getInitials(name) {
    return name
        .split(' ')
        .map(part => part[0]?.toUpperCase()) // Take the first letter of each part
        .join('');
}
function getRandomColor() {
    // Generate a random RGB color
    const r = Math.floor(Math.random() * 256); // Red: 0-255
    const g = Math.floor(Math.random() * 256); // Green: 0-255
    const b = Math.floor(Math.random() * 256); // Blue: 0-255

    return `rgb(${r}, ${g}, ${b})`; // Return the RGB color string
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
 * Toggles the completion status of a subtask and updates the Progressbar.
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
        let response = await fetch(`${TASK_URL}/${category}/${taskId}/subtasks.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subtasks)
        });
        if (!response.ok) {
            console.error(`Failed to update subtasks: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error syncing subtasks:`, error);
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
        } else {
            console.error(`Failed to update subtasks for Task ID ${taskId}:`, response.statusText);
        }
    } catch (error) {
        console.error(`Error updating subtasks for Task ID ${taskId}:`, error);
    }
}
