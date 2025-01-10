let selectedPrio = "low";
let prioOptions = [
    { class: "urgent", label: "Urgent", src: "../Assets/addTask/Prio alta.svg", activeSrc: "../Assets/addTask/Prio_alta_white.svg" },
    { class: "medium", label: "Medium", src: "../Assets/addTask/Prio media.svg", activeSrc: "../Assets/addTask/Prio media white.svg" },
    { class: "low", label: "Low", src: "../Assets/addTask/Prio baja.svg", activeSrc: "../Assets/addTask/Prio_baja_white.svg" }
];


/**
 * Resets priority buttons within a specified container by updating their styles and images.
 * 
 * @param {string} containerSelector - A CSS selector string to identify the container holding the priority buttons.
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
 * Activates a priority button by applying the corresponding styles and updating its image.
 * 
 * @param {string} priority - The priority level to activate (e.g., "low", "medium", "urgent").
 * @param {string} containerSelector - A CSS selector string to identify the container holding the priority buttons.
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
 * Sets the priority by resetting and activating the corresponding priority button.
 * 
 * @param {string} priority - The priority level to set (e.g., "low", "medium", "urgent").
 * @param {string} [context="normal"] - The context in which to set the priority ("normal" or "overlay").
 * @param {Event|null} [event=null] - An optional event to prevent its default behavior.
 */
function setPrio(priority, context = "normal", event = null) {
    if (event) event.preventDefault();

    let containerSelector = context === "overlay" ? "#prioOverlay" : ".prioButtonsContainer";
    
    resetPrioButtons(containerSelector);
    activatePrioButton(priority, containerSelector);
}


/**
 * Renders priority buttons in a specified container and sets the default priority.
 * 
 * @param {string} containerSelector - A CSS selector string to identify the container for rendering the buttons.
 * @param {string} [context="normal"] - The context for the priority buttons ("normal" or "overlay").
 */
function renderPrioButtons(containerSelector, context = "normal") {
    let prioButtonsContainer = document.querySelector(containerSelector);
    if (!prioButtonsContainer) {
        return;
    }

    prioButtonsContainer.innerHTML = generatePrioButtonsHTML("medium", context);
    setPrio("medium", context);
}


/**
 * Initializes priority buttons on DOM content load for specified containers.
 */
document.addEventListener("DOMContentLoaded", function () {
    renderPrioButtons(".prioButtonsContainer", "normal");
    renderPrioButtons("#prioOverlay", "overlay");
});


/**
 * Marks the selected priority button by applying the corresponding style and removing it from others.
 * 
 * @param {string} priority - The priority level to mark as selected (e.g., "low", "medium", "urgent").
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
 * Updates the selected priority and visually marks the corresponding priority button.
 * 
 * @param {string} priority - The priority level to update (e.g., "low", "medium", "urgent").
 */
function updatePriority(priority) {
    selectedPrioBoard = priority;
    markSelectedPriority(priority);
}

/**
 * Initializes priority buttons by setting the selected priority and adding click event handlers.
 * 
 * @param {string} [selectedPrio="medium"] - The initially selected priority (e.g., "low", "medium", "urgent").
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