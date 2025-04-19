export const cartReducer = (state = { cartItems: [], isDrawerOpen: false }, action) => {
  switch (action.type) {
    case "ADD_CART":
      const item = action.payload;
      const existItem = state.cartItems.find(x => x.id === item.id);
      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(x =>
            x.id === existItem.id ? { ...x, qty: x.qty + item.qty } : x
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
        };
      }

    case "REMOVE_CART":
      return {
        cartItems: state.cartItems.filter(x => x.id !== action.payload),
      };

    case "CLEAR_CART":
      return {
        ...state,
        cartItems: [],
      };

    case "DRAWER":
      return {
        ...state,
        isDrawerOpen: action.payload,
      };

    default:
      return state;
  }
};
