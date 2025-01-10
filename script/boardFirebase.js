let TASK_URL = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks";

/**
 * Saves a task to a specified category in the database.
 * @param {string} taskId - The ID of the task to save.
 * @param {string} category - The category where the task should be saved.
 * @param {object} taskData - The task data to save.
 * @returns {Promise<void>}
 */
async function saveTaskToCategory(taskId, category, taskData) {
    try {
        prepareTaskData(taskId, taskData);
        let response = await sendTaskToDatabase(taskId, category, taskData);
        validateResponse(response);
    } catch (error) {
        console.error("Error saving task to category:", error);
    }
}

/**
 * Prepares the task data for saving by ensuring subtasks and contacts are valid.
 * @param {string} taskId - The ID of the task.
 * @param {object} taskData - The task data to prepare.
 */
function prepareTaskData(taskId, taskData) {
    if (!taskData.subtasks || !Array.isArray(taskData.subtasks)) {
        console.warn(`Task ${taskId} has no subtasks or invalid subtasks.`);
        taskData.subtasks = [];
    }
    if (Array.isArray(taskData.contacts)) {
        taskData.contacts = taskData.contacts.map(contact => contact.name || contact.id || contact);
    }
}

/**
 * Sends the task data to the database.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category where the task should be saved.
 * @param {object} taskData - The task data to save.
 * @returns {Promise<Response>} The response from the database.
 */
async function sendTaskToDatabase(taskId, category, taskData) {
    return await fetch(
        `${TASK_URL}/${encodeURIComponent(category)}/${encodeURIComponent(taskId)}.json`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
        }
    );
}

/**
 * Validates the response from the database.
 * @param {Response} response - The response from the database.
 * @throws {Error} If the response is not OK.
 */
function validateResponse(response) {
    if (!response.ok) {
        throw new Error(`Failed to save task: ${response.statusText}`);
    }
}


/**
 * Fetches tasks from Firebase.
 * @param {string} [category] - Optional. Task category.
 * @param {string} [taskId] - Optional. Task ID.
 * @returns {Object|null} - The task object or all tasks, or null if not found.
 */
async function fetchTasks(category, taskId) {
    try {
        let allContacts = await fetchAllContacts();
        let nameToIdMap = createNameToIdMap(allContacts);

        if (category && taskId) {
            return await fetchSingleTask(category, taskId, nameToIdMap);
        } else {
            return await fetchAllTasks(nameToIdMap);
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return null;
    }
}

/**
 * Fetches a single task from Firebase by category and task ID.
 * @param {string} category - Task category.
 * @param {string} taskId - Task ID.
 * @param {Object} nameToIdMap - Map of contact names to IDs.
 * @returns {Object|null} - The task object or null if not found.
 */
async function fetchSingleTask(category, taskId, nameToIdMap) {
    let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`);
    let task = await response.json();
    if (!task) {
        alert("Task not found!");
        return null;
    }
    task.id = taskId;

    if (task.contacts) {
        task.contacts = await fetchTaskContacts(task.contacts, nameToIdMap);
    }

    return task;
}

/**
 * Fetches all tasks from Firebase and processes their contacts.
 * @param {Object} nameToIdMap - Map of contact names to IDs.
 * @returns {Object|null} - All tasks or null if none found.
 */
async function fetchAllTasks(nameToIdMap) {
    let response = await fetch(`${TASK_URL}.json`);
    let data = await response.json();

    if (data) {
        for (let category in data) {
            for (let taskId in data[category]) {
                let task = data[category][taskId];
                task.id = taskId;

                if (task.contacts) {
                    task.contacts = await fetchTaskContacts(task.contacts, nameToIdMap);
                }
            }
        }
        taskData = data;
        loadTasks(data);

        return data;
    } else {
        console.log("No tasks found.");
        return null;
    }
}

/**
 * Fetches contact details for an array of contact identifiers.
 * @param {Array} contacts - Array of contact names or IDs.
 * @param {Object} nameToIdMap - Map of contact names to IDs.
 * @returns {Promise<Array>} - An array of resolved contact objects.
 */
async function fetchTaskContacts(contacts, nameToIdMap) {
    return await Promise.all(
        contacts.map(async (contactNameOrId) => {
            let contactId = nameToIdMap[contactNameOrId] || contactNameOrId;
            return await fetchContactFromFirebase(contactId);
        })
    );
}


/**
 * Deletes a task from Firebase.
 * @param {string} taskId - The ID of the task to delete.
 * @param {string} category - The current category of the task.
 * @returns {Promise<void>}
 */
async function deleteTaskFromCategory(taskId, category) {
    if (!category || !taskId) {
        console.error("Invalid category or task ID for deletion.");
        return;
    }

    try {
        let url = `${TASK_URL}/${encodeURIComponent(category)}/${taskId}.json`;
        let response = await fetch(url, { method: "DELETE" });

        if (!response.ok) {
            throw new Error(`Failed to delete task with ID ${taskId}: ${response.statusText}`);
        }

        console.log(`Task with ID ${taskId} deleted successfully.`);
    } catch (error) {
        console.error("Error while deleting task:", error);
    }
}


/**
 * Fetches all contacts from the Firebase database.
 * @returns {Promise<Object>} - The contacts object or an empty object if an error occurs.
 */
async function fetchAllContacts() {
    try {
        let response = await fetch("https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json");
        let contacts = await response.json();
        return contacts || {};
    } catch (error) {
        console.error("Error fetching all contacts:", error);
        return {};
    }
}


/**
 * Fetches a single task by its category and ID.
 * @param {string} category - Task category.
 * @param {string} taskId - Task ID.
 * @returns {Object|null} - The task object if found, otherwise null.
 */
async function fetchTaskById(category, taskId) {
    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`);
        let task = await response.json();
        if (!task) {
            console.error(`Task with ID ${taskId} not found!`);
            return null;
        }

        let allContacts = await fetchAllContacts();
        let nameToIdMap = createNameToIdMap(allContacts);

        if (task.contacts) {
            task.contacts = await Promise.all(
                task.contacts.map(async (contactNameOrId) => {
                    let contactId = nameToIdMap[contactNameOrId] || contactNameOrId;
                    let contact = await fetchContactFromFirebase(contactId);
                    return contact;
                })
            );
        }

        return task;
    } catch (error) {
        console.error("Error fetching task by ID:", error);
        return null;
    }
}


