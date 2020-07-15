import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Chat.scss';
import { FaSignOutAlt, FaArrowRight } from 'react-icons/fa';
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
  const [newText, setNewText] = useState('');
  const history = useHistory();
  const textsElement = useRef(null);
  const query = useMemo(() => queryString.parse(location.search), [location.search]);

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

      if (localStorage.getItem('room') !== query.room && localStorage.getItem('name') !== query.name) {
        localStorage.setItem('room', query.room);
        localStorage.setItem('name', query.name);
      }

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
        }
      });

      socket.on('backup', ({ backup }) => setTexts(texts => texts ? [...backup, ...texts] : backup));
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

  useEffect(() => {
    textsElement.current.scroll({
      top: textsElement.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [texts]);

  const handleSubmit = e => {
    e.preventDefault();
    
    if (newText !== '') {
      socket.emit('sendText', newText);
      setNewText('');
    }
  };

  return (
    <div className="Chat">
      <div className="Chat-content">
        <div className="Chat-header">{query.room}</div>
        <div className="exit-btn">
          <button onClick={() => history.push('/')}>
            <FaSignOutAlt />
            Exit
          </button>
        </div>
        <div className="texts" ref={textsElement}>
          {texts
            ? Object.keys(texts).map(k => 
              <div className="Text fade-enter-active" key={k} is-current-user={query.name === texts[k].sender} is-from-console={!texts[k].sender}>
                <div className="Text-content">
                  {texts[k].sender && (query.name !== texts[k].sender
                    ? <div className="Text-sender">{texts[k].sender}{texts[k].createdAt && <> • {timeElapsed(texts[k].createdAt)} ago</>}</div>
                    : <div className="Text-createdAt">{texts[k].createdAt && <>{timeElapsed(texts[k].createdAt)} ago</>}</div>)
                  }
                  <Linkify>{texts[k].text}</Linkify>
                </div>
              </div>
            )
            : <img src={LoadingGif} alt="" className="Loading" />
          }
        </div>
        <form className="new-text" onSubmit={handleSubmit} autoComplete="off">
          <input type="text" value={newText} onChange={e => setNewText(e.target.value)} />
          <button type="submit">
            <FaArrowRight />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
