/**
 * Generates the task HTML template for display on the board.
 * @param {string} category - Task category.
 * @param {object} task - Task object containing all task details.
 * @param {string} taskId - Unique ID of the task.
 * @param {string} contactList - HTML for the list of contacts assigned to the task.
 * @param {string} taskClass - CSS class for the task type.
 * @param {number} subtaskCount - Total number of subtasks for the task.
 * @param {number} completedSubtasks - Number of completed subtasks.
 * @returns {string} - Task HTML template as a string.
 */
function getTaskBoardTemplate(category, task, taskId, contactList, taskClass, subtaskCount, completedSubtasks) {
    let categoryClass = category.toLowerCase().replace(" ", "-");
    let priorityIcon = getPrioIcon(task.prio);
    let progressPercentage = subtaskCount === 0 ? 0 : Math.round((completedSubtasks / subtaskCount) * 100);
    let barColor = progressPercentage === 0 ? 'lightgray' : 'blue';

    return `
        <div id="task-${taskId}" class="task draggable ${taskClass}" draggable="true"
             onclick="showTaskOverlay('${category}', '${taskId}')">
            <h4 class="task-category ${categoryClass}">${category}</h4>
            <h3>${task.title || "No title"}</h3>
            <p>${task.description || "No description"}</p>
            <div class="progress-bar-container" style="margin-top: 10px; display:flex;align-items:center;gap:8px;">
                <div class="progress-bar-background" 
                     style="flex-grow:1;background-color:lightgray;height:5px;border-radius:5px;overflow:hidden;">
                    <div class="progress-bar-fill" 
                         style="width:${progressPercentage}%;background-color:${barColor};height:100%;"></div>
                </div>
                <span>${completedSubtasks}/${subtaskCount} Subtasks</span>
            </div>
            <div class="contact-priority-container">
                <div class="contact-list">${contactList}</div>
                <div class="priority-symbol"><img src="${priorityIcon}" class="priority-icon"></div>
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
 * Generates the HTML template for the task overlay popup.
 * @param {string} category - Task category.
 * @param {object} task - Task object containing all task details.
 * @returns {string} - HTML template for the task overlay.
 */
function getBoardOverlayTemplate(category, task) {
    let priorityIcon = getPrioIcon(task.prio);
    let categoryClass = category.toLowerCase().replace(" ", "-");
    let contactList = generateOverlayContactList(task.contacts);
    let subtasksList = generateSubtaskList(task);

    return `
       <div class="board-overlay" data-task-id="${task.id}">
        <div class="overlay-header">
            <h2 id="task-category" class="task-category ${categoryClass}">${category}</h2>
            <button class="close-button" onclick="closeTaskOverlay(event)">×</button>
        </div>
        <div class="overlay-content">
            <h1 class="task-title">${task.title || "No title"}</h1>
            <p class="task-description">${task.description || "No description"}</p>
            <div class="task-info">
                    <div class="due-date-container">
                        <h3 class="overlay-heading">Due date</h3>
                        <span id="due-date-display">${task.dueDate || 'No date set'}</span>
                        <input type="date" id="edit-task-due-date" value="${task.dueDate || ''}" class="input-field" style="display: none;" />
                    </div>
                    <div class="prio-container" id="prio-container-overlay">
                        <h3 class="overlay-heading1">Priority</h3>
                        <div id="prio-display-overlay" class="prio-display">
                            <span>${task.prio.charAt(0).toUpperCase() + task.prio.slice(1)}</span>
                            <img src="${priorityIcon}" alt="${task.prio}" class="priority-icon">
                        </div>
                        <div id="prioOverlayEdit" class="prio-buttons" style="display: none;">
                            ${generatePrioButtonsHTML(task.prio, 'overlay')}
                        </div>
                    </div>
               <div class="contacts-section">
                   <strong>Assigned To:</strong>
                   <div id="cardOverlayContacts" class="contact-list-overlay">${contactList}</div>
               </div>
               <div class="subtasks-section" id="subtasks-section-Overlay">
                   <strong>Subtasks:</strong>
                   <ul class="subtasks-list">${subtasksList}</ul>
               </div>
               <div class="action-links">
                   <a href="javascript:void(0);" onclick="deleteTask('${category}', '${task.id}')" class="action-link delete-link">
                       <img src="../Assets/delete_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg" alt="Delete" class="link-icon">
                       Delete
                   </a>
                   <a href="javascript:void(0);" onclick="editTask('${task.id}', '${category}'); toggleEditMode(true)" class="action-link edit-link">
                       <img src="../Assets/edit_21dp_5F6368_FILL0_wght400_GRAD0_opsz20.svg" alt="Edit" class="link-icon">
                       Edit
                   </a>
               </div>
               <div class="okButtonOverlay"></div>
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
    return contacts.map(function (contact) {
        let name = contact && contact.name ? contact.name : "Unknown";
        let initials = getInitials(name);
        let bgColor = contact.color || getRandomColor();
        return `<span class="contact-initial" style="background-color: ${bgColor};">${initials}</span>`;
    }).join('');
}


