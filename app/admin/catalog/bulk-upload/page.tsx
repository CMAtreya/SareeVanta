'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Edit,
  Trash2,
  Check,
  X,
  FileText,
  HelpCircle,
  Database,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  ChevronRight,
  Play,
} from 'lucide-react';
import { products } from '@/lib/products';

interface IngestionRow {
  rowNumber: number;
  title: string;
  sku: string;
  weave: string;
  fabric: string;
  zariType: string;
  priceINR: number | string;
  mrpINR: number | string;
  stock: number | string;
  hsnCode: string;
  silkMarkNumber: string;
  weightGrams: number | string;
  errors: { field: string; message: string; severity: 'ERROR' | 'WARNING' }[];
  isValid: boolean;
}

const VALID_WEAVES = [
  'Mysore Silk',
  'Kanchipuram',
  'Banarasi',
  'Paithani',
  'Patola',
  'Chanderi',
  'Tussar',
  'Ikkat',
  'Tissue Georgette',
];

const VALID_ZARI = [
  '24K Tested Pure Zari',
  'Sacred 3-Shuttle Pure Gold Zari',
  'Half-Fine Tested Zari',
  'Antiqued Silver Core Zari',
  'Tapestry Pure Zari',
];

// Demo dataset containing clean rows, warning rows, and fatal error rows for interactive testing
const DEMO_BATCH: IngestionRow[] = [
  {
    rowNumber: 1,
    title: 'Royal Wodeyar Crimson Crepe Silk',
    sku: 'NSH-SKU-MYS-01',
    weave: 'Mysore Silk',
    fabric: '100% Pure Mulberry Silk',
    zariType: '24K Tested Pure Zari',
    priceINR: 28500,
    mrpINR: 32000,
    stock: 4,
    hsnCode: '5007.20.10',
    silkMarkNumber: 'CSB-2026-MYS-8942',
    weightGrams: 650,
    errors: [],
    isValid: true,
  },
  {
    rowNumber: 2,
    title: 'Bridal Kanchipuram Korvai Gold Brocade',
    sku: '', // Missing SKU -> Fatal Error
    weave: 'Kanchipuram',
    fabric: 'Pure Mulberry Raw Silk',
    zariType: 'Sacred 3-Shuttle Pure Gold Zari',
    priceINR: 68000,
    mrpINR: 75000,
    stock: 2,
    hsnCode: '5007.20.10',
    silkMarkNumber: 'CSB-2026-KAN-1102',
    weightGrams: 850,
    errors: [
      { field: 'sku', message: 'Master SKU cannot be empty', severity: 'ERROR' },
    ],
    isValid: false,
  },
  {
    rowNumber: 3,
    title: 'Varanasi Kadwa Katan Meenakari Boota',
    sku: 'NSH-SKU-BAN-03',
    weave: 'Banarasi',
    fabric: 'Pure Katan Silk',
    zariType: 'Antiqued Silver Core Zari',
    priceINR: 54000,
    mrpINR: 60000,
    stock: 1,
    hsnCode: '5007.20.10',
    silkMarkNumber: 'CSB-2026-BAN-5510',
    weightGrams: 720,
    errors: [],
    isValid: true,
  },
  {
    rowNumber: 4,
    title: 'Yeola Paithani Royal Peacock Asawali',
    sku: 'NSH-SKU-PAI-02',
    weave: 'Paithani',
    fabric: '100% Pure Silk',
    zariType: 'Tapestry Pure Zari',
    priceINR: 46000,
    mrpINR: 46000, // Price equals MRP -> Warning
    stock: 3,
    hsnCode: '5007.20.10',
    silkMarkNumber: 'CSB-2026-PAI-9920',
    weightGrams: 700,
    errors: [
      { field: 'mrpINR', message: 'MRP is equal to selling price (no discount displayed)', severity: 'WARNING' },
    ],
    isValid: true,
  },
  {
    rowNumber: 5,
    title: 'Champagne Tissue Georgette Floral Zari',
    sku: 'NSH-SKU-TIS-08',
    weave: 'Unknown Silk Tradition', // Invalid Weave -> Fatal Error
    fabric: 'Metallic Tissue Silk',
    zariType: 'Half-Fine Tested Zari',
    priceINR: 36000,
    mrpINR: 42000,
    stock: 5,
    hsnCode: '9999', // Invalid HSN -> Fatal Error
    silkMarkNumber: 'CSB-2026-TIS-4421',
    weightGrams: 580,
    errors: [
      { field: 'weave', message: 'Invalid weave. Must be Mysore Silk, Kanchipuram, Banarasi, etc.', severity: 'ERROR' },
      { field: 'hsnCode', message: 'HSN code must start with 5007 for pure silk sarees', severity: 'ERROR' },
    ],
    isValid: false,
  },
  {
    rowNumber: 6,
    title: 'Mysuru Sandalwood Crepe Gold Kasuti',
    sku: 'NSH-SKU-MYS-07',
    weave: 'Mysore Silk',
    fabric: '100% Pure Mulberry Silk',
    zariType: '24K Tested Pure Zari',
    priceINR: 32000,
    mrpINR: 38000,
    stock: 0, // Zero stock -> Warning
    hsnCode: '5007.20.10',
    silkMarkNumber: 'CSB-2026-MYS-3319',
    weightGrams: 660,
    errors: [
      { field: 'stock', message: 'Stock is 0; product will be ingested as a Draft', severity: 'WARNING' },
    ],
    isValid: true,
  },
];

