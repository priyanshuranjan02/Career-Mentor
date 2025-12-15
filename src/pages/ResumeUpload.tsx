import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const ResumeUpload: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      setError('Please upload only PDF or Word documents (max 10MB)');
      return;
    }

    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
      setError(null);

      // Store file info for the interview
      localStorage.setItem('resumeFile', JSON.stringify({
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        uploadDate: new Date().toISOString()
      }));

      toast({
        title: "Resume Uploaded",
        description: `${uploadedFile.name} has been uploaded successfully.`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleContinue = () => {
    if (!file) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume to continue.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to grant permissions
    navigate('/grant-permissions');
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    localStorage.removeItem('resumeFile');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Upload Your Resume
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your resume so we can customize the interview questions for your background
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-8">
              {!file ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
                  <h3 className="text-2xl font-semibold text-foreground mb-3">
                    {isDragActive ? 'Drop your resume here' : 'Drag & Drop Resume'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    or click to browse and select from your device
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <span>PDF</span>
                    <span>•</span>
                    <span>DOC</span>
                    <span>•</span>
                    <span>DOCX</span>
                    <span>•</span>
                    <span>Max 10MB</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Uploaded File Display */}
                  <div className="flex items-center justify-between p-6 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-lg">
                          {file.name}
                        </p>
                        <p className="text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <X className="h-5 w-5 text-destructive" />
                    </button>
                  </div>

                  {/* Success Message */}
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <p className="text-success font-medium mb-2">
                      ✓ Resume Successfully Uploaded
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your interview questions will be tailored based on your experience and skills.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive">{error}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleContinue}
                  disabled={!file}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 flex items-center"
                >
                  Continue to Permissions
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Flow Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <span className="text-primary font-medium">1. Start Interview</span>
            <span>→</span>
            <span className="text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
              2. Upload Resume
            </span>
            <span>→</span>
            <span>3. Grant Permissions</span>
            <span>→</span>
            <span>4. Interview Begins</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeUpload;
