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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Document } from "../lib/interfaces";
import { predefinedTags } from "@/lib/utils";
import { Input } from "@/components/ui/input";
export default function Documents() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedUploader, setSelectedUploader] = useState("");
  const [filteredTag, setFilteredTag] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
  // Handle file selection and upload
  const handleUpload = async () => {
    if (!selectedFile || !selectedTag) return;

    setUploading(true);
    setProgress(0);

    // Upload the file with the selected tag
    const uploadedDoc = await uploadDocument(
      selectedFile,
      selectedTag,
      setProgress
    );

    if (uploadedDoc) {
      setDocuments((prev) => [...prev, uploadedDoc]);
      setSelectedFile(null); // Reset file selection
      setSelectedTag(null); // Reset tag selection
    }

    setUploading(false);
    setProgress(0);
  };

  // 🟢 Handle File Deletion
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

      <Card className="w-full">
        <CardHeader>
          <CardTitle>📂 Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {/* File Upload Section */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full mb-6">
            <div className="flex flex-wrap gap-2"></div>
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


            {uploading && (
              <Progress value={progress} max={100} className="w-full" />
            )}
          </div>

          {/* Document Table */}
          {documents.length > 0 ? (
            <div className="container mx-auto p-4 max-w-[300px] md:max-w-full overflow-x-auto">
              {/* Scrollable Table Wrapper */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Search Bar */}
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Filter by Uploader */}
                <Select
                  value={selectedUploader}
                  onValueChange={setSelectedUploader}
                >
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

                {/* Filter by Tag */}
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
              <div className="overflow-x-auto w-full">
                <Table className="w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px] truncate">
                        File Name
                      </TableHead>
                      <TableHead className="w-[100px] truncate">Tags</TableHead>

                      <TableHead className="w-[150px] truncate">
                        Uploaded Date
                      </TableHead>
                      <TableHead className="w-[150px] truncate">
                        Uploaded By
                      </TableHead>
                      <TableHead className="w-[100px] truncate">Size</TableHead>

                      <TableHead className="w-[200px] truncate">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc, index) => (
                      <TableRow key={index} className="w-full">
                        <TableCell className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {doc.name}
                        </TableCell>
                        <TableCell>{doc.tag || "No Tag"}</TableCell>
                        <TableCell className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {doc.uploadedAt}
                        </TableCell>
                        <TableCell className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {doc.uploadedBy}
                        </TableCell>
                        <TableCell className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {doc.size}
                        </TableCell>
                        <TableCell className="max-w-[200px] flex gap-2">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline">
                              View
                            </Button>
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
            </div>
          ) : (
            <p className="text-gray-500 text-center">No documents available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