/**
 * Generates HTML for a list of contacts to display in an overlay.
 *
 * @function generateOverlayContactList
 * @param {Array<Object>} contacts - Array of contact objects, each containing `name` and optionally `color`.
 * @returns {string} The generated HTML string for the contact list. Returns an empty string if no contacts are provided.
 */
function generateOverlayContactList(contacts) {
    if (!contacts || contacts.length === 0) return "";
    return contacts.map(function (contact) {
        let name = contact && contact.name ? contact.name : "Unknown";
        let initials = name.split(" ").map(word => word.charAt(0).toUpperCase()).join("");
        let bgColor = contact.color || getRandomColor();

        return `
            <div class="contact-item">
                <span class="contact-initial" style="background-color: ${bgColor};">${initials}</span>
                <span class="contact-name">${name}</span>
            </div>`;
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


/**
 * Generates the HTML content for the contact dropdown and selected user icons.
 *
 * @function generateContactDropdownHTML
 * @param {Array} allContacts - Array of all contact objects.
 * @param {Array} assignedContacts - Array of currently assigned contact objects.
 * @param {Array} assignedContactIds - Array of IDs of currently assigned contacts.
 * @returns {string} The generated HTML content for the dropdown and selected icons.
 */
function generateContactDropdownHTML(allContacts, assignedContacts, assignedContactIds) {
    return `
        <h3 class="overlay-heading">Assigned to</h3>
        <div class="dropdown-wrapper">
            <div class="dropdown-header" onclick="toggleEditDropdown()">
                <input type="text" id="editAssignedTo" placeholder="Select contacts to assign" readonly>
                <span class="dropdown-arrow">▼</span>
            </div>
            <div id="editAssignTaskDropdown" class="dropdown-container dNone">
                ${allContacts.map(contact => {
                    let initials = contact.initials || 
                        contact.name.split(' ').map(n => n[0]).join('').toUpperCase();
                    return `
                        <div class="dropdown-entry">
                            <div class="entry-wrapper">
                                <div class="user-icon-edit" style="background-color: ${contact.color || '#ccc'};">
                                    ${initials}
                                </div>
                                <div class="user-name">${contact.name}</div>
                                <input class="checkbox-overlay-edit" type="checkbox" value="${contact.id}" 
                                    ${assignedContactIds.includes(contact.id) ? 'checked' : ''} 
                                    onclick="assignContact('${contact.id}')">
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div id="contact-icons-container" class="contact-icons">
    ${assignedContacts.length > 0 ? assignedContacts.map(contact => {
        let initials = contact.initials || 
            (contact.name.includes(' ') ? 
            contact.name.split(' ').map(n => n[0]).join('') : 
            contact.name.substring(0, 2)).toUpperCase();
        return `
            <div class="contact-icon" style="background-color: ${contact.color || '#ccc'};">
                ${initials}
            </div>
        `;
    }).join('') : '<p>No contacts assigned</p>'}
</div>

        </div>
    `;
}



/**
 * Generates the HTML for priority buttons and binds click events.
 * Ensures the priority buttons are correctly generated with appropriate classes and event handlers.
 * @param {string|null} selectedPrio - The selected priority (e.g., "urgent", "medium", "low").
 * @param {string} context - The context for the buttons ("normal" or "overlay").
 * @returns {string} - HTML for the priority buttons.
 */
function generatePrioButtonsHTML(selectedPrio, context) {
    let suffix = context === "overlay" ? "Overlay" : "";
    return `
    ${context !== "overlay" ? `<div class="priority-title">Priority</div>` : ''}
        <div class="flex space-between">
            ${prioOptions.map(option => `
                <button 
                    type="button" 
                    class="prio-button cursorPointer fonts ${option.class}${suffix} ${selectedPrio === option.class ? `${option.class}White` : ""}" id="button-overlay-edit" 
                    data-prio="${option.class}" 
                    onclick="setPrio('${option.class}', '${context}', event)">
                    ${option.label}
                    <img 
                        src="${selectedPrio === option.class ? option.activeSrc : option.src}" 
                        alt="${option.label}">
                </button>
            `).join("")}
        </div>
    `;
}
