import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  deleteExpense,
  getExpenseById,
  updateExpense,
} from "@/services/expenses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Expense } from "@/lib/interfaces";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { expense_categories, payment_methods } from "@/lib/utils";

export default function ExpenseDetail() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { id } = useParams(); // Get expense ID from URL
  const [expense, setExpense] = useState<Expense>({
    id: "",
    expense_date: "",
    category: "",
    amount: 0,
    payment_method: "",
    description: "",
    uploaded_by: "",
    notes: "",
    receipt_url: "",
  });
  const [editData, setEditData] = useState<Expense | null>(null);

  useEffect(() => {
    if (editDialogOpen && expense) {
      setEditData({ ...expense });
    }
  }, [editDialogOpen, expense]);

  useEffect(() => {
    const fetchExpense = async () => {
      if (!id) return;
      const data = await getExpenseById(id);
      if (data) {
        console.log(data);
        setExpense(data);
      }
    };
    fetchExpense();
  }, [id]);

  if (!expense) {
    return (
      <p className="text-center text-gray-500">Loading expense details...</p>
    );
  }

  return (
    <div className="container mx-auto p-6 ">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Expense Details</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between mt-4">
        <Button variant="outline" onClick={() => window.history.back()}>
    Back
  </Button>
  <div className="flex gap-2">

    <Button onClick={() => setEditDialogOpen(true)}>Edit</Button>
    <Button
      variant="destructive"
      onClick={() => setDeleteDialogOpen(true)}
    >
      Delete
    </Button>
  </div>
</CardContent>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-lg">
              <strong>Date:</strong> {expense.expense_date}
            </p>
            <p className="text-lg">
              <strong>Category:</strong> {expense.category}
            </p>
            <p className="text-lg">
              <strong>Amount:</strong> ${expense.amount.toFixed(2)}
            </p>
            <p className="text-lg">
              <strong>Payment Method:</strong> {expense.payment_method}
            </p>
          </div>
          <div>
            <p className="text-lg">
              <strong>Description:</strong> {expense.description || "N/A"}
            </p>
            <p className="text-lg">
              <strong>Uploaded By:</strong> {expense.uploaded_by}
            </p>
            <p className="text-lg">
              <strong>Notes:</strong> {expense.notes || "No additional notes"}
            </p>
          </div>
        </CardContent>

        {expense.receipt_url && (
          <CardContent className="flex flex-col items-center">
            <p className="text-lg font-semibold">Receipt:</p>
            <div className="border rounded-lg overflow-hidden max-w-xl">
              <img
                src={
                  typeof expense.receipt_url === "string" &&
                  expense.receipt_url.startsWith("http")
                    ? expense.receipt_url
                    : `${import.meta.env.VITE_SUPABASE_STORAGE_URL!}receipts/${
                        expense.receipt_url
                      }`
                }
                alt="Receipt Image"
                className="w-full object-cover"
              />
            </div>
            <a
              href={
                typeof expense.receipt_url === "string" &&
                expense.receipt_url.startsWith("http")
                  ? expense.receipt_url
                  : `${import.meta.env.VITE_SUPABASE_STORAGE_URL!}receipts/${
                      expense.receipt_url
                    }`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-blue-500 hover:underline"
            >
              View Full Receipt
            </a>
          </CardContent>
        )}

      </Card>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✏️ Edit Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {/* Amount */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Amount ($)
              </label>
              <Input
                type="number"
                value={editData?.amount || 0}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    amount: parseFloat(e.target.value) || 0,
                    category: editData?.category || "",
                    description: editData?.description || "",
                    expense_date: editData?.expense_date || "",
                    payment_method: editData?.payment_method || "",
                    uploaded_by: editData?.uploaded_by || "",
                    receipt_url: editData?.receipt_url || "",
                    notes: editData?.notes || "",
                  } as Expense)
                }
              />
            </div>

            {/* Category */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <Select
                value={editData?.category || ""}
                onValueChange={(value) =>
                  setEditData({
                    ...editData,
                    category: value || "",
                    description: editData?.description || "",
                    amount: editData?.amount || 0,
                    expense_date: editData?.expense_date || "",
                    payment_method: editData?.payment_method || "",
                    uploaded_by: editData?.uploaded_by || "",
                    receipt_url: editData?.receipt_url || "",
                    notes: editData?.notes || "",
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {expense_categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <Select
                value={editData?.payment_method || ""}
                onValueChange={(value) =>
                  setEditData({
                    ...editData,
                    payment_method: value || "",
                    category: editData?.category || "",
                    description: editData?.description || "",
                    amount: editData?.amount || 0,
                    expense_date: editData?.expense_date || "",
                    uploaded_by: editData?.uploaded_by || "",
                    receipt_url: editData?.receipt_url || "",
                    notes: editData?.notes || "",
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  {payment_methods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                value={editData?.description || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    description: e.target.value || "",
                    category: editData?.category || "",
                    amount: editData?.amount || 0,
                    expense_date: editData?.expense_date || "",
                    payment_method: editData?.payment_method || "",
                    uploaded_by: editData?.uploaded_by || "",
                    receipt_url: editData?.receipt_url || "",
                    notes: editData?.notes || "",
                  })
                }
                placeholder="Enter details about this expense"
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Textarea
                value={editData?.notes || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    notes: e.target.value || "",
                    category: editData?.category || "",
                    description: editData?.description || "",
                    amount: editData?.amount || 0,
                    expense_date: editData?.expense_date || "",
                    payment_method: editData?.payment_method || "",
                    uploaded_by: editData?.uploaded_by || "",
                    receipt_url: editData?.receipt_url || "",
                  })
                }
                placeholder="Additional notes"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!expense.id) {
                  toast.error("Error updating expense: Invalid ID.");
                  return;
                }
                if (!editData) {
                  toast.error("Error updating expense: No data to update.");
                  return;
                }
                const success = await updateExpense(expense.id, editData);
                if (success) {
                  setExpense(editData);
                  toast.success("Expense updated successfully!");
                  setEditDialogOpen(false);
                } else {
                  toast.error("Error updating expense.");
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this expense? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!expense.id) {
                  toast.error("Error deleting expense: Invalid ID.");
                  return;
                }
                const success = await deleteExpense(expense.id);
                if (success) {
                  toast.success("Expense deleted!");
                  window.location.href = "/dashboard/expenses";
                } else {
                  toast.error("Error deleting expense.");
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
