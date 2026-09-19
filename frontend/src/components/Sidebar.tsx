import {
  Activity,
  Cloud,
  Cpu,
  Gauge,
  Gamepad2,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type Page =
  | "Overview"
  | "Tweak Center"
  | "Game Mode"
  | "Cloud AI"
  | "Monitor"
  | "Cleanup"
  | "Hardware"
  | "Settings";

interface SidebarProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

const items: {
  name: Page;
  icon: LucideIcon;
}[] = [
  {
    name: "Overview",
    icon: Gauge,
  },
  {
    name: "Tweak Center",
    icon: Sparkles,
  },
  {
    name: "Game Mode",
    icon: Gamepad2,
  },
  {
    name: "Cloud AI",
    icon: Sparkles,
  },
  {
    name: "Monitor",
    icon: Activity,
  },
  {
    name: "Cleanup",
    icon: Trash2,
  },
  {
    name: "Hardware",
    icon: Cpu,
  },
  {
    name: "Settings",
    icon: Settings2,
  },
];

export default function Sidebar({
  page,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* BRAND */}
      <div className="brand">
        <div className="brandIcon">
          <Cloud
            size={19}
            strokeWidth={2.2}
          />
        </div>

        <div>
          <b>
            Cloud<span>TWEAKS</span>
          </b>

          <small>
            Version 3 | Free Mode
          </small>
        </div>
      </div>

      {/* WORKSPACE */}
      <label>WORKSPACE</label>

      <nav>
        {items.map(({ name, icon: Icon }) => {
          const active = page === name;

          return (
            <button
              key={name}
              type="button"
              className={`nav${active ? " active" : ""}`}
              onClick={() => onNavigate(name)}
            >
              <Icon
                size={17}
                strokeWidth={1.8}
              />

              <span>{name}</span>

              {active && <i />}
            </button>
          );
        })}
      </nav>

      {/* STATUS */}
      <div className="sideBottom">
        <div className="status">
          <em />
          <b>@hellojd</b>

          <small>
            Live
          </small>
        </div>

        <footer>
          CLOUDTWEAKS • BUILD 3.0.0
        </footer>
      </div>
    </aside>
  );
}