import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingTimesheets } from "@/services/timesheets";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PendingTimeSheet } from "@/lib/interfaces";

export default function Dashboard() {
  const [pendingTimesheets, setPendingTimesheets] = useState<
    PendingTimeSheet[]
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingTimesheets = async () => {
      const pending = await getPendingTimesheets();
      setPendingTimesheets(pending.slice(0, 5)); // Show only the latest 5
    };

    fetchPendingTimesheets();
  }, []);

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Welcome, Admin!</h1>

      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Card */}
        <Card>
          <CardHeader>
            <CardTitle>Time Sheets Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTimesheets.length > 0 ? (
              <ScrollArea className="h-40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Horas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTimesheets.map((entry: PendingTimeSheet) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {entry.first_name} {entry.last_name}
                        </TableCell>
                        <TableCell>{entry.date_tracked}</TableCell>
                        <TableCell>{entry.hours_worked} hrs</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <p className="text-gray-500">No pending approvals.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/dashboard/timesheets")}>
              Review All
            </Button>
          </CardFooter>
        </Card>

        {/* More cards will go here later */}
      </div>
    </>
  );
}
