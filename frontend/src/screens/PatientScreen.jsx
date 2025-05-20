import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listPatientDetails } from '../actions/patientActions'
import Loader from "../components/Loader";
import Message from "../components/Message";

function PatientScreen({ match }) {
  const dispatch = useDispatch()
  const patientDetails = useSelector(state => state.patientDetails)
  const { loading, error, patient } = patientDetails

  useEffect(() => {
    dispatch(listPatientDetails(match.params.id))
  }, [dispatch, match]);


  return (
    <>
      <div className="container mt-3">
        <h1>Patient Screen</h1>
        {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <p>Welcome to the patient page!</p>
      )}
      </div>
    </>
  );
}

export default PatientScreen;
