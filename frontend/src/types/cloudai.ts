export interface CloudAIRequest {
  cpu: string;
  gpu: string;
  ram: string;
  motherboard: string;
  windows: string;
  storage: string;
  mainGame: string;
  goal: string;
  additional: string;
}

export interface CloudAIRecommendation {
  id: string;
  name: string;
  description: string;
  reason: string;
  compatibility: string;
  risk: string;
}

export interface CloudAIResult {
  summary: string;
  systemAssessment: string;
  recommendations: CloudAIRecommendation[];
  warnings: string[];
  notRecommended: CloudAIRecommendation[];
}

/* =========================================================
   CLOUD AI CHAT
========================================================= */

export interface CloudAIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CloudAIChatRequest {
  message: string;

  history: CloudAIChatMessage[];

  systemStats?: {
    cpuUsage: number;
    memoryUsage: number;
    memoryUsed: number;
    memoryTotal: number;
    cpuCount: number;
    performance: number;
    os: string;
    architecture: string;
    uptime: number;
  };
}

export interface CloudAIChatResult {
  message: string;
}