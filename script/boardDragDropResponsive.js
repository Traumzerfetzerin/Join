/**
 * Enables drag-and-drop functionality for both mouse and touch events and updates Firebase.
 */
let draggedItem = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let currentColumn = null;

/**
 * Initializes event listeners for draggable elements.
 */
function initDragAndDrop() {
    let tasks = document.querySelectorAll(".task");
    tasks.forEach(task => {
        task.setAttribute("draggable", true);
        task.addEventListener("dragstart", dragStart);
        task.addEventListener("dragend", dragEnd);
        task.addEventListener("touchstart", touchStart, { passive: false });
        task.addEventListener("touchmove", touchMove, { passive: false });
        task.addEventListener("touchend", touchEnd);
    });
}

/**
 * Handles the drag start event.
 */
function dragStart(event) {
    draggedItem = event.target.closest(".task");
    currentColumn = draggedItem.closest(".column");
    event.dataTransfer.setData("text", draggedItem.outerHTML);
    setTimeout(() => draggedItem.classList.add("dragging"), 0);
}

/**
 * Handles the drag end event.
 */
function dragEnd() {
    if (draggedItem) {
        draggedItem.classList.remove("dragging");
        draggedItem = null;
        currentColumn = null;
    }
}

/**
 * Handles the touch start event.
 */
function touchStart(event) {
    event.preventDefault();
    let touch = event.touches[0];
    draggedItem = event.target.closest(".task");
    currentColumn = draggedItem.closest(".column");
    let rect = draggedItem.getBoundingClientRect();
    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;
    draggedItem.classList.add("dragging");
}

/**
 * Handles the touch move event.
 */
function touchMove(event) {
    if (!draggedItem) return;
    event.preventDefault();
    let touch = event.touches[0];
    draggedItem.style.position = "fixed";
    draggedItem.style.left = (touch.clientX - touchOffsetX) + "px";
    draggedItem.style.top = (touch.clientY - touchOffsetY) + "px";
    let newColumn = document.elementFromPoint(touch.clientX, touch.clientY)?.closest(".column");
    if (newColumn && newColumn !== currentColumn) {
        currentColumn = newColumn;
    }
}

/**
 * Handles the touch end event.
 */
function touchEnd(event) {
    if (draggedItem && currentColumn) {
        currentColumn.innerHTML += draggedItem.outerHTML;
        updateTaskColumn(draggedItem.id.replace("task-", ""), currentColumn.id);
        draggedItem.remove();
    }
    draggedItem = null;
    currentColumn = null;
}

/**
 * Initializes event listeners for drop zones.
 */
function initDropZones() {
    let columns = document.querySelectorAll(".column");
    columns.forEach(column => {
        column.addEventListener("dragover", dragOver);
        column.addEventListener("drop", drop);
        column.addEventListener("touchend", touchDrop);
    });
}

/**
 * Prevents the default behavior to allow dropping.
 */
function dragOver(event) {
    event.preventDefault();
}

/**
 * Handles the drop event and updates Firebase.
 */
function drop(event) {
    event.preventDefault();
    let column = event.target.closest(".column");
    if (column && draggedItem) {
        column.innerHTML += draggedItem.outerHTML;
        updateTaskColumn(draggedItem.id.replace("task-", ""), column.id);
        draggedItem.remove();
    }
    dragEnd();
}

/**
 * Handles the touch drop event and updates Firebase.
 */
function touchDrop(event) {
    let column = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY)?.closest(".column");
    if (column && draggedItem) {
        column.innerHTML += draggedItem.outerHTML;
        updateTaskColumn(draggedItem.id.replace("task-", ""), column.id);
        draggedItem.remove();
    }
    touchEnd();
}

/**
 * Updates the task's column in Firebase.
 */
async function updateTaskColumn(taskId, columnId) {
    let url = `https://join-382-default-rtdb.europe-west1.firebasedatabase.app/Tasks/User%20Story/${taskId}.json`;
    let response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column: columnId })
    });
    if (!response.ok) {
        console.error("Firebase update failed", response.status);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    initDragAndDrop();
    initDropZones();
});
