import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listPatientDetails } from '../actions/patientActions';
import { listReasons , listHistory, listAllergies  } from '../actions/lookupActions';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Accordion, Card, Button } from 'react-bootstrap';

export default function PatientScreen() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  const patientDetails = useSelector(state => state.patientDetails);
  const { loading, error, patient } = patientDetails;

  const reasonsList = useSelector(state => state.reasons);
  const { primary: reasons, others, loading: loadingReasons } = reasonsList;

  useEffect(() => {
    dispatch(listPatientDetails(id));
    dispatch(listReasons());
    dispatch(listHistory());
    dispatch(listAllergies());
    
  }, [dispatch, id]);

  const onSelectReason = (item) => {
    // add to patient medical file state
  };

  return (
    <div className="container mt-3">
      <h1>Patient: {patient?.name}</h1>
      {loading ? <Loader /> : error ? <Message variant="danger">{error}</Message> : (
        <div className="mt-4">
          <Accordion defaultActiveKey="">
            {['Medical History', 'Clinical Examination', 'Additional Tests', 'Diagnosis and Treatment'].map((section, idx) => (
              <Card key={section} className="mb-2">
                <Accordion.Toggle as={Card.Header} eventKey={`${idx}`} onClick={() => setActiveSection(section)}>
                  {section}
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={`${idx}`}>
                  <Card.Body>
                    {section === 'Medical History' && (
                      <div>
                        {/* Sub-sections list */}
                        {['Reason for Consultation', 'Personal Medical History', 'Known Allergies'].map(sub => (
                          <Button variant="light" className="mr-2 mb-2" key={sub} onClick={() => setActiveSub(sub)}>
                            {sub}
                          </Button>
                        ))}
                        {/* Render sub-section detail */}
                        {activeSub === 'Reason for Consultation' && (
                          <div className="mt-3">
                            <h5>Top Reasons</h5>
                            {loadingReasons ? <Loader /> : (
                              <ul>
                                {reasons.map(r => (
                                  <li key={r.Id} onClick={() => onSelectReason(r)}>{r.Label}</li>
                                ))}
                              </ul>
                            )}
                            <details>
                              <summary>Other Reasons</summary>
                              <ul>{others.map(r => <li key={r.Id} onClick={() => onSelectReason(r)}>{r.Label}</li>)}</ul>
                            </details>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Add similar blocks for other main sections */}
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}

// export default PatientScreen;
