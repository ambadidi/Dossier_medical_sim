import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Accordion, Button } from 'react-bootstrap';
import { listPatientDetails } from '../actions/patientActions';
import { listReasons, listHistory, listAllergies } from '../actions/lookupActions';
import Loader from '../components/Loader';
import Message from '../components/Message';

export default function PatientScreen() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [activeSub, setActiveSub] = useState(null);
  const [draftFile, setDraftFile] = useState({
    reasons: [],
    history: [],
    allergies: [],
  });

  const { loading, error, patient } = useSelector(
    state => state.patientDetails
  );
  const reasonsState = useSelector(state => state.reasons);
  const historyState = useSelector(state => state.history);
  const allergiesState = useSelector(state => state.allergies);

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
          // Determine display label across different Excel schemas
          const label = item.Label ?? item.motif ?? item.Motif ?? item.Diagnostic ??
            // item.Type ??
            item.Spécificité ?? item.label ?? item.name ??
            '[No Label]';
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
            // const label = item.Label ?? item.motif ?? item.Motif ?? item.label ?? item.name ?? '[No Label]';
            const label = item.Label ?? item.motif ?? item.Motif ?? item.Diagnostic ??
            // item.Type ??
            item.Spécificité ?? item.label ?? item.name ??
            '[No Label]';
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
          {/* Medical History */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>Medical History</Accordion.Header>
            <Accordion.Body>
              {['reasons', 'history', 'allergies'].map(category => (
                <Button
                  key={category}
                  variant="outline-primary"
                  className="me-2 mb-2"
                  onClick={() => setActiveSub(category)}
                >
                  {{
                    reasons: 'Reason for Consultation',
                    history: 'Personal Medical History',
                    allergies: 'Known Allergies'
                  }[category]}
                </Button>
              ))}

              {activeSub === 'reasons' && renderList(reasonsState, 'reasons')}
              {activeSub === 'history' && renderList(historyState, 'history')}
              {activeSub === 'allergies' && renderList(allergiesState, 'allergies')}
            </Accordion.Body>
          </Accordion.Item>

          {/* Clinical Examination */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>Clinical Examination</Accordion.Header>
            <Accordion.Body>
              {/* TODO: Sub-sections */}
            </Accordion.Body>
          </Accordion.Item>

          {/* Additional Tests */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>Additional Tests</Accordion.Header>
            <Accordion.Body>
              {/* TODO: Sub-sections */}
            </Accordion.Body>
          </Accordion.Item>

          {/* Diagnosis and Treatment */}
          <Accordion.Item eventKey="3">
            <Accordion.Header>Diagnosis and Treatment</Accordion.Header>
            <Accordion.Body>
              {/* TODO: Sub-sections */}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
    </div>
  );
}