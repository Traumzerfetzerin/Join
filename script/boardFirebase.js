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
        if (!taskData.subtasks || !Array.isArray(taskData.subtasks)) {
            console.warn(`Task ${taskId} has no subtasks or invalid subtasks.`);
            taskData.subtasks = [];
        }

        if (Array.isArray(taskData.contacts)) {
            taskData.contacts = taskData.contacts.map(contact => contact.name || contact.id || contact);
        }

        let response = await fetch(
            `${TASK_URL}/${encodeURIComponent(category)}/${encodeURIComponent(taskId)}.json`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(taskData),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to save task: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error saving task to category:", error);
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
            let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`);
            let task = await response.json();
            if (!task) {
                alert("Task not found!");
                return null;
            }
            task.id = taskId;

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
        } else {
            let response = await fetch(`${TASK_URL}.json`);
            let data = await response.json();
            if (data) {
                for (let category in data) {
                    for (let taskId in data[category]) {
                        data[category][taskId].id = taskId;

                        if (data[category][taskId].contacts) {
                            data[category][taskId].contacts = await Promise.all(
                                data[category][taskId].contacts.map(async (contactNameOrId) => {
                                    let contactId = nameToIdMap[contactNameOrId] || contactNameOrId;
                                    let contact = await fetchContactFromFirebase(contactId);
                                    return contact;
                                })
                            );
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
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return null;
    }
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
