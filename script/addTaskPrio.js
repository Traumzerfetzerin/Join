let selectedPrio = null;
let prioOptions = [
    { class: "urgent", label: "Urgent", src: "../Assets/addTask/Prio alta.svg", activeSrc: "../Assets/addTask/Prio_alta_white.svg" },
    { class: "medium", label: "Medium", src: "../Assets/addTask/Prio media.svg", activeSrc: "../Assets/addTask/Prio media white.svg" },
    { class: "low", label: "Low", src: "../Assets/addTask/Prio baja.svg", activeSrc: "../Assets/addTask/Prio_baja_white.svg" }
];


/**
 * Resets the priority buttons by removing selected styles and restoring default images.
 * 
 * @param {string} containerSelector - The CSS selector for the container holding the priority buttons.
 */
function resetPrioButtons(containerSelector) {
    let buttons = document.querySelectorAll(`${containerSelector} .prio-button`);

    buttons.forEach(button => {
        button.classList.remove("lowWhite", "mediumWhite", "urgentWhite");
        let img = button.querySelector("img");
        let prioClass = button.dataset.prio;
        let option = prioOptions.find(opt => opt.class === prioClass);
        if (img && option) img.src = option.src;
    });
}


/**
 * Activates a priority button by adding the selected style and updating the image source.
 * 
 * @param {string} priority - The priority to activate (e.g., "low", "medium", "urgent").
 * @param {string} containerSelector - The CSS selector for the container holding the priority buttons.
 */
function activatePrioButton(priority, containerSelector) {
    let activeButton = document.querySelector(`${containerSelector} .prio-button[data-prio="${priority}"]`);
    if (activeButton) {
        activeButton.classList.add(`${priority}White`);
        let img = activeButton.querySelector("img");
        let activeOption = prioOptions.find(opt => opt.class === priority);
        if (img && activeOption) img.src = activeOption.activeSrc;
    } else {
        console.warn(`No button found for priority: ${priority} in ${containerSelector} context`);
    }

    selectedPrio = priority;
}


/**
 * Sets the priority by activating the corresponding priority button and resetting others.
 * 
 * @param {string} priority - The priority to set (e.g., "low", "medium", "urgent").
 * @param {string} [context="normal"] - The context in which the priority is set, either "normal" or "overlay".
 * @param {Event|null} [event=null] - The event that triggered the function, used to prevent default behavior.
 */
function setPrio(priority, context = "normal", event = null) {
    if (event) event.preventDefault();
    let containerSelector = context === "overlay" ? "#prioOverlayEdit" : ".prioButtonsContainer";
    resetPrioButtons(containerSelector);
    activatePrioButton(priority, containerSelector);
}



/**
 * Renders the priority buttons inside the specified container with shared classes.
 * @param {string} containerSelector - The CSS selector of the container.
 * @param {string} context - The context for the buttons (e.g., "normal", "overlay").
 */
function renderPrioButtons(containerSelectors, context = "normal") {
    let selectors = document.querySelectorAll(containerSelectors);
    selectors.forEach(prioButtonsContainer => {
        if (!prioButtonsContainer) {
            return;
        }
        prioButtonsContainer.innerHTML = generatePrioButtonsHTML("medium", context);
        setPrio("medium", context);
    });
}


/**
 * Initializes the priority buttons by rendering them in both normal and overlay contexts.
 * 
 * @event DOMContentLoaded - Triggers when the DOM has fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
    renderPrioButtons(".prioButtonsContainer", "normal");
    renderPrioButtons(".prio-container #prioOverlayEdit", "overlay");


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
 * Initializes the priority buttons with shared classes for the edit overlay.
 * @param {string|null} selectedPrio - The currently selected priority.
 */
function initializePrioButtons(selectedPrio) {
    if (!selectedPrio) selectedPrio = "medium";
    let prioButtons = document.querySelectorAll(".prio-button");

    prioButtons.forEach(button => {
        let prio = button.getAttribute("data-priority");
        button.classList.remove("lowWhite", "mediumWhite", "urgentWhite");
        if (prio === selectedPrio) button.classList.add(`${prio}White`);
        button.onclick = function () {
            prioButtons.forEach(btn => btn.classList.remove("lowWhite", "mediumWhite", "urgentWhite"));
            button.classList.add(`${prio}White`);
            selectedPrio = prio;
        };
    });
}