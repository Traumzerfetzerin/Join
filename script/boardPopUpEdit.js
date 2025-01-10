/**
 * Prepares and enables the edit mode for a specific task.
 * @param {Object} task - Task object containing details.
 * @param {string} category - The category of the task.
 */
async function enableEditMode(task, category) {
    document.querySelector('.task-title').innerHTML = `<input type="text" id="edit-task-title" value="${task.title || ''}" />`;
    document.querySelector('.task-description').innerHTML = `<textarea id="edit-task-description">${task.description || ''}</textarea>`;
    document.querySelector('.task-info p:nth-child(1)').innerHTML = `<input type="date" id="edit-task-due-date" value="${task.dueDate || ''}" />`;
    document.querySelector('.task-info p:nth-child(2)').innerHTML = `
        <div id="prioOverlay">
            ${generatePrioButtonsHTML(task.prio, "setPrio", "Overlay")}
        </div>
    `;

    setTimeout(() => setPrio(task.prio, "overlay"), 0);

    let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
    let contactsData = await response.json();

    if (contactsData) {
        let allContacts = Object.keys(contactsData).map(key => ({ id: key, ...contactsData[key] }));
        updateContactDropdown(allContacts, task.contacts || []);
        syncContactIcons(task.contacts || []);
    }

    renderSubtasksInEditMode(task, category);

    document.querySelector('.action-links').innerHTML = `<button class="okButton" onclick="saveChanges('${task.id}', '${category}')">Ok ✓</button>`;
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


function loadTaskToOverlay(taskId, category) {
    let task = taskData[category][taskId];
    if (!task) {
        console.error("Task not found:", taskId, category);
        return;
    }

    console.log("Task contacts (names):", task.contacts);
    console.log("All contacts:", allContacts);

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
