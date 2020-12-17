import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Chat.scss';
import { CSSTransition } from 'react-transition-group';
import { FaSignOutAlt, FaArrowRight, FaTag, FaTimes, FaArrowDown, FaEllipsisV, FaUpload, FaImage } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { Img } from 'react-image';
import { showLoading, hideLoading } from '@/actions/loading';
import queryString from 'query-string';
import io from 'socket.io-client';
import { useHistory } from 'react-router-dom';
import Linkify from 'react-linkify';
import Swal from 'sweetalert2';
import validators from '@/validators/validateUser';
import LoadingGif from '@/assets/loading.gif';
import NotifySound from '@/assets/notify.mp3';
import timeElapsed from '@/methods/timeElapsed';

let socket;
const audio = new Audio(NotifySound);
audio.volume = 0.3;

const Chat = ({ location }) => {
	const [texts, setTexts] =	useState(null);
	const [newText, setNewText] = useState({ text: '', tagged: null, file: null });
	const [showScrollToTheBottom, setShowScrollToTheBottom] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [image, setImage] = useState(null);
	const history = useHistory();
	const textsRef = useRef(null);
	const mediaUploadRef = useRef(null);
	const textInputRef = useRef(null);
	const query = useMemo(() => queryString.parse(location.search), [location.search]);
	const taggedText = useMemo(() => {
		if (texts && newText.tagged) return texts.find(text => text._id === newText.tagged);
		else return null;
	}, [newText.tagged]);
	const dispatch = useDispatch();

	useEffect(() => {
		let mounted = true;

		if (query.room && query.name) {
			const validationResult = {
				name: validators.name(query.name),
				room: validators.room(query.room)
			};

			if (validationResult.name) {
				Swal.fire('Error', validationResult.name, 'error');
				history.push('/');
			} else if (validationResult.room) {
				Swal.fire('Error', validationResult.room, 'error');
				history.push('/');
			}

			localStorage.setItem('room', query.room);
			localStorage.setItem('name', query.name);

			document.title = `Comh - ${query.room}`;

			socket = io(COMH_API_URI);

			socket.emit('join', query, ({ error }) => {
				if (error) {
					Swal.fire('Error', error.message, 'error');
					localStorage.removeItem('room');
					localStorage.removeItem('name');
					history.push('/');
				}
			});

			socket.on('text', ({ text }) => {
				if (mounted) {
					setTexts(state => state ? [...state, text] : [text]);
					setTimeout(() => {
						if ((textsRef.current.clientHeight + textsRef.current.scrollTop) >= (textsRef.current.scrollHeight - 200)) scrollToBottom();
					}, 400);
					if (document.hidden) {
						audio.play();
					}
				}
			});

			socket.on('backup', ({ backup }) => {
				setTexts(texts => texts ? [...backup, ...texts] : backup);
			});

			socket.on('deletedText', ({ _id }) => setTexts(texts => texts.filter(t => t._id !== _id)));

			textsRef.current.addEventListener('scroll', () => setShowScrollToTheBottom(textsRef.current.scrollHeight - textsRef.current.scrollTop > 1500));
		} else {
			history.push('/');
		}

		return () => {
			mounted = false;
			if (socket) {
				socket.disconnect(true);
			}
		};
	}, [query, history]);

	const scrollToBottom = () => textsRef.current.scroll({ top: textsRef.current.scrollHeight, behavior: 'smooth' });

	const handleSubmit = e => {
		e.preventDefault();

		if (newText.text) {
			if (newText.text.length > 255) {
				Swal.fire('Error', 'Text can\'t be more than 255 characters long', 'error');
			} else {
				socket.emit('sendText', { text: newText.text, tagged: newText.tagged, file: newText.file }, ({ error }) => {
					dispatch(hideLoading());
					if (error) {
						Swal.fire('Error', error.message, 'error');
					}
				});
				dispatch(showLoading());
				setNewText({ text: '', tagged: null, file: null });
			}
		} else {
			Swal.fire('Error', 'A text is required', 'error');
		}
	};

	const handleTag = _id => {
		if (texts.findIndex(text => text._id === _id) > -1) {
			setNewText(state => ({ ...state, tagged: _id }));
			textInputRef.current.focus();
		}
	};

	const handleDelete = _id => {
		Swal.fire('Are you sure?', 'Are you sure you want to delete the text?', 'question').then(({ value }) => {
			if (value) {
				dispatch(showLoading());
				socket.emit('deleteText', { _id }, ({ error }) => {
					dispatch(hideLoading());
					if (error) {
						Swal.fire('Error', error.message, 'error');
					}
				});
			}
		});
	};

	const scrollToText = _id => {
		const textElem = document.querySelector(`.text[id="${_id}"]`);

		if (textElem) {
			textsRef.current.scroll({ top: textElem.offsetTop - 20, behavior: 'smooth' });
			textElem.classList.remove('fade-enter-active');
			setTimeout(() => textElem.classList.add('fade-enter-active'), 300);
		} else {
			Swal.fire('Error', 'The text was not found', 'error');
		}
	};

	const handleMediaUpload = () => {
		const file = mediaUploadRef.current.files[0];

		if (file) {
			const type = file.type.split('/')[0];

			if (type === 'image') {
				if (file.size < 1024 * 2048) {

					const fr = new FileReader();
		
					fr.onload = () => {
						setNewText(state => ({ ...state, file: { originalname: file.name, buffer: fr.result } }));
						dispatch(hideLoading());
					};
		
					fr.readAsArrayBuffer(file);
					dispatch(showLoading());
				} else {
					Swal.fire('Error', 'File too big...', 'error');
					setNewText(state => ({ ...state, file: null }));
				}
			} else {
				Swal.fire('Error', 'Invalid media type', 'error');
				setNewText(state => ({ ...state, file: null }));
			}
		} else setUploadMediaType(null);
	};

	const handleToggleTextMenu = (_id, setFalse) => {
		const textElement = document.querySelector(`.text[id="${_id}"]`);
		
		const textContentElement = textElement.querySelector('.text-content');

		const textMenuToggleElement = textElement.querySelector('.text-menu-toggle');

		if ((textElement.clientWidth - textContentElement.clientWidth) <= 160) {
			textMenuToggleElement.setAttribute('opposite', '');
		} else {
			textMenuToggleElement.removeAttribute('opposite');
		}

		if ((textsRef.current.scrollHeight - textElement.offsetTop) < 120) {
			textMenuToggleElement.setAttribute('flip', '');
		} else {
			textMenuToggleElement.removeAttribute('flip');
		}

		setTexts(texts => texts.map(text => {
			if (text._id === _id) text.menu = !text.menu;
			if (setFalse) text.menu = false;

			return text;
		}));
	};

	return (
		<div className="Chat">
			<div className="chat-content">
				<div className="chat-header">
					<div className="room-name">{query.room}</div>
					<div className="chat-menu">
						<button type="button" className="chat-menu-toggle" onBlur={() => setShowMenu(false)} onClick={() => setShowMenu(state => !state)}><FaEllipsisV /></button>
						<CSSTransition in={showMenu} timeout={300} classNames="fade" unmountOnExit={true}>
							<div className="chat-menu-content">
								<ul>
									<li onClick={() => history.push('/')}><FaSignOutAlt /> <div>exit</div></li>
								</ul>
							</div>
						</CSSTransition>
					</div>
				</div>
				<div className="texts" ref={textsRef}>
					{texts
						? <>
								{texts.map(text => 
								<div className="text fade-enter-active" id={text._id} key={text._id} is-current-user={query.name === text.sender} is-from-console={!text.sender}>
									<div className="text-content">
										{text.sender &&
											(query.name !== text.sender
												? <div className="text-sender">{text.sender}{text.createdAt && <> • {timeElapsed(text.createdAt)} ago</>}</div>
												: text.createdAt && <div className="text-createdAt">{timeElapsed(text.createdAt)} ago</div>)}
										{text.tagged && <div className="text-tagged" onClick={() => scrollToText(text.tagged._id)}>
											<div className="text-tagged-sender">{text.tagged.sender}</div>
											<div className="text-tagged-content">
												{text.tagged.image && <Img loader={<img src={LoadingGif} alt="Loading..." className="image-loader" />} src={text.tagged.image} alt="" className="text-tagged-image" />}
												<div className="text-tagged-content-text">{text.tagged.text}</div>
											</div>
										</div>}
										{text.image && <Img loader={<img src={LoadingGif} alt="Loading..." className="image-loader" />} src={text.image} alt="" className="text-image" onClick={() => setImage(text.image)} />}
										<div className="text-content-text"><Linkify>{text.text}</Linkify></div>
										{text.sender &&<div className="text-menu">
											<button className="text-menu-toggle" type="button" onClick={() => handleToggleTextMenu(text._id)} onBlur={() => handleToggleTextMenu(text._id, true)}><FaEllipsisV /></button>
											<CSSTransition in={text.menu} classNames="fade" timeout={300} unmountOnExit={true}>
												<div className="text-menu-content">
													<ul>
														<li onClick={() => handleTag(text._id)}><FaTag /> <p>Tag</p></li>
														{text.sender === query.name && <li onClick={() => handleDelete(text._id)}><FaTimes /> <p>Delete</p></li>}
													</ul>
												</div>
											</CSSTransition>
										</div>}
									</div>
								</div>)}
								<CSSTransition in={showScrollToTheBottom} classNames="fade" timeout={300} unmountOnExit={true}>
									<button className="scroll-below" onClick={scrollToBottom}>
										<FaArrowDown />
									</button>
								</CSSTransition>
							</>
						: <img src={LoadingGif} alt="Loading..." className="Loading" />
					}
				</div>
				<form className="new-text" onSubmit={handleSubmit} autoComplete="off">
					{taggedText && <div className="tagged">
							<div className="text" key={taggedText._id} is-current-user={query.name === taggedText.sender}>
								<div className="text-content">
									{taggedText.sender && <div className="text-sender">{taggedText.sender}</div>}
									<div className="text-message">
										{taggedText.image && <Img loader={<img src={LoadingGif} alt="Loading..." className="image-loader" />} src={taggedText.image} alt="" className="text-tagged-image" />}
										<div className="text-message-text">{taggedText.text}</div>
									</div>
									<button className="cancel" type="button" onClick={() => setNewText(state => ({ ...state, tagged: null }))}><FaTimes /></button>
								</div>
							</div>
					</div>}
					<div className="new-text-fields">
						<input type="file" id="upload-media-input" accept="image/*" onChange={handleMediaUpload} ref={mediaUploadRef} />
						<label htmlFor="upload-media-input" className="upload-media">
							{newText.file ? <FaImage /> : <FaUpload />}
						</label>
						<input type="text" ref={textInputRef} maxLength="255" value={newText.text} onChange={e => setNewText(state => ({...state, text: e.target.value}))} />
						<button type="submit">
							<FaArrowRight />
						</button>
					</div>
				</form>
			</div>
			<CSSTransition in={!!image} timeout={300} classNames="loading-fade" unmountOnExit={true}>
				<div className="show-image">
					<button className="close" onClick={() => setImage(null)}><FaTimes /></button>
					<div className="image">
						<Img loader={<img src={LoadingGif} alt="Loading..." className="image-loader" />} src={image} alt=""/>
					</div>
				</div>
			</CSSTransition>
		</div>
	);
};

export default Chat;
