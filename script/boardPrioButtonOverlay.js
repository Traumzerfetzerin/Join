let selectedPrioBoard = null;

/**
 * Sets the selected priority and highlights the selected button.
 * 
 * @param {string} prioBoard - The priority to be set (e.g., 'lowBoard', 'mediumBoard', 'urgentBoard').
 * @param {Event|null} event - The event to prevent default behavior (can be null for direct calls).
 */
function setPrioBoard(prioBoard, event = null) {
    if (event) {
        event.preventDefault();
    }

    selectedPrioBoard = prioBoard;

    // Deselect all priority buttons
    document.getElementById('lowBoard').classList.remove('lowWhite');
    document.getElementById('mediumBoard').classList.remove('mediumWhite');
    document.getElementById('urgentBoard').classList.remove('urgentWhite');

    // Update the specific button style
    if (prioBoard === 'lowBoard') {
        lowPrioButtonBoard('lowBoard');
    } else if (prioBoard === 'mediumBoard') {
        mediumPrioButtonBoard('mediumBoard');
    } else if (prioBoard === 'urgentBoard') {
        urgentPrioButtonBoard('urgentBoard');
    }
}


// PRIO BUTTON LOW
function lowPrioButtonBoard(priorityButtonBoard) {
    document.getElementById(priorityButtonBoard).classList.add('lowWhite');
    document.getElementById(`${priorityButtonBoard}SvgBoard`).src = "../Assets/addTask/Prio_baja_white.svg";
    document.getElementById('mediumBoard').classList.remove('mediumWhite');
    document.getElementById('urgentBoard').classList.remove('urgentWhite');
    document.getElementById(`mediumSvgBoard`).src = "../Assets/addTask/Prio media.svg";
    document.getElementById(`urgentSvgBoard`).src = "../Assets/addTask/Prio alta.svg";
}


// PRIO BUTTON MEDIUM
function mediumPrioButtonBoard(priorityButtonBoard) {
    document.getElementById(priorityButtonBoard).classList.add('mediumWhite');
    document.getElementById(`${priorityButtonBoard}SvgBoard`).src = "../Assets/addTask/Prio media white.svg";
    document.getElementById('lowBoard').classList.remove('lowWhite');
    document.getElementById('urgentBoard').classList.remove('urgentWhite');
    document.getElementById(`lowSvgBoard`).src = "../Assets/addTask/Prio baja.svg";
    document.getElementById(`urgentSvgBoard`).src = "../Assets/addTask/Prio alta.svg";
}


// PRIO BUTTON URGENT
function urgentPrioButtonBoard(priorityButtonBoard) {
    document.getElementById(priorityButtonBoard).classList.add('urgentWhite');
    document.getElementById(`${priorityButtonBoard}SvgBoard`).src = "../Assets/addTask/Prio_alta_white.svg";
    document.getElementById('lowBoard').classList.remove('lowWhite');
    document.getElementById('mediumBoard').classList.remove('mediumWhite');
    document.getElementById(`lowSvgBoard`).src = "../Assets/addTask/Prio baja.svg";
    document.getElementById(`mediumSvgBoard`).src = "../Assets/addTask/Prio media.svg";
}