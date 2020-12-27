import { Schema, Document, model } from "mongoose";

export interface User extends Document {
	_id: string;
	name: string;
	room: any;
};

const UserSchema = new Schema<User>({
	_id: {
		type: String,
		required: [true, 'User id is required']
	},
	name: {
		type: String,
		maxlength: [32, 'User name can\'t be more than 32 characters long'],
		required: [true, 'User name is required']
	},
	room: {
		type: Schema.Types.ObjectId,
		required: [true, 'User room is required']
	}
}, { _id: false, timestamps: { createdAt: true, updatedAt: false } });

export const UserModel = model<User>('User', UserSchema);
