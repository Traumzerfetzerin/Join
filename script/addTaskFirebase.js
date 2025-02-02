/**
 * Fetches contact data from Firebase.
 * 
 * @async
 * @returns {Promise<Array<Object>>} The list of all contacts fetched from Firebase.
 */
async function fetchContactsFromFirebase() {
    try {
        let response = await fetch('https://join-382-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
        let contactsData = await response.json();
        if (contactsData) {
            return Object.keys(contactsData).map(key => ({ id: key, ...contactsData[key] }));
        } else {
            console.warn("No contacts found in Firebase.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return [];
    }
}


/**
 * Fetches and dynamically populates the contact list for task creation.
 * 
 * @async
 * @param {Array<string>} selectedContacts - List of pre-selected contact IDs.
 * @returns {Promise<void>} Resolves when the contact list is populated.
 */
async function fetchAndPopulateContacts(selectedContacts = []) {
    let allContacts = await fetchContactsFromFirebase();
    populateContactSection(allContacts, selectedContacts);
}


/**
 * Sends task data to Firebase.
 * @param {Object} preparedTaskData - The prepared task data to send.
 * @param {string} category - The category of the task.
 * @returns {Promise<string|null>} The generated task ID or null if an error occurred.
 */
async function sendTaskToFirebase(preparedTaskData, category) {
    try {
        let response = await fetch(`${CREATETASK_URL}/${category}.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(preparedTaskData),
        });

        if (!response.ok) {
            console.error("Firebase error:", response.statusText);
            return null;
        }

        let data = await response.json();
        console.log("Firebase Response:", data); // Debugging
        let taskId = data.name;

        if (!taskId) {
            console.error("Task ID is undefined!");
            return null;
        }

        let updatedData = { ...preparedTaskData, id: taskId };

        await fetch(`${CREATETASK_URL}/${category}/${taskId}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        });

        return taskId;
    } catch (error) {
        console.error("Error in sendTaskToFirebase:", error);
        return null;
    }
}



/**
 * Saves the task data to Firebase after preparing it.
 * 
 * @async
 * @param {Object} taskData - The task data to be saved.
 * @returns {Promise<string|null>} The generated task ID or null if an error occurred.
 */
async function saveTaskToFirebase(taskData) {
    try {
        let preparedTaskData = prepareTaskDataForFirebase(taskData);
        return;
    } catch (error) {
        console.error("Error saving task to Firebase:", error);
        return null;
    }
}