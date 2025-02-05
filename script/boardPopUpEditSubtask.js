/**
 * Enables the edit mode for a subtask and displays the input field.
 * Hides the subtask text and shows the editing input field.
 * 
 * @param {number} taskId - The ID of the task to which the subtask belongs.
 * @param {string} category - The category of the subtask.
 * @param {number} subtaskIndex - The index of the subtask in the list.
 */
function editSubtaskEdit(taskId, category, subtaskIndex) {
    let subtaskElement = getSubtaskElement(subtaskIndex);
    if (!subtaskElement) return;
    let textElement = subtaskElement.querySelector('.editSubtaskText');
    if (!textElement) {
        textElement = document.createElement("span");
        textElement.classList.add("editSubtaskText");
        subtaskElement.appendChild(textElement);
    }
    let currentText = textElement.innerText.trim();
    if (!currentText) {
        console.error("No text found in subtask element:", subtaskElement);
        return;
    }
    subtaskElement.classList.add('editing');
    textElement.style.display = 'none';
    createEditInput(subtaskElement, subtaskIndex, taskId, category, currentText);
}


/**
 * Toggles the visibility of the subtask text and icons.
 * 
 * @param {HTMLElement} subtaskElement - The subtask element that contains the text and icons.
 * @param {boolean} show - Determines whether to show or hide the subtask text and icons.
 */
function toggleSubtaskDisplay(subtaskElement, show) {
    let textElement = subtaskElement.querySelector('.editSubtaskText');
    let subtaskIcons = subtaskElement.querySelector('.subtask-icons');

    if (show) {
        textElement.style.display = 'block';
        subtaskIcons.style.display = 'flex';
    } else {
        textElement.style.display = 'none';
        subtaskIcons.style.display = 'none';
    }
}


/**
 * Toggles the display of an existing input field for editing a subtask.
 * 
 * @param {HTMLElement} subtaskElement - The subtask element that contains the input field.
 * @param {number} subtaskIndex - The index of the subtask being edited.
 * @param {string} currentText - The current text of the subtask to be displayed in the input field.
 * @returns {boolean} Returns true if an existing input field is found and displayed, otherwise false.
 */
function toggleExistingInput(subtaskElement, subtaskIndex, currentText) {
    let existingInput = document.getElementById(`editSubtaskInput_${subtaskIndex}`);
    if (existingInput) {
        existingInput.value = currentText;
        existingInput.style.display = 'block';
        existingInput.nextElementSibling.style.display = 'inline-block';
        return true;
    }
    return false;
}


/**
 * Inserts the edit input field into the subtask element and sets up event listeners.
 * 
 * @param {HTMLElement} subtaskElement - The subtask element where the input field will be inserted.
 * @param {number} subtaskIndex - The index of the subtask being edited.
 * @param {string} taskId - The ID of the task to which the subtask belongs.
 * @param {string} category - The category of the task.
 * @param {string} currentText - The current text of the subtask to be displayed in the input field.
 */
function createEditInput(subtaskElement, subtaskIndex, taskId, category, currentText) {
    subtaskElement.innerHTML = generateEditSubtaskHTML(subtaskIndex, taskId, category, currentText);
    let saveButton = subtaskElement.querySelector('.save-subtask-button');
    let inputField = subtaskElement.querySelector(`#editSubtaskInput_${subtaskIndex}`);

    if (!saveButton || !inputField) {
        console.error(`Could not find input field or save button for subtask ${subtaskIndex}`);
        return;
    }

    setupEditSubtaskEventListeners(subtaskElement, saveButton, inputField, subtaskIndex, taskId, category);
}


/**
 * Sets up event listeners for the subtask input field and save button.
 * 
 * @param {HTMLElement} subtaskElement - The subtask element.
 * @param {HTMLElement} saveButton - The button to save the edited subtask.
 * @param {HTMLElement} inputField - The input field for editing the subtask.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 */
function setupEditSubtaskEventListeners(subtaskElement, saveButton, inputField, subtaskIndex, taskId, category) {
    saveButton.onclick = function () {
        let updatedText = inputField.value.trim();
        if (updatedText) {
            updateSubtaskElements(subtaskElement, inputField, updatedText);
            saveSubtaskEdit(taskId, category, subtaskIndex, updatedText);
        } else {
            console.error("Subtask text cannot be empty.");
        }
    };

    inputField.onkeydown = function (event) {
        if (event.key === "Enter") {
            saveButton.click();
        }
    };

    inputField.focus();
}



