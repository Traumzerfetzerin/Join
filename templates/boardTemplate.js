function getTaskBoardTemplate(category, task, taskId, contactList, taskClass, subtaskCount) {
    const categoryClass = category.toLowerCase().replace(" ", "-");

    // Generate the priority symbol and progress bar
    const prioritySymbol = getPrioritySymbol(task.prio);
    const progressBar = getSubtaskProgressBar(task, subtaskCount);

    return `
        <div id="${taskId}" class="task draggable ${taskClass}" draggable="true" 
             onclick="showTaskOverlay('${category}', '${taskId}')">
            <h4 class="task-category ${categoryClass}">${category}</h4>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            ${progressBar}
            <div class="contact-priority-container">
                <div class="contact-list">${contactList}</div>
                <div class="priority-symbol">${prioritySymbol}</div>
            </div>
        </div>
    `;
}



// Helper function to fetch priority symbols
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

function getSubtaskProgressBar(task, subtaskCount) {
    // Return empty if no subtasks
    if (!subtaskCount || subtaskCount <= 0) {
        return ""; 
    }

    // Default to zero progress
    let progressPercentage = 0; 
    let progressBarColor = "lightgray"; 

    // Update progress based on the task column
    switch (task.column) {
        case "toDo":
            progressPercentage = 0; // No progress
            progressBarColor = "lightgray";
            break;
        case "in-progress":
            progressPercentage = 50; // Half progress
            progressBarColor = "blue";
            break;
        case "awaiting-feedback":
        case "done":
            progressPercentage = 100; // Full progress
            progressBarColor = "blue";
            break;
    }

    // Construct the progress bar HTML
    return `
        <div style="display: flex; align-items: center; margin-top: 5px;">
            <span>${subtaskCount} Subtasks</span>
            <div style="margin-left: 10px; width: 50%; height: 5px; background-color: lightgray; border-radius: 5px; overflow: hidden;">
                <div style="width: ${progressPercentage}%; height: 100%; background-color: ${progressBarColor};"></div>
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
                ? task.contacts.map(contact => `<div class="contact-item">${contact}</div>`).join("")
                : "No contacts"
        }</p>
        <div>
            <strong>Subtasks:</strong>
            <ul>
                ${task.subtasks && task.subtasks.length
                    ? task.subtasks.map(subtask => `
                        <li>
                            <label><input type="checkbox" class="subtask-checkbox"> ${subtask}</label>
                        </li>`).join("")
                    : "<li>No subtasks</li>"
                }
            </ul>
        </div>
        <div class="action-links">
            <a href="javascript:void(0);" onclick="deleteTask('${category}', '${task.id}')" class="action-link delete-link">
                <img src="../Assets/delete_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg" alt="Delete" class="link-icon">
                Delete
            </a>
            <a href="javascript:void(0);" onclick="editTask('${task.id}')" class="action-link edit-link">
                <img src="../Assets/edit_21dp_5F6368_FILL0_wght400_GRAD0_opsz20.svg" alt="Edit" class="link-icon">
                Edit
            </a>
        </div>
    `;
}






