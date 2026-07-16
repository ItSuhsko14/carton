import type { Point } from '@/types/template';

type Matrix = [number, number, number, number, number, number, number, number, number];

function solve(a: number[][], b: number[]): number[] {
  const n = b.length;
  const m = a.map((row, index) => [...row, b[index]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
    }
    [m[col], m[pivot]] = [m[pivot], m[col]];

    const pivotValue = m[col][col];
    for (let k = col; k <= n; k++) m[col][k] /= pivotValue;

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = m[row][col];
      for (let k = col; k <= n; k++) m[row][k] -= factor * m[col][k];
    }
  }

  return m.map((row) => row[n]);
}

/**
 * Computes the 3x3 projective matrix mapping the source rectangle
 * (0,0)-(width,height) onto the destination quadrilateral.
 */
export function getPerspectiveMatrix(
  width: number,
  height: number,
  destination: [Point, Point, Point, Point],
): Matrix {
  const source: Point[] = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];

  const rows: number[][] = [];
  const rhs: number[] = [];

  for (let i = 0; i < 4; i++) {
    const s = source[i];
    const d = destination[i];
    rows.push([s.x, s.y, 1, 0, 0, 0, -d.x * s.x, -d.x * s.y]);
    rhs.push(d.x);
    rows.push([0, 0, 0, s.x, s.y, 1, -d.y * s.x, -d.y * s.y]);
    rhs.push(d.y);
  }

  const [a, b, c, d, e, f, g, h] = solve(rows, rhs);
  return [a, b, c, d, e, f, g, h, 1];
}
