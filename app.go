package main

import (
	"context"
	"runtime"
	"time"

	"github.com/joho/godotenv"
	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/host"
	"github.com/shirou/gopsutil/v4/mem"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
}

type SystemStats struct {
	CPUUsage     float64 `json:"cpuUsage"`
	MemoryUsage  float64 `json:"memoryUsage"`
	MemoryUsed   uint64  `json:"memoryUsed"`
	MemoryTotal  uint64  `json:"memoryTotal"`
	CPUCount     int     `json:"cpuCount"`
	Performance  int     `json:"performance"`
	OS           string  `json:"os"`
	Architecture string  `json:"architecture"`
	Uptime       uint64  `json:"uptime"`
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Load environment variables from .env
	// The .env file should be in the CloudTWEAKS project root.
	_ = godotenv.Load()

	go func() {
		_, _ = cpu.Percent(time.Second, false)
	}()
}

func (a *App) GetSystemStats() SystemStats {
	cpuValues, err := cpu.Percent(0, false)

	var cpuUsage float64

	if err == nil && len(cpuValues) > 0 {
		cpuUsage = cpuValues[0]
	}

	memory, err := mem.VirtualMemory()

	var memoryUsage float64
	var memoryUsed uint64
	var memoryTotal uint64

	if err == nil {
		memoryUsage = memory.UsedPercent
		memoryUsed = memory.Used
		memoryTotal = memory.Total
	}

	performance := calculatePerformance(
		cpuUsage,
		memoryUsage,
	)

	uptime, _ := host.Uptime()

	return SystemStats{
		CPUUsage:     cpuUsage,
		MemoryUsage:  memoryUsage,
		MemoryUsed:   memoryUsed,
		MemoryTotal:  memoryTotal,
		CPUCount:     runtime.NumCPU(),
		Performance:  performance,
		OS:           runtime.GOOS,
		Architecture: runtime.GOARCH,
		Uptime:       uptime,
	}
}

func calculatePerformance(
	cpuUsage float64,
	memoryUsage float64,
) int {
	cpuScore := 100 - cpuUsage
	memoryScore := 100 - memoryUsage

	score :=
		(cpuScore * 0.55) +
			(memoryScore * 0.45)

	if score < 0 {
		score = 0
	}

	if score > 100 {
		score = 100
	}

	return int(score)
}

/*
	Window Controls
*/

func (a *App) Minimize() {
	if a.ctx != nil {
		wailsruntime.WindowMinimise(a.ctx)
	}
}

func (a *App) Maximize() {
	if a.ctx != nil {
		wailsruntime.WindowToggleMaximise(a.ctx)
	}
}

func (a *App) Close() {
	if a.ctx != nil {
		wailsruntime.Quit(a.ctx)
	}
}

func (a *App) GetAppVersion() string {
	return "3.0.0"
}
