"use client";

import React, { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";

interface UploadZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

export default function UploadZone({ file, onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (f: File): boolean => {
      setError(null);
      if (f.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        setError("File is too large. Maximum size is 10MB.");
        return false;
      }
      return true;
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && validateFile(selectedFile)) {
        onFileSelect(selectedFile);
      }
    },
    [onFileSelect, validateFile]
  );

  const removeFile = useCallback(() => {
    onFileSelect(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onFileSelect]);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-2xl border-2 border-dashed p-12
                transition-all duration-300 text-center group
                ${
                  isDragging
                    ? "border-accent bg-accent/10 glow"
                    : "border-border hover:border-accent/50 hover:bg-surface-light/50"
                }
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleChange}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-4">
                <div
                  className={`
                    p-4 rounded-2xl transition-all duration-300
                    ${
                      isDragging
                        ? "bg-accent/20 text-accent"
                        : "bg-surface-lighter text-gray-400 group-hover:text-accent group-hover:bg-accent/10"
                    }
                  `}
                >
                  <Upload className="w-8 h-8" />
                </div>

                <div>
                  <p className="text-lg font-medium text-white">
                    {isDragging
                      ? "Drop your PDF here"
                      : "Upload your CliftonStrengths report"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Drag & drop your Gallup PDF or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF format, max 10MB
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{file.name}</p>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                onClick={removeFile}
                className="p-2 rounded-lg hover:bg-surface-lighter text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-red-400 text-sm mt-3 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
