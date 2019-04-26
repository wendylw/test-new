import React from 'react';
import MainTop from './components/MainTop';
import MainBody from './components/MainBody';
import MainMenu from './components/MainMenu';

class Main extends React.Component {
  render() {
    return (
      <div>
        <MainTop />
        <MainBody />
        <MainMenu />
      </div>
    );
  }
}

export default Main;
