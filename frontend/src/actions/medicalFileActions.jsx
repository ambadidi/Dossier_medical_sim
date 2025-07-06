import axios from 'axios';
import { MEDFILE_SAVE_REQUEST, MEDFILE_SAVE_SUCCESS, MEDFILE_SAVE_FAIL } from '../constants/medicalFileConstants';

export const saveMedicalFile = (patientId, data) => async (dispatch, getState) => {
  try {
    dispatch({ type: MEDFILE_SAVE_REQUEST });
    const { userLogin: { userInfo } } = getState();
    const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
    await axios.post(`/api/patients/${patientId}/medical-file/`, data, config);
    dispatch({ type: MEDFILE_SAVE_SUCCESS });
  } catch (error) {
    dispatch({ type: MEDFILE_SAVE_FAIL, payload: error.message });
  }
};