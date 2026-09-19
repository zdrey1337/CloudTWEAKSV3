import type {
  Game,
  SystemStats,
} from "./system";

declare global {
  interface Window {
    go?: {
      main?: {
        App?: {
          GetSystemStats?: () => Promise<SystemStats>;
          GetGames?: () => Promise<Game[]>;
          BoostGame?: (
            id: string
          ) => Promise<string>;
          Minimize?: () => Promise<void>;
          Maximize?: () => Promise<void>;
          Close?: () => Promise<void>;
        };
      };
    };
  }
}

export {};