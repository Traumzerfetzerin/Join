const CREATETASK_URL = 'https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks';


// Call the function to load contacts when the page loads
window.onload = function () {
    loadContactsForDropdown();
    setMinDueDate(); 
};


// CALCULATE DUE DATE
function calculateDueDate() {
    let duoDate = new Date();
    let formattedDate = duoDate.toISOString().split('T')[0];
    document.getElementById('dueDate').setAttribute('min', formattedDate);
}


// CATEGORY
function selectTechnicalTask() {
    document.getElementById('categorySelect').value = "Technical Task";
    toggleDropdownCategory();
}


function selectUserStory() {
    document.getElementById('categorySelect').value = "User Story";
    toggleDropdownCategory();
}


function toggleDropdownCategory() {
    let categoryDropdown = document.getElementById('categoryDropdown');
    let dropdownImg = document.getElementById('dropdownCategory');
    let dropdownImg1 = document.getElementById('dropdownCategory1');

    if (categoryDropdown.classList.contains('d-none')) {
        categoryDropdown.classList.remove('d-none');
        dropdownImg.classList.add('d-none');
        dropdownImg1.classList.remove('d-none');
    } else {
        categoryDropdown.classList.add('d-none');
        dropdownImg.classList.remove('d-none');
        dropdownImg1.classList.add('d-none');
    }
}


// CLOSE DROPDOWN
document.addEventListener('click', function (event) {
    let categoryDropdown = document.getElementById('categoryDropdown');
    let categoryInputContainer = document.getElementById('inputCategory');
    let dropdownImg = document.getElementById('dropdownCategory');
    let dropdownImg1 = document.getElementById('dropdownCategory1');

    if (!categoryInputContainer.contains(event.target)) {
        categoryDropdown.classList.add('d-none');
        dropdownImg.classList.remove('d-none');
        dropdownImg1.classList.add('d-none');
    }
});


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
let subtaskDivId = `subtaskDiv_${subtaskCounter}`;
let subtaskUlId = `subtaskUl_${subtaskCounter}`;
let subtaskLiId = `subtaskLi_${subtaskCounter}`;


function createSubtaskElement(subtaskText) {
    let subtaskHTML = createSubtaskElementHTMML(subtaskText);

    document.getElementById('editSubtasks').innerHTML += subtaskHTML;
    subtaskCounter++;
}


// ADD SUBTASK
function addSubtask() {
    let addSubtask = document.getElementById('subtaskSelect').value;

    if (addSubtask.trim() !== "") {
        createSubtaskElement(addSubtask);
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


function acceptSubtask(subtaskDivId) {
    let subtaskInput = document.getElementById(`editSubtask_${subtaskDivId}`);
    let subtaskValue = subtaskInput.value;

    if (subtaskValue.trim() === "") {
        return;
    }

    updateSubtaskText(subtaskDivId, subtaskValue);

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


// CLEAR BUTTON
async function clearTasks() {
    document.getElementById('inputTitle').value = "";
    document.getElementById('textareaDescription').value = "";
    document.getElementById('dueDate').value = "";
    document.getElementById('categorySelect').value = "";
    document.getElementById('editSubtasks').value = "";
    document.getElementById('assigned-to').value = "";
    document.getElementById('assignTaskDropdown').value = "";
    document.getElementById('categorySelect').selectedIndex = 0;
    document.getElementById('categoryDropdown').classList.add('d-none');
    // contacts.forEach(contact => {
    //     document.getElementById(`checkbox_${contact.name.replace(/\s+/g, '_')} `).checked = false;
    // });
    clearPrioButtons();
}


let taskCategory = "";

/**
 * Creates a new task and sends it to Firebase.
 * @param {Event} event - Prevents default form submission.
 */
async function createTasks(event) {
    event.preventDefault();
    let taskData = collectTaskData();
    if (!validateTaskData(taskData)) return;

    document.getElementById('editSubtasks').innerHTML = "";
    await saveTaskToFirebase(taskData);
    await finalizeTaskCreation();
}

/**
 * Collects data from the form and returns it as an object.
 * @returns {Object} - Task data.
 */
function collectTaskData() {
    let subtasks = Array.from(
        document.querySelectorAll('#editSubtasks li')
    ).map(li => li.textContent);

    return {
        title: document.getElementById('inputTitle').value,
        description: document.getElementById('textareaDescription').value,
        dueDate: document.getElementById('dueDate').value,
        prio: selectedPrio,
        status: "to do",
        contacts: selectedContacts,
        subtasks: subtasks,
        category: document.getElementById('categorySelect').value
    };
}

/**
 * Validates the task data.
 * @param {Object} data - The task data to validate.
 * @returns {boolean} - Returns true if valid, otherwise false.
 */
async function validateTaskData(data) {
    if (!data.title || !data.dueDate || !data.prio || data.category === '0') {
        await popUpRequired();
        await redBorder();
        return false;
    }
    return true;
}

/**
 * Sends the task data to Firebase.
 * @param {Object} taskData - The task data to save.
 */
async function saveTaskToFirebase(taskData) {
    try {
        let response = await fetch(
            `${CREATETASK_URL}/${taskData.category}.json`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

        if (response.ok) {
            let json = await response.json();
            console.log('Task created:', json);
            showToast(`Task created in category: ${taskData.category}`);
        } else console.error('Error:', response.statusText);
    } catch (error) {
        console.error('Error saving:', error);
    }
}


async function finalizeTaskCreation() {
    await redBorder();
    await popUpAddTask();
    await closeTask();
}


/**
 * Highlights invalid inputs and resets their border after 2 seconds.
 */
async function redBorder() {
    let inputs = document.querySelectorAll('input:required:invalid');
    let assignedTo = document.getElementById('assigned-to');
    let categorySelect = document.getElementById('categorySelect');

    highlightInvalid(inputs);
    if (!assignedTo.value) highlightElement(assignedTo);
    if (!categorySelect.value) highlightElement(categorySelect);

    setTimeout(() => resetBorders([ ...inputs, assignedTo, categorySelect ]), 2000);
}

/**
 * Adds a red border to invalid elements.
 * @param {NodeList} elements - List of elements to highlight.
 */
function highlightInvalid(elements) {
    elements.forEach(el => el.style.border = '2px solid #FF3D00');
}

/**
 * Highlights a specific element.
 * @param {HTMLElement} element - Element to highlight.
 */
function highlightElement(element) {
    element.style.border = '2px solid #FF3D00';
}

/**
 * Resets the border for given elements.
 * @param {HTMLElement[]} elements - Elements to reset.
 */
function resetBorders(elements) {
    elements.forEach(el => (el.style.border = ''));
}


async function popUpRequired() {
    let popUpElement = document.getElementById('popUpRequired');

    popUpElement.classList.remove('d-none');

    popUpElement.innerHTML = popUpRequiredHTML();

    setTimeout(() => {
        popUpElement.classList.add('d-none');
    }, 1000);
}


// POP UP ADD TASK
async function popUpAddTask() {
    document.getElementById('popUpAddTask').classList.remove('d-none');
    document.getElementById('popUpAddTask').innerHTML = popUpAddTaskHTML();
    document.getElementById('inputTitle').value = "";
    document.getElementById('textareaDescription').value = "";
    document.getElementById('dueDate').value = "";
    document.getElementById('categorySelect').value = "";

    setTimeout(() => {
        document.getElementById("popUpAddTask").style.display = "none";
    }, 1000);
}