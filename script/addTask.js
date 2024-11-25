const CREATETASK_URL = 'https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks';


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
    document.getElementById('subtaskSelect').value = "";
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
async function saveTaskToFirebase(taskData) {
    try {
        let response = await fetch(`${CREATETASK_URL}/${taskData.category}.json`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
        });

        if (response.ok) {
            let json = await response.json(); // Contains the generated key
            let generatedKey = Object.keys(json)[0]; // The unique key for the task
            console.log("Task created with ID:", generatedKey);

            // Optionally store the task ID in your task object
            taskData.id = generatedKey;

            showToast(`Task created in category: ${taskData.category}`);
            return generatedKey; // Return the key for further use
        } else {
            console.error("Error:", response.statusText);
        }
    } catch (error) {
        console.error("Error saving task:", error);
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

    setTimeout(() => resetBorders([...inputs, assignedTo, categorySelect]), 2000);
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