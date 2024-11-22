/**
 * Filters tasks on the board based on the search term (min. 3 characters).
 */
function filterTasks() {
    let searchTerm = document.getElementById("boardSearchbar").value.toLowerCase();

    if (searchTerm.length < 3) {
        document.querySelectorAll(".task").forEach(task => {
            task.style.display = "block";
        });
        return;
    }

    let allTasks = document.querySelectorAll(".task");

    allTasks.forEach(task => {
        let title = task.querySelector("h3")?.innerText.toLowerCase() || "";
        let description = task.querySelector("p:not(.subtask-count)")?.innerText.toLowerCase() || "";
        let contacts = Array.from(task.querySelectorAll("ul li")).map(li => li.innerText.toLowerCase()).join(", ");
        let category = task.querySelector(".task-category")?.innerText.toLowerCase() || "";
        let subtasks = Array.from(task.querySelectorAll(".subtask-checkbox + label")).map(label => label.innerText.toLowerCase()).join(", ");

        if (
            title.includes(searchTerm) ||
            description.includes(searchTerm) ||
            contacts.includes(searchTerm) ||
            category.includes(searchTerm) ||
            subtasks.includes(searchTerm)
        ) {
            task.style.display = "block";
        } else {
            task.style.display = "none";
        }
    });
}
