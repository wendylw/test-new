import React from 'react';
import MainTop from './components/MainTop';
import MainBody from './components/MainBody';
import MainMenu from './components/MainMenu';
import CartItems from './components/CartItems';
import PayButton from './components/PayButton';
import ProductDetails from './components/ProductDetails';

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

        <hr />
        <hr />
        <h3>ProductDetails</h3>
        <ProductDetails productId="5b44788bbb36740d5975086b" />
      </div>
    );
  }
}

export default Main;
