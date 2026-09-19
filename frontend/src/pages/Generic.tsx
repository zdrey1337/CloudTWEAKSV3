interface Props {
  title: string;
  kicker: string;
  description: string;
}

export default function Generic({
  title,
  kicker,
  description,
}: Props) {
  return (
    <>
      <div className="heading">
        <div>
          <small>{kicker}</small>

          <h1>{title}</h1>

          <p>
            {description}
          </p>
        </div>
      </div>

      <div className="empty">
        <div>+</div>

        <b>
          Module initialized
        </b>

        <small>
          Ready for the next
          CloudTWEAKS V3 feature.
        </small>
      </div>
    </>
  );
}