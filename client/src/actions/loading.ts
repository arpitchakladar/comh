import { LoadingActionPayload } from "@/reducers/loading";

type LoadingAction = () => LoadingActionPayload;

export const showLoading: LoadingAction = () => ({ type: "SHOW-LOADING" });

export const hideLoading: LoadingAction = () => ({ type: "HIDE-LOADING" });
