import React from 'react';
import MainTop from './components/MainTop';
import MainBody from './components/MainBody';
import MainMenu from './components/MainMenu';
import CartItems from './components/CartItems';
import PayButton from './components/PayButton';

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

        <hr />
        <hr />
        <h3>PayButton</h3>
        <PayButton />
      </div>
    );
  }
}

export default Main;
