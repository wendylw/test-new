import React, { Component } from 'react';
import beepLoginImage from '../../../../../ordering/containers/Login/images/login.svg';
import { postAppMessage } from '../../../utils';
import './RequestLogin.scss';

class RequestLogin extends Component {
  handleClick = () => {
    const { user } = this.props;
    postAppMessage(user);
  };

  render() {
    return (
      <section className="request-login flex flex-column flex-center">
        <section className="page-login__content text-center">
          <figure className="page-login__image-container">
            <img src={beepLoginImage} alt="otp" />
          </figure>
        </section>

        <p className="text-center text-size-big font-weight-bold padding-top-bottom-small">
          Login here to claim your cashback
        </p>
        <button onClick={this.handleClick} className="login-button login-button__fill">
          LOGIN
        </button>
      </section>
    );
  }
}

export default RequestLogin;
