import { MEDFILE_SAVE_REQUEST, MEDFILE_SAVE_SUCCESS, MEDFILE_SAVE_FAIL, MEDFILE_SAVE_RESET } from '../constants/medicalFileConstants';

export const medicalFileSaveReducer = (state = {}, action) => {
  switch (action.type) {
    case MEDFILE_SAVE_REQUEST: return { loading: true };
    case MEDFILE_SAVE_SUCCESS: return { loading: false, success: true };
    case MEDFILE_SAVE_FAIL: return { loading: false, error: action.payload };
    case MEDFILE_SAVE_RESET: return {};
    default: return state;
  }
};