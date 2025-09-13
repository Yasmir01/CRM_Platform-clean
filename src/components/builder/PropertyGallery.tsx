import React from "react";

interface GalleryImage {
  src?: string;
  url?: string;
}

interface PropertyGalleryProps {
  images?: (string | GalleryImage)[] | string | GalleryImage | null;
  data?: any;
}

export default function PropertyGallery(props: PropertyGalleryProps) {
  const data = props.data || {};
  const property = data.property || {};
  const inputs = props.images || property.gallery || [];
  const images = Array.isArray(inputs) ? inputs : [inputs];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {images.map((img, i) => {
        const src = typeof img === "string" ? img : img?.src || img?.url;
        if (!src) return null;
        return (
          <img
            key={i}
            src={src}
            alt={`gallery-${i}`}
            className="w-full h-40 object-cover rounded-lg shadow-sm"
          />
        );
      })}
    </div>
  );
}
