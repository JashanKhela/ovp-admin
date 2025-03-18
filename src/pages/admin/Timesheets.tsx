import { useEffect, useState } from "react";
import {
  getTimesheets,
  addTimesheet,
  updateTimesheetStatus,
  deleteTimesheet,
} from "@/services/timesheets";
import { getLocations } from "@/services/locations";
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
import { Employee, SiteLocation, TimesheetEntry } from "@/lib/interfaces";
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
import fileDownload from "js-file-download";

export default function Timesheets() {
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [locations, setLocations] = useState<SiteLocation[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState<TimesheetEntry>({
    first_name: "",
    last_name: "",
    username: "",
    date_tracked: "",
    start_time: "",
    end_time: "",
    lunch_break_minutes: 0,
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
    .filter((entry) => {
      const entryDate = new Date(entry.date_tracked);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      return (
        (!startDate || entryDate >= startDate) &&
        (!endDate || entryDate <= endDate)
      );
    });




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
      setLocations(await getLocations()); // Fetch locations from service
    };
    fetchData();
  }, []);
  

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLocation, dateRange]);

  
  const handleAddTimesheet = async () => {

    if (!newEntry.start_time || !newEntry.end_time || !newEntry.username) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    const startTime = new Date(`${newEntry.date_tracked}T${newEntry.start_time}`);
    const endTime = new Date(`${newEntry.date_tracked}T${newEntry.end_time}`);
    const lunchMinutes = newEntry.lunch_break_minutes || 0;
  
    if (endTime <= startTime) {
      toast.error("End time must be after start time.");
      return;
    }
  
    const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const adjustedHours = totalHours - lunchMinutes / 60;
  
    const success = await addTimesheet({
      ...newEntry,
      hours_worked: Math.max(0, parseFloat(adjustedHours.toFixed(2))), // Prevent negative values
    });
  
    if (success) {
      setTimesheets(await getTimesheets());
      toast.success("Timesheet entry added successfully!");
      setNewEntry({ ...newEntry, lunch_break_minutes: 30 });
    }
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

  const handleDeleteTimesheet = async () => {
    if (!deleteId) return;
    const success = await deleteTimesheet(deleteId);
    if (success) {
      setTimesheets(await getTimesheets());
    }
    toast.success("Timesheet entry deleted successfully!");
    setDeleteId(null);
  };


  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      toast.error("No timesheets available in the selected range.");
      return;
    }
  
    // Sort entries to group workers together
    const sortedEntries = [...filteredEntries].sort((a, b) =>
      a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name)
    );
  
    // CSV Headers for Detailed Entries (Includes Lunch Break)
    const headers = [
      "First Name,Last Name,Date,Start Time,End Time,Lunch Break (Minutes),Hours Worked,Location,Approved By,Status",
    ];
  
    // Generate CSV Data for Detailed Entries
    const detailedCsvData = sortedEntries.map(entry =>
      `${entry.first_name},${entry.last_name},${entry.date_tracked},${entry.start_time || "--"},${entry.end_time || "--"},${entry.lunch_break_minutes} minutes,${entry.hours_worked},${entry.location},${entry.approved_by || "N/A"},${entry.approval_status}`
    );
  
    // Generate Summary Data (Total Hours per Employee)
    const summaryMap = new Map();
    sortedEntries.forEach(entry => {
      const key = `${entry.first_name} ${entry.last_name}`;
      summaryMap.set(key, (summaryMap.get(key) || 0) + entry.hours_worked);
    });
  
    // Headers for Summary Report
    const summaryHeaders = ["Employee Name,Total Hours"];
    const summaryCsvData = Array.from(summaryMap.entries()).map(
      ([employee, totalHours]) => `${employee},${totalHours.toFixed(2)}`
    );
  
    // Combine and Export CSV
    const csvContent = [
      "Detailed Timesheet Entries:\n",
      ...headers,
      ...detailedCsvData,
      "\nSummary Report:\n",
      ...summaryHeaders,
      ...summaryCsvData,
    ].join("\n");
  
    fileDownload(csvContent, "timesheets_report.csv");
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
                value={newEntry.start_time || ""}
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
                value={newEntry.end_time || ""}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, end_time: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="lunch_break_minutes"
                className="text-sm font-medium text-gray-700"
              >
                Lunch Break (Minutes)
              </label>
              <Input
                type="number"
                id="lunch_break_minutes"
                value={newEntry.lunch_break_minutes || ""}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    lunch_break_minutes: Number(e.target.value),
                  })
                }
                placeholder="Enter minutes"
              />
            </div>
            <div className="w-full">
            <label
                htmlFor="location"
                className="text-sm font-medium text-gray-700"
              >
                Location
              </label>
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
                  {locations.map((farm) => (
                    <SelectItem key={farm.id} value={farm.location_name}>
                      {farm.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="mt-6" onClick={handleAddTimesheet}>Add Entry</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>Employee Timesheets</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="search"
              >
                Search Employee
              </label>
              <Input
                id="search"
                type="text"
                placeholder="Enter name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="location"
              >
                Filter by Location
              </label>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger className="w-full" id="location">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((farm) => (
                    <SelectItem
                      key={farm.location_name}
                      value={farm.location_name}
                    >
                      {farm.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="start_date"
                >
                  Start Date
                </label>
                <Input
                  id="start_date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="end_date"
                >
                  End Date
                </label>
                <Input
                  id="end_date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col just">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="export_button"
              >
                Export For Payroll
              </label>
              <Button onClick={handleExportCSV} className="mb-4 ">
                Export CSV
              </Button>
            </div>
          </div>

          {/* Timesheet Table */}
          <div className="overflow-x-scroll">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Lunch Break (min)</TableHead>
                  <TableHead>Hours Worked</TableHead>
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
                        {formatTimeTo12Hour(entry.start_time ?? "")}
                      </TableCell>
                      <TableCell>
                        {formatTimeTo12Hour(entry.end_time ?? "")}
                      </TableCell>
                      <TableCell>{entry.lunch_break_minutes || "0"} min</TableCell>
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
