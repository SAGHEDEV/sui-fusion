🎮 SuiFusion

A next-gen gaming streaming platform built on the Sui blockchain, where gamers can stream, connect, and tip each other using SUI tokens — seamlessly blending gaming, live streaming, and Web3 interaction.

✨ Overview

Tired of centralized streaming platforms that keep all the rewards?
SuiFusion gives control back to gamers — allowing real-time streaming, direct SUI token tipping, and transparent leaderboard rankings.
It’s fast, decentralized, and designed for the next generation of Web3 streamers and fans.

⚙️ Tech Stack

Frontend: Next.js · TailwindCSS · Framer Motion · Suiet Wallet SDK
Backend: Node.js · Express · MongoDB
Blockchain: Move (Sui) · Sui SDK · Sui CLI
Streaming: Livepeer / Mux
Collaboration: GitHub Projects · Figma · Notion · Discord

🚀 Getting Started


Clone this repository and set it up locally 👇

# 🧩 Clone Repository
git clone https://github.com/your-username/suifusion.git

# Copy the repo link to your clipboard (auto)
# macOS
echo "https://github.com/your-username/suifusion.git" | pbcopy
# Windows
echo https://github.com/your-username/suifusion.git | clip
# Linux (requires xclip or xsel)
echo "https://github.com/your-username/suifusion.git" | xclip -selection clipboard

echo "✅ Repo link copied to clipboard!"

cd suifusion

🖥️ Frontend Setup

cd frontend

npm install

npm run dev


When the server starts, copy and open the frontend URL 👇

# macOS

echo "http://localhost:3000" | pbcopy

# Windows

echo http://localhost:3000 | clip

# Linux

echo "http://localhost:3000" | xclip -selection clipboard

echo "✅ Frontend URL copied to clipboard! Open in your browser: http://localhost:3000"

⚙️ Backend Setup

cd backend

npm install

npm run start


Optionally copy your backend URL too 👇

# macOS
echo "http://localhost:5000" | pbcopy
# Windows
echo http://localhost:5000 | clip
# Linux
echo "http://localhost:5000" | xclip -selection clipboard

echo "✅ Backend URL copied to clipboard! Open in your browser: http://localhost:5000"

🔐 Environment Variables

Create .env files in both /frontend and /backend folders:

MONGO_URI=<your_mongodb_uri>

SUI_NETWORK = <testnet>

LIVEPEER_API_KEY=<your_key>

JWT_SECRET=<your_secret>

🌐 Open the App

Once the frontend is running:

# macOS

echo "http://localhost:3000" | pbcopy

# Windows

echo http://localhost:3000 | clip

# Linux

echo "http://localhost:3000" | xclip -selection clipboard

echo "🚀 App is live at http://localhost:3000 (URL copied to clipboard)"

💡 Features

🎥 Live stream your gameplay using Livepeer/Mux

💸 Send and receive SUI token tips in real time

🏆 Dynamic on-chain leaderboard updates

🕹️ Discover trending Web3 games

💼 Wallet connection via Suiet / Sui Wallet

🌗 Sleek UI with light/dark modes and smooth animations
