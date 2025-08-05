// PatientScreen.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Accordion, Button } from 'react-bootstrap';
import axios from 'axios';

import { listPatientDetails } from '../actions/patientActions';
import { listSections, lookupCategory } from '../actions/sectionActions';
import { saveMedicalFile, resetMedicalFileSave } from '../actions/medicalFileActions';
import Loader from '../components/Loader';
import Message from '../components/Message';
import MyNavbar from '../components/MyNavbar';
import ExamenClinique from '../components/ExamenClinique';

export default function PatientScreen() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [draftFile, setDraftFile] = useState({});

  // auth, state
  const { userInfo } = useSelector(state => state.userLogin);
  const { loading: loadingP, error: errorP, patient } = useSelector(state => state.patientDetails);
  const { loading: loadingS, sections, error: errorS } = useSelector(state => state.sectionsList);
  const categoryLookup = useSelector(state => state.categoryLookup);
  const medSave = useSelector(state => state.medicalFileSave);

  // initial load
  useEffect(() => {
    dispatch(listPatientDetails(id));
    dispatch(listSections());
  }, [dispatch, id]);

  // auto-load all lookup categories (except examen clinique)
  useEffect(() => {
    if (!loadingS && sections.length) {
      sections.forEach(sec => {
        if (sec.name !== 'examen clinique') {
          sec.categories.forEach(cat => {
            if (!categoryLookup[cat.id]) {
              dispatch(lookupCategory(cat.id));
            }
          });
        }
      });
    }
  }, [loadingS, sections, categoryLookup, dispatch]);

  const handleSelect = (catId, item) => {
    setDraftFile(prev => ({
      ...prev,
      [catId]: [...(prev[catId] || []), item]
    }));
  };

  if (loadingP || loadingS) return <Loader />;
  if (errorP) return <Message variant="danger">{errorP}</Message>;
  if (errorS) return <Message variant="danger">{errorS}</Message>;

  return (
    <>
      <header><MyNavbar /></header>
      <div className="container mt-3">
        <h1>Patient: {patient.name}</h1>

        <Accordion>
          {sections.map(section => (
            <Accordion.Item eventKey={String(section.id)} key={section.id}>
              <Accordion.Header>{section.name}</Accordion.Header>
              <Accordion.Body>
                {section.name === 'examen clinique' ? (
                  <ExamenClinique patientId={id} sectionId={section.id} />
                ) : (
                  section.categories.map(cat => (
                    <div key={cat.id} className="mb-4">
                      <h5>{cat.name}</h5>

                      {categoryLookup[cat.id]?.loading ? (
                        <Loader />
                      ) : categoryLookup[cat.id]?.error ? (
                        <Message variant="danger">{categoryLookup[cat.id].error}</Message>
                      ) : (
                        <>
                          {/* Lookup lists */}
                          <ul>
                            {(categoryLookup[cat.id]?.primary || []).map((item, idx) => (
                              <li
                                key={idx}
                                onClick={() => handleSelect(cat.id, item)}
                                style={{ cursor: 'pointer' }}
                              >
                                {item.label}
                              </li>
                            ))}
                          </ul>
                          <details>
                            <summary>Other</summary>
                            <ul>
                              {(categoryLookup[cat.id]?.others || []).map((item, idx) => (
                                <li
                                  key={idx}
                                  onClick={() => handleSelect(cat.id, item)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {item.label}
                                </li>
                              ))}
                            </ul>
                          </details>

                          {/* Selected list */}
                          <div className="mt-3">
                            <h6>Selected {cat.name}:</h6>
                            <ul>
                              {(draftFile[cat.id] || []).map((item, i) => (
                                <li key={i}>{item.label}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Validate Button */}
                          <Button
                            variant="success"
                            className="mt-2"
                            disabled={!draftFile[cat.id]?.length || medSave.loading}
                            onClick={() =>
                              dispatch(
                                saveMedicalFile(id, {
                                  category: cat.id,
                                  entries: draftFile[cat.id].map(item => ({
                                    label: item.label,
                                    code: item.code ?? null,
                                  })),
                                })
                              )
                            }
                          >
                            {medSave.loading ? 'Saving…' : `Validate ${cat.name}`}
                          </Button>

                          {/* Save feedback & download */}
                          {medSave.success && (
                            <div className="mt-3">
                              <Button
                                variant="primary"
                                onClick={async () => {
                                  try {
                                    const response = await axios.get(
                                      `http://127.0.0.1:8000/api/patients/${id}/medical-file/download/pdf/`,
                                      {
                                        headers: { Authorization: `Bearer ${userInfo.token}` },
                                        responseType: 'blob',
                                      }
                                    );
                                    const url = window.URL.createObjectURL(
                                      new Blob([response.data])
                                    );
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute(
                                      'download',
                                      `medical_file_${patient.name}.pdf`
                                    );
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();

                                    setDraftFile({});
                                    dispatch(resetMedicalFileSave());
                                  } catch (err) {
                                    console.error('Download error:', err);
                                  }
                                }}
                              >
                                Download Full Medical File (PDF)
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </>
  );
}
