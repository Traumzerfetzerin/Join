let selectedPrio = null;

/**
 * Sets the selected priority and highlights the selected button.
 * 
 * @param {string} prio - The priority to be set (e.g., 'Urgent', 'Medium', 'Low').
 * @param {Event|null} event - The event to prevent default behavior (can be null for direct calls).
 */
function setPrio(prio, event = null) {
    // Prevent default action if an event is provided
    if (event) {
        event.preventDefault();
    }

    selectedPrio = prio;

    // Deselect all priority buttons
    document.getElementById('low').classList.remove('active');
    document.getElementById('medium').classList.remove('active');
    document.getElementById('urgent').classList.remove('active');

    // Set the specific button style based on the priority
    if (prio === 'low') {
        lowPrioButton('low');
    } else if (prio === 'medium') {
        mediumPrioButton('medium');
    } else if (prio === 'urgent') {
        urgentPrioButton('urgent');
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


// CLEAR PRIO BUTTON
async function clearPrioButtons() {
    document.getElementById('low').classList.remove('lowWhite');
    document.getElementById('medium').classList.remove('mediumWhite');
    document.getElementById('urgent').classList.remove('urgentWhite');
    document.getElementById(`lowSvg`).src = "../Assets/addTask/Prio baja.svg"
    document.getElementById(`mediumSvg`).src = "../Assets/addTask/Prio media white.svg";
    document.getElementById(`urgentSvg`).src = "../Assets/addTask/Prio alta.svg";
    document.getElementById('medium').classList.add('mediumWhite');
}