/**
 * Enables editing of a subtask in edit mode.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @param {number} subtaskIndex - The index of the subtask to edit.
 */
function editSubtaskEdit(taskId, category, subtaskIndex) {
    let subtaskElement = document.getElementById(`subtaskDiv_${subtaskIndex}`);
    if (!subtaskElement) {
        console.error("Subtask element not found.");
        return;
    }

    let currentText = subtaskElement.querySelector('.editSubtaskText').innerText;
    let existingInput = document.getElementById(`editSubtaskInput_${subtaskIndex}`);
    
    if (!existingInput) {
        let inputHtml = `
            <input type="text" id="editSubtaskInput_${subtaskIndex}" class="edit-subtask-input" value="${currentText}" 
                   onblur="saveSubtaskEdit('${taskId}', '${category}', ${subtaskIndex})">
            <button class="save-subtask-button" onclick="saveSubtaskEdit('${taskId}', '${category}', ${subtaskIndex})">Save</button>
        `;
        subtaskElement.innerHTML += inputHtml;
    } else {
        existingInput.value = currentText;
        existingInput.style.display = 'block';
        existingInput.nextElementSibling.style.display = 'inline-block'; // Show the save button
    }

    subtaskElement.querySelector('.editSubtaskText').style.display = 'none';
    subtaskElement.querySelector('.subtask-icons').style.display = 'none';
    subtaskElement.classList.add('editing');
}

/**
 * Saves the changes to a subtask in edit mode.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @param {number} subtaskIndex - The index of the subtask to save.
 */
async function saveSubtaskEdit(taskId, category, subtaskIndex) {
    let inputField = document.getElementById(`editSubtaskInput_${subtaskIndex}`);
    if (!inputField) {
        console.error("Input field not found.");
        return;
    }

    let newText = inputField.value.trim();
    let subtaskElement = document.getElementById(`subtaskDiv_${subtaskIndex}`);
    let subtaskTextElement = subtaskElement.querySelector('.editSubtaskText');

    subtaskTextElement.innerText = newText;
    subtaskTextElement.style.display = 'block';
    subtaskElement.querySelector('.subtask-icons').style.display = 'flex';

    inputField.style.display = 'none';
    inputField.nextElementSibling.style.display = 'none';
    subtaskElement.classList.remove('editing');

    let task = await fetchTaskById(category, taskId);
    if (!task || !Array.isArray(task.subtasks)) {
        console.error("Task or subtasks not found.");
        return;
    }
    task.subtasks[subtaskIndex].text = newText;

    try {
        await updateTaskInDatabase(category, taskId, task);
        console.log(`Subtask ${subtaskIndex} updated successfully.`);
    } catch (error) {
        console.error("Error saving subtask to Firebase:", error);
    }
}

/**
 * Syncs contact icons in the overlay with the task details.
 * @param {Array} contactIds - An array of contact IDs.
 * @returns {Promise<void>}
 */
