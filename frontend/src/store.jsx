import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux'
import { thunk } from 'redux-thunk'
import { composeWithDevTools } from '@redux-devtools/extension'

import {
  patientListReducer,
  patientDetailsReducer,
  patientCreateReducer,
} from './reducers/patientReducers'
import {
  userLoginReducer,
  userRegisterReducer,
  userDetailsReducer,
  userUpdateProfileReducer,
} from './reducers/userReducers'
import {
  reasonsReducer,
  historyReducer,
  allergiesReducer,
} from './reducers/lookupReducers'
import { medicalFileSaveReducer } from './reducers/medicalFileReducers';
import { sectionsReducer, categoryLookupReducer } from './reducers/sectionReducers';

const reducer = combineReducers({
  patientList: patientListReducer,
  patientDetails: patientDetailsReducer,
  patientCreate: patientCreateReducer,

  userLogin: userLoginReducer,
  userRegister: userRegisterReducer,
  userDetails: userDetailsReducer,
  userUpdateProfile: userUpdateProfileReducer,

  reasons: reasonsReducer,
  history: historyReducer,
  allergies: allergiesReducer,

  medicalFileSave: medicalFileSaveReducer,

  sectionsList: sectionsReducer,
  categoryLookup: categoryLookupReducer,
})

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null

const initialState = {
  userLogin: { userInfo: userInfoFromStorage },
  userRegister: {},
  reasons: { primary: [], others: [] },
  history: { primary: [], others: [] },
  allergies: { primary: [], others: [] },
}

const middleware = [thunk]

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
)

export default store