import React from 'react';
import PropTypes from 'prop-types';
import beepErrorImage from '../../images/beep-error.png';

class Error extends React.PureComponent {
  render() {
    const { title, description, button } = this.props;

    return (
      <section className="prompt-page">
        <figure className="prompt-page__image-container text-center">
          <img src={beepErrorImage} alt="error found" />
        </figure>
        <div className="prompt-page__content">
          <h2 className="prompt-page__title text-center">{title}</h2>
          <div className="prompt-page__paragraphs text-center">
            <p>{description}</p>
          </div>
        </div>
        {button ? (
          <div className="prompt-page__button-container">
            <button
              className="button button__block font-weight-bolder text-center text-uppercase border-radius-base"
              onClick={button.onClick}
            >
              {button.text}
            </button>
          </div>
        ) : null}
      </section>
    );
  }
}

Error.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  button: PropTypes.shape({
    text: PropTypes.string,
    onClick: PropTypes.func,
  }),
};

Error.defaultProps = {
  title: '',
  description: '',
  button: null,
};

export default Error;
