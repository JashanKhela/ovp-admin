import { useEffect, useState } from "react";
import { getUsers, addUser, resetUserPassword } from "@/services/users";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "@/lib/interfaces";
import { formatDate } from "@/lib/utils";
import { Key } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ username: "", password: "", first_name: "", last_name: "", role: "employee" });
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setUsers(await getUsers());
    };
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.first_name || !newUser.last_name) {
      toast.error("Please fill in all fields.");
      return;
    }

    const success = await addUser(newUser);
    if (success) {
      setUsers(await getUsers());
      setNewUser({ username: "", password: "", first_name: "", last_name: "", role: "employee" });
      toast.success("User added successfully!");
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordId || !newPassword) return;

    const success = await resetUserPassword(resetPasswordId, newPassword);
    if (success) {
      toast.success("Password reset successfully!");
    }
    setResetPasswordId(null);
    setNewPassword("");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600">Manage all admin and employee accounts.</p>
      </div>

      <Card className="mb-6 max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>➕ Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <Input type="text" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <Input type="text" value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <Input type="text" value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="md:mt-5" onClick={handleAddUser}>
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{formatDate(user.last_login ?? null) || "Never"}</TableCell>
                    <TableCell>
                      <Button onClick={() => setResetPasswordId(user.id)}>
                        <Key />
                        Reset Password
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!resetPasswordId} onOpenChange={() => setResetPasswordId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordId(null)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
