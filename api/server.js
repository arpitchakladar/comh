const PORT = process.env.PORT || 8081;

require('./index').listen(PORT, () => console.log(`Server is running on port ${PORT}`));
