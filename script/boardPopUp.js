//Overlay
async function showTaskOverlay(category, taskId) {
    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`);
        let task = await response.json();

        if (!task) {
            alert("Task not found!");
            return;
        }

        let overlayHtml = `
            <h2>${category}</h2> 
            <h3>${task.title || "No title"}</h3>
            <p><strong>Description:</strong> ${task.description || "No description"}</p>
            <p><strong>Due Date:</strong> ${task.dueDate || "No due date"}</p>
            <p><strong>Priority:</strong> ${task.prio || "No priority"}</p>
            <p><strong>Contacts:</strong> ${task.contacts && task.contacts.length ? task.contacts.join(", ") : "No contacts"}</p>
            <div>
                <strong>Subtasks:</strong>
                <ul>
                    ${task.subtasks && task.subtasks.length
                        ? task.subtasks.map(subtask => `<li>${subtask}</li>`).join("")
                        : "<li>No subtasks</li>"}
                </ul>
            </div>
        `;

        let overlayDetails = document.getElementById("overlayDetails");
        overlayDetails.innerHTML = overlayHtml;

        let taskOverlay = document.getElementById("taskOverlay");
        taskOverlay.classList.remove("d-none");
    } catch (error) {
        console.error("Fehler beim Laden der Aufgabe:", error);
    }
}


function closeTaskOverlay(event) {
    let taskOverlay = document.getElementById("taskOverlay");

    if (event && event.target === taskOverlay) {
        taskOverlay.classList.add("d-none");
    } else if (!event || event.target.tagName === "BUTTON") {
        taskOverlay.classList.add("d-none");
    }
}


window.onload = function () {
    let taskOverlay = document.getElementById("taskOverlay");
    taskOverlay.classList.add("d-none");
};


function addTaskToColumn(task, category, taskId, columns) {
    let contactList = task.contacts
        ? task.contacts.map(contact => `<li>${contact}</li>`).join('')
        : '';
    let subtaskCount = task.subtasks ? task.subtasks.length : 0;
    let taskClass = getTaskClass(task.title);

    let taskHtml = getTaskBoardTemplate(category, task, taskId, contactList, taskClass, subtaskCount);

    let columnId = task.column ? task.column : "toDo";
    let columnElement = document.getElementById(columns[columnId]);
    columnElement.innerHTML += taskHtml;
}

