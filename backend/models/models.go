package models

import (
	"time"
)

// User represents a registered user in the system
type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"uniqueIndex;not null" json:"username"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	TotalPoints  int       `gorm:"default:0" json:"total_points"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Match represents an IPL match
type Match struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	Team1             string    `gorm:"not null" json:"team1"`
	Team2             string    `gorm:"not null" json:"team2"`
	MatchDate         time.Time `gorm:"not null" json:"match_date"`
	Status            string    `gorm:"type:varchar(20);default:'upcoming'" json:"status"` // upcoming, active, completed
	ActualWinner      string    `json:"actual_winner"`
	ActualRunScorer   string    `json:"actual_run_scorer"`
	ActualWicketTaker string    `json:"actual_wicket_taker"`
	ActualPOTM        string    `json:"actual_potm"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// Prediction represents a user's prediction for a specific match
type Prediction struct {
	ID                   uint      `gorm:"primaryKey" json:"id"`
	UserID               uint      `gorm:"uniqueIndex:idx_user_match" json:"user_id"`
	MatchID              uint      `gorm:"uniqueIndex:idx_user_match" json:"match_id"`
	PredictedWinner      string    `json:"predicted_winner"`
	PredictedRunScorer   string    `json:"predicted_run_scorer"`
	PredictedWicketTaker string    `json:"predicted_wicket_taker"`
	PredictedPOTM        string    `json:"predicted_potm"`
	PointsEarned         int       `gorm:"default:0" json:"points_earned"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`

	User  User  `gorm:"foreignKey:UserID" json:"-"`
	Match Match `gorm:"foreignKey:MatchID" json:"-"`
}
