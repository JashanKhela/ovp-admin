import { useMemo, useState } from "react";
import { HarvestReport } from "@/lib/interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BIN_WEIGHT_LB } from "@/lib/utils";

interface Props {
  reports: HarvestReport[];
}

export default function ReportsBreakdown({ reports }: Props) {
  const uniqueYears = useMemo(() => {
    const years = new Set<string>();
    reports.forEach((r) => {
      years.add(new Date(r.harvest_date).getFullYear().toString());
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [reports]);

  const [year, setYear] = useState<string | null>(null);
  const [location, setLocation] = useState("all");
  const [fruit, setFruit] = useState("all");
  const [variety, setVariety] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;


  const filtered = useMemo(() => {
    setCurrentPage(1); // reset on filter change
    return reports.filter((r) => {
      const rYear = new Date(r.harvest_date).getFullYear().toString();
      const matchesYear = year ? rYear === year : false;
      const matchesLocation =
        location === "all" || r.harvest_location === location;
      const matchesFruit = fruit === "all" || r.fruit === fruit;
      const matchesVariety = variety === "all" || r.variety === variety;
      return matchesYear && matchesLocation && matchesFruit && matchesVariety;
    });
  }, [reports, year, location, fruit, variety]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const summary = useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.bins += r.bins_harvested;
        acc.pounds += r.pounds_harvested;
        acc.net += r.pounds_harvested - r.bins_harvested * BIN_WEIGHT_LB;
        return acc;
      },
      { bins: 0, pounds: 0, net: 0 }
    );
  }, [filtered]);

  const allFruits = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => set.add(r.fruit));
    return Array.from(set);
  }, [reports]);

  const allVarieties = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => set.add(r.variety));
    return Array.from(set);
  }, [reports]);

  const allLocations = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => set.add(r.harvest_location));
    return Array.from(set);
  }, [reports]);

  return (
    <div className="mt-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Year</label>
          <Select value={year || ""} onValueChange={setYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {uniqueYears.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Location</label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {allLocations.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Fruit</label>
          <Select value={fruit} onValueChange={setFruit}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Fruits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {allFruits.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Variety</label>
          <Select value={variety} onValueChange={setVariety}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Varieties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {allVarieties.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {year && (
        <>
          <div className="mb-4 font-medium text-gray-800">
            {filtered.length === 0 ? (
              <p>No data found for selected filters.</p>
            ) : (
              <p>
                In {year}, you harvested{" "}
                <span className="font-bold text-blue-600">
                  {summary.net.toLocaleString()} lbs (net)
                </span>{" "}
                of{" "}
                <span className="font-bold">
                  {fruit !== "all" ? fruit : "fruit"}
                </span>{" "}
                {variety !== "all" && `(${variety})`}{" "}
                {location !== "all" && `at ${location}`}.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-6 mb-4 mt-4 text-right text-sm md:text-base font-semibold text-gray-800">
            <div>
              Total Bins:{" "}
              <span className="text-blue-600">
                {summary.bins.toLocaleString()}
              </span>
            </div>
            <div>
              Gross Pounds:{" "}
              <span className="text-green-600">
                {summary.pounds.toLocaleString()}
              </span>
            </div>
            <div>
              Net Pounds:{" "}
              <span className="text-amber-600">
                {summary.net.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}

      {paginated.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Fruit</TableHead>
                <TableHead>Variety</TableHead>
                <TableHead>Bins</TableHead>
                <TableHead>Gross lbs</TableHead>
                <TableHead>Net lbs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.harvest_date}</TableCell>
                  <TableCell>{r.harvest_location}</TableCell>
                  <TableCell>{r.fruit}</TableCell>
                  <TableCell>{r.variety}</TableCell>
                  <TableCell>{r.bins_harvested}</TableCell>
                  <TableCell>{r.pounds_harvested.toLocaleString()}</TableCell>
                  <TableCell>
                    {(
                      r.pounds_harvested -
                      r.bins_harvested * BIN_WEIGHT_LB
                    ).toLocaleString()}
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
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "disabled" : ""}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    Page {currentPage} of {totalPages}
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      isActive={currentPage < totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
