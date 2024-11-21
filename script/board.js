const TASK_URL = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks";

/** Fetch data from Firebase API */
async function fetchTasks() {
    try {
        let response = await fetch(TASK_URL + ".json");
        let data = await response.json();
        if (data) {
            loadTasks(data);
        } else {
            console.log("Keine Daten gefunden.");
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
    }
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

/** Load tasks and add them to the appropriate columns */
function loadTasks(tasks) {
    clearColumns();

    let columns = {
        toDo: "toDoColumn",
        inProgress: "inProgressColumn",
        awaitFeedback: "awaitFeedbackColumn",
        done: "doneColumn"
    };

    for (let category in tasks) {
        let categoryTasks = tasks[category]; 
        for (let taskId in categoryTasks) {
            let task = categoryTasks[taskId];
            addTaskToColumn(task, category, taskId, columns); 
        }
    }

    checkEmptyColumns(columns);
    enableDragAndDrop(columns);
}


/** Add a task to the specified column */
function addTaskToColumn(task, category, taskId, columns) {
    let contactList = task.contacts
        ? task.contacts.map(contact => `<li>${contact}</li>`).join('')
        : '';
    let subtaskCount = task.subtasks ? task.subtasks.length : 0;
    let taskClass = getTaskClass(task.title);
    let taskHtml = getTaskBoardTemplate(category, task, taskId, contactList, taskClass, subtaskCount);

    let columnId = task.column ? task.column : "toDo";
    document.getElementById(columns[columnId]).innerHTML += taskHtml;
}

/** Check if columns are empty and add/remove 'No tasks to do' message */
function checkEmptyColumns(columns) {
    for (let column in columns) {
        let columnElement = document.getElementById(columns[column]);
        
        if (columnElement.children.length === 0 || 
            (columnElement.children.length === 1 && columnElement.children[0].classList.contains("no-tasks"))) {
            
            if (!columnElement.querySelector('.no-tasks')) {
                columnElement.innerHTML = `<p class="no-tasks">No tasks to do</p>`;
            }
        } else {
            let noTasksMessage = columnElement.querySelector('.no-tasks');
            if (noTasksMessage) noTasksMessage.remove();
        }
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


/** Show the task form on the board */
function addTaskOnBoard() {
    document.getElementById('templateAddTask').classList.remove('dNone');
}

/** Hide the task form on the board */
function closeTaskOnBoard() {
    document.getElementById('templateAddTask').classList.add('dNone');
}

/** Prevents closing when clicking inside the form */
function dontClose(event) {
    event.stopPropagation();
}