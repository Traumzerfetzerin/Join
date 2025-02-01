function initializeBoard() {
    fetchAllTasks();
    let prioContainer = document.querySelector('.prio-container #prioOverlayEdit');
    if (prioContainer) {
        renderPrioButtons(".prio-container #prioOverlayEdit", "overlay");
    } else {
        console.error("Priority container not found at page load.");
    }
}


/**
 * Loads tasks into their respective columns on the board.
 * @param {object} tasks - Tasks retrieved from Firebase.
 */
function loadTasks(tasks) {
    clearColumns();
    let columns = {
        toDo: "toDoColumn",
        inProgress: "inProgressColumn",
        awaitFeedback: "awaitFeedbackColumn",
        done: "doneColumn",
    };

    for (let category in tasks) {
        let categoryTasks = tasks[category];
        for (let taskId in categoryTasks) {
            let task = categoryTasks[taskId];
            task.id = taskId;
            task.contacts = getFullContacts(task.contacts, allContacts);
            addTaskToColumn(task, category, taskId, columns);
        }
    }

    checkEmptyColumns(columns);
    enableDragAndDrop(columns);
    renderPrioButtons(".prio-container #prioOverlayEdit", "overlay");
    resetFormFields();
}


/**
 * Clears all task columns to avoid duplicates.
 */
function clearColumns() {
    let columns = ["toDoColumn", "inProgressColumn", "awaitFeedbackColumn", "doneColumn"];
    columns.forEach(columnId => {
        let columnElement = document.getElementById(columnId);
        if (columnElement) {
            columnElement.innerHTML = ""; 
        }
    });
}


/**
 * Gets the priority icon based on the priority value.
 * @param {string} prio - The priority level.
 * @returns {string} - Path to the priority icon.
 */
function getPrioIcon(prio) {
    if (prio === "urgent") return "../Assets/addTask/Prio alta.svg";
    if (prio === "medium") return "../Assets/addTask/Prio media.svg";
    return "../Assets/addTask/Prio baja.svg";
}


/**
 * Adds a task to the specified column.
 * @param {object} task - Task object.
 * @param {string} category - Task category.
 * @param {string} taskId - Task ID.
 * @param {object} columns - Mapping of column names to HTML element IDs.
 */
function addTaskToColumn(task, category, taskId, columns) {
    if (!task.column) {
        task.column = "toDo";
    }

    let columnElement = document.getElementById(columns[task.column]);
    if (!columnElement) {
        console.error(`Column element for column ${task.column} not found in DOM.`);
        return;
    }

    let progress = calculateSubtaskProgress(task.subtasks);
    task.subtaskProgress = `${progress.completed}/${progress.total}`;
    let contactList = task.contacts ? generateContactList(task.contacts) : "";
    let taskClass = getTaskClass(task.title);
    let taskHtml = getTaskBoardTemplate(
        category,
        task,
        taskId,
        contactList,
        taskClass,
        progress.total,
        progress.completed
    );

    let existingTask = document.getElementById(`task-${taskId}`);
    if (existingTask) {
        existingTask.outerHTML = taskHtml;
    } else {
        columnElement.insertAdjacentHTML("beforeend", taskHtml);
    }

    syncContactIcons(task.contacts || []);
}


/**
 * Checks and updates the display for empty columns.
 * @param {object} columns - Mapping of column names to DOM element IDs.
 */
function checkEmptyColumns(columns) {
    Object.values(columns).forEach(columnId => {
        let column = document.getElementById(columnId);
        if (!column) return;
        let tasks = column.querySelectorAll(".task");
        let noTasksMessage = column.querySelector(".no-tasks");

        if (tasks.length === 0) {
            if (!noTasksMessage) {
                column.innerHTML = `<p class="no-tasks">No tasks available</p>`;
            }
        } else {
            if (noTasksMessage) {
                noTasksMessage.remove();
            }
        }
    });
}


/**
 * Updates the progress bar for a task.
 * @param {string} taskId - The ID of the task.
 * @param {number} progressPercentage - The progress percentage.
 */
function updateProgressBar(taskId, progressPercentage) {
    let taskElement = document.getElementById(`task-${taskId}`);
    if (!taskElement) return;
    let progressElement = taskElement.querySelector("progress");
    if (progressElement) {
        progressElement.value = progressPercentage;
    }
}


/**
* Shows the task form on the board.
*/
function addTaskOnBoard() {
   document.getElementById('templateAddTask').classList.remove('d-none');
}

/**
* Hides the task form on the board.
*/
function closeTaskOnBoard() {
   document.getElementById('templateAddTask').classList.add('d-none');
}


/**
* Prevents closing when clicking inside the form.
* @param {Event} event - The click event.
*/
function dontClose(event) {
   event.stopPropagation();
}


/**
 * Initializes the page by hiding the task overlay and fetching tasks from the database.
 * This function is executed when the window finishes loading.
 * 
 * @returns {Promise<void>} A promise that resolves when the tasks have been fetched.
 */
window.onload = async function () {
    let taskOverlay = document.getElementById("taskOverlay");
    if (taskOverlay) {
        taskOverlay.classList.add("dNone");
    } else {
        console.warn("Element mit der ID 'taskOverlay' nicht gefunden.");
    }
    await fetchTasks();
};


/**
 * Extracts the initials from a contact name.
 * @param {string} name - The full name of the contact.
 * @returns {string} - The initials of the contact.
 */
function getInitials(name) {
    if (!name || typeof name !== "string") {
        return "?";
    }
    let parts = name.split(" ");
    let initials = parts.map((part) => part.charAt(0).toUpperCase()).join("");
    return initials.slice(0, 2);
}


/**
 * Calculates the progress of subtasks.
 * @param {Array} subtasks - The list of subtasks.
 * @returns {object} - An object containing completed and total subtasks.
 */
function calculateSubtaskProgress(subtasks) {
    if (!Array.isArray(subtasks)) {
        return { completed: 0, total: 0 };
    }
    let completed = subtasks.filter(subtask => subtask.completed).length;
    let total = subtasks.length;
    return { completed, total };
}


/**
 * Adds click event listeners to all elements with the class "task".
 * When a task is clicked, its ID is used to determine the category, 
 * and the task overlay is displayed for the selected task.
 */
document.querySelectorAll(".task").forEach(task => {
    task.addEventListener("click", function () {
        let taskId = this.id.replace("task-", "");
        let category = getCategoryFromTaskId(taskId);
        showTaskOverlay(category, taskId);
    });
});
