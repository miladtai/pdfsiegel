<?php
require_once __DIR__ . '/../vendor/autoload.php';

use setasign\Fpdi\Fpdi;

class PDFStamper {
    private $inputFile;
    private $outputFile;
    private $stampData;
    
    public function __construct($inputFile, $outputFile = null) {
        $this->inputFile = $inputFile;
        $this->outputFile = $outputFile ?: $this->generateOutputFilename($inputFile);
        $this->stampData = [];
    }
    
    public function addStamp($stampData) {
        $this->stampData = $stampData;
        return $this;
    }
    
    public function generate() {
        try {
            // Debug-Log
            error_log("PDFStamper: Starting PDF processing for file: " . $this->inputFile);
            error_log("PDFStamper: Stamp data: " . json_encode($this->stampData));
            
            // Prüfe ob Eingabedatei existiert
            if (!file_exists($this->inputFile)) {
                throw new Exception("Input file does not exist: " . $this->inputFile);
            }
            
            // FPDI verwenden für PDF-Manipulation
            $pdf = new Fpdi();
            $pdf->SetAutoPageBreak(false);
            
            // Quell-PDF laden
            $pageCount = $pdf->setSourceFile($this->inputFile);
            error_log("PDFStamper: PDF has {$pageCount} pages");
            
            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                // Template der aktuellen Seite importieren
                $tplId = $pdf->importPage($pageNo);
                
                // Seitengröße ermitteln
                $size = $pdf->getTemplateSize($tplId);
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                
                // Originale Seite verwenden
                $pdf->useTemplate($tplId);
                
                // Stempel nur auf der angegebenen Seite hinzufügen
                if (isset($this->stampData['stamp_page']) && $pageNo == $this->stampData['stamp_page']) {
                    error_log("PDFStamper: Adding stamp to page {$pageNo}");
                    $this->addStampToPage($pdf, $pageNo, $size);
                }
            }
            
            // PDF speichern
            $pdf->Output('F', $this->outputFile);
            error_log("PDFStamper: PDF saved to: " . $this->outputFile);
            
            // Prüfe ob Ausgabedatei erstellt wurde
            if (!file_exists($this->outputFile)) {
                throw new Exception("Output file was not created");
            }
            
            return [
                'success' => true,
                'output_file' => $this->outputFile,
                'stamp_applied' => true
            ];
            
        } catch (Exception $e) {
            error_log("PDFStamper Error: " . $e->getMessage());
            error_log("PDFStamper Trace: " . $e->getTraceAsString());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    private function addStampToPage($pdf, $pageNo, $pageSize) {
        // Stempel-Daten aus Frontend
        $stampX = floatval($this->stampData['stamp_x_points'] ?? 0);
        $stampY = floatval($this->stampData['stamp_y_points'] ?? 0);
        $stampWidth = floatval($this->stampData['stamp_width_points'] ?? 200);
        $stampHeight = floatval($this->stampData['stamp_height_points'] ?? 80);
        
        // PDF-Koordinatensystem: Ursprung ist unten links
        // Frontend-Koordinatensystem: Ursprung ist oben links
        $pageHeight = $pageSize['height'];
        $adjustedY = $pageHeight - $stampY - $stampHeight;
        
        error_log("PDFStamper: Page size: {$pageSize['width']} x {$pageSize['height']}");
        error_log("PDFStamper: Stamp position: x={$stampX}, y={$stampY} (frontend)");
        error_log("PDFStamper: Adjusted position: x={$stampX}, y={$adjustedY} (PDF coords)");
        error_log("PDFStamper: Stamp size: {$stampWidth} x {$stampHeight}");
        
        // Stempel-Hintergrund zeichnen (rosa/rot Hintergrund)
        $pdf->SetFillColor(254, 242, 242); // #fef2f2 (hellrosa)
        $pdf->SetDrawColor(220, 38, 38); // #dc2626 (rot)
        $pdf->SetLineWidth(2);
        $pdf->Rect($stampX, $adjustedY, $stampWidth, $stampHeight, 'DF');
        
        // Grid-Layout: 15% | 75% | 10% = 30pt | 150pt | 20pt bei 200pt Breite
        $col1Width = $stampWidth * 0.15; // 15% für Icon
        $col2Width = $stampWidth * 0.75; // 75% für Text
        $col3Width = $stampWidth * 0.10; // 10% für X-Button
        
        // Verifizier-Symbol in der ersten Spalte (15%)
        $iconX = $stampX + ($col1Width / 2) - 8; // Zentriert in der ersten Spalte
        $iconY = $adjustedY + ($stampHeight / 2) - 8; // Vertikal zentriert
        
        // Häkchen-Symbol mit Kreis zeichnen (vereinfacht)
        $pdf->SetDrawColor(220, 38, 38); // Rot
        $pdf->SetLineWidth(1.5);
        
        // Kreis um das Häkchen (vereinfacht als Rechteck mit abgerundeten Ecken)
        $circleX = $iconX + 2;
        $circleY = $iconY + 2;
        $circleSize = 12;
        $pdf->SetFillColor(255, 255, 255); // Weißer Hintergrund für Icon
        $pdf->Rect($circleX, $circleY, $circleSize, $circleSize, 'D');
        
        // Häkchen mit Linien zeichnen
        $checkX = $circleX + 3;
        $checkY = $circleY + 7;
        $pdf->SetLineWidth(2);
        // Erste Linie des Häkchens (kurzer Strich nach unten-rechts)
        $pdf->Line($checkX, $checkY, $checkX + 2, $checkY + 2);
        // Zweite Linie des Häkchens (längerer Strich nach oben-rechts)
        $pdf->Line($checkX + 2, $checkY + 2, $checkX + 6, $checkY - 2);
        
        // Text-Bereich (75% Spalte)
        $textX = $stampX + $col1Width + 4; // Etwas Abstand zum Icon
        $textWidth = $col2Width - 8; // Abzüglich Padding
        
        // Namen (fett, größer) - erste Zeile
        $nameY = $adjustedY + 15;
        $pdf->SetXY($textX, $nameY);
        $pdf->SetTextColor(55, 65, 81); // #374151 (dunkelgrau)
        $pdf->SetFont('Arial', 'B', 10);
        $name = $this->stampData['stamp_name'] ?? 'Max Mustermann';
        $pdf->Cell($textWidth, 12, $this->convertToLatin1($name), 0, 0, 'L');
        
        // Datum und Zeit - zweite Zeile
        $dateY = $adjustedY + 30;
        $pdf->SetXY($textX, $dateY);
        $pdf->SetFont('Arial', '', 8);
        $pdf->SetTextColor(107, 114, 128); // #6b7280 (grau)
        $date = $this->stampData['stamp_date'] ?? date('d.m.Y, H:i') . ' Uhr';
        $pdf->Cell($textWidth, 10, $this->convertToLatin1($date), 0, 0, 'L');
        
        // Methode/AD-Nummer - dritte Zeile
        $methodY = $adjustedY + 45;
        $pdf->SetXY($textX, $methodY);
        $pdf->SetFont('Arial', '', 8);
        $pdf->SetTextColor(107, 114, 128); // #6b7280 (grau)
        $method = $this->stampData['stamp_method'] ?? 'Signiert mit AD 00000';
        $pdf->Cell($textWidth, 10, $this->convertToLatin1($method), 0, 0, 'L');
        
        // X-Button rechts (10% Spalte)
        $closeX = $stampX + $col1Width + $col2Width + ($col3Width / 2) - 6;
        $closeY = $adjustedY + 10;
        $pdf->SetXY($closeX, $closeY);
        $pdf->SetTextColor(107, 114, 128); // #6b7280 (grau)
        $pdf->SetFont('Arial', 'B', 14);
        $pdf->Cell(12, 12, chr(215), 0, 0, 'C'); // × Symbol (Latin1: chr(215))
        
        error_log("PDFStamper: Stamp content added successfully");
    }
    
    private function convertToLatin1($text) {
        // Moderne Alternative zu utf8_decode() für PHP 8.2+
        if (function_exists('mb_convert_encoding')) {
            return mb_convert_encoding($text, 'ISO-8859-1', 'UTF-8');
        } elseif (function_exists('iconv')) {
            return iconv('UTF-8', 'ISO-8859-1//IGNORE', $text);
        } else {
            // Fallback für ältere PHP-Versionen
            return utf8_decode($text);
        }
    }
    
    private function generateOutputFilename($inputFile) {
        $pathinfo = pathinfo($inputFile);
        $timestamp = date('Y-m-d_H-i-s');
        return $pathinfo['dirname'] . '/' . $pathinfo['filename'] . '_signed_' . $timestamp . '.' . $pathinfo['extension'];
    }
    
    public function getOutputFile() {
        return $this->outputFile;
    }
}
?>
