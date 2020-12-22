import React, { useState, useEffect, useMemo } from 'react';
import { FaSignInAlt } from 'react-icons/fa';
import './Join.scss';
import Swal from 'sweetalert2';
import queryString from 'query-string';
import { useHistory } from 'react-router-dom';
import validators from '@/validators/validateUser';

const Join = () => {
	const [formData, setFormData] = useState({
		name: '',
		room: '',
		password: ''
	});
	const [formErrors, setFormErrors] = useState({
		name: '',
		room: '',
		password: ''
	});
	const history = useHistory();
	const query = useMemo(() => queryString.parse(location.search), [location.search]);

	useEffect(() => {
		let mounted = true;

		document.title = "Comh";

		if (query.room || query.name) {
			setFormData(state => {
				if (query.room) state.room = query.room;
				if (query.name) state.name = query.name;
				if (query.password) state.password = query.password;

				return state;
			});
		} else {
			const previousRoom = localStorage.getItem('room');
			const previousName = localStorage.getItem('name');
			const previousPassword = localStorage.getItem('password');

			if (previousRoom && previousName) {
				setFormData({ name: previousName, room: previousRoom, password: previousPassword });
			}
		}

		return () => mounted = false;
	}, [history]);

	const handleChange = ({ target: { name, value } }) => {
		setFormData(state => ({ ...state, [name]: value }));
		setFormErrors(state => ({ ...state, [name]: '' }));
	};

	const handleBlur = ({ target: { name, value } }) => {
		setFormErrors(state => ({ ...state, [name]: validators[name](value) }));
	};

	const handleSubmit = e => {
		e.preventDefault();

		const errors = {};
		for (const key of Object.keys(formData)) {
			errors[key] = validators[key](formData[key]);
		}
		setFormErrors(errors);
		if (Object.values(errors).every(error => error === '')) {
			history.push(`/chat?name=${formData.name.trim()}&room=${formData.room.trim()}&password=${formData.password}`);
		} else {
			Swal.fire('Error', 'Invalid form.', 'error');
		}
	};

	return (
		<div className="Join">
			<form onSubmit={handleSubmit} autoComplete="off">
				<input type="text" maxLength="32" name="name" placeholder="Name" invalid={!!formErrors.name} value={formData.name} onChange={handleChange} onBlur={handleBlur} />
				{formErrors.name !== '' && <div className="validation-error">{formErrors.name}</div>}
				<input type="text" maxLength="50" name="room" placeholder="Room" invalid={!!formErrors.room} value={formData.room} onChange={handleChange} onBlur={handleBlur} />
				{formErrors.room !== '' && <div className="validation-error">{formErrors.room}</div>}
				<input type="password" maxLength="50" name="password" placeholder="Password" invalid={!!formErrors.password} value={formData.password} onChange={handleChange} onBlur={handleBlur} />
				{formErrors.password !== '' && <div className="validation-error">{formErrors.password}</div>}
				<button type="submit">
					<FaSignInAlt />
					<span>join</span>
				</button>
			</form>
		</div>
	);
};

export default Join;
