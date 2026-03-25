// Emoji feature (Elin)
document.addEventListener("DOMContentLoaded", () => {
  const emojiCodes = [0x1F474,0x1F600, 0x1F60D, 0x1F602,0x1F44D];
  const selectEl = document.querySelector("#emojis");
  const messageInput = document.querySelector("#messageInput");
  const chatForm = document.querySelector("#chatForm");
  const messagesList = document.querySelector("#messagesList");
  const usernameInput = document.querySelector("#usernameInput");

 
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "👴";
  defaultOption.value = "";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  selectEl.appendChild(defaultOption);

 
  emojiCodes.forEach(code => {
    const emoji = String.fromCodePoint(code);
    const option = document.createElement("option");
    option.value = emoji;
    option.textContent = emoji;
    selectEl.appendChild(option);
  });

  selectEl.addEventListener("change", () => {
    const emoji = selectEl.value;
    if (!emoji) return;

    const start = messageInput.selectionStart;
    const end = messageInput.selectionEnd;
    messageInput.value = messageInput.value.slice(0, start) + emoji + messageInput.value.slice(end);

    messageInput.focus();
    messageInput.selectionStart = messageInput.selectionEnd = start + emoji.length;

    selectEl.selectedIndex = 0;
  });

  chatForm.addEventListener("submit", e => {
    e.preventDefault(); 

    const username = usernameInput.value.trim() || "Anonym";
    const text = messageInput.value.trim();
    if (!text) return;

    const msgItem = document.createElement("div");
    msgItem.classList.add("list-group-item");
    msgItem.textContent = `${username}: ${text}`;

    messagesList.appendChild(msgItem);

    messageInput.value = "";
    messageInput.focus();
    messagesList.scrollTop = messagesList.scrollHeight;
  });
});