import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth";
import { updateTimesheet, getTimesheets } from "@/services/timesheets";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { TimesheetEntry } from "@/lib/interfaces";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { toast } from "sonner";

export default function TimeReports() {
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState<
    TimesheetEntry[]
  >([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editEntry, setEditEntry] = useState<TimesheetEntry | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    const fetchUserTimesheets = async () => {
      const user = getCurrentUser();
      if (!user) return;

      const allTimesheets = await getTimesheets();
      // Filter only the logged-in employee's timesheets
      const userTimesheets = allTimesheets.filter(
        (entry) => entry.username === user.username
      );
      setTimesheets(userTimesheets);
      setFilteredTimesheets(userTimesheets);
    };

    fetchUserTimesheets();
  }, []);

  // Filter by date
  useEffect(() => {
    const filtered = timesheets.filter((entry) =>
      selectedDate ? entry.date_tracked === selectedDate : true
    );
    setFilteredTimesheets(filtered);
    setCurrentPage(1);
  }, [selectedDate, timesheets]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTimesheets.length / pageSize);
  const paginatedTimesheets = filteredTimesheets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Function to format time to 12-hour AM/PM
  const formatTimeTo12Hour = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
  };

  const handleEditEntry = (entry: TimesheetEntry) => {
    setEditEntry(entry);
    setEditModalOpen(true);
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold"> Reporte de Horas Trabajadas</h1>
        <p className="text-gray-600">
          Consulta y revisa tu historial de horas trabajadas. Puedes filtrar por
          fecha y verificar el estado de aprobación de cada entrada.
        </p>
      </div>
      <Card className="max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>📊 Mis Reportes de Tiempo</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Date Filter */}
          <div className="mb-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="Filtrar por fecha"
            />
          </div>

          {/* Timesheet Table */}
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora de Inicio</TableHead>
                  <TableHead>Hora de Fin</TableHead>
                  <TableHead>Horas Trabajadas</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTimesheets.length > 0 ? (
                  paginatedTimesheets.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date_tracked}</TableCell>
                      <TableCell>
                        {formatTimeTo12Hour(entry.start_time)}
                      </TableCell>
                      <TableCell>
                        {formatTimeTo12Hour(entry.end_time)}
                      </TableCell>
                      <TableCell>{entry.hours_worked}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-md text-sm font-semibold ${
                            entry.approval_status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : entry.approval_status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {entry.approval_status}
                        </span>
                        {entry.approval_status === "Pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEntry(entry)}
                          >
                            ✏️ Editar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No se encontraron registros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={currentPage === 1 ? "disabled" : ""}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      Página {currentPage} de {totalPages}
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        isActive={currentPage !== totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>✏️ Editar Entrada de Tiempo</DialogTitle>
    </DialogHeader>
    {editEntry && (
      <div className="grid grid-cols-1 gap-4">
        {/* Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Fecha</label>
          <Input
            type="date"
            value={editEntry.date_tracked}
            onChange={(e) => setEditEntry({ ...editEntry, date_tracked: e.target.value })}
          />
        </div>

        {/* Start Time */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Hora de inicio</label>
          <Input
            type="time"
            value={editEntry.start_time}
            onChange={(e) => setEditEntry({ ...editEntry, start_time: e.target.value })}
          />
        </div>

        {/* End Time */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Hora de fin</label>
          <Input
            type="time"
            value={editEntry.end_time}
            onChange={(e) => setEditEntry({ ...editEntry, end_time: e.target.value })}
          />
        </div>

        {/* Location */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Ubicación</label>
          <Select
            value={editEntry.location}
            onValueChange={(value) => setEditEntry({ ...editEntry, location: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Road 2">Road 2</SelectItem>
              <SelectItem value="Road 3">Road 3</SelectItem>
              <SelectItem value="Road 16">Road 16</SelectItem>
              <SelectItem value="Spiers Rd">Spiers Rd</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    )}
    <DialogFooter>
      <Button variant="outline" onClick={() => setEditModalOpen(false)}>
        Cancelar
      </Button>
      <Button
        onClick={async () => {
          if (!editEntry) return;

          // Calculate hours worked
          const startTime = new Date(`${editEntry.date_tracked}T${editEntry.start_time}`);
          const endTime = new Date(`${editEntry.date_tracked}T${editEntry.end_time}`);

          if (endTime <= startTime) {
            toast.error("La hora de fin debe ser posterior a la hora de inicio.");
            return;
          }

          const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          
          if (!editEntry.id) {
            toast.error("Error: No se puede actualizar sin un ID válido.");
            return;
          }
          
          const updatedEntry = {
            id: editEntry.id, // Ensure the ID is included
            date_tracked: editEntry.date_tracked,
            start_time: editEntry.start_time,
            end_time: editEntry.end_time,
            hours_worked: parseFloat(hoursWorked.toFixed(2)),
            location: editEntry.location,
            first_name: editEntry.first_name,
            last_name: editEntry.last_name,
            username: editEntry.username,
            approval_status: editEntry.approval_status || "Pending",
          };
          
          const success = await updateTimesheet(updatedEntry);
          if (success) {
            toast.success("Entrada de tiempo actualizada.");
            setTimesheets((prevTimesheets) =>
                prevTimesheets.map((ts) => (ts.id === updatedEntry.id ? updatedEntry : ts))
              );
              setFilteredTimesheets((prevFiltered) =>
                prevFiltered.map((ts) => (ts.id === updatedEntry.id ? updatedEntry : ts))
              );
          } else {
            toast.error("Error al actualizar la entrada.");
          }
          
          setEditModalOpen(false);
        }}
      >
        Guardar Cambios
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
}
