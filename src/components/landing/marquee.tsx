import { ScrollScene } from "./scroll-motion";

const phrases = [
  { text: "Ideas que pueden tomar forma", color: "sky", mark: "bloom" },
  { text: "Experiencias que conectan", color: "lilac", mark: "connections" },
  { text: "Diseño con movimiento", color: "mint", mark: "ribbon" },
  { text: "Tecnología para crecer", color: "rose", mark: "steps" },
] as const;

function CardMark({ kind }: { kind: (typeof phrases)[number]["mark"] }) {
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      aria-hidden="true"
      className="specialty-mark"
    >
      {kind === "bloom" ? (
        <g>
          {[0, 45, 90, 135].map((angle) => (
            <ellipse
              key={angle}
              cx="90"
              cy="90"
              rx="27"
              ry="68"
              transform={`rotate(${angle} 90 90)`}
            />
          ))}
          <circle cx="90" cy="90" r="10" />
        </g>
      ) : null}
      {kind === "connections" ? (
        <g>
          <path d="M24 112C24 54 87 16 126 41S166 127 104 139 35 97 80 69s73 15 61 58" />
          <circle cx="24" cy="112" r="6" />
          <circle cx="126" cy="41" r="6" />
          <circle cx="104" cy="139" r="6" />
          <circle cx="80" cy="69" r="6" />
        </g>
      ) : null}
      {kind === "ribbon" ? (
        <g>
          {[0, 15, 30, 45, 60].map((offset) => (
            <path
              key={offset}
              d={`M${24 + offset} 146C${-25 + offset} 85 ${130 + offset} 102 ${76 + offset} 30`}
            />
          ))}
        </g>
      ) : null}
      {kind === "steps" ? (
        <g>
          {[0, 1, 2, 3].map((index) => (
            <rect
              key={index}
              x={24 + index * 27}
              y={95 - index * 23}
              width="27"
              height={52 + index * 23}
              rx="13"
            />
          ))}
          <path d="M20 150h145" />
        </g>
      ) : null}
    </svg>
  );
}

export function Marquee() {
  return (
    <div className="motion-surface">
      <ScrollScene scene="marquee">
        <div
          className="specialties"
          role="region"
          aria-label="Ideas de Flores Systems"
        >
          <div className="specialties-marquee">
            <div className="specialties-track">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className="specialties-set"
                  aria-hidden={copy === 1 ? true : undefined}
                >
                  {phrases.map((phrase) => (
                    <div
                      className={`specialty-object specialty-object-${phrase.color}`}
                      key={phrase.text}
                    >
                      <div
                        className={`specialty-tile specialty-${phrase.color}`}
                      >
                        <span className="specialty-edge" aria-hidden="true" />
                        <strong>{phrase.text}</strong>
                        <CardMark kind={phrase.mark} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollScene>
    </div>
  );
}
