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