import { describe, expect, it } from "vitest";
import {
  ORBITS,
  orbitPosition,
  orbitRadii,
} from "../src/components/landing/orbit-geometry";

describe("mensajes en órbitas tridimensionales", () => {
  it.each([
    [320, 380],
    [390, 380],
    [596, 650],
  ])(
    "mantiene los mensajes dentro de una escena de %d × %d, también con paralaje",
    (width, height) => {
      const radius = orbitRadii(width, height);
      const labelWidth = Math.min(188, width * 0.4);
      for (let index = 0; index < ORBITS.length; index++) {
        for (let step = 0; step < 180; step++) {
          for (const pointer of [-1, 0, 1]) {
            const point = orbitPosition(
              index,
              (step / 180) * ORBITS[index].duration,
              pointer,
              -pointer,
            );
            expect(
              Math.abs(point.x * radius.x) + (labelWidth * point.scale) / 2,
            ).toBeLessThan(width / 2);
            expect(
              Math.abs(point.y * radius.y) + 32 * point.scale,
            ).toBeLessThan(height / 2);
          }
        }
      }
    },
  );
  it("cada mensaje pasa por delante y detrás de la flor, variando escala y luz", () => {
    ORBITS.forEach((orbit, index) => {
      const points = Array.from({ length: 180 }, (_, step) =>
        orbitPosition(index, (step / 180) * orbit.duration),
      );
      const front = points.filter((point) => point.layer > 20);
      const back = points.filter((point) => point.layer < 20);
      expect(front.length).toBeGreaterThan(60);
      expect(back.length).toBeGreaterThan(60);
      expect(Math.min(...front.map((point) => point.scale))).toBeGreaterThan(
        Math.max(...back.map((point) => point.scale)),
      );
      expect(Math.min(...front.map((point) => point.opacity))).toBeGreaterThan(
        Math.max(...back.map((point) => point.opacity)),
      );
      expect(orbitPosition(index, orbit.duration).x).toBeCloseTo(
        orbitPosition(index, 0).x,
      );
      expect(orbitPosition(index, orbit.duration).y).toBeCloseTo(
        orbitPosition(index, 0).y,
      );
    });
  });
});
