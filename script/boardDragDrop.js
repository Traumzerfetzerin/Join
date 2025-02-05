/**
 * Enables drag-and-drop functionality for tasks and updates their columns.
 * @param {object} columns - Mapping of column names to DOM element IDs.
 */
function enableDragAndDrop(columns) {
    let tasks = document.querySelectorAll(".draggable");
    let zones = Object.values(columns).map(id => document.getElementById(id));
    tasks.forEach(task => setupDragEvents(task));
    zones.forEach(zone => setupDropEvents(zone, columns));
}

/**
 * Sets up drag event listeners for a task.
 * @param {HTMLElement} task - The task element.
 */
function setupDragEvents(task) {
    task.ondragstart = e => {
        e.dataTransfer.setData("taskId", task.id.replace("task-", ""));
        e.dataTransfer.setData("category", getCategoryFromTaskId(task.id.replace("task-", "")));
    };
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
 * Sets up drop event listeners for a column.
 * @param {HTMLElement} zone - The drop zone element.
 * @param {object} columns - Mapping of column names to DOM element IDs.
 */
function setupDropEvents(zone, columns) {
    zone.ondrop = async e => handleDrop(e, zone, columns);
    zone.ondragover = e => e.preventDefault();
}


/**
 * Handles the drop event and updates the task column.
 * @param {DragEvent} e - The drop event.
 * @param {HTMLElement} zone - The drop zone element.
 * @param {object} columns - Mapping of column names to DOM element IDs.
 */
async function handleDrop(e, zone, columns) {
    e.preventDefault();
    let taskId = e.dataTransfer.getData("taskId");
    let category = e.dataTransfer.getData("category");
    let newColumn = Object.keys(columns).find(key => columns[key] === zone.id);
    if (!taskId || !category || !newColumn) return;
    let task = findTaskInData(taskId);
    if (task) await handleTaskDrop(task, taskId, category, newColumn, columns);
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
 * Updates the task UI by moving it to the specified column
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
    if (!taskElement) return;
    let columnElement = document.getElementById(columns[column]);
    if (!columnElement) return;
    columnElement.append(taskElement);
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

    task.ontouchstart = e => handleTouchStart(e, task, () => {
        isDragging = true;
        task.classList.add("dragging");
    });

    task.ontouchmove = e => handleTouchMove(e, isDragging);

    task.ontouchend = () => handleTouchEnd(task, touchTimer, () => {
        isDragging = false;
    });
}

/**
 * Handles the touch start event and sets a timer for dragging.
 * @param {TouchEvent} e - The touch event.
 * @param {HTMLElement} task - The task element.
 * @param {Function} onDragStart - Callback to trigger drag start.
 */
function handleTouchStart(e, task, onDragStart) {
    touchTimer = setTimeout(() => onDragStart(), 2000);
}

/**
 * Handles the touch move event and simulates a mouse move event.
 * @param {TouchEvent} e - The touch event.
 * @param {boolean} isDragging - Whether dragging is active.
 */
function handleTouchMove(e, isDragging) {
    if (!isDragging) return;

    let touch = e.touches[0];
    let event = new MouseEvent("mousemove", {
        bubbles: true,
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    document.dispatchEvent(event);
}

/**
 * Handles the touch end event and resets drag state.
 * @param {HTMLElement} task - The task element.
 * @param {number} touchTimer - The timeout ID for touch hold.
 * @param {Function} onDragEnd - Callback to trigger drag end.
 */
function handleTouchEnd(task, touchTimer, onDragEnd) {
    clearTimeout(touchTimer);
    task.classList.remove("dragging");
    onDragEnd();
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
