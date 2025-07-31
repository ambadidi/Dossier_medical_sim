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
import MyNavbar from "../components/MyNavbar";
import ExamenClinique from '../components/ExamenClinique';

export default function PatientScreen() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [activeCat, setActiveCat] = useState(null);
  const [draftFile, setDraftFile] = useState({});

  // Pull in user token for download
  const { userInfo } = useSelector(state => state.userLogin);

  // Patient details
  const { loading: loadingP, error: errorP, patient } =
    useSelector(state => state.patientDetails);

  // Sections config
  const { loading: loadingS, sections, error: errorS } =
    useSelector(state => state.sectionsList);

  // Category lookup data
  const categoryLookup = useSelector(state => state.categoryLookup);

  // Save state
  const medSave = useSelector(state => state.medicalFileSave);

  useEffect(() => {
    dispatch(listPatientDetails(id));
    dispatch(listSections());
  }, [dispatch, id]);

  const handleCategoryClick = catId => {
    setActiveCat(catId);
    if (!categoryLookup[catId]) {
      dispatch(lookupCategory(catId));
    }
  };

  const handleSelect = (catId, item) => {
    setDraftFile(prev => ({
      ...prev,
      [catId]: [...(prev[catId] || []), item]
    }));
  };

  if (loadingP || loadingS) return <Loader />;
  if (errorP)    return <Message variant="danger">{errorP}</Message>;
  if (errorS)    return <Message variant="danger">{errorS}</Message>;

  return (
    <>{/*
    <header>
        <MyNavbar />
      </header>
    <div className="container mt-3">
      <h1>Patient: {patient.name}</h1>
      <Accordion>
        {sections.map(section => (
          <div key={section.id} className="mb-4">
            <h3>{section.name}</h3>
            
            <Accordion defaultActiveKey=""> ici 
              */}
              <header><MyNavbar /></header>
      <div className="container mt-3">
        <h1>Patient: {patient.name}</h1>

        <Accordion>
          {sections.map(section => (
            <div key={section.id} className="mb-4">
              {section.name === 'examen clinique' ? (
                <Accordion.Item eventKey={String(section.id)}>
                  <Accordion.Header>{section.name}</Accordion.Header>
                  <Accordion.Body>
                    <ExamenClinique 
                    patientId={id} 
                    sectionId={section.id}
                    />
                  </Accordion.Body>
                </Accordion.Item>
              ) : (
                <Accordion defaultActiveKey="">
              {section.categories.map(cat => (
                <Accordion.Item eventKey={String(cat.id)} key={cat.id}>
                  <Accordion.Header onClick={() => handleCategoryClick(cat.id)}>
                    {cat.name}
                  </Accordion.Header>
                  <Accordion.Body>
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
                          <h5>Selected {cat.name}:</h5>
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

                        {/* Save feedback */}
                        {medSave.error && (
                          <Message variant="danger" className="mt-2">
                            {medSave.error}
                          </Message>
                        )}
                        {medSave.success && (
                          <Message variant="success" className="mt-2">
                            {cat.name} saved!
                          </Message>
                        )}

                        {/* Download PDF after save */}
                        {medSave.success && (
                          <div className="mt-3">
                            <Button
                              variant="primary"
                              onClick={async () => {
                                try {
                                  // Download blob
                                  const response = await axios.get(
                                    `/api/patients/${id}/medical-file/download/pdf/`,
                                    {
                                      headers: {
                                        Authorization: `Bearer ${userInfo.token}`
                                      },
                                      responseType: 'blob'
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

                                  // Reset state
                                  setDraftFile({});
                                  setActiveCat(null);
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
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
            )}{/* et ici */}
          </div>
        ))}
      </Accordion>
    </div>
    </>
  );
}
