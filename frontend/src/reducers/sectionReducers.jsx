import {
  SECTIONS_REQUEST, SECTIONS_SUCCESS, SECTIONS_FAIL,
  CATEGORY_LOOKUP_REQUEST, CATEGORY_LOOKUP_SUCCESS, CATEGORY_LOOKUP_FAIL
} from '../constants/sectionConstants';

export const sectionsReducer = (state = { sections: [], loading: false, error: null }, action) => {
  switch (action.type) {
    case SECTIONS_REQUEST:
      return { ...state, loading: true };
    case SECTIONS_SUCCESS:
      return { loading: false, sections: action.payload, error: null };
    case SECTIONS_FAIL:
      return { loading: false, sections: [], error: action.payload };
    default:
      return state;
  }
};

export const categoryLookupReducer = (state = {}, action) => {
  const catId = action.meta;
  switch (action.type) {
    case CATEGORY_LOOKUP_REQUEST:
      return { ...state, [catId]: { loading: true } };
    case CATEGORY_LOOKUP_SUCCESS:
      return { ...state, [catId]: { loading: false, ...action.payload, error: null } };
    case CATEGORY_LOOKUP_FAIL:
      return { ...state, [catId]: { loading: false, primary: [], others: [], error: action.payload } };
    default:
      return state;
  }
};