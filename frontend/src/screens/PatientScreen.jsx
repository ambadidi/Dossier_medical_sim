import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Accordion, Button } from 'react-bootstrap';
import axios from 'axios';
import { listPatientDetails } from '../actions/patientActions';
import { listReasons, listHistory, listAllergies } from '../actions/lookupActions';
import { saveMedicalFile, resetMedicalFileSave } from '../actions/medicalFileActions';
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

  // Local UI state
  const [activeSub, setActiveSub] = useState(null);
  const [draftFile, setDraftFile] = useState({ reasons: [], history: [], allergies: [] });

  // Global state via hooks
  const { loading, error, patient } = useSelector(state => state.patientDetails);
  const reasonsState = useSelector(state => state.reasons);
  const historyState = useSelector(state => state.history);
  const allergiesState = useSelector(state => state.allergies);
  const medSave = useSelector(state => state.medicalFileSave);
  const { userInfo } = useSelector(state => state.userLogin); // hook at top level for auth

  // Initial data load
  useEffect(() => {
    dispatch(listPatientDetails(id));
    dispatch(listReasons());
    dispatch(listHistory());
    dispatch(listAllergies());
  }, [dispatch, id]);

  // Handle item selection
  const handleSelect = (category, item) => {
    setDraftFile(prev => ({ ...prev, [category]: [...prev[category], item] }));
  };

  // Render primary/other lists
  const renderList = (items, category) => (
    <>
      <ul>
        {items.primary.map((item, idx) => {
          const label = item.Label ?? item.motif ?? item.Motif ?? item.Diagnostic ?? item.Spécificité ?? '[No Label]';
          return (
            <li key={`${category}-primary-${idx}`} onClick={() => handleSelect(category, item)} style={{ cursor: 'pointer' }}>
              {label}
            </li>
          );
        })}
      </ul>
      <details>
        <summary>Other</summary>
        <ul>
          {items.others.map((item, idx) => {
            const label = item.Label ?? item.motif ?? item.Motif ?? item.Diagnostic ?? item.Spécificité ?? '[No Label]';
            return (
              <li key={`${category}-other-${idx}`} onClick={() => handleSelect(category, item)} style={{ cursor: 'pointer' }}>
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
              {['reasons', 'history', 'allergies'].map(cat => (
                <Button key={cat} variant="outline-primary" className="me-2 mb-2" onClick={() => setActiveSub(cat)}>
                  {SUB_LABELS[cat]}
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

                  {/* Validate Button */}
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

                  {/* Download Button after save */}
                  {medSave.success && (
                    <div className="mt-3">
                      <Button
                        variant="primary"
                        onClick={async () => {
                          try {
                            const response = await axios.get(
                              `/api/patients/${id}/medical-file/download/pdf/`,
                              { headers: { Authorization: `Bearer ${userInfo.token}` }, responseType: 'blob' }
                            );
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `medical_file_${id}.pdf`);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            await axios.delete(
  `/api/patients/${id}/medical-file/clear/`,
  { headers: { Authorization: `Bearer ${userInfo.token}` } }
);
                            // Reset selections after download
                              setDraftFile({ reasons: [], history: [], allergies: [] });
                              setActiveSub(null);
                              dispatch(resetMedicalFileSave());
                          } catch (error) {
                            console.error('Download error:', error);
                          }
                        }}
                      >
                        Download Full Medical File (PDF)
                      </Button>
                    </div>
                  )}
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