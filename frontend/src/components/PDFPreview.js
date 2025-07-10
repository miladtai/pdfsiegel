import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import SignatureStamp from './SignatureStamp';

// PDF.js Worker lokal konfigurieren
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFPreview = ({ 
  selectedFile,
  fileUrl,
  numPages,
  pageNumber,
  showStamp,
  stampPosition,
  isDragging,
  user,
  onDocumentLoadSuccess,
  onPageLoadSuccess,
  onDocumentLoadError,
  onStampMouseDown,
  onContainerMouseMove,
  onContainerMouseUp,
  onRemoveStamp,
  onPrevPage,
  onNextPage,
  onClosePreview,
  formatStampDate
}) => {
  return (
    <div className="mt-4">
      <Card className="border-primary">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="h6 mb-0">PDF Vorschau: {selectedFile.name}</h3>
          <Button
            variant="light"
            size="sm"
            onClick={onClosePreview}
            title="Vorschau ausblenden"
          >
            ×
          </Button>
        </Card.Header>
        <Card.Body 
          className={`pdf-preview-container ${isDragging ? 'dragging' : ''}`}
          onMouseMove={onContainerMouseMove}
          onMouseUp={onContainerMouseUp}
          onMouseLeave={onContainerMouseUp}
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
                    onLoadSuccess={onPageLoadSuccess}
                  />
                  
                  {/* Draggable Signature Stamp */}
                  {showStamp && (
                    <SignatureStamp
                      user={user}
                      position={stampPosition}
                      isDragging={isDragging}
                      onMouseDown={onStampMouseDown}
                      onRemove={onRemoveStamp}
                      formatStampDate={formatStampDate}
                    />
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
                    onClick={onPrevPage}
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
                    onClick={onNextPage}
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
  );
};

export default PDFPreview;
