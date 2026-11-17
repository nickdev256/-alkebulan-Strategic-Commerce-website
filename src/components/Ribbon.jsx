import './Ribbon.css';

/*
 * A strip of items that scrolls sideways in a continuous loop.
 * The list is drawn twice so the loop has no gap; the copy is hidden from
 * screen readers. Hovering pauses it, and it stays still for visitors who
 * prefer reduced motion.
 */
export default function Ribbon({ items, label, className = '', speed = 40, reverse = false }) {
  const renderList = (copy) => (
    <ul className="ribbon-list" aria-hidden={copy || undefined}>
      {items.map((item) => (
        <li key={item.key}>{item.content}</li>
      ))}
    </ul>
  );

  return (
    <div
      className={`ribbon ${className}${reverse ? ' ribbon--reverse' : ''}`}
      role="region"
      aria-label={label}
      style={{ '--ribbon-speed': `${speed}s` }}
    >
      <div className="ribbon-track">
        {renderList(false)}
        {renderList(true)}
      </div>
    </div>
  );
}
