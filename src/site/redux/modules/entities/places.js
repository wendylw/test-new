const initialState = {};

/* PlaceInfo Define =>
type PlaceInfo = { // 只有address和coords是肯定有的
  address: string;
  coords: { lat: number; lng: number; }
  placeId?: string;
  addressComponents?: {
    street1: string;
    street2: string;
    city: string;
    state: string;
    country: string;
  };
  displayComponents?: {
    mainText: string;
    secondaryText: string;
  };
  straightLineDistance: number; // 直线距离，单位米，只在 mode 是 'FROM_STORE' 时提供
  directionDistance: number; // 导航距离，单位米，只在 mode 是 'FROM_STORE' 且 needDirectionDistance 为true时提供
}
*/

/* PlaceInfo Example =>
{
  "address": "AAM Hotel, 古邦阁亮哥打巴哈鲁吉兰丹马来西亚",
  "coords": {
    "lat": 6.0975076,
    "lng": 102.2761676
  },
  "placeId": "ChIJE4U3mnSwtjERX2pMHZ9NMDk",
  "displayComponents": {
    "mainText": "AAM Hotel",
    "secondaryText": "古邦阁亮哥打巴哈鲁吉兰丹马来西亚"
  }
}
*/

// @types
const types = {
  SAVE_PLACE: 'entities/places/SAVE_PLACE',
};

// @actions
const actions = {
  savePlace: placeInfo => ({
    type: types.SAVE_PLACE,
    placeInfo,
  }),
};

// @reducer
const reducer = (state = initialState, action) => {
  if (action.placeInfo && action.type === types.SAVE_PLACE) {
    const { placeInfo } = action;
    if (state[placeInfo.placeId]) return state;
    return {
      ...state,
      [placeInfo.placeId]: placeInfo,
    };
  }
  return state;
};

export const placesActionCreators = actions;
export default reducer;

export const getPlaceById = (state, placeId) => state.entities.places[placeId];
