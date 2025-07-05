import {
  REASONS_REQUEST, REASONS_SUCCESS, REASONS_FAIL,
  HISTORY_REQUEST, HISTORY_SUCCESS, HISTORY_FAIL,
  ALLERGIES_REQUEST, ALLERGIES_SUCCESS, ALLERGIES_FAIL,
} from '../constants/lookupConstants';

export const reasonsReducer = (state = { primary: [], others: [] }, action) => {
  switch (action.type) {
    case REASONS_REQUEST: return { loading: true };
    case REASONS_SUCCESS: return { loading: false, ...action.payload };
    case REASONS_FAIL: return { loading: false, error: action.payload };
    default: return state;
  }
};

export const historyReducer = (state = { primary: [], others: [] }, action) => {
  switch (action.type) {
    case HISTORY_REQUEST: return { loading: true };
    case HISTORY_SUCCESS: return { loading: false, ...action.payload };
    case HISTORY_FAIL: return { loading: false, error: action.payload };
    default: return state;
  }
};

export const allergiesReducer = (state = { primary: [], others: [] }, action) => {
  switch (action.type) {
    case ALLERGIES_REQUEST: return { loading: true };
    case ALLERGIES_SUCCESS: return { loading: false, ...action.payload };
    case ALLERGIES_FAIL: return { loading: false, error: action.payload };
    default: return state;
  }
};