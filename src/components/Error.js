import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import beepErrorImage from '../images/beep-error.png';

class Error extends React.Component {
  render() {
    const { t } = this.props;
    const { title = `${t('Eep')}!`, message = t('ErrorPageDescription') } = this.props.location.state || {};

    return (
      <section className="table-ordering__prompt-page" data-heap-name="cashback.error.container">
        <figure className="prompt-page__image-container text-center">
          <img src={beepErrorImage} alt="Error found" />
        </figure>
        <div className="prompt-page__content">
          <h2 className="prompt-page__title text-center">{title}</h2>
          <div className="prompt-page__paragraphs">
            <p>{message}</p>
          </div>
        </div>
      </section>
    );
  }
}

Error.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
};

Error.defaultProps = {
  message: '',
};

export default withTranslation()(Error);
