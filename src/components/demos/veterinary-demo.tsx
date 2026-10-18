import { useState, type FormEvent } from "react";
import { PatientReminders } from "./patient-reminders";
import {
  visitStages,
  type Appointment,
  type VisitStatus,
} from "./veterinary-model";

const initialAppointments: Appointment[] = [
  {
    id: 1,
    name: "Luna",
    owner: "Cliente de ejemplo A",
    time: "09:30",
    service: "Consulta",
    status: "pending",
    notes: ["Primera visita de ejemplo."],
    reminders: [],
  },
  {
    id: 2,
    name: "Toby",
    owner: "Cliente de ejemplo B",
    time: "10:15",
    service: "Vacunación",
    status: "waiting",
    notes: [],
    reminders: [],
  },
  {
    id: 3,
    name: "Milo",
    owner: "Cliente de ejemplo C",
    time: "11:00",
    service: "Control",
    status: "completed",
    notes: [],
    reminders: [],
  },
];
const validTime = (value: string) =>
  /^(?:(?:09|1[0-7]):(?:00|15|30|45)|18:00)$/.test(value);

export function VeterinaryDemo() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [time, setTime] = useState("09:00");
  const [service, setService] = useState("Consulta");
  const [reschedule, setReschedule] = useState("");
  const [note, setNote] = useState("");
  const selected = appointments.find((item) => item.id === selectedId);
  const visible = appointments
    .filter(
      (item) =>
        `${item.name} ${item.owner}`
          .toLocaleLowerCase("es")
          .includes(search.trim().toLocaleLowerCase("es")) &&
        (filter === "Todas" ||
          item.status ===
            (
              {
                Pendientes: "pending",
                "En espera": "waiting",
                "En atención": "consulting",
                Atendidas: "completed",
              } as Record<string, VisitStatus>
            )[filter]),
    )
    .sort((a, b) => a.time.localeCompare(b.time));
  const pending = appointments.filter(
    (item) => item.status !== "completed",
  ).length;

  function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !owner.trim()) {
      setMessage("Escribe el nombre de la mascota y del responsable.");
      return;
    }
    if (!validTime(time)) {
      setMessage(
        "Elige un horario entre las 09:00 y las 18:00, en intervalos de 15 minutos.",
      );
      return;
    }
    if (appointments.some((item) => item.time === time)) {
      setMessage("Ese horario ya está ocupado. Elige otra hora.");
      return;
    }
    const id = Math.max(...appointments.map((item) => item.id)) + 1;
    setAppointments((current) => [
      ...current,
      {
        id,
        name: name.trim(),
        owner: owner.trim(),
        time,
        service,
        status: "pending",
        notes: [],
        reminders: [],
      },
    ]);
    setSelectedId(id);
    setReschedule(time);
    setNote("");
    setName("");
    setOwner("");
    setSearch("");
    setFilter("Todas");
    setMessage("Cita registrada en la agenda de demostración.");
  }
  function changeTime(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    if (!validTime(reschedule)) {
      setMessage(
        "Elige un horario entre las 09:00 y las 18:00, en intervalos de 15 minutos.",
      );
      return;
    }
    if (
      appointments.some(
        (item) => item.id !== selected.id && item.time === reschedule,
      )
    ) {
      setMessage("Ese horario ya está ocupado. Elige otra hora.");
      return;
    }
    setAppointments((current) =>
      current.map((item) =>
        item.id === selected.id
          ? { ...item, time: reschedule, status: "pending" }
          : item,
      ),
    );
    setMessage(
      `Cita de ${selected.name} reprogramada a las ${reschedule} y marcada como pendiente.`,
    );
  }
  return (
    <>
      <div className="workspace-heading">
        <h2>Agenda de ejemplo</h2>
        <span className="badge">
          {pending} sin finalizar · {appointments.length - pending} finalizadas
        </span>
      </div>
      <p className="demo-hint">
        Registra la llegada, inicia la atención y finaliza la visita. En la
        ficha puedes preparar recordatorios de controles o vacunas. Agenda de
        hoy, de 09:00 a 18:00.
      </p>
      <p className="demo-feedback" role="status">
        {message}
      </p>
      <div className="demo-columns">
        <div>
          <div className="demo-filters">
            <label>
              Buscar mascota
              <input
                type="search"
                placeholder="Mascota o responsable"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label>
              Estado de cita
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option>Todas</option>
                <option>Pendientes</option>
                <option>En espera</option>
                <option>En atención</option>
                <option>Atendidas</option>
              </select>
            </label>
          </div>
          <div className="request-list demo-appointments">
            {visible.map((item) => {
              const stageIndex = visitStages.findIndex(
                (stage) => stage.id === item.status,
              );
              const stage = visitStages[stageIndex];
              return (
                <article key={item.id} aria-label={`Cita de ${item.name}`}>
                  <div>
                    <strong>
                      {item.time} · {item.name}
                    </strong>
                    <p>{item.owner}</p>
                    <p>{item.service}</p>
                    <span
                      className="badge demo-visit-status"
                      data-state={item.status}
                    >
                      {stage.label}
                    </span>
                  </div>
                  <div className="demo-appointment-actions">
                    <button
                      className="button button-text"
                      aria-label={`Ver ficha de ${item.name}`}
                      aria-expanded={selectedId === item.id}
                      onClick={() => {
                        setSelectedId(item.id);
                        setReschedule(item.time);
                        setNote("");
                      }}
                    >
                      Ver ficha
                    </button>
                    <button
                      className="button button-text"
                      onClick={() => {
                        setAppointments((current) =>
                          current.map((entry) =>
                            entry.id === item.id
                              ? {
                                  ...entry,
                                  status:
                                    visitStages[
                                      (stageIndex + 1) % visitStages.length
                                    ].id,
                                }
                              : entry,
                          ),
                        );
                        setMessage(
                          `${item.name}: ${visitStages[(stageIndex + 1) % visitStages.length].label.toLocaleLowerCase("es")}.`,
                        );
                      }}
                    >
                      {stage.action}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {!visible.length ? (
            <p className="empty-state">
              No hay citas con esos filtros. Prueba otra búsqueda o registra una
              mascota.
            </p>
          ) : null}
        </div>
        <aside className="demo-panel">
          <h3>Nueva cita de prueba</h3>
          <form className="demo-form-stack" onSubmit={register}>
            <label>
              Nombre de la mascota
              <input
                required
                maxLength={50}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej.: Nala"
              />
            </label>
            <label>
              Responsable de ejemplo
              <input
                required
                maxLength={80}
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                placeholder="Usa un nombre ficticio"
              />
            </label>
            <label>
              Servicio
              <select
                value={service}
                onChange={(event) => setService(event.target.value)}
              >
                <option>Consulta</option>
                <option>Vacunación</option>
                <option>Control</option>
              </select>
            </label>
            <label>
              Hora de la nueva cita
              <input
                required
                type="time"
                min="09:00"
                max="18:00"
                step={900}
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </label>
            <button className="button button-primary" type="submit">
              Registrar cita
            </button>
          </form>
        </aside>
      </div>
      {selected ? (
        <section
          className="demo-pet-record"
          aria-label={`Ficha de ${selected.name}`}
        >
          <div className="workspace-heading">
            <h3>Ficha de {selected.name}</h3>
            <button
              className="button button-text"
              onClick={() => setSelectedId(null)}
            >
              Cerrar ficha
            </button>
          </div>
          <p>
            {selected.owner} · {selected.service} · {selected.time}
          </p>
          <div
            className="demo-visit-steps"
            role="group"
            aria-label="Etapas de atención"
          >
            {visitStages.map((stage, index) => (
              <span
                key={stage.id}
                aria-current={selected.status === stage.id ? "step" : undefined}
                className={
                  index <=
                  visitStages.findIndex((entry) => entry.id === selected.status)
                    ? "is-complete"
                    : undefined
                }
              >
                {stage.label}
              </span>
            ))}
          </div>
          <div className="demo-columns">
            <form className="demo-form-stack" onSubmit={changeTime}>
              <h4>Reprogramar atención</h4>
              <label>
                Nueva hora de la cita
                <input
                  required
                  type="time"
                  min="09:00"
                  max="18:00"
                  step={900}
                  value={reschedule}
                  onChange={(event) => setReschedule(event.target.value)}
                />
              </label>
              <button className="button button-text" type="submit">
                Reprogramar cita
              </button>
            </form>
            <div>
              <h4>Notas de la ficha</h4>
              {selected.notes.length ? (
                <ul className="demo-notes">
                  {selected.notes.map((entry, index) => (
                    <li className="preserve-text" key={index}>
                      {entry}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Todavía no hay notas. Añade una observación de prueba.</p>
              )}
              <form
                className="demo-form-stack"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!note.trim()) {
                    setMessage("Escribe una nota antes de guardarla.");
                    return;
                  }
                  setAppointments((current) =>
                    current.map((item) =>
                      item.id === selected.id
                        ? { ...item, notes: [...item.notes, note.trim()] }
                        : item,
                    ),
                  );
                  setNote("");
                  setMessage(`Nota añadida a la ficha de ${selected.name}.`);
                }}
              >
                <label>
                  Nota de prueba
                  <textarea
                    required
                    maxLength={300}
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Ej.: traer el carné a la próxima visita"
                  />
                </label>
                <button className="button button-text" type="submit">
                  Agregar nota a la ficha
                </button>
              </form>
            </div>
          </div>
          <PatientReminders
            key={selected.id}
            appointment={selected}
            announce={setMessage}
            update={(reminders) =>
              setAppointments((current) =>
                current.map((item) =>
                  item.id === selected.id ? { ...item, reminders } : item,
                ),
              )
            }
          />
        </section>
      ) : null}
    </>
  );
}
