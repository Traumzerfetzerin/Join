let selectedPrio = null;

/**
 * Sets the selected priority and updates the corresponding button and icon.
 * @param {string} priority - The priority to set ('low', 'medium', 'urgent').
 * @param {Event|null} event - Optional event to prevent default behavior.
 */
function setPrio(priority, event = null) {
    if (event) event.preventDefault();

    let prioOptions = [
        { id: "urgent", label: "Urgent", src: "../Assets/addTask/Prio alta.svg", activeSrc: "../Assets/addTask/Prio_alta_white.svg" },
        { id: "medium", label: "Medium", src: "../Assets/addTask/Prio media.svg", activeSrc: "../Assets/addTask/Prio media white.svg" },
        { id: "low", label: "Low", src: "../Assets/addTask/Prio baja.svg", activeSrc: "../Assets/addTask/Prio_baja_white.svg" }
    ];

    prioOptions.forEach(option => {
        let button = document.getElementById(option.id);
        let img = document.getElementById(`${option.id}Svg`);

        if (button) button.classList.remove("lowWhite", "mediumWhite", "urgentWhite");
        if (img) img.src = option.src; 
    });

    let activeButton = document.getElementById(priority);
    let activeImg = document.getElementById(`${priority}Svg`);

    if (activeButton) activeButton.classList.add(`${priority}White`);
    if (activeImg) {
        let activeOption = prioOptions.find(option => option.id === priority);
        if (activeOption) activeImg.src = activeOption.activeSrc; 
    }

    selectedPrio = priority;
}


/**
 * Renders the priority buttons inside the prioButtonsContainer.
 * Ensures the container exists and fills it with generated buttons.
 */
function renderAddTaskPrioButtons() {
    let prioButtonsContainer = document.getElementById("prioButtonsContainer");
    if (!prioButtonsContainer) {
        console.error("Prio Buttons Container not found.");
        return;
    }

    prioButtonsContainer.innerHTML = generatePrioButtonsHTML(null, "setPrio");
    console.log("Prio Buttons successfully rendered.");
}

/**
 * Marks the selected priority in the edit overlay based on the task data.
 * @param {string} priority - The priority value from the task.
 */
function markSelectedPriority(priority) {
    let buttons = document.querySelectorAll(".prio-button");
    buttons.forEach(button => {
        button.classList.remove("lowWhite", "mediumWhite", "urgentWhite");
        if (button.dataset.prio === priority) {
            button.classList.add(`${priority}White`);
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