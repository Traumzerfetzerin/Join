/** Template for each task */
function getTaskBoardTemplate(category, task, taskId, contactList, taskClass, subtaskCount) {
    

    return `
        <div id="${taskId}" class="task draggable ${taskClass}" draggable="true">
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p class="subtask-count">${subtaskCount} Subtasks</p>
            <ul>${contactList}</ul>
        </div>
    `;
}