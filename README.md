# BuddyUp

A mobile-first React application powered by Google's Gemini AI designed to help users find social connections, partners for activities, and interest-based groups.

## 🌟 Key Features

### 🤖 BuddyUp AI (Assistant Tab)
The core of the experience is the intelligent assistant powered by `gemini-2.5-flash`.
- **Natural Language Interface**: Chat naturally with the AI to describe what you are looking for (e.g., "I need a tennis partner" or "Find me a D&D group").
- **Smart Tool Use**: The AI uses function calling to generate structured "Matches" based on your intent.
- **Interactive Match Cards**: When a match is found, a custom UI card appears. Clicking "Start Chatting" instantly creates a new conversation and switches you to it.

### 💬 Advanced Messaging (Chats Tab)
A fully functional chat interface for managing your social connections.
- **Conversation List**: Displays all active chats with unread indicators, timestamps, and last messages.
- **Search Functionality**: Filter your conversations by name or message content using the search bar in the header.
- **Categorization**: Toggle between **All**, **Direct** (1v1), and **Groups** tabs to organize your chats.
- **Group Chat Support**: Visual support for group conversations, including distinct avatars for different senders.
- **Simulated Realism**: Includes mock replies and delays to simulate a real-time social environment.

### 👤 Profile & Gamification (Profile Tab)
Keeps users engaged through social incentives.
- **User Stats**: Tracks level, VIP status, and activity counts.
- **Daily Tasks**: A gamified checklist (e.g., "Daily Login", "Chat with a match") that users can complete to earn rewards.
- **Visual Polish**: Features glassmorphism effects and premium user badges (VIP/Crown).

## 🛠 Tech Stack
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS for rapid, responsive styling.
- **AI Integration**: Google GenAI SDK (`@google/genai`) using the Gemini 2.5 Flash model.
- **Icons**: Lucide React.

## 🚀 How to Demo
1. **Generate a Match**: Go to the **Assistant** tab and type: *"I want to join a book club."* The AI will think and present a "Book Club" match card.
2. **Start Conversation**: Click the **Start Chatting** button on the card. You will be redirected to the chat view.
3. **Search**: Go to the **Chats** tab, click the Search icon, and type "Hikers" to filter the list.
4. **Groups**: Toggle the pill buttons at the top of the Chats view to see only **Groups**.