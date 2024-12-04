/**
 * Deletes a task from Firebase, updates the board, and closes the overlay.
 * @param {string} category - The category of the task.
 * @param {string} taskId - The ID of the task to delete.
 */
async function deleteTask(category, taskId) {
    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`, {
            method: "DELETE"
        });

        if (response.ok) {
            console.log(`Task with ID ${taskId} deleted successfully.`);
            delete taskData[category][taskId];
            loadTasks(taskData);
            closeTaskOverlay();
        } else {
            console.error(`Failed to delete task with ID ${taskId}: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error deleting task with ID ${taskId}:`, error);
    }
}

function editTask(taskId, category) {
    let task = findTaskInData(taskId); // Task aus lokalen Daten holen
    if (!task) {
        console.error(`Task with ID ${taskId} not found.`);
        return;
    }

    // Wechsle das Overlay in den Edit-Modus
    enableEditMode(task, category);
}

function enableEditMode(task, category) {
    // Titel als Eingabefeld anzeigen
    let titleElement = document.querySelector('.task-title');
    titleElement.innerHTML = `<input type="text" id="editTitle" value="${task.title}" />`;

    // Beschreibung als Eingabefeld
    let descriptionElement = document.querySelector('.task-description');
    descriptionElement.innerHTML = `<textarea id="editDescription">${task.description}</textarea>`;

    // Due Date
    let dueDateElement = document.querySelector('.task-info p:nth-child(1)');
    dueDateElement.innerHTML = `<input type="date" id="editDueDate" value="${task.dueDate}" />`;

    // Priorität
    let priorityElement = document.querySelector('.task-info p:nth-child(2)');
    priorityElement.innerHTML = `
        <select id="editPriority">
            <option value="urgent" ${task.prio === "urgent" ? "selected" : ""}>Urgent</option>
            <option value="medium" ${task.prio === "medium" ? "selected" : ""}>Medium</option>
            <option value="low" ${task.prio === "low" ? "selected" : ""}>Low</option>
        </select>
    `;

    // Buttons aktualisieren
    let actionLinks = document.querySelector('.action-links');
    actionLinks.innerHTML = `
        <button onclick="saveChanges('${task.id}', '${category}')">Save Changes</button>
        <button onclick="cancelEdit()">Cancel</button>
    `;
}


function fillFields(task) {
    document.getElementById('inputTitle').value = task.title || '';
    document.getElementById('textareaDescription').value = task.description || '';
    document.getElementById('dueDate').value = task.dueDate || '';
    document.getElementById('categorySelect').value = task.category || '';
    setPrio(task.prio); // Priorität setzen
}

function fillSubtasks(subtasks) {
    let subtaskContainer = document.getElementById('editSubtasks');
    subtaskContainer.innerHTML = ''; // Vorhandene Subtasks löschen

    subtasks.forEach((subtask, index) => {
        let subtaskHTML = createSubtaskElementHTMML(subtask.text, `subtaskDiv_${index}`, `subtaskUl_${index}`, `subtaskLi_${index}`);
        subtaskContainer.innerHTML += subtaskHTML;
    });
}

async function saveEditedTask(taskId, category) {
    let updatedTask = collectTaskData();

    try {
        await saveTaskToFirebase(updatedTask, category, taskId);
        taskData[category][taskId] = updatedTask; // Lokale Daten aktualisieren
        loadTasks(taskData); // Board aktualisieren
        closeTaskOnBoard(); // Overlay schließen
    } catch (error) {
        console.error(`Error saving task:`, error);
    }
}


async function saveChanges(taskId, category) {
    let updatedTask = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        dueDate: document.getElementById('editDueDate').value,
        prio: document.getElementById('editPriority').value,
        contacts: taskData[category][taskId].contacts, // Kontakte bleiben gleich
        subtasks: taskData[category][taskId].subtasks, // Subtasks bleiben gleich
    };

    try {
        // Speichere die Änderungen in Firebase
        await fetch(`${TASK_URL}/${category}/${taskId}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask),
        });

        // Aktualisiere die lokalen Daten
        taskData[category][taskId] = updatedTask;
        alert("Task updated successfully!");
        closeTaskOverlay(); // Overlay schließen
        loadTasks(taskData); // Board neu laden
    } catch (error) {
        console.error("Error updating task:", error);
    }
}

function cancelEdit() {
    // Overlay neu laden, um wieder die Ansicht zu zeigen
    let overlay = document.querySelector('.board-overlay');
    let taskId = overlay.getAttribute('data-task-id');
    let category = document.querySelector('.task-category').textContent.trim();
    showTaskOverlay(category, taskId); // Lädt die ursprünglichen Daten
}
