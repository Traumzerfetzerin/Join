/**
 * Calculates the progress of subtasks.
 * @param {Array} subtasks - The subtasks array.
 * @returns {number} - Progress percentage.
 */
function calculateProgress(subtasks) {
    if (!Array.isArray(subtasks)) {
        console.warn("Invalid subtasks array. Returning 0 progress.");
        return 0;
    }

    let total = subtasks.length;
    let completed = subtasks.filter(subtask => subtask.completed).length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
}


/**
 * Updates the progress bar of a task on the board.
 * @param {string} taskId - The ID of the task.
 * @param {number} progressPercentage - The percentage of completed subtasks.
 */
function updateProgressBar(taskId, progressPercentage) {
    let progressBar = document.querySelector(`#task-${taskId} .progress-bar-fill`);
    if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.style.backgroundColor = progressPercentage === 0 ? "lightgray" : "blue";

        // Optional: Update progress text inside the progress bar
        let progressText = document.querySelector(`#task-${taskId} .progress-bar-text`);
        if (progressText) {
            progressText.textContent = `${progressPercentage}%`;
        }
    } else {
        console.warn(`Progress bar for Task ID ${taskId} not found.`);
    }
}
