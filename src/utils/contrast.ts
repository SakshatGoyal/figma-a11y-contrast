export type RGB = { r: number; g: number; b: number };

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#','').trim();
  const v = h.length === 3
    ? [...h].map(c => parseInt(c + c, 16))
    : [h.slice(0,2), h.slice(2,4), h.slice(4,6)].map(s => parseInt(s, 16));
  const [r,g,b] = v as [number, number, number];
  return { r, g, b };
}

function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

export function relativeLuminance({r,g,b}: RGB): number {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(fg: RGB, bg: RGB): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const [a,b] = L1 >= L2 ? [L1,L2] : [L2,L1];
  return (a + 0.05) / (b + 0.05);
}
