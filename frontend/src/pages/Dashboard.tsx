import StatCard from "../components/StatCard";

export default function Dashboard() {

  return (
    <section>

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            SYSTEM OVERVIEW
          </div>

          <h1>
            Optimization
          </h1>

          <p>
            Monitor your system and manage
            performance profiles.
          </p>

        </div>

      </div>

      <div className="stats-grid">

        <StatCard
          label="CPU"
          value="--"
          detail="Waiting for monitor"
          icon="CPU"
        />

        <StatCard
          label="RAM"
          value="--"
          detail="Waiting for monitor"
          icon="RAM"
        />

        <StatCard
          label="GPU"
          value="--"
          detail="Waiting for monitor"
          icon="GPU"
        />

        <StatCard
          label="STATUS"
          value="READY"
          detail="Optimizer online"
          icon="✓"
        />

      </div>

      <div className="panel hero-panel">

        <div className="hero-icon">
          ⚡
        </div>

        <div>

          <div className="eyebrow">
            PERFORMANCE PROFILE
          </div>

          <h2>
            Ready to optimize
          </h2>

          <p>
            Choose Game Boost for per-game
            settings or use Cleanup for
            temporary files.
          </p>

        </div>

      </div>

    </section>
  );
}