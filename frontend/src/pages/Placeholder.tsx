interface Props {
  title: string;
  subtitle: string;
}

export default function Placeholder({
  title,
  subtitle,
}: Props) {

  return (
    <section>

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            GHOSTNET MODULE
          </div>

          <h1>
            {title}
          </h1>

          <p>
            {subtitle}
          </p>

        </div>

      </div>

      <div className="panel empty-panel">

        <div className="empty-dot" />

        <strong>
          Module ready
        </strong>

        <span>
          Build this section next.
        </span>

      </div>

    </section>
  );
}