import { renderReplies } from "./main.js";
import { sendReply } from "./sendReply.js";
import { getAllReplies } from "./userApi.js";

export function sortUsersByCreatedAt(users) {
    if (!users) return [];
    return Object.entries(users).sort(
        ([, a], [, b]) => (b.createdAt || 0) - (a.createdAt || 0),
    );
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
function showFirework() {
    const container = document.getElementById("fireworkContainer");
    if (!container) return;
    for (let i = 0; i < 8; i++) {
        const firework = document.createElement("div");
        firework.classList.add("firework");
        firework.textContent = "🎉";

        firework.style.left = `${Math.random() * 90}%`;
        firework.style.top = `${Math.random() * 80}%`;

        container.appendChild(firework);

        setTimeout(() => {
            firework.remove();
        }, 1000);
    }
}

export function sortUsersByFavorites(users, favoritesSet = new Set()) {
    if (!users) return [];

    return Object.entries(users)
        .filter(([key]) => favoritesSet.has(key))
        .sort(([keyA, a], [keyB, b]) => {
            const favoriteA = favoritesSet.has(keyA) ? 1 : 0;
            const favoriteB = favoritesSet.has(keyB) ? 1 : 0;

            if (favoriteA !== favoriteB) {
                return favoriteB - favoriteA;
            }

            return (b.createdAt || 0) - (a.createdAt || 0);
        });
    div.setAttribute("draggable", true);
    div.dataset.key = key;

    const timeText = user.createdAt ? new Date(user.createdAt).toLocaleString("sv-SE") : "";

div.innerHTML = `
  <div class="message-content">
    <div class="message-head">
      <div><strong>${user.name}</strong>: <span style="color: ${user.color || "#000"}">${user.message || "Inget meddelande"}</span></div>
      <button class="favorite-btn ${isFavorite ? "is-favorite" : ""}" type="button" aria-label="Favoritmarkera meddelande">
        ${isFavorite ? "★" : "☆"}
      </button>
    </div>
    <div class="message-time-div rounded">
      <small class="message-time">${timeText}</small>
    </div>
    <button class="like-btn">❤️ 0</button>
  </div>
`;
const likeBtn = div.querySelector(".like-btn");
let likes = 0;

likeBtn.addEventListener("click", () => {
  likes++;
  likeBtn.textContent = `❤️ ${likes}`;

if (likes % 10 === 0) {
  showFirework();
}

export function displayAllUsers(
    users,
    sortFunction = sortUsersByCreatedAt,
    options = {},
) {
    const messagesList = document.getElementById("messagesList");
    if (!messagesList) return;
    messagesList.innerHTML = "";

    const favoritesSet = options.favoritesSet || new Set();
    const onFavoriteToggle = options.onFavoriteToggle;
    const replies = options.replies || {};
    

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
            "mb-2",
        );
        if (user.owner && user.owner !== "anonymous") {
            div.classList.add("message-authenticated");
        }
        if (window.currentUserId && user.owner === window.currentUserId) {
            div.classList.add("message-own");
        }

        const isFavorite = favoritesSet.has(key);
        if (isFavorite) {
            div.classList.add("message-favorite");
        }

        div.setAttribute("draggable", true);
        div.dataset.key = key;

        const timeText = user.createdAt
            ? new Date(user.createdAt).toLocaleString("sv-SE")
            : "";

        div.addEventListener("click", (e) => {
            console.log("I am clicked");

            const form = e.currentTarget.querySelector("form");

            form.addEventListener("click", (e) => {
                e.stopPropagation();
            });

            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const data = new FormData(form);

                const reply = data.get("reply-message");

                if (!reply) {
                    alert("dont send empty reply");
                    return;
                }

                sendReply(key, reply);
                console.log(reply);
            });

            const replySection =
                e.currentTarget.querySelector(".reply-section");

            replySection.hidden = !replySection.hidden;

            console.log(replySection);
        });

        div.innerHTML = `
            <div class="message-content">
                <div class="message-head">
                <div><strong>${user.name}</strong>: ${user.message || "Inget meddelande"}</div>
                <button class="favorite-btn ${isFavorite ? "is-favorite" : ""}" type="button" aria-label="Favoritmarkera meddelande">
                    ${isFavorite ? "★" : "☆"}
                </button>
                </div>
                <div class="message-time-div rounded">
                <small class="message-time">${timeText}</small>
                </div>
                <button class="like-btn">❤️ 0</button>
                <section hidden class="reply-section mt-2">
                    <form class="flex"> 
                        <input name="reply-message" type="text"/>
                        <button  type="submit">Send Reply!</button>
                    </form>
                </section>
            </div>            
            `;

            const replyDiv = document.createElement("div");
        const likeBtn = div.querySelector(".like-btn");
        let likes = 0;

        likeBtn.addEventListener("click", () => {
            likes++;
            likeBtn.textContent = `❤️ ${likes}`;

            if (likes % 10 === 0) {
                showFirework();
            }
        });

        const favoriteBtn = div.querySelector(".favorite-btn");
        favoriteBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof onFavoriteToggle === "function") {
                await onFavoriteToggle(key);
            }
        });

        favoriteBtn.addEventListener("dragstart", (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        div.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", key);
            div.classList.add("dragging");
        });
        div.addEventListener("dragend", () => div.classList.remove("dragging"));

        messagesList.append(div, replyDiv);

            console.log(replies)
            renderReplies(replies, key, replyDiv);
    });
}
