const TASK_URL = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks";

/**
 * Navigates to the "To-Do" section.
 */
function navigateToToDo() {
    window.location.href = "board.html";
}

/**
 * Updates the greeting message based on the current time of day.
 */
function updateGreeting() {
    let greetingElement = document.querySelector(".good");
    let now = new Date();
    let hour = now.getHours();

    if (!greetingElement) return;

    if (hour < 12) {
        greetingElement.textContent = "Good Morning";
    } else if (hour < 18) {
        greetingElement.textContent = "Good Afternoon";
    } else {
        greetingElement.textContent = "Good Evening";
    }
}

/**
 * Updates the user greeting with their full name or sets it to 'Guest' if no user is logged in.
 * @param {boolean} isGuest - Indicates whether the user is a guest.
 * @param {string} firstName - The first name of the user.
 * @param {string} lastName - The last name of the user.
 */
function updateUserGreeting(isGuest, firstName, lastName) {
    let nameElement = document.querySelector(".name");

    if (!nameElement) return;

    if (isGuest) {
        nameElement.textContent = "Guest";
    } else {
        let fullName = `${firstName} ${lastName}`;
        localStorage.setItem('loggedInUserName', fullName);
        nameElement.textContent = fullName;
    }
}

/**
 * Displays the full name of the user, if available.
 * Retrieves the name from localStorage and inserts it into the designated element.
 */
function displayFullName() {
    let fullName = localStorage.getItem('loggedInUserName');
    let nameElement = document.querySelector(".name");

    if (nameElement) {
        nameElement.textContent = fullName ? fullName : "Guest";
    }
}

/**
 * Loads the summary data for tasks and updates the UI with the relevant information.
 */
async function loadSummaryData() {
    try {
        let response = await fetch(`${TASK_URL}.json`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        let tasks = await response.json();
        updateSummaryMetrics(tasks);
        updateUrgentTaskDate(tasks);
    } catch (error) {
        console.error("Error fetching summary data:", error);
    }
}

/**
 * Updates the summary metrics for tasks.
 * @param {object} tasks - The tasks retrieved from Firebase.
 */
function updateSummaryMetrics(tasks) {
    let counts = countTasksByColumn(tasks);
    setSummaryCounts(counts);
}

/**
 * Counts tasks by their column and priority.
 * @param {object} tasks - The tasks retrieved from Firebase.
 * @returns {object} - An object containing task counts by category.
 */
function countTasksByColumn(tasks) {
    let counts = initializeCounts();
    for (let category in tasks) {
        processCategoryTasks(tasks[category], counts);
    }
    return counts;
}

/**
 * Initializes the counts object for task metrics.
 * @returns {object} - A counts object with initial values.
 */
function initializeCounts() {
    return {
        toDo: 0,
        done: 0,
        inProgress: 0,
        awaitFeedback: 0,
        urgent: 0,
        total: 0
    };
}

/**
 * Processes all tasks in a category and updates the counts.
 * @param {object} categoryTasks - The tasks in a specific category.
 * @param {object} counts - The counts object to update.
 */
function processCategoryTasks(categoryTasks, counts) {
    for (let taskId in categoryTasks) {
        let task = categoryTasks[taskId];
        counts.total++;
        updateColumnCounts(task, counts);
        updateUrgentCount(task, counts);
    }
}

/**
 * Updates counts based on the task's column.
 * @param {object} task - A single task object.
 * @param {object} counts - The counts object to update.
 */
function updateColumnCounts(task, counts) {
    switch (task.column?.toLowerCase()) {
        case "todo":
            counts.toDo++;
            break;
        case "done":
            counts.done++;
            break;
        case "inprogress":
            counts.inProgress++;
            break;
        case "awaitfeedback":
            counts.awaitFeedback++;
            break;
    }
}

/**
 * Updates the urgent count if the task is marked as urgent.
 * @param {object} task - A single task object.
 * @param {object} counts - The counts object to update.
 */
function updateUrgentCount(task, counts) {
    if (task.prio === "urgent") {
        counts.urgent++;
    }
}

/**
 * Updates the summary elements in the UI with the calculated task counts.
 * @param {object} counts - The counts of tasks by category.
 */
function setSummaryCounts(counts) {
    document.querySelector(".summarynmb.todo").textContent = counts.toDo;
    document.querySelector(".summarynmb.done").textContent = counts.done;
    document.querySelector(".urgentnmb").textContent = counts.urgent;
    document.querySelector(".tasknmb.board").textContent = counts.total;
    document.querySelector(".tasknmb.progress").textContent = counts.inProgress;
    document.querySelector(".tasknmb.awaitFeedback").textContent = counts.awaitFeedback;
}

/**
 * Updates the urgent task count and next deadline in the UI.
 * @param {object} tasks - The tasks retrieved from Firebase.
 */
function updateUrgentTaskDate(tasks) {
    let urgentTasks = findUrgentTasks(tasks);
    let urgentCount = urgentTasks.length;
    let closestDate = findClosestDate(urgentTasks);

    document.querySelector(".urgentnmb").textContent = urgentCount;

    let dateElement = document.querySelector(".date");
    let underDateElement = document.querySelector(".underdate");

    if (dateElement && underDateElement) {
        if (closestDate) {
            let options = { year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = closestDate.toLocaleDateString('en-GB', options);
            underDateElement.textContent = "Upcoming Deadline";
        } else {
            dateElement.textContent = "";
            underDateElement.textContent = "";
        }
    }
}


document.addEventListener('DOMContentLoaded', setCurrentDate);

function setCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-US', options);
    }
}


/**
 * Finds all urgent tasks.
 * @param {object} tasks - The tasks retrieved from Firebase.
 * @returns {Array} - An array of urgent tasks.
 */
function findUrgentTasks(tasks) {
    let urgentTasks = [];
    for (let category in tasks) {
        let categoryTasks = tasks[category];
        for (let taskId in categoryTasks) {
            let task = categoryTasks[taskId];
            if (task.prio === "urgent") urgentTasks.push(task);
        }
    }
    return urgentTasks;
}

/**
 * Finds the closest due date from an array of tasks.
 * @param {Array} tasks - An array of tasks.
 * @returns {Date|null} - The closest due date or null if none exists.
 */
function findClosestDate(tasks) {
    let closestDate = null;
    tasks.forEach(task => {
        let dueDate = new Date(task.dueDate);
        if (!closestDate || dueDate < closestDate) {
            closestDate = dueDate;
        }
    });
    return closestDate;
}

/**
 * Initializes the application when the page is fully loaded.
 */
window.onload = function () {
    loadSummaryData();
    setCurrentDate();
    updateGreeting();
    displayFullName();
};


// CHANGE TO BOARD
async function summaryToBoard() {
    setTimeout(() => {
        window.location.href = "board.html";
    }, 0);
}