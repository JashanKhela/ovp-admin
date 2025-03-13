import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Task, Employee } from "@/lib/interfaces";
import { getTasks, updateTask } from "@/services/tasks";
import { getEmployees } from "@/services/employees";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function TaskSchedule() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setTasks(await getTasks());
      setEmployees(await getEmployees());
    };
    fetchData();
  }, []);

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "gray";
      case "in_progress":
        return "blue";
      case "completed":
        return "green";
      case "canceled":
        return "red";
      default:
        return "gray";
    }
  };
  

  // 🔎 Apply Filters
  const filteredTasks = tasks
    .filter((task) =>
      searchTerm ? task.title.toLowerCase().includes(searchTerm.toLowerCase()) : true
    )
    .filter((task) =>
      selectedEmployee === "all" ? true : task.assigned_to.includes(selectedEmployee)
    )
    .filter((task) => (selectedPriority === "all" ? true : task.priority === selectedPriority))
    .filter((task) => (selectedStatus === "all" ? true : task.status === selectedStatus));

  // Convert filtered tasks to FullCalendar events
  const events = filteredTasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.start_date,
    end: task.end_date,
    backgroundColor: getStatusColor(task.status),
    borderColor: 'black',
    extendedProps: task, // Attach full task data
  }));

  // Open pop-up when clicking a task
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventClick = (clickInfo: any) => {
    const taskDetails = clickInfo.event.extendedProps as Task;
    setSelectedTask(taskDetails);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">Task Calendar</h1>
      <p className="text-gray-600 mb-6">View all scheduled tasks in a visual format.</p>

      {/* Filters Section */}
      <Card  className="mb-6 max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>🔍 Filter Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* 🔍 Search by Task Name */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Search Task</label>
              <Input
                type="text"
                placeholder="Search task title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 👤 Filter by Employee */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Filter by Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.username} value={emp.username}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 🎯 Filter by Priority */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Filter by Priority</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 📌 Filter by Status */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Filter by Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Calendar */}
      <Card className="mb-6 max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>Task Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventClick={handleEventClick}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height="auto"
          />
        </CardContent>
      </Card>

      {/* Task Details Pop-up */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
  <DialogContent className="max-w-lg p-6">
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold flex items-center gap-2">
        📝 {selectedTask?.title || "Task Details"}
      </DialogTitle>
    </DialogHeader>

    <div className="grid grid-cols-1 gap-4">
      {/* Status */}
      <div className="flex items-center gap-2">
        <strong className="text-gray-700">Status:</strong>
        <span
          className={`capitalize px-3 py-1 rounded-md text-sm font-semibold ${
            selectedTask?.status === "completed"
              ? "bg-green-500 text-white"
              : selectedTask?.status === "in_progress"
              ? "bg-blue-500 text-white"
              : selectedTask?.status === "pending"
              ? "bg-yellow-500 text-black"
              : "bg-gray-500 text-white"
          }`}
        >
          {selectedTask?.status.replace("_", " ")}
        </span>
      </div>

      {/* Priority */}
      <div className="flex items-center gap-2">
        <strong className="text-gray-700">Priority:</strong>
        <span
          className={`capitalize px-3 py-1 rounded-md text-sm font-semibold ${
            selectedTask?.priority === "urgent"
              ? "bg-red-500 text-white"
              : selectedTask?.priority === "high"
              ? "bg-orange-400 text-white"
              : selectedTask?.priority === "medium"
              ? "bg-yellow-400 text-black"
              : "bg-green-400 text-black"
          }`}
        >
          {selectedTask?.priority}
        </span>
      </div>

      {/* Assigned To */}
      <div>
        <strong className="text-gray-700">Assigned To:</strong>
        <p className="text-gray-800">{selectedTask?.assigned_to?.join(", ") || "N/A"}</p>
      </div>

      {/* Start & End Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong className="text-gray-700">Start Date:</strong>
          <p className="text-gray-800">{selectedTask?.start_date || "N/A"}</p>
        </div>
        <div>
          <strong className="text-gray-700">End Date:</strong>
          <p className="text-gray-800">{selectedTask?.end_date || "N/A"}</p>
        </div>
      </div>

      {/* Location */}
      <div>
        <strong className="text-gray-700">Location:</strong>
        <p className="text-gray-800">{selectedTask?.location || "N/A"}</p>
      </div>

      {/* Category */}
      <div>
        <strong className="text-gray-700">Category:</strong>
        <p className="text-gray-800">{selectedTask?.category || "N/A"}</p>
      </div>

      {/* Description */}
      {selectedTask?.description && (
        <div>
          <strong className="text-gray-700">Description:</strong>
          <p className="text-gray-800">{selectedTask?.description}</p>
        </div>
      )}

      {/* Notes */}
      {selectedTask?.notes && (
        <div>
          <strong className="text-gray-700">Notes:</strong>
          <p className="text-gray-800">{selectedTask?.notes}</p>
        </div>
      )}
    </div>

    <DialogFooter className="flex justify-between mt-4">
      <Button variant="outline" onClick={() => setSelectedTask(null)}>
        Close
      </Button>
      
      {/* ✅ Mark as Complete Button */}
      {selectedTask?.status !== "completed" && (
        <Button
          onClick={async () => {
            const updatedTask: Partial<Task> = { ...selectedTask, status: "completed" as Task["status"] };
            if (selectedTask?.id) {
              const success = await updateTask(selectedTask.id, updatedTask);
              if (success) {
                setTasks(await getTasks());
                toast.success("Task marked as completed!");
              }
            }
          }}
        >
          ✅ Mark as Complete
        </Button>
      )}
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
}
