// SUBTASK
function createSubtaskElementHTMML(subtaskText) {
    return /*HTML*/ `
        <div id="${subtaskDivId}" class="space-between createdSubtask">
            <div>
                <ul id="${subtaskUlId}">
                    <li id="${subtaskLiId}">${subtaskText}</li>
                </ul>
            </div>
            <div class="flex">
                <div>
                    <img class="editSubtask subtaskImg cursorPointer d-none" src="../Assets/addTask/Property 1=edit.svg"
                        alt="" onclick="editSubtask(subtaskDivId)">
                </div>
                <div class="seperatorSubtasks"></div>
                <div>
                    <img class="deleteSubtask subtaskImg cursorPointer d-none"
                        src="../Assets/addTask/Property 1=delete.svg" alt="" onclick="deleteSubtask('${subtaskDivId}')">
                </div>
            </div>
        </div>`;
}


function editSubtaskHTML(subtaskDivId, editSubtask) {
    return /*HTML*/ `
        <input id="editSubtask_${subtaskDivId}" type="text" value="${editSubtask}" onblur="updateSubtaskText(this)">
        <div id="${subtaskDivId}" class="space-between createdSubtask">
            <div class="flex">
                <div>
                    <img class="deleteSubtask subtaskImg cursorPointer d-none"
                        src="../Assets/addTask/Property 1=delete.svg" alt="" onclick="deleteSubtask('${subtaskDivId}')">
                </div>
                <div class="seperatorSubtasks"></div>
                <div>
                    <img id="acceptSubtask_${subtaskDivId}" class=" acceptSubtask cursorPointer d-none" src="../Assets/addTask/Property 1=check.svg" alt=""
                        onclick="acceptSubtask('${subtaskDivId}')">
                </div>
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