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
 * Deletes a subtask from Firebase and updates the UI without removing the input field.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 */
async function deleteSubtaskOnBoard(taskId, category, subtaskIndex) {
    try {
        let task = taskData[category][taskId];
        if (task && task.subtasks) {
            task.subtasks.splice(subtaskIndex, 1);

            let response = await updateSubtasksInFirebase(taskId, category, task.subtasks);

            if (!response.ok) {
                console.error(`Failed to delete subtask: ${response.statusText}`);
            } else {
                let subtaskElement = document.getElementById(`subtaskDiv_${subtaskIndex}`);
                if (subtaskElement) {
                    subtaskElement.remove();
                }
            }
        }
    } catch (error) {
        console.error(`Error deleting subtask:`, error);
    }
}


/**
 * Updates the UI of the subtask section in the overlay.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 */
function updateSubtaskUI(taskId, category) {
    let task = taskData[category][taskId];
    if (!task) return;

    let subtaskContainer = document.querySelector('.subtasks-section .subtasks-list');
    if (!subtaskContainer) return;

    subtaskContainer.innerHTML = generateUpdatedSubtaskHTML(task, category);
}

/**
 * Generates the HTML for the subtask section.
 * @param {object} task - The task object containing subtasks.
 * @param {string} category - The category of the task.
 * @returns {string} The generated HTML for the subtask section.
 */
function generateUpdatedSubtaskHTML(task, category) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return '<div>No subtasks available</div>';
    }

    return task.subtasks.map((subtask, index) => /*HTML*/`
        <div id="subtaskDiv_${index}" class="subtask-item">
            <span class="editSubtaskText">${subtask.text}</span>
            <div class="subtask-icons">
                <img class="editSubtask" src="../Assets/addTask/Property 1=edit.svg" 
                     alt="Edit" onclick="editSubtaskEdit('${task.id}', '${category}', ${index})">
                <div class="seperatorSubtaskIcons"></div>
                <img class="deleteSubtask" src="../Assets/addTask/Property 1=delete.svg" 
                     alt="Delete" onclick="deleteSubtaskOnBoard('${task.id}', '${category}', ${index})">
            </div>
        </div>
    `).join('');
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
}