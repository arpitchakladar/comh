import React, { useState, useEffect, useMemo, useRef, FormEvent } from "react";
import "./Chat.scss";
import { CSSTransition } from "react-transition-group";
import { FaSignOutAlt, FaArrowRight, FaTag, FaTimes, FaArrowDown, FaEllipsisV, FaUpload, FaImage, FaLink } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "@/actions/loading";
import queryString from "query-string";
import { io, Socket } from "socket.io-client";
import { RouteProps, useHistory } from "react-router-dom";
import cryptoAES from "crypto-js/aes";
import cryptoSHA256 from "crypto-js/sha256";
import Utf8 from "crypto-js/enc-utf8"
import Linkify from "react-linkify";
import Swal from "sweetalert2";
import axios from "axios";
import ErrorIcon from "@/svg/error.svg";
import validators from "@/validators/validateUser";
import Media from "@/components/Media/Media";
import Loader from "@/components/Loader/Loader";
import timeElapsed from "@/methods/timeElapsed";
import type { UrlQuery } from "@/utils/urlQuery";

let socket: Socket;
const audio = new Audio("/assets/notify.mp3");
audio.volume = 0.3;

interface ChatProps extends RouteProps {};

interface ResponseError {
	message: string;
};

interface ReceivedText {
	_id: string;
	text?: string;
	media?: string;
	tagged?: ReceivedText;
	sender?: string;
	createdAt?: string;
};

interface Text extends ReceivedText {
	menu?: boolean;
};

interface EmitJoinResponse {
	error?: ResponseError;
	backup?: ReceivedText[];
};

interface EmitSendTextResponse {
	error?: ResponseError;
};

interface EmitDeleteTextResponse {
	error?: ResponseError;
};

interface OnTextResponse {
	text: ReceivedText;
	unencrypted?: boolean;
};

interface OnDeletedTextResponse {
	_id: string;
};

interface MediaUploadResponse {
	url: string;
};

interface NewText {
	text: string;
	media: File | null;
	tagged: string | null;
};

