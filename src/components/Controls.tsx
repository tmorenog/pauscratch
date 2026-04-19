"use client";

import { useRef, useState } from "react";

interface Props {
  onReset: () => void;
  onExport: () => string;
  onImport: (json: string) => boolean;
  onPrint: () => void;
}

export function Controls({ onReset, onExport, onImport, onPrint }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "paus-worldcup-bracket.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileRef.current?.click();

  const handleFile = async (file: File) => {
    const text = await file.text();
    const ok = onImport(text);
    setImportMessage(ok ? "Bracket imported." : "Import failed — invalid file.");
    setTimeout(() => setImportMessage(null), 2500);
  };

  return (
    <div className="controls" aria-label="Bracket controls">
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={() => setShowConfirm(true)}
      >
        Reset all results
      </button>
      <button type="button" className="btn btn-sm" onClick={handleExport}>
        Export JSON
      </button>
      <button type="button" className="btn btn-sm" onClick={handleImportClick}>
        Import JSON
      </button>
      <button type="button" className="btn btn-sm" onClick={onPrint}>
        Print
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {importMessage ? (
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {importMessage}
        </span>
      ) : null}

      {showConfirm ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirm(false);
          }}
        >
          <div className="modal">
            <h3 id="confirm-title">Reset the bracket?</h3>
            <p>
              This will clear every score and winner. All teams will go back to
              their starting slots. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  onReset();
                  setShowConfirm(false);
                }}
              >
                Yes, reset everything
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
