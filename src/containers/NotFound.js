import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Constants from '../utils/constants';

import '../Common.scss';
import '../App.scss';
export class NotFound extends Component {
  render() {
    const { title, message } = this.props;

    return (
      <main className="table-ordering">
        <section className="table-ordering__prompt-page">
          <figure className="prompt-page__image-container text-center">
            <img src="/img/beep-error.png" alt="error found" />
          </figure>
          <div className="prompt-page__content">
            <h2 className="prompt-page__title text-center">Store Not Found!</h2>
            <div className="prompt-page__paragraphs text-center">
              <p>This store does not exist, please check your store name and try again.</p>
            </div>
          </div>

          <div className="prompt-page__button-container">
            <Link
              className="button link__block link__non-underline button__fill font-weight-bold text-center text-uppercase border-radius-base"
              to={Constants.ROUTER_PATHS.STORES_HOME}
            >
              Back to home
            </Link>
          </div>
        </section>
      </main>
    );
  }
}

export default NotFound;
