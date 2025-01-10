/**
 * Adds an event listener to trigger a button click when the Enter key is pressed.
 */
let input = document.getElementById('subtaskSelect');
document.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById('addSubtaskButton').click();
    }
});


let subtaskCounter = 0;


/**
 * Creates and appends a new subtask element to the 'editSubtasks' container.
 * 
 * @param {string} subtaskText - The text for the subtask.
 * @param {string} subtaskDivId - The ID for the subtask's container div.
 * @param {string} subtaskUlId - The ID for the subtask's list (ul).
 * @param {string} subtaskLiId - The ID for the subtask's list item (li).
 */
function createSubtaskElement(subtaskText, subtaskDivId, subtaskUlId, subtaskLiId) {
    let subtaskHTML = createSubtaskElementHTMML(subtaskText, subtaskDivId, subtaskUlId, subtaskLiId);
    document.getElementById('editSubtasks').innerHTML += subtaskHTML;
}


/**
 * Adds a new subtask by creating a subtask element and updating the visibility.
 */
function addSubtask() {
    let addSubtask = document.getElementById('subtaskSelect').value;

    if (addSubtask.trim() !== "") {
        subtaskCounter++;

        let subtaskDivId = `subtaskDiv_${subtaskCounter}`;
        let subtaskUlId = `subtaskUl_${subtaskCounter}`;
        let subtaskLiId = `subtaskLi_${subtaskCounter}`;

        createSubtaskElement(addSubtask, subtaskDivId, subtaskUlId, subtaskLiId);
        document.getElementById('subtaskSelect').value = "";
        updateSubtaskVisibility();
    }
}


/**
 * Updates the visibility of the "no subtasks" message based on the presence of subtasks in the list.
 */
function updateSubtaskVisibility() {
    let subtaskList = document.querySelector('.subtasks-section .subtasks-list');
    let noSubtasksMessage = document.querySelector('.subtasks-section .no-subtasks-message');

    if (noSubtasksMessage) {
        if (subtaskList && subtaskList.children.length > 0) {
            noSubtasksMessage.style.display = "none";
        } else {
            noSubtasksMessage.style.display = "block";
        }
    }
}


/**
 * Saves the current subtask to localStorage as a JSON string.
 */
function saveSubtask() {
    let subtaskAsText = JSON.stringify(subtask);
    localStorage.setItem('subtask', subtaskAsText);
}


/**
 * Loads the subtask from localStorage and parses it into the `subtask` variable.
 */
function load() {
    let subtaskAsText = localStorage.getItem('subtask');

    if (subtaskAsText) {
        subtask = JSON.parse(subtaskAsText);
    }
}


/**
 * Edits a subtask by replacing its content with an editable HTML form.
 * 
 * @param {string} subtaskDivId - The ID of the subtask div to be edited.
 */
function editSubtask(subtaskDivId) {
    let createdSubtask = document.getElementById(subtaskDivId);
    let editSubtask = createdSubtask.innerText;
    createdSubtask.innerHTML = editSubtaskHTML(subtaskDivId, editSubtask);
}


/**
 * Updates the text of a subtask element with the given value.
 * 
 * @param {string} subtaskDivId - The ID of the subtask div to update.
 * @param {string} subtaskValue - The new text to set for the subtask.
 */
function updateSubtaskText(subtaskDivId, subtaskValue) {
    let subtaskElement = document.getElementById(subtaskDivId);
    if (subtaskElement) {

        let subtaskTextElements = subtaskElement.getElementsByClassName('subtaskText');
        if (subtaskTextElements.length > 0) {
            subtaskTextElements[0].innerText = subtaskValue;
        }
    }
}


/**
 * Deletes a subtask element from the DOM based on its ID.
 * 
 * @param {string} subtaskDivId - The ID of the subtask div to be deleted.
 */
function deleteSubtask(subtaskDivId) {
    let deleteSubtask = document.getElementById(subtaskDivId);
    if (deleteSubtask) {
        deleteSubtask.remove();
    }
}


/**
 * Displays the delete icon for a specific subtask by removing the "d-none" class.
 * 
 * @param {string} subtaskDivId - The ID of the subtask div to show the delete icon for.
 */
function showDeleteIcon(subtaskDivId) {
    let subtaskDiv = document.getElementById(subtaskDivId);
    if (subtaskDiv) {
        let deleteIcons = subtaskDiv.getElementsByClassName('deleteSubtask');
        if (deleteIcons.length > 0) {
            deleteIcons[0].classList.remove('d-none');
        }
    }
}


/**
 * Accepts the edited subtask by updating its text and replacing its content with the updated HTML.
 * 
 * @param {string} subtaskDivId - The ID of the subtask div to accept the changes for.
 */
function acceptSubtask(subtaskDivId) {
    let subtaskInput = document.getElementById(`editSubtask_${subtaskDivId}`);
    let subtaskValue = subtaskInput ? subtaskInput.value.trim() : "";

    updateSubtaskText(subtaskDivId, subtaskValue);

    let subtaskElement = document.getElementById(subtaskDivId);
    if (subtaskElement) {
        subtaskElement.innerHTML = subtaskChangeHTML(subtaskDivId, subtaskValue);
    }

    let acceptIcon = document.getElementById(`acceptSubtask_${subtaskDivId}`);
    if (acceptIcon) {
        acceptIcon.classList.add('d-none');
    }
}


/**
 * Displays the accept icon for a specific subtask by removing the "d-none" class.
 * 
 * @param {string} subtaskDivId - The ID of the subtask div to show the accept icon for.
 */
function showAcceptIconsIcon(subtaskDivId) {
    let subtaskDiv = document.getElementById(subtaskDivId);
    if (subtaskDiv) {
        let acceptIcons = subtaskDiv.getElementsByClassName('acceptSubtask');
        if (acceptIcons.length > 0) {
            acceptIcons[0].classList.remove('d-none');
        }
    }
}