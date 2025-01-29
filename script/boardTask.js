/**
 * Finds a task in the local task data by its ID.
 * @param {string} taskId - The ID of the task to find.
 * @returns {Object|null} - The task object if found, otherwise null.
 */
function findTaskInData(taskId) {
    for (let category in taskData) {
        if (taskData[category][taskId]) {
            return taskData[category][taskId];
        }
    }
    return null;
}


/**
 * Calculates the progress of subtasks.
 * @param {Array} subtasks - The list of subtasks.
 * @returns {object} - An object containing completed and total subtasks.
 */
function calculateSubtaskProgress(subtasks) {
    if (!Array.isArray(subtasks)) {
        return { completed: 0, total: 0 };
    }
    let completed = subtasks.filter(subtask => subtask.completed).length;
    let total = subtasks.length;
    return { completed, total };
}


/**
 * Gets CSS class based on task title.
 * @param {string} title - The title of the task.
 * @returns {string} - CSS class name.
 */
function getTaskClass(title) {
    if (title === "User Story") return "user-story";
    if (title === "Technical Task") return "technical-task";
    return "";
}


/**
 * Creates a mapping from contact names to IDs.
 * @param {Object} contacts - The contacts object.
 * @returns {Object} - A mapping of names to IDs.
 */
function createNameToIdMap(contacts) {
    let nameToIdMap = {};
    for (let contactId in contacts) {
        let contact = contacts[contactId];
        if (contact.name) {
            nameToIdMap[contact.name] = contactId;
        }
    }
    return nameToIdMap;
}


/**
 * Extracts the initials from a contact name.
 * @param {string} name - The full name of the contact.
 * @returns {string} - The initials of the contact.
 */
function getInitials(name) {
    if (!name || typeof name !== "string") {
        return "?";
    }
    let parts = name.split(" ");
    let initials = parts.map(part => part.charAt(0).toUpperCase()).join("");
    return initials.slice(0, 2);
}


/**
 * Renders a task with its details, including contacts, to the DOM.
 * @param {object} task - The task object containing task details and contacts.
 * @returns {Promise<void>} - Resolves when the task is rendered.
 */
async function renderTask(task) {
    let contactsHtml = task.contactsDetails
        .map(contact => `<div>${contact.name} (${contact.email})</div>`)
        .join("");
    document.getElementById(`task-${task.id}`).innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <div>Contacts: ${contactsHtml}</div>
    `;
}