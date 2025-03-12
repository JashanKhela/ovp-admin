import { useEffect, useState } from "react";
import { addExpense, getExpenses, uploadReceipt } from "@/services/expenses";
import { getCurrentUser } from "@/services/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Expense } from "@/lib/interfaces";
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
import { Progress } from "@/components/ui/progress";
import { expense_categories, payment_methods } from "@/lib/utils";

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expense, setExpense] = useState<Expense>({
    category: "",
    description: "",
    uploaded_by: "",
    amount: 0,
    expense_date: "",
    payment_method: "",
    receipt_url: null as string | null,
    notes: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [uploadProgress, setUploadProgress] = useState(0);

  // Pagination logic
  const totalPages = Math.ceil(expenses.length / pageSize);
  const paginatedExpenses = expenses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    const fetchExpenses = async () => {
      const data = await getExpenses();
      setExpenses(data);
    };
    fetchExpenses();
  }, []);

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setExpense({ ...expense, receipt_url: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    if (
      !expense.category ||
      !expense.amount ||
      !expense.expense_date ||
      !expense.payment_method
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    setLoading(true);
    setUploadProgress(0);
    const user = getCurrentUser();
    let receiptUrl = null;
  
    // Upload receipt with progress tracking
    if (expense.receipt_url) {
      receiptUrl = await uploadReceipt(
        expense.receipt_url as File,
        setUploadProgress
      );
    }
  
    const success = await addExpense({
      category: expense.category,
      amount: parseFloat(expense.amount.toString()),
      expense_date: expense.expense_date,
      payment_method: expense.payment_method,
      description: expense.description,
      uploaded_by: user.username,
      receipt_url: receiptUrl || null,
      notes: expense.notes,
    });
  
    setLoading(false);
    if (success) {
      setUploadProgress(0);
      toast.success("Expense added successfully!");
  
      // Reset form fields
      setExpense({
        category: "",
        amount: 0,
        expense_date: "",
        payment_method: "",
        description: "",
        receipt_url: null,
        uploaded_by: "",
        notes: "",
      });
  
      const updatedExpenses = await getExpenses();
      setExpenses(updatedExpenses);
    } else {
      toast.error("Error adding expense.");
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
        <p className="text-gray-600">
          Manage and track our business expenses. You can add new expenses,
          upload receipts, and review past entries.
        </p>
      </div>

      <Card className="mx-auto max-w-[350px] md:max-w-full mb-6">
        <CardHeader>
          <CardTitle>➕ Add An Expense Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <Input
                type="text"
                name="description"
                value={expense.description}
                onChange={(e) =>
                  handleInputChange(
                    e as React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >
                  )
                }
                placeholder="Enter description"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <Select
                name="category"
                value={expense.category}
                onValueChange={(value) =>
                  setExpense({ ...expense, category: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectContent>
                    {expense_categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Amount ($)
              </label>
              <Input
                type="number"
                name="amount"
                value={expense.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
              />
            </div>

            {/* Expense Date */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Expense Date
              </label>
              <Input
                type="date"
                name="expense_date"
                value={expense.expense_date}
                onChange={handleInputChange}
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <Select
                name="payment_method"
                value={expense.payment_method}
                onValueChange={(value) =>
                  setExpense({ ...expense, payment_method: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectContent>
                    {payment_methods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectContent>
              </Select>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Upload Receipt (Optional)
              </label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Textarea
                name="notes"
                value={expense.notes}
                onChange={handleInputChange}
                placeholder="Enter notes about this expense"
              />
            </div>
            {uploadProgress > 0 && (
              <Progress value={uploadProgress} className="mt-2" />
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Uploading..." : "Submit Expense"}
          </Button>
        </CardFooter>
      </Card>
      <Card className="mx-auto max-w-[350px] md:max-w-full mt-6">
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExpenses.length > 0 ? (
                  paginatedExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.description}</TableCell>

                      <TableCell>{expense.expense_date}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>${expense.amount.toFixed(2)}</TableCell>
                      <TableCell>{expense.payment_method}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          onClick={() =>
                            (window.location.href = `/dashboard/expenses/${expense.id}`)
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No expenses recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
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
    </div>
  );
}
