/**
 * Filters tasks on the board based on the search term (min. 3 characters).
 */
function filterTasks() {
    let searchTerm = document.getElementById("boardSearchbar").value.toLowerCase();
    let allTasks = document.querySelectorAll(".task");

    if (!searchTerm) {
        resetTaskVisibility(allTasks);
        return;
    }

    allTasks.forEach(task => {
        let taskData = getTaskData(task);
        let isMatch = isSearchTermInTask(taskData, searchTerm);
        toggleTaskVisibility(task, isMatch);
    });
}


/**
 * Resets the visibility of all tasks.
 * @param {NodeList} allTasks - List of task elements.
 */
function resetTaskVisibility(allTasks) {
    allTasks.forEach(task => task.style.display = "block");
}


/**
 * Extracts relevant data from a task element.
 * @param {HTMLElement} task - Task element.
 * @returns {Object} Task data including title, description, contacts, category, and subtasks.
 */
function getTaskData(task) {
    let title = task.querySelector("h3")?.innerText.toLowerCase() || "";
    let description = task.querySelector("p:not(.subtask-count)")?.innerText.toLowerCase() || "";
    let contacts = Array.from(task.querySelectorAll("ul li"))
        .map(li => li.innerText.toLowerCase())
        .join(", ");
    let category = task.querySelector(".task-category")?.innerText.toLowerCase() || "";
    let subtasks = Array.from(task.querySelectorAll(".subtask-checkbox + label"))
        .map(label => label.innerText.toLowerCase())
        .join(", ");
    return { title, description, contacts, category, subtasks };
}


/**
 * Checks if the search term is present in the task data.
 * @param {Object} taskData - Task data.
 * @param {string} searchTerm - Search term to match.
 * @returns {boolean} True if the search term is found, false otherwise.
 */
function isSearchTermInTask(taskData, searchTerm) {
    return (
        taskData.title.includes(searchTerm) ||
        taskData.description.includes(searchTerm) ||
        taskData.contacts.includes(searchTerm) ||
        taskData.category.includes(searchTerm) ||
        taskData.subtasks.includes(searchTerm)
    );
}


/**
 * Toggles the visibility of a task based on a condition.
 * @param {HTMLElement} task - Task element.
 * @param {boolean} isVisible - Whether the task should be visible.
 */
function toggleTaskVisibility(task, isVisible) {
    task.style.display = isVisible ? "block" : "none";
}
