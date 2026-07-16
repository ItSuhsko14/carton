import { getPerspectiveMatrix } from "./perspective";
import type { Point } from "@/types/template";

interface RgbaImage {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

interface WarpResult {
  patch: RgbaImage;
  left: number;
  top: number;
}

function boundingBox(corners: Point[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  return {
    minX: Math.floor(Math.min(...xs)),
    minY: Math.floor(Math.min(...ys)),
    maxX: Math.ceil(Math.max(...xs)),
    maxY: Math.ceil(Math.max(...ys)),
  };
}

export function warpToQuad(
  source: RgbaImage,
  corners: [Point, Point, Point, Point],
): WarpResult {
  const box = boundingBox(corners);
  const patchWidth = box.maxX - box.minX;
  const patchHeight = box.maxY - box.minY;

  const forward = getPerspectiveMatrix(source.width, source.height, corners);
  const inverse = invert3x3(forward);

  const patch = new Uint8ClampedArray(patchWidth * patchHeight * 4);

  for (let py = 0; py < patchHeight; py++) {
    for (let px = 0; px < patchWidth; px++) {
      const dx = box.minX + px;
      const dy = box.minY + py;

      const denom = inverse[6] * dx + inverse[7] * dy + inverse[8];
      const sx = (inverse[0] * dx + inverse[1] * dy + inverse[2]) / denom;
      const sy = (inverse[3] * dx + inverse[4] * dy + inverse[5]) / denom;

      if (sx < 0 || sy < 0 || sx >= source.width - 1 || sy >= source.height - 1)
        continue;

      const sample = bilinear(source, sx, sy);
      const offset = (py * patchWidth + px) * 4;
      patch[offset] = sample[0];
      patch[offset + 1] = sample[1];
      patch[offset + 2] = sample[2];
      patch[offset + 3] = sample[3];
    }
  }

  return {
    patch: { data: patch, width: patchWidth, height: patchHeight },
    left: box.minX,
    top: box.minY,
  };
}

function bilinear(
  image: RgbaImage,
  x: number,
  y: number,
): [number, number, number, number] {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;

  const at = (ix: number, iy: number, channel: number) =>
    image.data[(iy * image.width + ix) * 4 + channel];

  const result: [number, number, number, number] = [0, 0, 0, 0];
  for (let channel = 0; channel < 4; channel++) {
    const top = at(x0, y0, channel) * (1 - fx) + at(x0 + 1, y0, channel) * fx;
    const bottom =
      at(x0, y0 + 1, channel) * (1 - fx) + at(x0 + 1, y0 + 1, channel) * fx;
    result[channel] = Math.round(top * (1 - fy) + bottom * fy);
  }
  return result;
}

function invert3x3(m: number[]): number[] {
  const [a, b, c, d, e, f, g, h, i] = m;
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  const inv = 1 / det;
  return [
    (e * i - f * h) * inv,
    (c * h - b * i) * inv,
    (b * f - c * e) * inv,
    (f * g - d * i) * inv,
    (a * i - c * g) * inv,
    (c * d - a * f) * inv,
    (d * h - e * g) * inv,
    (b * g - a * h) * inv,
    (a * e - b * d) * inv,
  ];
}