async function syncContactIcons(contactIds) {
    if (!contactIds || contactIds.length === 0) {
        return;
    }

    if (typeof contactIds[0] === 'object') {
        contactIds = contactIds.map(contact => contact.id || contact.name);
    }

    try {
        let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
        let contactsData = await response.json();

        if (contactsData) {
            let contacts = Object.keys(contactsData).map(key => ({
                id: key,
                ...contactsData[key],
            }));

            let assignedContacts = contacts.filter(contact => contactIds.includes(contact.id) || contactIds.includes(contact.name));

            let contactIconsContainer = document.getElementById('contact-icons-container');
            if (contactIconsContainer) {
                contactIconsContainer.innerHTML = assignedContacts
                    .map(contact => {
                        let initials = contact.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
                        let bgColor = contact.color || getRandomColor();
                        return `
                            <div class="contact-icon" style="background-color: ${bgColor};">
                                ${initials}
                            </div>
                        `;
                    })
                    .join('');
            }
        } else {
            console.error("Failed to fetch contacts from Firebase.");
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}

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
    renderAddTaskPrioButtons();

    if (task.contacts && task.contacts.length > 0) {
        syncContactIcons(task.contacts);
    } else {
        console.error("No contacts found for the task.");
    }
}

/**
 * Updates the dropdown with all contacts and ensures icons are displayed.
 * @param {Array} allContacts - Array of all contact objects.
 * @param {Array} assignedContactIds - Array of assigned contact objects or IDs.
 */
function updateContactDropdown(allContacts, assignedContactIds) {
    let dropdownContainer = document.querySelector('.contacts-section');

    if (!dropdownContainer) {
        console.error("Dropdown container not found.");
        return;
    }
    if (typeof assignedContactIds[0] === 'object') {
        assignedContactIds = assignedContactIds.map(contact => contact.id);
    }

    let assignedContacts = allContacts.filter(contact => assignedContactIds.includes(contact.id));
    dropdownContainer.innerHTML = `
        <strong>Assigned To:</strong>
        <div class="dropdown-header" onclick="toggleEditDropdown()">
            <input type="text" id="editAssignedTo" placeholder="Selected contacts to assign" readonly>
            <span class="dropdown-arrow">▼</span>
        </div>
        <div id="editAssignTaskDropdown" class="dropdown-container dNone">
            ${allContacts.map(contact => `
                <div class="dropdown-entry">
                    <label>
                        <input type="checkbox" value="${contact.id}" ${assignedContactIds.includes(contact.id) ? 'checked' : ''}>
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


function updateContactIcons(assignedContacts) {
    let contactIconsContainer = document.getElementById('contact-icons-container');
    if (!contactIconsContainer) {
        console.error("contact-icons-container not found");
        return;
    }

    contactIconsContainer.innerHTML = assignedContacts
        .map(contact => `
            <div class="contact-icon" style="background-color: ${getRandomColor()};">
                ${contact.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}
            </div>
        `)
        .join('');
}


// CALCULATE DUE DATE OVERLAY
function calculateDueDateOverlay() {
    let dueDateOverlay = new Date(); // Korrigierter Variablenname
    let formattedDateOverlay = dueDateOverlay.toISOString().split('T')[0];
    const dateInput = document.getElementById('editDueDate');
    if (dateInput) {
        dateInput.setAttribute('min', formattedDateOverlay);
    }
}

/**
 * Enables edit mode for a task, including contacts and subtasks.
 * @param {Object} task - Task object containing details.
 * @param {string} category - The category of the task.
 */
async function enableEditMode(task, category) {
    let titleElement = document.querySelector('.task-title');
    titleElement.innerHTML = `<input type="text" id="editTitle" value="${task.title}" />`;

    let descriptionElement = document.querySelector('.task-description');
    descriptionElement.innerHTML = `<textarea id="editDescription">${task.description}</textarea>`;

    let dueDateElement = document.querySelector('.task-info p:nth-child(1)');
    dueDateElement.innerHTML = `<input type="date" id="editDueDate" onclick="calculateDueDateOverlay()" value="${task.dueDate || ''}"/>`;

    let priorityElement = document.querySelector('.task-info p:nth-child(2)');
    priorityElement.innerHTML = `
        <div class="fonts font_2A3647"></div>
        <div class="flex space-between">
            ${generatePrioButtonsHTML(task.prio, "setPrio")}
        </div>
    `;

    setTimeout(() => {
        setPrio(task.prio);
    }, 0);

    let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
    let contactsData = await response.json();

    if (contactsData) {
        let allContacts = Object.keys(contactsData).map(key => ({ id: key, ...contactsData[key] }));
        updateContactDropdown(allContacts, task.contacts || []);
        syncContactIcons(task.contacts || []);
    } else {
        console.error("Failed to fetch contacts from Firebase.");
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

/**
 * Renders the subtasks in edit mode.
 * @param {Object} task - The task containing the subtasks.
 * @param {string} category - The category of the task.
 */
function renderSubtasksInEditMode(task, category) {
    let subtaskContainer = document.querySelector('.subtasks-section .subtasks-list');
    if (!subtaskContainer) return;

    subtaskContainer.innerHTML = `
        <input type="text" id="newSubtaskInput" placeholder="Add new subtask" autocomplete="off">
        <img id="addSubtaskButton" class="subtaskImg cursorPointer" src="../Assets/addTask/Property 1=add.svg" alt="Add" onclick="addNewSubtask('${task.id}', '${category}')">
    `;

    if (!Array.isArray(task.subtasks) || task.subtasks.length === 0) {
        subtaskContainer.innerHTML += "<div>No subtasks available</div>";
    } else {
        task.subtasks.forEach((subtask, index) => {
            let subtaskHTML = `
                <div id="subtaskDiv_${index}" class="subtask-item">
                    <span class="editSubtaskText" contenteditable="true">${subtask.text}</span>
                    <div class="subtask-icons">
                        <img class="editSubtask" src="../Assets/addTask/Property 1=edit.svg" 
                             alt="Edit" onclick="editSubtaskEdit('${task.id}', '${category}', ${index})">
                        <img class="deleteSubtask" src="../Assets/addTask/Property 1=delete.svg" 
                             alt="Delete" onclick="deleteSubtaskEdit('${task.id}', '${category}', ${index})">
                    </div>
                </div>
            `;
            subtaskContainer.innerHTML += subtaskHTML;
        });
    }
}

/**
 * Adds a new subtask to the list in edit mode.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 */
function addNewSubtask(taskId, category) {
    let newSubtaskInput = document.getElementById('newSubtaskInput');
    let subtaskText = newSubtaskInput.value.trim();
    if (subtaskText === "") return;

    let subtaskContainer = document.querySelector('.subtasks-list');
    let subtaskIndex = subtaskContainer.querySelectorAll('.subtask-item').length;
    let subtaskHTML = `
        <div id="subtaskDiv_${subtaskIndex}" class="subtask-item">
            <span contenteditable="true" class="editSubtaskText">${subtaskText}</span>
            <div class="subtask-icons">
                <img class="editSubtask" src="../Assets/addTask/Property 1=edit.svg" 
                     alt="Edit" onclick="editSubtaskEdit('${taskId}', '${category}', ${subtaskIndex}')">
                <img class="deleteSubtask" src="../Assets/addTask/Property 1=delete.svg" 
                     alt="Delete" onclick="deleteSubtaskEdit('${taskId}', '${category}', ${subtaskIndex}')">
            </div>
        </div>
    `;
    subtaskContainer.insertAdjacentHTML('beforeend', subtaskHTML);
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
 * Loads the task data into the edit overlay for modifications.
 * @param {string} taskId - The ID of the task to edit.
 * @param {string} category - The category of the task.
 */
function loadTaskToOverlay(taskId, category) {
    let task = taskData[category][taskId];
    if (!task) return;

    document.getElementById('task-title').value = task.title || '';
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-due-date').value = task.dueDate || '';

    initializePrioButtons(task.prio);

    let subtasksContainer = document.getElementById('subtasks-container');
    let subtasksHTML = '';
    if (Array.isArray(task.subtasks)) {
        task.subtasks.forEach((subtask, index) => {
            subtasksHTML += `
                <div>
                    <input type="checkbox" ${subtask.completed ? 'checked' : ''} data-index="${index}">
                    <input type="text" value="${subtask.text || ''}" data-index="${index}">
                </div>
            `;
        });
    }
    subtasksContainer.innerHTML = subtasksHTML;
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

    closeTaskOverlay();
}

/**
 * Refreshes the page or updates the UI dynamically.
 */
function refreshPageOrUpdateUI() {
    location.reload();
}