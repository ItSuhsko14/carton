export interface Point {
  x: number;
  y: number;
}

export interface Template {
  corners: [Point, Point, Point, Point];
}

export interface TemplateMeta {
  id: string;
  imageUrl: string;
  corners: [Point, Point, Point, Point];
}
