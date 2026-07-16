import { layoutText } from "./text-layout";
import { warpToQuad } from "./warp-canvas";
import { getFontChoice } from "./font-list";
import type { Point, TemplateMeta } from "@/types/template";

const TEXT_COLOR = "#111111";
const RENDER_SCALE = 2;
const MARGIN_RATIO = 0.08;

function quadSize(corners: Point[]): { width: number; height: number } {
  const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
  const width = Math.max(
    distance(corners[0], corners[1]),
    distance(corners[3], corners[2]),
  );
  const height = Math.max(
    distance(corners[0], corners[3]),
    distance(corners[1], corners[2]),
  );
  return { width: Math.round(width), height: Math.round(height) };
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${source}`));
    image.src = source;
  });
}

function renderTextImageData(
  text: string,
  width: number,
  height: number,
  fontFamily: string,
  charWidthRatio: number,
): ImageData {
  const margin = Math.min(width, height) * MARGIN_RATIO;
  const boxWidth = width - margin * 2;
  const boxHeight = height - margin * 2;

  const { lines, fontSize, lineHeight } = layoutText(
    text,
    boxWidth,
    boxHeight,
    charWidthRatio,
  );
  const totalHeight = lines.length * lineHeight;
  const startY = (height - totalHeight) / 2 + lineHeight / 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not get 2D context for text rendering");
  }

  context.fillStyle = TEXT_COLOR;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `${fontSize}px "${fontFamily}", Impact, sans-serif`;

  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    context.fillText(line, width / 2, y);
  });

  return context.getImageData(0, 0, width, height);
}

export async function generateSignBlob(
  template: TemplateMeta,
  text: string,
  fontId: string | undefined,
): Promise<Blob> {
  const font = getFontChoice(fontId);
  await document.fonts.load(`16px "${font.family}"`);
  await document.fonts.ready;

  const templateImage = await loadImage(template.imageUrl);

  const { width, height } = quadSize(template.corners);
  const renderWidth = width * RENDER_SCALE;
  const renderHeight = height * RENDER_SCALE;

  const textImageData = renderTextImageData(
    text,
    renderWidth,
    renderHeight,
    font.family,
    font.charWidthRatio,
  );

  const warped = warpToQuad(
    {
      data: textImageData.data,
      width: textImageData.width,
      height: textImageData.height,
    },
    template.corners,
  );

  const canvas = document.createElement("canvas");
  canvas.width = templateImage.naturalWidth;
  canvas.height = templateImage.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not get 2D context for compositing");
  }

  context.drawImage(templateImage, 0, 0);

  const patchCanvas = document.createElement("canvas");
  patchCanvas.width = warped.patch.width;
  patchCanvas.height = warped.patch.height;
  const patchContext = patchCanvas.getContext("2d");
  if (!patchContext) {
    throw new Error("Could not get 2D context for overlay patch");
  }
  const patchImageData = patchContext.createImageData(
    warped.patch.width,
    warped.patch.height,
  );
  patchImageData.data.set(warped.patch.data);
  patchContext.putImageData(patchImageData, 0, 0);
  context.drawImage(patchCanvas, warped.left, warped.top);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to export canvas to PNG"));
      }
    }, "image/png");
  });
}
