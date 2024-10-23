/** Template for each task */
function getTaskBoardTemplate(category, task, taskId) {
    return `
        <div class="task" id="${taskId}" draggable="true" ondragstart="drag(event)">
            <h3>${category}</h3>
            <h4>${task.title}</h4>
            <p>${task.description}</p>
        </div>
    `;
}

