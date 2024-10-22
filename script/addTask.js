const CREATETASK_URL = 'https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks';


let selectedPrio = '';  // Variable zum Speichern der ausgewählten Prio

function setPrio(prio) {
    // Zuerst die Hervorhebung von allen Prio-Buttons entfernen
    let buttons = document.querySelectorAll('.prioButton');
    buttons.forEach(button => {
        button.classList.remove('active');  // Entferne die Klasse 'active' von allen Buttons
    });

    // Finde den angeklickten Button und füge die Hervorhebung hinzu
    document.getElementById(prio.toLowerCase()).classList.add('active');

    // Speichere die gewählte Priorität
    selectedPrio = prio;
}

let taskCategory = ""; // Variable zum Speichern der ausgewählten kategorie

function setTaskCategory(){
    
}

async function createTasks() {
    // Erfassung der Werte aus dem Formular
    let title = document.getElementById('inputTitle').value;
    let description = document.getElementById('textareaDescription').value;
    let dueDate = document.getElementById('dueDate').value; 
    
    // Hier solltest du die Prio als einen Wert erfassen (z.B. die gewählte Priorität)
    let prio;
    let prioButtons = document.querySelectorAll('.prioButton');
    prioButtons.forEach((button) => {
        if (button.classList.contains('active')) {
            prio = button.innerText; // Nimm den Text des aktiven Buttons als Priorität
        }
    });

    // Sicherstellen, dass alle Felder ausgefüllt sind
    if (!title || !dueDate || !prio) {
        alert('Bitte alle erforderlichen Felder ausfüllen.');
        return;
    }

    // Struktur der Task-Daten
    const taskData = {
        title: title,
        description: description,
        dueDate: dueDate,
        prio: prio
    };

    // Daten in die Firebase-Datenbank speichern
    try {
        let response = await fetch(CREATETASK_URL + '.json', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (response.ok) {
            let responseToJson = await response.json();
            console.log('Task erfolgreich erstellt:', responseToJson);
            alert('Task erfolgreich erstellt!');
        } else {
            console.error('Fehler beim Erstellen des Tasks:', response.statusText);
        }
    } catch (error) {
        console.error('Fehler beim Speichern in Firebase:', error);
    }
}


    return responseToJson = await response.json();

