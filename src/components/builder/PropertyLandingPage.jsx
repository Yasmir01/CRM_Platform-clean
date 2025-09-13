import React from "react";
import PropTypes from "prop-types";
import "@/styles/landing.css";
import PropertyLeadForm from "./PropertyLeadForm";

/**
 * Builder-ready Property Landing Page (JSX)
 * Props from Builder: property (object), account (branding)
 */
export default function PropertyLandingPage({ property = {}, account = {}, showLeadForm = true }) {
  const heroImage = property.heroImage || (property.images && property.images[0] && property.images[0].url) || null;

  return (
    <div className="builder-landing" style={{ "--primary": account.themeColor || "#111827" }}>
      <div className="branding-bar">
        {account.logoUrl ? <img src={account.logoUrl} alt={account.name} className="branding-logo" /> : <div style={{fontWeight:700}}>{account.name || "Property"}</div>}
      </div>

      <section className="landing-hero">
        <div className="hero-left">
          <h1 className="property-title">{property.title || "Beautiful property"}</h1>
          <div className="property-sub">{property.address || property.subtitle}</div>

          <div className="property-meta">
            {property.beds && <div>{property.beds} beds</div>}
            {property.baths && <div>{property.baths} baths</div>}
            {property.sqft && <div>{property.sqft} sqft</div>}
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="features-grid">
              {(property.features || []).slice(0,6).map((f, i) => (
                <div key={i} className="feature-card">{f}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-right">
          {heroImage ? (
            <img src={heroImage} alt={property.title} style={{ width: "100%", maxWidth: 480, borderRadius: 8, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 480, height: 280, background: "#f3f4f6", borderRadius: 8 }} />
          )}
        </div>
      </section>

      <div className="landing-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.25rem" }}>
          <article>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>About this property</h2>
            <div style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: property.descriptionHtml || property.description || "" }} />
            <div className="property-gallery" aria-hidden={!property.images}>
              {(property.images || []).slice(0, 6).map((img, idx) => (
                <img key={idx} src={img.url} alt={img.alt || `${property.title} image ${idx + 1}`} />
              ))}
            </div>
          </article>

          <aside>
            <div className="lead-panel">
              <h3 style={{ margin: 0, marginBottom: 8 }}>Interested? Contact us</h3>
              <p style={{ marginTop: 0, marginBottom: 12, color: "#6b7280" }}>Quick response — no spam.</p>
              {showLeadForm ? <PropertyLeadForm propertyId={property.id} property={property} account={account} /> : <div>Lead form disabled</div>}
            </div>
          </aside>
        </div>

        <div style={{ marginTop: 28 }}>
          <h3 style={{ marginBottom: 8 }}>More details</h3>
          <div>{property.longDetails || property.extra || ""}</div>
        </div>
      </div>
    </div>
  );
}

PropertyLandingPage.propTypes = {
  property: PropTypes.object,
  account: PropTypes.object,
  showLeadForm: PropTypes.bool,
};
