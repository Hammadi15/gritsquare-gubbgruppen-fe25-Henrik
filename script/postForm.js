import { censorBadWords } from "./censor.js";
import { postUser, getAllUsers } from "./userApi.js";

export function setupPostForm({ displayAllUsers }) {
  const postBtn = document.getElementById("postBtn");
  const usernameInput = document.getElementById("usernameInput");
  const messageInput = document.getElementById("messageInput");
  const colorPicker = document.getElementById("textColorPicker");

   colorPicker.addEventListener("input", () => {
    messageInput.style.color = colorPicker.value;
  });

  postBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const censoredName = censorBadWords(usernameInput.value.trim());
    const censoredMessage = censorBadWords(messageInput.value.trim());

    const userObj = {
      owner: window.currentUserId || "anonymous",
      name: censoredName,
      message: censoredMessage,
      color: document.getElementById("textColorPicker").value,
      createdAt: Date.now(),
    };

    if (!userObj.name || !userObj.message) {
      alert("Please enter both username and message!");
      return;
    }

    const response = await postUser(userObj);
    if (response) {
      const users = await getAllUsers();
      displayAllUsers(users);
      const audio = new Audio("./pop.mp3");
      audio.play().catch((err) => console.warn("Audio playback failed:", err));
      if (!window.currentUserId) {
        usernameInput.value = "";
      }
      messageInput.value = "";
       messageInput.style.color = "#000000";
       colorPicker.value = "#000000";
    } else {
      alert("Failed to post message, please try again");
    }
  });
}
