/** Template for each task */
function getTaskBoardTemplate(category, task, taskId, contactList, taskClass, subtaskCount, completedSubtasks, prioIcon) {
    return `
        <div id="${taskId}" class="task draggable ${taskClass}" draggable="true" 
             onclick="showTaskOverlay('${category}', '${taskId}')">
            <h4 class="task-category">${category}</h4>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${(subtaskCount > 0 ? (completedSubtasks / subtaskCount) * 100 : 0)}%"></div>
            </div>
            <p class="subtask-count">${completedSubtasks}/${subtaskCount} Subtasks</p>
            <ul>${contactList}</ul>
            <div class="prio-icon-container">
                <img src="${prioIcon}" class="prio-icon">
            </div>
        </div>
    `;
}


function getBoardOverlayTemplate(category, task) {
    return `
        <h2>${category}</h2>
        <h3>${task.title || "No title"}</h3>
        <p><strong>Description:</strong> ${task.description || "No description"}</p>
        <p><strong>Due Date:</strong> ${task.dueDate || "No due date"}</p>
        <p><strong>Priority:</strong> ${task.prio || "No priority"}</p>
        <p><strong>Contacts:</strong> ${
            task.contacts && task.contacts.length
                ? task.contacts.map(contact => `
                    <div class="contact-item">
                            ${contact}
                    </div>`).join("")
                : "No contacts"
        }</p>
        <div>
            <strong>Subtasks:</strong>
            <ul>
                ${
                    task.subtasks && task.subtasks.length
                        ? task.subtasks.map((subtask, index) => `
                            <li>
                                <label>
                                    <input type="checkbox" class="subtask-checkbox">
                                    ${subtask}
                                </label>
                            </li>`).join("")
                        : "<li>No subtasks</li>"
                }
            </ul>
        </div>
    `;
}