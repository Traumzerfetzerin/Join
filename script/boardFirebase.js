let TASK_URL = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks";
let allContacts = [];


/**
 * Saves a task to a specified category in the database.
 * @param {string} taskId - The ID of the task to save.
 * @param {string} category - The category where the task should be saved.
 * @param {object} taskData - The task data to save.
 * @returns {Promise<void>}
 */
async function saveTaskToCategory(taskId, category, taskData) {
    prepareTaskData(taskId, taskData);
    await sendTaskToDatabase(taskId, category, taskData);
}


/**
 * Prepares the task data for saving by ensuring only contact IDs are stored.
 * @param {string} taskId - The ID of the task.
 * @param {object} taskData - The task data to prepare.
 */
function prepareTaskData(taskId, taskData) {
    if (!taskData.subtasks || !Array.isArray(taskData.subtasks)) {
        taskData.subtasks = [];
    }

    if (!taskData.contacts || !Array.isArray(taskData.contacts)) {
        taskData.contacts = [];
        return;
    }

    taskData.contacts = taskData.contacts.map(contact => contact.id || contact);
}


/**
 * Converts contact IDs back to full contact objects.
 * @param {Array} contactIds - Array of contact IDs or objects.
 * @param {Array} allContacts - Array of all available contacts.
 * @returns {Array} - Array of full contact objects.
 */
function getFullContacts(contactIds, allContacts) {
    if (!contactIds || !Array.isArray(contactIds)) return [];
    
    return contactIds.map(contact => {
        if (typeof contact === "string") {
            let fullContact = allContacts.find(c => c.id === contact);
            return fullContact ? fullContact : { id: contact, name: "Unknown" };
        }
        return contact;
    });
}


/**
 * Retrieves a contact by ID from the Firebase database.
 * @param {string} contactId - The ID of the contact.
 * @returns {Promise<object|null>} - A promise resolving to the contact object or null if not found.
 */
async function getContactById(contactId) {
    try {
        let response = await fetch(`https://<your-database-url>/contacts/${contactId}.json`);
        if (response.ok) {
            let contact = await response.json();
            return contact || null;
        } else {
            console.warn(`Contact with ID ${contactId} not found.`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching contact from database:", error);
        return null;
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
 * Fetches all tasks or a specific task from Firebase.
 * @param {string} [category] - Optional. Task category to fetch a specific task.
 * @param {string} [taskId] - Optional. Task ID to fetch a specific task.
 * @returns {Promise<Object|null>} - The task object or all tasks, or null if not found.
 */
async function fetchTasks(category, taskId) {
    try {
        let allContacts = await fetchAllContacts();
        let nameToIdMap = createNameToIdMap(allContacts);

        let tasks;
        if (category && taskId) {
            tasks = await fetchSingleTask(category, taskId, nameToIdMap);
        } else {
            tasks = await fetchAllTasks(nameToIdMap);
        }

        return tasks || null;
    } catch (error) {
        console.error("Error fetching tasks:", error.message, error.stack);
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
    } catch (error) {
        console.error("Error while deleting task:", error);
    }
}


/**
 * Fetches all contacts from the Firebase database and processes the data.
 * 
 * @async
 * @function fetchAllContacts
 * @throws Will throw an error if the fetch request fails.
 * @returns {Promise<void>} Resolves when all contacts are successfully fetched and processed.
 */
async function fetchAllContacts() {
    try {
        let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
        if (!response.ok) throw new Error('Failed to fetch contacts');
        let contactsData = await response.json();

        allContacts = Object.keys(contactsData).map(key => ({
            id: key,
            ...contactsData[key]
        }));

    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}


/**
 * Fetches a single task by its category and ID.
 * @param {string} category - Task category.
 * @param {string} taskId - Task ID.
 * @returns {Promise<Object|null>} - The task object if found, otherwise null.
 */
async function fetchTaskById(category, taskId) {
    try {
        let task = await fetchTaskData(category, taskId);
        if (!task) return null;

        task.contacts = await processTaskContacts(task.contacts);
        return task;
    } catch (error) {
        console.error("Error fetching task by ID:", error);
        return null;
    }
}

/**
 * Fetches task data from Firebase.
 * @param {string} category - Task category.
 * @param {string} taskId - Task ID.
 * @returns {Promise<Object|null>} - The fetched task data or null if not found.
 */
async function fetchTaskData(category, taskId) {
    let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`);
    let task = await response.json();

    if (!task) {
        console.error(`Task with ID ${taskId} not found!`);
        return null;
    }
    return task;
}

/**
 * Processes the contacts associated with a task.
 * @param {Array} contacts - The list of contact names or IDs.
 * @returns {Promise<Array>} - The processed list of contact objects.
 */
async function processTaskContacts(contacts) {
    if (!contacts) return [];

    let allContacts = await fetchAllContacts();
    let nameToIdMap = createNameToIdMap(allContacts);

    return Promise.all(
        contacts.map(async (contactNameOrId) => {
            let contactId = nameToIdMap[contactNameOrId] || contactNameOrId;
            return fetchContactFromFirebase(contactId);
        })
    );
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
            task.subtasks.splice(subtaskIndex, 1); 
            await saveTaskToCategory(taskId, category, task);
        } else {
            console.error("Subtask nicht gefunden.");
        }
    } catch (error) {
        console.error("Fehler beim Löschen des Subtasks:", error);
    }
}

/**
 * Retrieves the existing task and integrates existing information (column, subtask status) into the updated task.
 * @param {string} category - Category of the task
 * @param {string} taskId - ID of the task
 * @param {object} updatedTask - The task data to be updated
 * @returns {object} - The updated task data with retained information
 */
async function integrateExistingTaskData(category, taskId, updatedTask) {
    let existingTask = await fetchTaskById(category, taskId);
    if (existingTask) {
        updatedTask.column = existingTask.column;
        if (existingTask.subtasks && updatedTask.subtasks) {
            updatedTask.subtasks = updatedTask.subtasks.map((subtask, index) => {
                return {
                    ...subtask,
                    completed: existingTask.subtasks[index] ? existingTask.subtasks[index].completed : false
                };
            });
        }
    }
    return updatedTask;
}

/**
 * Updates the task in the Firebase database.
 * @param {string} category - Task category.
 * @param {string} taskId - ID of the task.
 * @param {object} updatedTask - Updated task data.
 */
async function updateTaskInDatabase(category, taskId, updatedTask) {
    updatedTask = await integrateExistingTaskData(category, taskId, updatedTask);
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