import { renderReplies } from "./main.js";
import { sendReply } from "./sendReply.js";
import { updateUser } from "./userApi.js";
import { censorBadWords } from "./censor.js";

const REACTIONS = ["👍", "❤️", "😂"];
const REACTION_STORAGE_KEY = "messageReactions";
const REACTION_USER_STORAGE_KEY = "messageReactionsByClient";
const REACTION_CLIENT_ID_KEY = "reactionClientId";

function getClientId() {
    const existing = localStorage.getItem(REACTION_CLIENT_ID_KEY);
    if (existing) return existing;
    const generated = `client_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(REACTION_CLIENT_ID_KEY, generated);
    return generated;
}

function loadReactionStore() {
    try {
        const raw = localStorage.getItem(REACTION_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
    } catch (error) {
        console.warn("Failed to load reactions", error);
    }
    return {};
}

function loadUserReactionStore() {
    try {
        const raw = localStorage.getItem(REACTION_USER_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
    } catch (error) {
        console.warn("Failed to load user reactions", error);
    }
    return {};
}

function saveReactionStore(store) {
    try {
        localStorage.setItem(REACTION_STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
        console.warn("Failed to save reactions", error);
    }
}

function saveUserReactionStore(store) {
    try {
        localStorage.setItem(REACTION_USER_STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
        console.warn("Failed to save user reactions", error);
    }
}

function getReactionCount(store, messageKey, reaction) {
    const entry = store[messageKey];
    if (!entry || typeof entry !== "object") return 0;
    const value = entry[reaction];
    return Number.isFinite(value) ? value : 0;
}

function incrementReaction(store, messageKey, reaction) {
    if (!store[messageKey] || typeof store[messageKey] !== "object") {
        store[messageKey] = {};
    }
    const nextValue = getReactionCount(store, messageKey, reaction) + 1;
    store[messageKey][reaction] = nextValue;
    return nextValue;
}

function decrementReaction(store, messageKey, reaction) {
    const current = getReactionCount(store, messageKey, reaction);
    const nextValue = Math.max(0, current - 1);
    if (!store[messageKey] || typeof store[messageKey] !== "object") {
        store[messageKey] = {};
    }
    store[messageKey][reaction] = nextValue;
    return nextValue;
}

function getUserReaction(userStore, clientId, messageKey, reaction) {
    const clientEntry = userStore[clientId];
    if (!clientEntry || typeof clientEntry !== "object") return false;
    const messageEntry = clientEntry[messageKey];
    if (!messageEntry || typeof messageEntry !== "object") return false;
    return Boolean(messageEntry[reaction]);
}

function setUserReaction(userStore, clientId, messageKey, reaction, value) {
    if (!userStore[clientId] || typeof userStore[clientId] !== "object") {
        userStore[clientId] = {};
    }
    if (!userStore[clientId][messageKey] || typeof userStore[clientId][messageKey] !== "object") {
        userStore[clientId][messageKey] = {};
    }
    userStore[clientId][messageKey][reaction] = value;
}

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
}

export function displayAllUsers(
    users,
    sortFunction = sortUsersByCreatedAt,
    options = {},
) {
    const messagesList = document.getElementById("messagesList");
    if (!messagesList) return;
    messagesList.innerHTML = "";

    const reactionStore = loadReactionStore();
    const userReactionStore = loadUserReactionStore();
    const clientId = getClientId();
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
        const hasReactions = REACTIONS.some((reaction) =>
            getReactionCount(reactionStore, key, reaction) > 0,
        );
        if (hasReactions) {
            div.classList.add("message-has-reactions");
        }

        div.setAttribute("draggable", true);
        div.dataset.key = key;

        const timeText = user.createdAt
            ? new Date(user.createdAt).toLocaleString("sv-SE")
            : "";

        div.addEventListener("click", (e) => {
            if (e.target.closest("form")) return;
            const replySection = e.currentTarget.querySelector(".reply-section");
            replySection.hidden = !replySection.hidden;
        });

        div.addEventListener("submit", (e) => {
            if (e.target && e.target.classList && e.target.classList.contains("edit-form")) {
                return;
            }
            e.preventDefault();
            const data = new FormData(e.target);
            const reply = data.get("reply-message");
            const replyColor = document.getElementById("textColorPicker")?.value || "#000000";
            if (!reply) {
                alert("dont send empty reply");
                return;
            }
            const replyUsername = document.getElementById("usernameInput")?.value?.trim() || "Anonymous";
            sendReply(key, reply, replyColor, replyUsername);
        });

        const displayName = user.name || "Anonymous";
        const verifiedBadge =
            user.owner && user.owner !== "anonymous"
                ? `<i class="verified-badge bi bi-patch-check-fill" title="Signed in user" aria-label="Signed in user"></i>`
                : "";
        const isOwnMessage = window.currentUserId && user.owner === window.currentUserId;
        const editedLabel = user.editedAt
            ? `<small class="message-edited" aria-label="edited">(edited)</small>`
            : "";

        div.innerHTML = `
            <div class="message-content">
                <div class="message-head">
            <div class="message-title"><strong>${displayName}</strong>${verifiedBadge}: <span class="message-text" style="color: ${user.color || "#000"}">${user.message || "Inget meddelande"}</span>${editedLabel}</div>
                <div class="message-actions">
                    <button class="favorite-btn ${isFavorite ? "is-favorite" : ""}" type="button" aria-label="Favoritmarkera meddelande">
                        ${isFavorite ? "★" : "☆"}
                    </button>
                    ${isOwnMessage ? `<button class="edit-btn" type="button" aria-label="Edit message"><i class="bi bi-pencil"></i></button>` : ""}
                </div>
                </div>
                <div class="message-time-div rounded">
                <small class="message-time">${timeText}</small>
                </div>
                <div class="reaction-bar" role="group" aria-label="Message reactions">
                    ${REACTIONS.map((reaction) => {
                        const count = getReactionCount(reactionStore, key, reaction);
                        const isActive = getUserReaction(userReactionStore, clientId, key, reaction);
                        const hasCount = count > 0;
                        return `<button class="reaction-btn ${isActive ? "is-active" : ""} ${hasCount ? "has-count" : ""}" type="button" data-reaction="${reaction}" aria-pressed="${isActive}">
                            <span class="reaction-emoji">${reaction}</span>
                            <span class="reaction-count">${count}</span>
                        </button>`;
                    }).join("")}
                </div>
                <button class="reply-toggle-btn" type="button" aria-label="Reply">
                    <i class="bi bi-reply"></i>
                </button>
            </div>
            <div class="replies-container"></div>
            <section hidden class="reply-section mt-2">
                    ${window.currentUserId
                        ? `<form class="flex"> 
                        <input name="reply-message" type="text"/>
                        <button type="submit" class="btn btn-burnt-peach btn-sm">Send Reply!</button>
                    </form>`
                        : `<p class="text-muted small">You must be signed in to reply.</p>`
                    }
                </section>
            `;

        const replyDiv = div.querySelector(".replies-container");
        const replyToggleBtn = div.querySelector(".reply-toggle-btn");
        if (replyToggleBtn) {
            replyToggleBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const replySection = div.querySelector(".reply-section");
                if (replySection) {
                    replySection.hidden = !replySection.hidden;
                    replyToggleBtn.classList.toggle("is-open", !replySection.hidden);
                }
            });
        }
        const messageTitle = div.querySelector(".message-title");
        const editBtn = div.querySelector(".edit-btn");
        if (editBtn && messageTitle) {
            editBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (div.classList.contains("is-editing")) return;
                div.classList.add("is-editing");
                div.setAttribute("draggable", "false");

                const currentText = messageTitle.querySelector(".message-text")?.textContent || "";
                const editForm = document.createElement("form");
                editForm.className = "edit-form";
                editForm.innerHTML = `
                    <input class="edit-input" type="text" value="${currentText.replace(/\"/g, "&quot;")}" />
                    <div class="edit-actions">
                        <button type="submit" class="btn btn-burnt-peach btn-sm">Save</button>
                        <button type="button" class="btn btn-outline-secondary btn-sm edit-cancel">Cancel</button>
                    </div>
                `;

                const textSpan = messageTitle.querySelector(".message-text");
                if (textSpan) textSpan.replaceWith(editForm);

                const input = editForm.querySelector(".edit-input");
                if (input) {
                    input.focus();
                    input.setSelectionRange(input.value.length, input.value.length);
                }

                const cancelBtn = editForm.querySelector(".edit-cancel");
                if (cancelBtn) {
                    cancelBtn.addEventListener("click", () => {
                        const restored = document.createElement("span");
                        restored.className = "message-text";
                        restored.style.color = user.color || "#000";
                        restored.textContent = currentText || "Inget meddelande";
                        editForm.replaceWith(restored);
                        div.classList.remove("is-editing");
                        div.setAttribute("draggable", "true");
                    });
                }

                editForm.addEventListener("submit", async (event) => {
                    event.preventDefault();
                    const nextRaw = input ? input.value.trim() : "";
                    if (!nextRaw) {
                        alert("Message cannot be empty");
                        return;
                    }
                    const nextValue = censorBadWords(nextRaw);
                    const ok = await updateUser(key, {
                        message: nextValue,
                        editedAt: Date.now(),
                    });
                    if (!ok) {
                        alert("Failed to update message");
                        return;
                    }

                    const updated = document.createElement("span");
                    updated.className = "message-text";
                    updated.style.color = user.color || "#000";
                    updated.textContent = nextValue;
                    editForm.replaceWith(updated);

                    let edited = messageTitle.querySelector(".message-edited");
                    if (!edited) {
                        edited = document.createElement("small");
                        edited.className = "message-edited";
                        edited.textContent = "(edited)";
                        messageTitle.append(" ", edited);
                    }
                    div.classList.remove("is-editing");
                    div.setAttribute("draggable", "true");
                });
            });
        }
        const reactionButtons = div.querySelectorAll(".reaction-btn");
        reactionButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const reaction = button.dataset.reaction;
                if (!reaction) return;
                const isActive = getUserReaction(userReactionStore, clientId, key, reaction);
                const nextValue = isActive
                    ? decrementReaction(reactionStore, key, reaction)
                    : incrementReaction(reactionStore, key, reaction);
                setUserReaction(userReactionStore, clientId, key, reaction, !isActive);
                const countSpan = button.querySelector(".reaction-count");
                if (countSpan) countSpan.textContent = String(nextValue);
                saveReactionStore(reactionStore);
                saveUserReactionStore(userReactionStore);
                button.classList.toggle("is-active", !isActive);
                button.classList.toggle("has-count", nextValue > 0);
                button.setAttribute("aria-pressed", String(!isActive));
                const totalNow = REACTIONS.reduce(
                    (sum, item) => sum + getReactionCount(reactionStore, key, item),
                    0,
                );
                div.classList.toggle("message-has-reactions", totalNow > 0);
                if (!isActive && nextValue > 0 && nextValue % 10 === 0) {
                    showFirework();
                }
            });
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

        messagesList.append(div);
        console.log(replies);
        renderReplies(replies, key, replyDiv);
    });
}


