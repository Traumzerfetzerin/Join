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
    selectedPrioBoard = priority;
}


/**
 * Renders the priority buttons inside the prioButtonsContainer.
 * Ensures the container exists and fills it with generated buttons.
 * Marks the "medium" button as default.
 */
function renderAddTaskPrioButtons() {
    let prioButtonsContainer = document.getElementById("prioButtonsContainer");
    if (!prioButtonsContainer) {
        console.error("Prio Buttons Container not found.");
        return;
    }

    prioButtonsContainer.innerHTML = generatePrioButtonsHTMLAddTask(null, "setPrio");
    setPrio("medium");
}


/**
 * Generates the HTML for priority buttons and binds click events.
 * Ensures the priority buttons are correctly generated with appropriate classes and event handlers.
 * @param {string|null} selectedPrio - The selected priority (e.g., "urgent", "medium", "low").
 * @param {string} onClickHandler - Name of the function to handle button clicks.
 * @returns {string} - HTML for the priority buttons.
 */
function generatePrioButtonsHTMLAddTask(selectedPrio, onClickHandler) {
    let prioOptions = [
        { id: "urgent", label: "Urgent", src: "../Assets/addTask/Prio alta.svg", activeSrc: "../Assets/addTask/Prio_alta_white.svg" },
        { id: "medium", label: "Medium", src: "../Assets/addTask/Prio media.svg", activeSrc: "../Assets/addTask/Prio media white.svg" },
        { id: "low", label: "Low", src: "../Assets/addTask/Prio baja.svg", activeSrc: "../Assets/addTask/Prio_baja_white.svg" }
    ];

    return `
        <div class="fonts font_2A3647">Prio</div>
        <div class="flex space-between">
            ${prioOptions.map(option => `
                <button 
                    id="${option.id}" 
                    type="button" 
                    class="prioButton cursorPointer fonts ${selectedPrio === option.id ? `${option.id}White` : ""}" 
                    onclick="${onClickHandler}('${option.id}', event)">
                    ${option.label}
                    <img 
                        id="${option.id}Svg" 
                        src="${selectedPrio === option.id ? option.activeSrc : option.src}" 
                        alt="${option.label}">
                </button>
            `).join("")}
        </div>
    `;
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

/**
 * Initializes the priority buttons in the edit overlay.
 * @param {string|null} selectedPrio - The currently selected priority (e.g., "urgent", "medium", "low").
 */
function initializePrioButtons(selectedPrio) {
    if (!selectedPrio) selectedPrio = "medium";
    let prioButtons = document.querySelectorAll('.overlay-content .prio-button');
    prioButtons.forEach(button => {
        let prio = button.getAttribute('data-priority');
        button.classList.remove('lowWhite', 'mediumWhite', 'urgentWhite');
        if (prio === selectedPrio) button.classList.add(`${prio}White`);
        button.onclick = function () {
            prioButtons.forEach(btn => btn.classList.remove('lowWhite', 'mediumWhite', 'urgentWhite'));
            button.classList.add(`${prio}White`);
            selectedPrio = prio;
        };
    });
}
