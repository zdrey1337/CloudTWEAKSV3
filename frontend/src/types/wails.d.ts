import type {
  Game,
  SystemStats,
} from "./system";

import type {
  CloudAIRequest,
  CloudAIResult,
  CloudAIChatRequest,
  CloudAIChatResult,
} from "./cloudai";

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

          AnalyzeSystemWithAI?: (
            request: CloudAIRequest
          ) => Promise<CloudAIResult>;

          ChatWithAI?: (
            request: CloudAIChatRequest
          ) => Promise<CloudAIChatResult>;

          Minimize?: () => Promise<void>;

          Maximize?: () => Promise<void>;

          Close?: () => Promise<void>;
        };
      };
    };
  }
}

export {};