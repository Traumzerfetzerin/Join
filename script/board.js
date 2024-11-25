const TASK_URL = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks";

/** Fetch data from Firebase API */

async function fetchTasks() {
    try {
        let response = await fetch(`${TASK_URL}.json`);
        let data = await response.json();
        console.log("Fetched data from Firebase:", data);

        if (data) {
            loadTasks(data);
        } else {
            console.log("No data found.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
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
/*function loadTasks(tasks) {
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
}*/
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
            task.id = taskId; // Add the ID to the task object
            addTaskToColumn(task, category, taskId, columns); 
        }
    }

    checkEmptyColumns(columns);
    enableDragAndDrop(columns);
}



/** Add a task to the specified column */




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
/** Delete a task both from the UI and the Firebase database */

/** Delete a task both from the UI and the Firebase database */
async function deleteTask(taskId, category) {
    console.log('Deleting task:', taskId, category);  // Add this line to debug

    if (!taskId || taskId === "undefined") {
        console.error('Error: Invalid task ID');
        return;
    }

    try {
        const taskUrl = `${TASK_URL}/${category}/${taskId}.json`;

        let response = await fetch(taskUrl, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log(`Task with ID ${taskId} from category ${category} deleted successfully.`);
            fetchTasks();
        } else {
            console.error('Error deleting task:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}


