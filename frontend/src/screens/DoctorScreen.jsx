/*
import React from 'react';
import Header from '../components/Header';

function DoctorScreen() {
  return (
    <>
      <Header />
      <div className="container mt-3">
        <h1>Doctor Screen</h1>
      </div>
    </>
  );
}

export default DoctorScreen;
*/
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listPatients, createPatient } from '../actions/patientActions';
import { PATIENT_CREATE_RESET } from '../constants/patientConstants';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

import { Form, Button, ListGroup, Row, Col } from 'react-bootstrap';

function DoctorScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState('');
  const [message, setMessage] = useState('');

  const patientList = useSelector((state) => state.patientList);
  const { loading, error, patients } = patientList;

  const patientCreate = useSelector((state) => state.patientCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
    patient: createdPatient,
  } = patientCreate;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    dispatch(listPatients());
  }, [dispatch]);

  useEffect(() => {
    if (successCreate && createdPatient) {
      navigate(`/patients/${createdPatient._id}`);
      dispatch({ type: PATIENT_CREATE_RESET });
    }
  }, [dispatch, successCreate, createdPatient, navigate]);

  const addPatientHandler = () => {
    if (!patientName.trim()) {
      setMessage('Le nom du patient est requis');
      return;
    }

    const patientExists = patients.find(
      (p) => p.name.toLowerCase() === patientName.trim().toLowerCase()
    );

    if (patientExists) {
      setMessage('Ce patient existe déjà');
      return;
    }

    setMessage('');
    dispatch(createPatient({ name: patientName.trim(), doctor: userInfo._id }));
  };

  return (
    <>
      <Header />
      <div className="container mt-3">
        <Row>
          <Col md={8}>
            <h2>Mes Patients</h2>
            {loading ? (
              <Loader />
            ) : error ? (
              <Message variant="danger">{error}</Message>
            ) : (
              <ListGroup>
                {patients.map((patient) => (
                  <ListGroup.Item
                    key={patient._id}
                    action
                    onClick={() => navigate(`/patients/${patient._id}`)}
                  >
                    {patient.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Col>

          <Col md={4}>
            <h4 className="mb-3">Ajouter un Patient</h4>
            {message && <Message variant="danger">{message}</Message>}
            {errorCreate && <Message variant="danger">{errorCreate}</Message>}
            <Form className="d-flex">
              <Form.Control
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Nom du patient"
              />
              <Button
                type="button"
                variant="success"
                className="ms-2"
                onClick={addPatientHandler}
                disabled={loadingCreate}
              >
                {loadingCreate ? 'Ajout...' : 'Ajouter'}
              </Button>
            </Form>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default DoctorScreen;
