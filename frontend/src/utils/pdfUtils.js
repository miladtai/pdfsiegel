export const formatStampDate = () => {
  const now = new Date();
  const date = now.toLocaleDateString('de-DE');
  const time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  return `${date}, ${time} Uhr`;
};

export const createSignatureFormData = (selectedFile, stampPosition, pageNumber, user, formatStampDate, pdfDimensions) => {
  const formData = new FormData();
  formData.append('pdf', selectedFile);
  
  // Verwende die tatsächlichen PDF-Dimensionen für präzise Positionierung
  const pdfElement = document.querySelector('.react-pdf__Page canvas');
  if (pdfElement && pdfDimensions) {
    const canvasRect = pdfElement.getBoundingClientRect();
    
    // Berechne das Verhältnis zwischen Canvas-Anzeige und tatsächlicher PDF-Größe
    const scaleX = pdfDimensions.width / canvasRect.width;
    const scaleY = pdfDimensions.height / canvasRect.height;
    
    // Konvertiere Pixel-Position zu PDF-Punkten (1 Punkt = 1/72 Zoll)
    const pdfX = stampPosition.x * scaleX;
    const pdfY = stampPosition.y * scaleY;
    
    // Berechne relative Position als Prozentsatz der PDF-Seite
    const relativeX = (pdfX / pdfDimensions.width) * 100;
    const relativeY = (pdfY / pdfDimensions.height) * 100;
    
    console.log('Frontend-Position (px):', { x: stampPosition.x, y: stampPosition.y });
    console.log('Canvas-Größe:', { width: canvasRect.width, height: canvasRect.height });
    console.log('PDF-Dimensionen (Punkte):', pdfDimensions);
    console.log('Skalierung:', { scaleX, scaleY });
    console.log('PDF-Position (Punkte):', { x: pdfX, y: pdfY });
    console.log('Relative Position (%):', { x: relativeX, y: relativeY });
    
    // Stempel-Daten für Backend
    formData.append('stamp_x_percent', relativeX.toFixed(2));
    formData.append('stamp_y_percent', relativeY.toFixed(2));
    formData.append('stamp_x_points', pdfX.toFixed(2));
    formData.append('stamp_y_points', pdfY.toFixed(2));
    formData.append('stamp_page', pageNumber);
    
    // Stempel-Größe in PDF-Punkten
    const stampWidthPoints = 200 * scaleX;
    const stampHeightPoints = 80 * scaleY;
    formData.append('stamp_width', 200); // Frontend-Größe in Pixeln
    formData.append('stamp_height', 80); // Frontend-Größe in Pixeln
    formData.append('stamp_width_points', stampWidthPoints.toFixed(2)); // PDF-Größe in Punkten
    formData.append('stamp_height_points', stampHeightPoints.toFixed(2)); // PDF-Größe in Punkten
    
    // PDF-Metadaten für Backend-Validierung
    formData.append('pdf_width', pdfDimensions.width);
    formData.append('pdf_height', pdfDimensions.height);
    formData.append('canvas_width', canvasRect.width);
    formData.append('canvas_height', canvasRect.height);
    
    // Stempel-Inhalt
    formData.append('stamp_name', `${user?.firstname || 'Max'} ${user?.lastname || 'Mustermann'}`);
    formData.append('stamp_method', `Signiert mit AD ${user?.ad_number || '00000'}`);
    formData.append('stamp_date', formatStampDate());
    formData.append('stamp_user_id', user?.ad_number || '00000');
  }
  
  return formData;
};
