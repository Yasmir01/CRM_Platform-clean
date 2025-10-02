import React from "react";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await prisma.landingPage.findUnique({ where: { slug: params.slug } });
  return {
    title: page?.seoTitle || page?.title,
    description: page?.seoDescription || undefined,
    keywords: page?.seoKeywords ? page.seoKeywords.split(",") : undefined,
  } as any;
}

export default async function LandingPage({ params }: { params: { slug: string } }) {
  const page = await prisma.landingPage.findUnique({ where: { slug: params.slug }, include: { property: true } });
  if (!page || !page.isPublished) {
    return <div className="lp-container p-10">Landing page not found</div>;
  }

  return (
    <div className="lp-container p-10">
      <h1 className="lp-title text-4xl font-bold">{page.title}</h1>
      {page.description && <p className="lp-description mt-4">{page.description}</p>}

      <div className="lp-property mt-6">
        <h2 className="lp-property-title text-2xl font-semibold">Property Info</h2>
        {page.property?.address && <p className="lp-property-address">{page.property.address}</p>}
        {page.property?.city && page.property?.state && (
          <p className="lp-property-location">{page.property.city}, {page.property.state}</p>
        )}
        {typeof (page.property as any)?.rent !== 'undefined' && <p className="lp-property-rent">Rent: ${(page.property as any).rent}</p>}
      </div>
    </div>
  );
}
