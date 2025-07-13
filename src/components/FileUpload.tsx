import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import "./FileUpload.css"

interface ProcessingStatus {
    step: 'uploading' | 'extracting' | 'processing' | 'complete' | 'error';
    progress: number;
    message: string;
}

interface UploadedDocument {
    id: string;
    name: string;
    size: number;
    extractedText: string;
    textLength: number;
    chunksStored: number;
    processingTime: number;
    uploadedAt: string;
    filePath?: string;
}

interface FileUploadProps {
    onUploadComplete: (document: UploadedDocument) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<ProcessingStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // File validation
    const validateFile = (file: File): string | null => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            return 'Please select a PDF or image file (JPG, PNG, BMP, TIFF)';
        }
        if (file.size > maxSize) {
            return 'File size must be less than 10MB';
        }
        return null;
    };

    // Handle drag events
    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle drop
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    // Handle file selection
    const handleFileSelect = (selectedFile: File) => {
        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            return;
        }

        setFile(selectedFile);
        setError(null);
        processFile(selectedFile);
    };

    // Process file through the pipeline
    const processFile = async (fileToProcess: File) => {
        try {
            // Step 1: Upload file
            setStatus({ step: 'uploading', progress: 0, message: 'Uploading file...' });

            const formData = new FormData();
            formData.append('document', fileToProcess);

            console.log('Uploading to:', 'http://localhost:5000/api/upload');
            const uploadResponse = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
            });

            // ADD DEBUGGING HERE
            console.log('Upload response status:', uploadResponse.status);
            console.log('Upload response ok:', uploadResponse.ok);
            console.log('Upload response type:', uploadResponse.headers.get('content-type'));

            if (!uploadResponse.ok) {
                // Get error details before throwing
                const errorText = await uploadResponse.text();
                console.log('Error response text:', errorText);
                throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
            }

            // ADD JSON PARSING DEBUG
            const responseText = await uploadResponse.text();
            console.log('Raw response text:', responseText);

            let uploadResult;
            try {
                uploadResult = JSON.parse(responseText);
                console.log('Parsed upload result:', uploadResult);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.log('Response that failed to parse:', responseText);
                throw new Error('Server returned invalid JSON');
            }

            setStatus({ step: 'uploading', progress: 30, message: 'Upload complete!' });

            // Step 2: Extract text
            setStatus({ step: 'extracting', progress: 30, message: 'Extracting text...' });

            const extractResponse = await fetch('http://localhost:5000/api/extract-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: uploadResult.file.path }),
            });

            if (!extractResponse.ok) {
                throw new Error('Text extraction failed');
            }

            const extractResult = await extractResponse.json();
            setStatus({ step: 'extracting', progress: 60, message: 'Text extracted successfully!' });

            // Step 3: Process for AI
            setStatus({ step: 'processing', progress: 60, message: 'Processing for AI...' });

            const documentId = uploadResult.file.fileName.split('.')[0];
            const processResponse = await fetch('http://localhost:5000/api/process-document', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`

                },
                body: JSON.stringify({
                    filePath: uploadResult.file.path,
                    extractedText: extractResult.text,
                    documentId: documentId,
                }),
            });

            if (!processResponse.ok) {
                throw new Error('Document processing failed');
            }

            const processResult = await processResponse.json();
            setStatus({ step: 'complete', progress: 100, message: 'Processing complete!' });

            // Create document object
            const document: UploadedDocument = {
                id: documentId,
                name: uploadResult.file.originalName,
                size: uploadResult.file.size,
                extractedText: extractResult.text,
                textLength: extractResult.text_length || extractResult.text.length,
                chunksStored: processResult.chunks_stored,
                processingTime: processResult.processing_time_ms,
                uploadedAt: new Date().toISOString(),
                filePath: uploadResult.file.path
            };

            onUploadComplete(document);
            setTimeout(() => {
                resetUpload();
            }, 2000);

        } catch (error) {
            console.error('Processing error:', error);
            setStatus({
                step: 'error',
                progress: 0,
                message: error instanceof Error ? error.message : 'An error occurred'
            });
            setError(error instanceof Error ? error.message : 'An error occurred');
        }
    };
    // Reset upload
    const resetUpload = () => {
        setFile(null);
        setStatus(null);
        setError(null);
    };

    // Get file icon
    const getFileIcon = (file: File) => {
        if (file.type === 'application/pdf') return '📄';
        if (file.type.startsWith('image/')) return '🖼️';
        return '📁';
    };

    return (
        <div>
            {!file && (
                <div
                    className={`file-upload-dropzone ${dragActive ? 'drag-active' : ''}`}
                    style={{
                        padding: '3rem',
                        textAlign: 'center' as const,
                        cursor: 'pointer',
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="file-icon">📄</div>
                    <h3>Drop your document here</h3>
                    <p>Or click to browse files</p>
                    <button className="btn-primary">Choose File</button>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        Supports PDF, JPG, PNG, BMP, TIFF (max 10MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        style={{ display: 'none' }}
                        accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            e.target.files?.[0] && handleFileSelect(e.target.files[0])
                        }
                    />
                </div>
            )}

            {file && (
                <div className="file-details-card">
                    <div className="file-info-section">
                        <div className="file-icon-container">
                            <span>{getFileIcon(file)}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4>{file.name}</h4>
                            <p style={{ fontSize: '0.875rem' }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button className="close-button" onClick={resetUpload}>
                            ✕
                        </button>
                    </div>

                    {status && (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                            }}>
                                <span className="status-message">{status.message}</span>
                                <span className="status-percentage">{status.progress}%</span>
                            </div>
                            <div className="progress-container">
                                <div
                                    className={`progress-bar ${status.step === 'error' ? 'error' : ''}`}
                                    style={{ width: `${status.progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {status?.step === 'complete' && (
                        <div className="success-message">
                            ✅ Document processed successfully! Ready for questions.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUpload;