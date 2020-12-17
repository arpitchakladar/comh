export default (state = false, actions) => {
	switch (actions.type) {
		case 'SHOW-LOADING':
			return true;
		
		case 'HIDE-LOADING':
			return false;

		default:
			return state;
	}
};
