/**
 * Enables editing of a subtask in edit mode.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @param {number} subtaskIndex - The index of the subtask to edit.
 */
function editSubtaskEdit(taskId, category, subtaskIndex) {
    let subtaskElement = getSubtaskElement(subtaskIndex);
    if (!subtaskElement) return;

    let currentText = subtaskElement.querySelector('.editSubtaskText').innerText;
    if (!toggleExistingInput(subtaskElement, subtaskIndex, currentText)) {
        createEditInput(subtaskElement, subtaskIndex, taskId, category, currentText);
    }
    updateSubtaskDisplay(subtaskElement, false);
}


/**
 * Retrieves the subtask element by its index.
 * @param {number} subtaskIndex - The index of the subtask.
 * @returns {HTMLElement|null} The subtask element or null if not found.
 */
function getSubtaskElement(subtaskIndex) {
    return document.getElementById(`subtaskDiv_${subtaskIndex}`);
}

/**
 * Toggles the display of an existing input field.
 * @param {HTMLElement} subtaskElement - The subtask element.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {string} currentText - The current text of the subtask.
 * @returns {boolean} True if the input field exists, false otherwise.
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
 * Creates an input field for editing the subtask.
 * @param {HTMLElement} subtaskElement - The subtask element.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @param {string} currentText - The current text of the subtask.
 */
function createEditInput(subtaskElement, subtaskIndex, taskId, category, currentText) {
    let inputHtml = `
        <input type="text" id="editSubtaskInput_${subtaskIndex}" class="edit-subtask-input" value="${currentText}" 
               onblur="saveSubtaskEdit('${taskId}', '${category}', ${subtaskIndex})">
        <button class="save-subtask-button" onclick="saveSubtaskEdit('${taskId}', '${category}', ${subtaskIndex})">Save</button>
    `;
    subtaskElement.innerHTML += inputHtml;
}


/**
 * Updates the display of a subtask element.
 * @param {HTMLElement} subtaskElement - The subtask element.
 * @param {boolean} show - Whether to show or hide the text and icons.
 */
function updateSubtaskDisplay(subtaskElement, show) {
    subtaskElement.querySelector('.editSubtaskText').style.display = show ? 'block' : 'none';
    subtaskElement.querySelector('.subtask-icons').style.display = show ? 'flex' : 'none';
    subtaskElement.classList.toggle('editing', !show);
}


/**
 * Saves the changes to a subtask in edit mode.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 * @param {number} subtaskIndex - The index of the subtask to save.
 */
async function saveSubtaskEdit(taskId, category, subtaskIndex) {
    let inputField = document.getElementById(`editSubtaskInput_${subtaskIndex}`);
    if (!inputField) {
        console.error("Input field not found.");
        return;
    }

    let newText = inputField.value.trim();
    let subtaskElement = document.getElementById(`subtaskDiv_${subtaskIndex}`);
    let subtaskTextElement = subtaskElement.querySelector('.editSubtaskText');

    subtaskTextElement.innerText = newText;
    subtaskTextElement.style.display = 'block';
    subtaskElement.querySelector('.subtask-icons').style.display = 'flex';

    inputField.style.display = 'none';
    inputField.nextElementSibling.style.display = 'none';
    subtaskElement.classList.remove('editing');

    let task = await fetchTaskById(category, taskId);
    if (!task || !Array.isArray(task.subtasks)) {
        console.error("Task or subtasks not found.");
        return;
    }
    task.subtasks[subtaskIndex].text = newText;

    try {
        await updateTaskInDatabase(category, taskId, task);
        console.log(`Subtask ${subtaskIndex} updated successfully.`);
    } catch (error) {
        console.error("Error saving subtask to Firebase:", error);
    }
}


/**
 * Adds a new subtask to the list in edit mode.
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category of the task.
 */
function addNewSubtask(taskId, category) {
    let newSubtaskInput = document.getElementById('newSubtaskInput');
    let subtaskText = newSubtaskInput.value.trim();
    if (subtaskText === "") return;

    let subtaskContainer = document.querySelector('.subtasks-list');
    let subtaskIndex = subtaskContainer.querySelectorAll('.subtask-item').length;
    let subtaskHTML = `
        <div id="subtaskDiv_${subtaskIndex}" class="subtask-item">
            <span contenteditable="true" class="editSubtaskText">${subtaskText}</span>
            <div class="subtask-icons">
                <img class="editSubtask" src="../Assets/addTask/Property 1=edit.svg" 
                     alt="Edit" onclick="editSubtaskEdit('${taskId}', '${category}', ${subtaskIndex}')">
                <img class="deleteSubtask" src="../Assets/addTask/Property 1=delete.svg" 
                     alt="Delete" onclick="deleteSubtaskEdit('${taskId}', '${category}', ${subtaskIndex}')">
            </div>
        </div>
    `;
    subtaskContainer.insertAdjacentHTML('beforeend', subtaskHTML);
    newSubtaskInput.value = "";
}


/**
 * Renders the subtasks in edit mode.
 * @param {Object} task - The task containing the subtasks.
 * @param {string} category - The category of the task.
 */
function renderSubtasksInEditMode(task, category) {
    let subtaskContainer = document.querySelector('.subtasks-section .subtasks-list');
    if (!subtaskContainer) return;

    subtaskContainer.innerHTML = `<div class="editSubtaskInput">
        <input type="text" id="newSubtaskInput" placeholder="Add new subtask" autocomplete="off">
        <div class="seperatorSubtaskEditInput"></div>
        <img id="addSubtaskButton" class="subtaskImg cursorPointer" src="../Assets/addTask/Property 1=add.svg" alt="Add" onclick="addNewSubtask('${task.id}', '${category}')">
        </div>
    `;

    if (!Array.isArray(task.subtasks) || task.subtasks.length === 0) {
        subtaskContainer.innerHTML += "<div>No subtasks available</div>";
    } else {
        task.subtasks.forEach((subtask, index) => {
            let subtaskHTML = `
                <div id="subtaskDiv_${index}" class="subtask-item">
                    <span class="editSubtaskText" contenteditable="true">${subtask.text}</span>
                    <div class="subtask-icons">
                        <img class="editSubtask" src="../Assets/addTask/Property 1=edit.svg" 
                             alt="Edit" onclick="editSubtaskEdit('${task.id}', '${category}', ${index})">
                        <img class="deleteSubtask" src="../Assets/addTask/Property 1=delete.svg" 
                             alt="Delete" onclick="deleteSubtask('${task.id}', '${category}', ${index})">
                    </div>
                </div>
            `;
            subtaskContainer.innerHTML += subtaskHTML;
        });
    }
}
