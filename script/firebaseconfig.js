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

//  Visa users/messages i DOM 
export function displayAllUsers(users) {
  const messagesList = document.getElementById("messagesList");
  messagesList.innerHTML = "";
  if (!users) return;

  Object.values(users).forEach(user => {
    const div = document.createElement("div");
    div.classList.add("message");
div.textContent = `${user.name}: ${user.message || ""}`;
 messagesList.appendChild(div);
  });
}

// Event listener för knappen 
const postBtn = document.getElementById("postBtn");
const usernameInput = document.getElementById("usernameInput");
const messageInput = document.getElementById("messageInput");

postBtn.addEventListener("click", async () => {
  const userObj = {
    name: usernameInput.value.trim(),
    message: messageInput.value.trim()
  };

  if (!userObj.name || !userObj.message) {
    alert("Please enter both username and message!");
    return;
  }

  const response = await postUser(userObj);

  if (response) {
    const users = await getAllUsers();
    displayAllUsers(users);

    // Töm inputfält
    usernameInput.value = "";
    messageInput.value = "";
  } else {
    alert("Failed to post message, please try again");
  }
});

//  Kör initial hämta alla users 
(async function init() {
  const users = await getAllUsers();
  displayAllUsers(users);
})();

//har mer att fixa at, skall fixa att undefined inte visas om user redan finns i firebase manuellt.