import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Chat.scss';
import { CSSTransition } from 'react-transition-group';
import { FaSignOutAlt, FaArrowRight, FaTag, FaTimes, FaArrowDown, FaEllipsisV, FaUpload, FaImage, FaVideo } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
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
  const [texts, setTexts] =  useState(null);
  const [newText, setNewText] = useState({ text: '', tagged: null, file: null });
  const [showScrollToTheBottom, setShowScrollToTheBottom] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [uploadMediaType, setUploadMediaType] = useState(null);
  const [image, setImage] = useState(null);
  const history = useHistory();
  const textsElement = useRef(null);
  const mediaUploadElement = useRef(null);
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

      socket = io(window.API_URL);

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
          audio.play();
          setTimeout(() => {
            if ((textsElement.current.clientHeight + textsElement.current.scrollTop) >= (textsElement.current.scrollHeight - 50)) scrollToBottom();
          }, 100);
        }
      });

      socket.on('backup', ({ backup }) => {
        setTexts(texts => texts ? [...backup, ...texts] : backup);
      });

      textsElement.current.addEventListener('scroll', () => {
        setShowScrollToTheBottom(textsElement.current.scrollHeight - textsElement.current.scrollTop > 1500)
      });
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

  const scrollToBottom = () => textsElement.current.scroll({ top: textsElement.current.scrollHeight, behavior: 'smooth' });

  const handleSubmit = e => {
    e.preventDefault();

    if (newText.text) {
      socket.emit('sendText', { text: newText.text, tagged: newText.tagged, file: newText.file }, ({ error }) => {
        dispatch(hideLoading());
        if (error) {
          Swal.fire('Error', err.message, 'error');
        }
        scrollToBottom();
      });
      dispatch(showLoading());
      setNewText({ text: '', tagged: null, file: null });
    } else {
      Swal.fire('Error', 'A text is required', 'error');
    }
  };

  const handleTag = _id => {
    if (texts.findIndex(text => text._id === _id) > -1) setNewText(state => ({ ...state, tagged: _id }));
  };

  const scrollToText = _id => {
    const textElem = document.querySelector(`.text[id="${_id}"]`);

    if (textElem) {
      textsElement.current.scroll({ top: textElem.offsetTop - 20, behavior: 'smooth' });
      textElem.classList.remove('fade-enter-active');
      setTimeout(() => textElem.classList.add('fade-enter-active'), 300);
    } else {
      Swal.fire('Error', 'The message was not found', 'error');
    }
  };

  const handleMediaUpload = e => {
    const file = mediaUploadElement.current.files[0];

    if (file) {
      const type = file.type.split('/')[0];

      if (type === 'image') {
        if (file.size < 1024 * 400) {
          setUploadMediaType(type);
  
          const fr = new FileReader();
  
          fr.onload = () => {
            setNewText(state => ({ ...state, file: { originalname: file.name, buffer: fr.result } }));
            dispatch(hideLoading());
          };
  
          fr.readAsArrayBuffer(file);
          dispatch(showLoading());
        } else {
          Swal.fire('Error', 'Too big...', 'error');
          setNewText(state => ({ ...state, file: null }));
        }
      } else {
        Swal.fire('Error', 'Invalid media type', 'error');
        setNewText(state => ({ ...state, file: null }));
      }
    } else setUploadMediaType(null);
  };

  const showImage = url => {
    setImage(url);
  };

  return (
    <div className="Chat">
      <div className="chat-content">
        <div className="chat-header">
          <div className="room-name">{query.room}</div>
          <div className="chat-menu">
            <button type="button" className="chat-menu-toggle" onBlur={() => setShowMenu(false)} onClick={() => setShowMenu(state => !state)}><FaEllipsisV /></button>
            <CSSTransition in={showMenu} timeout={600} classNames="fade" unmountOnExit={true}>
              <div className="chat-menu-content">
                <ul>
                  <li onClick={() => history.push('/')}><FaSignOutAlt /> <div>exit</div></li>
                </ul>
              </div>
            </CSSTransition>
          </div>
        </div>
        <div className="texts" ref={textsElement}>
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
                        {text.tagged.image && <img src={text.tagged.image} alt="image" className="text-tagged-image" />}
                        <div className="text-tagged-content-text">{text.tagged.text}</div>
                      </div>
                    </div>}
                    {text.image && <img src={text.image} alt="image" className="text-image" onClick={() => showImage(text.image)} />}
                    <div className="text-content-text"><Linkify>{text.text}</Linkify></div>
                    {text.sender &&
                      <button className="tag" onClick={() => handleTag(text._id)}>
                        <FaTag />
                      </button>}
                  </div>
                </div>)}
                <CSSTransition in={showScrollToTheBottom} classNames="fade" timeout={600} unmountOnExit={true}>
                  <button className="scroll-below" onClick={scrollToBottom}>
                    <FaArrowDown />
                  </button>
                </CSSTransition>
              </>
            : <img src={LoadingGif} alt="" className="Loading" />
          }
        </div>
        <form className="new-text" onSubmit={handleSubmit} autoComplete="off">
          {taggedText && <div className="tagged">
              <div className="text" key={taggedText._id} is-current-user={query.name === taggedText.sender}>
                <div className="text-content">
                  {taggedText.sender && <div className="text-sender">{taggedText.sender}</div>}
                  <div className="text-message">
                    {taggedText.image && <img src={taggedText.image} alt="image" className="text-tagged-image" />}
                    <div className="text-message-text">{taggedText.text}</div>
                  </div>
                  <button className="cancel" type="button" onClick={() => setNewText(state => ({ ...state, tagged: null }))}><FaTimes /></button>
                </div>
              </div>
          </div>}
          <div className="new-text-fields">
            <input type="file" id="upload-media-input" accept="image/*" onChange={handleMediaUpload} ref={mediaUploadElement} />
            <label htmlFor="upload-media-input" className="upload-media">
              {uploadMediaType === 'image' ? <FaImage /> : <FaUpload />}
            </label>
            <input type="text" value={newText.text} onChange={e => setNewText(state => ({...state, text: e.target.value}))} />
            <button type="submit">
              <FaArrowRight />
            </button>
          </div>
        </form>
      </div>
      <CSSTransition in={!!image} timeout={600} classNames="loading-fade" unmountOnExit={true}>
        <div className="show-image" onClick={() => showImage(null)}>
          <div className="image" onClick={() => showImage(state => state)}>
            <img src={image} alt=""/>
          </div>
        </div>
      </CSSTransition>
    </div>
  );
};

export default Chat;
