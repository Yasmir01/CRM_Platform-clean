import React from "react";

interface PropertyHeroProps {
  title?: string;
  subtitle?: string;
  image?: string | { src: string } | null;
  ctaLabel?: string;
  ctaUrl?: string;
  data?: any; // Builder passes data
}

export default function PropertyHero(props: PropertyHeroProps) {
  const data = props.data || {};
  const property = data.property || {};

  const title = props.title || property.title || "Property Title";
  const subtitle =
    props.subtitle || property.subtitle || property.address || "";
  const rawImage = props.image || property.heroImage || null;
  const imgSrc = typeof rawImage === "string" ? rawImage : rawImage?.src;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={title}
            className="w-full rounded-xl mb-6 object-cover"
          />
        )}
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {subtitle && <p className="text-gray-600 mb-4">{subtitle}</p>}
        {props.ctaLabel && props.ctaUrl && (
          <a
            href={props.ctaUrl}
            className="inline-block px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            {props.ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}
