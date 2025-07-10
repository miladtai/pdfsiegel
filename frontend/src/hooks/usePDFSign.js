import { useState, useCallback } from 'react';
import axios from 'axios';

export const usePDFStamp = () => {
  const [showStamp, setShowStamp] = useState(false);
  const [stampPosition, setStampPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleStampMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    // Berechne Offset: Wo wurde im Stempel geklickt relativ zur Container-Position
    const containerRect = e.target.closest('.pdf-preview-container').getBoundingClientRect();
    
    // Der Offset ist die Differenz zwischen Mausposition und aktueller Stempel-Position
    setDragOffset({
      x: e.clientX - containerRect.left - stampPosition.x,
      y: e.clientY - containerRect.top - stampPosition.y
    });
  }, [stampPosition]);

  const handleContainerMouseMove = useCallback((e) => {
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
  }, [isDragging, dragOffset]);

  const handleContainerMouseUp = useCallback((e) => {
    if (isDragging) {
      e.preventDefault();
      setIsDragging(false);
    }
  }, [isDragging]);

  const removeStamp = useCallback(() => {
    setShowStamp(false);
    setStampPosition({ x: 100, y: 100 });
  }, []);

  const resetStamp = useCallback(() => {
    setShowStamp(false);
    setStampPosition({ x: 100, y: 100 });
    setIsDragging(false);
  }, []);

  return {
    showStamp,
    setShowStamp,
    stampPosition,
    setStampPosition,
    isDragging,
    handleStampMouseDown,
    handleContainerMouseMove,
    handleContainerMouseUp,
    removeStamp,
    resetStamp
  };
};

export const useSignatureAPI = () => {
  const [uploading, setUploading] = useState(false);
  const [signatures, setSignatures] = useState([]);

  const loadUserSignatures = useCallback(async () => {
    try {
      const response = await axios.get('/api/signatures.php');
      setSignatures(response.data.signatures || []);
    } catch (error) {
      console.error('Fehler beim Laden der Signaturen:', error);
    }
  }, []);

  const signPDF = useCallback(async (formData) => {
    setUploading(true);
    try {
      const response = await axios.post('/api/signatures.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Signatur-Fehler:', error);
      console.error('Response data:', error.response?.data);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDownload = useCallback(async (checkNumber) => {
    try {
      await axios.put('/api/signatures.php', { check_number: checkNumber });
      await loadUserSignatures();
      return { success: true, message: 'Signatur erfolgreich als heruntergeladen markiert.', checkNumber };
    } catch (error) {
      throw new Error('Fehler beim Markieren als heruntergeladen.');
    }
  }, [loadUserSignatures]);

  const deleteSignature = useCallback(async (id) => {
    if (!window.confirm('Möchten Sie diese Signatur wirklich löschen?')) {
      return;
    }

    try {
      await axios.delete('/api/signatures.php', { data: { id } });
      await loadUserSignatures();
      return { success: true, message: 'Signatur erfolgreich gelöscht.' };
    } catch (error) {
      throw new Error('Fehler beim Löschen der Signatur oder Signatur bereits heruntergeladen.');
    }
  }, [loadUserSignatures]);

  return {
    uploading,
    signatures,
    loadUserSignatures,
    signPDF,
    handleDownload,
    deleteSignature
  };
};

export const usePDFPreview = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfDimensions, setPdfDimensions] = useState(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
  }, []);

  const onPageLoadSuccess = useCallback((page) => {
    // Speichere die tatsächlichen PDF-Dimensionen der aktuellen Seite
    const { width, height } = page.getViewport({ scale: 1.0 });
    setPdfDimensions({ width, height });
    console.log('PDF-Seiten-Dimensionen:', { width, height });
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    console.error('PDF-Ladenfehler:', error);
    throw new Error('Fehler beim Laden der PDF-Vorschau.');
  }, []);

  const goToPrevPage = useCallback(() => {
    setPageNumber(page => Math.max(1, page - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber(page => Math.min(numPages, page + 1));
  }, [numPages]);

  const setFile = useCallback((file) => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setPageNumber(1);
    setShowPreview(true);
    setPdfDimensions(null); // Reset PDF-Dimensionen
  }, [fileUrl]);

  const resetPreview = useCallback(() => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFileUrl(null);
    setNumPages(null);
    setPageNumber(1);
    setShowPreview(false);
    setPdfDimensions(null);
  }, [fileUrl]);

  return {
    showPreview,
    setShowPreview,
    fileUrl,
    numPages,
    pageNumber,
    pdfDimensions,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
    onDocumentLoadError,
    goToPrevPage,
    goToNextPage,
    setFile,
    resetPreview
  };
};
