const TASK_URL = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks";

// Navigationsfunktion für "To-Do"-Bereich
function navigateToToDo() {
    window.location.href = "board.html";
}

// Beim Laden der Seite die Begrüßung aktualisieren
updateGreeting();

function updateGreeting() {
    const greetingElement = document.querySelector(".good");
    const now = new Date();
    const hour = now.getHours();

    if (greetingElement) {
        if (hour < 12) {
            greetingElement.textContent = "Good Morning";
        } else if (hour < 18) {
            greetingElement.textContent = "Good Afternoon";
        } else {
            greetingElement.textContent = "Good Evening";
        }
    }
}

function updateUserGreeting(isGuest, firstName, lastName) {
    const nameElement = document.querySelector(".name");
    
    if (isGuest) {
        // Wenn der Benutzer ein Gast ist, kein Name anzeigen
        nameElement.textContent = "";
    } else {
        // Wenn der Benutzer angemeldet ist, den Namen anzeigen
        nameElement.textContent = `${firstName} ${lastName}`;
    }
}


// Lädt die Übersichtsdaten von Firebase und ruft die Funktion auf, um die Metriken anzuzeigen
async function loadSummaryData() {
    try {
        const response = await fetch("https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json");
        if (!response.ok) {
            throw new Error(`Fehler beim Laden der Daten: ${response.statusText}`);
        }
        const tasks = await response.json();
        console.log("Geladene Tasks aus Firebase:", tasks); // Debugging
        updateSummaryMetrics(tasks); // Aktualisiere die Summary
    } catch (error) {
        console.error("Fehler beim Laden der Summary-Daten:", error);
    }
}


function updateSummaryMetrics(tasks) {
    let toDoCount = 0;
    let doneCount = 0;
    let urgentCount = 0;
    let inProgressCount = 0;
    let awaitFeedbackCount = 0;

    // Setze alle `tasknmb`- und `summarynmb`-Elemente standardmäßig auf "0"
    document.querySelectorAll(".tasknmb").forEach(element => {
        element.textContent = "0";
    });
    document.querySelectorAll(".summarynmb").forEach(element => {
        element.textContent = "0";
    });

    // Durchlaufe die Aufgaben und zähle nach Status
    for (let category in tasks) {
        const categoryTasks = tasks[category];
        for (let taskId in categoryTasks) {
            const task = categoryTasks[taskId];

            // Zähle die Aufgaben je nach Status
            switch (task.status) {
                case 'To-Do':
                    toDoCount++;
                    break;
                case 'Done':
                    doneCount++;
                    break;
                case 'Urgent':
                    urgentCount++;
                    break;
                case 'In Progress':
                    inProgressCount++;
                    break;
                case 'Await Feedback':
                    awaitFeedbackCount++;
                    break;
            }
        }
    }

    // Setze die Zählerwerte in die jeweiligen Elemente
    const todoElement = document.querySelector(".summarynmb.todo");
    const doneElement = document.querySelector(".summarynmb.done");
    const urgentElement = document.querySelector(".urgentnmb");
    const boardElement = document.querySelector(".tasknmb.board");
    const progressElement = document.querySelector(".tasknmb.progress");
    const awaitFeedbackElement = document.querySelector(".tasknmb.awaitFeedback");

    if (todoElement) todoElement.textContent = toDoCount;
    if (doneElement) doneElement.textContent = doneCount;
    if (urgentElement) urgentElement.textContent = urgentCount;
    if (boardElement) boardElement.textContent = toDoCount + doneCount + inProgressCount + awaitFeedbackCount;
    if (progressElement) progressElement.textContent = inProgressCount;
    if (awaitFeedbackElement) awaitFeedbackElement.textContent = awaitFeedbackCount;
}

function updateUrgentTaskDate(tasks) {
    const urgentElement = document.querySelector(".urgentnmb");
    const dateElement = document.querySelector(".date"); // Element für das Datum
    const underDateElement = document.querySelector(".underdate"); // Element für den Untertitel unter dem Datum

    let urgentCount = 0;
    let closestDate = null;

    for (let category in tasks) {
        const categoryTasks = tasks[category];
        for (let taskId in categoryTasks) {
            const task = categoryTasks[taskId];

            // Zähle nur die "Urgent"-Aufgaben
            if (task.status === 'Urgent') {
                urgentCount++;

                // Überprüfe das Fälligkeitsdatum
                const dueDate = new Date(task.dueDate); // Angenommen, die Aufgabe hat ein dueDate-Feld
                if (!closestDate || dueDate < closestDate) {
                    closestDate = dueDate; // Finde das nächste Fälligkeitsdatum
                }
            }
        }
    }

    // Aktualisiere die UI-Elemente
    if (urgentElement) {
        urgentElement.textContent = urgentCount; // Anzahl der dringenden Aufgaben anzeigen
    }

    if (closestDate) {
        // Setze das Datum für die nächste dringende Aufgabe
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = closestDate.toLocaleDateString('de-DE', options); // Datum im deutschen Format
        underDateElement.textContent = "Upcoming Deadline"; // Untertitel für das Datum
    } else {
        dateElement.textContent = ""; // Kein Datum anzeigen, wenn keine dringenden Aufgaben vorhanden sind
        underDateElement.textContent = ""; // Untertitel leeren
    }
}

// Lädt beim Laden der Seite die Übersichtsdaten
window.onload = loadSummaryData;


function updateSummaryMetrics(tasks) {
    let toDoCount = 0;
    let doneCount = 0;
    let urgentCount = 0;
    let inProgressCount = 0;
    let awaitFeedbackCount = 0;

    // Tasks in Board berechnen
    let tasksInBoard = 0;

    // Tasks nach column zählen
    for (let category in tasks) {
        const categoryTasks = tasks[category];
        for (let taskId in categoryTasks) {
            const task = categoryTasks[taskId];
            tasksInBoard++;

            // Nutze die `column`-Eigenschaft für die Zuordnung
            switch (task.column?.toLowerCase()) {
                case "todo":
                    toDoCount++;
                    break;
                case "done":
                    doneCount++;
                    break;
                case "inprogress":
                    inProgressCount++;
                    break;
                case "awaitfeedback":
                    awaitFeedbackCount++;
                    break;
            }

            // Dringende Aufgaben zählen
            if (task.prio === "urgent") {
                urgentCount++;
            }
        }
    }

    // Setze die gezählten Werte in die HTML-Elemente
    document.querySelector(".summarynmb.todo").textContent = toDoCount;
    document.querySelector(".summarynmb.done").textContent = doneCount;
    document.querySelector(".urgentnmb").textContent = urgentCount;
    document.querySelector(".tasknmb.board").textContent = tasksInBoard;
    document.querySelector(".tasknmb.progress").textContent = inProgressCount;
    document.querySelector(".tasknmb.awaitFeedback").textContent = awaitFeedbackCount;
}
