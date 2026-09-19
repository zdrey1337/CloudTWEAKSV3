import {
  Cpu,
  Gamepad2,
  Network,
  Sparkles,
} from "lucide-react";

const tweaks = [
  {
    title: "Game scheduling",
    description:
      "Prioritize foreground gaming workloads.",
    icon: Gamepad2,
  },
  {
    title: "CPU responsiveness",
    description:
      "Review Windows scheduling preferences.",
    icon: Cpu,
  },
  {
    title: "Network latency",
    description:
      "Inspect Windows networking settings.",
    icon: Network,
  },
  {
    title: "Background control",
    description:
      "Review unnecessary startup activity.",
    icon: Sparkles,
  },
];

export default function TweakCenter() {
  return (
    <>
      <div className="heading">
        <div>
          <small>
            CONTROL MODULE
          </small>

          <h1>
            Tweak Center
          </h1>

          <p>
            Choose individual optimizations
            instead of applying a mystery preset.
          </p>
        </div>
      </div>

      <div className="tweaks">
        {tweaks.map((tweak) => {
          const Icon = tweak.icon;

          return (
            <div
              className="tweak"
              key={tweak.title}
            >
              <div className="ticon">
                <Icon size={18} />
              </div>

              <span>
                <b>{tweak.title}</b>

                <small>
                  {tweak.description}
                </small>
              </span>

              <em>
                AVAILABLE
              </em>

              <button>
                ›
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}