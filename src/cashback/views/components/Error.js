import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


class Error extends React.Component {
  render() {
    const {
      message = '',
    } = this.props.pageMessage || {};

    return (
      <main className="table-ordering">
        <section className="table-ordering__prompt-page">
          <figure className="prompt-page__image-container text-center">
            <img src="/img/beep-error.png" alt="error found" />
          </figure>
          <div className="prompt-page__content">
            <h2 className="prompt-page__title text-center">Eep!</h2>
            <div className="prompt-page__paragraphs">
              <p>{message}</p>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

const mapStateToProps = state => {
  try {
    return {
      pageMessage: state.pageMessage.message,
    };
  } catch(e) {
    return {};
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Error);
