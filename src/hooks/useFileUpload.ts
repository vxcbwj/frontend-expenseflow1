import { useState, useCallback } from 'react';

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'application/pdf'
    ]
  } = options;

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!allowedTypes.includes(file.type)) {
        return `${file.name}: Invalid file type. Allowed: JPG, PNG, WEBP, HEIC, PDF`;
      }
      if (file.size > maxSize) {
        const maxMB = (maxSize / 1024 / 1024).toFixed(1);
        return `${file.name}: File too large. Maximum ${maxMB}MB`;
      }
      return null;
    },
    [allowedTypes, maxSize]
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      newFiles.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(error);
        } else {
          validFiles.push(file);
        }
      });

      // Check total count
      const totalCount = files.length + validFiles.length;
      if (totalCount > maxFiles) {
        validationErrors.push(
          `Maximum ${maxFiles} files allowed. You have ${files.length} files and tried to add ${validFiles.length} more.`
        );
        setErrors(validationErrors);
        return;
      }

      setFiles((prev) => [...prev, ...validFiles]);
      setErrors(validationErrors);
    },
    [files, maxFiles, validateFile]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setErrors([]);
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setErrors([]);
  }, []);

  return {
    files,
    errors,
    addFiles,
    removeFile,
    clearFiles
  };
};
