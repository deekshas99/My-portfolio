export default function CaseStudyStats({ figures, className = 'bl-case-stats' }) {
  return (
    <ul className={className} aria-label="Project statistics" style={{ '--case-stat-columns': figures.length }}>
      {figures.map(({ label, value, note }) => (
        <li key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <small>{note}</small>
        </li>
      ))}
    </ul>
  );
}
