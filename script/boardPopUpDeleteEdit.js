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

/**
 * Enables edit mode for a task, including the contact dropdown.
 * @param {Object} task - Task object containing details.
 * @param {string} category - Category of the task.
 */
async function enableEditMode(task, category) {
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

    let dropdownContainer = document.querySelector('.contacts-section');
    let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
    let contactsData = await response.json();
    
    if (contactsData) {
        let contacts = Object.keys(contactsData).map(key => ({ id: key, ...contactsData[key] }));
    
        // Beispiel: IDs der zugewiesenen Kontakte aus der Task-Datenstruktur
        let taskAssignedContactIds = ["-OBq_I3OeuDlef4x9a-Q", "-OBvubxH3L5O2-rdee4J"]; // IDs von KH und BG
    
        // Zu den IDs passende Kontakte filtern
        let assignedContacts = contacts.filter(contact => taskAssignedContactIds.includes(contact.id));
    
        dropdownContainer.innerHTML = `
        <strong>Assigned To:</strong>
        <div class="dropdown-header" onclick="toggleEditDropdown()">
            <input type="text" id="editAssignedTo" placeholder="Selected contacts to assign" readonly>
            <span class="dropdown-arrow">▼</span>
        </div>
        <div id="editAssignTaskDropdown" class="dropdown-container dNone">
            ${contacts.map(contact => `
                <div class="dropdown-entry">
                    <label>
                        <input type="checkbox" value="${contact.id}">
                        ${contact.name}
                    </label>
                </div>
            `).join('')}
        </div>
        <div id="contact-icons-container" class="contact-icons">
            ${assignedContacts.map(contact => `
                <div class="contact-icon" style="background-color: ${getRandomColor()};">
                    ${contact.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}
                </div>
            `).join('')}
        </div>
    `;
    }
    
    

    let actionLinks = document.querySelector('.action-links');
    actionLinks.innerHTML = `
        <button class="okButton" onclick="saveChanges('${task.id}', '${category}')">Ok ✓</button>
    `;
}

/**
 * Toggles the visibility of the contact dropdown and the icons.
 */
function toggleEditDropdown() {
    let dropdown = document.getElementById('editAssignTaskDropdown');
    let vanishIcons = document.getElementById('contact-icons-container');
    dropdown.classList.toggle('dNone');
    vanishIcons.classList.toggle('dNone');
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
 * Displays assigned contacts as icons below the dropdown.
 * @param {Array} assignedContacts - Array of contacts assigned to the task.
 */
function displayAssignedContacts(assignedContacts) {
    let container = document.getElementById("contact-icons-container");
    container.innerHTML = "";
    let iconsHTML = assignedContacts.map(contact => {
        return `<div class="contact-icon" style="background-color: ${contact.color};">
                    ${contact.initials}
                </div>`;
    }).join("");
    container.innerHTML = iconsHTML;
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
            <div class="subtask-item">
                <span contenteditable="true" class="editSubtaskText">${subtask.text}</span>
                <div class="subtask-icons">
                    <img class="editSubtask" src="../Assets/addTask/Property 1=edit.svg" 
                         alt="Edit" onclick="editSubtask('${index}')">
                    <img class="deleteSubtask" src="../Assets/addTask/Property 1=delete.svg" 
                         alt="Delete" onclick="deleteSubtask('${index}')">
                </div>
            </div>
        `;
        subtaskContainer.innerHTML += subtaskHTML;
    });
}



function addNewSubtask() {
    let newSubtaskInput = document.getElementById('newSubtaskInput');
    let subtaskText = newSubtaskInput.value.trim();
    if (subtaskText === "") return;

    let subtaskContainer = document.querySelector('.subtasks-section .subtasks-list');
    let subtaskHTML = `
        <div class="subtask-item">
            <span contenteditable="true" class="editSubtaskText">${subtaskText}</span>
            <div class="subtask-icons">
                <img class="editSubtask" src="../Assets/addTask/Property 1=edit.svg" 
                     alt="Edit" onclick="editSubtask('${subtaskText}')">
                <img class="deleteSubtask" src="../Assets/addTask/Property 1=delete.svg" 
                     alt="Delete" onclick="deleteSubtask('${subtaskText}')">
            </div>
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
 * Retrieves updated task details from the form inputs.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @returns {object} - The updated task object containing the new details.
 */
function getUpdatedTask(taskId, category) {
    let updatedTask = {
        id: taskId, 
        category: category, 
    };

    let inputTitle = document.getElementById('inputTitle');
    updatedTask.title = inputTitle ? inputTitle.value.trim() : "";

    let textareaDescription = document.getElementById('textareaDescription');
    updatedTask.description = textareaDescription ? textareaDescription.value.trim() : "";

    let dueDate = document.getElementById('dueDate');
    updatedTask.dueDate = dueDate ? dueDate.value : "";

    let priorityButtons = document.querySelectorAll('.prioButton.active');
    updatedTask.prio = priorityButtons.length > 0 ? priorityButtons[0].id : "";

    return updatedTask;
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
 * Saves changes made to the task in edit mode, updates the overlay with the changes, and closes the edit window.
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
    updateOverlayContent(category, updatedTask);
    closeEditWindow();
}

/**
 * Closes the edit window and resets any temporary states.
 */
function closeEditWindow() {
    let editWindow = document.querySelector('.edit-window');
    if (editWindow) {
        editWindow.classList.add('d-none');
    }

    let overlay = document.getElementById('taskOverlay');
    if (overlay) {
        overlay.classList.remove('d-none');
    }
}

/**
 * Updates the overlay content with the task details.
 * @param {string} category - The category of the task.
 * @param {object} task - The task object with updated details.
 */
function updateOverlayContent(category, task) {
    let overlayHtml = getBoardOverlayTemplate(category, task);
    let overlayDetails = document.getElementById('overlayDetails');
    if (overlayDetails) {
        overlayDetails.innerHTML = overlayHtml;
    }
}

/**
 * Refreshes the page or updates the UI dynamically.
 */
function refreshPageOrUpdateUI() {
    location.reload(); 
}