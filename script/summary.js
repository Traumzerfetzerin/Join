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
        const response = await fetch(TASK_URL + ".json");
        const data = await response.json();

        if (data) {
            updateSummaryMetrics(data);
        } else {
            console.log("Keine Daten gefunden.");
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
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
