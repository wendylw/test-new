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

const Error = props => {
  const { t, dataAttributes } = props;
  const { title, description, children } = props || {};
  const error = {
    title,
    description,
  };

  if (!title && !description) {
    error.title = `${t('Eep')}!`;
    error.description = t('ErrorPageDescription');
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <section className="error flex flex-column" {...dataAttributes}>
      <div className="error__container">
        <figure className="error__image-container margin-top-bottom-normal text-center">
          <img src={beepErrorImage} alt="Error found" />
        </figure>
        <div className="error__content padding-small margin-top-bottom-small">
          {title ? <h2 className="error__title text-center text-size-large">{title}</h2> : null}
          {description ? (
            <div className="error__description margin-top-bottom-small text-center">
              <div className="text-size-big text-line-height-base">{description}</div>
            </div>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
};

Error.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  // eslint-disable-next-line react/forbid-prop-types
  dataAttributes: PropTypes.object,
};

Error.defaultProps = {
  title: '',
  description: '',
  dataAttributes: {},
};

Error.displayName = 'Error';

export default withDataAttributes(withTranslation()(Error));
