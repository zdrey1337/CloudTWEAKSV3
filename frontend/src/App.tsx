import {
  useEffect,
  useState,
} from "react";

import Sidebar, {
  type Page,
} from "./components/Sidebar";

import Topbar from "./components/Topbar";

import CloudAI from "./pages/CloudAI";
import Overview from "./pages/Overview";
import TweakCenter from "./pages/TweakCenter";
import GameMode from "./pages/GameMode";
import Generic from "./pages/Generic";

import type {
  Game,
  SystemStats,
} from "./types/system";

const fallbackGames: Game[] = [
  {
    id: "fivem",
    name: "FiveM",
    description: "GTA V multiplayer",
    available: false,
  },
  {
    id: "valorant",
    name: "VALORANT",
    description: "Competitive FPS",
    available: false,
  },
  {
    id: "cs2",
    name: "Counter-Strike 2",
    description: "Competitive FPS",
    available: false,
  },
  {
    id: "roblox",
    name: "Roblox",
    description: "Roblox Player",
    available: false,
  },
];

const defaultStats: SystemStats = {
  cpuUsage: 0,
  memoryUsage: 0,
  memoryUsed: 0,
  memoryTotal: 0,
  cpuCount: 0,
  performance: 100,
  os: "windows",
  architecture: "amd64",
  uptime: 0,
};

export default function App() {
  const [page, setPage] =
    useState<Page>("Overview");

  const [games, setGames] =
    useState<Game[]>(fallbackGames);

  const [stats, setStats] =
    useState<SystemStats>(defaultStats);

  const [history, setHistory] =
    useState<number[]>([]);

  useEffect(() => {
    window.go?.main?.App?.GetGames?.()
      .then((result) => {
        if (result) {
          setGames(result);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    const updateStats = async () => {
      try {
        const result =
          await window.go?.main?.App?.GetSystemStats?.();

        if (!result || !mounted) {
          return;
        }

        setStats(result);

        setHistory((previous) => {
          const next = [
            ...previous,
            result.cpuUsage,
          ];

          return next.slice(-60);
        });
      } catch {
        // Ignore temporary polling errors.
      }
    };

    updateStats();

    const interval = window.setInterval(
      updateStats,
      1000
    );

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  async function boostGame(id: string) {
    await window.go?.main?.App?.BoostGame?.(id);
  }


  return (
    <div className="app">
      <Topbar />

      <Sidebar
        page={page}
        onNavigate={setPage}
      />

      <main>
        {page === "Overview" && (
          <Overview
            stats={stats}
            history={history}
          />
        )}

        {page === "Tweak Center" && (
          <TweakCenter />
        )}

        {page === "Game Mode" && (
          <GameMode
            games={games}
            onBoost={boostGame}
          />
        )}
        
        {page === "Cloud AI" && (
          <CloudAI />
          )}

        {page === "Monitor" && (
          <Generic
            kicker="LIVE TELEMETRY"
            title="Monitor"
            description="Watch live CPU and memory activity."
          />
        )}

        {page === "Cleanup" && (
          <Generic
            kicker="MAINTENANCE"
            title="Smart Cleanup"
            description="Review temporary files and caches safely."
          />
        )}

        {page === "Hardware" && (
          <Generic
            kicker="SYSTEM INFORMATION"
            title="Hardware"
            description="View processor, memory, graphics and Windows information."
          />
        )}

        {page === "Settings" && (
          <Generic
            kicker="APPLICATION"
            title="Settings"
            description="Configure CloudTWEAKS behavior and appearance."
          />
        )}
      </main>
    </div>
  );
}