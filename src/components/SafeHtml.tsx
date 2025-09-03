import React from "react";
import DOMPurify from "dompurify";

type Props = { html: string; className?: string };

export default function SafeHtml({ html, className }: Props) {
  const clean = React.useMemo(
    () => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),
    [html]
  );
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
