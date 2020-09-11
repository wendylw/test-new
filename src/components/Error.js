import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import beepErrorImage from '../images/beep-error.png';
import withDataAttributes from './withDataAttributes';
import './Error.scss';

/**
 * `<Error />` is used on the beepit.com and ordering.
 *
 * A warn for page has some network errors and other issue.
 */

class Error extends React.Component {
  render() {
    const { t, dataAttributes } = this.props;
    const { title, description, children } = this.props || {};
    const error = {
      title,
      description,
    };

    if (!title && !description) {
      error.title = `${t('Eep')}!`;
      error.description = t('ErrorPageDescription');
    }

    return (
      <section className="error flex flex-column" {...dataAttributes}>
        <div className="error__container">
          <figure className="error__image-container margin-normal text-center">
            <img src={beepErrorImage} alt="Error found" />
          </figure>
          <div className="error__content padding-small margin-top-bottom-small">
            {title ? <h2 className="error__title text-center text-size-large">{title}</h2> : null}
            {description ? (
              <div className="error__description margin-small text-center">
                <p className="text-size-big text-line-height-base">{description}</p>
              </div>
            ) : null}
          </div>
        </div>
        {children}
      </section>
    );
  }
}

Error.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

Error.defaultProps = {
  title: '',
  description: '',
};

export default withDataAttributes(withTranslation()(Error));
