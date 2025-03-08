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

  // Handle Time Submission
  const handleSubmit = async () => {
    if (
      !entry.date_tracked ||
      !entry.start_time ||
      !entry.end_time    ) {
      toast.error("Por favor, complete todos los campos.");
      return;
    }

    // Convert start_time and end_time to Date objects
    const startTime = new Date(`${entry.date_tracked}T${entry.start_time}`);
    const endTime = new Date(`${entry.date_tracked}T${entry.end_time}`);

    // Ensure end time is after start time
    if (endTime <= startTime) {
      toast.error("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    // Calculate hours worked
    const hoursWorked =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    setEntry((prev) => ({
      ...prev,
      hours_worked: parseFloat(hoursWorked.toFixed(2)),
    }));

    // Open Confirmation Modal
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    const success = await addTimesheet(entry);
    if (success) {
      toast.success("Horas registradas exitosamente.");
      setEntry({
        ...entry,
        start_time: "",
        end_time: "",
        hours_worked: 0,
        location: "",
      });
    } else {
      toast.error("Error al registrar las horas.");
    }
    setConfirmModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
  <h1 className="text-3xl font-bold"> Registro de Horas de Trabajo</h1>
  <p className="text-gray-600">
    Ingrese su hora de inicio y fin de turno. Su tiempo trabajado será calculado automáticamente. Asegúrese de seleccionar la fecha y ubicación correcta antes de enviar.
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


                        {/* Employee Input Fields */}
                        <div className="flex flex-col">
              <label
                htmlFor="start_time"
                className="text-sm font-medium text-gray-700"
              >
                Hora de inicio
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
                value={entry.start_time}
                onChange={(e) =>
                  setEntry({ ...entry, start_time: e.target.value })
                }
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
                value={entry.end_time}
                onChange={(e) =>
                  setEntry({ ...entry, end_time: e.target.value })
                }
              />
            </div>

            <Button onClick={handleSubmit}>Registrar Horas</Button>
          </div>
        </CardContent>
      </Card>
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmación</DialogTitle>
          </DialogHeader>
          <p>
            Vas a registrar <strong>{entry.hours_worked} horas</strong> para el
            día <strong>{entry.date_tracked}</strong>.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmSubmit}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
