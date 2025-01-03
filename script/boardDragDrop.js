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
 * Handles the logic after a task is dropped into a new column.
 * @param {object} task - The task object.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The original category of the task.
 * @param {string} newColumn - The new column name.
 * @param {object} columns - Mapping of column names to DOM element IDs.
 */
async function handleTaskDrop(task, taskId, category, newColumn, columns) {
    task.column = newColumn;
    await saveTaskToCategory(taskId, category, task);
    let updatedTask = await fetchTaskById(category, taskId);
    if (updatedTask) updateTaskUI(updatedTask, taskId, newColumn, columns);
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

function updateTaskUI(task, taskId, column, columns) {
    let taskElement = document.getElementById(`task-${taskId}`);
    if (taskElement) taskElement.remove();

    let columnElement = document.getElementById(columns[column]);
    if (columnElement) {
        let subtasks = task.subtasks || [];
        let taskHtml = getTaskBoardTemplate(
            column,
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
}
