import { compose, graphql } from "react-apollo";
import apiGql from "../../apiGql";
import withSession from "../../libs/withSession";
import withConfig from "../../libs/withConfig";
import withShoppingCart from "../../libs/withShoppingCart";
import withProductDetail from "../../libs/withProductDetail";
import ProductDetailsComponent from "./ProductDetailsComponent";

export default compose(
  withConfig(),
  withSession,
  withProductDetail({
    props: ({ gqlProductDetail: { loading, product } }) => ({
      loading,
      product,
    }),
  }),
  withShoppingCart({
    props: ({ gqlShoppingCart: { loading, shoppingCart } }) => ({
      loading,
      shoppingCart,
    }),
  }),
  graphql(apiGql.ADD_OR_UPDATE_SHOPPING_CART_ITEM, {
    name: 'addOrUpdateShoppingCartItem',
    options: {
      refetchQueries: [ 'ShoppingCart' ],
    },
  }),
)(ProductDetailsComponent);
