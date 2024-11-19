// ENTER SUBTASK
let input = document.getElementById('subtaskSelect');
document.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById('addSubtaskButton').click();
    }
});


// CREATE SUBTASK
let subtaskCounter = 0;

function createSubtaskElement(subtaskText, subtaskDivId, subtaskUlId, subtaskLiId) {
    let subtaskHTML = createSubtaskElementHTMML(subtaskText, subtaskDivId, subtaskUlId, subtaskLiId);
    document.getElementById('editSubtasks').innerHTML += subtaskHTML;
}


// ADD SUBTASK
function addSubtask() {
    let addSubtask = document.getElementById('subtaskSelect').value;

    if (addSubtask.trim() !== "") {
        subtaskCounter++; 

        let subtaskDivId = `subtaskDiv_${subtaskCounter}`;
        let subtaskUlId = `subtaskUl_${subtaskCounter}`;
        let subtaskLiId = `subtaskLi_${subtaskCounter}`;

        createSubtaskElement(addSubtask, subtaskDivId, subtaskUlId, subtaskLiId);
        document.getElementById('subtaskSelect').value = ""; 
    }
}


function saveSubtask() {
    let subtaskAsText = JSON.stringify(subtask);
    localStorage.setItem('subtask', subtaskAsText);
}


function load() {
    let subtaskAsText = localStorage.getItem('subtask');

    if (subtaskAsText) {
        subtask = JSON.parse(subtaskAsText);
    }
}


// EDIT SUBTASK
function editSubtask(subtaskDivId) {
    let createdSubtask = document.getElementById(subtaskDivId);
    let editSubtask = createdSubtask.innerText;
    createdSubtask.innerHTML = editSubtaskHTML(subtaskDivId, editSubtask);
}


function updateSubtaskText(subtaskDivId, subtaskValue) {
    let subtaskElement = document.getElementById(subtaskDivId);
    if (subtaskElement) {

        let subtaskTextElements = subtaskElement.getElementsByClassName('subtaskText');
        if (subtaskTextElements.length > 0) {
            subtaskTextElements[0].innerText = subtaskValue;
        }
    }
}


// DELETE SUBTASK
function deleteSubtask(subtaskDivId) {
    let deleteSubtask = document.getElementById(subtaskDivId);
    if (deleteSubtask) {
        deleteSubtask.remove();
    }
}


function showDeleteIcon(subtaskDivId) {
    let subtaskDiv = document.getElementById(subtaskDivId);
    if (subtaskDiv) {
        let deleteIcons = subtaskDiv.getElementsByClassName('deleteSubtask');
        if (deleteIcons.length > 0) {
            deleteIcons[0].classList.remove('d-none');
        }
    }
}


// ACCEPT SUBTASK
function acceptSubtask(subtaskDivId) {
    let subtaskInput = document.getElementById(`editSubtask_${subtaskDivId}`);
    let subtaskValue = subtaskInput ? subtaskInput.value.trim() : "";

    updateSubtaskText(subtaskDivId, subtaskValue);

    let subtaskElement = document.getElementById(subtaskDivId);
    if (subtaskElement) {
        subtaskElement.innerHTML =  subtaskChangeHTML(subtaskDivId, subtaskValue);}

    let acceptIcon = document.getElementById(`acceptSubtask_${subtaskDivId}`);
    if (acceptIcon) {
        acceptIcon.classList.add('d-none');
    }
}


function showAcceptIconsIcon(subtaskDivId) {
    let subtaskDiv = document.getElementById(subtaskDivId);
    if (subtaskDiv) {
        let acceptIcons = subtaskDiv.getElementsByClassName('acceptSubtask');
        if (acceptIcons.length > 0) {
            acceptIcons[0].classList.remove('d-none');
        }
    }
}