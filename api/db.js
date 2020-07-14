const mongoose = require('mongoose');

exports.connect = () => {
	mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

	mongoose.connection
		.once('open', () => console.log('Successfully connected to database'))
		.on('error', err => console.log(`An error occured while connecting to database ${err}`));
};
