package main

type GameInfo struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Available   bool   `json:"available"`
}

func (a *App) GetGames() []GameInfo {
	return []GameInfo{
		{
			ID:          "fivem",
			Name:        "FiveM",
			Description: "GTA V multiplayer",
			Available:   false,
		},
		{
			ID:          "valorant",
			Name:        "VALORANT",
			Description: "Competitive FPS",
			Available:   false,
		},
		{
			ID:          "cs2",
			Name:        "Counter-Strike 2",
			Description: "Competitive FPS",
			Available:   false,
		},
		{
			ID:          "roblox",
			Name:        "Roblox",
			Description: "Roblox Player",
			Available:   false,
		},
	}
}

func (a *App) BoostGame(id string) string {
	return "Game profile queued: " + id
}
