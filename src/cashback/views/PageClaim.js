import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Message from './components/Message';
import { sendMessage } from '../actions';
import HomeBody from './components/HomeBody';
import PhoneView from './components/PhoneView';
import theImage from '../images/cash-back-bg-temp.png';


class PageClaim extends React.Component {
  state = {  }

  render() {
    return (
      <main className="cash-back flex-column" style={{
        backgroundImage: `url(${theImage})`,
      }}>
        <Message />
        <HomeBody />
        <PhoneView />
      </main>
    );
  }
}

const mapStateToProps = () => ({ });
const mapDispatchToProps = dispatch => bindActionCreators({
  sendMessage, // TODO: remove it, this is just for development.
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PageClaim);
