import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import beepErrorImage from '../images/beep-error.png';

export class ErrorPage extends PureComponent {
  render() {
    return (
      <main className="table-ordering">
        <section className="table-ordering__prompt-page flex flex-column flex-space-between">
          <div className="prompt-page__content">
            <figure className="prompt-page__image-container text-center">
              <img src={beepErrorImage} alt="error found" />
            </figure>
            <h2 className="prompt-page__title text-center">Payment gateway temporarily unavailable</h2>
            <div className="prompt-page__paragraphs text-center">
              <p>We're sorry for the inconvenience caused.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

ErrorPage.propTypes = {
  error: PropTypes.object,
};

ErrorPage.defaultProps = {
  error: {},
};

export default withTranslation()(ErrorPage);
