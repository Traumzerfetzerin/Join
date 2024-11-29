//Overlay
async function showTaskOverlay(category, taskId) {
    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`);
        let task = await response.json();

        // Debugging: Zeigt die Task-Daten in der Konsole an
        console.log("Loaded task:", task);

        if (!task) {
            alert("Task not found!");
            return;
        }

        let overlayHtml = getBoardOverlayTemplate(category, task);

        let overlayDetails = document.getElementById("overlayDetails");
        overlayDetails.innerHTML = overlayHtml;

        let taskOverlay = document.getElementById("taskOverlay");
        taskOverlay.classList.remove("dNone");
    } catch (error) {
        console.error("Fehler beim Laden der Aufgabe:", error);
    }
}




function closeTaskOverlay(event) {
    let taskOverlay = document.getElementById("taskOverlay");

    if (event && event.target === taskOverlay) {
        taskOverlay.classList.add("dNone");
    } else if (!event || event.target.tagName === "BUTTON") {
        taskOverlay.classList.add("dNone");
    }
}



window.onload = function () {
    let taskOverlay = document.getElementById("taskOverlay");
    taskOverlay.classList.add("dNone");
};


function addTaskToColumn(task, category, taskId, columns) {
    // Ensure task.id is set
    task.id = taskId;

    let contactList = task.contacts
        ? task.contacts.map(contact => {
              const initials = getInitials(contact); // Extract initials
              const bgColor = getRandomColor(); // Generate a random background color
              return `<span class="contact-initial" style="background-color: ${bgColor};">${initials}</span>`;
          }).join('') // No space between spans for stacking
        : '';

    let subtaskCount = task.subtasks ? task.subtasks.length : 0;
    let taskClass = getTaskClass(task.title);

    let taskHtml = getTaskBoardTemplate(category, task, taskId, contactList, taskClass, subtaskCount);

    let columnId = task.column ? task.column : "toDo";
    let columnElement = document.getElementById(columns[columnId]);

    // Set the task's DOM element ID to include taskId for deletion
    columnElement.innerHTML += `<div id="task-${taskId}">${taskHtml}</div>`;
}


function getInitials(name) {
    return name
        .split(' ')
        .map(part => part[0]?.toUpperCase()) // Take the first letter of each part
        .join('');
}
function getRandomColor() {
    // Generate a random RGB color
    const r = Math.floor(Math.random() * 256); // Red: 0-255
    const g = Math.floor(Math.random() * 256); // Green: 0-255
    const b = Math.floor(Math.random() * 256); // Blue: 0-255

    return `rgb(${r}, ${g}, ${b})`; // Return the RGB color string
}


