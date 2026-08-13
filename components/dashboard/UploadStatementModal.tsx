"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  FileText,
  Lock,
  KeyRound,
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  AlertTriangle,
  Layers,
  ArrowRight
} from "lucide-react";
import { 
  parseBankStatementCSV, 
  StatementParseResult, 
  ParsedTransactionRow, 
  ParseRowError 
} from "@/lib/importer/statementParser";

interface UploadStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportSummaryResult {
  insertedCount: number;
  duplicateCount: number;
  skippedCount: number;
  batchId: string;
  duplicates: Array<{ description: string; amount: number; date: string; reason: string }>;
  errors: ParseRowError[];
}

export function UploadStatementModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadStatementModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [parseResult, setParseResult] = useState<StatementParseResult | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummaryResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const processPdfFile = async (pdfFile: File, inputPassword = "") => {
    setIsParsingPdf(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", pdfFile);
    if (inputPassword) {
      formData.append("password", inputPassword);
    }

    try {
      const res = await fetch("/api/transactions/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.status === 422 || data.error === "PASSWORD_REQUIRED") {
        setIsPasswordRequired(true);
        setErrorMessage(data.message || "This PDF is password protected. Enter password below.");
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to parse PDF statement.");
      }

      setIsPasswordRequired(false);
      setParseResult({
        validRows: data.validRows,
        errors: data.errors || [],
        totalRowsProcessed: data.totalRowsProcessed,
        detectedFormat: "EXTENDED_STATEMENT",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Error extracting transactions from PDF statement.");
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setErrorMessage(null);
    setParseResult(null);
    setImportSummary(null);
    setIsPasswordRequired(false);
    setPassword("");

    if (!selectedFile) return;

    const isCsv = selectedFile.name.endsWith(".csv") || selectedFile.type === "text/csv";
    const isPdf = selectedFile.name.endsWith(".pdf") || selectedFile.type === "application/pdf";

    if (!isCsv && !isPdf) {
      setErrorMessage("Please select a valid .csv or .pdf bank statement file.");
      return;
    }

    setFile(selectedFile);

    if (isPdf) {
      processPdfFile(selectedFile);
    } else {
      // Direct Claude Statement Processing
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawContent = event.target?.result as string;
        if (!rawContent || !rawContent.trim()) {
          setErrorMessage("The uploaded CSV file is empty.");
          setIsProcessing(false);
          return;
        }

        try {
          const res = await fetch("/api/transactions/import-claude", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rawContent,
              filename: selectedFile.name,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Failed to process statement with Claude.");
          }

          setImportSummary({
            insertedCount: data.insertedCount,
            duplicateCount: data.duplicateCount,
            skippedCount: 0,
            batchId: data.batchId,
            duplicates: data.duplicates || [],
            errors: [],
          });

          onSuccess();
        } catch (err: any) {
          setErrorMessage(err.message || "Failed to parse CSV statement with Claude.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUnlockPdf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !password.trim()) return;
    processPdfFile(file, password.trim());
  };

  const handleImport = async () => {
    if (!parseResult || parseResult.validRows.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);


    try {
      const res = await fetch("/api/transactions/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          validRows: parseResult.validRows,
          errors: parseResult.errors,
          filename: file?.name || "statement",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import statement.");
      }

      setImportSummary({
        insertedCount: data.insertedCount,
        duplicateCount: data.duplicateCount,
        skippedCount: data.skippedCount,
        batchId: data.batchId,
        duplicates: data.duplicates || [],
        errors: data.errors || [],
      });

      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Network error occurred during import.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPassword("");
    setIsPasswordRequired(false);
    setParseResult(null);
    setImportSummary(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-elevated max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              {importSummary ? "Statement Import Summary" : "Import Bank Statement (PDF / CSV)"}
            </h3>
            <p className="text-xs text-slate-500">
              {importSummary
                ? "Detailed report of inserted, duplicate, and excluded rows"
                : "Supports HDFC, SBI, ICICI, Axis, Chase statements with password decrypt & auto-dedup"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start space-x-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* View 1: Upload & Preview Mode */}
          {!importSummary && (
            <>
              {/* File Upload Drop Area */}
              <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center transition bg-slate-50/50">
                <input
                  type="file"
                  accept=".csv,.pdf"
                  id="statement-file-input"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="statement-file-input" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                    {file?.name.endsWith(".pdf") ? (
                      <FileText className="w-6 h-6 text-rose-600" />
                    ) : (
                      <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {file ? file.name : "Click to choose a Bank Statement (.pdf or .csv)"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload official PDF e-statements or exported CSVs. Zero third-party data transmission.
                  </p>
                </label>
              </div>

              {/* PDF Password Decryption Prompt */}
              {isPasswordRequired && (
                <form
                  onSubmit={handleUnlockPdf}
                  className="p-4 rounded-xl border border-amber-300 bg-amber-50/60 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 animate-in fade-in duration-200"
                >
                  <div className="flex items-center space-x-2 text-amber-900 text-xs font-semibold flex-shrink-0">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Statement Password:</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. DOB (DDMMYYYY) or PAN"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-amber-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    type="submit"
                    disabled={isParsingPdf}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {isParsingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Unlock & Parse"
                    )}
                  </button>
                </form>
              )}

              {/* Parsing Loading State */}
              {isParsingPdf && !isPasswordRequired && (
                <div className="p-6 text-center space-y-2">
                  <Loader2 className="w-6 h-6 text-emerald-700 animate-spin mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">Extracting bank transactions from PDF...</p>
                </div>
              )}

              {/* Format Badge & Row Metrics */}
              {parseResult && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Extracted Rows ({parseResult.validRows.length})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {file?.name.endsWith(".pdf")
                          ? "PDF Decrypted & Parsed"
                          : parseResult.detectedFormat === "DEBIT_CREDIT_COLUMNS"
                          ? "Debit/Credit Columns Detected"
                          : "Single Amount Detected"}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-700 font-semibold flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Rule Engine Ready
                    </span>
                  </div>

                  {/* Valid rows preview table */}
                  {parseResult.validRows.length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Narration / Merchant</th>
                            <th className="py-2 px-3">Type</th>
                            <th className="py-2 px-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parseResult.validRows.slice(0, 8).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/70">
                              <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{row.dateStr}</td>
                              <td className="py-2 px-3 text-slate-800 font-medium truncate max-w-[200px]">
                                {row.description}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                    row.type === "INCOME"
                                      ? "bg-emerald-50 text-emerald-800"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {row.type}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900">
                                ₹{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {parseResult.validRows.length > 8 && (
                    <p className="text-[11px] text-slate-400 mt-1 italic text-right">
                      + {parseResult.validRows.length - 8} more transactions will be categorized deterministically
                    </p>
                  )}

                  {/* Excluded / Malformed rows warning box */}
                  {parseResult.errors.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                      <div className="flex items-center space-x-1.5 text-amber-900 font-semibold mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>{parseResult.errors.length} Malformed Row(s) Detected (Will be skipped)</span>
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {parseResult.errors.map((err, i) => (
                          <p key={i} className="text-amber-800 text-[11px]">
                            • {err.reason}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* View 2: Post-Import Summary Report */}
          {importSummary && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Metric stats grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                    Successfully Inserted
                  </span>
                  <span className="text-2xl font-bold text-emerald-900 font-display">
                    {importSummary.insertedCount}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
                  <span className="text-[10px] uppercase font-bold text-sky-800 tracking-wider block">
                    Duplicates Skipped
                  </span>
                  <span className="text-2xl font-bold text-sky-900 font-display">
                    {importSummary.duplicateCount}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block">
                    Malformed Excluded
                  </span>
                  <span className="text-2xl font-bold text-slate-800 font-display">
                    {importSummary.skippedCount}
                  </span>
                </div>
              </div>

              {/* Duplicates breakdown */}
              {importSummary.duplicates.length > 0 && (
                <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/40 text-xs">
                  <div className="flex items-center space-x-1.5 text-sky-950 font-semibold mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    <span>Exact Duplicate Protection ({importSummary.duplicates.length})</span>
                  </div>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {importSummary.duplicates.map((dup, i) => (
                      <p key={i} className="text-sky-800 text-[11px]">
                        • {dup.description} (₹{dup.amount}) on {dup.date} — skipped to prevent double counting
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Skipped malformed reasons */}
              {importSummary.errors.length > 0 && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <p className="font-semibold text-slate-800 mb-1">
                    Excluded Row Log ({importSummary.errors.length}):
                  </p>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {importSummary.errors.map((err, i) => (
                      <p key={i} className="text-slate-600 text-[11px]">
                        • {err.reason}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 flex-shrink-0 mt-4">
          {importSummary ? (
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              Done & Return to Dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!parseResult || parseResult.validRows.length === 0 || isProcessing}
                className="inline-flex items-center px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Categorizing & Deduplicating...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Import {parseResult?.validRows.length || 0} Transactions
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
