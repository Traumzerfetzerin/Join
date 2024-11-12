// SUBTASK
function createSubtaskElementHTMML(subtaskText, subtaskDivId, subtaskUlId, subtaskLiId) {
    return /*HTML*/ `
<div id="${subtaskDivId}" class="space-between createdSubtask">
    <div>
        <ul id="${subtaskUlId}">
            <li id="${subtaskLiId}">${subtaskText}</li>
        </ul>
    </div>
    <div class="flex">
        <div>
            <img class="editSubtask subtaskImg cursorPointer d-none"
                 src="../Assets/addTask/Property 1=edit.svg" alt="">
        </div>
        <div class="seperatorSubtasks"></div>
        <div>
            <img class="deleteSubtask subtaskImg cursorPointer d-none"
                 src="../Assets/addTask/Property 1=delete.svg" alt="">
        </div>
    </div>
</div>`;
}


// POP UP
function popUpRequiredHTML() {
    return /*HTML*/`
    <div class="space-evently">
        <p class="center">Please, <br> fill in all required fields.</p>
    </div > `;
}


function popUpAddTaskHTML() {
    return /*HTML*/`
    <div class="space-evently flex">
        <p>Task added to board</p>
        <img src="../Assets/addTask/Icons.svg" alt="">
    </div>`;
}