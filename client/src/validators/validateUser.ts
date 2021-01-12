export interface StringIndexedValidateUserOptions {
	[key: string]: (value: string) => string;
};

export interface ValidateUserOptions extends StringIndexedValidateUserOptions {
	name: (value: string) => string;
	room: (value: string) => string;
	password: (value: string) => string;
};

export default {
	name: (value: string) => {
		if (!value) {
			return "Name is required";
		} else if (value.length > 32) {
			return "Name can\"t be more than 32 characters long";
		}
		return "";
	},
	room: (value: string) => {
		if (!value) {
			return "Room name is required";
		} else if (value.length > 50) {
			return "Room name can\"t be more than 50 characters long";
		}
		return "";
	},
	password: (value: string) => {
		if (!value) {
			return "Password is required";
		} else if (value.length > 50) {
			return "Password can\"t be more than 50 characters long";
		}
		return "";
	}
} as ValidateUserOptions;
