export interface Game {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  memoryUsed: number;
  memoryTotal: number;
  cpuCount: number;
  performance: number;
  os: string;
  architecture: string;
  uptime: number;
}