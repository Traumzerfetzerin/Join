let TASK_URL = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks";
let taskData = {};

/**
 * Saves a task to a specified category in the database.
 * @param {string} taskId - The ID of the task to save.
 * @param {string} category - The category where the task should be saved.
 * @param {object} taskData - The task data to save.
 * @returns {Promise<void>}
 */
async function saveTaskToCategory(taskId, category, taskData) {
    try {
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
        console.log(`Task ${taskId} successfully saved in category ${category}`);
    } catch (error) {
        console.error("Error saving task to category:", error);
    }
}

/**
 * Fetches tasks from Firebase. If category and taskId are provided, fetches a single task.
 * Otherwise, fetches all tasks.
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

async function fetchAllContacts() {
    try {
        let response = await fetch(`https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json`);
        let contacts = await response.json();
        return contacts || {};
    } catch (error) {
        console.error("Error fetching all contacts:", error);
        return {};
    }
}

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
 * Finds a task in taskData by its ID.
 * @param {string} taskId - ID of the task to find.
 * @returns {object|null} - The task object if found, otherwise null.
 */
function findTaskInData(taskId) {
    for (let category in taskData) {
        let tasks = taskData[category];
        if (tasks[taskId]) {
            return tasks[taskId];
        }
    }
    return null;
}

/**
 * Clears all task columns.
 */
function clearColumns() {
    document.getElementById("toDoColumn").innerHTML = "";
    document.getElementById("inProgressColumn").innerHTML = "";
    document.getElementById("awaitFeedbackColumn").innerHTML = "";
    document.getElementById("doneColumn").innerHTML = "";
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
 * Loads tasks into their respective columns on the board.
 * @param {object} tasks - Tasks retrieved from Firebase.
 */
function loadTasks(tasks) {
    clearColumns();
    let columns = {
        toDo: "toDoColumn",
        inProgress: "inProgressColumn",
        awaitFeedback: "awaitFeedbackColumn",
        done: "doneColumn",
    };
    for (let category in tasks) {
        let categoryTasks = tasks[category];
        for (let taskId in categoryTasks) {
            let task = categoryTasks[taskId];
            task.id = taskId;
            addTaskToColumn(task, category, taskId, columns);
        }
    }
    checkEmptyColumns(columns);
    enableDragAndDrop(columns);
}

/**
 * Adds a task to the specified column.
 * @param {object} task - Task object.
 * @param {string} category - Task category.
 * @param {string} taskId - Task ID.
 * @param {object} columns - Mapping of column names to HTML element IDs.
 */
function addTaskToColumn(task, category, taskId, columns) {
    if (!task.column) {
        task.column = "toDo";
    }
    let columnElement = document.getElementById(columns[task.column]);
    if (!columnElement) {
        console.error(`Column element for column ${task.column} not found in DOM.`);
        return;
    }
    let contactList = task.contacts
        ? generateContactList(task.contacts)
        : "";
    let subtaskCount = task.subtasks ? task.subtasks.length : 0;
    let completedSubtasks = task.subtasks
        ? task.subtasks.filter((subtask) => subtask.completed).length
        : 0;
    let taskClass = getTaskClass(task.title);
    let prioIcon = getPrioIcon(task.prio);
    let taskHtml = getTaskBoardTemplate(
        category,
        task,
        taskId,
        contactList,
        taskClass,
        subtaskCount,
        completedSubtasks
    );
    columnElement.innerHTML += `<div id="task-${taskId}" class="task draggable" draggable="true">${taskHtml}</div>`;
}

/**
 * Gets the priority icon based on the priority value.
 * @param {string} prio - The priority level.
 * @returns {string} - Path to the priority icon.
 */
function getPrioIcon(prio) {
    if (prio === "urgent") return "../Assets/addTask/Prio alta.svg";
    if (prio === "medium") return "../Assets/addTask/Prio media white.svg";
    return "../Assets/addTask/Prio baja.svg";
}

function enableDragAndDrop(columns) {
    let draggableTasks = document.querySelectorAll(".draggable");
    let dropZones = Object.values(columns).map((column) => document.getElementById(column));

    draggableTasks.forEach((task) => {
        task.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("task-id", task.id.replace("task-", ""));
            event.dataTransfer.setData("category", getCategoryFromTaskId(task.id.replace("task-", "")));
        });
    });

    dropZones.forEach((zone) => {
        zone.addEventListener("dragover", (event) => event.preventDefault());

        zone.addEventListener("drop", async (event) => {
            event.preventDefault();
            let taskId = event.dataTransfer.getData("task-id");
            let category = event.dataTransfer.getData("category");
            let newColumn = Object.keys(columns).find((key) => columns[key] === zone.id);

            if (taskId && newColumn) {
                let task = findTaskInData(taskId);
                if (!task) {
                    console.error(`Task with ID ${taskId} not found.`);
                    return;
                }

                // Update only the column, retain the category
                task.column = newColumn;

                // Save updated task to Firebase
                await saveTaskToCategory(taskId, category, task);

                // Fetch the updated task data to ensure contacts are correctly mapped
                let updatedTask = await fetchTaskById(category, taskId);
                if (!updatedTask) {
                    console.error(`Updated task with ID ${taskId} not found.`);
                    return;
                }

                // Update UI
                document.getElementById(`task-${taskId}`).remove();
                let columnElement = document.getElementById(columns[newColumn]);
                let taskHtml = getTaskBoardTemplate(
                    category,
                    updatedTask, // Use the updated task data
                    taskId,
                    generateContactList(updatedTask.contacts || []),
                    getTaskClass(updatedTask.title),
                    updatedTask.subtasks ? Object.keys(updatedTask.subtasks).length : 0,
                    updatedTask.subtasks ? calculateProgressPercentage(updatedTask.subtasks) : 0
                );
                columnElement.innerHTML += `<div id="task-${taskId}" class="task draggable" draggable="true">${taskHtml}</div>`;

                enableDragAndDrop(columns);
                checkEmptyColumns(columns);
            }
        });
    });
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

        // Fetch and map contacts
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
 * Finds the category of a task based on its ID.
 * @param {string} taskId - The ID of the task.
 * @returns {string|null} - The category of the task or null if not found.
 */
