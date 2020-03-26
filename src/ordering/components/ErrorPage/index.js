import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Constants from '../../utils/constants';

import { connect } from 'react-redux';
import { getError } from '../../redux/modules/entities/error';

import '../Common.scss';
import '../App.scss';

export class NotFound extends Component {
  getCurrentErrorType(type) {
    const Errors = {
      StoreNotFound: {
        title: 'Store Not Found',
        description: 'This store does not exist, please check your store name and try again.',
      },
      DisabledBeepOrdering: {
        title: 'Sorry',
        description: 'Oops, seems like this store no longer supports QR Ordering.',
      },
    };

    return Errors[type] || {};
  }

  render() {
    const { error } = this.props;
    const { message } = error || {};
    const { title, description } = this.getCurrentErrorType(message) || {};

    return (
      <main className="table-ordering">
        <section className="table-ordering__prompt-page">
          <figure className="prompt-page__image-container text-center">
            <img src="/img/beep-error.png" alt="error found" />
          </figure>
          <div className="prompt-page__content">
            <h2 className="prompt-page__title text-center">{title}</h2>
            <div className="prompt-page__paragraphs text-center">
              <p>{description}</p>
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

export default connect(
  state => ({
    error: getError(state),
  }),
  dispatch => ({})
)(NotFound);
