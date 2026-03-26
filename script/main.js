import {getAllUsers, deleteUser, getAllReplies} from "./userApi.js";
import {
    displayAllUsers,
    sortUsersByCreatedAt,
    sortUsersByName,
    sortUsersByFavorites,
} from "./uiMessages.js";
import {setupDragAndDelete} from "./dragdelete.js";
import {setupDragAndFavorite} from "./dragfavorite.js";
import {setupPostForm} from "./postForm.js";
import {setupAuth} from "./auth.js";
import {
    addFavoriteForCurrentUser,
    getFavoritesForCurrentUser,
    hasGuestFavorites,
    migrateGuestFavoritesToUser,
    removeFavoriteForCurrentUser,
    toggleFavoriteForCurrentUser,
} from "./favorites.js";

const sortTimeBtn = document.getElementById("sortTimeBtn");
const sortNameBtn = document.getElementById("sortNameBtn");
const sortFavoritesBtn = document.getElementById("sortFavoritesBtn");
const favoriteZone = document.getElementById("favoriteZone");

let currentUsers = null;
let currentFavorites = new Set();
let currentSortMode = "time";
let replies = await getAllReplies();

function getSortFunction() {
    if (currentSortMode === "name") return sortUsersByName;
    if (currentSortMode === "favorites") {
        return (users) => sortUsersByFavorites(users, currentFavorites);
    }
    return sortUsersByCreatedAt;
}

function syncFavoriteZoneLabel() {
    if (!favoriteZone) return;
    favoriteZone.textContent =
        currentSortMode === "favorites"
            ? "⭐ Dra hit för att avfavoritera"
            : "⭐ Dra hit för favorit";
}

function renderUsers(nextUsers = currentUsers) {
    
    currentUsers = nextUsers;
    displayAllUsers(currentUsers, getSortFunction(), {
        favoritesSet: currentFavorites,
        onFavoriteToggle: async (messageKey) => {
            const success = await toggleFavoriteForCurrentUser(
                messageKey,
                window.currentUserId,
            );
            if (!success) {
                alert("Kunde inte uppdatera favorit");
                return;
            }

            currentFavorites = await getFavoritesForCurrentUser(
                window.currentUserId,
            );
            renderUsers();
        },
        replies: replies,
    });
}

export const renderReplies = async (replies, parent_id, repliesDiv) => {

    for (const key in replies) {
        if (!Object.hasOwn(replies, key)) return;

        const element = replies[key];
        console.log(element);
        // console.log(element.parent_id)
        if (element.parent_id === parent_id) {
            console.log(`${element.message} is a reply to ${parent_id}`);
            const replyDiv = document.createElement("div");

            replyDiv.classList.add(
                "message",
                "reply",
                "list-group-item",
                "list-group-item-action",
                "bg-white",
                "text-dark",
                "border-secondary",
                "rounded-3",
                "mb-2",
            );

            replyDiv.innerHTML = `
            <p>${element.message}</p>
                </div>
                <div class="message-time-div rounded">
                <small class="message-time">${new Date(element.createdAt).toLocaleString("sv-SE")}</small>
                </div>
            `;

            repliesDiv.appendChild(replyDiv);
        }
    }
};

async function refreshUsersAndRender() {
    currentUsers = await getAllUsers();

    renderUsers();
}

async function refreshFavoritesAndRender() {
    currentFavorites = await getFavoritesForCurrentUser(window.currentUserId);
    renderUsers();
}

async function refreshAppState() {
    const [users, favorites] = await Promise.all([
        getAllUsers(),
        getFavoritesForCurrentUser(window.currentUserId),
    ]);

    currentUsers = users;
    currentFavorites = favorites;
    renderUsers();
}

sortTimeBtn.addEventListener("click", async () => {
    currentSortMode = "time";
    syncFavoriteZoneLabel();
    renderUsers();
});

sortNameBtn.addEventListener("click", async () => {
    currentSortMode = "name";
    syncFavoriteZoneLabel();
    renderUsers();
});

if (sortFavoritesBtn) {
    sortFavoritesBtn.addEventListener("click", () => {
        currentSortMode = "favorites";
        syncFavoriteZoneLabel();
        renderUsers();
    });
}

async function init() {
    await refreshAppState();

    setupDragAndDelete(deleteUser, getAllUsers, renderUsers);

    setupDragAndFavorite(
        async (messageKey) => {
            const shouldUnfavorite = currentSortMode === "favorites";
            const success = shouldUnfavorite
                ? await removeFavoriteForCurrentUser(
                      messageKey,
                      window.currentUserId,
                  )
                : await addFavoriteForCurrentUser(
                      messageKey,
                      window.currentUserId,
                  );
            if (!success) return false;

            currentFavorites = await getFavoritesForCurrentUser(
                window.currentUserId,
            );
            return true;
        },
        async () => {
            renderUsers();
        },
    );

    setupPostForm({displayAllUsers: renderUsers});

    syncFavoriteZoneLabel();

    setupAuth({
        onAuthUserChange: async ({user, previousUser, isInitial}) => {
            const didLoginNow = !isInitial && !previousUser && !!user;
            if (didLoginNow && hasGuestFavorites()) {
                const shouldMigrate = window.confirm(
                    "Du har lokala favoriter från gästläge. Vill du flytta dem till ditt konto?",
                );

                if (shouldMigrate) {
                    const migrated = await migrateGuestFavoritesToUser(
                        user.uid,
                    );
                    if (!migrated) {
                        alert(
                            "Några favoriter kunde inte flyttas. Försök igen senare.",
                        );
                    }
                }
            }

            await refreshFavoritesAndRender();
        },
    });

    await refreshUsersAndRender();
}

init().catch((error) => {
    console.error("Init error:", error);
});
