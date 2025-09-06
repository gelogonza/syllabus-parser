"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, File as FileIcon, X, AlertCircle, CheckCircle } from 'lucide-react';
import { fileUploadSchema } from '@/lib/utils/validation';
import { z } from 'zod';

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number;
}

export function UploadCard() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('file');
  const [textContent, setTextContent] = useState('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle accepted files
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'pending',
    }));

    // Validate files
    newFiles.forEach(uploadedFile => {
      try {
        fileUploadSchema.parse({ file: uploadedFile.file });
      } catch (error) {
        if (error instanceof z.ZodError) {
          uploadedFile.status = 'error';
          uploadedFile.error = error.issues[0].message;
        }
      }
    });

    // Handle rejected files
    const rejectedFileUploads: UploadedFile[] = rejectedFiles.map(rejection => ({
      file: rejection.file,
      id: Math.random().toString(36).substring(7),
      status: 'error',
      error: rejection.errors[0].message,
    }));

    setFiles(prev => [...prev, ...newFiles, ...rejectedFileUploads]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const uploadedFile of pendingFiles) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ));

        // Create FormData
        const formData = new FormData();
        formData.append('file', uploadedFile.file);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id && f.progress !== undefined
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ));
        }, 200);

        // Upload file
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();

        // Update status to success
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'success', progress: 100 }
            : f
        ));

        // Store recent syllabus ID for export functionality
        localStorage.setItem('recentSyllabusId', result.syllabusId);
        
        // Redirect to review page after successful upload
        setTimeout(() => {
          window.location.href = `/review/${result.syllabusId}`;
        }, 1000);

      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { 
                ...f, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed',
                progress: undefined
              }
            : f
        ));
      }
    }
  };

  const uploadTextContent = async () => {
    if (!textContent.trim()) return;

    try {
      // Create a text file from the content
      const textFile = new File([textContent], 'pasted-syllabus.txt', { type: 'text/plain' });
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', textFile);

      // Upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Store recent syllabus ID for export functionality
      localStorage.setItem('recentSyllabusId', result.syllabusId);

      // Redirect to review page
      window.location.href = `/review/${result.syllabusId}`;

    } catch (error) {
      console.error('Text upload failed:', error);
      // You could add error state handling here
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasValidFiles = files.some(f => f.status === 'pending');
  const isUploading = files.some(f => f.status === 'uploading');

  return (
    <div className="space-y-6">
      {/* Input Method Toggle */}
      <div className="flex items-center justify-center space-x-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => setInputMethod('file')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            inputMethod === 'file'
              ? "bg-bg text-fg shadow-sm"
              : "text-fg/60 hover:text-fg"
          )}
        >
          Upload File
        </button>
        <button
          onClick={() => setInputMethod('text')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            inputMethod === 'text'
              ? "bg-bg text-fg shadow-sm"
              : "text-fg/60 hover:text-fg"
          )}
        >
          Paste Text
        </button>
      </div>

      {inputMethod === 'file' ? (
        /* File Upload Area */
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-accent bg-accent/5" 
              : "border-border hover:border-accent hover:bg-muted/50",
            isUploading && "pointer-events-none opacity-50"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-fg/40" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-heading text-fg">
                {isDragActive ? 'Drop your syllabus here' : 'Upload your syllabus'}
              </h3>
              <p className="text-sm text-fg/60">
                Drag and drop your file here, or click to browse
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-fg/50">
                Supports PDF, DOCX, and TXT files up to 10MB
              </div>
              <div className="text-xs text-green-600">
                PDF parsing powered by Python microservice
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Text Input Area */
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-heading text-fg">Paste your syllabus text</h3>
            <p className="text-sm text-fg/60">
              Copy and paste the content of your syllabus directly
            </p>
          </div>
          
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste your syllabus content here...

Example:
Computer Science 101 - Fall 2024

Assignment 1 due September 15th at 11:59 PM - 10% of grade
Midterm exam October 15th at 2:00 PM - 30% of grade
Final project due December 1st - 25% of grade"
            className="w-full min-h-[300px] p-4 border border-border rounded-lg bg-bg text-fg placeholder:text-fg/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-none"
          />
          
          {textContent.trim() && (
            <div className="flex justify-end">
              <Button 
                onClick={uploadTextContent}
                size="lg"
              >
                Process Text
              </Button>
            </div>
          )}
        </div>
      )}

      {/* File List - only show for file upload mode */}
      {inputMethod === 'file' && files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-heading text-fg">Selected Files</h4>
          
          <div className="space-y-2">
            {files.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center space-x-3 p-3 bg-muted rounded-lg"
              >
                <div className="flex-shrink-0">
                  <FileIcon className="h-5 w-5 text-fg/60" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-fg truncate">
                      {uploadedFile.file.name}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      {uploadedFile.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      {uploadedFile.status === 'pending' && (
                        <button
                          onClick={() => removeFile(uploadedFile.id)}
                          className="p-1 hover:bg-bg rounded"
                        >
                          <X className="h-4 w-4 text-fg/40" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-fg/50">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                    
                    {uploadedFile.status === 'uploading' && (
                      <div className="text-xs text-accent">
                        {uploadedFile.progress}%
                      </div>
                    )}
                  </div>
                  
                  {uploadedFile.status === 'uploading' && uploadedFile.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-bg rounded-full h-1.5">
                        <div
                          className="bg-accent h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadedFile.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {uploadedFile.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {uploadedFile.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button - only show for file upload mode */}
      {inputMethod === 'file' && hasValidFiles && (
        <div className="flex justify-end">
          <Button 
            onClick={uploadFiles}
            disabled={isUploading}
            size="lg"
          >
            {isUploading ? 'Uploading...' : 'Upload & Parse'}
          </Button>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-heading text-fg mb-2">What we support</h4>
        <ul className="text-sm text-fg/70 space-y-1">
          <li>• Course syllabi with assignment schedules</li>
          <li>• Reading lists with due dates</li>
          <li>• Exam and quiz schedules</li>
          <li>• Project deadlines and milestones</li>
          <li>• Class meeting times and locations</li>
        </ul>
      </div>
    </div>
  );
}
