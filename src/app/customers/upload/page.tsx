"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Upload } from "lucide-react";
import Link from "next/link";

export default function BulkUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/customers/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload customers");
      }

      setResults(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCredentials = () => {
    if (!results || !results.results.success.length) return;

    const csv = [
      ["Name", "Email", "Password"].join(","),
      ...results.results.success.map((item: any) =>
        [
          item.credentials.name,
          item.credentials.email,
          item.credentials.password,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer-credentials.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Bulk Upload Customers</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Excel Format Requirements:</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Column A: Name</li>
              <li>Column B: Email Address</li>
              <li>Column C: Contact Number</li>
              <li>Column D: Address</li>
            </ul>
            <p className="text-sm mt-2 text-muted-foreground">
              First row should be headers. Passwords will be auto-generated.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  cursor-pointer"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading || !file}>
                <Upload className="mr-2 h-4 w-4" />
                {loading ? "Uploading..." : "Upload"}
              </Button>
              <Link href="/customers">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {results && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{results.summary.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.summary.success}
                </div>
                <div className="text-sm text-muted-foreground">Success</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results.summary.failed}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {results.summary.success > 0 && (
              <Button onClick={downloadCredentials} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Credentials CSV
              </Button>
            )}

            {results.results.failed.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Failed Rows:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {results.results.failed.map((item: any) => (
                    <div
                      key={item.row}
                      className="text-sm bg-red-50 p-2 rounded"
                    >
                      Row {item.row}: {item.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => router.push("/customers")} className="w-full">
              Back to Customers
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
