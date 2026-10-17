"use client";

import { useState } from "react";
import { CommerceDemo } from "./commerce-demo";
import { VeterinaryDemo } from "./veterinary-demo";
import { ScrollMotion, demoScrollTargets } from "../landing/scroll-motion";

export function BusinessDemo({
  kind,
}: {
  kind: "tienda" | "veterinaria" | "restaurante";
}) {
  const [revision, setRevision] = useState(0);
  return (
    <ScrollMotion selector={demoScrollTargets}>
      <div className="demo-workspace">
        <div className="demo-reset-row">
          <p>Prueba los controles y recorre una operación completa.</p>
          <button
            className="button button-text"
            onClick={() => setRevision((value) => value + 1)}
          >
            Reiniciar demo
          </button>
        </div>
        {kind === "veterinaria" ? (
          <VeterinaryDemo key={`${kind}-${revision}`} />
        ) : (
          <CommerceDemo key={`${kind}-${revision}`} kind={kind} />
        )}
      </div>
    </ScrollMotion>
  );
}
