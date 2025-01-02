/**
 * Collects all input values from the overlay and returns them as an object.
 * @returns {Object} - Task data including title, description, dueDate, priority, subtasks, and contacts.
 */
function collectOverlayData() {
    let titleElement = document.querySelector('.overlay-content .task-title');
    let descriptionElement = document.querySelector('.overlay-content .task-description');
    let dueDateElement = document.querySelector('.overlay-content input[type="date"]');
    let priorityElement = document.querySelector('.overlay-content .prio-button.active');

    let title = titleElement ? titleElement.textContent.trim() : "";
    let description = descriptionElement ? descriptionElement.textContent.trim() : "";
    let dueDate = dueDateElement ? dueDateElement.value.trim() : "";
    let priority = priorityElement ? priorityElement.getAttribute("data-priority") : "low";

    let subtasks = Array.from(
        document.querySelectorAll('.subtasks-section .subtasks-list li')
    ).map(li => ({
        text: li.textContent.trim(),
        completed: li.classList.contains("completed"),
    }));

    let contacts = Array.from(
        document.querySelectorAll('.contacts-section .contact-list input[type="checkbox"]:checked')
    ).map(input => input.closest('.contact').textContent.trim());

    return {
        title,
        description,
        dueDate,
        prio: priority,
        subtasks,
        contacts,
    };
}


/**
 * Saves the edited task data to Firebase.
 * @param {string} taskId - ID of the task being edited.
 * @param {string} category - Category of the task.
 */
async function saveChanges(taskId, category) {
    let updatedTask = collectOverlayData();

    if (!updatedTask.title || !updatedTask.description || !updatedTask.dueDate) {
        console.error("Task data is incomplete. Please check the input fields.");
        alert("Please fill in all required fields.");
        return;
    }

    updatedTask.id = taskId;
    updatedTask.category = category;

    try {
        let response = await fetch(`${TASK_URL}/${category}/${taskId}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask),
        });

        if (response.ok) {
            console.log("Task successfully updated:", updatedTask);
            alert("Task changes saved successfully.");
        } else {
            console.error(`Failed to update task with ID ${taskId}: ${response.statusText}`);
            alert("Failed to save changes. Please try again.");
        }
    } catch (error) {
        console.error("Error saving task changes:", error);
        alert("An error occurred while saving changes.");
    }
}