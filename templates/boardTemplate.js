/**
 * Generates the task HTML template for display on the board.
 * @param {string} category - Task category.
 * @param {object} task - Task object containing all task details.
 * @param {string} taskId - Unique ID of the task.
 * @param {string} contactList - HTML for the list of contacts assigned to the task.
 * @param {string} taskClass - CSS class for the task type.
 * @param {number} subtaskCount - Total number of subtasks for the task.
 * @returns {string} - Task HTML template as a string.
 */
function getTaskBoardTemplate(category, task, taskId, contactList, taskClass, subtaskCount) {
    let categoryClass = category.toLowerCase().replace(" ", "-");
    let prioritySymbol = getPrioritySymbol(task.prio);
    let progressPercentage = calculateProgressPercentage(task.subtasks || []);

    return `
        <div id="task-${taskId}" class="task draggable ${taskClass}" draggable="true" 
             onclick="showTaskOverlay('${category}', '${taskId}')">
            <h4 class="task-category ${categoryClass}">${category}</h4>
            <h3>${task.title || "No title"}</h3>
            <p>${task.description || "No description"}</p>
            <div class="progress-bar-container" style="margin-top: 10px;">
                <span>${subtaskCount || 0} Subtasks</span>
                <div class="progress-bar-background" 
                     style="width: 100%; background-color: lightgray; height: 5px; border-radius: 5px; overflow: hidden;">
                    <div class="progress-bar-fill" 
                         style="width: ${progressPercentage}%; background-color: ${progressPercentage === 0 ? 'lightgray' : 'blue'}; height: 100%;"></div>
                </div>
            </div>
            <div class="contact-priority-container">
                <div class="contact-list">${contactList}</div>
                <div class="priority-symbol">${prioritySymbol}</div>
            </div>
        </div>
    `;
}


/**
 * Fetches the priority symbol for the task.
 * @param {string} priority - The priority level of the task.
 * @returns {string} - HTML for the priority icon.
 */
function getPrioritySymbol(priority) {
    if (priority === "urgent") {
        return "<img src='../Assets/addTask/Prio alta.svg' class='priority-icon'>";
    } else if (priority === "medium") {
        return "<img src='../Assets/medium.svg' alt='Medium Priority' class='priority-icon'>";
    } else if (priority === "low") {
        return "<img src='../Assets/addTask/Prio baja.svg' alt='Low Priority' class='priority-icon'>";
    }
    return "";
}

/**
 * Generates the progress bar HTML for a task based on subtasks.
 * @param {object} task - Task object containing subtasks and column information.
 * @param {number} subtaskCount - Total number of subtasks for the task.
 * @returns {string} - HTML for the progress bar.
 */
function getSubtaskProgressBar(task, subtaskCount) {
    if (!subtaskCount || subtaskCount <= 0) {
        return "";
    }

    let progressPercentage = calculateProgressPercentage(task.subtasks);
    return `
        <div style="display: flex; align-items: center; margin-top: 5px;">
            <span>${subtaskCount} Subtasks</span>
            <div style="margin-left: 10px; width: 50%; height: 5px; background-color: lightgray; border-radius: 5px; overflow: hidden;">
                <div style="width: ${progressPercentage}%; height: 100%; background-color: blue;"></div>
            </div>
        </div>
    `;
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
 * Generates the HTML template for the task overlay popup.
 * @param {string} category - Task category.
 * @param {object} task - Task object containing all task details.
 * @returns {string} - HTML template for the task overlay.
 */
function getBoardOverlayTemplate(category, task) {
    let prioritySymbol = getPrioritySymbol(task.prio);
    let categoryClass = category.toLowerCase().replace(" ", "-");
    let contactList = generateContactList(task.contacts);
    let subtasksList = generateSubtaskList(task);

    return `
        <div class="board-overlay" data-task-id="${task.id}">
            <div class="overlay-header">
                <h2 class="task-category ${categoryClass}">${category}</h2>
                <button class="close-button" onclick="closeTaskOverlay(event)">×</button>
            </div>
            <div class="overlay-content">
                <h1 class="task-title">${task.title || "No title"}</h1>
                <p class="task-description">${task.description || "No description"}</p>
                <div class="task-info">
                    <p><strong>Due Date:</strong> ${task.dueDate || "No due date"}</p>
                    <p><strong>Priority:</strong> ${prioritySymbol}</p>
                </div>
                <div class="contacts-section">
                    <strong>Assigned To:</strong>
                    <div id="cardOverlayContacts" class="contact-list">${contactList}</div>
                </div>
                <div class="subtasks-section">
                    <strong>Subtasks:</strong>
                    <ul class="subtasks-list">${subtasksList}</ul>
                </div>
                <div class="action-links">
                    <a href="javascript:void(0);" onclick="deleteTask('${category}', '${task.id}')" class="action-link delete-link">
                        <img src="../Assets/delete_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg" alt="Delete" class="link-icon">
                        Delete
                    </a>
                    <a href="javascript:void(0);" onclick="editTask('${task.id}', '${category}')" class="action-link edit-link">
                        <img src="../Assets/edit_21dp_5F6368_FILL0_wght400_GRAD0_opsz20.svg" alt="Edit" class="link-icon">
                        Edit
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generates the HTML for the contact list.
 * @param {Array} contacts - List of contacts assigned to the task.
 * @returns {string} - HTML string for the contact list.
 */
function generateContactList(contacts) {
    if (!contacts || contacts.length === 0) return "";
    return contacts.map(function(contact) {
        let initials = getInitials(contact);
        let bgColor = getRandomColor();
        return `<span class="contact-initial" style="background-color: ${bgColor};">${initials}</span>`;
    }).join('');
}

/**
 * Generates the subtasks list HTML for the overlay.
 * @param {object} task - Task object containing subtasks.
 * @returns {string} - HTML for the subtasks list.
 */
function generateSubtaskList(task) {
    if (!task.id) {
        console.error("Task ID is undefined for the following task:", task);
        return "<li>No subtasks available</li>";
    }

    return task.subtasks && task.subtasks.length
        ? task.subtasks.map((subtask, index) => `
            <li class="subtask-item">
                <input type="checkbox" class="subtask-checkbox" 
                       data-task-id="${task.id}" 
                       data-subtask-index="${index}" 
                       ${subtask.completed ? "checked" : ""} 
                       onchange="toggleSubtaskCompletion('${task.id}', ${index})">
                <span class="subtask-text">${subtask.text}</span>
            </li>
        `).join("")
        : "<li>No subtasks available</li>";
}