/**
 * Aktualisiert einen Subtask in Firebase.
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {string} category - Die Kategorie der Aufgabe.
 * @param {number} subtaskIndex - Der Index des zu aktualisierenden Subtasks.
 * @param {string} newText - Der neue Text des Subtasks.
 */
async function updateSubtaskInFirebase(taskId, category, subtaskIndex, newText) {
    try {
        let task = await fetchTaskById(category, taskId);
        if (!task) return;

        if (task.subtasks && task.subtasks[subtaskIndex]) {
            task.subtasks[subtaskIndex].text = newText;

            await saveTaskToCategory(taskId, category, task);
            console.log(`Subtask ${subtaskIndex} erfolgreich aktualisiert.`);
        } else {
            console.error("Subtask nicht gefunden.");
        }
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Subtasks:", error);
    }
}


/**
 * Löscht einen Subtask aus Firebase.
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {string} category - Die Kategorie der Aufgabe.
 * @param {number} subtaskIndex - Der Index des zu löschenden Subtasks.
 */
async function deleteSubtaskFromFirebase(taskId, category, subtaskIndex) {
    try {
        let task = await fetchTaskById(category, taskId);
        if (!task) return;

        if (task.subtasks && task.subtasks[subtaskIndex]) {
            task.subtasks.splice(subtaskIndex, 1); // Entfernt den Subtask aus der Liste

            await saveTaskToCategory(taskId, category, task);
            console.log(`Subtask ${subtaskIndex} erfolgreich gelöscht.`);
        } else {
            console.error("Subtask nicht gefunden.");
        }
    } catch (error) {
        console.error("Fehler beim Löschen des Subtasks:", error);
    }
}


/**
 * Updates the task in the Firebase database.
 * @param {string} category - Task category.
 * @param {string} taskId - ID of the task.
 * @param {object} updatedTask - Updated task data.
 */
async function updateTaskInDatabase(category, taskId, updatedTask) {
    console.log("Updated Task:", updatedTask);
    let url = `https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${category}/${taskId}.json`;
    let response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
    });

    if (!response.ok) {
        throw new Error(`Failed to update task in Firebase: ${response.statusText}`);
    }

    return response.json();
}