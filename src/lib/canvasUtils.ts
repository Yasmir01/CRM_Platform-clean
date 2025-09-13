export async function chartToBase64(chartId: string): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  const chart = document.getElementById(chartId);
  if (!chart) return null;

  const svg = chart.querySelector('svg');
  if (!svg) return null;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg as unknown as Node);

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0);
      const data = canvas.toDataURL('image/png');
      URL.revokeObjectURL(url);
      resolve(data);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
