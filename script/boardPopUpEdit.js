/**
 * Enables the edit mode for a specific task by populating the overlay with task details.
 * @param {Object} task - Task object containing details.
 * @param {string} category - The category of the task.
 */
async function enableEditMode(task, category) {
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskDueDate(task.dueDate);
    setTaskPriority(task.prio);

    setTimeout(() => setPrio(task.prio, "overlay"), 0);

    let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
    let contactsData = await response.json();

    if (contactsData) {
        let allContacts = Object.keys(contactsData).map(key => ({ id: key, ...contactsData[key] }));
        updateContactDropdown(allContacts, task.contacts || []);
        syncContactIcons(task.contacts || []);
    }

    renderSubtasksInEditMode(task, category);

    document.querySelector('.action-links').innerHTML = `
        <button class="okButton createButton cursorPointer" onclick="saveChanges('${task.id}', '${category}')">Ok ✓</button>
    `;
}

/**
 * Sets the task title in the overlay with proper styling.
 * @param {string} title - The title of the task.
 */
function setTaskTitle(title) {
    document.querySelector('.task-title').innerHTML = `
        <h3 class="overlay-heading">Title</h3>
        <input type="text" id="edit-task-title" value="${title || ''}" class="input-field" />
    `;
}

/**
 * Sets the task description in the overlay with proper styling.
 * @param {string} description - The description of the task.
 */
function setTaskDescription(description) {
    document.querySelector('.task-description').innerHTML = `
        <h3 class="overlay-heading">Description</h3>
        <textarea id="edit-task-description" class="input-field">${description || ''}</textarea>
    `;
}

/**
 * Sets the task due date in the overlay with proper styling.
 * @param {string} dueDate - The due date of the task.
 */
function setTaskDueDate(dueDate) {
    document.querySelector('.task-info p:nth-child(1)').innerHTML = `
        <h3 class="overlay-heading">Due date</h3>
        <input type="date" id="edit-task-due-date" value="${dueDate || ''}" class="input-field" />
    `;
}

/**
 * Sets the task priority in the overlay with proper styling.
 * @param {string} prio - The priority of the task.
 */
function setTaskPriority(prio) {
    document.querySelector('.task-info p:nth-child(2)').innerHTML = `
        <h3 class="overlay-heading">Priority</h3>
        <div id="prioOverlay" class="prio-buttons">
            ${generatePrioButtonsHTML(prio, "setPrio", "Overlay")}
        </div>
    `;
}

/**
 * Sets the subtasks section in the overlay.
 */
function setSubtasks() {
    document.querySelector('.subtasks-container').innerHTML = `
        <h3 class="overlay-heading">Subtasks:</h3>
        <input type="text" placeholder="Add new subtask" class="input-field" />
        <button class="add-subtask-btn">+</button>
    `;
}


/**
 * Sets the assigned contacts section in the overlay.
 */
function setAssignedTo() {
    document.querySelector('.dropdown-wrapper').insertAdjacentHTML('beforebegin', `
        <h3 class="overlay-heading">Assigned to</h3>
    `);
}


// CALCULATE DUE DATE OVERLAY
function calculateDueDateOverlay() {
    let dueDateOverlay = new Date();
    let formattedDateOverlay = dueDateOverlay.toISOString().split('T')[0];
    let dateInput = document.getElementById('editDueDate');
    if (dateInput) {
        dateInput.setAttribute('min', formattedDateOverlay);
    }
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
        let subtaskHTML = createSubtaskElementBoardHTML(subtask.text, `subtaskDiv_${index}`, `subtaskUl_${index}`, `subtaskLi_${index}`);
        subtaskContainer.innerHTML += subtaskHTML;
    });
}


function loadTaskToOverlay(taskId, category) {
    let task = taskData[category][taskId];
    if (!task) {
        console.error("Task not found:", taskId, category);
        return;
    }

    let contactDropdownHTML = generateContactDropdownHTML(allContacts, task.contacts || []);
    document.querySelector('#editAssignTaskDropdown').innerHTML = contactDropdownHTML;
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

/**
 * Directly closes the edit overlay without relying on an event.
 */
function closeEditOverlay() {
    let editOverlay = document.getElementById("edit-overlay");
    if (editOverlay) {
        editOverlay.remove();
    }
}
