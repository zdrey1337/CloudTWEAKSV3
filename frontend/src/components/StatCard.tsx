interface Props {
  label: string;
  value: string;
  detail: string;
  icon: string;
}

export default function StatCard({
  label,
  value,
  detail,
  icon,
}: Props) {

  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-label">
        {label}
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-detail">
        {detail}
      </div>

    </div>
  );
}