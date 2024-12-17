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
            addTaskToColumn(task, category, taskId, columns);
        }
    }
    checkEmptyColumns(columns);
    enableDragAndDrop(columns);
}

/**
 * Clears all task columns.
 */
function clearColumns() {
    document.getElementById("toDoColumn").innerHTML = "";
    document.getElementById("inProgressColumn").innerHTML = "";
    document.getElementById("awaitFeedbackColumn").innerHTML = "";
    document.getElementById("doneColumn").innerHTML = "";
}

/**
 * Gets the priority icon based on the priority value.
 * @param {string} prio - The priority level.
 * @returns {string} - Path to the priority icon.
 */
function getPrioIcon(prio) {
    if (prio === "urgent") return "../Assets/addTask/Prio alta.svg";
    if (prio === "medium") return "../Assets/addTask/Prio media white.svg";
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
    let prioIcon = getPrioIcon(task.prio);
    let taskHtml = getTaskBoardTemplate(
        category,
        task,
        taskId,
        contactList,
        taskClass,
        progress.total,
        progress.completed
    );

    addTaskToColumnDom(taskHtml, columnElement, category, taskId);
    syncContactIcons(task.contacts || []);
}


/**
 * Adds a task to the DOM for the given column.
 * @param {string} taskHtml - HTML content of the task.
 * @param {HTMLElement} columnElement - Column element.
 * @param {string} category - Task category.
 * @param {string} taskId - Task ID.
 */
function addTaskToColumnDom(taskHtml, columnElement, category, taskId) {
    let taskContainer = document.createElement("div");
    taskContainer.id = `task-${taskId}`;
    taskContainer.className = "task draggable";
    taskContainer.setAttribute("draggable", "true");
    taskContainer.setAttribute("onclick", `showTaskOverlay('${category}', '${taskId}')`);
    taskContainer.innerHTML = taskHtml;
    columnElement.insertBefore(taskContainer, null);
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

window.onload = async function () {
   let taskOverlay = document.getElementById("taskOverlay");
   taskOverlay.classList.add("d-none");
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

document.querySelectorAll(".task").forEach(task => {
    task.addEventListener("click", function () {
        let taskId = this.id.replace("task-", "");
        let category = getCategoryFromTaskId(taskId);
        showTaskOverlay(category, taskId);
    });
});