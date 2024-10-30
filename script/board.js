const TASK_URL = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks";

/** fetch data from firebase API */
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

function clearColumns() {
    document.getElementById("toDoColumn").innerHTML = "";
    document.getElementById("inProgressColumn").innerHTML = "";
    document.getElementById("awaitFeedbackColumn").innerHTML = "";
    document.getElementById("doneColumn").innerHTML = "";
}

/** function to load tasks and put them into the appropriate column */
function loadTasks(tasks) {
    clearColumns();

    for (let category in tasks) {
        let categoryTasks = tasks[category];
        for (let taskId in categoryTasks) {
            let task = categoryTasks[taskId];
            let contactList = '';

            if (task.contacts) {
                contactList = task.contacts.map(contact => `<li>${contact}</li>`).join('');
            }

            let taskHtml = getTaskBoardTemplate(category, task, taskId, contactList);

            // Check if task has a column property, if not, default to "toDo"
            let column = task.column ? task.column : "toDo";
            document.getElementById(column + "Column").innerHTML += taskHtml;
        }
    }

    enableDragAndDrop();
}

/** Enable drag and drop functionality for all columns */
function enableDragAndDrop() {
    let columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.ondragover = allowDrop;
        column.ondrop = drop;
    });
    let tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        task.ondragstart = drag;
    });
}

/** Allow dropping in the target column */
function allowDrop(event) {
    event.preventDefault();
}

/** Handle dropping of a task in a column */
function drop(event) {
    event.preventDefault();
    let taskId = event.dataTransfer.getData("text");
    let taskElement = document.getElementById(taskId);
    let target = event.target.closest('.column'); // Ensure target is a column

    if (target) {
        // Remove the task from the actual column
        taskElement.remove();

        // Add the task to the new column
        target.innerHTML += taskElement.outerHTML;

        // Update the task's column in the database
        updateTaskColumn(taskId, target.id.replace("Column", ""));
    }
}

/** Handle the dragging of a task */
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

/** Update the task's column in the database */
async function updateTaskColumn(taskId, column) {
    try {
        // Fetch the task data to preserve other task properties
        let response = await fetch(`${TASK_URL}.json`);
        let data = await response.json();

        for (let category in data) {
            if (data[category][taskId]) {
                data[category][taskId].column = column;

                // Update the task in Firebase using PUT
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
        // Fehlerbehandlung
    }
}
