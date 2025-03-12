import { useEffect, useState } from "react";
import {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
} from "@/services/locations";
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
import { toast } from "sonner";
import { SiteLocation, UpdateLocation } from "@/lib/interfaces";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function Locations() {
  const [locations, setLocations] = useState<SiteLocation[]>([]);
  const [newLocation, setNewLocation] = useState<Partial<SiteLocation>>({
    location_name: "",
    location_description: "",
    location_lat: 0,
    location_long: 0,
    year_purchased: 0,
    location_size: "",
  });
  const [editingLocation, setEditingLocation] = useState<UpdateLocation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(locations.length / pageSize);

  const paginatedLocations = locations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


  useEffect(() => {
    const fetchData = async () => {
      setLocations(await getLocations());
    };
    fetchData();
  }, []);

  const handleAddLocation = async () => {
    if (!newLocation.location_name) {
      toast.error("Location Name is required.");
      return;
    }
  
    const success = await addLocation({
      ...newLocation,
      location_lat: newLocation.location_lat ? parseFloat(newLocation.location_lat.toString()) : null,
      location_long: newLocation.location_long ? parseFloat(newLocation.location_long.toString()) : null,
      year_purchased: newLocation.year_purchased ? parseInt(newLocation.year_purchased.toString()) : null,
    } as SiteLocation);
  
    if (success) {
        const updateLocations = await getLocations();

      setLocations(updateLocations);
      setNewLocation({
        location_name: "",
        location_description: "",
        location_lat: 0,
        location_long: 0,
        year_purchased: 0,
        location_size: "",
      });
      toast.success("Location added successfully!");
    } else {
      toast.error("Failed to add location.");
    }
  };
  

  const handleUpdateLocation = async () => {
    if (!editingLocation?.id) return;
    const success = await updateLocation(editingLocation.id, editingLocation);
    if (success) {
      setLocations(await getLocations());
      setEditingLocation(null); // Close modal
      toast.success("Location updated successfully!");
    } else {
      toast.error("Failed to update location.");
    }
  };
  

  const handleDeleteLocation = async () => {
    if (!deleteId) return;
    const success = await deleteLocation(deleteId);
    if (success) {
      setLocations(await getLocations());
      toast.success("Location deleted successfully!");
    } else {
      toast.error("Failed to delete location.");
    }
    setDeleteId(null); // Close modal
  };
  

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Farm Locations</h1>
        <p className="text-gray-600">Add, edit, or remove farm locations.</p>
      </div>

      {/* Add Location Form */}
      <Card className="max-w-[350px] md:max-w-full mb-6">
        <CardHeader>
          <CardTitle>➕ Add New Location</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Location Name"
            value={newLocation.location_name || ""}
            onChange={(e) =>
              setNewLocation({ ...newLocation, location_name: e.target.value })
            }
          />
          <Input
            placeholder="Description"
            value={newLocation.location_description || ""}
            onChange={(e) =>
              setNewLocation({
                ...newLocation,
                location_description: e.target.value,
              })
            }
          />
          <Input
            type="number"
            placeholder="Latitude"
            value={newLocation.location_lat || ""}
            onChange={(e) =>
              setNewLocation({
                ...newLocation,
                location_lat: parseFloat(e.target.value),
              })
            }
          />
          <Input
            type="number"
            placeholder="Longitude"
            value={newLocation.location_long || ""}
            onChange={(e) =>
              setNewLocation({
                ...newLocation,
                location_long: parseFloat(e.target.value),
              })
            }
          />
          <Input
            type="number"
            placeholder="Year Purchased"
            value={newLocation.year_purchased || ""}
            onChange={(e) =>
              setNewLocation({
                ...newLocation,
                year_purchased: parseInt(e.target.value),
              })
            }
          />
          <Input
            placeholder="Location Size"
            value={newLocation.location_size || ""}
            onChange={(e) =>
              setNewLocation({
                ...newLocation,
                location_size: e.target.value,
              })
            }
          />
          <Button onClick={handleAddLocation}>Add Location</Button>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <Card className="max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLocations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell>{loc.location_name}</TableCell>
                  <TableCell>{loc.location_description}</TableCell>
                  <TableCell>{loc.location_size}</TableCell>
                  <TableCell>{loc.year_purchased || "N/A"}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button onClick={() => setEditingLocation(loc)}>
                       Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteId(loc.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Edit Location Dialog */}
      <Dialog
        open={!!editingLocation}
        onOpenChange={() => setEditingLocation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          {editingLocation && (
            <div className="grid grid-cols-1 gap-4">
              <Input
                placeholder="Location Name"
                value={editingLocation.location_name || ""}
                onChange={(e) =>
                  setEditingLocation({
                    ...editingLocation,
                    location_name: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Description"
                value={editingLocation.location_description || ""}
                onChange={(e) =>
                  setEditingLocation({
                    ...editingLocation,
                    location_description: e.target.value,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Latitude"
                value={editingLocation.location_lat || ""}
                onChange={(e) =>
                  setEditingLocation({
                    ...editingLocation,
                    location_lat: parseFloat(e.target.value),
                  })
                }
              />
              <Input
                type="number"
                placeholder="Longitude"
                value={editingLocation.location_long || ""}
                onChange={(e) =>
                  setEditingLocation({
                    ...editingLocation,
                    location_long: parseFloat(e.target.value),
                  })
                }
              />
              <Input
                type="number"
                placeholder="Year Purchased"
                value={editingLocation.year_purchased || ""}
                onChange={(e) =>
                  setEditingLocation({
                    ...editingLocation,
                    year_purchased: parseInt(e.target.value),
                  })
                }
              />
              <Input
                placeholder="Location Size"
                value={editingLocation.location_size || ""}
                onChange={(e) =>
                  setEditingLocation({
                    ...editingLocation,
                    location_size: e.target.value,
                  })
                }
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLocation(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLocation}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this location? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLocation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
