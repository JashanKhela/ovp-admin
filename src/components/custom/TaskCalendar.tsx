import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Task } from "@/lib/interfaces";
import { getTasks } from "@/services/tasks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function TaskCalendar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    };
    fetchTasks();
  }, []);

  // 🎨 Define colors for task priority
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "red";
      case "high":
        return "orange";
      case "medium":
        return "yellow";
      default:
        return "green";
    }
  };

  // Convert tasks to calendar events
  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.start_date,
    end: task.end_date,
    backgroundColor: getPriorityColor(task.priority),
    borderColor: getPriorityColor(task.priority),
    extendedProps: task, // Store full task details
  }));

  // Handle event click (Open pop-up)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventClick = (clickInfo: any) => {
    const taskDetails = clickInfo.event.extendedProps as Task;
    setSelectedTask(taskDetails);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Task Calendar View</h1>

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

      {/* Task Details Pop-up */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <p>
            <strong>Status:</strong> {selectedTask?.status.replace("_", " ")}
          </p>
          <p>
            <strong>Priority:</strong> {selectedTask?.priority}
          </p>
          <p>
            <strong>Assigned To:</strong> {selectedTask?.assigned_to?.join(", ") || "N/A"}
          </p>
          <p>
            <strong>Location:</strong> {selectedTask?.location || "N/A"}
          </p>
          <p>
            <strong>Category:</strong> {selectedTask?.category || "N/A"}
          </p>
          <p>
            <strong>Start Date:</strong> {selectedTask?.start_date || "N/A"}
          </p>
          <p>
            <strong>End Date:</strong> {selectedTask?.end_date || "N/A"}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
