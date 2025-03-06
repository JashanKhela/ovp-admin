import { useState, useEffect } from "react";
import { getCurrentUser } from "@/services/auth";
import { addTimesheet } from "@/services/timesheets";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { TimesheetEntry } from "@/lib/interfaces";

export default function RecordTime() {
  const [, setUser] = useState<{ username: string; first_name: string; last_name: string } | null>(null);
  const [entry, setEntry] = useState<TimesheetEntry>({
    username: "",
    first_name: "",
    last_name: "",
    date_tracked: new Date().toISOString().split("T")[0], // Default to today
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEntry({ ...entry, [e.target.name]: e.target.value });
  };

  // Handle Time Submission
  const handleSubmit = async () => {
    if (!entry.date_tracked || !entry.hours_worked || !entry.location) {
      toast.error("Por favor, complete todos los campos.");
      return;
    }

    const success = await addTimesheet(entry);
    if (success) {
      toast.success("Horas registradas exitosamente.");
      setEntry({ ...entry, hours_worked: 0, location: "" });
    } else {
      toast.error("Error al registrar las horas.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
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
            <Input
              type="date"
              name="date_tracked"
              value={entry.date_tracked || ""}
              onChange={handleInputChange} // ✅ Allow user to select date
            />

            {/* Employee Input Fields */}
            <Input
              type="number"
              name="hours_worked"
              placeholder="Horas trabajadas"
              value={entry.hours_worked ?? ""} // ✅ Use "" if undefined
              onChange={handleInputChange}
            />
            <Select
              name="location"
              value={entry.location || ""}
              onValueChange={(value) => setEntry({ ...entry, location: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ubicación de trabajo" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="Road 2">Road 2</SelectItem>
                <SelectItem value="Road 3">Road 3</SelectItem>
                <SelectItem value="Road 16">Road 16</SelectItem>
                <SelectItem value="Spiers Rd">Spiers Rd</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSubmit}>Registrar Horas</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
