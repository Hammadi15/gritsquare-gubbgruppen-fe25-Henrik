const baseUrlUsers = "https://flaskpost-8adcc-default-rtdb.europe-west1.firebasedatabase.app/users";
const favoritesBaseUrl = "https://flaskpost-8adcc-default-rtdb.europe-west1.firebasedatabase.app/favorites";
const baseUrl = "https://flaskpost-8adcc-default-rtdb.europe-west1.firebasedatabase.app/";

export async function getAllUsers() {
  const url = baseUrlUsers + ".json";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
}

export async function postUser(user) {
  const url = baseUrlUsers + ".json";
  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(user),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Failed to post user: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error posting user:", error);
    return null;
  }
}

export async function postReply(reply) {
  const url = "https://flaskpost-8adcc-default-rtdb.europe-west1.firebasedatabase.app/replies.json";
  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(reply),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Failed to post reply: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error posting reply:", error);
    return null;
  }
}

export async function getAllReplies() {
  const url = "https://flaskpost-8adcc-default-rtdb.europe-west1.firebasedatabase.app/replies.json";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
}


export async function deleteUser(userKey) {
  const url = `${baseUrlUsers}/${userKey}.json`;
  try {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}

export async function getFavoritesByUserId(userId) {
  if (!userId) return {};

  const url = `${favoritesBaseUrl}/${userId}.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch favorites: ${res.status}`);
    return (await res.json()) || {};
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return {};
  }
}

export async function addFavoriteByUserId(userId, messageKey) {
  if (!userId || !messageKey) return false;

  const url = `${favoritesBaseUrl}/${userId}/${messageKey}.json`;
  try {
    const res = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(true),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Failed to add favorite: ${res.status}`);
    return true;
  } catch (error) {
    console.error("Error adding favorite:", error);
    return false;
  }
}

export async function removeFavoriteByUserId(userId, messageKey) {
  if (!userId || !messageKey) return false;

  const url = `${favoritesBaseUrl}/${userId}/${messageKey}.json`;
  try {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to remove favorite: ${res.status}`);
    return true;
  } catch (error) {
    console.error("Error removing favorite:", error);
    return false;
  }
}
