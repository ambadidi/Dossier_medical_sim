/*
import React, { useState, useEffect } from 'react'
import { Link, redirect } from 'react-router-dom'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Loader from "../components/Loader";
import Message from "../components/Message";
import FormContainer from "../components/FormContainer";
import { login } from '../actions/userActions'

function LoginScreen({ location, history }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const dispatch = useDispatch()

    const redirect = location.search ? location.search.split('=')[1] : '/'

    const userLogin = useSelector(state => state.userLogin)
    const { error, loading, userInfo } = userLogin

    useEffect(() => {
        if(userInfo){
            history.push(redirect)
        }
    }, [history, userInfo, redirect])

    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(login(email, password))
    }

  return (
    <FormContainer>
      <h1>S'identifier</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='email'>
            <Form.Label>Adresse Email</Form.Label>
            <Form.Control 
                type='email'
                placeholder='Saisir Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}></Form.Control>
        </Form.Group>

        <Form.Group controlId='password'>
            <Form.Label>Mot de Passe</Form.Label>
            <Form.Control 
                type='password'
                placeholder='Saisir Mot de Passe'
                value={password}
                onChange={(e) => setPassword(e.target.value)}></Form.Control>
        </Form.Group>
        <Button type='submit' variant='primary'>S'identifier</Button>
      </Form>
      <Row className='py-3'>
        <Col>Nouvel Utilisateur? <Link 
                to={redirect ? `/register?redirect=${redirect}` : '/register'}>
                S'enrigistrer
                </Link>
        </Col>
      </Row>
    </FormContainer>
  )
}

export default LoginScreen
*/
import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom' // Updated imports
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Loader from "../components/Loader";
import Message from "../components/Message";
import FormContainer from "../components/FormContainer";
import { login } from '../actions/userActions'

function LoginScreen() { // Removed location and history from props
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const dispatch = useDispatch()
    const location = useLocation() // Get location using hook
    const navigate = useNavigate() // Replace history with navigate

    const redirect = location.search ? location.search.split('=')[1] : '/'

    const userLogin = useSelector(state => state.userLogin)
    const { error, loading, userInfo } = userLogin

    useEffect(() => {
        if(userInfo){
            navigate(redirect) // Use navigate instead of history.push
        }
    }, [navigate, userInfo, redirect]) // Include navigate in dependencies

    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(login(email, password))
    }

  return (
    <FormContainer>
      <h1>S'identifier</h1>
      {error && <Message variant='danger'>{error}</Message>}
      {loading && <Loader />}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='email'>
            <Form.Label>Adresse Email</Form.Label>
            <Form.Control 
                type='email'
                placeholder='Saisir Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>

        <Form.Group controlId='password'>
            <Form.Label>Mot de Passe</Form.Label>
            <Form.Control 
                type='password'
                placeholder='Saisir Mot de Passe'
                value={password}
                onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Button type='submit' variant='primary'>S'identifier</Button>
      </Form>
      <Row className='py-3'>
        <Col>Nouvel Utilisateur? <Link 
                to={redirect ? `/register?redirect=${redirect}` : '/register'}>
                S'enregistrer
                </Link>
        </Col>
      </Row>
    </FormContainer>
  )
}

export default LoginScreen
