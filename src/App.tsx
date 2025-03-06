import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/LoginPage";
import AuthGuard from "./components/AuthGaurd";
import Documents from "./pages/Documents";
import Timesheets from "./pages/Timesheets"; 
import RecordTime from "./pages/RecordTime";

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
        <Route path="documents" element={<Documents />} />

        <Route
          path="timesheets"
          element={
            <AuthGuard allowedRoles={["admin"]}> 
              <Timesheets />
            </AuthGuard>
          }
        />
              <Route
  path="record-time" // ✅ Changed from absolute to relative path
  element={
    <AuthGuard allowedRoles={["employee"]}> 
      <RecordTime />
    </AuthGuard>
  }
/>
      </Route>


    </Routes>
  );
}

export default App;
