import { createStore, combineReducers } from "redux";
import whatsNew from './whatsNew';
import loading from './loading';

export default createStore(combineReducers({
  whatsNew,
  loading
}));
