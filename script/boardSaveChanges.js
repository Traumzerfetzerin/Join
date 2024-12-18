/**
 * Retrieves the title input value.
 * @returns {string|null} - The title input value or null if not found.
 */
function getTitleInput() {
    let inputTitle = document.querySelector('#taskOverlay #task-title');
    let overlay = document.querySelector('#taskOverlay');
    console.log("Overlay content:", overlay?.innerHTML);

    if (!inputTitle) {
        console.error("Title input not found. Ensure the input element with ID 'task-title' exists within the task overlay container.");
        alert("Task title input is missing. Please check the overlay setup.");
        return null;
    }
    return inputTitle.value.trim();
}

/**
 * Retrieves the description input value.
 * @returns {string|null} - The description input value or null if not found.
 */
function getDescriptionInput() {
    let textareaDescription = document.querySelector('#taskOverlay #task-description');
    if (!textareaDescription) {
        console.error("Description input not found. Ensure the textarea with ID 'task-description' exists within the task overlay container.");
        alert("Task description input is missing. Please check the overlay setup.");
        return null;
    }
    return textareaDescription.value.trim();
}

/**
 * Retrieves the due date input value.
 * @returns {string|null} - The due date input value or null if not found.
 */
function getDueDateInput() {
    let dueDate = document.querySelector('#taskOverlay #task-due-date');
    if (!dueDate) {
        console.error("Due date input not found. Ensure the input element with ID 'task-due-date' exists within the task overlay container.");
        alert("Task due date input is missing. Please check the overlay setup.");
        return null;
    }
    return dueDate.value;
}

/**
 * Retrieves the priority value.
 * @returns {string|null} - The selected priority or null if not set.
 */
function getPriorityValue() {
    if (!selectedPrioBoard) {
        console.error("Priority not selected. Ensure a priority is set before saving the task.");
        alert("Task priority is missing. Please select a priority.");
        return null;
    }
    return selectedPrioBoard;
}

/**
 * Retrieves the subtasks as an array of objects.
 * @returns {Array} - An array of subtask objects.
 */
function getSubtasks() {
    let subtaskElements = document.querySelectorAll('#taskOverlay #subtasks-container div');
    if (!subtaskElements || subtaskElements.length === 0) {
        console.warn("No subtasks found.");
    }
    return Array.from(subtaskElements).map(subtaskElement => {
        let checkbox = subtaskElement.querySelector('input[type="checkbox"]');
        let textInput = subtaskElement.querySelector('input[type="text"]');
        if (checkbox && textInput) {
            return {
                text: textInput.value.trim(),
                completed: checkbox.checked
            };
        }
        console.error("Invalid subtask element:", subtaskElement);
        return null;
    }).filter(subtask => subtask !== null);
}

/**
 * Combines all input values into a task object.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @returns {object|null} - The combined task object or null if any input is invalid.
 */
function getUpdatedTask(taskId, category) {
    let title = getTitleInput();
    let description = getDescriptionInput();
    let dueDate = getDueDateInput();
    let priority = getPriorityValue();
    let subtasks = getSubtasks();

    if (!title || !description || !dueDate || !priority) {
        return null;
    }

    return {
        id: taskId,
        category: category,
        title: title,
        description: description,
        dueDate: dueDate,
        prio: priority,
        subtasks: subtasks
    };
}

/**
 * Saves changes to a task and updates Firebase.
 * @param {string} taskId - ID of the task being updated.
 * @param {string} category - Task category.
 */
async function saveChanges(taskId, category) {
    let updatedTask = getUpdatedTask(taskId, category);
    if (!updatedTask) return;

    try {
        await updateTaskInDatabase(category, taskId, updatedTask);
        console.log("Task successfully updated in Firebase:", updatedTask);

        // Update local data and refresh UI
        if (!taskData[category]) taskData[category] = {};
        taskData[category][taskId] = updatedTask;
        loadTasks(taskData);
        closeEditWindow();
    } catch (error) {
        console.error("Error saving task to Firebase:", error);
        alert("Failed to save task. Please try again.");
    }
}

/**
 * Updates a task in Firebase with new data from the overlay.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @param {object} newTaskData - The updated task data.
 */
async function updateTask(taskId, category, newTaskData) {
    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTaskData)
        });

        if (response.ok) {
            taskData[category][taskId] = newTaskData;
            loadTasks(taskData);
            refreshPageOrUpdateUI();
        } else {
            console.error(`Failed to update task with ID ${taskId}: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error updating task with ID ${taskId}:`, error);
    }
}