function getCategoryFromTaskId(taskId) {
    for (let category in taskData) {
        if (taskData[category] && taskData[category][taskId]) {
            return category;
        }
    }
    return null;
}


/**
 * Deletes a task from its current category in the Firebase database.
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
            console.error(`Failed to delete task with ID ${taskId}: ${response.statusText}`);
            return;
        }

        console.log(`Task with ID ${taskId} deleted successfully.`);
    } catch (error) {
        console.error("Error while deleting task:", error);
    }
}

/**
 * Updates the task's column in the Firebase database.
 * @param {string} taskId - The ID of the task.
 * @param {string} newColumn - The new column to assign.
 * @param {string} category - The category of the task.
 */
async function updateTaskColumn(taskId, newColumn, category) {
    try {
        let task = findTaskInData(taskId);
        if (!task) {
            console.error(`Task with ID ${taskId} not found.`);
            return;
        }

        task.column = newColumn;

        let url = `${TASK_URL}/${encodeURIComponent(category)}/${taskId}.json`;
        let response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
        });

        if (response.ok) {
            console.log(`Task ${taskId} successfully updated to column ${newColumn}.`);
        } else {
            console.error(`Failed to update task. HTTP Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error while updating task column:", error);
    }
}

/**
 * Checks and updates the display for empty columns.
 * @param {object} columns - Mapping of column names to HTML element IDs.
 */
function checkEmptyColumns(columns) {
    for (let columnId in columns) {
        let columnElement = document.getElementById(columns[columnId]);
        if (columnElement) {
            let tasks = columnElement.querySelectorAll(".task");
            if (tasks.length === 0) {
                columnElement.innerHTML = `<p class="no-tasks">No tasks available</p>`;
            } else {
                let noTasksMessage = columnElement.querySelector(".no-tasks");
                if (noTasksMessage) {
                    noTasksMessage.remove();
                }
            }
        }
    }
}

/**
 * Shows the task form on the board.
 */
function addTaskOnBoard() {
    document.getElementById('templateAddTask').classList.remove('d-none');
}

/**
 * Hides the task form on the board.
 */
function closeTaskOnBoard() {
    document.getElementById('templateAddTask').classList.add('d-none');
}

/**
 * Prevents closing when clicking inside the form.
 * @param {Event} event - The click event.
 */
function dontClose(event) {
    event.stopPropagation();
}

window.onload = async function () {
    let taskOverlay = document.getElementById("taskOverlay");
    taskOverlay.classList.add("dNone");

    await fetchTasks();
};

/**
 * Extracts the initials from a contact name.
 * @param {string} name - The full name of the contact.
 * @returns {string} The initials of the contact.
 */
function getInitials(name) {
    if (!name || typeof name !== "string") {
        return "?";
    }
    let parts = name.split(" ");
    let initials = parts.map((part) => part.charAt(0).toUpperCase()).join("");
    return initials.slice(0, 2); 
}