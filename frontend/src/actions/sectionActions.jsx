import axios from 'axios';
import {
  SECTIONS_REQUEST, SECTIONS_SUCCESS, SECTIONS_FAIL,
  CATEGORY_LOOKUP_REQUEST, CATEGORY_LOOKUP_SUCCESS, CATEGORY_LOOKUP_FAIL
} from '../constants/sectionConstants';

export const listSections = () => async (dispatch, getState) => {
  try {
    dispatch({ type: SECTIONS_REQUEST });
    const { userLogin: { userInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.access}` } };
    const { data } = await axios.get('/api/admin/sections/', config);
    dispatch({ type: SECTIONS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: SECTIONS_FAIL, payload: error.response?.data || error.message });
  }
};

export const lookupCategory = (categoryId) => async (dispatch, getState) => {
  try {
    dispatch({ type: CATEGORY_LOOKUP_REQUEST, meta: categoryId });
    const { userLogin: { userInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.access}` } };
    const { data } = await axios.get(`/api/admin/lookup/category/${categoryId}/`, config);
    dispatch({ type: CATEGORY_LOOKUP_SUCCESS, payload: data, meta: categoryId });
  } catch (error) {
    dispatch({ type: CATEGORY_LOOKUP_FAIL, payload: error.response?.data || error.message, meta: categoryId });
  }
};