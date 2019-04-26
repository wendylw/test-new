import { compose } from "react-apollo";
import MainMenuComponent from "./MainMenuComponent";
import withProductsMergedCart from '../../libs/withProductsMergedCart';

export default compose(
  withProductsMergedCart,
)(MainMenuComponent);
