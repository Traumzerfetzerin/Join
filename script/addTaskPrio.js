let selectedPrio = null;

/**
 * Sets the selected priority and updates the corresponding button and icon.
 * @param {string} priority - The priority to set (e.g., 'low', 'medium', 'urgent').
 * @param {Event|null} event - The event to prevent default behavior (optional).
 */
function setPrio(priority, event = null) {
    if (event) event.preventDefault();

    let prioOptions = [
        { id: "urgent", label: "Urgent", src: "../Assets/addTask/Prio alta.svg", activeSrc: "../Assets/addTask/Prio_alta_white.svg" },
        { id: "medium", label: "Medium", src: "../Assets/addTask/Prio media.svg", activeSrc: "../Assets/addTask/Prio media white.svg" },
        { id: "low", label: "Low", src: "../Assets/addTask/Prio baja.svg", activeSrc: "../Assets/addTask/Prio_baja_white.svg" }
    ]

    prioOptions.forEach(option => {
        let button = document.getElementById(option.id);
        let img = document.getElementById(`${option.id}Svg`);

        if (button) button.classList.remove("active");
        if (img) img.src = option.src;
    });

    let activeButton = document.getElementById(priority);
    let activeImg = document.getElementById(`${priority}Svg`);

    if (activeButton) activeButton.classList.add("active");
    if (activeImg) activeImg.src = prioOptions.find(option => option.id === priority).activeSrc;
}


/**
 * Renders the priority buttons in the Add Task form.
 */
function renderAddTaskPrioButtons() {
    let prioButtonsContainer = document.getElementById("prioButtonsContainer");
    if (!prioButtonsContainer) {
        console.error("Prio buttons container not found.");
        return;
    }
    prioButtonsContainer.innerHTML = generatePrioButtonsHTML(null, "setPrio");
}

window.onload = function () {
    renderAddTaskPrioButtons();
};

/**
 * Marks the selected priority in the edit overlay based on the task data.
 * @param {string} priority - The priority value from the task.
 */
function markSelectedPriority(priority) {
    let priorityButtons = document.querySelectorAll('.prio-button');
    priorityButtons.forEach(button => {
        if (button.dataset.prio === priority) {
            button.classList.add('selected-prio');
        } else {
            button.classList.remove('selected-prio');
        }
    });
}

/**
 * Updates the selected priority in the task data and marks it in the UI.
 * @param {string} priority - The new priority value.
 */
function updatePriority(priority) {
    selectedPrioBoard = priority;
    markSelectedPriority(priority);
}