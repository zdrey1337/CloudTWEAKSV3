package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create the application instance.
	app := NewApp()

	// Start Wails.
	err := wails.Run(&options.App{
		// ----------------------------------------------------
		// WINDOW
		// ----------------------------------------------------

		Title: "CloudTWEAKS",

		Width: 1400,

		Height: 850,

		MinWidth: 1000,

		MinHeight: 650,

		// CloudTWEAKS uses a custom React title bar.
		Frameless: true,

		// ----------------------------------------------------
		// BACKGROUND
		// ----------------------------------------------------

		BackgroundColour: &options.RGBA{
			R: 28,
			G: 28,
			B: 28,
			A: 255,
		},

		// ----------------------------------------------------
		// FRONTEND ASSETS
		// ----------------------------------------------------

		AssetServer: &assetserver.Options{
			Assets: assets,
		},

		// ----------------------------------------------------
		// GO → JAVASCRIPT BINDINGS
		// ----------------------------------------------------
		//
		// This exposes all exported methods on App to React.
		//
		// Examples:
		//
		// ChatWithAI()
		// AnalyzeSystemWithAI()
		// GetSystemStats()
		// GetAppVersion()
		// Minimize()
		// Maximize()
		// Close()
		//
		// Wails will generate the frontend bindings.
		//

		Bind: []interface{}{
			app,
		},

		// ----------------------------------------------------
		// APPLICATION STARTUP
		// ----------------------------------------------------

		OnStartup: app.startup,

		// ----------------------------------------------------
		// WINDOWS SETTINGS
		// ----------------------------------------------------

		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
		},
	})

	// --------------------------------------------------------
	// ERROR HANDLING
	// --------------------------------------------------------

	if err != nil {
		println("CloudTWEAKS failed to start:")
		println(err.Error())
	}
}
