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

/** function to load tasks and put them into the appropriate column */
function loadTasks(tasks) {
    // Clear the columns
    document.getElementById("toDoColumn").innerHTML = "";
    document.getElementById("inProgressColumn").innerHTML = "";
    document.getElementById("awaitFeedbackColumn").innerHTML = "";
    document.getElementById("doneColumn").innerHTML = "";

    for (let category in tasks) {
        let categoryTasks = tasks[category]; 

        for (let title in categoryTasks) {
            let description = categoryTasks[title];

            // Add tasks to the toDoColumn by default
            document.getElementById("toDoColumn").innerHTML += getTaskBoardTemplate(category, title, description);
        }  
    }

    // Enable drag-and-drop for the columns
    enableDragAndDrop();
}

/** Enable drag and drop functionality for all columns */
function enableDragAndDrop() {
    let columns = document.querySelectorAll('.column');

    columns.forEach(column => {
        column.ondragover = allowDrop;
        column.ondrop = drop;
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
    event.target.appendChild(taskElement);
}

/** Handle the dragging of a task */
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}