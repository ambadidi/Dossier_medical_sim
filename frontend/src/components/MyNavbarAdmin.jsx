import React from "react";
import { useDispatch, useSelector } from 'react-redux'
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { logout } from '../actions/userActions'
import { useNavigate } from 'react-router-dom';

function MyNavbarAdmin() {

  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin

  const dispatch = useDispatch()
  const navigate = useNavigate();

  const logoutHandler = () => {
    dispatch(logout())
    navigate('/')
  }

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
        Espace Admin
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/admin">
              Admin
            </Nav.Link>
            <NavDropdown
              title="Actions"
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
          <Nav className="mr-auto">
            {userInfo ? (
              <NavDropdown title={userInfo.name} id="username" menuVariant="dark">
                {/*<NavDropdown.Item as={Link} to="/profile">
                Profil
              </NavDropdown.Item>*/}

              <NavDropdown.Item onClick={logoutHandler}>
                Logout
              </NavDropdown.Item>
              </NavDropdown>
            ): (
              <Nav.Link as={Link} to="/login">
              <i className="fas fa-user"></i>Login
            </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbarAdmin;
