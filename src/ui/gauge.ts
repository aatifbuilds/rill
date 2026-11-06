/**
 * The battery gauge. When the power chapter turns on, the purple fill and the figure glide up to 5000 (about 1.2 s);
 * when it turns off they glide back down. Time-based, so it looks the same however fast you scroll.
 */
export function createGauge(root: ParentNode = document) {
  const fill = root.querySelector<HTMLElement>("[data-gauge-fill]");
  const number = root.querySelector<HTMLElement>("[data-gauge-number]");
  let value = 0; // 0..1
  let target = 0;
  let shown = -1;
  const paint = (): void => {
    if (!fill || !number) return;
    fill.style.transform = `scaleY(${(0.06 + 0.94 * value).toFixed(3)})`;
    const n = Math.round(5000 * value);
    if (n !== shown) {
      shown = n;
      number.textContent = String(n);
    }
  };
  paint();
  return {
    setActive(on: boolean): void {
      target = on ? 1 : 0;
    },
    /** Call once per frame with the frame time in seconds. Does nothing while the gauge is at rest. */
    update(dt: number): void {
      if (value === target) return;
      value += (target - value) * (1 - Math.exp(-dt * 3.2));
      if (Math.abs(target - value) < 0.0005) value = target;
      paint();
    },
  };
}
