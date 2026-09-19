import {
  Gamepad2,
  Zap,
} from "lucide-react";

import type {
  Game,
} from "../types/system";

interface Props {
  games: Game[];
  onBoost: (
    id: string
  ) => Promise<void>;
}

export default function GameMode({
  games,
  onBoost,
}: Props) {
  return (
    <>
      <div className="heading">
        <div>
          <small>
            GAMING PROFILE
          </small>

          <h1>
            Game Mode
          </h1>

          <p>
            Prepare a focused performance
            profile for your next session.
          </p>
        </div>

        <strong className="healthy">
          <Gamepad2 size={14} />

          GAME MODE
        </strong>
      </div>

      <div className="games">
        {games.map((game) => (
          <div
            className="game"
            key={game.id}
          >
            <div className="logo">
              {game.name[0]}
            </div>

            <span>
              <b>
                {game.name}
              </b>

              <small>
                {game.description}
              </small>
            </span>

            <button
              onClick={() =>
                onBoost(game.id)
              }
            >
              <Zap size={14} />

              Boost
            </button>
          </div>
        ))}
      </div>
    </>
  );
}