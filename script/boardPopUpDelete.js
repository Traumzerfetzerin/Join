/**
 * Deletes a task from Firebase, updates the board, and closes the overlay.
 * @param {string} category - The category of the task.
 * @param {string} taskId - The ID of the task to delete.
 */
async function deleteTask(category, taskId) {
    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`, {
            method: "DELETE"
        });

        if (response.ok) {
            delete taskData[category][taskId];
            loadTasks(taskData);
            refreshPageOrUpdateUI();
            closeTaskOverlay();
        } else {
            console.error(`Failed to delete task with ID ${taskId}: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error deleting task with ID ${taskId}:`, error);
    }
}

/**
 * Deletes a subtask from the DOM and Firebase in edit mode.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 */
async function deleteSubtask(taskId, category, subtaskIndex) {
    try {
        let task = taskData[category][taskId];
        if (task && task.subtasks) {
            task.subtasks.splice(subtaskIndex, 1);

            let response = await fetch(`${TASK_URL}/${category}/${taskId}/subtasks.json`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(task.subtasks)
            });

            if (!response.ok) {
                console.error(`Failed to delete subtask: ${response.statusText}`);
            } else {
                refreshPageOrUpdateUI();
            }
        }
    } catch (error) {
        console.error(`Error deleting subtask:`, error);
    }
}
