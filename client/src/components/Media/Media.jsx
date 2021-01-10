import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Media.scss";

const Media = ({ loader, error: errorToShow, className, src, disable, ...rest }) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const extension = useMemo(() => src?.substring(src.lastIndexOf(".") + 1).toLowerCase(), [src]);
	const type = useMemo(() => {
		if (["mp4", "ogg", "webm"].includes(extension)) {
			return "video";
		} else {
			return "image";
		}
	}, [extension]);
	const media = useRef(null);

	useEffect(() => {
		window.addEventListener("load", () => {
			if (media && media.current && media.current.complete) {
				if (media.current.naturalHeight === 0) {
					setError(true);
					setLoading(false);
				} else {
					setLoading(false);
				}
			}
		});
	}, []);

	const handleLoaded = () => {
		setLoading(false);
	};

	const handleError = () => {
		setLoading(false);
		setError(true);
	};

	return (
		<span className="Media">
			{type === "video"
			? <video onLoadedData={handleLoaded} show={loading || error ? "false" : "true"} className={`${className || ""} media`} ref={media} {...rest}>
				<source src={`${src}${disable ? "#t=0.1" : ""}`} type={`video/${extension}`} />
			</video>
			: <img onLoad={handleLoaded} onError={handleError} src={src} className={`${className} media`} show={loading || error ? "false" : "true"} ref={media} {...rest} />}
			{loading
			? error
				? errorToShow
				: loader
			: null}
		</span>
	);
};

export default Media;
