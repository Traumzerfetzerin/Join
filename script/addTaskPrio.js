let selectedPrio = null;
let prioOptions = [
    { class: "urgent", label: "Urgent", src: "../Assets/addTask/Prio alta.svg", activeSrc: "../Assets/addTask/Prio_alta_white.svg" },
    { class: "medium", label: "Medium", src: "../Assets/addTask/Prio media.svg", activeSrc: "../Assets/addTask/Prio media white.svg" },
    { class: "low", label: "Low", src: "../Assets/addTask/Prio baja.svg", activeSrc: "../Assets/addTask/Prio_baja_white.svg" }
];

function setPrio(priority, context = "normal", event = null) {
    if (event) event.preventDefault();

    let suffix = context === "overlay" ? "Overlay" : "";
    if (!prioOptions || prioOptions.length === 0) {
        console.error("Prio options are not defined or empty.");
        return;
    }

    let buttons = document.querySelectorAll(`.prio-button`);
    buttons.forEach(function (button) {

        button.classList.remove(`low${suffix}White`, `medium${suffix}White`, `urgent${suffix}White`);

        let img = button.querySelector("img");
        let prioClass = button.dataset.prio;
        let option = prioOptions.find(function (opt) {
            return opt.class === prioClass;
        });
        if (img && option) img.src = option.src; 
    });

    let activeButton = document.querySelector(`.prio-button[data-prio="${priority}"]`);
    if (activeButton) {
        activeButton.classList.add(`${priority}${suffix}White`);
        let img = activeButton.querySelector("img");
        let activeOption = prioOptions.find(function (opt) {
            return opt.class === priority;
        });
        if (img && activeOption) img.src = activeOption.activeSrc; 
    } else {
        console.warn(`No button found for priority: ${priority}`);
    }

    selectedPrio = priority;
    selectedPrioBoard = priority;

    console.log("Priority set to:", priority);
}


/**
 * Renders the priority buttons inside the specified container.
 * Ensures the container exists and fills it with generated buttons.
 * Marks the "medium" button as default.
 * @param {string} containerSelector - The CSS selector of the container.
 * @param {string} context - Context for the buttons ('normal' or 'overlay').
 */
function renderPrioButtons(containerSelector, context = "normal") {
    console.log("Checking for container:", containerSelector);
    let prioButtonsContainer = document.querySelector(containerSelector);
    if (!prioButtonsContainer) {
        return;
    }

    console.log("Prio Buttons Container found:", prioButtonsContainer);
    prioButtonsContainer.innerHTML = generatePrioButtonsHTML(null, "setPrio", context === "overlay" ? "Overlay" : "");
    setPrio("medium", context);
}


document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded");
    renderPrioButtons(".prioButtonsContainer", "normal");
});


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