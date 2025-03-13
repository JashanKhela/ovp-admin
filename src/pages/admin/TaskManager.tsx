  import { useEffect, useState } from "react";
  import { getTasks, addTask, updateTask, deleteTask } from "@/services/tasks";
  import { getEmployees } from "@/services/employees";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import {
    Select as ShadSelect,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { Task, Employee, SiteLocation } from "@/lib/interfaces";
  import { toast } from "sonner";
  import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination";
  import { getLocations } from "@/services/locations";
  import { getCurrentUser } from "@/services/auth";
  import Select, { MultiValue } from "react-select";

  export default function TaskManager() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [locations, setLocations] = useState<SiteLocation[]>([]);
    const [newTask, setNewTask] = useState<Partial<Task>>({
      title: "",
      description: "",
      assigned_to: [] as string[], // Ensure it's an array of strings
      assigned_by: getCurrentUser()?.username || "",
      status: "pending",
      priority: "medium",
      start_date: "",
      end_date: "",
      location: "",
      category: "",
      notes: "",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState("all");
    const [selectedPriority, setSelectedPriority] = useState("all");

    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
      const fetchData = async () => {
        setTasks(await getTasks());
        setEmployees(await getEmployees());
        setLocations(await getLocations());
      };
      fetchData();
    }, []);

    const employeeOptions = employees.map((emp) => ({
      value: emp.username,
      label: `${emp.first_name} ${emp.last_name}`,
    }));

    const filteredTasks = tasks
      .filter((task) =>
        searchTerm
          ? task.title.toLowerCase().includes(searchTerm.toLowerCase())
          : true
      )
      .filter((task) =>
        selectedEmployee === "all"
          ? true
          : task.assigned_to.includes(selectedEmployee)
      )
      .filter((task) =>
        selectedPriority === "all" ? true : task.priority === selectedPriority
      );

    // 🟢 Apply Pagination AFTER Filtering
    const totalPages = Math.ceil(filteredTasks.length / pageSize);
    const paginatedTasks = filteredTasks.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

    const handleAddTask = async () => {
      if (!newTask.title || !newTask.assigned_to) {
        toast.error("Title and Assigned Employee are required.");
        return;
      }

      const success = await addTask(newTask as Task);
      if (success) {
        setTasks(await getTasks());
        setNewTask({
          title: "",
          description: "",
          assigned_to: [],
          status: "pending",
          priority: "medium",
          start_date: "",
          end_date: "",
        });
        toast.success("Task added successfully!");
      }
    };

    const handleUpdateTask = async () => {
      if (!editingTask?.id) return;
      const success = await updateTask(editingTask.id, editingTask);
      if (success) {
        setTasks(await getTasks());
        setEditingTask(null); // Close dialog
        toast.success("Task updated successfully!");
      }
    };

    const handleDeleteTask = async () => {
      if (!deleteId) return;
      const success = await deleteTask(deleteId);
      if (success) {
        setTasks(await getTasks());
        setDeleteId(null); // Close dialog
        toast.success("Task deleted successfully!");
      }
    };

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Task Manager</h1>

        <Card className="mb-6 max-w-[350px] md:max-w-full">
          <CardHeader>
            <CardTitle>➕ Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Task Title */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Title
                </label>
                <Input
                  placeholder="Enter Task Title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />
              </div>

              {/* Task Description */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Input
                  placeholder="Enter Task Description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                />
              </div>

              {/* Assigned To (Multiple Select) */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Assign To
                </label>
                <Select
                  isMulti
                  options={employeeOptions}
                  value={employeeOptions.filter(
                    (option) =>
                      newTask.assigned_to?.includes(option.value) ?? false
                  )}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(selectedOptions: MultiValue<any>) =>
                    setNewTask((prev) => ({
                      ...prev,
                      assigned_to: selectedOptions.map(
                        (option) => option.value
                      ),
                    }))
                  }
                  className="w-full"
                />
              </div>

              {/* Task Status */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <ShadSelect
                  value={newTask.status}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, status: value as Task["status"] })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </ShadSelect>
              </div>

              {/* Task Priority */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Priority
                </label>
                <ShadSelect
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask({
                      ...newTask,
                      priority: value as Task["priority"],
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </ShadSelect>
              </div>

              {/* Start Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={newTask.start_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, start_date: e.target.value })
                  }
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  End Date
                </label>
                <Input
                  type="date"
                  value={newTask.end_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, end_date: e.target.value })
                  }
                />
              </div>

              {/* Location */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Location
                </label>
                <ShadSelect
                  value={newTask.location}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, location: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.location_name}>
                        {loc.location_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </ShadSelect>
              </div>

              {/* Task Category */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <ShadSelect
                  value={newTask.category}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, category: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planting">Planting</SelectItem>
                    <SelectItem value="harvesting">Harvesting</SelectItem>
                    <SelectItem value="maintenance">
                      Equipment Maintenance
                    </SelectItem>
                    <SelectItem value="feeding">Feeding</SelectItem>
                  </SelectContent>
                </ShadSelect>
              </div>

              {/* Notes */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <Input
                  placeholder="Enter any additional notes"
                  value={newTask.notes}
                  onChange={(e) =>
                    setNewTask({ ...newTask, notes: e.target.value })
                  }
                />
              </div>

              {/* Submit Button */}
              <Button className="md:mt-5" onClick={handleAddTask}>
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 max-w-[350px] md:max-w-full">
          <CardHeader>
            <CardTitle>Task List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {/* 🔍 Search by Task Name */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Search Task
                </label>
                <Input
                  type="text"
                  placeholder="Search task title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* 👤 Filter by Employee */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Filter by Employee
                </label>
                <ShadSelect
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                >
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
                </ShadSelect>
              </div>

              {/* 🎯 Filter by Priority */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Filter by Priority
                </label>
                <ShadSelect
                  value={selectedPriority}
                  onValueChange={setSelectedPriority}
                >
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
                </ShadSelect>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      {task.assigned_to?.length > 0
                        ? task.assigned_to.join(", ")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-md text-sm font-semibold ${
                          task.priority === "urgent"
                            ? "bg-red-500 text-white"
                            : task.priority === "high"
                            ? "bg-orange-400 text-white"
                            : task.priority === "medium"
                            ? "bg-yellow-400 text-black"
                            : "bg-green-400 text-black"
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-md text-sm font-semibold ${
                          task.status === "completed"
                            ? "bg-green-500 text-white"
                            : task.status === "in_progress"
                            ? "bg-blue-500 text-white"
                            : task.status === "pending"
                            ? "bg-yellow-500 text-black"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {task.status.replace("_", " ").toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{task.start_date || "N/A"}</TableCell>
                    <TableCell>{task.end_date || "N/A"}</TableCell>
                    <TableCell className="flex gap-2">
                      {task.status !== "completed" && (
                        <Button
                          className="bg-green-500 text-white"
                          onClick={async () => {
                            const updatedTask: Partial<Task> = {
                              ...task,
                              status: "completed",
                            };
                            if (task.id) {
                              const success = await updateTask(
                                task.id,
                                updatedTask
                              );
                              setTasks(await getTasks());
                              toast.success("Task marked as completed!");
                              if (success) {
                                setTasks(await getTasks());
                                toast.success("Task marked as completed!");
                              }
                            }
                          }}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button onClick={() => setEditingTask(task)}>Edit</Button>
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteId(task.id!)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          </CardContent>
        </Card>
        {/* Edit Task Dialog */}
        {/* Edit Task Dialog */}
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task Title */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <Input
                    placeholder="Task Title"
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                  />
                </div>

                {/* Task Description */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Input
                    placeholder="Enter Description"
                    value={editingTask.description || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Assigned To */}
                {/* Assigned To (Full Width) */}
                <div className="flex flex-col col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Assign To
                  </label>
                  <Select
                    isMulti
                    options={employeeOptions}
                    value={employeeOptions.filter((option) =>
                      editingTask?.assigned_to.includes(option.value)
                    )}
                    onChange={(selectedOptions) =>
                      setEditingTask({
                        ...editingTask!,
                        assigned_to: selectedOptions.map(
                          (option) => option.value
                        ),
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Task Status */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <ShadSelect
                    value={editingTask.status}
                    onValueChange={(value) =>
                      setEditingTask({
                        ...editingTask,
                        status: value as Task["status"],
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </ShadSelect>
                </div>

                {/* Task Priority */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <ShadSelect
                    value={editingTask.priority}
                    onValueChange={(value) =>
                      setEditingTask({
                        ...editingTask,
                        priority: value as Task["priority"],
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </ShadSelect>
                </div>

                {/* Start Date */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={editingTask.start_date}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        start_date: e.target.value,
                      })
                    }
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={editingTask.end_date}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        end_date: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Location */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <ShadSelect
                    value={editingTask.location}
                    onValueChange={(value) =>
                      setEditingTask({ ...editingTask, location: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.location_name}>
                          {loc.location_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </ShadSelect>
                </div>

                {/* Task Category */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <ShadSelect
                    value={editingTask.category}
                    onValueChange={(value) =>
                      setEditingTask({ ...editingTask, category: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planting">Planting</SelectItem>
                      <SelectItem value="harvesting">Harvesting</SelectItem>
                      <SelectItem value="maintenance">
                        Equipment Maintenance
                      </SelectItem>
                      <SelectItem value="feeding">Feeding</SelectItem>
                    </SelectContent>
                  </ShadSelect>
                </div>

                {/* Notes */}
                <div className="flex flex-col col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <Input
                    placeholder="Enter additional notes"
                    value={editingTask.notes}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, notes: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setEditingTask(null)}
                className="mr-auto"
              >
                Cancel
              </Button>
              <div className="flex gap-2">

                <Button onClick={handleUpdateTask}>Update Task</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Task Dialog */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTask}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
