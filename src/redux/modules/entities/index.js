import { combineReducers } from "redux";
import carts from "./carts";
import categories from "./categories";
import loyaltyHistories from "./loyaltyHistories";
import onlineStores from "./onlineStores";
import orders from "./orders";
import products from "./products";
import stores from "./stores";
import businesses from "./businesses";

const rootReducer = combineReducers({
  carts,
  categories,
  loyaltyHistories,
  onlineStores,
  orders,
  products,
  stores,
  businesses,
});

export default rootReducer;
