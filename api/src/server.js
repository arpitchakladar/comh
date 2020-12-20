const PORT = process.env.PORT || 8081;

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

require('./api').listen(PORT, () => console.log(`Server is running on port ${PORT}`));
