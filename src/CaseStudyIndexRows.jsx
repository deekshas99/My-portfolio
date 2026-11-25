export default function CaseStudyIndexRows({ items, activeId, onSelect, vertical = false }) {
  const midpoint = Math.ceil(items.length / 2);
  const rows = vertical ? [items] : [items.slice(0, midpoint), items.slice(midpoint)];

  return (
    <div className="bl-index-rows">
      {rows.filter(row => row.length).map(row => (
        <div className="bl-index-track" key={row[0].id}>
          {row.map(item => (
            <button
              type="button"
              key={item.id}
              data-on={item.id === activeId ? 'true' : 'false'}
              aria-current={item.id === activeId ? 'step' : undefined}
              onClick={() => onSelect(item.id)}
            >
              <span className="bl-index-pit" aria-hidden="true" />
              {item.name}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
