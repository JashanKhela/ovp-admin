import { useState, useEffect } from "react";
import { getCurrentUser } from "@/services/auth";
import { addTimesheet } from "@/services/timesheets";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TimesheetEntry } from "@/lib/interfaces";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPSTDate } from "@/lib/utils";

export default function RecordTime() {
  const [, setUser] = useState<{
    username: string;
    first_name: string;
    last_name: string;
  } | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const [entry, setEntry] = useState<TimesheetEntry>({
    username: "",
    first_name: "",
    last_name: "",
    date_tracked: getPSTDate(),
    start_time: "",
    end_time: "",
    hours_worked: 0,
    location: "",
  });

  const [isDayOff, setIsDayOff] = useState(false);

  // Fetch Logged-in Employee Data
  useEffect(() => {
    const loggedUser = getCurrentUser();
    console.log(loggedUser);
    if (loggedUser.username) {
      setUser(loggedUser);
      setEntry((prev) => ({
        ...prev,
        username: loggedUser.username || "",
        first_name: loggedUser.first_name || "",
        last_name: loggedUser.last_name || "",
      }));
    }
  }, []);

  // Handle Input Changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEntry({ ...entry, [e.target.name]: e.target.value });
  };


  const handleSubmit = () => {
    if (!entry.date_tracked) {
      toast.error("Seleccione una fecha válida.");
      return;
    }
  
    if (isDayOff) {
      setEntry((prev) => ({
        ...prev,
        start_time: null, 
        end_time: null,   
        lunch_break_minutes: 0,
        hours_worked: 0,
      }));
      setConfirmModalOpen(true);
      return;
    }
  
    if (!entry.start_time || !entry.end_time) {
      toast.error("Por favor, complete todos los campos.");
      return;
    }
  
    const startTime = new Date(`${entry.date_tracked}T${entry.start_time}`);
    const endTime = new Date(`${entry.date_tracked}T${entry.end_time}`);
    const lunchMinutes = entry.lunch_break_minutes || 0;
  
    if (endTime <= startTime) {
      toast.error("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }
  
    // Convert to hours while subtracting lunch break
    const totalHours =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const adjustedHours = totalHours - lunchMinutes / 60;
  
    setEntry((prev) => ({
      ...prev,
      hours_worked: Math.max(0, parseFloat(adjustedHours.toFixed(2))), // Prevent negative values
    }));
  
    setConfirmModalOpen(true);
  };
  


  const handleConfirmSubmit = async () => {
    const success = await addTimesheet(entry);
    if (success) {
      toast.success(
        isDayOff
          ? "Día Libre registrado exitosamente."
          : "Horas registradas exitosamente."
      );
      setEntry({
        ...entry,
        start_time: "",
        end_time: "",
        hours_worked: 0,
        location: "",
      });
      setIsDayOff(false);
    } else {
      toast.error("Error al registrar.");
    }
    setConfirmModalOpen(false);
  };


  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold"> Registro de Horas de Trabajo</h1>
        <p className="text-gray-600">
          Ingrese su hora de inicio y fin de turno. Su tiempo trabajado será
          calculado automáticamente. Asegúrese de seleccionar la fecha y
          ubicación correcta antes de enviar.
        </p>
      </div>

      <Card className="mx-auto">
        <CardHeader>
          <CardTitle>🕒 Registrar Horas de Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {/* Auto-Filled Employee Info */}
            <Input
              type="text"
              value={entry.first_name || ""}
              disabled
              placeholder="Nombre"
            />
            <Input
              type="text"
              value={entry.last_name || ""}
              disabled
              placeholder="Apellido"
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="day_off"
                checked={isDayOff}
                onChange={() => {
                  setIsDayOff(!isDayOff);
                  setEntry((prev) => ({
                    ...prev,
                    start_time: "",
                    end_time: "",
                    lunch_break_minutes: 0,
                    hours_worked: 0,
                  }));
                }}
              />
              <label
                htmlFor="day_off"
                className="text-sm font-medium text-gray-700"
              >
                Marcar como Día Libre
              </label>
            </div>

            {/* Employee Input Fields */}
            <div className="flex flex-col">
              <label
                htmlFor="date_tracked"
                className="text-sm font-medium text-gray-700"
              >
                Fecha de seguimiento
              </label>
              <Input
                id="date_tracked"
                type="date"
                name="date_tracked"
                value={entry.date_tracked || ""}
                onChange={handleInputChange}
                
              />
            </div>

            {/* Employee Input Fields */}
            <div className="flex flex-col">
              <label
                htmlFor="start_time"
                className="text-sm font-medium text-gray-700"
              >
                Hora de inicio
              </label>
              <Input
                type="time"
                id="start_time"
                name="start_time"
                value={entry.start_time || ""}
                onChange={(e) =>
                  setEntry({ ...entry, start_time: e.target.value })
                }
                disabled={isDayOff}
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="end_time"
                className="text-sm font-medium text-gray-700"
              >
                Hora de fin
              </label>
              <Input
                type="time"
                id="end_time"
                name="end_time"
                value={entry.end_time || ""}
                onChange={(e) =>
                  setEntry({ ...entry, end_time: e.target.value })
                }
                disabled={isDayOff}
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="lunch_break"
                className="text-sm font-medium text-gray-700"
              >
                Minutos de Almuerzo
              </label>
              <Input
                type="number"
                id="lunch_break"
                name="lunch_break_minutes"
                value={entry.lunch_break_minutes || ""}
                onChange={(e) =>
                  setEntry({
                    ...entry,
                    lunch_break_minutes: Number(e.target.value),
                  })
                }
                placeholder="Ingrese minutos de almuerzo"
                disabled={isDayOff}
              />
            </div>

            <Button onClick={handleSubmit}>Registrar Horas</Button>
          </div>
        </CardContent>
      </Card>
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        {isDayOff ? "Confirmación de Día Libre" : "Confirmación de Horas"}
      </DialogTitle>
    </DialogHeader>

    <div className="grid grid-cols-1 gap-3 p-2">
      <p className="text-lg font-semibold">
        {isDayOff ? (
          <>
            Has marcado el{" "}
            <span className="text-blue-600">{entry.date_tracked}</span> como
            <span className="text-red-600 font-bold"> Día Libre.</span> 
          </>
        ) : (
          <>
            Vas a registrar horas para el{" "}
            <span className="text-blue-600">{entry.date_tracked}</span>
          </>
        )}
      </p>

      {isDayOff ? (
        <p className="text-md text-gray-600">
          Disfruta tu descanso y aprovecha tu día libre. ¡Nos vemos pronto! 😊
        </p>
      ) : (
        <>
          <div className="flex justify-between">
            <p>
              <strong className="text-gray-700">🕒 Hora de Inicio:</strong>{" "}
              <span className="bg-blue-100 px-2 py-1 rounded-md">
                {entry.start_time || "--:--"}
              </span>
            </p>
            <p>
              <strong className="text-gray-700">🕒 Hora de Fin:</strong>{" "}
              <span className="bg-red-100 px-2 py-1 rounded-md">
                {entry.end_time || "--:--"}
              </span>
            </p>
          </div>

          <p>
            <strong className="text-gray-700">🍽 Minutos de Almuerzo:</strong>{" "}
            <span className="bg-yellow-100 px-2 py-1 rounded-md">
              {entry.lunch_break_minutes} min
            </span>
          </p>

          <p>
            <strong className="text-gray-700">⏳ Horas Trabajadas:</strong>{" "}
            <span className="bg-green-100 px-2 py-1 rounded-md">
              {entry.hours_worked} horas
            </span>
          </p>
        </>
      )}
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
        {isDayOff ? "Editar Día Libre" : "Cancelar"}
      </Button>
      <Button onClick={handleConfirmSubmit}>
        {isDayOff ? "Confirmar Día Libre" : "Confirmar"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
}