const Chat: React.FC<ChatProps> = ({ location }) => {
	const [texts, setTexts] =	useState<Text[] | null>(null);
	const [newText, setNewText] = useState<NewText>({ text: "", tagged: null, media: null });
	const [showScrollToTheBottom, setShowScrollToTheBottom] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [media, setMedia] = useState<string | null>(null);
	const history = useHistory();
	const textsRef = useRef<null | HTMLDivElement>(null);
	const mediaUploadRef = useRef<HTMLInputElement | null>(null);
	const textInputRef = useRef<HTMLInputElement | null>(null);
	const query = useMemo<UrlQuery>(() => queryString.parse(location!.search), [location!.search]);
	const taggedText = useMemo(() => {
		if (texts && newText.tagged) return texts.find(text => text._id === newText.tagged);
		else return null;
	}, [newText.tagged]);
	const dispatch = useDispatch();

	useEffect(() => {
		let mounted = true;

		if (query.room && query.name && query.password) {
			const validationResult = {
				name: validators.name(query.name),
				room: validators.room(query.room),
				password: validators.password(query.password)
			};

			if (validationResult.name) {
				Swal.fire("Error", validationResult.name, "error");
				history.push("/");
			} else if (validationResult.room) {
				Swal.fire("Error", validationResult.room, "error");
				history.push("/");
			} else if (validationResult.password) {
				Swal.fire("Error", validationResult.password, "error");
				history.push("/");
			}

			localStorage.setItem("room", query.room);
			localStorage.setItem("name", query.name);
			localStorage.setItem("password", query.password);

			document.title = `Comh - ${query.room}`;

			socket = io(window.comhApiUri);

			socket.emit("join", {
				name: query.name,
				room: query.room,
				hashedPassword: cryptoSHA256(query.password).toString()
			}, ({ error, backup }: EmitJoinResponse) => {
				if (mounted) {
					if (error) {
						Swal.fire("Error", error.message, "error");
						localStorage.removeItem("room");
						localStorage.removeItem("name");
						localStorage.removeItem("password");
						history.push("/");
					} else if (backup) {
						setTexts(texts => {
							const _backup = backup.map(text => {
								let tagged = undefined;
								if (text.tagged) {
									tagged = {
										...text.tagged,
										text: text.tagged.text ? cryptoAES.decrypt(text.tagged.text, query.password!).toString(Utf8) : undefined
									};
								}
								return { ...text, tagged, text: text.text ? cryptoAES.decrypt(text.text, query.password!).toString(Utf8) : undefined };
							});
							return texts ? [..._backup, ...texts] : _backup;
						});
					}
				}
			});

			socket.on("text", ({ text, unencrypted }: OnTextResponse) => {
				if (mounted) {
					setTexts(state => {
						const _text = text.text ? (unencrypted ? text.text : cryptoAES.decrypt(text.text, query.password!).toString(Utf8)) : undefined;
						let tagged = undefined;
						if (text.tagged) {
							tagged = {
								...text.tagged,
								text: text.tagged.text ? cryptoAES.decrypt(text.tagged.text, query.password!).toString(Utf8) : undefined
							};
						}
						return state ? [...state, { ...text, tagged, text: _text }] : [{ ...text, tagged, text: _text }];
					});

					if (textsRef.current) {
						setTimeout(() => {
							if ((textsRef.current!.clientHeight + textsRef.current!.scrollTop) >= (textsRef.current!.scrollHeight - 200)) {
								scrollToBottom();
							}
						}, 400);

						setShowScrollToTheBottom(textsRef.current.scrollHeight - textsRef.current.scrollTop > 1500);
					}

					if (document.hidden) {
						audio.play();
					}
				}
			});

			textsRef.current?.addEventListener("scroll", () => setShowScrollToTheBottom(textsRef.current!.scrollHeight - textsRef.current!.scrollTop > 1500));
		} else {
			history.push("/");
		}

		return () => {
			mounted = false;
			if (socket) {
				socket.disconnect();
			}
		};
	}, [query, history]);

	useEffect(() => {
		let mounted = true;

		socket.on("deletedText", ({ _id }: OnDeletedTextResponse) => {
			if (mounted) {
				if (texts) {
					setTexts((texts) => {
						const _texts = [];

						for (const text of texts!) {
							if (text._id !== _id) {
								if (text.tagged?._id === _id) {
									_texts.push({ ...text, tagged: undefined });
								} else {
									_texts.push(text);
								}
							}
						}

						return _texts;
					});
				}

				if (textsRef.current) {
					setShowScrollToTheBottom((textsRef.current.scrollHeight - textsRef.current.scrollTop) > 1500);
				}
			}
		});

		return () => {
			mounted = false;
		};
	}, [texts]);

	const scrollToBottom = () => textsRef.current?.scroll({ top: textsRef.current.scrollHeight, behavior: "smooth" });

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (newText.text || newText.media) {
			if (newText.text.length > 255) {
				Swal.fire("Error", "Text can't be more than 255 characters long", "error");
			} else {
				dispatch(showLoading());

				new Promise<void>((resolve, _) => {
					new Promise<void>((resolve, reject) => {
						new Promise<string | undefined>((resolve, reject) => {
							if (newText.media) {
								const formData = new FormData();
								formData.append("media", newText.media);
								axios.post<MediaUploadResponse>(`${window.comhApiUri}/media/upload`, formData, {
									headers: {
										"Content-Type": "multipart/form-data"
									}
								}).then(({ data }) => {
										resolve(data.url);
									})
									.catch(({ response }) => {
										if (response) {
											reject(response.data.error.message);
										} else {
											reject("An error occured.");
										}
									});
							} else {
								resolve(undefined);
							}
						}).then((media) => {
							socket.emit(
								"sendText",
								{
									text: cryptoAES.encrypt(newText.text, query.password!).toString(),
									tagged: newText.tagged,
									media
								},
								({ error }: EmitSendTextResponse) => {
									if (error) reject(error.message);
									resolve();
								}
							);
						}).catch(reject);
					}).then(() => {
						resolve();
					}).catch((message) => {
						Swal.fire("Error", message, "error");
						resolve();
					});
				}).then(() => {
					dispatch(hideLoading());
					setNewText({ text: "", tagged: null, media: null });
				});

			}
		} else {
			Swal.fire("Error", "Text or a media is required", "error");
		}

		if (mediaUploadRef.current) {
			(mediaUploadRef.current!.value as any) = null;
		}
	};

	const handleTag = (_id: string) => {
		if (texts!.findIndex(text => text._id === _id) > -1) {
			setNewText(state => ({ ...state, tagged: _id }));
			textInputRef.current?.focus();
		}
	};

	const handleDelete = (_id: string) => {
		Swal.fire("Are you sure?", "Are you sure you want to delete the text?", "question").then(({ value }) => {
			if (value) {
				dispatch(showLoading());
				socket.emit("deleteText", { _id }, ({ error }: EmitDeleteTextResponse) => {
					dispatch(hideLoading());
					if (error) {
						Swal.fire("Error", error.message, "error");
					}
				});
			}
		});
	};

	const scrollToText = (_id: string) => {
		const textElem = document.querySelector<HTMLDivElement>(`.text[id="${_id}"]`);

		if (textElem) {
			textsRef.current!.scroll({ top: textElem.offsetTop - 20, behavior: "smooth" });
			textElem.classList.remove("fade-enter-active");
			setTimeout(() => textElem.classList.add("fade-enter-active"), 300);
		} else {
			Swal.fire("Error", "The text was not found", "error");
		}
	};

	const handleMediaUpload = () => {
		const mediaFiles = mediaUploadRef.current?.files;

		if (mediaFiles && mediaFiles[0]) {
			const media = mediaFiles[0];
			const typeSplitted = media.type.split("/");
			const type = typeSplitted[0];
			const extension = typeSplitted[1];

			if (type === "image" || (type === "video" && ["mp4", "ogg", "webm"].includes(extension))) {
				if (media.size < 1024 * 1024 * 15) {
					setNewText(state => ({ ...state, media }));
				} else {
					Swal.fire("Error", "Media too big", "error");
					setNewText(state => ({ ...state, media: null }));
				}
			} else {
				Swal.fire("Error", "Invalid media type", "error");
				setNewText(state => ({ ...state, media: null }));
			}
		} else setNewText(state => ({ ...state, media: null }));
	};

	const handleToggleTextMenu = (_id: string, setFalse?: boolean) => {
		const textElement = document.querySelector<HTMLDivElement>(`.text[id="${_id}"]`);
		const textContentElement = textElement!.querySelector<HTMLDivElement>(".text-content");
		const textMenuToggleElement = textElement!.querySelector<HTMLButtonElement>(".text-menu-toggle");

		if ((textElement!.clientWidth - textContentElement!.clientWidth) <= 160) {
			textMenuToggleElement!.setAttribute("opposite", "");
		} else {
			textMenuToggleElement!.removeAttribute("opposite");
		}

		if ((textsRef.current!.scrollHeight - textElement!.offsetTop) < 120) {
			textMenuToggleElement!.setAttribute("flip", "");
		} else {
			textMenuToggleElement!.removeAttribute("flip");
		}

		setTexts(texts => texts!.map(text => {
			if (text._id === _id) text.menu = !text.menu;

			if (setFalse) text.menu = false;

			return text;
		}));
	};

	const handleInvitationLink = () => {
		const urlQuery = queryString.stringify({
			room: query.room,
			password: query.password
		});

		navigator.clipboard.writeText(`${window.comhUri}/#/?${urlQuery}`);
		Swal.fire("Info", "Invitation link copied to your clipboard", "info");
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
									<li onClick={() => history.push("/")}><FaSignOutAlt /> <div>exit</div></li>
									<li onClick={handleInvitationLink}><FaLink /> <div>Link</div></li>
								</ul>
							</div>
						</CSSTransition>
					</div>
				</div>
				<div className="texts" ref={textsRef}>
					{texts
						? <>
								{texts.map((text, num) =>
								<div className="text fade-enter-active" id={text._id} key={text._id || num} is-current-user={query.name === text.sender ? "" : undefined} is-from-console={text.sender ? undefined : ""}>
									<div className="text-content">
										{text.sender &&
											(query.name !== text.sender
												? <div className="text-sender">{text.sender}{text.createdAt && <> • {timeElapsed(text.createdAt)} ago</>}</div>
												: text.createdAt && <div className="text-createdAt">{timeElapsed(text.createdAt)} ago</div>)}
										{text.tagged && <div className="text-tagged" onClick={() => scrollToText(text.tagged!._id)}>
											<div className="text-tagged-sender">{text.tagged.sender}</div>
											<div className="text-tagged-content">
												{text.tagged.media &&
													<Media
														loader={<Loader className="media-loader" />}
														error={<ErrorIcon />}
														src={text.tagged.media}
														alt=""
														className="text-tagged-media"
														disable={true}
													/>
												}
												<div className="text-tagged-content-text">{text.tagged.text}</div>
											</div>
										</div>}
										{text.media &&
											<Media
												loader={<Loader className="media-loader" />}
												error={<ErrorIcon />}
												src={text.media}
												alt=""
												className="text-media"
												onClick={() => setMedia(text.media!)}
												disable={true}
											/>
										}
										<div className="text-content-text"><Linkify>{text.text}</Linkify></div>
										{text.sender && <div className="text-menu">
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
						: <Loader className="texts-loader" />
					}
				</div>
				<form className="new-text" onSubmit={handleSubmit} autoComplete="off">
					{taggedText && <div className="tagged">
							<div className="text" key={taggedText._id} is-current-user={query.name === taggedText.sender ? "" : undefined}>
								<div className="text-content">
									{taggedText.sender && <div className="text-sender">{taggedText.sender}</div>}
									<div className="text-message">
										{taggedText.media &&
											<Media
												loader={<Loader className="media-loader" />}
												error={<ErrorIcon />}
												src={taggedText.media}
												alt=""
												className="text-tagged-media"
												disable={true}
											/>
										}
										<div className="text-message-text">{taggedText.text}</div>
									</div>
									<button className="cancel" type="button" onClick={() => setNewText(state => ({ ...state, tagged: null }))}><FaTimes /></button>
								</div>
							</div>
					</div>}
					<div className="new-text-fields">
						<input type="file" id="upload-media-input" accept="image/*,video/*" onChange={handleMediaUpload} ref={mediaUploadRef} />
						<label htmlFor="upload-media-input" className="upload-media">
							{newText.media ? <FaImage /> : <FaUpload />}
						</label>
						<input type="text" ref={textInputRef} maxLength={255} value={newText.text} onChange={e => setNewText(state => ({...state, text: e.target.value}))} />
						<button type="submit">
							<FaArrowRight />
						</button>
					</div>
				</form>
			</div>
			<CSSTransition in={!!media} timeout={300} classNames="loading-fade" unmountOnExit={true}>
				<div className="show-media">
					<button className="close" onClick={() => setMedia(null)}><FaTimes /></button>
					<div className="media">
						<Media
							loader={<Loader className="media-loader" />}
							error={<ErrorIcon />}
							src={media!}
							alt=""
							disable={false}
							controls
						/>
					</div>
				</div>
			</CSSTransition>
		</div>
	);
};

export default Chat;
