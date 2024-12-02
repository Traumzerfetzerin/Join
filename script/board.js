const TASK_URL = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks";
let taskData = {};

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
            console.log("Loaded task data:", taskData);
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

/** Clear all task columns */
function clearColumns() {
    document.getElementById("toDoColumn").innerHTML = "";
    document.getElementById("inProgressColumn").innerHTML = "";
    document.getElementById("awaitFeedbackColumn").innerHTML = "";
    document.getElementById("doneColumn").innerHTML = "";
}

/** Get CSS class based on task title */
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

    const columns = {
        toDo: "toDoColumn",
        inProgress: "inProgressColumn",
        awaitFeedback: "awaitFeedbackColumn",
        done: "doneColumn"
    };

    for (const category in tasks) {
        const categoryTasks = tasks[category];
        for (const taskId in categoryTasks) {
            const task = categoryTasks[taskId];
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
    const contactList = formatContactList(task.contacts);
    const subtaskData = calculateSubtaskData(task.subtasks);
    const prioIcon = getPrioIcon(task.prio);
    const taskHtml = createTaskHtml(
        category,
        task,
        taskId,
        contactList,
        subtaskData,
        prioIcon
    );

    const columnId = task.column || "toDo";
    const columnElement = document.getElementById(columns[columnId]);
    if (columnElement) {
        columnElement.innerHTML += `<div id="task-${taskId}">${taskHtml}</div>`;
    }
}

/**
 * Formats the contact list for display.
 * @param {Array} contacts - List of contact names.
 * @returns {string} - HTML for the contact list.
 */
function formatContactList(contacts) {
    return contacts
        ? contacts
              .map(contact => {
                  const initials = getInitials(contact);
                  const bgColor = getRandomColor();
                  return `<span class="contact-initial" style="background-color: ${bgColor};">${initials}</span>`;
              })
              .join("")
        : "";
}

/** Calculate subtask data: total and completed */
function calculateSubtaskData(subtasks) {
    if (!subtasks) return { count: 0, completed: 0 };
    return {
        count: subtasks.length,
        completed: subtasks.filter(subtask => subtask.completed).length
    };
}


/** Get the priority icon based on the priority value */
function getPrioIcon(prio) {
    if (prio === "urgent") return "../Assets/addTask/Prio alta.svg";
    if (prio === "medium") return "../Assets/addTask/Prio media white.svg";
    return "../Assets/addTask/Prio baja.svg";
}

/** Generate the task HTML */
function createTaskHtml(category, task, taskId, contactList, subtaskData, prioIcon) {
    return getTaskBoardTemplate(
        category,
        task,
        taskId,
        contactList,
        getTaskClass(task.title),
        subtaskData.count,
        subtaskData.completed,
        prioIcon
    );
}


/** Insert the task HTML into the specified column */
function insertTaskIntoColumn(column, taskHtml, columns) {
    let columnId = column || "toDo";
    let columnElement = document.getElementById(columns[columnId]);
    if (columnElement) {
        columnElement.innerHTML += taskHtml;
    }
}


/** Enable drag and drop functionality */
function enableDragAndDrop(columns) {
    let draggableTasks = document.querySelectorAll('.draggable');
    let dropZones = Object.values(columns).map(column => document.getElementById(column));

    draggableTasks.forEach(task => {
        task.addEventListener('dragstart', function (event) {
            event.dataTransfer.setData('task-id', task.id);
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function (event) {
            event.preventDefault();
        });
        
        zone.addEventListener('drop', async function (event) {
            event.preventDefault();
            let taskId = event.dataTransfer.getData('task-id');
            let taskElement = document.getElementById(taskId);
            
            if (taskElement) {
                zone.insertAdjacentElement('beforeend', taskElement);
                
                let column = Object.keys(columns).find(key => columns[key] === zone.id);
                await updateTaskColumn(taskId, column);
            
                checkEmptyColumns(columns); 
            }
        });
    });
}

/** Handle the dragging of a task */
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

/** Update the task's column in the database */
async function updateTaskColumn(taskId, column) {
    try {
        let response = await fetch(`${TASK_URL}.json`);
        let data = await response.json();

        for (let category in data) {
            if (data[category][taskId]) {
                data[category][taskId].column = column;
                await fetch(`${TASK_URL}/${category}/${taskId}.json`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data[category][taskId])
                });
                break;
            }
        }
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Spalte:", error);
    }
}


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


/** Show the task form on the board */
function addTaskOnBoard() {
    document.getElementById('templateAddTask').classList.remove('d-none');
}

/** Hide the task form on the board */
function closeTaskOnBoard() {
    document.getElementById('templateAddTask').classList.add('d-none');
}

/** Prevents closing when clicking inside the form */
function dontClose(event) {
    event.stopPropagation();
}