export interface FontChoice {
  id: string;
  label: string;
  family: string;
  charWidthRatio: number;
}

export const FONT_CHOICES: FontChoice[] = [
  { id: "neucha", label: "Олівець", family: "Neucha", charWidthRatio: 0.5 },
  { id: "amatic", label: "Тонкий", family: "Amatic SC", charWidthRatio: 0.38 },
];

export const DEFAULT_FONT_ID = FONT_CHOICES[0].id;

export function getFontChoice(fontId: string | undefined): FontChoice {
  return FONT_CHOICES.find((choice) => choice.id === fontId) ?? FONT_CHOICES[0];
}
