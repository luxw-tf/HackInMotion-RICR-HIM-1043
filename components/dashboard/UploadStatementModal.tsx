"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  FileText,
  Sparkles
} from "lucide-react";

interface UploadStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedPreviewRow {
  date: string;
  description: string;
  amount: number;
  type: "EXPENSE" | "INCOME" | "SAVINGS";
}

export function UploadStatementModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadStatementModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedPreviewRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setParseError(null);
    setParsedRows([]);

    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv") && selectedFile.type !== "text/csv") {
      setParseError("Please select a valid .csv bank statement file.");
      return;
    }

    setFile(selectedFile);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setParseError("The uploaded CSV file is empty or could not be read.");
          return;
        }

        const rawData = results.data as Record<string, any>[];
        const formatted: ParsedPreviewRow[] = [];

        // Detect column names across common bank formats (Chase, BoA, Citi, Wells Fargo, Generic)
        for (const row of rawData) {
          const keys = Object.keys(row);
          
          // Date detection
          const dateKey = keys.find((k) => /date|posting|trans_date/i.test(k));
          const dateVal = dateKey ? row[dateKey] : new Date().toISOString();

          // Description detection
          const descKey = keys.find((k) => /description|memo|payee|merchant|name|details/i.test(k));
          const descVal = descKey ? row[descKey] : "Unknown Merchant";

          // Amount detection
          const amtKey = keys.find((k) => /amount|total|debit|credit/i.test(k));
          let numAmt = 0;

          if (amtKey && row[amtKey] !== undefined) {
            const rawAmtStr = String(row[amtKey]).replace(/[₹\$,]/g, "").trim();
            numAmt = parseFloat(rawAmtStr) || 0;
          }

          // Check if separate Debit and Credit columns exist (e.g. BoA / Wells Fargo / HDFC / SBI)
          const debitKey = keys.find((k) => /debit|withdrawal/i.test(k));
          const creditKey = keys.find((k) => /credit|deposit/i.test(k));

          if (debitKey && row[debitKey] && !amtKey) {
            const debitAmt = parseFloat(String(row[debitKey]).replace(/[₹\$,]/g, "")) || 0;
            if (debitAmt > 0) numAmt = -Math.abs(debitAmt);
          } else if (creditKey && row[creditKey] && !amtKey) {
            const creditAmt = parseFloat(String(row[creditKey]).replace(/[₹\$,]/g, "")) || 0;
            if (creditAmt > 0) numAmt = Math.abs(creditAmt);
          }


          if (descVal && descVal.trim() && !isNaN(numAmt) && numAmt !== 0) {
            const isPositive = numAmt > 0;
            formatted.push({
              date: dateVal,
              description: descVal.trim(),
              amount: Math.abs(numAmt),
              type: isPositive ? "INCOME" : "EXPENSE",
            });
          }
        }

        if (formatted.length === 0) {
          setParseError("Could not detect valid Date, Description, or Amount columns in this CSV format. Please verify the file headers.");
        } else {
          setParsedRows(formatted);
        }
      },
      error: (error) => {
        setParseError(`CSV Parsing error: ${error.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setParseError(null);

    try {
      const res = await fetch("/api/transactions/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: parsedRows,
          filename: file?.name || "statement.csv",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import statement.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setParseError(err.message || "Network error occurred during import.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-elevated max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">Import Bank Statement (CSV)</h3>
            <p className="text-xs text-slate-500">Supports Chase, Bank of America, Citi, Wells Fargo, and standard CSVs</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {parseError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{parseError}</span>
          </div>
        )}

        <div className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* File Upload Drop Area */}
          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center transition bg-slate-50/50">
            <input
              type="file"
              accept=".csv"
              id="csv-file-input"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {file ? file.name : "Click to select a Bank CSV file"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Your data is parsed locally and saved securely to your private account.
              </p>
            </label>
          </div>

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Detected Transactions ({parsedRows.length})
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Auto-categorization ready
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{row.date}</td>
                        <td className="py-2 px-3 text-slate-800 font-medium truncate max-w-[200px]">{row.description}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${row.type === "INCOME" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">₹{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedRows.length > 10 && (
                <p className="text-[11px] text-slate-400 mt-1 italic text-right">
                  + {parsedRows.length - 10} more rows ready for deterministic import
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 flex-shrink-0 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={parsedRows.length === 0 || isProcessing}
            className="inline-flex items-center px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Categorizing & Importing...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Import {parsedRows.length} Transactions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
