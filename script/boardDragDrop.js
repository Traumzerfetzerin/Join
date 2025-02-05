/**
 * Initializes drag-and-drop functionality for tasks.
 * @param {object} columns - Mapping of column names to DOM element IDs.
 */
function enableDragAndDrop(columns) {
    let tasks = document.querySelectorAll(".draggable");
    let zones = Object.values(columns).map(id => document.getElementById(id));

    tasks.forEach(task => setupDragEvents(task));
    zones.forEach(zone => setupDropEvents(zone, columns));
}

/**
 * Adds drag events to a task element.
 * @param {HTMLElement} task - The task element.
 */
function setupDragEvents(task) {
    task.ondragstart = e => startDrag(e, task);
    task.ondragend = () => endDrag(task);
}

/**
 * Handles the drag start event.
 * @param {DragEvent} e - The drag event.
 * @param {HTMLElement} task - The task being dragged.
 */
function startDrag(e, task) {
    e.dataTransfer.setData("taskId", task.id.replace("task-", ""));
    e.dataTransfer.setData("category", getCategoryFromTaskId(task.id.replace("task-", "")));
    task.classList.add("dragging");
    setTimeout(() => task.style.transition = "none", 0);
}

/**
 * Handles the drag end event.
 * @param {HTMLElement} task - The task being dragged.
 */
function endDrag(task) {
    task.classList.remove("dragging");
    task.style.transition = "";
    resetTaskSize(task);
}

/**
 * Adds drop events to a column element.
 * @param {HTMLElement} zone - The drop zone.
 * @param {object} columns - Mapping of column names to DOM element IDs.
 */
function setupDropEvents(zone, columns) {
    zone.ondrop = async e => handleDrop(e, zone, columns);
    zone.ondragover = e => e.preventDefault();
}

/**
 * Handles the drop event.
 * @param {DragEvent} e - The drop event.
 * @param {HTMLElement} zone - The drop target.
 * @param {object} columns - Mapping of column names to DOM element IDs.
 */
async function handleDrop(e, zone, columns) {
    e.preventDefault();
    let taskId = e.dataTransfer.getData("taskId");
    let category = e.dataTransfer.getData("category");
    let newColumn = Object.keys(columns).find(key => columns[key] === zone.id);
    if (!taskId || !category || !newColumn || category === newColumn) return;

    let taskElement = document.getElementById(`task-${taskId}`);
    if (!taskElement) return;

    moveTaskToColumn(taskElement, zone);
    await updateTaskColumn(taskId, category, newColumn, columns);
}

/**
 * Moves a task element to a new column.
 * @param {HTMLElement} taskElement - The task element.
 * @param {HTMLElement} zone - The target drop zone.
 */
function moveTaskToColumn(taskElement, zone) {
    taskElement.classList.remove("dragging");
    taskElement.style.transition = "none";
    taskElement.style.height = taskElement.offsetHeight + "px";
    taskElement.style.width = taskElement.offsetWidth + "px";
    taskElement.style.padding = "0"; // Setzt Padding zurück
    taskElement.style.margin = "0"; // Entfernt Margin
    zone.appendChild(taskElement);
    resetTaskSize(taskElement);
}

/**
 * Ensures the task retains its original size after drop.
 * @param {HTMLElement} taskElement - The task element.
 */
function resetTaskSize(taskElement) {
    setTimeout(() => {
        taskElement.style.height = "auto";
        taskElement.style.width = "100%";
        taskElement.style.padding = ""; 
        taskElement.style.margin = ""; 
    }, 100);
}

/**
 * Updates the task's column in the database.
 * @param {string} taskId - The task ID.
 * @param {string} oldCategory - The original category.
 * @param {string} newCategory - The new category.
 * @param {object} columns - Mapping of column names to DOM element IDs.
 */
async function updateTaskColumn(taskId, oldCategory, newCategory, columns) {
    let task = findTaskInData(taskId);
    if (!task) return;

    task.column = newCategory;
    await handleTaskDrop(task, taskId, oldCategory, newCategory, columns);
    checkEmptyColumns(columns);
}


/**
 * Handles task movement between columns and updates the overlay if necessary.
 * Ensures that only contact IDs are stored and full contacts are reloaded.
 * @param {object} task - The task object.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The original category of the task.
 * @param {string} newColumn - The new column name.
 * @param {object} columns - Mapping of column names to DOM element IDs.
 */
async function handleTaskDrop(task, taskId, category, newColumn, columns) {
    task.column = newColumn;
    task.contacts = task.contacts.map(contact => contact.id || contact);
    await saveTaskToCategory(taskId, category, task);

    let updatedTask = await fetchTaskById(category, taskId);
    if (updatedTask) {
        updateTaskUI(updatedTask, taskId, newColumn, columns);

        let overlay = document.getElementById("board-overlay-container");
        if (overlay && overlay.style.display === "block") {
            await updateOverlayContent(updatedTask.category, updatedTask);
            await syncContactIcons(updatedTask.contacts);
        }
    }
}


