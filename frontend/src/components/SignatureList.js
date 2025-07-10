import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

const SignatureList = ({ signatures, onDownload, onDelete }) => {
  return (
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
                              onClick={() => onDownload(signature.check_number)}
                            >
                              Herunterladen
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => onDelete(signature.id)}
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
  );
};

export default SignatureList;
