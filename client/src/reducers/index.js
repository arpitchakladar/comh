import { createStore, combineReducers } from "redux";
import loading from './loading';

export default createStore(combineReducers({
	loading
}));
