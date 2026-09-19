import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Gamepad2,
  Zap,
} from "lucide-react";

import type { Game } from "../types/system";

interface Props {
  games: Game[];
  onBoost: (
    id: string
  ) => Promise<void>;
}

export default function GameBoost({
  games,
  onBoost,
}: Props) {

  const [
    selected,
    setSelected,
  ] = useState<string | null>(null);

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  useEffect(() => {

    if (
      !selected &&
      games.length
    ) {
      setSelected(
        games[0].id
      );
    }

  }, [games, selected]);

  async function boost() {

    if (!selected)
      return;

    setBusy(true);
    setMessage("");

    try {

      await onBoost(
        selected
      );

      setMessage(
        "Boost request completed."
      );

    } catch {

      setMessage(
        "Something went wrong."
      );

    } finally {

      setBusy(false);

    }
  }

  const selectedGame =
    games.find(
      (game) =>
        game.id === selected
    );

  return (
    <section>

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            PER-GAME OPTIMIZATION
          </div>

          <h1>
            Game Boost
          </h1>

          <p>
            Select a game and configure
            its optimization profile.
          </p>

        </div>

      </div>

      <div className="panel">

        <div className="panel-title">

          <Gamepad2 size={18} />

          <span>
            Select a Game
          </span>

        </div>

        <div className="game-grid">

          {games.map((game) => (

            <button
              key={game.id}
              className={`game-card ${
                selected === game.id
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelected(game.id)
              }
            >

              <div
                className={`game-art ${game.id}`}
              >
                {game.name.slice(0, 1)}
              </div>

              <div className="game-info">

                <strong>
                  {game.name}
                </strong>

                <span>
                  {game.description}
                </span>

              </div>

              {selected === game.id && (

                <CheckCircle2
                  className="selected-check"
                  size={18}
                />

              )}

            </button>

          ))}

        </div>

      </div>

      <div className="panel boost-panel">

        <div className="panel-title">

          <Zap size={18} />

          <span>
            Selected Game
          </span>

        </div>

        <div className="boost-content">

          <div>

            <strong>
              {selectedGame?.name ??
                "Select a game above"}
            </strong>

            <p>
              Apply the configured
              profile when you're ready.
            </p>

          </div>

          <button
            className="primary-button"
            disabled={
              !selected || busy
            }
            onClick={boost}
          >

            <Zap size={16} />

            {busy
              ? "Applying..."
              : "Boost Game"}

          </button>

        </div>

        {message && (

          <div className="status-message">
            {message}
          </div>

        )}

      </div>

    </section>
  );
}