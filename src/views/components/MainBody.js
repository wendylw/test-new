import { compose, graphql } from "react-apollo";
import { withRouter } from 'react-router-dom';
import MainBodyComponent from "./MainBodyComponent";
import apiGql from "../../apiGql";
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
  withRouter,
)(MainBodyComponent);
