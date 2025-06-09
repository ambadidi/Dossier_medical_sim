import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";   // ← import useParams
import { listPatientDetails } from "../actions/patientActions";
import Loader from "../components/Loader";
import Message from "../components/Message";

function PatientScreen() {
  const dispatch = useDispatch();

  // Pull the "id" param from the URL (e.g. /patients/123 → id === "123")
  const { id } = useParams();

  const patientDetails = useSelector((state) => state.patientDetails);
  const { loading, error, patient } = patientDetails;

  useEffect(() => {
    if (id) {
      dispatch(listPatientDetails(id));
    }
  }, [dispatch, id]);

  return (
    <div className="container mt-3">
      <h1>Patient Screen</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : patient ? (
        <>
          <h2>{patient.name}</h2>
          <p>Créé le : {new Date(patient.createdAt).toLocaleDateString("fr-FR")}</p>
          {/* Render more patient fields here, e.g.: */}
          <p>
            <strong>Identifiant :</strong> {patient._id}
          </p>
          <p>
            <strong>Médecin ID :</strong> {patient.doctor}
          </p>
          {/* … etc. */}
        </>
      ) : (
        <p>Aucun patient trouvé.</p>
      )}
    </div>
  );
}

export default PatientScreen;
