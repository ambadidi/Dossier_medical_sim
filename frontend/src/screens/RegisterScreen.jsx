import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Updated imports
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import Message from "../components/Message";
import FormContainer from "../components/FormContainer";
import { register } from "../actions/userActions";

function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const location = useLocation(); // Get location using hook
  const navigate = useNavigate(); // Replace history with navigate

  const redirect = location.search ? location.search.split("=")[1] : "/";

  const userRegister = useSelector((state) => state.userRegister);
  const { error, loading, userInfo } = userRegister;

  useEffect(() => {
    if (userInfo) {
      navigate(redirect); // Use navigate instead of history.push
    }
  }, [navigate, userInfo, redirect]); // Include navigate in dependencies

  const submitHandler = (e) => {
    e.preventDefault();
    if (password != confirmPassword) {
        setMessage('Les mots de passe ne correspondent pas')
    } else {
        dispatch(register(name, email, password));
    }
  };

  return (
    <FormContainer>
      <h1>S'enregistrer</h1>
      {message && <Message variant="danger">{message}</Message>}
      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader />}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="name">
          <Form.Label>Nom</Form.Label>
          <Form.Control
            required
            type="name"
            placeholder="Saisir nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="email">
          <Form.Label>Adresse Email</Form.Label>
          <Form.Control
            required
            type="email"
            placeholder="Saisir Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Mot de Passe</Form.Label>
          <Form.Control
            required
            type="password"
            placeholder="Saisir Mot de Passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="passwordConfirm">
          <Form.Label>Confirmer Mot de Passe</Form.Label>
          <Form.Control
            required
            type="password"
            placeholder="Confirmer Mot de Passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Button type="submit" variant="primary">
          S'enregistrer
        </Button>
      </Form>

      <Row className="py-3">
        <Col>
        Vous avez déjà un compte ?{" "}
          <Link to={redirect ? `/login?redirect=${redirect}` : "/login"}>
          S'identifier
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
}

export default RegisterScreen;
