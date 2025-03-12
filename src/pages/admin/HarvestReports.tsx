import { useEffect, useState } from "react";
import {
  getHarvestReports,
  addHarvestReport,
  deleteHarvestReport,
} from "@/services/harvestReports";
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
import { toast } from "sonner";
import { getCurrentUser } from "@/services/auth";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HarvestReport, SiteLocation } from "@/lib/interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FRUITS } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getLocations } from "@/services/locations";

export default function HarvestReports() {
  const [reports, setReports] = useState<HarvestReport[]>([]);
  const [newReport, setNewReport] = useState<HarvestReport>({
    fruit: "",
    variety: "",
    bins_harvested: 0,
    pounds_harvested: 0,
    harvest_location: "",
    harvest_date: "",
    notes: "",
    uploaded_by: "",
    shipped_to: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedFruit, setSelectedFruit] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [locations, setLocations] = useState<SiteLocation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredReports = reports
    .filter((report) =>
      selectedLocation === "all"
        ? true
        : report.harvest_location === selectedLocation
    )
    .filter((report) =>
      selectedFruit === "all" ? true : report.fruit === selectedFruit
    )
    .filter((report) => {
      const reportDate = new Date(report.harvest_date);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      return (
        (!startDate || reportDate >= startDate) &&
        (!endDate || reportDate <= endDate)
      );
    });

  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    const fetchData = async () => {
      setReports(await getHarvestReports());
      setLocations(await getLocations());
    };
    fetchData();
  }, []);

  const handleAddReport = async () => {
    if (
      !newReport.fruit ||
      !newReport.variety ||
      !newReport.bins_harvested ||
      !newReport.pounds_harvested ||
      !newReport.harvest_location
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      toast.error("You must be logged in to add a report.");
      return;
    }

    const success = await addHarvestReport({
      ...newReport,
      uploaded_by: user.username,
    });
    if (success) {
      setReports(await getHarvestReports());
      setNewReport({
        fruit: "",
        variety: "",
        bins_harvested: 0,
        pounds_harvested: 0,
        harvest_location: "",
        harvest_date: "",
        notes: "",
        uploaded_by: user.username,
        shipped_to: "",
      });
    }
  };

  const handleDeleteReport = async () => {
    if (!deleteId) return;
    const success = await deleteHarvestReport(deleteId);
    if (success) {
      setReports(await getHarvestReports());
    }
    setDeleteId(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Harvest Reports</h1>
        <p className="text-gray-600">Track harvested fruit and details.</p>
      </div>

      <Card className="mb-6 max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>➕ Add New Harvest Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Harvest Date
              </label>
              <Input
                type="date"
                value={newReport.harvest_date || ""}
                onChange={(e) =>
                  setNewReport({ ...newReport, harvest_date: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Fruit</label>
              <Select
                value={newReport.fruit}
                onValueChange={(value) =>
                  setNewReport({ ...newReport, fruit: value, variety: "" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Fruit" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(FRUITS).map((fruit) => (
                    <SelectItem key={fruit} value={fruit}>
                      {fruit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Variety
              </label>
              <Select
                value={newReport.variety}
                onValueChange={(value) =>
                  setNewReport({ ...newReport, variety: value })
                }
                disabled={!newReport.fruit}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Variety" />
                </SelectTrigger>
                <SelectContent>
                  {(FRUITS[newReport.fruit as keyof typeof FRUITS] || []).map(
                    (variety) => (
                      <SelectItem key={variety} value={variety}>
                        {variety}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Bins Harvested
              </label>
              <Input
                type="number"
                placeholder="Enter bins harvested"
                value={newReport.bins_harvested}
                onChange={(e) =>
                  setNewReport({
                    ...newReport,
                    bins_harvested: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Pounds Harvested
              </label>
              <Input
                type="number"
                placeholder="Enter pounds harvested"
                value={newReport.pounds_harvested}
                onChange={(e) =>
                  setNewReport({
                    ...newReport,
                    pounds_harvested: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Harvest Location
              </label>
              <Select
                name="location"
                value={newReport.harvest_location}
                onValueChange={(value) =>
                  setNewReport({ ...newReport, harvest_location: value })
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
              </Select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Shipped To (Optional)
              </label>
              <Input
                placeholder="Enter recipient"
                value={newReport.shipped_to}
                onChange={(e) =>
                  setNewReport({ ...newReport, shipped_to: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <Input
                placeholder="Enter additional notes"
                value={newReport.notes}
                onChange={(e) =>
                  setNewReport({ ...newReport, notes: e.target.value })
                }
              />
            </div>
            <Button className="md:mt-5" onClick={handleAddReport}>
              Add Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>Harvest Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Fruit Filter */}
              <div className="flex flex-col">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="fruit-filter"
                >
                  Filter by Fruit
                </label>
                <Select value={selectedFruit} onValueChange={setSelectedFruit}>
                  <SelectTrigger id="fruit-filter" className="w-full">
                    <SelectValue placeholder="Select Fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fruits</SelectItem>
                    {Object.keys(FRUITS).map((fruit) => (
                      <SelectItem key={fruit} value={fruit}>
                        {fruit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="flex flex-col">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="location-filter"
                >
                  Filter by Location
                </label>
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger id="location-filter" className="w-full">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.location_name}>
                        {loc.location_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="start-date"
                  >
                    Start Date
                  </label>
                  <Input
                    id="start-date"
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
                    htmlFor="end-date"
                  >
                    End Date
                  </label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Fruit</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Bins</TableHead>
                  <TableHead>Pounds</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Harvest Date</TableHead>
                  <TableHead>Shipped To</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReports.length > 0 ? (
                  paginatedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.fruit}</TableCell>
                      <TableCell>{report.variety}</TableCell>
                      <TableCell>{report.bins_harvested}</TableCell>
                      <TableCell>{report.pounds_harvested}</TableCell>
                      <TableCell>{report.harvest_location}</TableCell>
                      <TableCell>{report.harvest_date}</TableCell>
                      <TableCell>{report.shipped_to || "N/A"}</TableCell>
                      <TableCell>{report.uploaded_by}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteId(report.id!)}
                        >
                          🗑 Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this report? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReport}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
