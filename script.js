
const chatBody = document.querySelector(".chat_body");
const messageInput = document.querySelector(".message_input");
const sendMessage = document.querySelector("#send_message");
const fileInput = document.querySelector("#file_input");
const fileUploadWrapper = document.querySelector(".file_upload_wrapper");
const fileCancelButton = document.querySelector("#file-cancel");




const API_KEY = "AIzaSyDryG-ao9mi1yq-uKobm3OYwVEXJ1-ahag";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;
const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}

const chatHistory = [];

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Generate bot response using api
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message_text");
    chatHistory.push({
        role: "user",
        parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
    });

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
            }]
        })
    }

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const apiResonseText = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .trim();

        messageElement.innerText = apiResonseText;

        chatHistory.push({
            role: "model",
            parts: [{ text: apiResonseText }]
        });
    } catch (error) {
        console.log(error);
        if (error.message.includes("quota")) {
            messageElement.innerText = "⏳ Wait a few seconds, too many requests...";
        } else {
            messageElement.innerText = "Error getting response!";
        }
    } finally {
        userData.file = {};

        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
}

const handleOutgoingMessage = (e) => {
    e.preventDefault();

    userData.message = messageInput.value.trim();
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file_uploaded");

    const messageContent = `<div class="message_text"></div>
    ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}"  class="attachment" />` : ""}`;

    const outgoingMessageDiv = createMessageElement(messageContent, "user_message");
    outgoingMessageDiv.querySelector(".message_text").textContent = userData.message;

    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        const messageContent = `<svg class="bot_avatar" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    viewBox="0 0 16 16">
                    <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5"/>
                    <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2z"/>
                </svg>
                <div class="message_text">
                    <div class="thinking_indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot_message", "thinking");

        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

        generateBotResponse(incomingMessageDiv);
    }, 600);
}

messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage) {
        handleOutgoingMessage(e);
    }
});


fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file_uploaded");
        const base64string = e.target.result.split(",")[1];

        userData.file = {
            data: base64string,
            mime_type: file.type
        }

        fileInput.value = "";
    }

    reader.readAsDataURL(file);
});

fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file_uploaded");
});

const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (e) => {
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        messageInput.setRangeText(e.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if (e.target.id === "emoji_picker") {
            document.body.classList.toggle("show_emoji_picker")
        } else {
            document.body.classList.remove("show_emoji_picker")
        }
    }
});

document.querySelector(".chat_form").appendChild(picker);


sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
