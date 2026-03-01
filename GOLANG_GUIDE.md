# 🏏 Golang Backend Architecture Guide

> A beginner-friendly guide explaining how the Go backend of the IPL Prediction app works.

---

## 🛠️ Tech Stack

| Technology | Role |
|---|---|
| **[Go](https://go.dev/)** | The backend programming language |
| **[Gin](https://gin-gonic.com/)** | Web framework for routing & middleware |
| **[GORM](https://gorm.io/)** | ORM — talk to the database using Go structs |
| **[SQLite](https://www.sqlite.org/)** | Lightweight file-based SQL database |

---

## 📁 Project Structure

```
backend/
├── main.go          ← App entry point (starts everything)
├── db/              ← Database connection setup
├── models/          ← Data structures (User, Match, Prediction)
├── routes/          ← URL → Handler mapping
├── middleware/      ← Auth checks before hitting handlers
├── handlers/        ← Core API logic (login, predict, etc.)
└── utils/           ← Helpers (password hashing, JWT)
```

---

## 🔄 How a Request Flows

Here's what happens when a user makes an API call (e.g., submitting a prediction):

```
Browser (React)
    │
    ▼
[ Gin Router ]  ──→  matches URL to a handler
    │
    ▼
[ Middleware ]  ──→  checks if user is logged in (via cookie)
    │
    ▼
[ Handler ]    ──→  runs the business logic
    │
    ▼
[ GORM + DB ]  ──→  reads/writes to the SQLite database
    │
    ▼
[ JSON Response ] ──→  sent back to the browser
```

---

## 📖 Step-by-Step Breakdown

### 1️⃣ Entry Point — `main.go`

This is where the app boots up. It does 5 things in order:

1. **Loads `.env` config** — reads environment variables (like `JWT_SECRET`)
2. **Connects to SQLite** — calls `db.InitDB()` to open `ipl_prediction.db`
3. **Runs migrations** — GORM auto-creates/updates tables from your Go structs
4. **Seeds admin user** — if no admin exists, creates one automatically
5. **Starts the server** — listens on `localhost:8081`

```go
// Simplified version of what main.go does:
func main() {
    godotenv.Load()             // step 1
    database := db.InitDB()     // step 2
    database.AutoMigrate(...)   // step 3
    seedAdmin(database)         // step 4
    r := gin.Default()
    routes.SetupRouter(r)
    r.Run(":8081")              // step 5
}
```

---

### 2️⃣ Models — `models/models.go`

Models are Go **structs** that map directly to database tables.

```go
type User struct {
    ID           uint      `gorm:"primaryKey" json:"id"`
    Username     string    `gorm:"uniqueIndex" json:"username"`
    PasswordHash string    `json:"-"`  // 🔒 "-" means NEVER send to frontend
    TotalPoints  int       `json:"total_points"`
}
```

**Key tags explained:**
| Tag | What it does |
|---|---|
| `gorm:"primaryKey"` | Makes this column the table's primary key |
| `gorm:"uniqueIndex"` | No two users can have the same username |
| `json:"username"` | When converting to JSON, use `"username"` as the key |
| `json:"-"` | **Hide this field** from all API responses (security!) |

---

### 3️⃣ Routes — `routes/routes.go`

Routes map URLs to handler functions. They're organized in groups:

```go
// 🌍 Public — anyone can access
api.POST("/login", handlers.Login)
api.GET("/matches", handlers.GetMatches)

// 🔐 Protected — must be logged in
userRoutes := api.Group("/user")
userRoutes.Use(middleware.AuthRequired())  // ← middleware guard
userRoutes.POST("/predictions", handlers.SubmitPrediction)

// 👑 Admin — must be logged in AND have admin role
adminRoutes := api.Group("/admin")
adminRoutes.Use(middleware.AuthRequired())
adminRoutes.Use(handlers.AdminRequired())
adminRoutes.POST("/matches", handlers.CreateMatch)
```

---

### 4️⃣ Middleware — `middleware/auth.go`

Middleware runs **before** your handler. Think of it as a security guard.

```go
func AuthRequired() gin.HandlerFunc {
    return func(c *gin.Context) {
        // 1. Read the "token" cookie from the browser
        token, err := c.Cookie("token")
        
        // 2. If no cookie → reject with 401
        if err != nil {
            c.AbortWithStatusJSON(401, gin.H{"error": "Not logged in"})
            return
        }
        
        // 3. Validate the JWT token
        claims := utils.ValidateToken(token)
        
        // 4. Attach user info to the request context
        c.Set("userID", claims["user_id"])
        c.Set("username", claims["username"])
        
        c.Next()  // ✅ Let the request continue to the handler
    }
}
```

---

### 5️⃣ Handlers — `handlers/*.go`

Handlers contain the actual business logic. Every handler follows this pattern:

```go
func SubmitPrediction(c *gin.Context) {
    // 1. Parse the JSON body
    var input PredictionInput
    c.ShouldBindJSON(&input)
    
    // 2. Get the logged-in user's ID (set by middleware)
    userID := c.GetUint("userID")
    
    // 3. Save to database
    prediction := models.Prediction{
        UserID:          userID,
        MatchID:         input.MatchID,
        PredictedWinner: input.PredictedWinner,
    }
    db.DB.Create(&prediction)
    
    // 4. Return success
    c.JSON(200, gin.H{"message": "Prediction saved!"})
}
```

---

### 6️⃣ Utils — `utils/auth.go`

Helper functions used across the app:

| Function | What it does |
|---|---|
| `HashPassword(pw)` | Hashes a password with bcrypt (never store plaintext!) |
| `CheckPassword(hash, pw)` | Compares a hash with a plaintext password |
| `GenerateToken(user)` | Creates a signed JWT with user info (expires in 2 hours) |
| `ValidateToken(token)` | Decodes and verifies a JWT, returns the claims |

---

## ✅ Best Practices Used

| Practice | How it's applied |
|---|---|
| **Separation of concerns** | Routes, handlers, models, and middleware are all in separate folders |
| **Secure passwords** | Passwords are hashed with `bcrypt` — never stored as plaintext |
| **HttpOnly cookies** | JWT tokens are stored in cookies that JavaScript can't access (XSS-proof) |
| **Role-based access** | Admin routes require both authentication AND the `admin` role |
| **Structured logging** | All activity is logged to both console and `server.log` |
| **Auto-migration** | GORM keeps the database schema in sync with Go structs automatically |
