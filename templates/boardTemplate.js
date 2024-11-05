/** Template for each task */
function getTaskBoardTemplate(category, task, taskId, contactList) {
     return `
     <div class="task cursorPointer" id="${taskId}" draggable="true" ondragstart="drag(event)"> 
        <h3>${category}</h3> 
        <h4>${task.title}</h4> 
        <p>${task.description}</p> 
        <ul>${contactList}</ul> </div> `;
}