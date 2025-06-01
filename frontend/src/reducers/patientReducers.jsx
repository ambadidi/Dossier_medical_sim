import {
  PATIENT_LIST_REQUEST,
  PATIENT_LIST_SUCCESS,
  PATIENT_LIST_FAIL,
  PATIENT_DETAILS_REQUEST,
  PATIENT_DETAILS_SUCCESS,
  PATIENT_DETAILS_FAIL,
  PATIENT_CREATE_REQUEST,
  PATIENT_CREATE_SUCCESS,
  PATIENT_CREATE_FAIL,
  PATIENT_CREATE_RESET,
} from "../constants/patientConstants";

export const patientListReducer = (state = { patients: [] }, action) => {
  switch (action.type) {
    case PATIENT_LIST_REQUEST:
      return { loading: true, patients: [] };

    case PATIENT_LIST_SUCCESS:
      return { loading: false, patients: action.payload };

    case PATIENT_LIST_FAIL:
      return { loading: false, error: action.payload };

    default:
      return state;
  }
};

export const patientDetailsReducer = (
  state = { patient: { details: [] } },
  action
) => {
  switch (action.type) {
    case PATIENT_DETAILS_REQUEST:
      return { loading: true, ...state };

    case PATIENT_DETAILS_SUCCESS:
      return { loading: false, patient: action.payload };

    case PATIENT_DETAILS_FAIL:
      return { loading: false, error: action.payload };

    default:
      return state;
  }
};

export const patientCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case PATIENT_CREATE_REQUEST:
      return { loading: true };

    case PATIENT_CREATE_SUCCESS:
      return { loading: false, success: true, patient: action.payload };

    case PATIENT_CREATE_FAIL:
      return { loading: false, error: action.payload };

    case PATIENT_CREATE_RESET:
      return {};

    default:
      return state;
  }
};
