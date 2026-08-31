import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { fetchBooks } from "../../store/bookSlice";
import { FaFileCode, FaCopy, FaDownload, FaMagic, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSpinner } from "react-icons/fa";

const EXAMPLE_JSON = [
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    description: "A handbook of agile software craftsmanship.",
    price: 599,
    category: "Programming",
    language: "English",
    isbn: "9780132350884",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg"
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    description: "A guide to effective software development.",
    price: 699,
    category: "Programming",
    language: "English",
    isbn: "9780135957059",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51wX5lV81tL._SX380_BO1,204,203,200_.jpg"
  },
  {
    title: "Design Patterns",
    author: "Erich Gamma",
    description: "Elements of reusable object-oriented software.",
    price: 799,
    category: "Software Architecture",
    language: "English",
    isbn: "9780201633610",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51szD90_l1L._SX396_BO1,204,203,200_.jpg"
  }
];

const CatalogImporter = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  const dispatch = useDispatch();

  const headers = {
    id: localStorage.getItem("id"),
    userid: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const sampleJsonString = JSON.stringify(EXAMPLE_JSON, null, 2);

  const handleLoadExample = () => {
    setJsonInput(sampleJsonString);
    setValidationError("");
    setImportSummary(null);
  };

  const handleCopyExample = () => {
    navigator.clipboard.writeText(sampleJsonString);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const parseJsonInput = (rawInput) => {
    let cleaned = rawInput.trim();
    if (!cleaned) throw new Error("Textarea is empty. Please paste or load JSON.");

    // Remove trailing comma if present at the very end
    if (cleaned.endsWith(",")) {
      cleaned = cleaned.slice(0, -1).trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      // If parsing failed, try wrapping in [] if it looks like an object or comma-separated objects
      if (cleaned.startsWith("{")) {
        try {
          parsed = JSON.parse(`[${cleaned}]`);
        } catch (innerErr) {
          throw new Error(`JSON Syntax Error: ${err.message}. Ensure properties and string values use double quotes (").`);
        }
      } else {
        throw new Error(`JSON Syntax Error: ${err.message}. Ensure properties and string values use double quotes (").`);
      }
    }

    if (!Array.isArray(parsed)) {
      if (typeof parsed === "object" && parsed !== null) {
        if (Array.isArray(parsed.books)) {
          parsed = parsed.books;
        } else {
          parsed = [parsed];
        }
      } else {
        throw new Error("Invalid JSON structure. Root element must be a JSON array or book object.");
      }
    }

    return parsed;
  };

  const handleFormatJson = () => {
    setValidationError("");
    try {
      const parsed = parseJsonInput(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch (err) {
      setValidationError(err.message);
    }
  };

  const handleImport = async () => {
    setValidationError("");
    setImportSummary(null);

    let parsedData;
    try {
      parsedData = parseJsonInput(jsonInput);
    } catch (err) {
      setValidationError(err.message);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/bulk-import`,
        parsedData,
        { headers }
      );

      if (response.data && response.data.summary) {
        setImportSummary(response.data.summary);
        // Refresh Redux store so books immediately show in site UI
        dispatch(fetchBooks({ headers }));
      }
    } catch (error) {
      console.error("Import error:", error);
      const msg = error.response?.data?.msg || "Failed to import books. Please try again.";
      setValidationError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-0 md:p-4 text-zinc-100 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FaFileCode className="text-3xl text-emerald-400" />
        <h1 className="text-3xl md:text-5xl font-semibold text-zinc-200">
          Catalog Importer
        </h1>
      </div>

      <p className="text-zinc-400 mb-6">
        Bulk import book items into the BookBasket catalog by pasting a structured JSON array below.
      </p>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-800 p-4 rounded-t-xl border-b border-zinc-700">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadExample}
            className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-1.5 rounded text-sm transition-all duration-200"
          >
            <FaDownload className="text-emerald-400" /> Load Example
          </button>

          <button
            onClick={handleCopyExample}
            className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-1.5 rounded text-sm transition-all duration-200"
          >
            <FaCopy className="text-blue-400" /> {copySuccess ? "Copied!" : "Copy Example"}
          </button>

          <button
            onClick={handleFormatJson}
            className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-1.5 rounded text-sm transition-all duration-200"
          >
            <FaMagic className="text-yellow-400" /> Format JSON
          </button>
        </div>

        <button
          onClick={handleImport}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 shadow-md"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Importing...
            </>
          ) : (
            <>Import Books</>
          )}
        </button>
      </div>

      {/* JSON Editor Textarea */}
      <div className="relative mb-6">
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste JSON array of books here... or click 'Load Example' above"
          rows={14}
          className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 text-zinc-100 text-sm font-mono p-4 outline-none rounded-b-xl transition-all duration-300 shadow-inner placeholder:text-zinc-600"
        />
      </div>

      {/* Syntax Validation Error Alert */}
      {validationError && (
        <div className="mb-6 bg-red-900/40 border border-red-500/60 text-red-200 p-4 rounded-xl flex items-start gap-3">
          <FaTimesCircle className="text-xl text-red-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold">Validation / Import Error</h4>
            <p className="text-sm mt-1">{validationError}</p>
          </div>
        </div>
      )}

      {/* Import Summary Results */}
      {importSummary && (
        <div className="mb-8 bg-zinc-800/90 border border-zinc-700 rounded-xl p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-emerald-400" /> Import Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-700 text-center">
              <span className="text-zinc-400 text-sm block">Total Processed</span>
              <span className="text-2xl font-bold text-zinc-100">{importSummary.total}</span>
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg border border-emerald-800/60 text-center">
              <span className="text-emerald-300 text-sm block">Successfully Imported</span>
              <span className="text-2xl font-bold text-emerald-400">{importSummary.imported}</span>
            </div>
            <div className="bg-amber-950/40 p-4 rounded-lg border border-amber-800/60 text-center">
              <span className="text-amber-300 text-sm block">Skipped (Duplicates)</span>
              <span className="text-2xl font-bold text-amber-400">{importSummary.skipped}</span>
            </div>
            <div className="bg-red-950/40 p-4 rounded-lg border border-red-800/60 text-center">
              <span className="text-red-300 text-sm block">Failed Validation</span>
              <span className="text-2xl font-bold text-red-400">{importSummary.failed}</span>
            </div>
          </div>

          {/* Details Breakdown */}
          {importSummary.details?.skipped?.length > 0 && (
            <div className="mt-4 bg-amber-900/20 border border-amber-800/40 p-4 rounded-lg">
              <h4 className="text-amber-300 font-semibold mb-2 flex items-center gap-2">
                <FaExclamationTriangle /> Skipped Items ({importSummary.details.skipped.length}):
              </h4>
              <ul className="space-y-1.5 text-sm text-amber-200/90 font-mono">
                {importSummary.details.skipped.map((item, idx) => (
                  <li key={idx} className="bg-amber-950/50 p-2 rounded border border-amber-900/30">
                    <span className="font-semibold text-amber-400">Book #{item.index}:</span> {item.title} {item.author ? `by ${item.author}` : ""} — <span className="italic text-zinc-300">{item.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {importSummary.details?.failed?.length > 0 && (
            <div className="mt-4 bg-red-900/20 border border-red-800/40 p-4 rounded-lg">
              <h4 className="text-red-300 font-semibold mb-2 flex items-center gap-2">
                <FaTimesCircle /> Failed Validation Items ({importSummary.details.failed.length}):
              </h4>
              <ul className="space-y-1.5 text-sm text-red-200/90 font-mono">
                {importSummary.details.failed.map((item, idx) => (
                  <li key={idx} className="bg-red-950/50 p-2 rounded border border-red-900/30">
                    <span className="font-semibold text-red-400">Book #{item.index}:</span> {item.title} — <span className="italic text-zinc-300">{item.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Guide & Reference Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accepted JSON Format */}
        <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
          <h3 className="text-xl font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            Accepted JSON Format
          </h3>
          <p className="text-sm text-zinc-300 mb-4">
            The input must be a JSON array containing book objects with the following fields:
          </p>
          <ul className="space-y-2 text-sm text-zinc-300 font-mono">
            <li><span className="text-emerald-400 font-bold">title</span> (string, required) - Book title</li>
            <li><span className="text-emerald-400 font-bold">author</span> (string, required) - Author name</li>
            <li><span className="text-emerald-400 font-bold">price</span> (number, required) - Price in INR/USD</li>
            <li><span className="text-emerald-400 font-bold">description / desc</span> (string, required) - Book description</li>
            <li><span className="text-emerald-400 font-bold">category / genre</span> (string, required) - Genre/Category</li>
            <li><span className="text-emerald-400 font-bold">coverImage / url</span> (string, required) - Image URL</li>
            <li><span className="text-emerald-400 font-bold">language</span> (string, optional) - Defaults to English</li>
            <li><span className="text-emerald-400 font-bold">isbn</span> (string, optional) - Used for duplicate checking</li>
          </ul>
        </div>

        {/* Example JSON Section */}
        <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
          <h3 className="text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
            Example JSON Structure
          </h3>
          <pre className="bg-zinc-900 p-4 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto border border-zinc-700 max-h-60">
            {sampleJsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CatalogImporter;
