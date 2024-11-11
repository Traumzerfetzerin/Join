/** Template for each task */
function getTaskBoardTemplate(category, task, taskId, contactList, taskClass) {
    return `
        <div id="${taskId}" class="task draggable ${taskClass}" draggable="true">
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <ul>${contactList}</ul>
        </div>
    `;
}