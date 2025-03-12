import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/Layout";
import Dashboard from "./pages/admin/Dashboard";
import Login from "./pages/LoginPage";
import AuthGuard from "./components/AuthGaurd";
import Documents from "./pages/admin/Documents";
import Timesheets from "./pages/admin/Timesheets";
import RecordTime from "./pages/employees/RecordTime";
import TimeReports from "./pages/employees/TimeReports";
import Expenses from "./pages/admin/Expenses";
import ExpenseDetail from "./pages/admin/ExpenseDetail";
import HarvestReports from "./pages/admin/HarvestReports";
import AdminUsers from "./pages/admin/Users";
import Locations from "./pages/admin/Locations";

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Login />} />

      {/* Dashboard Routes for Admins & Employees */}
      <Route
        path="/dashboard/*"
        element={
          <AuthGuard allowedRoles={["admin", "employee"]}>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="documents"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <Documents />
            </AuthGuard>
          }
        />
        <Route
          path="timesheets"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <Timesheets />
            </AuthGuard>
          }
        />
        <Route
          path="harvest-reports"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <HarvestReports />
            </AuthGuard>
          }
        />
        <Route
          path="expenses"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <Expenses />
            </AuthGuard>
          }
        />
        <Route
          path="expenses/:id"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <ExpenseDetail />
            </AuthGuard>
          }
        />
        <Route
          path="locations"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <Locations />
            </AuthGuard>
          }
        />
        <Route
          path="users"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <AdminUsers />
            </AuthGuard>
          }
        />
        <Route
          path="record-time"
          element={
            <AuthGuard allowedRoles={["employee"]}>
              <RecordTime />
            </AuthGuard>
          }
        />
        <Route
          path="time-reports"
          element={
            <AuthGuard allowedRoles={["employee"]}>
              <TimeReports />
            </AuthGuard>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
