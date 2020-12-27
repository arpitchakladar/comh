import { Schema, Document, model } from "mongoose";

export interface Room extends Document {
	name: string;
	doubleHashedPassword: string;
};

const RoomSchema = new Schema<Room>({
	name: {
		type: String,
		maxlength: [50, "Room name can't be more than 50 characters long"],
		required: [true, "Room name is required"]
	},
	doubleHashedPassword: {
		type: String,
		required: [true, "Room password is required"]
	}
}, { timestamps: { createdAt: true, updatedAt: false } });

export const RoomModel = model<Room>("Room", RoomSchema);
