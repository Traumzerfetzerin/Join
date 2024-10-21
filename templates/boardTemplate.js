/** Template for each task */
function getTaskBoardTemplate(category, title, description) {
    return `
        <div class="task" draggable="true" ondragstart="drag(event)" id="${title}">
            <h3>${category}</h3>
            <h4>${title}</h4>
            <p>${description}</p>
        </div>
    `;
}