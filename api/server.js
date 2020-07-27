const PORT = process.env.PORT || 4200;

require('./index').listen(PORT, () => console.log(`Server is running on port ${PORT}`));
