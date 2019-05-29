import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { clearMessage } from '../../actions';

class Message extends React.Component {
  timer = null;

  clear() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.props.clearMessage();
      clearTimeout(this.timer);
    }, 5000);
  }

  componentDidMount() {
    this.clear();
  }

  componentDidUpdate() {
    this.clear();
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.message !== this.props.message) {
      return true;
    }

    return false;
  }

  render() {
    const { message = '', show = false } = this.props;

    if (!show) {
      return null;
    }

    return (
      <div className="top-message primary">
        <span className="top-message__text">{message}</span>
      </div>
    );
  }
}

const mapStateToProps = state => {
  try {
    return {
      message: state.message.message,
      show: state.message.show,
    };
  } catch(e) {
    return {};
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({ clearMessage }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Message);
