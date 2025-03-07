import { useEffect, useState } from "react";
import {
  getTimesheets,
  addTimesheet,
  updateTimesheetStatus,
  deleteTimesheet,
} from "@/services/timesheets";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee, TimesheetEntry } from "@/lib/interfaces";
import { getEmployees } from "@/services/employees";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getCurrentUser } from "@/services/auth";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatTimeTo12Hour } from "@/lib/utils";

export default function Timesheets() {
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState<TimesheetEntry>({
    first_name: "",
    last_name: "",
    username: "",
    date_tracked: "",
    start_time: "",
    end_time: "",
    hours_worked: 0,
    location: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const filteredEntries = timesheets
    .filter((entry) =>
      `${entry.first_name} ${entry.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((entry) =>
      selectedLocation === "all" ? true : entry.location === selectedLocation
    )
    .filter((entry) =>
      selectedDate ? entry.date_tracked === selectedDate : true
    );

  // 🟢 Apply Pagination AFTER Filtering
  const totalPages = Math.ceil(filteredEntries.length / pageSize);
  const paginatedTimesheets = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  //Fetch Employees & Timesheets on Mount
  useEffect(() => {
    const fetchData = async () => {
      const employeesData = await getEmployees();
      setEmployees(employeesData);
      setTimesheets(await getTimesheets());
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLocation, selectedDate]);

  //  Handle Adding a New Timesheet Entry
  const handleAddTimesheet = async () => {
    if (
      !newEntry.username ||
      !newEntry.date_tracked ||
      !newEntry.start_time ||
      !newEntry.end_time ||
      !newEntry.location
    ) {
      alert("Please fill in all fields.");
      return;
    }

    // Convert start_time and end_time to Date objects
    const startTime = new Date(
      `${newEntry.date_tracked}T${newEntry.start_time}`
    );
    const endTime = new Date(`${newEntry.date_tracked}T${newEntry.end_time}`);

    // Ensure end time is after start time
    if (endTime <= startTime) {
      alert("End time must be after start time.");
      return;
    }

    // Calculate hours worked (convert milliseconds to hours)
    const hoursWorked =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    const success = await addTimesheet({
      ...newEntry,
      hours_worked: parseFloat(hoursWorked.toFixed(2)), // Store rounded value
    });

    if (success) {
      setTimesheets(await getTimesheets());
      setNewEntry({
        username: "",
        first_name: "",
        last_name: "",
        date_tracked: "",
        start_time: "",
        end_time: "",
        hours_worked: 0,
        location: "",
      });
    }
    toast.success("Timesheet entry added successfully!");
  };

  const handleUpdateStatus = async (
    id: string,
    status: "Approved" | "Rejected"
  ) => {
    const user = getCurrentUser();
    console.log(user);
    const adminName = user.username;
    const success = await updateTimesheetStatus(id, status, adminName);
    if (success) setTimesheets(await getTimesheets());
    toast.success(`Timesheet updated successfully!`);
  };

  // Handle Username Selection & Auto-Fill First/Last Name
  const handleUsernameSelect = (selectedUsername: string) => {
    const selectedEmployee = employees.find(
      (emp) => emp.username === selectedUsername
    );
    if (selectedEmployee) {
      setNewEntry({
        ...newEntry,
        username: selectedEmployee.username,
        first_name: selectedEmployee.first_name,
        last_name: selectedEmployee.last_name,
      });
    }
  };

  // Handle Deleting a Timesheet Entry
  const handleDeleteTimesheet = async () => {
    if (!deleteId) return;
    const success = await deleteTimesheet(deleteId);
    if (success) {
      setTimesheets(await getTimesheets());
    }
    toast.success("Timesheet entry deleted successfully!");
    setDeleteId(null);
  };
  return (
    <div className="container mx-auto p-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Timesheets</h1>
        <p className="text-gray-600">View and manage employee work hours.</p>
      </div>

      <Card className="max-w-[350px] md:max-w-full mb-6">
        <CardHeader>
          <CardTitle>➕ Add New Timesheet Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              name="username"
              value={newEntry.username}
              onValueChange={handleUsernameSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.username} value={employee.username}>
                    {employee.first_name} {employee.last_name} (
                    {employee.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              value={newEntry.first_name}
              placeholder="First Name"
              disabled
            />
            <Input
              type="text"
              value={newEntry.last_name}
              placeholder="Last Name"
              disabled
            />
            <div className="flex flex-col">
              <label
                htmlFor="date_tracked"
                className="text-sm font-medium text-gray-700"
              >
                Date Worked
              </label>
              <Input
                type="date"
                name="date_tracked"
                id="date_tracked"
                value={newEntry.date_tracked}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, date_tracked: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="start_time"
                className="text-sm font-medium text-gray-700"
              >
                Start Time
              </label>
              <Input
                type="time"
                id="start_time"
                name="start_time"
                value={newEntry.start_time}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, start_time: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="end_time"
                className="text-sm font-medium text-gray-700"
              >
                End Time
              </label>
              <Input
                type="time"
                id="end_time"
                name="end_time"
                value={newEntry.end_time}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, end_time: e.target.value })
                }
              />
            </div>
            <div className="w-full">
              <Select
                name="location"
                value={newEntry.location}
                onValueChange={(value) =>
                  setNewEntry({ ...newEntry, location: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Road 2">Road 2</SelectItem>
                  <SelectItem value="Road 3">Road 3</SelectItem>
                  <SelectItem value="Road 16">Road 16</SelectItem>
                  <SelectItem value="Spiers Rd">Spiers Rd</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddTimesheet}>Add Entry</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>Employee Timesheets</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              type="text"
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Road 2">Road 2</SelectItem>
                <SelectItem value="Road 3">Road 3</SelectItem>
                <SelectItem value="Road 16">Road 16</SelectItem>
                <SelectItem value="Spiers Rd">Spiers Rd</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Timesheet Table */}
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTimesheets.length > 0 ? (
                  paginatedTimesheets.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.first_name}</TableCell>
                      <TableCell>{entry.last_name}</TableCell>
                      <TableCell>{entry.date_tracked}</TableCell>
                      <TableCell>
                        {formatTimeTo12Hour(entry.start_time)}
                      </TableCell>
                      <TableCell>
                        {formatTimeTo12Hour(entry.end_time)}
                      </TableCell>

                      <TableCell>{entry.hours_worked}</TableCell>
                      <TableCell>{entry.location}</TableCell>
                      <TableCell>{entry.approved_by}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="flex gap-2 justify-center">
                        <Button
                          onClick={() =>
                            handleUpdateStatus(entry.id!, "Approved")
                          }
                        >
                          ✅ Approve
                        </Button>
                        <Button
                          onClick={() =>
                            handleUpdateStatus(entry.id!, "Rejected")
                          }
                        >
                          ❌ Reject
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteId(entry.id!)}
                        >
                          🗑 Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* 🟢 Pagination Controls */}
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
                      Page {currentPage} of {totalPages}
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
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this timesheet entry? This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTimesheet}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
