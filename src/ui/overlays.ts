import { CHAPTER_RANGES, isChapterActive, type ChapterId } from "../scroll/timeline";

/**
 * Text chapters are on or off, decided by the raw scroll position. Turning one on or off only toggles a class;
 * the fade and rise are CSS transitions (time-based), so they look the same at any scroll speed and never flicker through.
 */
export function createOverlays(onChange?: (id: ChapterId, active: boolean) => void, root: ParentNode = document) {
  const chapters = [...root.querySelectorAll<HTMLElement>("[data-chapter]")].map((el) => {
    // the stagger index is set once here, never per frame
    el.querySelectorAll<HTMLElement>("[data-reveal]").forEach((r, i) => r.style.setProperty("--i", String(i)));
    return { id: el.dataset.chapter as ChapterId, el, active: false };
  });
  return {
    update(progress: number): void {
      for (const c of chapters) {
        if (!(c.id in CHAPTER_RANGES)) continue;
        const next = isChapterActive(c.id, progress, c.active);
        if (next === c.active) continue;
        c.active = next;
        c.el.classList.toggle("is-active", next);
        onChange?.(c.id, next);
      }
    },
    active(): ChapterId[] {
      return chapters.filter((c) => c.active).map((c) => c.id);
    },
  };
}
