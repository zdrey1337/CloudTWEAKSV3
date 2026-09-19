package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const (
	// IMPORTANT:
	// Replace this with YOUR CloudTWEAKS backend URL.
	//
	// Do NOT put your OpenAI API key here.
	cloudTWEAKSAPI = "https://YOUR-CLOUDTWEAKS-BACKEND.com"

	cloudTWEAKSAnalyzeEndpoint = cloudTWEAKSAPI + "/api/ai/analyze"
	cloudTWEAKSChatEndpoint    = cloudTWEAKSAPI + "/api/ai/chat"
)

// ============================================================
// REQUEST / RESPONSE TYPES
// ============================================================

type CloudAIRequest struct {
	CPU         string `json:"cpu"`
	GPU         string `json:"gpu"`
	RAM         string `json:"ram"`
	Motherboard string `json:"motherboard"`
	Windows     string `json:"windows"`
	Storage     string `json:"storage"`
	MainGame    string `json:"mainGame"`
	Goal        string `json:"goal"`
	Additional  string `json:"additional"`
}

type CloudAIRecommendation struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Description   string `json:"description"`
	Reason        string `json:"reason"`
	Compatibility string `json:"compatibility"`
	Risk          string `json:"risk"`
}

type CloudAIResult struct {
	Summary          string                  `json:"summary"`
	SystemAssessment string                  `json:"systemAssessment"`
	Recommendations  []CloudAIRecommendation `json:"recommendations"`
	Warnings         []string                `json:"warnings"`
	NotRecommended   []CloudAIRecommendation `json:"notRecommended"`
}

type CloudAIChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type CloudAIChatRequest struct {
	Message     string               `json:"message"`
	History     []CloudAIChatMessage `json:"history"`
	SystemStats *SystemStats         `json:"systemStats,omitempty"`
}

type CloudAIChatResult struct {
	Message string `json:"message"`
}

// ============================================================
// ALLOWED TWEAKS
// ============================================================
//
// The backend should ALSO enforce this list.
// Keeping it here gives the desktop application an additional
// layer of protection against unexpected AI output.
//

var allowedCloudAITweaks = map[string]bool{
	"game_mode":              true,
	"disable_game_dvr":       true,
	"gpu_scheduling":         true,
	"foreground_priority":    true,
	"power_plan_gaming":      true,
	"clear_dns_cache":        true,
	"temporary_file_cleanup": true,
}

// ============================================================
// HTTP CLIENT
// ============================================================

var cloudAIHTTPClient = &http.Client{
	Timeout: 60 * time.Second,
}

// sendCloudTWEAKSRequest sends data to YOUR backend.
//
// There is intentionally NO OPENAI_API_KEY here.
//
// The backend is responsible for:
// 1. Authenticating/rate limiting the client.
// 2. Reading OPENAI_API_KEY from its server environment.
// 3. Calling OpenAI.
// 4. Returning the sanitized result.
//

func sendCloudTWEAKSRequest(
	endpoint string,
	payload interface{},
	result interface{},
) error {

	requestBody, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to encode Cloud AI request: %w", err)
	}

	req, err := http.NewRequest(
		http.MethodPost,
		endpoint,
		bytes.NewReader(requestBody),
	)
	if err != nil {
		return fmt.Errorf("failed to create Cloud AI request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Optional client identification.
	// This is NOT a secret.
	req.Header.Set("X-CloudTWEAKS-Version", "3.0.0")

	resp, err := cloudAIHTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf(
			"couldn't connect to CloudTWEAKS AI server: %w",
			err,
		)
	}

	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf(
			"failed to read CloudTWEAKS AI response: %w",
			err,
		)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {

		// Don't expose unnecessary backend internals to the user.
		switch resp.StatusCode {
		case http.StatusUnauthorized:
			return fmt.Errorf("Cloud AI authentication failed")
		case http.StatusForbidden:
			return fmt.Errorf("Cloud AI access was denied")
		case http.StatusTooManyRequests:
			return fmt.Errorf("Cloud AI is temporarily rate limited")
		case http.StatusBadGateway, http.StatusServiceUnavailable:
			return fmt.Errorf("Cloud AI service is temporarily unavailable")
		default:
			return fmt.Errorf(
				"Cloud AI server returned HTTP %d",
				resp.StatusCode,
			)
		}
	}

	if err := json.Unmarshal(responseBody, result); err != nil {
		return fmt.Errorf(
			"failed to parse Cloud AI server response: %w",
			err,
		)
	}

	return nil
}

// ============================================================
// ANALYZE SYSTEM
// ============================================================

func (a *App) AnalyzeSystemWithAI(
	request CloudAIRequest,
) (CloudAIResult, error) {

	var result CloudAIResult

	err := sendCloudTWEAKSRequest(
		cloudTWEAKSAnalyzeEndpoint,
		request,
		&result,
	)

	if err != nil {
		return CloudAIResult{}, err
	}

	// Extra client-side filtering.
	result.Recommendations =
		filterAllowedRecommendations(result.Recommendations)

	result.NotRecommended =
		filterAllowedRecommendations(result.NotRecommended)

	return result, nil
}

// ============================================================
// FILTER AI RECOMMENDATIONS
// ============================================================

func filterAllowedRecommendations(
	recommendations []CloudAIRecommendation,
) []CloudAIRecommendation {

	filtered := make(
		[]CloudAIRecommendation,
		0,
		len(recommendations),
	)

	for _, recommendation := range recommendations {

		id := strings.ToLower(
			strings.TrimSpace(recommendation.ID),
		)

		if !allowedCloudAITweaks[id] {
			continue
		}

		recommendation.ID = id

		filtered = append(
			filtered,
			recommendation,
		)
	}

	return filtered
}

// ============================================================
// CLOUD AI CHAT
// ============================================================

func (a *App) ChatWithAI(
	request CloudAIChatRequest,
) (CloudAIChatResult, error) {

	// Limit message size.
	request.Message = strings.TrimSpace(request.Message)

	if request.Message == "" {
		return CloudAIChatResult{}, fmt.Errorf(
			"message cannot be empty",
		)
	}

	if len(request.Message) > 4000 {
		return CloudAIChatResult{}, fmt.Errorf(
			"message is too long",
		)
	}

	// Prevent unnecessarily huge history payloads.
	if len(request.History) > 30 {
		request.History =
			request.History[len(request.History)-30:]
	}

	var result CloudAIChatResult

	err := sendCloudTWEAKSRequest(
		cloudTWEAKSChatEndpoint,
		request,
		&result,
	)

	if err != nil {
		return CloudAIChatResult{}, err
	}

	result.Message = strings.TrimSpace(result.Message)

	if result.Message == "" {
		return CloudAIChatResult{}, fmt.Errorf(
			"Cloud AI returned an empty response",
		)
	}

	return result, nil
}

// ============================================================
// BYTE FORMATTER
// ============================================================

func formatBytes(bytes uint64) string {

	const unit = 1024

	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}

	div := float64(unit)
	exp := 0

	for value := float64(bytes); value >= unit && exp < 5; value /= unit {
		div *= unit
		exp++
	}

	units := []string{
		"KB",
		"MB",
		"GB",
		"TB",
		"PB",
	}

	if exp >= len(units) {
		exp = len(units) - 1
	}

	return fmt.Sprintf(
		"%.1f %s",
		float64(bytes)/div,
		units[exp],
	)
}
