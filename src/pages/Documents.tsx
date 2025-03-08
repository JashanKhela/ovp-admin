import { useEffect, useState } from "react";
import {
  deleteDocument,
  getAllDocuments,
  uploadDocument,
} from "@/services/storage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Document } from "../lib/interfaces";
import { DocumentPageSize, predefinedTags } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function Documents() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedUploader, setSelectedUploader] = useState("");
  const [filteredTag, setFilteredTag] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = DocumentPageSize; // Number of items per page

  useEffect(() => {
    const fetchDocuments = async () => {
      const files = await getAllDocuments();
      setDocuments(files);
    };
    fetchDocuments();
  }, []);

  const filteredDocuments = documents
    .filter((doc) => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((doc) =>
      selectedUploader && selectedUploader !== "all"
        ? doc.uploadedBy === selectedUploader
        : true
    )
    .filter((doc) =>
      filteredTag && filteredTag !== "all" ? doc.tag === filteredTag : true
    );

  const totalPages = Math.ceil(filteredDocuments.length / pageSize);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleUpload = async () => {
    if (!selectedFile || !selectedTag) return;

    setUploading(true);
    setProgress(0);

    const uploadedDoc = await uploadDocument(
      selectedFile,
      selectedTag,
      setProgress
    );

    if (uploadedDoc) {
      setDocuments((prev) => [...prev, uploadedDoc]);
      setSelectedFile(null);
      setSelectedTag(null);
    }

    setUploading(false);
    setProgress(0);
  };

  const handleDelete = async (filePath: string) => {
    setDeleting(filePath);

    const success = await deleteDocument(filePath);
    if (success) {
      setDocuments((prev) => prev.filter((doc) => doc.path !== filePath));
    }

    setDeleting(null);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-gray-600">Upload and manage your documents.</p>
      </div>

      {/* Upload Document Card */}
      <Card className="max-w-[350px] md:max-w-full mb-6">
        <CardHeader>
          <CardTitle>➕ Upload A Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              {selectedFile ? selectedFile.name : "Select File"}
            </Button>
            <Select value={selectedTag || ""} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full md:w-auto">
                <SelectValue placeholder="Select a Tag" />
              </SelectTrigger>
              <SelectContent>
                {predefinedTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full md:w-auto"
              disabled={!selectedFile || !selectedTag || uploading}
              onClick={handleUpload}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          {uploading && <Progress value={progress} max={100} className="mt-4" />}
        </CardContent>
      </Card>

      {/* Documents List Card */}
      <Card className="max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={selectedUploader} onValueChange={setSelectedUploader}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Uploader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Uploaders</SelectItem>
                    {[...new Set(documents.map((doc) => doc.uploadedBy))].map(
                      (uploader) => (
                        <SelectItem key={uploader} value={uploader}>
                          {uploader}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <Select value={filteredTag} onValueChange={setFilteredTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {predefinedTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead>Uploaded Date</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDocuments.map((doc) => (
                      <TableRow key={doc.path}>
                        <TableCell className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{doc.name}</TableCell>
                        <TableCell className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{doc.tag || "No Tag"}</TableCell>
                        <TableCell>{doc.uploadedAt}</TableCell>
                        <TableCell>{doc.uploadedBy}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell className="flex gap-2">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">View</Button>
                          </a>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(doc.path)}
                            disabled={deleting === doc.path}
                          >
                            {deleting === doc.path ? "Deleting..." : "Delete"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} />
                  </PaginationItem>
                  <PaginationItem>Page {currentPage} of {totalPages}</PaginationItem>
                  <PaginationItem>
                    <PaginationNext onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          ) : (
            <p className="text-gray-500 text-center">No documents available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
