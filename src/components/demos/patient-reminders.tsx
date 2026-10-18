import { useState, type FormEvent } from "react";
import {
  reminderDate,
  type Appointment,
  type DemoReminder,
} from "./veterinary-model";

export function PatientReminders({
  appointment,
  update,
  announce,
}: {
  appointment: Appointment;
  update: (reminders: DemoReminder[]) => void;
  announce: (message: string) => void;
}) {
  const [kind, setKind] = useState<DemoReminder["kind"]>("Control");
  const [date, setDate] = useState("");
  const [channel, setChannel] =
    useState<DemoReminder["channel"]>("Correo de prueba");
  function schedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = new Date(`${date}T12:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date
    ) {
      announce("Elige una fecha válida para el recordatorio.");
      return;
    }
    if (
      appointment.reminders.some(
        (reminder) =>
          reminder.kind === kind &&
          reminder.date === date &&
          reminder.channel === channel,
      )
    ) {
      announce(
        "Ya existe ese recordatorio para esta mascota. Cambia la fecha, el motivo o el canal.",
      );
      return;
    }
    update([
      ...appointment.reminders,
      {
        id:
          Math.max(0, ...appointment.reminders.map((reminder) => reminder.id)) +
          1,
        kind,
        date,
        channel,
        simulated: false,
      },
    ]);
    setDate("");
    announce(
      `Recordatorio de ${kind.toLocaleLowerCase("es")} añadido a la ficha de ${appointment.name}. Puedes ver el mensaje y simular su envío.`,
    );
  }
  return (
    <section
      className="demo-followup"
      aria-label={`Recordatorios de ${appointment.name}`}
    >
      <h4>Próximos controles y vacunas</h4>
      <p>
        Elige una fecha de ejemplo y revisa el mensaje que recibiría el
        responsable. Los envíos se simulan dentro de esta demo.
      </p>
      <form className="demo-reminder-form" onSubmit={schedule}>
        <label>
          Motivo del recordatorio
          <select
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as DemoReminder["kind"])
            }
          >
            <option>Control</option>
            <option>Vacunación</option>
          </select>
        </label>
        <label>
          Fecha del recordatorio
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label>
          Canal de prueba
          <select
            value={channel}
            onChange={(event) =>
              setChannel(event.target.value as DemoReminder["channel"])
            }
          >
            <option>Correo de prueba</option>
            <option>WhatsApp de prueba</option>
          </select>
        </label>
        <button className="button button-primary" type="submit">
          Crear recordatorio
        </button>
      </form>
      {!appointment.reminders.length ? (
        <p>Todavía no hay recordatorios para {appointment.name}.</p>
      ) : (
        <div className="demo-reminder-list">
          {appointment.reminders.map((reminder) => (
            <article
              className="demo-reminder"
              key={reminder.id}
              aria-label={`${reminder.kind} de ${appointment.name} el ${reminderDate(reminder.date)}`}
            >
              <div className="workspace-heading">
                <h5>
                  {reminder.kind} · {reminderDate(reminder.date)}
                </h5>
                <span className="badge">
                  {reminder.simulated ? "Envío simulado" : "Por simular"}
                </span>
              </div>
              <p>{reminder.channel}</p>
              <details>
                <summary>Ver mensaje de prueba</summary>
                <p className="demo-message-preview">
                  Hola, {appointment.owner}. Te recordamos{" "}
                  {reminder.kind === "Control"
                    ? "el control"
                    : "la cita de vacunación"}{" "}
                  de {appointment.name} para el {reminderDate(reminder.date)}.
                  Este es un mensaje de demostración de Flores Systems.
                </p>
              </details>
              <div className="demo-button-row">
                <button
                  className="button button-text"
                  disabled={reminder.simulated}
                  onClick={() => {
                    update(
                      appointment.reminders.map((entry) =>
                        entry.id === reminder.id
                          ? { ...entry, simulated: true }
                          : entry,
                      ),
                    );
                    announce(
                      `Envío simulado para ${appointment.name} por ${reminder.channel.toLocaleLowerCase("es")}. No se envió ningún mensaje real.`,
                    );
                  }}
                >
                  Simular envío
                </button>
                <button
                  className="button button-text"
                  onClick={() => {
                    update(
                      appointment.reminders.filter(
                        (entry) => entry.id !== reminder.id,
                      ),
                    );
                    announce(
                      `Recordatorio quitado de la ficha de ${appointment.name}.`,
                    );
                  }}
                >
                  Quitar recordatorio
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
