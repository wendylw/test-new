import ClearAllComponent from "./ClearAllComponent";
import { compose, graphql } from 'react-apollo';
import apiGql from "../../apiGql";

// TODO: add emptyShoppingCart API mutation here
export default compose(
  graphql(apiGql.EMPTY_SHOPPING_CART, {
    name: 'emptyShoppingCart',
    options: {
      refetchQueries: [ 'ShoppingCart' ],
    },
  })
)(ClearAllComponent);
