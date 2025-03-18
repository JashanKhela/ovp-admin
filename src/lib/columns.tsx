"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeTo12Hour } from "@/lib/utils";
import { TimesheetEntry } from "@/lib/interfaces";

export const timesheetColumns: ColumnDef<TimesheetEntry>[] = [
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        First Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span>{row.getValue("first_name")}</span>,
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Last Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span>{row.getValue("last_name")}</span>,
  },
  {
    accessorKey: "date_tracked",
    header: "Date",
    cell: ({ row }) => <span>{row.getValue("date_tracked")}</span>,
  },
  {
    accessorKey: "start_time",
    header: "Start Time",
    cell: ({ row }) => <span>{formatTimeTo12Hour(row.getValue("start_time"))}</span>,
  },
  {
    accessorKey: "end_time",
    header: "End Time",
    cell: ({ row }) => <span>{formatTimeTo12Hour(row.getValue("end_time"))}</span>,
  },
  {
    accessorKey: "lunch_break_minutes",
    header: "Lunch (min)",
    cell: ({ row }) => <span>{row.getValue("lunch_break_minutes") || "0"} min</span>,
  },
  {
    accessorKey: "hours_worked",
    header: "Hours Worked",
    cell: ({ row }) => <span>{row.getValue("hours_worked")}</span>,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => <span>{row.getValue("location")}</span>,
  },
  {
    accessorKey: "approval_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("approval_status") as string;
      return (
        <span
          className={`px-3 py-1 rounded-md text-sm font-semibold ${
            status === "Approved"
              ? "bg-green-100 text-green-800"
              : status === "Rejected"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status}
        </span>
      );
    },
  },
];
