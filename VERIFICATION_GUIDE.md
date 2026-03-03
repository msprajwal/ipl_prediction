# IPL Predictor 2026 — Browser Testing Guide

## Starting the Servers

**Terminal 1 — Backend:**
```powershell
cd f:\ipl_prediction\backend
go run main.go
```
> Runs on http://localhost:8081. On first start you'll see: `Admin user 'msprajwal' created successfully.`

**Terminal 2 — Frontend:**
```powershell
cd f:\ipl_prediction\frontend
npm run dev
```
> Runs on http://localhost:5173

---

## Test Plan (Browser Only)

### Test 1: Admin Login (Normal Browser Window)
1. Open **http://localhost:5173** in your browser
2. Login with **Email:** `msprajwal@admin.com` | **Password:** `ipl2026`
3. ✅ You should see the **Dashboard** with matches listed
4. ✅ The navbar should show a **gold "⚙ Admin"** link (only admins see this)
5. Click **⚙ Admin** → You should see the Admin Panel with:
   - A form to create new matches
   - A list of all matches with an "Update Result" button

### Test 2: Regular User Login (Incognito Window)
1. Open an **Incognito/Private** browser window
2. Go to **http://localhost:5173**
3. Click **Register** → Create any user (e.g. `testplayer`, `test@test.com`, `password123`)
4. ✅ You should land on the Dashboard with matches visible
5. ✅ The navbar should **NOT** show the "⚙ Admin" link
6. Try visiting **http://localhost:5173/admin** directly
7. ✅ You should see: **"⛔ Access Denied — You do not have admin privileges"**

### Test 3: Submit a Prediction (Incognito — Regular User)
1. On the Dashboard (as the regular user), click **Make Prediction** on any match
2. Fill in the form:
   - **Winner:** Select a team from dropdown
   - **Run Scorer:** Type any player name
   - **Wicket Taker:** Type any player name
   - **POTM:** Type any player name
3. Click **Submit Prediction**
4. ✅ You should see a green message: **"Prediction saved successfully!"**

### Test 4: Admin Creates a Match (Normal Window)
1. Switch to the **normal browser** (logged in as admin)
2. Go to **⚙ Admin** panel
3. Fill in Match details: Team 1, Team 2, Date & Time
4. Click **+ Add Match**
5. ✅ The match appears in the list below and on the Dashboard

### Test 5: Admin Updates a Result & Points Are Calculated
1. In the **Admin Panel**, click **Update Result** on a match
2. Fill in: Winner, Top Run Scorer, Top Wicket Taker, POTM
3. Click **Save Result & Calculate Points**
4. ✅ The match shows as **COMPLETED** with the results displayed
5. Switch to the **Incognito window** → Refresh the Dashboard
6. Click the completed match → You should now see:
   - **Actual Results** panel with the real outcomes
   - **Community Predictions** panel showing everyone's predictions
   - **Your Points Earned** showing the calculated points

### Test 6: Verify Prediction Lock After Match Starts
1. As admin, update a match result to mark it completed
2. Switch to **Incognito** (regular user)
3. Try clicking **Make Prediction** on the completed match
4. ✅ You should see "Actual Results" instead of a prediction form
5. ✅ The backend rejects predictions for non-upcoming matches

---

## Points Distribution

| Category              | Points |
|-----------------------|--------|
| Match Winner          | 2 pts  |
| Highest Wicket Taker  | 3 pts  |
| Highest Run Scorer    | 5 pts  |
| Player of the Match   | 10 pts |
| **Max per match**     | **20 pts** |

---

