const chatBody = document.querySelector(".chat_body");
const messageInput = document.querySelector(".message_input");
const sendMessage = document.querySelector("#send_message");
const fileInput = document.querySelector("#file_input");
const fileUploadWrapper = document.querySelector(".file_upload_wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatForm = document.querySelector(".chat_form");

const API_KEY = "YOUR_API_KEY"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
};

// Create message element
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Generate bot response
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message_text");

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: userData.message || "Describe this image" },
                    ...(userData.file.data ? [{
                        inline_data: {
                            mime_type: userData.file.mime_type,
                            data: userData.file.data
                        }
                    }] : [])
                ]
            }]
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const text = data.candidates[0].content.parts[0].text;
        messageElement.innerText = text;

    } catch (error) {
        console.log(error);
        messageElement.innerText = "⚠️ Error getting response!";
    } finally {
        userData.file = { data: null, mime_type: null };

        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
};

// Send message
const handleOutgoingMessage = (e) => {
    e.preventDefault();

    const userText = messageInput.value.trim();
    userData.message = userText;
    messageInput.value = "";

    const displayText = userText || "📷 Image";

    const messageContent = `
        <div class="message_text">${displayText}</div>
        ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment"/>` : ""}
    `;

    const outgoingMessageDiv = createMessageElement(messageContent, "user_message");

    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    // reset UI
    fileUploadWrapper.classList.remove("file_uploaded");
    chatForm.classList.remove("file_attached");

    setTimeout(() => {
        const botContent = `
            <div class="message_text">
                <div class="thinking_indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;

        const incomingMessageDiv = createMessageElement(botContent, "bot_message", "thinking");

        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

        generateBotResponse(incomingMessageDiv);
    }, 500);
};

// Enter key send
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        handleOutgoingMessage(e);
    }
});

// File upload
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file_uploaded");
        chatForm.classList.add("file_attached");

        const base64 = e.target.result.split(",")[1];

        userData.file = {
            data: base64,
            mime_type: file.type
        };

        fileInput.value = ""; // 🔥 allow same image again
    };

    reader.readAsDataURL(file);
});

// Cancel file
fileCancelButton.addEventListener("click", () => {
    userData.file = { data: null, mime_type: null };
    fileUploadWrapper.classList.remove("file_uploaded");
    chatForm.classList.remove("file_attached");
    fileInput.value = "";
});

// Open file picker
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());

// Emoji picker
const picker = new EmojiMart.Picker({
    theme: "light",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;

        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    }
});

document.querySelector(".chat_form").appendChild(picker);

// Toggle emoji
document.querySelector("#emoji_picker").addEventListener("click", () => {
    document.body.classList.toggle("show_emoji_picker");
});

// Send button
sendMessage.addEventListener("click", handleOutgoingMessage);