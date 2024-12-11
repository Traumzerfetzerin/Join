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
            console.log(`Task with ID ${taskId} deleted successfully.`);
            delete taskData[category][taskId];
            loadTasks(taskData);
            closeTaskOverlay();
        } else {
            console.error(`Failed to delete task with ID ${taskId}: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error deleting task with ID ${taskId}:`, error);
    }
}

/**
 * Enables edit mode for a specific task.
 * @param {string} taskId - The ID of the task to edit.
 * @param {string} category - The category of the task.
 */
function editTask(taskId, category) {
    let task = findTaskInData(taskId);
    if (!task) return;

    enableEditMode(task, category);
    renderSubtasksInEditMode(task); // Subtasks im Bearbeitungsmodus rendern
}

function enableEditMode(task, category) {
    let titleElement = document.querySelector('.task-title');
    titleElement.innerHTML = `<input type="text" id="editTitle" value="${task.title}" />`;

    let descriptionElement = document.querySelector('.task-description');
    descriptionElement.innerHTML = `<textarea id="editDescription">${task.description}</textarea>`;

    let dueDateElement = document.querySelector('.task-info p:nth-child(1)');
    dueDateElement.innerHTML = `<input type="date" id="editDueDate" value="${task.dueDate}" />`;

    let priorityElement = document.querySelector('.task-info p:nth-child(2)');
    priorityElement.innerHTML = `
        <div class="fonts font_2A3647">Prio</div>
        <div class="flex space-between">
            <button id="urgent" type="button" class="prioButton cursorPointer fonts"
                onclick="setPrio('urgent', event)">
                Urgent
                <img id="urgentSvg" src="../Assets/addTask/Prio alta.svg" alt="">
            </button>

            <button id="medium" type="button" class="prioButton cursorPointer fonts mediumWhite"
                onclick="setPrio('medium', event)">
                Medium
                <img id="mediumSvg" src="../Assets/addTask/Prio media white.svg" alt="">
            </button>

            <button id="low" type="button" class="prioButton cursorPointer fonts"
                onclick="setPrio('low', event)">
                Low
                <img id="lowSvg" src="../Assets/addTask/Prio baja.svg" alt="">
            </button>
        </div>
    `;

    setTimeout(() => {
        setPrio(task.prio);
    }, 0);

    let actionLinks = document.querySelector('.action-links');
    actionLinks.innerHTML = `
        <button onclick="saveChanges('${task.id}', '${category}')">Save Changes</button>
        <button onclick="cancelEdit()">Cancel</button>
    `;
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
 * Fills the subtasks in the edit overlay.
 * @param {Array} subtasks - The subtasks of the task.
 */
function fillSubtasks(subtasks) {
    let subtaskContainer = document.getElementById('editSubtasks');
    subtaskContainer.innerHTML = '';

    subtasks.forEach((subtask, index) => {
        let subtaskHTML = createSubtaskElementHTMML(subtask.text, `subtaskDiv_${index}`, `subtaskUl_${index}`, `subtaskLi_${index}`);
        subtaskContainer.innerHTML += subtaskHTML;
    });
}

/**
 * Renders the subtasks in edit mode with inputs and checkboxes.
 * @param {object} task - The task object containing subtasks.
 */
function renderSubtasksInEditMode(task) {
    let subtaskContainer = document.querySelector('.subtasks-section .subtasks-list');
    if (!subtaskContainer) return;

    subtaskContainer.innerHTML = '';

    subtaskContainer.innerHTML += `
        <div class="input-with-icon" id="inputSubtask">
            <input type="text" id="newSubtaskInput" placeholder="Add new subtask" class="add-task-title">
            <img id="addSubtaskButton" class="subtaskImg cursorPointer" 
                src="../Assets/addTask/Property 1=add.svg" alt="Add" onclick="addNewSubtask()">
        </div>
    `;
    task.subtasks.forEach((subtask, index) => {
        let subtaskHTML = `
            <div class="space-between createdSubtask">
                <input type="text" value="${subtask.text}" 
                    class="editSubtaskInput" data-index="${index}">
                <div class="flex">
                    <img class="deleteSubtask subtaskImg cursorPointer" 
                        src="../Assets/addTask/Property 1=delete.svg" 
                        alt="Delete" onclick="deleteSubtask('subtaskDiv_${index}')">
                </div>
            </div>
        `;
        subtaskContainer.innerHTML += subtaskHTML;
    });
}


/**
 * Adds a new subtask in the edit mode with the correct style.
 */
function addNewSubtask() {
    let newSubtaskInput = document.getElementById('newSubtaskInput');
    let subtaskText = newSubtaskInput.value.trim();
    if (subtaskText === "") return;

    let subtaskContainer = document.querySelector('.subtasks-section .subtasks-list');
    let subtaskHTML = `
        <div class="subtask-item space-between">
            <span contenteditable="true" class="editSubtaskText">${subtaskText}</span>
        </div>
    `;
    subtaskContainer.innerHTML += subtaskHTML;
    newSubtaskInput.value = "";
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
 * Extracts updated task data from the edit form.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @returns {Object} - The updated task data.
 */
function getUpdatedTask(taskId, category) {
    return {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        dueDate: document.getElementById('editDueDate').value,
        prio: document.getElementById('editPriority').value,
        contacts: taskData[category][taskId].contacts,
        subtasks: taskData[category][taskId].subtasks,
    };
}

/**
 * Updates the task in the Firebase database.
 * @param {string} category - The category of the task.
 * @param {string} taskId - The ID of the task.
 * @param {Object} updatedTask - The updated task data.
 * @returns {Promise<void>}
 */
async function updateTaskInDatabase(category, taskId, updatedTask) {
    try {
        await fetch(`${TASK_URL}/${category}/${taskId}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask),
        });
    } catch (error) {
        console.error("Error updating task in database:", error);
        throw error;
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

/**
 * Saves changes made to the task in edit mode, including updated subtasks.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 */
async function saveChanges(taskId, category) {
    let updatedTask = getUpdatedTask(taskId, category);

    let subtaskInputs = document.querySelectorAll('.editSubtaskInput');
    updatedTask.subtasks = Array.from(subtaskInputs).map(input => ({
        text: input.value.trim(),
        completed: input.previousElementSibling.checked
    }));

    await updateTaskInDatabase(category, taskId, updatedTask);
    finalizeTaskUpdate(updatedTask, category, taskId);
}


/**
 * Cancels edit mode and reloads the original task data in the overlay.
 */
function cancelEdit() {
    let overlay = document.querySelector('.board-overlay');
    let taskId = overlay.getAttribute('data-task-id');
    let category = document.querySelector('.task-category').textContent.trim();
    showTaskOverlay(category, taskId);
}
