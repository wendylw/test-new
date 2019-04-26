import { compose } from "react-apollo";
import MainMenuComponent from "./MainMenuComponent";
import withOnlineCategoryMergedCart from "../../libs/withOnlineCategoryMergedShoppingCart";

export default compose(
  withOnlineCategoryMergedCart,
)(MainMenuComponent);
