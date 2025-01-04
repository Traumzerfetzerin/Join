/**
 * Enables edit mode for a specific task, ensuring the correct contact dropdown and icons.
 * @param {string} taskId - The ID of the task to edit.
 * @param {string} category - The category of the task.
 */
function editTask(taskId, category) {
    let task = findTaskInData(taskId);
    if (!task) return;

    enableEditMode(task, category);
    renderSubtasksInEditMode(task, category);
    renderAddTaskPrioButtonsOverlay(task);

    if (task.contacts && task.contacts.length > 0) {
        syncContactIcons(task.contacts);
    } else {
        console.error("No contacts found for the task.");
    }
}


/**
 * Fills the fields of the edit overlay with task data.
 * @param {Object} task - The task data to populate the fields.
 */
function fillFields(task) {
    document.getElementById('inputTitle').value = task.title || '';
    document.getElementById('textareaDescription').value = task.description || '';
    document.getElementById('dueDate').value = task.dueDate || '';
    document.getElementById('categorySelect').value = task.category || '';
    setPrio(task.prio);
}


/**
 * Saves the edited task to Firebase and updates the board.
 * @param {string} taskId - The ID of the task to save.
 * @param {string} category - The category of the task.
 */
async function saveEditedTask(taskId, category) {
    let updatedTask = collectTaskData();

    try {
        await saveTaskToFirebase(updatedTask, category, taskId);
        taskData[category][taskId] = updatedTask;
        loadTasks(taskData);
        closeTaskOnBoard();
    } catch (error) {
        console.error(`Error saving task:`, error);
    }
}


/**
 * Finalizes the task update process by closing the overlay and reloading tasks.
 * @param {Object} updatedTask - The updated task data.
 * @param {string} category - The category of the task.
 * @param {string} taskId - The ID of the task.
 */
function finalizeTaskUpdate(updatedTask, category, taskId) {
    taskData[category][taskId] = updatedTask;
    alert("Task updated successfully!");
    closeTaskOverlay();
    loadTasks(taskData);
}