/**
 * Creates an input field for editing a subtask within the given subtask element.
 * 
 * @param {number} subtaskIndex - The index of the subtask being edited.
 * @param {string} taskId - The ID of the task to which the subtask belongs.
 * @param {string} category - The category of the task.
 * @param {string} currentText - The current text of the subtask to be displayed in the input field.
 * @returns {string} - The HTML string for the input field.
 */
function generateEditSubtaskHTML(subtaskIndex, taskId, category, currentText) {
    return /*HTML*/`
    <div class="edit-subtask-container">
        <input type="text" id="editSubtaskInput_${subtaskIndex}" class="edit-subtask-input" value="${currentText}">
        <img class="save-subtask-button"
            src="../Assets/addTask/Property 1=check.svg" alt="Save subtask">
        <img class="deleteSubtask" src="../Assets/addTask/Property 1=delete.svg" alt="Delete subtask"
            onclick="deleteSubtaskOnBoard('${taskId}', '${category}', ${subtaskIndex})">
    </div>
    `;
}


/**
 * Saves the edited subtask text, updates the UI, and marks the subtask for saving.
 * 
 * @param {string} taskId - The ID of the task to which the subtask belongs.
 * @param {string} category - The category of the task.
 * @param {number} subtaskIndex - The index of the subtask being edited.
 */
function saveSubtaskEdit(taskId, category, subtaskIndex) {
    let inputField = getInputField(subtaskIndex);
    if (!inputField) return;

    let newText = getTrimmedText(inputField);
    if (!newText) return;

    let subtaskElement = getSubtaskElement(subtaskIndex);
    if (!subtaskElement) return;

    updateSubtaskElements(subtaskElement, inputField, newText);
    subtaskElement.classList.remove('editing');

    markSubtaskForSaving(taskId, category, subtaskIndex, newText);
}

/**
 * Marks a subtask for saving by storing changes temporarily.
 * 
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {string} newText - The updated subtask text.
 */
function markSubtaskForSaving(taskId, category, subtaskIndex, newText) {
    let task = findTaskById(taskId, category);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) return;

    task.subtasks[subtaskIndex].text = newText;
}


/**
 * Retrieves the input field element for a specific subtask by its index.
 * 
 * @param {number} subtaskIndex - The index of the subtask whose input field is to be retrieved.
 * @returns {HTMLInputElement|null} - The input field element if found, otherwise null.
 */
function getInputField(subtaskIndex) {
    let inputField = document.getElementById(`editSubtaskInput_${subtaskIndex}`);
    if (!inputField) {
        console.error("Input field not found.");
        return null;
    }
    return inputField;
}


/**
 * Retrieves and trims the text from the input field.
 * 
 * @param {HTMLInputElement} inputField - The input field element from which to retrieve the text.
 * @returns {string} - The trimmed text from the input field. Returns an empty string if the text is empty.
 */
function getTrimmedText(inputField) {
    let newText = inputField.value.trim();
    if (!newText) {
        console.error("Subtask text is empty.");
        return "";
    }
    return newText;
}


/**
 * Retrieves the subtask element by its index.
 * 
 * @param {number} subtaskIndex - The index of the subtask element to retrieve.
 * @returns {HTMLElement|null} - The subtask element if found, otherwise null.
 */
function getSubtaskElement(subtaskIndex) {
    let subtaskElement = document.getElementById(`subtaskDiv_${subtaskIndex}`);
    if (!subtaskElement) {
        console.error("Subtask element not found for index:", subtaskIndex);
        return null;
    }
    return subtaskElement;
}


/**
* Updates the subtask elements by restoring the text and ensuring correct structure.
*
* @param {HTMLElement} subtaskElement - The subtask container element.
* @param {HTMLElement} inputField - The input field where the new text is entered.
* @param {string} newText - The updated text for the subtask.
* @param {string} taskId - The ID of the task.
* @param {string} category - The category of the task.
* @param {number} index - The index of the subtask in the list.
*/
function updateSubtaskElements(subtaskElement, inputField, newText, taskId, category, index) {
    if (!subtaskElement) return;
    subtaskElement.innerHTML = generateSubtaskHTML(newText, taskId, category, index);
    addSubtaskEventListeners(subtaskElement);
    if (inputField) inputField.remove();
    subtaskElement.classList.remove('editing');
}


