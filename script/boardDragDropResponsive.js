/**
 * Enables drag-and-drop functionality for both mouse and touch events.
 */
let draggedItem = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

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
    draggedItem = event.target;
    event.dataTransfer.setData("text", "");
    setTimeout(() => event.target.classList.add("dragging"), 0);
}

/**
 * Handles the drag end event.
 */
function dragEnd() {
    draggedItem.classList.remove("dragging");
    draggedItem = null;
}

/**
 * Handles the touch start event.
 */
function touchStart(event) {
    event.preventDefault();
    let touch = event.touches[0];
    draggedItem = event.target;
    touchOffsetX = touch.clientX - draggedItem.getBoundingClientRect().left;
    touchOffsetY = touch.clientY - draggedItem.getBoundingClientRect().top;
    draggedItem.classList.add("dragging");
}

/**
 * Handles the touch move event.
 */
function touchMove(event) {
    if (!draggedItem) return;
    event.preventDefault();
    let touch = event.touches[0];
    draggedItem.style.position = "absolute";
    draggedItem.style.left = (touch.clientX - touchOffsetX) + "px";
    draggedItem.style.top = (touch.clientY - touchOffsetY) + "px";
}

/**
 * Handles the touch end event.
 */
function touchEnd(event) {
    draggedItem.style.position = "";
    draggedItem.style.left = "";
    draggedItem.style.top = "";
    draggedItem.classList.remove("dragging");
    draggedItem = null;
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
 * Handles the drop event.
 */
function drop(event) {
    event.preventDefault();
    if (draggedItem) {
        event.target.appendChild(draggedItem);
    }
}

/**
 * Handles the touch drop event.
 */
function touchDrop(event) {
    let column = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    if (column && column.classList.contains("column")) {
        column.appendChild(draggedItem);
    }
    draggedItem.style.position = "";
    draggedItem.style.left = "";
    draggedItem.style.top = "";
    draggedItem.classList.remove("dragging");
    draggedItem = null;
}

document.addEventListener("DOMContentLoaded", function() {
    initDragAndDrop();
    initDropZones();
});
