import { combineReducers } from "redux";
import entities from "../../../redux/modules/entities";
import app from "./app";
import home from "./home";
import cart from "./cart";
import payment from "./payment";
import thankYou from "./thankYou";

const rootReducer = combineReducers({
  entities,
  app,
  home,
  cart,
  payment,
  thankYou,
});

export default rootReducer;
