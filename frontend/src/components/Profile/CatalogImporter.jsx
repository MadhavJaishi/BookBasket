import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { fetchBooks } from "../../store/bookSlice";
import { FaFileCode, FaCopy, FaDownload, FaMagic, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSpinner, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

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

    if (cleaned.endsWith(",")) {
      cleaned = cleaned.slice(0, -1).trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      if (cleaned.startsWith("{")) {
        try {
          parsed = JSON.parse(`[${cleaned}]`);
        } catch (innerErr) {
          throw new Error(`JSON Syntax Error: ${err.message}. Ensure properties and strings use double quotes (").`);
        }
      } else {
        throw new Error(`JSON Syntax Error: ${err.message}. Ensure properties and strings use double quotes (").`);
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
        throw new Error("Invalid JSON structure. Root element must be an array of book objects.");
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
        dispatch(fetchBooks({ headers }));
      }
    } catch (error) {
      console.error("Import error:", error);
      const msg = error.response?.data?.msg || "Failed to import books. Please check formatting.";
      setValidationError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-medium">
            Batch Operations
          </span>
          <h1 className="text-3xl font-serif text-white font-normal mt-1">
            JSON Catalog Importer
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Bulk ingest book records with ISBN enrichment, duplicate prevention, and automatic schema validation.
          </p>
        </div>

        <Link
          to="/profile/inventory"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          View Catalog <FaArrowRight className="text-[10px]" />
        </Link>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-3xl border border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadExample}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-2 rounded-2xl text-xs font-light transition-all border border-zinc-700/60"
          >
            <FaDownload className="text-emerald-400 text-xs" /> Load Sample
          </button>

          <button
            onClick={handleCopyExample}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-2 rounded-2xl text-xs font-light transition-all border border-zinc-700/60"
          >
            <FaCopy className="text-sky-400 text-xs" /> {copySuccess ? "Copied!" : "Copy Template"}
          </button>

          <button
            onClick={handleFormatJson}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-2 rounded-2xl text-xs font-light transition-all border border-zinc-700/60"
          >
            <FaMagic className="text-emerald-400 text-xs" /> Prettify JSON
          </button>
        </div>

        <button
          onClick={handleImport}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 font-medium px-6 py-2.5 rounded-full text-xs transition-all shadow-lg shadow-emerald-950/40 disabled:text-zinc-500"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Ingesting Records...
            </>
          ) : (
            <>Ingest Records</>
          )}
        </button>
      </div>

      {/* Editor Textarea */}
      <div className="p-4 rounded-3xl bg-zinc-900/40 border border-zinc-800/80">
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste JSON array of books here... or click 'Load Sample' above"
          rows={12}
          className="w-full bg-zinc-950/80 border border-zinc-800/80 focus:border-emerald-500 text-zinc-100 text-xs font-mono p-4 outline-none rounded-2xl transition-colors resize-y placeholder:text-zinc-700"
        />
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="bg-red-950/40 border border-red-500/60 text-red-200 p-4 rounded-2xl flex items-start gap-3">
          <FaTimesCircle className="text-base text-red-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium text-xs">Validation or Ingest Error</h4>
            <p className="text-xs text-red-300/90 font-light mt-1">{validationError}</p>
          </div>
        </div>
      )}

      {/* Summary Matrix */}
      {importSummary && (
        <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800/90 space-y-4">
          <h3 className="text-sm font-serif text-white flex items-center gap-2">
            <FaCheckCircle className="text-emerald-400" /> Ingestion Results
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-center">
              <span className="text-[10px] uppercase text-zinc-500 font-light block">Total Records</span>
              <span className="text-xl font-serif text-zinc-100">{importSummary.total}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <span className="text-[10px] uppercase text-emerald-400/80 font-light block">Imported</span>
              <span className="text-xl font-serif text-emerald-400">{importSummary.imported}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
              <span className="text-[10px] uppercase text-zinc-400/80 font-light block">Skipped (Dupes)</span>
              <span className="text-xl font-serif text-zinc-300">{importSummary.skipped}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-center">
              <span className="text-[10px] uppercase text-red-400/80 font-light block">Failed Schema</span>
              <span className="text-xl font-serif text-red-400">{importSummary.failed}</span>
            </div>
          </div>
        </div>
      )}

      {/* Schema Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-medium">
            JSON Schema Specification
          </h3>
          <p className="text-xs text-zinc-400 font-light">
            Each book object in the array should conform to the following properties:
          </p>
          <ul className="space-y-1.5 text-xs text-zinc-300 font-mono">
            <li><span className="text-emerald-400 font-bold">title</span> (string, required)</li>
            <li><span className="text-emerald-400 font-bold">author</span> (string, required)</li>
            <li><span className="text-emerald-400 font-bold">price</span> (number, required)</li>
            <li><span className="text-emerald-400 font-bold">description</span> (string, required)</li>
            <li><span className="text-emerald-400 font-bold">category / genre</span> (string)</li>
            <li><span className="text-emerald-400 font-bold">coverImage / url</span> (string)</li>
            <li><span className="text-emerald-400 font-bold">isbn</span> (string, optional)</li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-sky-400 font-medium">
            Example JSON Structure
          </h3>
          <pre className="p-3 rounded-2xl bg-zinc-950 text-[11px] font-mono text-zinc-400 overflow-x-auto border border-zinc-800/60 max-h-48">
            {sampleJsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CatalogImporter;
