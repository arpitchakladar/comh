import { Schema, Document,model } from "mongoose";
import * as storage from "@/api/utils/storage";

export interface Text extends Document {
	text: string;
	sender: string;
	room: any;
	tagged: any;
	media: string;
};

const TextSchema = new Schema<Text>({
	text: {
		type: String,
		maxlength: [1024 * 5, 'Text size can\'t be more then 5kb']
	},
	sender: {
		type: String,
		required: true
	},
	room: {
		type: Schema.Types.ObjectId,
		required: [true, 'Text room is required']
	},
	tagged: {
		type: Schema.Types.ObjectId
	},
	media: {
		type: String
	}
}, { timestamps: { createdAt: true, updatedAt: false } });

TextSchema.pre<Text>("remove", async function() {
	if (this.media) {
		await storage.deleteItem(this.media);
	}
});

TextSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

TextSchema.pre<Text>("validate", function(next) {
	if (!(this.text || this.media)) next(new Error("Text content or media is required"));
	next();
});

export const TextModel = model<Text>("Text", TextSchema);
