import axios from 'axios';
import {
  REASONS_REQUEST, REASONS_SUCCESS, REASONS_FAIL,
  HISTORY_REQUEST, HISTORY_SUCCESS, HISTORY_FAIL,
  ALLERGIES_REQUEST, ALLERGIES_SUCCESS, ALLERGIES_FAIL,
} from '../constants/lookupConstants';

export const listReasons = () => async (dispatch) => {
  try {
    dispatch({ type: REASONS_REQUEST });
    const { data } = await axios.get('/api/patients/lookup/reasons/');
    dispatch({ type: REASONS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: REASONS_FAIL, payload: error.message });
  }
};

export const listHistory = () => async (dispatch) => {
  try {
    dispatch({ type: HISTORY_REQUEST });
    const { data } = await axios.get('/api/patients/lookup/history/');
    dispatch({ type: HISTORY_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: HISTORY_FAIL, payload: error.message });
  }
};

export const listAllergies = () => async (dispatch) => {
  try {
    dispatch({ type: ALLERGIES_REQUEST });
    const { data } = await axios.get('/api/patients/lookup/allergies/');
    dispatch({ type: ALLERGIES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ALLERGIES_FAIL, payload: error.message });
  }
};