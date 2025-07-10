<?php
require_once __DIR__ . '/classes/PDFStamper.php';

// Test-Stempel-Daten (simuliere Frontend-Werte)
$stampData = [
    'stamp_x_points' => 100.0,
    'stamp_y_points' => 100.0,
    'stamp_width_points' => 150.0,
    'stamp_height_points' => 60.0,
    'stamp_page' => 1,
    'stamp_name' => 'Max Mustermann',
    'stamp_method' => 'Signiert mit AD 12345',
    'stamp_date' => date('d.m.Y, H:i') . ' Uhr'
];

echo "Test PDFStamper mit simulierten Daten...\n";
echo "Stempel-Daten: " . json_encode($stampData, JSON_PRETTY_PRINT) . "\n\n";

// Prüfe, ob ein Test-PDF existiert
$testPdfPath = __DIR__ . '/uploads/test.pdf';
if (!file_exists($testPdfPath)) {
    echo "FEHLER: Test-PDF nicht gefunden bei: $testPdfPath\n";
    echo "Erstelle ein Test-PDF mit FPDF...\n";
    
    // Einfaches Test-PDF erstellen mit TCPDF
    require_once __DIR__ . '/vendor/autoload.php';
    
    $pdf = new \TCPDF();
    $pdf->AddPage();
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->Text(50, 50, 'Test PDF fuer Stempel');
    $pdf->SetFont('helvetica', '', 12);
    $pdf->Text(50, 100, 'Hier sollte der Stempel erscheinen.');
    
    // Sicherstellen, dass das uploads-Verzeichnis existiert
    $uploadsDir = dirname($testPdfPath);
    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0755, true);
    }
    
    $pdf->Output($testPdfPath, 'F');
    echo "Test-PDF erstellt: $testPdfPath\n\n";
}

try {
    // PDFStamper testen
    $stamper = new PDFStamper($testPdfPath);
    $stamper->addStamp($stampData);
    $result = $stamper->generate();
    
    echo "PDFStamper Ergebnis:\n";
    echo json_encode($result, JSON_PRETTY_PRINT) . "\n\n";
    
    if ($result['success']) {
        echo "✓ Stempel erfolgreich angewendet!\n";
        echo "Ausgabedatei: " . $result['output_file'] . "\n";
        
        if (file_exists($result['output_file'])) {
            $fileSize = filesize($result['output_file']);
            echo "Dateigröße: " . number_format($fileSize) . " Bytes\n";
        }
    } else {
        echo "✗ Fehler beim Stempeln: " . $result['error'] . "\n";
    }
    
} catch (Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Error Log (letzte 20 Zeilen) ===\n";
$errorLog = '/Applications/MAMP/logs/php_error.log';
if (file_exists($errorLog)) {
    $lines = file($errorLog);
    $lastLines = array_slice($lines, -20);
    echo implode('', $lastLines);
} else {
    echo "Error Log nicht gefunden bei: $errorLog\n";
}
?>
