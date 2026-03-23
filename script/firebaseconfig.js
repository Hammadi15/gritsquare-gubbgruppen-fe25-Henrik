import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getDatabase, ref, set, push, get } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { censorBadWords } from "./censor.js";
import { setupDragAndDelete } from "./dragdelete.js";

const firebaseConfig = {
    apiKey: "AIzaSyASUiN6n-p9_B9Ruox6l3ZmW6qbQx3kRgY",
    authDomain: "flaskpost-8adcc.firebaseapp.com",
    projectId: "flaskpost-8adcc",
    storageBucket: "flaskpost-8adcc.firebasestorage.app",
    messagingSenderId: "75468522109",
    appId: "1:75468522109:web:6a69184654f1cea857e714"
  };
  
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const baseUrl = "https://flaskpost-8eeb9-default-rtdb.europe-west1.firebasedatabase.app/users";

//  Hämta alla users 
export async function getAllUsers() {

  const url = baseUrl + ".json";
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
    const userObj = await res.json();
    return userObj;
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
}  

//  Posta en ny user 
export async function postUser(user) {
  const url = baseUrl + ".json";
  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Content-Type": "application/json"  
      }
    });
    if (!res.ok) throw new Error(`Failed to post user: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error posting user:", error);
    return null;
  }
}

//  Ta bort en user/message baserat på nyckel
export async function deleteUser(userKey) {
  const url = `${baseUrl}/${userKey}.json`;
  try {
    const res = await fetch(url, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}


export function displayAllUsers(users) {
  const messagesList = document.getElementById("messagesList");
  messagesList.innerHTML = "";
  if (!users) return;

  Object.entries(users).forEach(([key, user]) => {
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

    div.innerHTML = `
      <span>${user.name}: ${user.message || "Inget meddelande"}</span>
    `;

    // 🔥 DRAG START
    div.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", key);
      div.classList.add("dragging");
    });

    div.addEventListener("dragend", () => {
      div.classList.remove("dragging");
    });

    messagesList.appendChild(div);
  });
}


// Håller koll på inloggad användare
let currentUser = null;

// Event listener för knappen 
const postBtn = document.getElementById("postBtn");
const usernameInput = document.getElementById("usernameInput");
const usernameCol = document.getElementById("usernameCol");
const messageInput = document.getElementById("messageInput");

postBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  // Censurera namn och meddelande
  const rawName = currentUser ? currentUser.displayName : usernameInput.value.trim();
  const censoredName = censorBadWords(rawName);
  const censoredMessage = censorBadWords(messageInput.value.trim());

  const userObj = {
    owner: currentUser ? currentUser.uid : "anonymous",
    name: censoredName,      // censurerat namn
    message: censoredMessage // censurerat meddelande
  }; 

  if (!userObj.name || !userObj.message) {
    alert("Please enter both username and message!");
    return;
  } 

  const response = await postUser(userObj);

  if (response) {
    const users = await getAllUsers();
    displayAllUsers(users);

    // Spela upp pop-ljud
    const audio = new Audio("../pop.mp3");
    audio.play().catch(err => console.warn("Audio playback failed:", err));

    // Töm inputfält
    if (!currentUser) usernameInput.value = "";
    messageInput.value = "";
  } else {
    alert("Failed to post message, please try again");
  }
});

//  Kör initial hämta alla users 
(async function init() {
  const users = await getAllUsers();
  displayAllUsers(users);
    setupDragAndDelete(deleteUser, getAllUsers, displayAllUsers);

})();



// Logga in med google genom firebase / Henrik

const loginBtn = document.getElementById("loginBtn");
const loginItem = document.getElementById("loginItem");
const logoutBtn = document.getElementById("logoutBtn");
const logoutItem = document.getElementById("logoutItem");
const signedInItem = document.getElementById("signedInItem");
const signedInLabel = document.getElementById("signedInLabel");

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  if (user) {
    console.log("User is signed in:", user.displayName);
    if (loginItem) loginItem.style.display = "none";
    if (signedInItem) signedInItem.style.display = "flex";
    if (signedInLabel) signedInLabel.textContent = "Signed in as " + (user.displayName || user.email);
    if (logoutItem) logoutItem.style.display = "";
    if (usernameCol) usernameCol.style.display = "none";
  } else {
    console.log("No user is signed in");
    if (loginItem) loginItem.style.display = "";
    if (signedInItem) signedInItem.style.display = "none";
    if (logoutItem) logoutItem.style.display = "none";
    if (usernameCol) usernameCol.style.display = "";
  }
});

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    signInWithPopup(auth, new GoogleAuthProvider())
      .then((result) => {
        console.log("User signed in:", result.user.displayName);
      })
      .catch((error) => {
        console.error("Error signing in:", error);
      });
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => console.log("User signed out"))
      .catch((error) => console.error("Error signing out:", error));
  });
}




// i github.com på din fork, synca med OG repo
// i github desktop sync så att din lokala pc pullar atta commisten
//gå sedan till din branch
// i branch tabben finns det en option att merga vilket är main -> branch
//då har du alla ändringar + din feature i samma branch

//SLUTET
//i branch tabben finns den slutligen en pullrequest knapp som skickar den feature branch -> OGs main
