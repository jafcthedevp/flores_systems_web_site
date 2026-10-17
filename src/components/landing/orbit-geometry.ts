const TAU = Math.PI * 2;
const rad = (degrees: number) => (degrees * Math.PI) / 180;

export const ORBITS = [
  {
    text: "Flores Systems / Estudio digital",
    roll: -24,
    tilt: 48,
    phase: 0.12,
    duration: 28,
  },
  {
    text: "Ideas que toman forma",
    roll: 30,
    tilt: 56,
    phase: 0.46,
    duration: 34,
  },
  {
    text: "Tecnología que te acompaña",
    roll: -66,
    tilt: 38,
    phase: 0.78,
    duration: 40,
  },
] as const;

export function projectOrbit(angle: number, roll: number, tilt: number) {
  const x = Math.cos(angle);
  const y = Math.sin(angle) * Math.cos(rad(tilt));
  const depth = Math.sin(angle) * Math.sin(rad(tilt));
  return {
    x: x * Math.cos(rad(roll)) - y * Math.sin(rad(roll)),
    y: x * Math.sin(rad(roll)) + y * Math.cos(rad(roll)),
    depth,
    scale: 0.88 + depth * 0.14,
    opacity: 0.82 + depth * 0.18,
    layer:
      depth >= 0 ? 30 + Math.round(depth * 10) : 10 + Math.round(depth * 5),
  };
}

export function orbitRadii(width: number, height: number) {
  const labelWidth = Math.min(188, width * 0.4);
  return {
    x: Math.max(0, (width - labelWidth * 1.06) / 2 - 12),
    y: height * 0.35,
  };
}

export function orbitPosition(
  index: number,
  seconds: number,
  pointerX = 0,
  pointerY = 0,
) {
  const orbit = ORBITS[index];
  return projectOrbit(
    (seconds / orbit.duration + orbit.phase) * TAU,
    orbit.roll + pointerX * 3,
    orbit.tilt + pointerY * 3,
  );
}

export function orbitPath(
  index: number,
  width: number,
  height: number,
  frontOnly = false,
) {
  const orbit = ORBITS[index];
  const radius = orbitRadii(width, height);
  const range = frontOnly ? Math.PI : TAU;
  return Array.from({ length: 97 }, (_, step) => {
    const point = projectOrbit((step / 96) * range, orbit.roll, orbit.tilt);
    return `${step === 0 ? "M" : "L"}${(width / 2 + point.x * radius.x).toFixed(2)},${(height / 2 + point.y * radius.y).toFixed(2)}`;
  }).join(" ");
}
