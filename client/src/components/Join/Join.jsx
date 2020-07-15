import React, { useState, useEffect } from 'react';
import { FaSignInAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { setWhatsNews } from '@/actions/whatsNew';
import './Join.scss';
import Swal from 'sweetalert2';
import { useHistory } from 'react-router-dom';
import Linkify from 'react-linkify';
import timeElapsed from '@/methods/timeElapsed';
import validators from '@/validators/validateUser';
import LoadingGif from '@/assets/loading.gif';

const Join = () => {
  const [formData, setFormData] = useState({
    name: '',
    room: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    room: ''
  });
  const history = useHistory();
  const whatsNew = useSelector(state => state.whatsNew);
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;

    document.title = "Comh";

    const previousRoom = localStorage.getItem('room');
    const previousName = localStorage.getItem('name');

    if (previousRoom && previousName) {
      setFormData({ name: previousName, room: previousRoom });
    }

    if (!whatsNew) {
      fetch(`${window.API_URL}/whatsnew`, { method: 'get' })
        .then(res => res.json())
        .then(body => {
          if (mounted) {
            if (body && body.whatsnew) dispatch(setWhatsNews(body.whatsnew));
          }
        });
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
      history.push(`/chat?name=${formData.name}&room=${formData.room}`);
    } else {
      Swal.fire('Error', 'Invalid form.', 'error');
    }
  };

  return (
    <div className="Join">
      <form onSubmit={handleSubmit} autoComplete="off">
        <input type="text" name="name" placeholder="Name" invalid={!!formErrors.name} value={formData.name} onChange={handleChange} onBlur={handleBlur} />
        {formErrors.name !== '' && <div className="validation-error">{formErrors.name}</div>}
        <input type="text" name="room" placeholder="Room" invalid={!!formErrors.room} value={formData.room} onChange={handleChange} onBlur={handleBlur} />
        {formErrors.room !== '' && <div className="validation-error">{formErrors.room}</div>}
        <button type="submit">
          <FaSignInAlt />
          <span>join</span>
        </button>
      </form>
      <div data-is-loading={!whatsNew} className="whats-new">
        <div className="header">Whats New</div>
        {whatsNew
          ? whatsNew.length
            ? whatsNew.map(w => <div className="description" key={w._id}>
              <div className="time-elapsed">added {timeElapsed(w.createdAt)} ago</div>
              <div className="description-content"><Linkify>{w.description}</Linkify></div>
            </div>)
            : <div className="nothing-new">
              <div>No new updates in the last week</div>
            </div>
          : <img src={LoadingGif} alt="" className="Loading" />
        }
      </div>
    </div>
  );
};

export default Join;
