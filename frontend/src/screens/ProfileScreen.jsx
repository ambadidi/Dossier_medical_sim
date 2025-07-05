import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import Message from "../components/Message";

import { getUserDetails, updateUserProfile } from "../actions/userActions";
import { USER_UPDATE_PROFILE_RESET } from "../constants/userConstants";
import { PATIENT_CREATE_RESET } from "../constants/patientConstants";
import { createPatient } from "../actions/patientActions";

function ProfileScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // — userDetails / login from Redux —
  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
  const { success: successUserUpdate } = userUpdateProfile;

  // — patientCreate from Redux —
  const patientCreate = useSelector((state) => state.patientCreate);
  const { loading: loadingPatient, error: errorPatient, success: successPatient, patient } = patientCreate;

  // — Local form state for updating the user’s own profile —
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // — New state for “searching/creating” a patient —
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    if (!userInfo) {
      // If not logged in, redirect to /login
      navigate("/login");
    } else {
      if (!user || !user.name || successUserUpdate) {
        // Reset profile‐update state, then re‐fetch user details
        dispatch({ type: USER_UPDATE_PROFILE_RESET });
        dispatch(getUserDetails("profile"));
      } else {
        // Populate the form with existing user data
        setName(user.name);
        setEmail(user.email);
      }
    }
  }, [dispatch, navigate, userInfo, user, successUserUpdate]);

  useEffect(() => {
    // Once we successfully create/fetch a patient, redirect to /patients/<id>
    if (successPatient && patient) {
      navigate(`/patients/${patient._id}`);
      dispatch({ type: PATIENT_CREATE_RESET });
    }
  }, [successPatient, patient, navigate, dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    // Basic password confirmation check
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
    } else {
      dispatch(
        updateUserProfile({
          id: user._id,
          name,
          email,
          password,
        })
      );
      setMessage("");
    }
  };

  const handleSearchOrAddPatient = () => {
    // Dispatch createPatient({ name: patientName, doctor: <doctorId> })
    if (!patientName.trim()) {
      setMessage("Vous devez entrer un nom de patient");
      return;
    }
    setMessage("");
    dispatch(
      createPatient({
        name: patientName.trim(),
        //⁠— here, we assume `userInfo._id` is the doctor’s _id in the backend —
        doctor: userInfo._id,
      })
    );
  };

  return (
    <Row>
      {/* — Column 1: User Profile Form — */}
      <Col md={3}>
        <h2>Profil d’utilisateur</h2>
        {message && <Message variant="danger">{message}</Message>}
        {error && <Message variant="danger">{error}</Message>}
        {loading && <Loader />}
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name">
            <Form.Label>Nom</Form.Label>
            <Form.Control
              type="text"
              placeholder="Saisir nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="email" className="mt-2">
            <Form.Label>Adresse Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Saisir Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="password" className="mt-2">
            <Form.Label>Mot de Passe</Form.Label>
            <Form.Control
              type="password"
              placeholder="Saisir Mot de Passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="passwordConfirm" className="mt-2">
            <Form.Label>Confirmer Mot de Passe</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirmer Mot de Passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" variant="primary" className="mt-3">
            Mettre à jour
          </Button>
        </Form>
      </Col>

      {/* — Column 2: Patient Search / Create — */}
      <Col md={9}>
        <h2>Mes Patients</h2>

        {/* Input for “Nom du Patient” */}
        <Form className="d-flex mb-3">
          <Form.Control
            type="text"
            placeholder="Entrer nom du patient"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          <Button
            type="button"
            variant="outline-primary"
            className="ms-2"
            onClick={handleSearchOrAddPatient}
            disabled={loadingPatient}
          >
            {loadingPatient ? "Recherche..." : "Chercher / Ajouter"}
          </Button>
        </Form>

        {/* Show loader or error for patient creation */}
        {loadingPatient && <Loader />}
        {errorPatient && <Message variant="danger">{errorPatient}</Message>}
      </Col>
    </Row>
  );
}

export default ProfileScreen;

