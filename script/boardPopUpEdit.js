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
            ${generatePrioButtonsHTML(task.prio, "setPrioOverlay")}
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
        let subtaskHTML = createSubtaskElementHTMML(subtask.text, `subtaskDiv_${index}`, `subtaskUl_${index}`, `subtaskLi_${index}`);
        subtaskContainer.innerHTML += subtaskHTML;
    });
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