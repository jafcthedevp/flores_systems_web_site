export const visitStages = [
  { id: "pending", label: "Pendiente", action: "Registrar llegada" },
  { id: "waiting", label: "En espera", action: "Iniciar atención" },
  { id: "consulting", label: "En atención", action: "Finalizar atención" },
  { id: "completed", label: "Finalizada", action: "Volver a pendiente" },
] as const;
export type VisitStatus = (typeof visitStages)[number]["id"];
export type DemoReminder = {
  id: number;
  kind: "Control" | "Vacunación";
  date: string;
  channel: "Correo de prueba" | "WhatsApp de prueba";
  simulated: boolean;
};
export type Appointment = {
  id: number;
  name: string;
  owner: string;
  time: string;
  service: string;
  status: VisitStatus;
  notes: string[];
  reminders: DemoReminder[];
};

export function reminderDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}
