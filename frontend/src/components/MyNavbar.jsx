import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

function MyNavbar() {
  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      collapseOnSelect
      style={{ width: "100%" }}
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          Dossier Medical
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/doctor">
              Doctor
            </Nav.Link>
            <NavDropdown
              title="Profils"
              id="basic-nav-dropdown"
              menuVariant="dark"
            >
              <NavDropdown.Item as={Link} to="/action/3.1">
                Action
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/action/3.3">
                Something
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/login">
              Signed in as: Mark Otto
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
