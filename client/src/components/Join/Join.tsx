import React, { useState, useEffect, useMemo } from "react";
import { FaSignInAlt } from "react-icons/fa";
import "./Join.scss";
import Swal from "sweetalert2";
import queryString from "query-string";
import { useHistory } from "react-router-dom";
import validateUser from "@/validators/validateUser";
import type { UrlQuery } from "@/utils/urlQuery";

const Join = () => {
	const [formData, setFormData] = useState({
		name: "",
		room: "",
		password: ""
	});
	const [formErrors, setFormErrors] = useState({
		name: "",
		room: "",
		password: ""
	});
	const history = useHistory();
	const query = useMemo<UrlQuery>(() => queryString.parse(history.location.search), [history.location.search]);

	useEffect(() => {
		let mounted = true;

		document.title = "Comh";

		setFormData(state => {
			const previousRoom = localStorage.getItem("room");
			const previousName = localStorage.getItem("name");
			const previousPassword = localStorage.getItem("password");

			if (previousRoom) state.room = previousRoom;
			if (previousName) state.name = previousName;
			if (previousPassword) state.password = previousPassword;

			return state;
		});

		if (query.room || query.name || query.password) {
			setFormData(state => {
				state.name = state.room = state.password = "";

				if (query.room) state.room = query.room;
				if (query.name) state.name = query.name;
				if (query.password) state.password = query.password;

				return state;
			});
		}

		return () => {
			mounted = false
		};
	}, [history]);

	const handleChange = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(state => ({ ...state, [name]: value }));
		setFormErrors(state => ({ ...state, [name]: "" }));
	};

	const handleBlur = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
		setFormErrors(state => ({ ...state, [name]: validateUser[name](value) }));
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const errors: {
			[key: string]: string
		} = {};
		for (const key of Object.keys(formData)) {
			errors[key] = validateUser[key]((formData as typeof errors)[key]);
		}

		setFormErrors(errors as typeof formErrors);

		if (Object.values(errors).every(error => error === "")) {
			const urlQuery = queryString.stringify({
				name: formData.name.trim(),
				room: formData.room.trim(),
				password: formData.password
			});

			history.push(`/chat?${urlQuery}`);
		} else {
			Swal.fire("Error", "Invalid form.", "error");
		}
	};

	return (
		<div className="Join">
			<form onSubmit={handleSubmit} autoComplete="off">
				<input
					type="text"
					maxLength={32}
					name="name"
					placeholder="Name"
					data-invalid={formErrors.name ? formErrors.name : undefined}
					value={formData.name} onChange={handleChange} onBlur={handleBlur}
				/>
				{formErrors.name !== "" && <div className="validation-error">{formErrors.name}</div>}
				<input
					type="text"
					maxLength={50}
					name="room"
					placeholder="Room"
					data-invalid={formErrors.room ? formErrors.room : undefined}
					value={formData.room} onChange={handleChange} onBlur={handleBlur}
				/>
				{formErrors.room !== "" && <div className="validation-error">{formErrors.room}</div>}
				<input
					type="password"
					maxLength={50}
					name="password"
					placeholder="Password"
					data-invalid={formErrors.password ? formErrors.password : undefined}
					value={formData.password} onChange={handleChange} onBlur={handleBlur}
				/>
				{formErrors.password !== "" && <div className="validation-error">{formErrors.password}</div>}
				<button type="submit">
					<FaSignInAlt />
					<span>join</span>
				</button>
			</form>
		</div>
	);
};

export default Join;