export default function BulkUploadEnginePage() {
  const router = useRouter();
  const [rows, setRows] = useState<IngestionRow[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ERRORS' | 'WARNINGS' | 'VALID'>('ALL');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [ingestStatusText, setIngestStatusText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Validation Runner for In-Browser Error Grid
  const validateRow = (row: IngestionRow): IngestionRow => {
    const errs: { field: string; message: string; severity: 'ERROR' | 'WARNING' }[] = [];

    // Title Check
    if (!row.title || !row.title.trim()) {
      errs.push({ field: 'title', message: 'Title is required', severity: 'ERROR' });
    }

    // SKU Check
    if (!row.sku || !row.sku.trim()) {
      errs.push({ field: 'sku', message: 'Master SKU cannot be empty', severity: 'ERROR' });
    }

    // Weave Check
    if (!VALID_WEAVES.includes(row.weave)) {
      errs.push({
        field: 'weave',
        message: `Must be one of: ${VALID_WEAVES.join(', ')}`,
        severity: 'ERROR',
      });
    }

    // Price Check
    const p = Number(row.priceINR);
    if (isNaN(p) || p <= 0) {
      errs.push({ field: 'priceINR', message: 'Price must be a valid positive number', severity: 'ERROR' });
    }

    // HSN Code Check
    if (!row.hsnCode || !row.hsnCode.startsWith('5007')) {
      errs.push({ field: 'hsnCode', message: 'Silk Saree HSN code must start with 5007', severity: 'ERROR' });
    }

    // Stock Warning
    if (Number(row.stock) === 0) {
      errs.push({ field: 'stock', message: 'Stock is 0; will import as Draft', severity: 'WARNING' });
    }

    // MRP Warning
    if (Number(row.mrpINR) <= Number(row.priceINR)) {
      errs.push({ field: 'mrpINR', message: 'MRP is equal to or less than selling price', severity: 'WARNING' });
    }

    const hasFatal = errs.some((e) => e.severity === 'ERROR');
    return {
      ...row,
      errors: errs,
      isValid: !hasFatal,
    };
  };

  // Inline Field Editor
  const handleCellEdit = (rowNumber: number, field: keyof IngestionRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowNumber === rowNumber) {
          const updated = { ...r, [field]: value };
          return validateRow(updated);
        }
        return r;
      })
    );
  };

  // Pre-ingestion Counts
  const stats = useMemo(() => {
    const total = rows.length;
    const errors = rows.filter((r) => !r.isValid).length;
    const warnings = rows.filter((r) => r.isValid && r.errors.some((e) => e.severity === 'WARNING'))
      .length;
    const valid = rows.filter((r) => r.isValid && r.errors.length === 0).length;

    return { total, errors, warnings, valid };
  }, [rows]);

  // Filtered Rows
  const filteredRows = useMemo(() => {
    if (activeFilter === 'ERRORS') return rows.filter((r) => !r.isValid);
    if (activeFilter === 'WARNINGS') return rows.filter((r) => r.errors.some((e) => e.severity === 'WARNING'));
    if (activeFilter === 'VALID') return rows.filter((r) => r.isValid);
    return rows;
  }, [rows, activeFilter]);

  // Load Demo Batch
  const handleLoadDemoBatch = () => {
    setFileName('NeelSareeHouse_Handloom_Import_Batch_2026.xlsx');
    setRows(DEMO_BATCH.map(validateRow));
    setIsCompleted(false);
  };

  // Download Standard Saree Import Template CSV
  const handleDownloadStandardTemplate = () => {
    const headers = [
      'Master SKU',
      'Title',
      'Weave Tradition',
      'Fabric Composition',
      'Zari Specification',
      'Selling Price INR',
      'MRP INR',
      'Stock Qty',
      'HSN Code',
      'Silk Mark Number',
      'Weight in Grams',
    ];

    const sampleRow = [
      '"NSH-SKU-MYS-01"',
      '"Royal Wodeyar Crimson Crepe Silk"',
      '"Mysore Silk"',
      '"100% Pure Mulberry Silk"',
      '"24K Tested Pure Zari"',
      '28500',
      '32000',
      '4',
      '"5007.20.10"',
      '"CSB-2026-MYS-8942"',
      '650',
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), sampleRow.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Standard_Saree_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Current Inventory Data
  const handleDownloadCurrentInventory = () => {
    const headers = [
      'Master SKU',
      'Title',
      'Weave Tradition',
      'Fabric Composition',
      'Zari Specification',
      'Selling Price INR',
      'MRP INR',
      'Stock Qty',
      'HSN Code',
      'Silk Mark Number',
      'Weight in Grams',
    ];

    const rowsData = products.map((p, i) => [
      `"NSH-SKU-${p.weave.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(2, '0')}"`,
      `"${p.title}"`,
      `"${p.weave}"`,
      '"100% Pure Mulberry Silk"',
      '"24K Tested Pure Zari"',
      p.priceINR,
      p.originalPriceINR || Math.round(p.priceINR * 1.15),
      3,
      '"5007.20.10"',
      `"CSB-2026-MYS-${1000 + i}"`,
      680,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rowsData.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NeelSareeHouse_Current_Inventory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Execute Database Ingestion with Simulated SSE Streaming Feedback
  const handleExecuteImport = () => {
    if (stats.errors > 0) return;

    setIsIngesting(true);
    setIngestProgress(0);
    setIngestStatusText('Validating Central Silk Board certificates...');

    const validRowsCount = rows.filter((r) => r.isValid).length;
    let current = 0;

    const interval = setInterval(() => {
      current += 1;
      const pct = Math.round((current / validRowsCount) * 100);
      setIngestProgress(pct);

      if (current === 1) {
        setIngestStatusText(`Ingesting row 1 of ${validRowsCount}: Mysore Silk Crepe...`);
      } else if (current === 3) {
        setIngestStatusText(`Ingesting row 3 of ${validRowsCount}: Indexing CIELAB color harmony & zari attributes...`);
      } else if (current >= validRowsCount) {
        clearInterval(interval);
        setIngestStatusText(`Successfully ingested all ${validRowsCount} handloom SKUs into production database.`);
        setIsIngesting(false);
        setIsCompleted(true);
      } else {
        setIngestStatusText(`Ingesting row ${current} of ${validRowsCount}...`);
      }
    }, 400);
  };

  return (
    <div className="font-sans text-slate-900 select-none pb-28 space-y-6 animate-fade-in">
      {/* ================================================== */}
      {/* 1. TOP HEADER & BREADCRUMBS                        */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/catalog"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                Excel / CSV Bulk Data Engine
              </h1>
              <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
                Max 5,000 Rows
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              High-Throughput Handloom Ingestion with In-Browser Error Grid & Live SSE Feedback
            </p>
          </div>
        </div>

        {/* Template Downloads */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadStandardTemplate}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Import Template (.csv)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCurrentInventory}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Current Snapshot</span>
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. DRAG AND DROP INGESTION ZONE                   */}
      {/* ================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/70 hover:bg-blue-50/20 hover:border-blue-500 transition-all cursor-pointer space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 font-sans">
              Drag & Drop Master Saree Spreadsheet (.xlsx, .csv)
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Supports up to 5,000 rows with Silk Mark validation & HSN tax mapping
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleLoadDemoBatch}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Demo Indian Handloom Batch (Contains Errors to Fix)</span>
            </button>
          </div>
        </div>

        {fileName && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs font-mono text-blue-900">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span className="font-bold">{fileName}</span>
              <span className="text-slate-500">({rows.length} rows loaded)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setRows([]);
                setFileName(null);
                setIsCompleted(false);
              }}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* 3. PRE-INGESTION METRICS BANNER                    */}
      {/* ================================================== */}
      {rows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          {/* Total Rows */}
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-70">
              Total Ingestion Rows
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight mt-1 block">
              {stats.total}
            </span>
          </button>

          {/* Valid Rows */}
          <button
            type="button"
            onClick={() => setActiveFilter('VALID')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeFilter === 'VALID'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider block text-emerald-600">
                Ready for Write
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-bold font-mono tracking-tight mt-1 block text-emerald-700">
              {stats.valid + stats.warnings} Rows
            </span>
          </button>

          {/* Warning Rows */}
          <button
            type="button"
            onClick={() => setActiveFilter('WARNINGS')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeFilter === 'WARNINGS'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider block text-amber-600">
                Warnings (Non-Fatal)
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-bold font-mono tracking-tight mt-1 block text-amber-700">
              {stats.warnings} Rows
            </span>
          </button>

          {/* Fatal Error Rows */}
          <button
            type="button"
            onClick={() => setActiveFilter('ERRORS')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeFilter === 'ERRORS'
                ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider block text-rose-600">
                Fatal Errors (Fix Inline)
              </span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-2xl font-bold font-mono tracking-tight mt-1 block text-rose-700">
              {stats.errors} Rows
            </span>
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* 4. INTERACTIVE IN-BROWSER ERROR GRID               */}
      {/* ================================================== */}
      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-2">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-600" />
                <span>Interactive In-Browser Pre-Ingestion Grid</span>
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                Click directly into red error cells to correct fields before committing to database
              </p>
            </div>

            {/* Ingestion Trigger Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isIngesting || stats.errors > 0}
                onClick={handleExecuteImport}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                <span>
                  {stats.errors > 0
                    ? `Fix ${stats.errors} Fatal Errors to Proceed`
                    : `Execute Import (${stats.total} SKUs)`}
                </span>
              </button>
            </div>
          </div>

          {/* Data Grid Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3 w-10 text-center">Row</th>
                  <th className="p-3">Saree Title *</th>
                  <th className="p-3">Master SKU *</th>
                  <th className="p-3">Weave Tradition *</th>
                  <th className="p-3">Zari Type</th>
                  <th className="p-3 w-28">Price (₹) *</th>
                  <th className="p-3 w-28">MRP (₹)</th>
                  <th className="p-3 w-20">Stock</th>
                  <th className="p-3 w-28">HSN Code *</th>
                  <th className="p-3">Silk Mark #</th>
                  <th className="p-3 text-center">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRows.map((row) => {
                  const hasSkuError = row.errors.some((e) => e.field === 'sku');
                  const hasWeaveError = row.errors.some((e) => e.field === 'weave');
                  const hasHsnError = row.errors.some((e) => e.field === 'hsnCode');
                  const hasMrpWarning = row.errors.some((e) => e.field === 'mrpINR');
                  const hasStockWarning = row.errors.some((e) => e.field === 'stock');

                  return (
                    <tr
                      key={row.rowNumber}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !row.isValid ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-slate-400 text-center">
                        #{row.rowNumber}
                      </td>

                      {/* Title */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.title}
                          onChange={(e) => handleCellEdit(row.rowNumber, 'title', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded font-medium text-slate-900 focus:bg-white text-xs focus:outline-none"
                        />
                      </td>

                      {/* SKU (Editable with Red highlight on error) */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.sku}
                          placeholder="e.g. NSH-SKU-KAN-02"
                          onChange={(e) => handleCellEdit(row.rowNumber, 'sku', e.target.value)}
                          className={`w-full px-2 py-1 font-mono font-bold text-xs rounded border focus:outline-none ${
                            hasSkuError
                              ? 'bg-rose-50 border-rose-400 text-rose-700 placeholder:text-rose-400 focus:bg-white'
                              : 'bg-transparent border-transparent hover:border-slate-300 focus:border-blue-500 text-slate-900 focus:bg-white'
                          }`}
                        />
                      </td>

                      {/* Weave (Select dropdown with Red highlight on error) */}
                      <td className="p-2">
                        <select
                          value={row.weave}
                          onChange={(e) => handleCellEdit(row.rowNumber, 'weave', e.target.value)}
                          className={`w-full px-2 py-1 text-xs rounded border focus:outline-none font-medium ${
                            hasWeaveError
                              ? 'bg-rose-50 border-rose-400 text-rose-700'
                              : 'bg-transparent border-transparent hover:border-slate-300 focus:border-blue-500 text-slate-900 bg-white'
                          }`}
                        >
                          <option value="Unknown Silk Tradition">Unknown Tradition</option>
                          {VALID_WEAVES.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Zari Type */}
                      <td className="p-2">
                        <select
                          value={row.zariType}
                          onChange={(e) => handleCellEdit(row.rowNumber, 'zariType', e.target.value)}
                          className="w-full px-2 py-1 text-xs rounded border border-transparent hover:border-slate-300 focus:border-blue-500 text-slate-800 bg-transparent focus:bg-white font-mono"
                        >
                          {VALID_ZARI.map((z) => (
                            <option key={z} value={z}>
                              {z}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Selling Price */}
                      <td className="p-2">
                        <input
                          type="number"
                          value={row.priceINR}
                          onChange={(e) => handleCellEdit(row.rowNumber, 'priceINR', e.target.value)}
                          className="w-full px-2 py-1 font-mono font-bold text-xs bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-slate-900 focus:bg-white"
                        />
                      </td>

                      {/* MRP */}
                      <td className="p-2">
                        <input
                          type="number"
                          value={row.mrpINR}
                          onChange={(e) => handleCellEdit(row.rowNumber, 'mrpINR', e.target.value)}
                          className={`w-full px-2 py-1 font-mono text-xs rounded border focus:outline-none ${
                            hasMrpWarning
                              ? 'bg-amber-50 border-amber-300 text-amber-800'
                              : 'bg-transparent border-transparent hover:border-slate-300 focus:border-blue-500 text-slate-700 focus:bg-white'
                          }`}
                        />
                      </td>

                      {/* Stock */}
                      <td className="p-2">
                        <input
                          type="number"
                          value={row.stock}
                          onChange={(e) => handleCellEdit(row.rowNumber, 'stock', e.target.value)}
                          className={`w-full px-2 py-1 font-mono text-xs rounded border focus:outline-none ${
                            hasStockWarning
                              ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                              : 'bg-transparent border-transparent hover:border-slate-300 focus:border-blue-500 text-slate-900 focus:bg-white'
                          }`}
                        />
                      </td>

                      {/* HSN Code */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.hsnCode}
                          onChange={(e) => handleCellEdit(row.rowNumber, 'hsnCode', e.target.value)}
                          className={`w-full px-2 py-1 font-mono text-xs rounded border focus:outline-none ${
                            hasHsnError
                              ? 'bg-rose-50 border-rose-400 text-rose-700'
                              : 'bg-transparent border-transparent hover:border-slate-300 focus:border-blue-500 text-slate-900 focus:bg-white'
                          }`}
                        />
                      </td>

                      {/* Silk Mark Number */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.silkMarkNumber}
                          onChange={(e) =>
                            handleCellEdit(row.rowNumber, 'silkMarkNumber', e.target.value)
                          }
                          className="w-full px-2 py-1 font-mono text-xs bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-emerald-800 font-semibold focus:bg-white"
                        />
                      </td>

                      {/* Validation Status Badge */}
                      <td className="p-3 text-center">
                        {!row.isValid ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800"
                            title={row.errors.map((e) => e.message).join('; ')}
                          >
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Error</span>
                          </span>
                        ) : row.errors.some((e) => e.severity === 'WARNING') ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800"
                            title={row.errors.map((e) => e.message).join('; ')}
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Warning</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Valid</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 5. LIVE PROGRESS ENGINE & SSE FEEDBACK             */}
      {/* ================================================== */}
      {(isIngesting || isCompleted) && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="font-bold text-sm text-white font-sans">
                  {isCompleted ? 'Batch Ingestion Finalized' : 'Database Ingestion Stream Active'}
                </h4>
                <p className="text-xs font-mono text-slate-400">{ingestStatusText}</p>
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {ingestProgress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${ingestProgress}%` }}
              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300"
            />
          </div>

          {isCompleted && (
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>All {stats.total} SKUs ingested with Central Silk Board certificates.</span>
              </div>
              <Link
                href="/admin/catalog"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
              >
                <span>View Master Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
