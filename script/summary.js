let TASK_URL = "https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json"; 
let closestDate = null;


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
        nameElement.textContent = "";
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
        let response = await fetch(TASK_URL);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        let tasks = await response.json();
        if (Object.keys(tasks).length === 0) {
            console.warn("No tasks found in Firebase.");
            document.getElementById('upcomingDeadline').textContent = "No upcoming deadlines.";
            return;
        }

        if (document.querySelector(".summarynmb.todo")) {
            updateSummaryMetrics(tasks);
        }

        if (document.querySelector(".urgent-date")) {
            updateUrgentTaskDate(tasks);
        }

        updateUpcomingDeadline(tasks);

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
 * Updates the summary counts in the UI if elements are available.
 * @param {object} counts - Object containing counts for different task categories.
 */
function setSummaryCounts(counts) {
    let selectors = {
        toDo: ".summarynmb.todo",
        done: ".summarynmb.done",
        urgent: ".urgentnmb",
        total: ".tasknmb.board",
        inProgress: ".tasknmb.progress",
        awaitFeedback: ".tasknmb.awaitFeedback"
    };

    for (let key in selectors) {
        let element = document.querySelector(selectors[key]);
        if (element) {
            element.textContent = counts[key];
        } else {
            console.warn(`Element ${selectors[key]} not found`);
        }
    }
}


/**
 * Updates the urgent task count in the UI.
 * @param {Array} urgentTasks - The urgent tasks.
 */
function updateUrgentTaskCount(urgentTasks) {
    let urgentCount = urgentTasks.length;
    document.querySelector(".urgentnmb").textContent = urgentCount;
}


/**
 * Updates the next deadline in the UI.
 * @param {Date|null} closestDate - The closest deadline date.
 */
function updateNextDeadline(closestDate) {
    let dateElement = document.getElementById('upcomingDeadline');

    if (dateElement) {
        if (closestDate) {
            let options = { year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.innerHTML = `<p>${closestDate.toLocaleDateString('en-GB', options)} - Upcoming Deadline</p>`;
        } else {
            dateElement.innerHTML = "<p>No upcoming deadlines.</p>";
        }
    } else {
        console.warn("Element #upcomingDeadline not found.");
    }
}


/**
 * Updates the urgent task count and next deadline in the UI if elements are available.
 * @param {object} tasks - The tasks retrieved from Firebase.
 */
function updateUrgentTaskDate(tasks) {
    let urgentTasks = findUrgentTasks(tasks);
    updateUrgentTaskCount(urgentTasks);

    let closestDate = findClosestDate(urgentTasks);

    let deadlineElement = document.querySelector(".urgent-date");
    if (deadlineElement) {
        updateNextDeadline(closestDate);
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
            if (task.prio === "urgent") {
                urgentTasks.push(task);
            }
        }
    }
    return urgentTasks;
}


/**
 * Finds the closest due date from an array of tasks.
 * @param {object} tasks - The tasks retrieved from Firebase.
 * @returns {Date|null} - The closest due date or null if none exists.
 */
function findClosestDate(tasks) {
    if (!tasks || Object.keys(tasks).length === 0) {
        console.warn("No tasks available to process.");
        return null;
    }
    return processTaskCategories(tasks);
}

/**
 * Processes task categories and finds the closest due date.
 * @param {object} tasks - The tasks grouped by categories.
 * @returns {Date|null} - The closest due date or null if none exists.
 */
function processTaskCategories(tasks) {
    let closestDate = null;

    for (let category in tasks) {
        let categoryTasks = tasks[category];
        closestDate = findCategoryClosestDate(categoryTasks, closestDate);
    }

    return closestDate;
}

/**
 * Finds the closest due date within a task category.
 * @param {object} categoryTasks - The tasks within a specific category.
 * @param {Date|null} closestDate - The current closest due date.
 * @returns {Date|null} - The updated closest due date.
 */
function findCategoryClosestDate(categoryTasks, closestDate) {
    for (let taskId in categoryTasks) {
        let task = categoryTasks[taskId];

        if (task.dueDate) {
            let dueDate = validateDueDate(task.dueDate);
            if (dueDate && (!closestDate || dueDate < closestDate)) {
                closestDate = dueDate;
            }
        }
    }
    return closestDate;
}

/**
 * Validates and converts a due date string into a Date object.
 * @param {string} dueDateString - The due date string from the task.
 * @returns {Date|null} - A valid Date object or null if invalid.
 */
function validateDueDate(dueDateString) {
    let dueDate = new Date(dueDateString.replace(/-/g, '/'));

    if (isNaN(dueDate.getTime())) {
        console.warn("Invalid date format:", dueDateString);
        return null;
    }
    return dueDate;
}



/**
 * Updates the upcoming deadline in the UI.
 * @param {object} tasks - The tasks retrieved from Firebase.
 */
function updateUpcomingDeadline(tasks) {
    let closestDate = findClosestDate(tasks);

    let dateElement = document.getElementById('upcomingDeadline');
    if (dateElement) {
        if (closestDate) {
            let options = { year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.innerHTML = `<p>${closestDate.toLocaleDateString('en-GB', options)} - Upcoming Deadline</p>`;
        } else {
            dateElement.innerHTML = "<p>No upcoming deadlines.</p>";
        }
    } else {
        console.warn("Element #upcomingDeadline not found.");
    }
}


/**
 * Initializes the application when the page is fully loaded.
 */
window.onload = function () {
    loadSummaryData();
    // setCurrentDate();
    updateGreeting();
    displayFullName();
};


/**
 * Redirects the user to the board page after a short delay.
 * The delay is set to 0 milliseconds for immediate execution.
 * @returns {Promise<void>} A promise that resolves when the redirection is complete.
 */
async function summaryToBoard() {
    setTimeout(() => {
        window.location.href = "board.html";
    }, 0);
}