/**
 * Finds the category of a task based on its ID.
 * @param {string} taskId - The ID of the task.
 * @returns {string|null} - The category of the task or null if not found.
 */
function getCategoryFromTaskId(taskId) {
    for (let category in taskData) {
        if (taskData[category] && taskData[category][taskId]) {
            return category;
        }
    }
    return null;
}


/**
 * Updates the task UI by re-rendering the task in the specified column
 * and updating the overlay content if it is currently visible.
 * 
 * @param {Object} task - The task object containing all relevant details.
 * @param {string} taskId - The unique ID of the task.
 * @param {string} column - The column where the task should be displayed.
 * @param {Object} columns - An object mapping column names to DOM element IDs.
 * @returns {Promise<void>} - Resolves when the task UI and overlay are updated.
 */
async function updateTaskUI(task, taskId, column, columns) {
    let taskElement = document.getElementById(`task-${taskId}`);
    if (taskElement) taskElement.remove();

    let columnElement = document.getElementById(columns[column]);
    if (columnElement) {
        let subtasks = task.subtasks || [];
        let taskHtml = getTaskBoardTemplate(
            task.category,
            task,
            taskId,
            generateContactList(task.contacts || []),
            getTaskClass(task.title),
            subtasks.length,
            subtasks.filter(s => s.completed).length
        );

        columnElement.innerHTML += `<div id="task-${taskId}" class="task draggable" draggable="true">${taskHtml}</div>`;
    }
    enableDragAndDrop(columns);
    checkEmptyColumns(columns);

    let overlay = document.getElementById("board-overlay-container");
    if (overlay && overlay.style.display === "block") {
        await updateOverlayContent(task.category, task);
    }
}


/**
 * Moves a task to a new column and ensures contacts are preserved.
 * @param {string} taskId - The ID of the task.
 * @param {string} newCategory - The new category of the task.
 */
async function moveTaskToColumn(taskId, newCategory) {
    let task = findTaskInData(taskId);
    if (!task) return;

    let oldCategory = task.column;
    task.column = newCategory;

    await updateTaskInDatabase(newCategory, taskId, task);
    loadTasks(await fetchTasks());

    if (document.getElementById("taskOverlay").style.display === "block") {
        updateOverlayContent(newCategory, task);
    }
}

/**
 * Sets up touch drag functionality for a task, enabling drag after holding for 2 seconds.
 * @param {HTMLElement} task - The task element to apply touch drag functionality.
 */
function setupTouchDrag(task) {
    let touchTimer;
    let isDragging = false;

    task.ontouchstart = e => {
        touchTimer = setTimeout(() => {
            isDragging = true;
            task.classList.add("dragging");
        }, 2000);
    };

    task.ontouchmove = e => {
        if (isDragging) {
            let touch = e.touches[0];
            let event = new MouseEvent("mousemove", {
                bubbles: true,
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            document.dispatchEvent(event);
        }
    };

    task.ontouchend = () => {
        clearTimeout(touchTimer);
        task.classList.remove("dragging");
        isDragging = false;
    };
}

/**
 * Handles touch drop event and moves task to new drop zone.
 * @param {TouchEvent} e - The touch event.
 * @param {HTMLElement} zone - The drop zone.
 * @param {object} columns - Mapping of column names to DOM element IDs.
 */
function handleTouchDrop(e, zone, columns) {
    let task = document.querySelector(".dragging");
    if (!task) return;

    let touch = e.changedTouches[0];
    let targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    let dropZone = targetElement.closest(".drop-zone");

    if (dropZone) {
        let newColumn = Object.keys(columns).find(key => columns[key] === dropZone.id);
        if (!newColumn) return;
        dropZone.innerHTML += task.outerHTML; // Vermeidet appendChild
        task.remove(); // Entfernt das Original-Element
        updateTaskColumn(task.id.replace("task-", ""), newColumn);
    }
}

/**
 * Adds touch event listeners to all draggable tasks.
 */
function enableTouchDrag(columns) {
    let tasks = document.querySelectorAll(".draggable");
    tasks.forEach(task => setupTouchDrag(task));

    let zones = Object.values(columns).map(id => document.getElementById(id));
    zones.forEach(zone => {
        zone.ontouchend = e => handleTouchDrop(e, zone, columns);
    });
}

// Ensure touch drag is enabled when drag-and-drop is initialized
document.addEventListener("DOMContentLoaded", () => {
    let columns = {
        toDo: "toDoColumn",
        inProgress: "inProgressColumn",
        awaitFeedback: "awaitFeedbackColumn",
        done: "doneColumn",
    };
    enableTouchDrag(columns);
});
