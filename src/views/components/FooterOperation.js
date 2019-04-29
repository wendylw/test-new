import { compose, graphql } from "react-apollo";
import withOnlineCategoryMergedCart from "../../libs/withOnlineCategoryMergedShoppingCart";
import FooterOperationComponent from "./FooterOperationComponent";
import apiGql from "../../apiGql";

export default compose(
  withOnlineCategoryMergedCart,
  graphql(apiGql.TOGGLE_MENU, { name: 'toggleMenu' })
)(FooterOperationComponent);
