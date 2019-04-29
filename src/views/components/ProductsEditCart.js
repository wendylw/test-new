import { compose } from 'react-apollo';
import ProductsEditCartComponent from './ProductsEditCartComponent';
import withShoppingCart from '../../libs/withShoppingCart';


export default compose(
  withShoppingCart({
    props: ({ gqlShoppingCart: { loading, shoppingCart } }) => {
      if (loading) {
        return null;
      }

      return { shoppingCart };
    }
  }),
)(ProductsEditCartComponent);
