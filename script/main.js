import { getAllUsers, deleteUser } from "./userApi.js";
import { displayAllUsers,sortUsersByCreatedAt,sortUsersByName } from "./uiMessages.js";
import { setupDragAndDelete } from "./dragdelete.js";
import { setupPostForm } from "./postForm.js";
import { setupAuth } from "./auth.js";


const sortTimeBtn = document.getElementById("sortTimeBtn");
const sortNameBtn = document.getElementById("sortNameBtn");

sortTimeBtn.addEventListener("click", async () => {
  const users = await getAllUsers();
  displayAllUsers(users, sortUsersByCreatedAt);
});

sortNameBtn.addEventListener("click", async () => {
  const users = await getAllUsers();
  displayAllUsers(users, sortUsersByName);
});


async function init() {
  const users = await getAllUsers();
  displayAllUsers(users);
  setupDragAndDelete(deleteUser, getAllUsers, displayAllUsers);
  setupPostForm({ displayAllUsers });
  setupAuth({ displayAllUsers });
}

init().catch((error) => {
  console.error("Init error:", error);
});
