import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingTimesheets } from "@/services/timesheets";
import { getRecentExpenses } from "@/services/expenses";
import { getRecentTimesheets } from "@/services/timesheets";

import { Timer, BadgeDollarSign, CircleDashed } from "lucide-react";
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
import { Expense } from "@/lib/interfaces";

export default function Dashboard() {
  const [pendingTimesheets, setPendingTimesheets] = useState<
    PendingTimeSheet[]
  >([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [recentTimesheets, setRecentTimesheets] = useState<PendingTimeSheet[]>(
    []
  );

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingTimesheets = async () => {
      const pending = await getPendingTimesheets();
      setPendingTimesheets(pending.slice(0, 5)); // Show only the latest 5
    };

    fetchPendingTimesheets();
  }, []);

  useEffect(() => {
    const fetchRecentExpenses = async () => {
      const expenses = await getRecentExpenses();
      setRecentExpenses(expenses.slice(0, 5)); // Show only the latest 5
    };

    fetchRecentExpenses();
  }, []);

  useEffect(() => {
    const fetchRecentTimesheets = async () => {
      const timesheets = await getRecentTimesheets();
      setRecentTimesheets(timesheets);
    };

    fetchRecentTimesheets();
  }, []);

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Welcome, Admin!</h1>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Timesheets Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-row items-center gap-2">
              <Timer /> Recent Time Sheets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTimesheets.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTimesheets.map((entry) => (
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
              </div>
            ) : (
              <p className="text-gray-500">No recent timesheets.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/dashboard/timesheets")}>
              View All Time Sheets
            </Button>
          </CardFooter>
        </Card>

        {/* Pending Approvals Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-row items-center gap-2">
              <CircleDashed /> Time Sheets Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTimesheets.length > 0 ? (
              <>
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
                <Button onClick={() => navigate("/dashboard/timesheets")}>
                  Review All
                </Button>
              </>
            ) : (
              <p className="text-gray-500">No pending approvals.</p>
            )}
          </CardContent>
        </Card>
        {/* Recent Expenses Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-row items-center gap-2">
              {" "}
              <BadgeDollarSign /> Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="min-w-full overflow-x-scroll">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentExpenses.map((expense: Expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.expense_date}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>${expense.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-gray-500">No recent expenses.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/dashboard/expenses")}>
              View All Expenses
            </Button>
          </CardFooter>
        </Card>

        {/* More cards will go here later */}
      </div>
    </>
  );
}
