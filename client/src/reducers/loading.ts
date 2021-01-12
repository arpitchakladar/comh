export interface LoadingActionPayload {
	type: "SHOW-LOADING" | "HIDE-LOADING";
};

export default (state = false, actions: LoadingActionPayload) => {
	switch (actions.type) {
		case "SHOW-LOADING":
			return true;
		
		case "HIDE-LOADING":
			return false;

		default:
			return state;
	}
};
