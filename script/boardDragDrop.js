/**
 * Enables drag-and-drop functionality for tasks and updates their columns.
 * @param {object} columns - Mapping of column names to DOM element IDs.
 */
function enableDragAndDrop(columns) {
    let tasks = document.querySelectorAll(".draggable");
    let zones = Object.values(columns).map(id => document.getElementById(id));

    tasks.forEach(task => {
        task.ondragstart = e => {
            e.dataTransfer.setData("taskId", task.id.replace("task-", ""));
            e.dataTransfer.setData("category", getCategoryFromTaskId(task.id.replace("task-", "")));
        };
    });

    zones.forEach(zone => {
        zone.ondrop = async e => {
            e.preventDefault();
            let taskId = e.dataTransfer.getData("taskId");
            let category = e.dataTransfer.getData("category");
            let newColumn = Object.keys(columns).find(key => columns[key] === zone.id);
            if (!taskId || !category || !newColumn) return;
            let task = findTaskInData(taskId);
            if (task) await handleTaskDrop(task, taskId, category, newColumn, columns);
        };
        zone.ondragover = e => e.preventDefault();
    });
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
