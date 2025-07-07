import React, { useState } from 'react';
import { Card, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import axios from 'axios';

const SignatureVerify = ({ active }) => {
  const [checkNumber, setCheckNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!checkNumber.trim()) {
      setError('Bitte geben Sie eine Prüfnummer ein.');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await axios.get(`/api/verify.php?check_number=${encodeURIComponent(checkNumber.trim())}`);
      setVerificationResult(response.data.verification);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Prüfnummer nicht gefunden oder ungültig.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCheckNumber('');
    setVerificationResult(null);
    setError('');
  };

  return (
    <div>
      <Card className="mb-4">
        <Card.Header>
          <h1 className="h4 mb-0">Signaturen prüfen</h1>
        </Card.Header>
        <Card.Body>
          <p className="mb-4">
            Geben Sie eine Prüfnummer ein, um die Authentizität und Details einer PDF-Signatur zu überprüfen.
          </p>

          {error && (
            <Alert variant="danger" className="alert-kl-danger" role="alert">
              <strong>Fehler:</strong> {error}
            </Alert>
          )}

          <Form onSubmit={handleVerify}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="check-number" className="fw-semibold">
                PDF-Prüfnummer:
              </Form.Label>
              <Form.Control
                id="check-number"
                type="text"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                placeholder="z.B. abc123def4"
                disabled={loading}
                className="form-control-lg"
                aria-describedby="check-number-help"
              />
              <Form.Text id="check-number-help" className="text-muted">
                Die Prüfnummer finden Sie in den Metadaten oder im signierten PDF-Dokument
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                type="submit"
                className="btn-kl-primary"
                size="lg"
                disabled={loading || !checkNumber.trim()}
              >
                {loading ? 'Prüfe...' : 'Prüfen'}
              </Button>
              
              {(verificationResult || error) && (
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Neue Prüfung
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Verification Results */}
      {verificationResult && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="me-2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h2 className="h5 mb-0">Prüfungsergebnis</h2>
          </Card.Header>
          <Card.Body>
            <div className="mb-4">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong>Prüfnummer:</strong>
                    <div>
                      <code className="fs-6">{verificationResult.check_number}</code>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Gesamtanzahl Signaturen:</strong>
                    <div>
                      <Badge bg="primary" className="fs-6">
                        {verificationResult.total_signatures}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong>Erste Signatur:</strong>
                    <div>{new Date(verificationResult.first_signature).toLocaleString('de-DE')}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Letzte Signatur:</strong>
                    <div>{new Date(verificationResult.last_signature).toLocaleString('de-DE')}</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Verifiziert am:</strong>
                <div>{new Date(verificationResult.verified_at).toLocaleString('de-DE')}</div>
              </div>
            </div>

            <h3 className="h6 mb-3">Signaturdetails:</h3>
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th scope="col">Signiert durch</th>
                    <th scope="col">Dateiname</th>
                    <th scope="col">Signaturdatum</th>
                    <th scope="col">Dokument</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationResult.signatures.map((signature, index) => (
                    <tr key={index}>
                      <td>
                        <div className="fw-medium">
                          {signature.firstname} {signature.lastname}
                        </div>
                        <small className="text-muted">
                          {signature.username}
                        </small>
                      </td>
                      <td>
                        <div className="fw-medium">{signature.filename}</div>
                        <small className="text-muted">
                          {signature.signature_count} Signatur(en) insgesamt
                        </small>
                      </td>
                      <td>
                        {new Date(signature.created_at).toLocaleString('de-DE')}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            // Hier würde der Download-Link implementiert
                            alert('Download-Funktion würde hier implementiert werden');
                          }}
                        >
                          Zum PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="mt-4 p-3 bg-light rounded">
              <div className="d-flex align-items-start">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="me-2 mt-1 text-success">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <strong className="text-success">Signatur verifiziert!</strong>
                  <div className="text-muted mt-1">
                    Die Prüfnummer ist gültig und das Dokument wurde erfolgreich verifiziert. 
                    Alle angezeigten Signaturen sind authentisch und nachvollziehbar.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <small className="text-muted">
                <strong>Hinweis:</strong> Bei eventuellen Rückfragen wenden Sie sich bitte an 
                Herrn Kruse (Tel.: 0631/365-1632).
              </small>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default SignatureVerify;
