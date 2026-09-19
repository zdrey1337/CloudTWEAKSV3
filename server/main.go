package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

const openAIEndpoint = "https://api.openai.com/v1/responses"

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
	SystemStats interface{}          `json:"systemStats,omitempty"`
}

type OpenAIRequest struct {
	Model string `json:"model"`
	Input string `json:"input"`
}

type OpenAIResponse struct {
	Output []struct {
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"content"`
	} `json:"output"`
}

var httpClient = &http.Client{
	Timeout: 60 * time.Second,
}

func setCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Accept, X-CloudTWEAKS-Version")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	setCORS(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	_ = json.NewEncoder(w).Encode(map[string]string{
		"status":  "online",
		"service": "CloudTWEAKS API",
	})
}

func callOpenAI(prompt string) (string, error) {
	apiKey := strings.TrimSpace(os.Getenv("OPENAI_API_KEY"))

	if apiKey == "" {
		return "", fmt.Errorf("OPENAI_API_KEY is not configured")
	}

	payload := OpenAIRequest{
		Model: "gpt-5.6-luna",
		Input: prompt,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to encode OpenAI request: %w", err)
	}

	req, err := http.NewRequest(
		http.MethodPost,
		openAIEndpoint,
		bytes.NewReader(body),
	)
	if err != nil {
		return "", fmt.Errorf("failed to create OpenAI request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to contact OpenAI: %w", err)
	}

	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read OpenAI response: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		log.Printf("OpenAI returned HTTP %d: %s", resp.StatusCode, string(responseBody))
		return "", fmt.Errorf("OpenAI request failed with HTTP %d", resp.StatusCode)
	}

	var result OpenAIResponse

	if err := json.Unmarshal(responseBody, &result); err != nil {
		return "", fmt.Errorf("failed to parse OpenAI response: %w", err)
	}

	for _, output := range result.Output {
		for _, content := range output.Content {
			if content.Type != "" && content.Type != "output_text" {
				continue
			}

			text := strings.TrimSpace(content.Text)

			if text != "" {
				return text, nil
			}
		}
	}

	return "", fmt.Errorf("OpenAI returned an empty response")
}

func analyzeHandler(w http.ResponseWriter, r *http.Request) {
	setCORS(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 32<<10)
	defer r.Body.Close()

	var request CloudAIRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	prompt := fmt.Sprintf(`
You are CloudTWEAKS AI, a Windows PC optimization assistant.

Analyze the following computer:

CPU: %s
GPU: %s
RAM: %s
Motherboard: %s
Windows: %s
Storage: %s
Main Game: %s
Goal: %s
Additional Information: %s

Only recommend safe Windows optimization tweaks from this exact list:

game_mode
disable_game_dvr
gpu_scheduling
foreground_priority
power_plan_gaming
clear_dns_cache
temporary_file_cleanup

Return ONLY valid JSON in this exact structure:

{
  "summary": "short summary",
  "systemAssessment": "system assessment",
  "recommendations": [
    {
      "id": "game_mode",
      "name": "name",
      "description": "description",
      "reason": "reason",
      "compatibility": "compatibility",
      "risk": "Low"
    }
  ],
  "warnings": [],
  "notRecommended": []
}

Do not invent tweak IDs outside the allowed list.
`, request.CPU, request.GPU, request.RAM, request.Motherboard, request.Windows, request.Storage, request.MainGame, request.Goal, request.Additional)

	aiResponse, err := callOpenAI(prompt)

	if err != nil {
		log.Printf("Analyze error: %v", err)
		http.Error(w, "Cloud AI service unavailable", http.StatusBadGateway)
		return
	}

	var result map[string]interface{}

	if err := json.Unmarshal([]byte(aiResponse), &result); err != nil {
		log.Printf("AI returned invalid JSON: %v", err)
		http.Error(w, "Cloud AI returned an invalid response", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	_ = json.NewEncoder(w).Encode(result)
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
	setCORS(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
	defer r.Body.Close()

	var request CloudAIChatRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	request.Message = strings.TrimSpace(request.Message)

	if request.Message == "" {
		http.Error(w, "message cannot be empty", http.StatusBadRequest)
		return
	}

	if len(request.Message) > 4000 {
		http.Error(w, "message too long", http.StatusBadRequest)
		return
	}

	var prompt strings.Builder

	prompt.WriteString(`You are CloudTWEAKS AI, a helpful Windows PC optimization assistant.

Give practical, safe and concise advice.

Do not recommend dangerous registry modifications, disabling Windows security features, disabling antivirus, or destructive system changes.

Only recommend the following CloudTWEAKS tweaks when appropriate:

game_mode
disable_game_dvr
gpu_scheduling
foreground_priority
power_plan_gaming
clear_dns_cache
temporary_file_cleanup

`)

	if request.SystemStats != nil {
		statsJSON, err := json.Marshal(request.SystemStats)

		if err == nil {
			prompt.WriteString("\nCurrent system statistics:\n")
			prompt.Write(statsJSON)
			prompt.WriteString("\n")
		}
	}

	for _, message := range request.History {
		role := strings.ToLower(strings.TrimSpace(message.Role))

		if role != "user" && role != "assistant" {
			continue
		}

		prompt.WriteString("\n")
		prompt.WriteString(role)
		prompt.WriteString(": ")
		prompt.WriteString(message.Content)
	}

	prompt.WriteString("\n\nCurrent user message:\n")
	prompt.WriteString(request.Message)

	aiResponse, err := callOpenAI(prompt.String())

	if err != nil {
		log.Printf("Chat error: %v", err)
		http.Error(w, "Cloud AI service unavailable", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": aiResponse,
	})
}

func main() {
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/api/ai/analyze", analyzeHandler)
	http.HandleFunc("/api/ai/chat", chatHandler)

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	log.Println("CloudTWEAKS API running on port", port)

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
