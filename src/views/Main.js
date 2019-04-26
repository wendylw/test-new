import React from 'react';
import MainTop from './components/MainTop';
import MainBody from './components/MainBody';
import MainMenu from './components/MainMenu';
import CartItems from './components/CartItems';

class Main extends React.Component {
  render() {
    return (
      <div>
        <hr />
        <hr />
        <h3>MainTop</h3>
        <MainTop />

        <hr />
        <hr />
        <h3>MainBody</h3>
        <MainBody />

        <hr />
        <hr />
        <h3>MainMenu</h3>
        <MainMenu />

        <hr />
        <hr />
        <h3>CartItems</h3>
        <CartItems />
      </div>
    );
  }
}

export default Main;
