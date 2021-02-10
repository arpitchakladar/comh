(async () => {
	const PORT = process.env.PORT || 8081;

	if (process.env.NODE_ENV !== 'production') {
		const dotenv = await import("dotenv");
		dotenv.config();
	}

	const { default: api } = await import("@/api");

	api.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
})();
