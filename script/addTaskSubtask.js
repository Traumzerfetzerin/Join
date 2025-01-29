/**
 * Listens for the "Enter" key press (keyCode 13) and triggers a click on the "addSubtaskButton" when pressed.
 * 
 * @event keyup - Triggers when a key is released on the keyboard.
 * @param {KeyboardEvent} event - The keyup event object.
 */
let input = document.getElementById('subtaskSelect', 'newSubtaskInput');
document.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById('addSubtaskButton').click();
    }
});


let subtaskCounter = 0;


/**
 * Creates a new subtask element and appends it to the 'editSubtasks' container.
 * 
 * @param {string} subtaskText - The text content for the new subtask.
 * @param {string} subtaskDivId - The unique ID for the subtask div element.
 * @param {string} subtaskUlId - The unique ID for the subtask list (ul) element.
 * @param {string} subtaskLiId - The unique ID for the subtask list item (li) element.
 */
function createSubtaskElement(subtaskText, subtaskDivId, subtaskUlId, subtaskLiId) {
    let subtaskHTML = createSubtaskElementHTML(subtaskText, subtaskDivId, subtaskUlId, subtaskLiId);
    document.getElementById('editSubtasks').innerHTML += subtaskHTML;
}


/**
 * Adds a new subtask to the list by creating a subtask element and updating the visibility.
 * It generates unique IDs for the new subtask and resets the input field.
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
 * If there are no subtasks, the message is displayed, otherwise it is hidden.
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
 * Saves the current subtask data to localStorage as a stringified JSON object.
 */
function saveSubtask() {
    let subtaskAsText = JSON.stringify(subtask);
    localStorage.setItem('subtask', subtaskAsText);
}


/**
 * Loads the subtask data from localStorage and parses it into the `subtask` variable.
 */
function load() {
    let subtaskAsText = localStorage.getItem('subtask');

    if (subtaskAsText) {
        subtask = JSON.parse(subtaskAsText);
    }
}


/**
 * Edits the content of a subtask by replacing its inner HTML with an editable version.
 * @param {string} subtaskDivId - The ID of the subtask div to be edited.
 */
function editSubtask(subtaskDivId) {
    let createdSubtask = document.getElementById(subtaskDivId);
    let editSubtask = createdSubtask.innerText;
    createdSubtask.innerHTML = editSubtaskHTML(subtaskDivId, editSubtask);
}


/**
 * Updates the text of a subtask element with the given value.
 * @param {string} subtaskDivId - The ID of the subtask div to update.
 * @param {string} subtaskValue - The new text value to set for the subtask.
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
 * Deletes a subtask element from the DOM based on the provided subtask div ID.
 * @param {string} subtaskDivId - The ID of the subtask div to delete.
 */
function deleteSubtask(subtaskDivId) {
    let deleteSubtask = document.getElementById(subtaskDivId);
    if (deleteSubtask) {
        deleteSubtask.remove();
    }
}


/**
 * Displays the delete icon for a subtask by removing the 'd-none' class.
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
 * Accepts and saves the changes made to a subtask, updating its text and hiding the accept icon.
 * @param {string} subtaskDivId - The ID of the subtask div to be updated.
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
 * Displays the accept icon for the specified subtask.
 * @param {string} subtaskDivId - The ID of the subtask div where the accept icon should be shown.
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