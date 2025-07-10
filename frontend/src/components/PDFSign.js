import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import PDFUpload from './PDFUpload';
import PDFPreview from './PDFPreview';
import SignatureList from './SignatureList';
import { usePDFStamp, useSignatureAPI, usePDFPreview } from '../hooks/usePDFSign';
import { formatStampDate, createSignatureFormData } from '../utils/pdfUtils';

const PDFSign = ({ user, active }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  // Custom Hooks für verschiedene Bereiche
  const stampHook = usePDFStamp();
  const apiHook = useSignatureAPI();
  const previewHook = usePDFPreview();

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      previewHook.setFile(file);
      setError('');
      stampHook.resetStamp();
    } else {
      setError('Bitte wählen Sie eine gültige PDF-Datei aus.');
    }
  };

  const handleSignPDF = async () => {
    if (!selectedFile) {
      setError('Bitte wählen Sie eine PDF-Datei aus.');
      return;
    }

    // Zeige Stempel für Positionierung an
    if (!stampHook.showStamp) {
      stampHook.setShowStamp(true);
      stampHook.setStampPosition({ x: 100, y: 100 });
      return;
    }

    setError('');

    try {
      const formData = createSignatureFormData(
        selectedFile, 
        stampHook.stampPosition, 
        previewHook.pageNumber, 
        user, 
        formatStampDate,
        previewHook.pdfDimensions
      );

      if (!document.querySelector('.react-pdf__Page canvas') || !previewHook.pdfDimensions) {
        setError('PDF-Element nicht gefunden oder PDF-Dimensionen nicht verfügbar. Bitte warten Sie, bis die PDF vollständig geladen ist.');
        return;
      }

      const response = await apiHook.signPDF(formData);

      if (response.success) {
        setSuccess({
          message: 'PDF erfolgreich signiert und Stempel eingebettet!',
          checkNumber: response.signature?.check_number || 'DEMO-' + Date.now(),
          signatureCount: response.signature?.signature_count || 1,
          details: `Der Stempel wurde an Position ${stampHook.stampPosition.x}px/${stampHook.stampPosition.y}px auf Seite ${previewHook.pageNumber} platziert.`
        });
        resetFileSelection();
        apiHook.loadUserSignatures();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Fehler beim Signieren der PDF';
      setError(errorMessage);
    }
  };

  const handleDownload = async (checkNumber) => {
    try {
      const result = await apiHook.handleDownload(checkNumber);
      setSuccess(result);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteSignature = async (id) => {
    try {
      const result = await apiHook.deleteSignature(id);
      if (result) {
        setSuccess(result);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const resetFileSelection = () => {
    setSelectedFile(null);
    previewHook.resetPreview();
    stampHook.resetStamp();
  };

  // Lade Signaturen beim Aktivieren der Komponente
  useEffect(() => {
    if (active) {
      apiHook.loadUserSignatures();
    }
  }, [active]);

  // Cleanup URL beim Komponenten-Unmount
  useEffect(() => {
    return () => {
      previewHook.resetPreview();
    };
  }, []);

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

          <PDFUpload 
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            uploading={apiHook.uploading}
            error={error}
          />

          {/* Stempel-Hinweis */}
          {stampHook.showStamp && (
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
              disabled={!selectedFile || apiHook.uploading}
              size="lg"
            >
              {apiHook.uploading ? 'Signiere...' : stampHook.showStamp ? 'Signatur bestätigen' : 'Signatur generieren'}
            </Button>
            
            {selectedFile && (
              <>
                {stampHook.showStamp && (
                  <Button
                    variant="outline-warning"
                    onClick={() => stampHook.setShowStamp(false)}
                    disabled={apiHook.uploading}
                  >
                    Stempel ausblenden
                  </Button>
                )}
                {!previewHook.showPreview && (
                  <Button
                    variant="outline-primary"
                    onClick={() => previewHook.setShowPreview(true)}
                    disabled={apiHook.uploading}
                  >
                    PDF-Vorschau anzeigen
                  </Button>
                )}
                <Button
                  variant="outline-secondary"
                  onClick={resetFileSelection}
                  disabled={apiHook.uploading}
                >
                  Auswahl zurücksetzen
                </Button>
              </>
            )}
          </div>

          {/* PDF Vorschau */}
          {selectedFile && previewHook.showPreview && (
            <PDFPreview
              selectedFile={selectedFile}
              fileUrl={previewHook.fileUrl}
              numPages={previewHook.numPages}
              pageNumber={previewHook.pageNumber}
              showStamp={stampHook.showStamp}
              stampPosition={stampHook.stampPosition}
              isDragging={stampHook.isDragging}
              user={user}
              onDocumentLoadSuccess={previewHook.onDocumentLoadSuccess}
              onPageLoadSuccess={previewHook.onPageLoadSuccess}
              onDocumentLoadError={previewHook.onDocumentLoadError}
              onStampMouseDown={stampHook.handleStampMouseDown}
              onContainerMouseMove={stampHook.handleContainerMouseMove}
              onContainerMouseUp={stampHook.handleContainerMouseUp}
              onRemoveStamp={stampHook.removeStamp}
              onPrevPage={previewHook.goToPrevPage}
              onNextPage={previewHook.goToNextPage}
              onClosePreview={() => previewHook.setShowPreview(false)}
              formatStampDate={formatStampDate}
            />
          )}
        </Card.Body>
      </Card>

      {/* Signierte Dokumente */}
      <SignatureList
        signatures={apiHook.signatures}
        onDownload={handleDownload}
        onDelete={handleDeleteSignature}
      />
    </div>
  );
};

export default PDFSign;
