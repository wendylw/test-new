import { compose, graphql } from "react-apollo";
import apiGql from "../../apiGql";
import CartItemsComponent from "./CartItemsComponent";
import withOnlineCategoryMergedCart from "../../libs/withOnlineCategoryMergedShoppingCart";

export default compose(
  withOnlineCategoryMergedCart,
  graphql(apiGql.REMOVE_SHOPPING_CART_ITEM, {
    name: 'removeShoppingCartItem',
    options: {
      refetchQueries: [ 'ShoppingCart' ],
    }
  }),
  graphql(apiGql.ADD_OR_UPDATE_SHOPPING_CART_ITEM, {
    name: 'addOrUpdateShoppingCartItem',
    options: {
      refetchQueries: [ 'ShoppingCart' ],
    },
  }),
)(CartItemsComponent);
