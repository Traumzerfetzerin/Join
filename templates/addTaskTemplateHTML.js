// SUBTASK
function createSubtaskElementHTML(subtaskText, subtaskDivId, subtaskUlId, subtaskLiId) {
    return /*HTML*/ `
        <div id="${subtaskDivId}" class="space-between createdSubtask">
            <div>
                <ul id="${subtaskUlId}">
                    <li id="${subtaskLiId}" class="subtaskText">${subtaskText}</li>
                </ul>
            </div>
            <div class="flex">
                <div>
                    <img class="editSubtask subtaskImg cursorPointer" 
                         src="../Assets/addTask/Property 1=edit.svg" 
                         alt="Edit" onclick="editSubtask('${subtaskDivId}')">
                </div>
                <div class="seperatorSubtasks"></div>
                <div>
                    <img class="deleteSubtask subtaskImg cursorPointer"
                         src="../Assets/addTask/Property 1=delete.svg" 
                         alt="Delete" onclick="deleteSubtask('${subtaskDivId}')">
                </div>
            </div>
        </div>`;
}


function editSubtaskHTML(subtaskDivId, editSubtask) {
    return /*HTML*/ `
        <input id="editSubtask_${subtaskDivId}" type="text" value="${editSubtask}" onblur="updateSubtaskText(this)">
        <img class="deleteSubtask subtaskImg cursorPointer" src="../Assets/addTask/Property 1=delete.svg" alt=""
            onclick="deleteSubtask('${subtaskDivId}')">
        <img id="acceptSubtask_${subtaskDivId}" class="acceptSubtask cursorPointer subtaskImg"
            src="../Assets/addTask/Property 1=check.svg" alt="" onclick="acceptSubtask('${subtaskDivId}')">
 `;
}


function subtaskChangeHTML(subtaskDivId, subtaskValue) {
    return /*HTML*/`
        <ul>
            <li class="subtaskText">${subtaskValue}</li>
        </ul>
        <div class="flex">
            <div>
                <img class="editSubtask subtaskImg cursorPointer" src="../Assets/addTask/Property 1=edit.svg" alt="Edit"
                    onclick="editSubtask('${subtaskDivId}')">
            </div>
            <div class="seperatorSubtasks"></div>
            <div>
                <img class="deleteSubtask subtaskImg cursorPointer" src="../Assets/addTask/Property 1=delete.svg"
                    alt="Delete" onclick="deleteSubtask('${subtaskDivId}')">
            </div>
        </div>`;
}


// POP UP
function popUpRequiredHTML() {
    return /*HTML*/`
        <div class="space-evently">
            <p class="center">Please, <br> fill in all required fields.</p>
    </div> `;
}


function popUpAddTaskHTML() {
    return /*HTML*/`
        <div class="space-evently flex">
        <p>Task added to board</p>
        <img src="../Assets/addTask/Icons.svg" alt="">
    </div>`;
}