/**
 * Deletes a task from Firebase and updates the local task data.
 * @param {string} category - The category of the task.
 * @param {string} taskId - The ID of the task to delete.
 */
async function deleteTask(category, taskId) {
    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`, {
            method: "DELETE"
        });

        if (response.ok) {
            handleTaskDeletion(category, taskId);
        } else {
            console.error(`Failed to delete task with ID ${taskId}: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error deleting task with ID ${taskId}:`, error);
    }
}


/**
 * Handles the post-deletion process, including updating the board and closing the overlay.
 * @param {string} category - The category of the task.
 * @param {string} taskId - The ID of the deleted task.
 */
function handleTaskDeletion(category, taskId) {
    delete taskData[category][taskId];
    loadTasks(taskData);
    refreshPageOrUpdateUI();
    closeTaskOverlay();
}



/**
 * Deletes a subtask from Firebase and updates the local task data.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 */
async function deleteSubtask(taskId, category, subtaskIndex) {
    try {
        let task = taskData[category][taskId];
        if (task && task.subtasks) {
            task.subtasks.splice(subtaskIndex, 1);

            let response = await updateSubtasksInFirebase(taskId, category, task.subtasks);

            if (!response.ok) {
                console.error(`Failed to delete subtask: ${response.statusText}`);
            } else {
                handleSubtaskDeletion(taskId, category);
            }
        }
    } catch (error) {
        console.error(`Error deleting subtask:`, error);
    }
}

/**
 * Updates the subtasks in Firebase.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @param {Array} subtasks - The updated list of subtasks.
 * @returns {Promise<Response>} The response from Firebase.
 */
async function updateSubtasksInFirebase(taskId, category, subtasks) {
    return await fetch(`${TASK_URL}/${category}/${taskId}/subtasks.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subtasks),
    });
}

/**
 * Handles post-deletion updates, such as refreshing the UI.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 */
function handleSubtaskDeletion(taskId, category) {
    refreshPageOrUpdateUI();
    console.log(`Subtask deleted for Task ID: ${taskId} in Category: ${category}`);
}

