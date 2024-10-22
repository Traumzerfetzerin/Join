const CREATETASK_URL = 'https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks'

    let title = document.getElementById('inputTitle').value;
    let description = document.getElementById('textareaDescription').value;
    let dueDate = document.getElementById('dueDate').value; 
    let prio = document.getElementsByName('prioButton')

async function createTasks(path="") {
    let response = await fetch(CREATETASK_URL + path + ".json",{
        method: "POST", 
        title, description, dueDate
    });
    return responseToJson = await response.json();
}