import { getAllReplies, postReply } from "./userApi.js";
import { censorBadWords } from "./censor.js";
import { displayAllUsers } from "./uiMessages.js";
import { getAllUsers } from "./userApi.js";

export const sendReply = async (messageKey, text = "") => {

    if (!text || !text.trim()) {
        return alert("Skriv ett svar först.");
    }

    let safeMessage = text;
    try {
        safeMessage = censorBadWords(text);
    } catch (error) {
        console.error("Censur-fel vid svar:, skickar obehandlat svar:", error);
        safeMessage = text;
    }

    const replyData = {
        message: safeMessage,
        parent_id: messageKey,
        user_id: 0,
        createdAt: Date.now(),
    };

    try {
        const response = await postReply(replyData)
        if(response){
                  const users = await getAllUsers();
                  const replies = await getAllReplies();
                  displayAllUsers(users, undefined, {replies});

        }
    } catch (error) {
        console.error("Kunde inte skicka svaret:", error);
        alert("Fel vid skickning av svaret. Försök igen.");
    }
};