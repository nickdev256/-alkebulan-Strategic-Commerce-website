import './PhotoBreak.css';

// Wide, edge-to-edge photo strip with a short caption, placed between
// sections. `focus` sets which part of the photo stays in view.
export default function PhotoBreak({ image, alt, eyebrow, title, focus = 'center' }) {
  return (
    <section className="photo-break">
      <img
        src={image}
        alt={alt}
        width="1100"
        height="1560"
        loading="lazy"
        style={{ objectPosition: focus }}
      />
      <div className="container photo-break-caption">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <p className="photo-break-title">{title}</p>
      </div>
    </section>
  );
}
