export function sortUsersByCreatedAt(users) {
  if (!users) return [];
  return Object.entries(users).sort(([, a], [, b]) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function sortUsersByName(users) {
  if (!users) return [];
  return Object.entries(users).sort(([, a], [, b]) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
}

export function displayAllUsers(users, sortFunction = sortUsersByCreatedAt) {
  const messagesList = document.getElementById("messagesList");
  if (!messagesList) return;
  messagesList.innerHTML = "";

  sortFunction(users).forEach(([key, user]) => {
    if (!user) return;

    const div = document.createElement("div");
    div.classList.add(
      "message",
      "list-group-item",
      "list-group-item-action",
      "bg-white",
      "text-dark",
      "border-secondary",
      "rounded-3",
      "mb-2"
    );
    div.setAttribute("draggable", true);
    div.dataset.key = key;

    const timeText = user.createdAt ? new Date(user.createdAt).toLocaleString("sv-SE") : "";

    div.innerHTML = `
      <span>${user.name || "Anonymous"}: ${user.message || ""}</span>
      <small>${timeText}</small>
    `;

    div.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", key);
      div.classList.add("dragging");
    });
    div.addEventListener("dragend", () => div.classList.remove("dragging"));

    messagesList.appendChild(div);
  });
}