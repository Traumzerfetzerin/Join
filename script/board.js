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
   // Loop through the task categories (e.g., "User Story", "Technical Task")
   for (let category in tasks) {
    let categoryTasks = tasks[category];

    // Loop through each task in the category
    for (let taskId in categoryTasks) {
        let task = categoryTasks[taskId];
        let taskHtml = getTaskBoardTemplate(category, task, taskId);
        document.getElementById("toDoColumn").innerHTML += taskHtml;
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
    let target = event.target;

    // Make sure the target is a column and not a task
    while (!target.classList.contains('column') && target.parentNode) {
        target = target.parentNode;
    }

    if (target.classList.contains('column')) {
        // remove the task from the actual column
        taskElement.remove();

        // add the task to the new column
        target.innerHTML += taskElement.outerHTML;
    };
}


/** Handle the dragging of a task */
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}


