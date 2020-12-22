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
			return 'Room name is required';
		} else if (value.length > 50) {
			return 'Room name can\'t be more than 50 characters long';
		}
		return '';
	},
	password: value => {
		if (!value) {
			return 'Password is required';
		} else if (value.length  > 50) {
			return 'Password can\'t be more than 50 characters long';
		}
		return '';
	}
};
