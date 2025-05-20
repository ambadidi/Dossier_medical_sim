import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux'
import { thunk } from 'redux-thunk'
import { composeWithDevTools } from '@redux-devtools/extension'
import { patientListReducer, patientDetailsReducer } from './reducers/patientReducers'

const reducer = combineReducers({
    patientList: patientListReducer,
    patientDetails: patientDetailsReducer

})

const initialState = {}

const middleware = [thunk]

const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)))

export default store