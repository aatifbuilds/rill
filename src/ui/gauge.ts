import { CHAPTERS, smootherstep } from "../scroll/timeline";

/** The battery gauge: the purple fill rises and the figure counts up to 5000 while the power chapter is read. */
export function createGauge(root: ParentNode = document) {
  const fill = root.querySelector<HTMLElement>("[data-gauge-fill]");
  const number = root.querySelector<HTMLElement>("[data-gauge-number]");
  const [a, b] = CHAPTERS.power;
  let shown = -1;
  return {
    update(p: number): void {
      if (!fill || !number) return;
      const t = smootherstep((p - b) / ((b - a) * 2.2)); // fills across the first part of the chapter, then rests
      fill.style.transform = `scaleY(${(0.06 + 0.94 * t).toFixed(3)})`;
      const value = Math.round(5000 * t);
      if (value !== shown) {
        shown = value;
        number.textContent = String(value);
      }
    },
  };
}
