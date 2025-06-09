/*
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listPatients } from "../actions/patientActions";
import Loader from "../components/Loader";
import Message from "../components/Message";

function HomeScreen() {
  const dispatch = useDispatch();
  const patientList = useSelector((state) => state.patientList);
  const { error, loading, patients } = patientList;

  useEffect(() => {
    dispatch(listPatients())
  }, [dispatch])

  return (
    <div>
      <h1>Home Screen</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <p>Welcome to the home page!</p>
      )}
    </div>
  );
}

export default HomeScreen;
*/
// src/screens/HomeScreen.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, register } from "../actions/userActions";
import { Form, Button, Card, Row, Col, Tabs, Tab } from "react-bootstrap";
import Loader from "../components/Loader";
import Message from "../components/Message";

function HomeScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // tab key: "login" or "register"
  const [key, setKey] = useState("login");

  // form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // local message for password mismatch
  const [message, setMessage] = useState("");

  // redux slices
  const userLogin     = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const userRegister  = useSelector((state) => state.userRegister);
  const { loading: regLoading, error: regError, userInfo: regInfo } = userRegister;

  // redirect after login or register
  useEffect(() => {
    const user = userInfo || regInfo;
    if (user) {
      if (user.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/doctor");
      }
    }
  }, [userInfo, regInfo, navigate]);

  // handlers
  const submitLogin = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  const submitRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
    } else {
      dispatch(register(name, email, password));
    }
  };

  return (
    <Row className="justify-content-md-center">
      <Col xs={12} md={6} lg={5}>
        <Card className="shadow-lg rounded-2xl p-4">
          <Tabs
            id="auth-tabs"
            activeKey={key}
            onSelect={(k) => {
              setKey(k);
              setMessage("");
            }}
            className="mb-3 justify-content-center"
          >
            {/* === SIGN IN TAB === */}
            <Tab eventKey="login" title="S'identifier">
              {error && <Message variant="danger">{error}</Message>}
              {loading && <Loader />}
              <Form onSubmit={submitLogin} className="p-2">
                <Form.Group controlId="email">
                  <Form.Label>Adresse Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Saisir Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mt-3">
                  <Form.Label>Mot de Passe</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Saisir Mot de Passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100 mt-4">
                S'identifier
                </Button>
              </Form>
            </Tab>

            {/* === SIGN UP TAB === */}
            <Tab eventKey="register" title="S'enregistrer">
              {message && <Message variant="danger">{message}</Message>}
              {regError && <Message variant="danger">{regError}</Message>}
              {regLoading && <Loader />}
              <Form onSubmit={submitRegister} className="p-2">
                <Form.Group controlId="name">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Saisir Nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="emailSignUp" className="mt-3">
                  <Form.Label>Adresse Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Saisir Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="passwordSignUp" className="mt-3">
                  <Form.Label>Mot de Passe</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Saisir Mot de Passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="confirmPassword" className="mt-3">
                  <Form.Label>Confirmer Mot de Passe</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirmer Mot de Passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="success" className="w-100 mt-4">
                S'enregistrer
                </Button>
              </Form>
            </Tab>
          </Tabs>
        </Card>
      </Col>
    </Row>
  );
}

export default HomeScreen;
