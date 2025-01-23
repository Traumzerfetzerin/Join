/**
 * Enables the edit mode for a specific task by populating the overlay with task details.
 * @param {Object} task - Task object containing details.
 * @param {string} category - The category of the task.
 */
async function enableEditMode(task, category) {
    let overlayTitle = document.querySelector('.priority-title');
    if (overlayTitle) {
        overlayTitle.style.display = 'none';
    }

    if (!task || !task.dueDate) {
        console.error("Task data is missing or dueDate not found:", task);
        return;
    }

    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskDueDate(task.dueDate);
    setTaskPriority(task.prio);
    setTimeout(() => setPrio(task.prio, "overlay"), 200);

    let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
    let contactsData = await response.json();

    if (contactsData) {
        let allContacts = Object.keys(contactsData).map(key => ({ id: key, ...contactsData[key] }));
        updateContactDropdown(allContacts, task.contacts || []);
        syncContactIcons(task.contacts || []);
    }

    renderSubtasksInEditMode(task, category);

    document.querySelector('.action-links').style.display = 'none';
    document.querySelector('.okButtonOverlay').innerHTML = `
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

function setTaskDueDate(dueDate) {
    let dueContainer = document.querySelector('.due-date-container');
    if (dueContainer) {
        dueContainer.innerHTML = `
            <h3 class="overlay-heading">Due date</h3>
            <input type="date" id="edit-task-due-date" value="${dueDate || ''}" class="input-field" />
        `;
    } else {
        console.error("Due date container not found!");
    }
}


function setTaskPriority(prio) {
    let editPrioContainer = document.querySelector('#prioOverlayEdit');
    let normalPrioContainer = document.querySelector('#prioOverlay');

    if (editPrioContainer) {
        renderPrioButtons("#prioOverlayEdit", "overlay");
    }

    if (normalPrioContainer) {
        normalPrioContainer.innerHTML = `
            <img src="${getPrioIcon(prio)}" class="priority-icon" alt="Priority">
        `;
    }
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
        let subtaskHTML = createSubtaskElementHTML(subtask.text, `subtaskDiv_${index}`, `subtaskUl_${index}`, `subtaskLi_${index}`);
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


/**
 * Resets the priority buttons by removing selected state.
 */
function resetPriorityButtons() {
    prioOptions.forEach(option => {
        document.getElementById(option.class).classList.remove('active');
    });
    selectedPrio = null;
}

/**
 * Selects a priority option.
 * @param {string} prio - Selected priority level.
 */
function selectPriority(prio) {
    resetPriorityButtons();
    let selectedOption = prioOptions.find(option => option.class === prio);
    if (selectedOption) {
        document.getElementById(prio).classList.add('active');
        selectedPrio = prio;
    }
}