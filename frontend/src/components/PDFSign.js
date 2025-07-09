import React, { useState, useCallback } from 'react';
import { Card, Button, Alert, Form, Row, Col, Badge, Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import axios from 'axios';

// PDF.js Worker lokal konfigurieren - verwende lokale Datei
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFSign = ({ user, active }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  
  // Stempel-Funktionalität
  const [showStamp, setShowStamp] = useState(false);
  const [stampPosition, setStampPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Dropzone für Datei-Upload
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      // Erstelle URL für PDF-Vorschau
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setError('');
      setPageNumber(1); // Reset zur ersten Seite
      setShowPreview(true); // Automatisch Vorschau anzeigen
    } else {
      setError('Bitte wählen Sie eine gültige PDF-Datei aus.');
    }
  }, []);

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
      setSelectedFile(file);
      // Erstelle URL für PDF-Vorschau
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setError('');
      setPageNumber(1); // Reset zur ersten Seite
      setShowPreview(true); // Automatisch Vorschau anzeigen
    }
  };

  const handleSignPDF = async () => {
    if (!selectedFile) {
      setError('Bitte wählen Sie eine PDF-Datei aus.');
      return;
    }

    // Zeige Stempel für Positionierung an
    if (!showStamp) {
      setShowStamp(true);
      setStampPosition({ x: 100, y: 100 }); // Reset Position
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      
      // Berechne relative Position basierend auf PDF-Größe
      const pdfElement = document.querySelector('.react-pdf__Page canvas');
      if (pdfElement && showStamp) {
        const pdfRect = pdfElement.getBoundingClientRect();
        const relativeX = (stampPosition.x / pdfRect.width) * 100; // Prozent
        const relativeY = (stampPosition.y / pdfRect.height) * 100; // Prozent
        
        console.log('Stempel-Position:', { x: stampPosition.x, y: stampPosition.y });
        console.log('PDF-Größe:', { width: pdfRect.width, height: pdfRect.height });
        console.log('Relative Position:', { x: relativeX, y: relativeY });
        
        // Stempel-Daten für Backend
        formData.append('stamp_x_percent', relativeX.toFixed(2));
        formData.append('stamp_y_percent', relativeY.toFixed(2));
        formData.append('stamp_page', pageNumber);
        formData.append('stamp_width', 200); // Stempel-Breite in Pixeln
        formData.append('stamp_height', 80); // Stempel-Höhe in Pixeln
        
        // Stempel-Inhalt
        formData.append('stamp_name', `${user?.firstname || 'Max'} ${user?.lastname || 'Mustermann'}`);
        formData.append('stamp_method', `Signiert mit AD ${user?.ad_number || '00000'}`);
        formData.append('stamp_date', formatStampDate());
        formData.append('stamp_user_id', user?.ad_number || '00000');
      } else if (showStamp) {
        setError('PDF-Element nicht gefunden. Bitte warten Sie, bis die PDF vollständig geladen ist.');
        setUploading(false);
        return;
      }

      const response = await axios.post('/auth.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        setSuccess({
          message: 'PDF erfolgreich signiert und Stempel eingebettet!',
          checkNumber: response.data.signature?.check_number || 'DEMO-' + Date.now(),
          signatureCount: response.data.signature?.signature_count || 1,
          details: `Der Stempel wurde an Position ${stampPosition.x}px/${stampPosition.y}px auf Seite ${pageNumber} platziert.`
        });
        resetFileSelection();
        loadUserSignatures();
      }
    } catch (error) {
      console.error('Signatur-Fehler:', error);
      console.error('Response data:', error.response?.data);
      const errorMessage = error.response?.data?.error || 'Fehler beim Signieren der PDF';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const loadUserSignatures = async () => {
    try {
      const response = await axios.get('/api/signatures.php');
      setSignatures(response.data.signatures || []);
    } catch (error) {
      console.error('Fehler beim Laden der Signaturen:', error);
    }
  };

  const handleDownload = async (checkNumber) => {
    try {
      // Signatur als heruntergeladen markieren
      await axios.put('/api/signatures.php', { check_number: checkNumber });
      setSuccess({
        message: 'Signatur erfolgreich als heruntergeladen markiert.',
        checkNumber: checkNumber
      });
      loadUserSignatures();
    } catch (error) {
      setError('Fehler beim Markieren als heruntergeladen.');
    }
  };

  const deleteSignature = async (id) => {
    if (!window.confirm('Möchten Sie diese Signatur wirklich löschen?')) {
      return;
    }

    try {
      await axios.delete('/api/signatures.php', { data: { id } });
      setSuccess({ message: 'Signatur erfolgreich gelöscht.' });
      loadUserSignatures();
    } catch (error) {
      setError('Fehler beim Löschen der Signatur oder Signatur bereits heruntergeladen.');
    }
  };

  // PDF-Vorschau Funktionen
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF-Ladenfehler:', error);
    setError('Fehler beim Laden der PDF-Vorschau.');
  };

  const goToPrevPage = () => {
    setPageNumber(page => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setPageNumber(page => Math.min(numPages, page + 1));
  };

  const resetFileSelection = () => {
    setSelectedFile(null);
    setFileUrl(null);
    setNumPages(null);
    setPageNumber(1);
    setShowPreview(false);
    setShowStamp(false);
    setStampPosition({ x: 100, y: 100 });
  };

  // Stempel-Event-Handler
  const handleStampMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    // Berechne Offset: Wo wurde im Stempel geklickt relativ zur Stempel-Position
    const stampRect = e.target.closest('.signature-stamp').getBoundingClientRect();
    const containerRect = e.target.closest('.pdf-preview-container').getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - stampRect.left,
      y: e.clientY - stampRect.top
    });
  };

  const handleContainerMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      const containerRect = e.currentTarget.getBoundingClientRect();
      
      // Neue Position = Mausposition - Container-Position - Drag-Offset
      const newX = e.clientX - containerRect.left - dragOffset.x;
      const newY = e.clientY - containerRect.top - dragOffset.y;
      
      // Begrenze Position innerhalb des Containers
      const maxX = containerRect.width - 200; // Stempel-Breite
      const maxY = containerRect.height - 80; // Stempel-Höhe
      
      setStampPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleContainerMouseUp = (e) => {
    if (isDragging) {
      e.preventDefault();
      setIsDragging(false);
    }
  };

  const removeStamp = () => {
    setShowStamp(false);
    setStampPosition({ x: 100, y: 100 });
  };

  const formatStampDate = () => {
    const now = new Date();
    const date = now.toLocaleDateString('de-DE');
    const time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return `${date}, ${time} Uhr`;
  };

  // Cleanup URL beim Komponenten-Unmount
  React.useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  // Lade Signaturen beim Aktivieren der Komponente
  React.useEffect(() => {
    if (active) {
      loadUserSignatures();
    }
  }, [active]);

  return (
    <div>
      {/* Erklärender Hinweistext */}
      <Card className="mb-4">
        <Card.Header>
          <h1 className="h4 mb-0">PDF signieren</h1>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <h2 className="h6 mb-3">Anleitung:</h2>
            <ol className="mb-0">
              <li><strong>Datei auswählen:</strong> Wählen Sie Ihre PDF-Datei über den Button „Datei auswählen" aus oder ziehen Sie die Datei per Drag & Drop in das Upload-Feld.</li>
              <li><strong>Signieren starten:</strong> Klicken Sie auf „Signieren", um das Dokument digital zu unterschreiben.</li>
            </ol>
          </div>

          {error && (
            <Alert variant="danger" className="alert-kl-danger" role="alert">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="alert-kl-success" role="alert">
              <div className="d-flex align-items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="me-2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <strong>Erfolgreich!</strong> {success.message}
                  {success.checkNumber && (
                    <div className="mt-1">
                      <strong>Prüfnummer:</strong> <code>{success.checkNumber}</code>
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}

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

          {/* Stempel-Hinweis */}
          {showStamp && (
            <Alert variant="info" className="mt-3">
              <div className="d-flex align-items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="me-2">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <strong>Stempel positionieren:</strong> Ziehen Sie den Signatur-Stempel an die gewünschte Position. 
                  Verwenden Sie das ×-Symbol zum Entfernen oder klicken Sie "Signatur bestätigen" zum Signieren.
                </div>
              </div>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="mt-4 d-flex gap-2">
            <Button
              className="btn-kl-primary"
              onClick={handleSignPDF}
              disabled={!selectedFile || uploading}
              size="lg"
            >
              {uploading ? 'Signiere...' : showStamp ? 'Signatur bestätigen' : 'Signatur generieren'}
            </Button>
            
            {selectedFile && (
              <>
                {showStamp && (
                  <Button
                    variant="outline-warning"
                    onClick={() => setShowStamp(false)}
                    disabled={uploading}
                  >
                    Stempel ausblenden
                  </Button>
                )}
                {!showPreview && (
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowPreview(true)}
                    disabled={uploading}
                  >
                    PDF-Vorschau anzeigen
                  </Button>
                )}
                <Button
                  variant="outline-secondary"
                  onClick={resetFileSelection}
                  disabled={uploading}
                >
                  Auswahl zurücksetzen
                </Button>
              </>
            )}
          </div>

          {/* PDF Vorschau - wird automatisch nach Upload angezeigt */}
          {selectedFile && showPreview && (
            <div className="mt-4">
              <Card className="border-primary">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                  <h3 className="h6 mb-0">PDF Vorschau: {selectedFile.name}</h3>
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => setShowPreview(false)}
                    title="Vorschau ausblenden"
                  >
                    ×
                  </Button>
                </Card.Header>
                <Card.Body 
                  className={`pdf-preview-container ${isDragging ? 'dragging' : ''}`}
                  onMouseMove={handleContainerMouseMove}
                  onMouseUp={handleContainerMouseUp}
                  onMouseLeave={handleContainerMouseUp}
                  style={{ 
                    position: 'relative', 
                    cursor: isDragging ? 'grabbing' : 'default',
                    userSelect: 'none'
                  }}
                >
                  <div className="text-center">
                    {fileUrl && (
                      <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                          <div className="pdf-loading">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Lade PDF...</span>
                            </div>
                            <div className="mt-3">
                              <strong>PDF wird geladen...</strong>
                            </div>
                            <small className="text-muted">Bitte warten Sie einen Moment</small>
                          </div>
                        }
                      >
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <Page
                            pageNumber={pageNumber}
                            width={Math.min(700, window.innerWidth - 150)}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="pdf-preview"
                          />
                          
                          {/* Draggable Signature Stamp */}
                          {showStamp && (
                            <div
                              className={`signature-stamp ${isDragging ? 'dragging' : ''}`}
                              style={{
                                position: 'absolute',
                                left: `${stampPosition.x}px`,
                                top: `${stampPosition.y}px`,
                                cursor: isDragging ? 'grabbing' : 'grab',
                                userSelect: 'none',
                                zIndex: 10
                              }}
                              onMouseDown={handleStampMouseDown}
                            >
                              <div className="stamp-content">
                                {/* Verifizier-Symbol (15%) */}
                                <svg className="stamp-verify-icon" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                
                                {/* Stempel-Informationen (75%) */}
                                <div className="stamp-info">
                                  <div className="stamp-name">
                                    {user?.firstname || 'Max'} {user?.lastname || 'Mustermann'}
                                  </div>
                                  <div className="stamp-datetime">
                                    {formatStampDate()}
                                  </div>
                                  <div className="stamp-method">
                                    Signiert mit AD {user?.ad_number || '00000'}
                                  </div>
                                </div>
                                
                                {/* Schließen-Button (10%) */}
                                <button
                                  className="stamp-close-btn"
                                  onClick={removeStamp}
                                  aria-label="Stempel entfernen"
                                  type="button"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Document>
                    )}
                    
                    {numPages && (
                      <div className="mt-4 d-flex justify-content-center">
                        <div className="pdf-navigation d-flex align-items-center gap-3">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={goToPrevPage}
                            disabled={pageNumber <= 1}
                            className="d-flex align-items-center"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="me-1">
                              <path d="M15 18l-6-6 6-6"/>
                            </svg>
                            Vorherige
                          </Button>
                          
                          <div className="pdf-page-info">
                            Seite <strong>{pageNumber}</strong> von <strong>{numPages}</strong>
                          </div>
                          
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={goToNextPage}
                            disabled={pageNumber >= numPages}
                            className="d-flex align-items-center"
                          >
                            Nächste
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ms-1">
                              <path d="M9 18l6-6-6-6"/>
                            </svg>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Signierte Dokumente */}
      <Card>
        <Card.Header>
          <h2 className="h5 mb-0">Meine signierten Dokumente</h2>
        </Card.Header>
        <Card.Body>
          {signatures.length === 0 ? (
            <p className="text-muted mb-0">Noch keine signierten Dokumente vorhanden.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover" role="table">
                <thead>
                  <tr>
                    <th scope="col">Dateiname</th>
                    <th scope="col">Prüfnummer</th>
                    <th scope="col">Signiert am</th>
                    <th scope="col">Status</th>
                    <th scope="col">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {signatures.map((signature) => (
                    <tr key={signature.id}>
                      <td>
                        <div className="fw-medium">{signature.filename}</div>
                        <small className="text-muted">
                          {signature.signature_count} Signatur(en)
                        </small>
                      </td>
                      <td>
                        <code className="text-primary">{signature.check_number}</code>
                      </td>
                      <td>
                        {new Date(signature.created_at).toLocaleString('de-DE')}
                      </td>
                      <td>
                        {signature.is_downloaded ? (
                          <Badge bg="success">Heruntergeladen</Badge>
                        ) : (
                          <Badge bg="warning">Bereit zum Download</Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {!signature.is_downloaded && (
                            <>
                              <Button
                                size="sm"
                                className="btn-kl-primary"
                                onClick={() => handleDownload(signature.check_number)}
                              >
                                Herunterladen
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => deleteSignature(signature.id)}
                              >
                                Löschen
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PDFSign;
