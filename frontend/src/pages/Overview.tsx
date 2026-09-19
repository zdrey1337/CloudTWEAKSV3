import type {
  ReactNode,
} from "react";

import {
  Activity,
  Cpu,
  Gauge,
  MemoryStick,
  ShieldCheck,
  Zap,
} from "lucide-react";

import type {
  SystemStats,
} from "../types/system";

interface Props {
  stats: SystemStats;
  history: number[];
}

export default function Overview({
  stats,
  history,
}: Props) {
  const cpu = Math.round(
    stats.cpuUsage
  );

  const memory = Math.round(
    stats.memoryUsage
  );

  const performance =
    Math.round(stats.performance);

  return (
    <>
      <div className="heading">
        <div>
          <small>
            SYSTEM CONTROL CENTER
          </small>

          <h1>
            Performance,{" "}
            <span>
              without the noise.
            </span>
          </h1>

          <p>
            Real-time system telemetry
            and performance controls.
          </p>
        </div>

        <strong className="healthy">
          <span className="liveDot" />

          <ShieldCheck size={14} />

          SYSTEM LIVE
        </strong>
      </div>

      <div className="metrics">
        <Metric
          title="CPU LOAD"
          value={`${cpu}%`}
          width={`${cpu}%`}
          icon={<Cpu size={15} />}
          live
        />

        <Metric
          title="MEMORY"
          value={`${memory}%`}
          width={`${memory}%`}
          icon={
            <MemoryStick size={15} />
          }
          live
        />

        <Metric
          title="PERFORMANCE"
          value={`${performance}/100`}
          width={`${performance}%`}
          icon={<Gauge size={15} />}
          live
          performance
        />

        <Metric
          title="ACTIVE MODE"
          value="BALANCED"
          icon={<Zap size={15} />}
        />
      </div>

      <div className="lower">
        <div className="panel graph">
          <header>
            <div>
              <b>
                Performance activity
              </b>

              <small>
                Live CPU usage • 60 seconds
              </small>
            </div>

            <em className="liveText">
              <span className="liveDot" />
              LIVE
            </em>
          </header>

          <LiveChart
            history={history}
          />
        </div>

        <div className="panel quick">
          <header>
            <div>
              <b>
                Quick actions
              </b>

              <small>
                Common operations
              </small>
            </div>
          </header>

          <QuickAction
            icon={
              <Zap size={15} />
            }
            title="Optimize system"
          />

          <QuickAction
            icon={
              <Activity size={15} />
            }
            title="Open monitor"
          />

          <QuickAction
            icon={
              <ShieldCheck size={15} />
            }
            title="System scan"
          />
        </div>
      </div>
    </>
  );
}

function Metric({
  title,
  value,
  width,
  icon,
  live = false,
  performance = false,
}: {
  title: string;
  value: string;
  width?: string;
  icon: ReactNode;
  live?: boolean;
  performance?: boolean;
}) {
  return (
    <div className="metric">
      <header>
        <span>
          {live && (
            <i className="metricLive" />
          )}

          {title}
        </span>

        {icon}
      </header>

      <strong
        className={
          performance
            ? "performanceValue"
            : ""
        }
      >
        {value}
      </strong>

      {width && (
        <div className="bar">
          <i
            style={{
              width,
            }}
          />
        </div>
      )}

      <small>
        {title === "ACTIVE MODE"
          ? "Ready for Game Mode"
          : "Live system reading"}
      </small>
    </div>
  );
}

function LiveChart({
  history,
}: {
  history: number[];
}) {
  const width = 700;
  const height = 210;

  if (history.length < 2) {
    return (
      <div className="chartLoading">
        <span className="liveDot" />

        Waiting for system
        telemetry...
      </div>
    );
  }

  const points = history.map(
    (value, index) => {
      const x =
        (index /
          Math.max(
            history.length - 1,
            1
          )) *
        width;

      const y =
        height -
        (value / 100) * height;

      return `${x},${y}`;
    }
  );

  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1="52"
          x2="700"
          y2="52"
          className="chartGrid"
        />

        <line
          x1="0"
          y1="105"
          x2="700"
          y2="105"
          className="chartGrid"
        />

        <line
          x1="0"
          y1="158"
          x2="700"
          y2="158"
          className="chartGrid"
        />

        <polyline
          points={points.join(" ")}
        />
      </svg>

      <div className="chartLabels">
        <span>100%</span>
        <span>50%</span>
        <span>0%</span>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <button className="quickAction">
      {icon}

      <span>
        <b>{title}</b>

        <small>
          Open CloudTWEAKS module
        </small>
      </span>

      →
    </button>
  );
}