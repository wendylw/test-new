import { compose, graphql } from "react-apollo";
import MainBodyComponent from "./MainBodyComponent";
import apiGql from "../../apiGql";
import withOnlineCategoryMergedCart from "../../libs/withOnlineCategoryMergedShoppingCart";

export default compose(
  withOnlineCategoryMergedCart,
  graphql(apiGql.ADD_OR_UPDATE_SHOPPING_CART_ITEM, {
    name: 'addOrUpdateShoppingCartItem',
    options: {
      refetchQueries: [ 'ShoppingCart' ],
    },
  }),
)(MainBodyComponent);
