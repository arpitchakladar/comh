import mongoose from "mongoose";

export const connect = () => new Promise<void>((resolve, reject) => {
	mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

	mongoose.connection
		.once("open", () => {
			console.log("Successfully connected to database");
			resolve();
		})
		.on("error", (err) => {
			console.log(`An error occured while connecting to database ${err}`);
			reject();
		});
});
