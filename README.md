# 🤖 Assistly AI Chatbot

A modern AI-powered chatbot built using HTML, CSS, JavaScript, and Google Gemini API.
This chatbot supports text conversations and image-based queries with a clean UI.

---

## 🚀 Features

* 💬 Real-time AI chat
* 🖼️ Image input support
* 😊 Emoji picker integration
* ⚡ Fast responses using Gemini API
* 🎨 Clean and responsive UI
* 🔐 Secure API handling (serverless backend)

---

## 🛠️ Tech Stack

* Frontend: HTML, CSS, JavaScript
* Backend: Vercel Serverless Functions
* API: Google Gemini API

---

## 📁 Project Structure

```
AI_Chatbot
│
├── index.html
├── style.css
├── script.js
├── .gitignore
├── README.md
└── api
    └── chat.js
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```
GEMINI_API_KEY=your_api_key_here
```

⚠️ Do not share your API key publicly.

---

## 💻 Run Locally

Install Vercel CLI:

```
npm install -g vercel
```

Run the project:

```
vercel dev
```

Open in browser:

```
http://localhost:3000
```

---

## 🌐 Deployment

This project is deployed using Vercel.

Steps:

1. Push code to GitHub
2. Import project on Vercel
3. Add environment variable:

   * `GEMINI_API_KEY`
4. Deploy 🚀

