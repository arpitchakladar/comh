export default {
	name: value => {
		if (!value) {
			return 'Name is required';
		} else if (value.length > 32) {
			return 'Name can\'t be more than 32 characters long';
		}
		return '';
	},
	room: value => {
		if (!value) {
			return 'Room is required';
		} else if (value.length > 50) {
			return 'Room can\'t be more than 50 characters long';
		}
		return '';
	}
};
