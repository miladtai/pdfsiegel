import React from 'react';
import { Form } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';

const PDFUpload = ({ onFileSelect, selectedFile, uploading, error }) => {
  const onDrop = React.useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    } else {
      // Fehler wird von Parent-Komponente behandelt
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: uploading
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'dragover' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="PDF-Datei hochladen"
      >
        <input {...getInputProps()} aria-describedby="upload-help" />
        <div className="upload-icon">
          {isDragActive ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18a4.6 4.4 0 0 1 0 -9h0a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1"/>
              <path d="M9 15l3 -3l3 3M12 12v9"/>
            </svg>
          )}
        </div>
        <div>
          {selectedFile ? (
            <div>
              <h3 className="h6 text-success">Datei ausgewählt:</h3>
              <p className="mb-0 fw-bold">{selectedFile.name}</p>
              <p className="text-muted mb-0">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : isDragActive ? (
            <div>
              <h3 className="h6 mb-2">Datei hier ablegen</h3>
              <p className="text-muted mb-0">Lassen Sie Ihre PDF-Datei hier fallen</p>
            </div>
          ) : (
            <div>
              <h3 className="h6 mb-2">Klicken oder Datei hierher ziehen</h3>
              <p className="text-muted mb-0">
                Unterstützt wird eine einzige oder Bulk-Upload. Maximale Dateigröße 5MB.
              </p>
            </div>
          )}
        </div>
      </div>

      <div id="upload-help" className="form-text mt-2">
        Nur PDF-Dateien sind erlaubt. Maximale Dateigröße: 5MB
      </div>

      {/* Alternative File Input */}
      <div className="mt-3">
        <Form.Group>
          <Form.Label htmlFor="file-input">Oder Datei direkt auswählen:</Form.Label>
          <Form.Control
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </Form.Group>
      </div>
    </>
  );
};

export default PDFUpload;
