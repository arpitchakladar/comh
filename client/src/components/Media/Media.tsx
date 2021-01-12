import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Media.scss";

interface MediaPropsMain {
	loader: JSX.Element;
	error: JSX.Element;
	className?: string;
	src: string;
	disable: boolean;
};

type MediaProps = MediaPropsMain & React.ImgHTMLAttributes<HTMLImageElement> & React.VideoHTMLAttributes<HTMLVideoElement>;

const Media: React.FC<MediaProps> = ({ loader, error: errorToShow, className, src, disable, ...rest }) => {
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
	const media = useRef<any>(null);

	useEffect(() => {
		window.addEventListener("load", () => {
			if (media.current?.complete) {
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
			? <video onLoadedData={handleLoaded} data-show={loading || error ? "false" : "true"} className={`${className || ""} media`} ref={media} {...rest}>
				<source src={`${src}${disable ? "#t=0.1" : ""}`} type={`video/${extension}`} />
			</video>
			: <img onLoad={handleLoaded} onError={handleError} src={src} className={`${className} media`} data-show={loading || error ? "false" : "true"} ref={media} {...rest} />}
			{loading
			? error
				? errorToShow
				: loader
			: null}
		</span>
	);
};

export default Media;
