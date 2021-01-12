import React from "react";
import "./Loader.scss";
import SpinnerIcon from "@/svg/spinner.svg";

interface LoaderPropsMain {};

type LoaderProps = LoaderPropsMain & React.HTMLProps<HTMLDivElement>;

const Loader: React.FC<LoaderProps> = ({ className, ...rest }) => {
	return (
		<div className={`${className ? `${className} ` : ""}Loader`} {...rest}>
			<SpinnerIcon className="spin" />
		</div>
	);
};

export default Loader;
