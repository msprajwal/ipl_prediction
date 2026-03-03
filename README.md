# IPL Prediction App 🏏

A full-stack web application built for friends to predict IPL (Indian Premier League) match outcomes, track scores, and compete on a leaderboard.

## Tech Stack
- **Frontend**: React (Vite), React Router, Axios, CSS Glassmorphism UI
- **Backend**: Go (Golang), Gin Web Framework, GORM
- **Database**: SQLite

## Features
- **Match Predictions**: Predict the match winner, highest run-scorer, highest wicket-taker, and Player of the Match (POTM).
- **Time-Locked Predictions**: Predictions are automatically locked once a match's scheduled start time passes.
- **Community Viewing**: Once a match starts, all users' predictions become visible to everyone.
- **Leaderboard**: Users earn points based on the accuracy of their predictions.
- **Admin Dashboard**: Specialized access to create new matches and publish official results to calculate points.
- **Activity Logging**: Backend tracks and logs detailed user activity (logins, page visits, prediction submissions).

---

## 🚀 How to Run Locally

### Prerequisites
1. [Node.js](https://nodejs.org/) (v16+ recommended)
2. [Go](https://golang.org/dl/) (v1.20+ recommended)
3. [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/msprajwal/ipl_prediction.git
cd ipl_prediction
```

### 2. Setup the Frontend
The frontend needs to be built so the Go backend can serve the static files.

```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Setup the Backend
The backend uses SQLite, which will automatically create `ipl_prediction.db` on your first run.

```bash
cd backend
go mod tidy
```

### 4. Start the Application
Since the Go backend serves both the API and the compiled React frontend, you only need to run the Go server:

```bash
# Make sure you are in the /backend directory
go run main.go
```

The application will now be running on **http://localhost:8081**.

---

## 🌍 How to Share Online (Using Ngrok)

If you want to host this temporarily to play with friends, you can use [ngrok](https://ngrok.com/) to expose your app. **Expose only the backend port (8081)**—the Go server serves both the API and the frontend, so one tunnel is simpler and safer (same-origin, no extra CORS or ports).

1. Download and install ngrok.
2. Authenticate ngrok with your free account token.
3. While the Go server is running, open a new terminal and run:
   ```bash
   ngrok http 8081
   ```
4. Ngrok will give you a public `https://...ngrok-free.dev` URL. Share this link with your friends!
