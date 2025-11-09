import { contrastRatio, RGB } from './utils/contrast';

// Naive helpers – phase 1: single solid text color, assume white background.
function figmaColorToRgb(c: RGB | {r:number; g:number; b:number}): RGB {
  // Figma colors are 0..1 floats; coerce if needed
  const r = (c as any).r <= 1 ? Math.round((c as any).r * 255) : (c as any).r;
  const g = (c as any).g <= 1 ? Math.round((c as any).g * 255) : (c as any).g;
  const b = (c as any).b <= 1 ? Math.round((c as any).b * 255) : (c as any).b;
  return { r, g, b };
}

function getSolidTextFill(node: TextNode): RGB | null {
  if (node.fills === figma.mixed) return null;
  const fills = node.fills as ReadonlyArray<Paint>;
  if (!fills || !fills.length) return null;
  const p = fills.find(f => f.type === 'SOLID') as SolidPaint | undefined;
  return p ? figmaColorToRgb(p.color as any) : null;
}

function getBackgroundFallback(): RGB {
  // Phase 1: assume white page background; improve later.
  return { r: 255, g: 255, b: 255 };
}

function findTextNodes(scope: readonly SceneNode[]): TextNode[] {
  const acc: TextNode[] = [];
  const visit = (n: SceneNode) => {
    if (n.type === 'TEXT') acc.push(n);
    if ('children' in n) (n as any).children.forEach(visit);
  };
  scope.forEach(visit);
  return acc;
}

const AA_TEXT = 4.5; // normal text threshold

// Entry
const selection = figma.currentPage.selection.length
  ? figma.currentPage.selection
  : [figma.currentPage];

const texts = findTextNodes(selection as any);
let scanned = 0;
let fails = 0;

for (const t of texts) {
  const fg = getSolidTextFill(t);
  if (!fg) continue;
  const bg = getBackgroundFallback();
  const ratio = contrastRatio(fg, bg);
  scanned++;
  if (ratio < AA_TEXT) fails++;
}

figma.notify(`[A11y] Scanned ${scanned} text layer(s); ${fails} below AA (4.5:1).`);
figma.closePlugin();

export {};
