import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Accordion, Button } from 'react-bootstrap';
import { listPatientDetails } from '../actions/patientActions';
import { listReasons, listHistory, listAllergies } from '../actions/lookupActions';
import { saveMedicalFile } from '../actions/medicalFileActions';
import Loader from '../components/Loader';
import Message from '../components/Message';

// Map category key to human-readable label
const SUB_LABELS = {
  reasons: 'Reason for Consultation',
  history: 'Personal Medical History',
  allergies: 'Known Allergies',
};

export default function PatientScreen() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [activeSub, setActiveSub] = useState(null);
  const [draftFile, setDraftFile] = useState({
    reasons: [],
    history: [],
    allergies: [],
  });

  const { loading, error, patient } = useSelector(state => state.patientDetails);
  const reasonsState = useSelector(state => state.reasons);
  const historyState = useSelector(state => state.history);
  const allergiesState = useSelector(state => state.allergies);
  const medSave = useSelector(state => state.medicalFileSave);

  useEffect(() => {
    dispatch(listPatientDetails(id));
    dispatch(listReasons());
    dispatch(listHistory());
    dispatch(listAllergies());
  }, [dispatch, id]);

  const handleSelect = (category, item) => {
    setDraftFile(prev => ({
      ...prev,
      [category]: [...prev[category], item]
    }));
  };

  const renderList = (items, category) => (
    <>
      <ul>
        {items.primary.map((item, idx) => {
          const label =
            item.Label ?? item.motif ?? item.Motif ?? item.Diagnostic ?? item.Spécificité ?? '[No Label]';
          return (
            <li
              key={`${category}-primary-${idx}`}
              onClick={() => handleSelect(category, item)}
              style={{ cursor: 'pointer' }}
            >
              {label}
            </li>
          );
        })}
      </ul>
      <details>
        <summary>Other</summary>
        <ul>
          {items.others.map((item, idx) => {
            const label =
              item.Label ?? item.motif ?? item.Motif ?? item.Diagnostic ?? item.Spécificité ?? '[No Label]';
            return (
              <li
                key={`${category}-other-${idx}`}
                onClick={() => handleSelect(category, item)}
                style={{ cursor: 'pointer' }}
              >
                {label}
              </li>
            );
          })}
        </ul>
      </details>
    </>
  );

  return (
    <div className="container mt-3">
      <h1>Patient: {patient?.name}</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Medical History</Accordion.Header>
            <Accordion.Body>
              {/* Section Buttons */}
              {['reasons', 'history', 'allergies'].map(category => (
                <Button
                  key={category}
                  variant="outline-primary"
                  className="me-2 mb-2"
                  onClick={() => setActiveSub(category)}
                >
                  {SUB_LABELS[category]}
                </Button>
              ))}

              {/* List Rendering */}
              {activeSub === 'reasons' && renderList(reasonsState, 'reasons')}
              {activeSub === 'history' && renderList(historyState, 'history')}
              {activeSub === 'allergies' && renderList(allergiesState, 'allergies')}

              {/* Selected & Validate */}
              {activeSub && (
                <div className="mt-4 p-3 border rounded bg-light">
                  <h5>Selected {SUB_LABELS[activeSub]}:</h5>
                  <ul>
                    {draftFile[activeSub].map((item, i) => (
                      <li key={i}>
                        {item.Label ?? item.Motif ?? item.Diagnostic ?? item.Spécificité}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="success"
                    disabled={!draftFile[activeSub].length || medSave.loading}
                    onClick={() => dispatch(
                      saveMedicalFile(id, {
                        category: activeSub,
                        entries: draftFile[activeSub].map(item => ({
                          label: item.Label ?? item.Motif ?? item.Diagnostic ?? item.Spécificité,
                          code: item.code ?? null,
                        }))
                      })
                    )}
                  >
                    {medSave.loading ? 'Saving...' : `Validate ${SUB_LABELS[activeSub]}`}
                  </Button>
                  {medSave.error && <Message variant="danger">{medSave.error}</Message>}
                  {medSave.success && <Message variant="success">Saved!</Message>}
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>

          {/* Other Sections... (unchanged) */}
        </Accordion>
      )}
    </div>
  );
}