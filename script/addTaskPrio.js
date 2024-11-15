let selectedPrio = null;

/**
 * Sets the selected priority and highlights the selected button.
 * 
 * @param {string} prio - The priority to be set (e.g., 'Urgent', 'Medium', 'Low').
 * @param {Event} event - The event to prevent default behavior.
 */

function setPrio(prio, event) {
    // Prevent default action (in case it's triggering form submission or reset)
    event.preventDefault();


    selectedPrio = prio;

    let priorityButton = event.currentTarget.id;

    if (priorityButton === "low") {
        lowPrioButton(priorityButton);
    } else if (priorityButton === "medium") {
        mediumPrioButton(priorityButton);
    } else if (priorityButton === "urgent") {
        urgentPrioButton(priorityButton);
    }
}


// PRIO BUTTON LOW
function lowPrioButton(priorityButton) {
    document.getElementById(priorityButton).classList.add('lowWhite');
    document.getElementById(`${priorityButton}Svg`).src = "../Assets/addTask/Prio_baja_white.svg";
    document.getElementById('medium').classList.remove('mediumWhite');
    document.getElementById('urgent').classList.remove('urgentWhite');
    document.getElementById(`mediumSvg`).src = "../Assets/addTask/Prio media.svg";
    document.getElementById(`urgentSvg`).src = "../Assets/addTask/Prio alta.svg";
}


// PRIO BUTTON MEDIUM
function mediumPrioButton(priorityButton) {
    document.getElementById(priorityButton).classList.add('mediumWhite');
    document.getElementById(`${priorityButton}Svg`).src = "../Assets/addTask/Prio media white.svg";
    document.getElementById('low').classList.remove('lowWhite');
    document.getElementById('urgent').classList.remove('urgentWhite');
    document.getElementById(`lowSvg`).src = "../Assets/addTask/Prio baja.svg";
    document.getElementById(`urgentSvg`).src = "../Assets/addTask/Prio alta.svg";
}


// PRIO BUTTON URGENT
function urgentPrioButton(priorityButton) {
    document.getElementById(priorityButton).classList.add('urgentWhite');
    document.getElementById(`${priorityButton}Svg`).src = "../Assets/addTask/Prio_alta_white.svg";
    document.getElementById('low').classList.remove('lowWhite');
    document.getElementById('medium').classList.remove('mediumWhite');
    document.getElementById(`lowSvg`).src = "../Assets/addTask/Prio baja.svg";
    document.getElementById(`mediumSvg`).src = "../Assets/addTask/Prio media.svg";
}
