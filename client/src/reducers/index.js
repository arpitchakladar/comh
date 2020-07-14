import { createStore, combineReducers } from "redux";
import whatsNew from './whatsNew';

export default createStore(combineReducers({
  whatsNew
}));
