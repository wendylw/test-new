import { compose, graphql } from "react-apollo";
import MainMenuComponent from "./MainMenuComponent";
import withOnlineCategoryMergedCart from "../../libs/withOnlineCategoryMergedShoppingCart";
import apiGql from "../../apiGql";

export default compose(
  withOnlineCategoryMergedCart,
  graphql(apiGql.TOGGLE_MENU, { name: 'toggleMenu' })
)(MainMenuComponent);
