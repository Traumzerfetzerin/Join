// let selectedPrioBoard = null;

// /**
//  * Sets the selected priority and highlights the selected button.
//  * @param {string} prioBoard - The priority to be set (e.g., 'lowBoard', 'mediumBoard', 'urgentBoard').
//  * @param {Event|null} event - The event to prevent default behavior (can be null for direct calls).
//  */
// function setPrioBoard(prioBoard, event = null) {
//     if (event) event.preventDefault();

//     console.log("Setting Priority:", prioBoard);
//     selectedPrioBoard = prioBoard;

//     // Alle Buttons zurücksetzen
//     document.getElementById('lowBoard').classList.remove('lowWhite');
//     document.getElementById('mediumBoard').classList.remove('mediumWhite');
//     document.getElementById('urgentBoard').classList.remove('urgentWhite');

//     // Hervorheben des ausgewählten Buttons
//     if (prioBoard === 'lowBoard') {
//         document.getElementById('lowBoard').classList.add('lowWhite');
//     } else if (prioBoard === 'mediumBoard') {
//         document.getElementById('mediumBoard').classList.add('mediumWhite');
//     } else if (prioBoard === 'urgentBoard') {
//         document.getElementById('urgentBoard').classList.add('urgentWhite');
//     } else {
//         console.error("Unknown Priority:", prioBoard);
//     }
// }


// // PRIO BUTTON LOW
// function lowPrioButtonBoard(priorityButtonBoard) {
//     document.getElementById(priorityButtonBoard).classList.add('lowWhite');
//     document.getElementById(`${priorityButtonBoard}Svg`).src = "../Assets/addTask/Prio_baja_white.svg";
//     document.getElementById('mediumBoard').classList.remove('mediumWhite');
//     document.getElementById('urgentBoard').classList.remove('urgentWhite');
//     document.getElementById(`mediumBoardSvg`).src = "../Assets/addTask/Prio media.svg";
//     document.getElementById(`urgentBoardSvg`).src = "../Assets/addTask/Prio alta.svg";
// }


// // PRIO BUTTON MEDIUM
// function mediumPrioButtonBoard(priorityButtonBoard) {
//     document.getElementById(priorityButtonBoard).classList.add('mediumWhite');
//     document.getElementById(`${priorityButtonBoard}Svg`).src = "../Assets/addTask/Prio media white.svg";
//     document.getElementById('lowBoard').classList.remove('lowWhite');
//     document.getElementById('urgentBoard').classList.remove('urgentWhite');
//     document.getElementById(`lowBoardSvg`).src = "../Assets/addTask/Prio baja.svg";
//     document.getElementById(`urgentBoardSvg`).src = "../Assets/addTask/Prio alta.svg";
// }


// // PRIO BUTTON URGENT
// function urgentPrioButtonBoard(priorityButtonBoard) {
//     document.getElementById(priorityButtonBoard).classList.add('urgentWhite');
//     document.getElementById(`${priorityButtonBoard}Svg`).src = "../Assets/addTask/Prio_alta_white.svg";
//     document.getElementById('lowBoard').classList.remove('lowWhite');
//     document.getElementById('mediumBoard').classList.remove('mediumWhite');
//     document.getElementById(`lowBoardSvg`).src = "../Assets/addTask/Prio baja.svg";
//     document.getElementById(`mediumBoardSvg`).src = "../Assets/addTask/Prio media.svg";
// }

