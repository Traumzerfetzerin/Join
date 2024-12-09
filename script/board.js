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
 * Fetches all tasks from Firebase, assigns IDs to each task, and loads them into the board.
 */
async function fetchTasks() {
    try {
        let response = await fetch(`${TASK_URL}.json`);
        let data = await response.json();
        if (data) {
            for (let category in data) {
                for (let taskId in data[category]) {
                    data[category][taskId].id = taskId;
                }
            }
            taskData = data;
            loadTasks(data);
        } else {
            console.log("No tasks found.");
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
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
        ? task.contacts
              .map((contact) => {
                  let initials = getInitials(contact);
                  let bgColor = getRandomColor();
                  return `<span class="contact-initial" style="background-color: ${bgColor};">${initials}</span>`;
              })
              .join("")
        : "";
    let subtaskCount = task.subtasks ? Object.keys(task.subtasks).length : 0;
    let completedSubtasks = task.subtasks
        ? Object.values(task.subtasks).filter((subtask) => subtask.completed).length
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

/**
 * Enables drag-and-drop functionality for tasks and updates their column and category in Firebase.
 * @param {object} columns - Mapping of column names to their respective HTML element IDs.
 */
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
            let oldCategory = event.dataTransfer.getData("category");
            let newColumn = Object.keys(columns).find((key) => columns[key] === zone.id);

            if (taskId && newColumn) {
                let task = findTaskInData(taskId);
                if (!task) {
                    console.error(`Task with ID ${taskId} not found.`);
                    return;
                }

                // Update task properties
                let newCategory = newColumn; // Assuming newColumn matches the category
                task.category = newCategory;
                task.column = newColumn;

                // Delete from the old category
                if (oldCategory && oldCategory !== newCategory) {
                    await deleteTaskFromCategory(taskId, oldCategory);
                }

                // Save to the new category
                await saveTaskToCategory(taskId, newCategory, task);

                // Update UI
                document.getElementById(`task-${taskId}`).remove();
                let columnElement = document.getElementById(columns[newColumn]);
                let taskHtml = getTaskBoardTemplate(
                    newCategory,
                    task,
                    taskId,
                    generateContactList(task.contacts || []),
                    getTaskClass(task.title),
                    task.subtasks ? Object.keys(task.subtasks).length : 0,
                    task.subtasks ? calculateProgressPercentage(task.subtasks) : 0
                );
                columnElement.innerHTML += `<div id="task-${taskId}" class="task draggable" draggable="true">${taskHtml}</div>`;

                enableDragAndDrop(columns);
                checkEmptyColumns(columns);
            }
        });
    });
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
