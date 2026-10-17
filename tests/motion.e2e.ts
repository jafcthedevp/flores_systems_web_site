import { expect, test, type Locator } from "@playwright/test";

async function position(caption: Locator) {
  return caption.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const parent = element.closest(".hero-visual")!.getBoundingClientRect();
    return { x: box.x - parent.x, y: box.y - parent.y };
  });
}

async function expectMoving(caption: Locator) {
  const initial = await position(caption);
  await expect
    .poll(async () => {
      const next = await position(caption);
      return Math.hypot(next.x - initial.x, next.y - initial.y);
    })
    .toBeGreaterThan(5);
}

for (const width of [1440, 390]) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`órbitas con profundidad y marquee ${width} (${reducedMotion})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("/");
      const scene = page.locator(".orbital-scene");
      await scene.scrollIntoViewIfNeeded();
      const captions = scene.locator(".visual-caption");
      await expect(captions).toHaveText([
        "Flores Systems / Estudio digital",
        "Ideas que toman forma",
        "Tecnología que te acompaña",
      ]);
      for (const caption of await captions.all()) await expectMoving(caption);
      const states = await captions.evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          const bounds = element
            .closest(".hero-visual")!
            .getBoundingClientRect();
          const style = getComputedStyle(element),
            matrix = new DOMMatrix(style.transform);
          return {
            left: box.left,
            right: box.right,
            top: box.top,
            bottom: box.bottom,
            bounds: {
              left: bounds.left,
              right: bounds.right,
              top: bounds.top,
              bottom: bounds.bottom,
            },
            b: matrix.b,
            c: matrix.c,
            scale: matrix.a,
            layer: Number(style.zIndex),
            opacity: Number(style.opacity),
          };
        }),
      );
      for (const state of states) {
        expect(state.b).toBe(0);
        expect(state.c).toBe(0);
        expect(state.left).toBeGreaterThanOrEqual(state.bounds.left);
        expect(state.right).toBeLessThanOrEqual(state.bounds.right);
        expect(state.top).toBeGreaterThanOrEqual(state.bounds.top);
        expect(state.bottom).toBeLessThanOrEqual(state.bounds.bottom);
      }
      expect(states.some((state) => state.layer > 20)).toBe(true);
      expect(states.some((state) => state.layer < 20)).toBe(true);
      expect(
        Math.max(...states.map((state) => state.scale)) -
          Math.min(...states.map((state) => state.scale)),
      ).toBeGreaterThan(0.1);
      await expect(scene.locator(".orbital-spark")).toHaveCount(3);
      await expect(scene.locator(".orbital-paths path")).toHaveCount(6);
      if (width > 560) {
        const before = await scene.evaluate((el) =>
          el.style.getPropertyValue("--parallax-x"),
        );
        await scene.hover({ position: { x: 30, y: 40 } });
        await expect
          .poll(() =>
            scene.evaluate((el) => el.style.getPropertyValue("--parallax-x")),
          )
          .not.toBe(before);
      }
      await scene.screenshot({
        path: `test-results/orbits-3d-${width}-${reducedMotion}.png`,
      });

      const marquee = page.locator(".specialties");
      await marquee.scrollIntoViewIfNeeded();
      const track = marquee.locator(".specialties-track");
      const initial = await track.evaluate(
        (el) => getComputedStyle(el).transform,
      );
      await expect
        .poll(() => track.evaluate((el) => getComputedStyle(el).transform))
        .not.toBe(initial);
      const original = marquee.locator(".specialties-set:not([aria-hidden])");
      await expect(original.locator(".specialty-tile")).toHaveCount(4);
      await expect(original.locator(".specialty-mark")).toHaveCount(4);
      await expect(original.locator("img")).toHaveCount(0);
      expect(
        await original
          .locator(".specialty-tile")
          .first()
          .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).is2D),
      ).toBe(false);
      const sizes = await marquee
        .locator(".specialties-set")
        .evaluateAll((els) =>
          els.map((el) => el.getBoundingClientRect().width),
        );
      expect(sizes[0]).toBeCloseTo(sizes[1]);
      const animation = await track.evaluate((el) => {
        const animation = el.getAnimations()[0];
        animation.pause();
        animation.currentTime = 27999;
        return getComputedStyle(el).transform;
      });
      expect(animation).not.toBe("none");
      await marquee.screenshot({
        path: `test-results/marquee-3d-${width}-${reducedMotion}.png`,
      });
      await track.evaluate((el) => el.getAnimations()[0].play());
      await expect(
        page.locator(
          "[data-replay], [data-pause], .motion-toggle, .hero-motion-toggle",
        ),
      ).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const ambient = page.locator('[data-demo="ambient"]');
      await ambient.scrollIntoViewIfNeeded();
      await expect(ambient).toHaveClass(/is-playing/);
      const orb = ambient.locator(".ambient-orb-one");
      const first = await orb.evaluate((el) => getComputedStyle(el).transform);
      await expect
        .poll(() => orb.evaluate((el) => getComputedStyle(el).transform))
        .not.toBe(first);
      expect(errors).toEqual([]);
    });
  }
}
