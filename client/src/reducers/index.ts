import { createStore, combineReducers } from "redux";
import loading from './loading';

export interface Store {
	loading: boolean;
};

export default createStore(combineReducers({
	loading
}));
