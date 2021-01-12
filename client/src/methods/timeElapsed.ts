export default (time: string) => {
	const elapsedTime = Date.now() - Date.parse(time);

	let t = 12 * 30 * 24 * 60 * 60 * 1000;

	if (elapsedTime > t) {
		return `${Math.floor(elapsedTime / t)} years`;
	}

	t /= 12;
	if (elapsedTime > t) {
		return `${Math.floor(elapsedTime / t)} months`;
	}

	t /= 30;
	if (elapsedTime > t) {
		return `${Math.floor(elapsedTime / t)} days`;
	}

	t /= 24;
	if (elapsedTime > t) {
		return `${Math.floor(elapsedTime / t)} hours`;
	}

	t /= 60;
	if (elapsedTime > t) {
		return `${Math.floor(elapsedTime / t)} mins`;
	}

	t /= 60;
	if (elapsedTime > t) {
		return `${Math.floor(elapsedTime / t)} secs`;
	}

	return "0 secs";
};
