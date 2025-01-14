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

        console.log("Fetched Contacts Data:", contactsData);

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
 * 
 * @async
 * @param {Object} preparedTaskData - The prepared task data to send.
 * @param {string} category - The category of the task.
 * @returns {Promise<string|null>} The generated task ID or null if an error occurred.
 */
async function sendTaskToFirebase(preparedTaskData, category) {
    console.log("Daten, die an Firebase gesendet werden:", preparedTaskData);
    let response = await fetch(`${CREATETASK_URL}/${category}.json`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparedTaskData),
    });

    if (!response.ok) {
        console.error("Failed to save task to Firebase:", response.statusText);
        return null;
    }

    let data = await response.json();
    console.log("Firebase Antwort:", data);
    return data.name;
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
        return await sendTaskToFirebase(preparedTaskData, taskData.category);
    } catch (error) {
        console.error("Error saving task to Firebase:", error);
        return null;
    }
}