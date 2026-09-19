import {
  Minus,
  Square,
  X,
} from "lucide-react";

export default function Topbar() {
  const app = window.go?.main?.App;

  return (
    <header className="topbar">
      <div className="windowTitle">
        <span className="windowDot" />

        <b>CLOUDTWEAKS</b>
      </div>

      <div className="windowControls">
        <button
          className="windowButton"
          onClick={() =>
            app?.Minimize?.()
          }
          aria-label="Minimize"
        >
          <Minus size={15} />
        </button>

        <button
          className="windowButton"
          onClick={() =>
            app?.Maximize?.()
          }
          aria-label="Maximize"
        >
          <Square size={12} />
        </button>

        <button
          className="windowButton close"
          onClick={() =>
            app?.Close?.()
          }
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>
    </header>
  );
}