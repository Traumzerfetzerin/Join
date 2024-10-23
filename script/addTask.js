const CREATETASK_URL = 'https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks';


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

    // Set the selected priority
    selectedPrio = prio;

    // Remove 'active' class from all buttons
    const prioButtons = document.querySelectorAll('.prioButton');
    prioButtons.forEach(button => button.classList.remove('active'));

    // Add 'active' class to the clicked button
    event.target.classList.add('active');
}
let taskCategory = ""; // Variable zum Speichern der ausgewählten kategorie

/**
 * Creates a new task and sends the task data to Firebase.
 * 
 * The function collects data from the form (title, description, due date, category, and priority),
 * validates that the required fields are filled, and posts the task data to the Firebase database
 * under the selected category.
 * 
 * @param {Event} event - The click event to prevent the default form submission.
 */
async function createTasks(event) {
    // Prevent the form from reloading the page
    event.preventDefault();  

    // Collect task data
    let title = document.getElementById('inputTitle').value;
    let description = document.getElementById('textareaDescription').value;
    let dueDate = document.getElementById('dueDate').value;
    let category = document.getElementById('categorySelect').value;

    // Validate that all required fields are filled
    if (!title || !dueDate || !selectedPrio || category === '0') {
        alert('Please fill in all required fields.');
        return;
    }

    // Structure the task data
    const taskData = {
        title: title,
        description: description,
        dueDate: dueDate,
        prio: selectedPrio
    };

    // Send the task data to Firebase using the selected category as the key
    try {
        let response = await fetch(CREATETASK_URL + '/' + category + '.json', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        // Check if the task was successfully created
        if (response.ok) {
            let responseToJson = await response.json();
            console.log('Task successfully created:', responseToJson);
            alert('Task successfully created under the category: ' + category);
        } else {
            console.error('Error creating task:', response.statusText);
        }
    } catch (error) {
        console.error('Error saving to Firebase:', error);
    }
}