/**
 * Saves the updated subtask text to the database.
 * 
 * @param {string} taskId - The ID of the task containing the subtask.
 * @param {string} category - The category of the task.
 * @param {number} subtaskIndex - The index of the subtask to be updated.
 * @param {string} newText - The new text to be saved for the subtask.
 * @returns {Promise<void>} - A promise that resolves when the subtask is saved successfully or rejects if an error occurs.
 */
async function saveSubtaskToDatabase(taskId, category, subtaskIndex, newText) {
    let task = await fetchTaskById(category, taskId);
    if (!task || !Array.isArray(task.subtasks)) {
        console.error("Task or subtasks not found.");
        return;
    }
    task.subtasks[subtaskIndex].text = newText;
    try {
        await updateTaskInDatabase(category, taskId, task);;
    } catch (error) {
        console.error("Error saving subtask to Firebase:", error);
    }
}


/**
* Adds a new subtask to the task by creating a new subtask element.
*
* @param {string} taskId - The ID of the task to which the subtask belongs.
* @param {string} category - The category of the task.
*/
function addNewSubtask(taskId, category) {
    let newSubtaskInput = document.getElementById('newSubtaskInput');
    let subtaskText = newSubtaskInput.value.trim();
    if (subtaskText === "") return;
    let subtaskContainer = document.querySelector('.subtasks-list');
    let subtaskIndex = subtaskContainer.querySelectorAll('.subtask-item').length;
    let subtaskHTML = generateSubtaskHTML(subtaskText, taskId, category, subtaskIndex);
    subtaskContainer.insertAdjacentHTML('beforeend', subtaskHTML);
    let newSubtaskElement = document.getElementById(`subtaskDiv_${subtaskIndex}`);
    addSubtaskEventListeners(newSubtaskElement, taskId, category, subtaskIndex);
    newSubtaskInput.value = "";
}


/**
 * Renders the subtasks in the edit mode for a given task, allowing the user to add, edit, and delete subtasks.
 * 
 * @param {Object} task - The task object containing subtasks to be rendered.
 * @param {string} category - The category of the task.
 */
function renderSubtasksInEditMode(task, category) {
    let subtaskContainer = document.querySelector('.subtasks-section .subtasks-list');
    if (!subtaskContainer) return;

    subtaskContainer.innerHTML = generateSubtaskInputHTML(task.id, category);
    subtaskContainer.innerHTML += generateSubtaskTemplate(task, category);
}


/**
 * Displays the subtask marker when a subtask is being edited.
 * 
 * @param {number} index - The index of the subtask.
 */
function showSubtaskMarker(index) {
    let subtaskElement = document.getElementById(`subtaskDiv_${index}`);
    let markerElement = document.getElementById(`subtaskMarker_${index}`);

    if (subtaskElement && markerElement) {
        subtaskElement.classList.add('editing');
        markerElement.style.display = 'inline';
    } else {
        console.error(`Subtask with ID subtaskDiv_${index} not found.`);
    }
}

/**
 * Hides the subtask marker when a subtask edit is completed.
 * 
 * @param {number} index - The index of the subtask.
 */
function hideSubtaskMarker(index) {
    let subtaskElement = document.getElementById(`subtaskDiv_${index}`);
    let markerElement = document.getElementById(`subtaskMarker_${index}`);

    if (subtaskElement && markerElement) {
        subtaskElement.classList.remove('editing');
        markerElement.style.display = 'none';
    }
}

/**
 * Adds event listeners for showing and hiding subtask markers when editing.
 */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.editSubtask').forEach((editBtn, index) => {
        editBtn.addEventListener('click', () => showSubtaskMarker(index));
    });

    document.querySelectorAll('.save-subtask-button').forEach((saveBtn, index) => {
        saveBtn.addEventListener('click', () => hideSubtaskMarker(index));
    });
});



/**
* Adds event listeners to the edit and delete buttons of a subtask using event delegation.
*
* @param {HTMLElement} subtaskContainer - The container element for all subtasks.
*/
function addSubtaskEventListeners(subtaskContainer) {
    if (!subtaskContainer) return;
    subtaskContainer.addEventListener("click", function(event) {
        let target = event.target;

        if (target.classList.contains("editSubtask")) {
            let taskId = target.getAttribute("data-task-id");
            let category = target.getAttribute("data-category");
            let index = parseInt(target.getAttribute("data-index"));
            editSubtaskEdit(taskId, category, index);
        }
        if (target.classList.contains("deleteSubtask")) {
            let taskId = target.getAttribute("data-task-id");
            let category = target.getAttribute("data-category");
            let index = parseInt(target.getAttribute("data-index"));
            deleteSubtask(taskId, category, index);
        }
    });
}