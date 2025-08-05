import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Accordion, 
  Button, 
  Badge, 
  Card, 
  Row, 
  Col, 
  ListGroup,
  Form,
  Alert,
  OverlayTrigger,
  Tooltip,
  Breadcrumb,
  Container
} from 'react-bootstrap';
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
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Local state
  const [activeCat, setActiveCat] = useState(null);
  const [draftFile, setDraftFile] = useState({});
  const [searchTerms, setSearchTerms] = useState({});
  const [expandedSections, setExpandedSections] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Redux state
  const { userInfo } = useSelector(state => state.userLogin);
  const { loading: loadingP, error: errorP, patient } = 
    useSelector(state => state.patientDetails);
  const { loading: loadingS, sections, error: errorS } = 
    useSelector(state => state.sectionsList);
  const categoryLookup = useSelector(state => state.categoryLookup);
  const medSave = useSelector(state => state.medicalFileSave);

  // Load data on mount
  useEffect(() => {
    dispatch(listPatientDetails(id));
    dispatch(listSections());
  }, [dispatch, id]);

  // Handle successful save
  useEffect(() => {
    if (medSave.success) {
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
        dispatch(resetMedicalFileSave());
      }, 3000);
    }
  }, [medSave.success, dispatch]);

  // Handlers
  const handleCategoryClick = (catId) => {
    setActiveCat(catId);
    if (!categoryLookup[catId]) {
      dispatch(lookupCategory(catId));
    }
  };

  const handleSelect = (catId, item) => {
    // Check if item already exists
    const exists = draftFile[catId]?.some(
      existingItem => existingItem.label === item.label
    );
    
    if (!exists) {
      setDraftFile(prev => ({
        ...prev,
        [catId]: [...(prev[catId] || []), item]
      }));
    }
  };

  const handleRemoveSelection = (catId, itemIndex) => {
    setDraftFile(prev => ({
      ...prev,
      [catId]: prev[catId].filter((_, idx) => idx !== itemIndex)
    }));
  };

  const handleSectionToggle = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSave = (catId, catName) => {
    dispatch(
      saveMedicalFile(id, {
        category: catId,
        entries: draftFile[catId].map(item => ({
          label: item.label,
          code: item.code ?? null,
        })),
      })
    );
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(
        `/api/patients/${id}/medical-file/download/pdf/`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dossier_medical_${patient.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Reset state after download
      setDraftFile({});
      setActiveCat(null);
    } catch (err) {
      console.error('Erreur de téléchargement:', err);
    }
  };

  // Filter items based on search
  const getFilteredItems = (items, catId) => {
    const searchTerm = searchTerms[catId]?.toLowerCase() || '';
    if (!searchTerm) return items;
    return items.filter(item => 
      item.label.toLowerCase().includes(searchTerm)
    );
  };

  // Check if item is selected
  const isItemSelected = (catId, item) => {
    return draftFile[catId]?.some(
      selectedItem => selectedItem.label === item.label
    );
  };

  // Loading and error states
  if (loadingP || loadingS) return (
    <>
      <MyNavbar />
      <Container className="mt-5">
        <Loader />
      </Container>
    </>
  );
  
  if (errorP || errorS) return (
    <>
      <MyNavbar />
      <Container className="mt-5">
        <Message variant="danger">{errorP || errorS}</Message>
      </Container>
    </>
  );

  return (
    <>
      <MyNavbar />
      
      <Container className="mt-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item onClick={() => navigate('/')}>
            Accueil
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => navigate('/doctor')}>
            Médecin
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            Patient: {patient.name}
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Patient Header Card */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <h2 className="mb-3">
                  <i className="fas fa-user-md me-2 text-primary"></i>
                  {patient.name}
                </h2>
                <div className="text-muted">
                  <i className="fas fa-calendar-check me-2"></i>
                  Dossier médical électronique
                </div>
              </Col>
              <Col md={4} className="text-end">
                {showSuccessAlert && (
                  <Alert variant="success" className="mb-0">
                    <i className="fas fa-check me-2"></i>
                    Enregistré avec succès!
                  </Alert>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Sections Accordion */}
        <Accordion 
          activeKey={expandedSections} 
          onSelect={() => {}} 
          alwaysOpen
        >
          {sections.map(section => (
            <Accordion.Item 
              eventKey={String(section.id)} 
              key={section.id}
              className="mb-3 shadow-sm"
            >
              <Accordion.Header 
                onClick={() => handleSectionToggle(String(section.id))}
              >
                <strong className="text-uppercase">
                  <i className="fas fa-clipboard-list me-2"></i>
                  {section.name}
                </strong>
              </Accordion.Header>
              
              <Accordion.Body>
                {section.name.toLowerCase() === 'examen clinique' ? (
                  <ExamenClinique patientId={id} sectionId={section.id} />
                ) : (
                  <Accordion>
                    {section.categories.map(cat => (
                      <Accordion.Item 
                        eventKey={String(cat.id)} 
                        key={cat.id}
                        className="mb-2"
                      >
                        <Accordion.Header 
                          onClick={() => handleCategoryClick(cat.id)}
                        >
                          <div className="d-flex align-items-center w-100">
                            <span>{cat.name}</span>
                            {draftFile[cat.id]?.length > 0 && (
                              <Badge bg="primary" className="ms-auto me-3">
                                {draftFile[cat.id].length} sélectionné(s)
                              </Badge>
                            )}
                          </div>
                        </Accordion.Header>
                        
                        <Accordion.Body>
                          {categoryLookup[cat.id]?.loading ? (
                            <Loader />
                          ) : categoryLookup[cat.id]?.error ? (
                            <Message variant="danger">
                              {categoryLookup[cat.id].error}
                            </Message>
                          ) : (
                            <Row>
                              {/* Left column - Available items */}
                              <Col lg={7} className="mb-3">
                                <Card className="h-100">
                                  <Card.Header className="bg-light">
                                    <h6 className="mb-0">Éléments disponibles</h6>
                                  </Card.Header>
                                  <Card.Body>
                                    {/* Search bar */}
                                    <Form.Control
                                      type="text"
                                      placeholder="Rechercher..."
                                      className="mb-3"
                                      value={searchTerms[cat.id] || ''}
                                      onChange={(e) => setSearchTerms(prev => ({
                                        ...prev,
                                        [cat.id]: e.target.value
                                      }))}
                                    />
                                    
                                    {/* Primary items */}
                                    {getFilteredItems(
                                      categoryLookup[cat.id]?.primary || [], 
                                      cat.id
                                    ).length > 0 && (
                                      <div className="mb-3">
                                        <h6 className="text-muted mb-2">Principaux</h6>
                                        <ListGroup>
                                          {getFilteredItems(
                                            categoryLookup[cat.id]?.primary || [], 
                                            cat.id
                                          ).map((item, idx) => (
                                            <ListGroup.Item
                                              key={idx}
                                              action
                                              onClick={() => handleSelect(cat.id, item)}
                                              disabled={isItemSelected(cat.id, item)}
                                              className="d-flex justify-content-between align-items-center"
                                            >
                                              <span>{item.label}</span>
                                              {isItemSelected(cat.id, item) && (
                                                <i className="fas fa-check text-success"></i>
                                              )}
                                            </ListGroup.Item>
                                          ))}
                                        </ListGroup>
                                      </div>
                                    )}

                                    {/* Other items */}
                                    {(categoryLookup[cat.id]?.others || []).length > 0 && (
                                      <details>
                                        <summary className="text-muted mb-2" style={{ cursor: 'pointer' }}>
                                          Autres options ({categoryLookup[cat.id]?.others.length})
                                        </summary>
                                        <ListGroup className="mt-2">
                                          {getFilteredItems(
                                            categoryLookup[cat.id]?.others || [], 
                                            cat.id
                                          ).map((item, idx) => (
                                            <ListGroup.Item
                                              key={idx}
                                              action
                                              onClick={() => handleSelect(cat.id, item)}
                                              disabled={isItemSelected(cat.id, item)}
                                              className="d-flex justify-content-between align-items-center"
                                            >
                                              <span>{item.label}</span>
                                              {isItemSelected(cat.id, item) && (
                                                <i className="fas fa-check text-success"></i>
                                              )}
                                            </ListGroup.Item>
                                          ))}
                                        </ListGroup>
                                      </details>
                                    )}
                                  </Card.Body>
                                </Card>
                              </Col>

                              {/* Right column - Selected items */}
                              <Col lg={5}>
                                <Card className="h-100">
                                  <Card.Header className="bg-success text-white">
                                    <h6 className="mb-0">Sélection pour {cat.name}</h6>
                                  </Card.Header>
                                  <Card.Body>
                                    {(draftFile[cat.id] || []).length === 0 ? (
                                      <Alert variant="info" className="mb-0">
                                        <i className="fas fa-info-circle me-2"></i>
                                        Aucun élément sélectionné
                                      </Alert>
                                    ) : (
                                      <>
                                        <ListGroup className="mb-3">
                                          {(draftFile[cat.id] || []).map((item, i) => (
                                            <ListGroup.Item 
                                              key={i}
                                              className="d-flex justify-content-between align-items-center py-2"
                                            >
                                              <span className="text-truncate me-2">
                                                {item.label}
                                              </span>
                                              <Button
                                                variant="link"
                                                size="sm"
                                                className="text-danger p-0"
                                                onClick={() => handleRemoveSelection(cat.id, i)}
                                                title="Retirer"
                                              >
                                                <i className="fas fa-times"></i>
                                              </Button>
                                            </ListGroup.Item>
                                          ))}
                                        </ListGroup>

                                        <div className="d-grid gap-2">
                                          <Button
                                            variant="success"
                                            disabled={medSave.loading}
                                            onClick={() => handleSave(cat.id, cat.name)}
                                          >
                                            {medSave.loading ? (
                                              <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Enregistrement...
                                              </>
                                            ) : (
                                              <>
                                                <i className="fas fa-save me-2"></i>
                                                Valider {cat.name}
                                              </>
                                            )}
                                          </Button>

                                          {medSave.success && (
                                            <Button
                                              variant="primary"
                                              onClick={handleDownloadPDF}
                                            >
                                              <i className="fas fa-download me-2"></i>
                                              Télécharger le dossier (PDF)
                                            </Button>
                                          )}
                                        </div>
                                      </>
                                    )}

                                    {/* Error message */}
                                    {medSave.error && (
                                      <Alert variant="danger" className="mt-3 mb-0">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        {medSave.error}
                                      </Alert>
                                    )}
                                  </Card.Body>
                                </Card>
                              </Col>
                            </Row>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>
    </>
  );
}