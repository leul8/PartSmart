const initialState = {
  search: [],
  hasSearched: false,
};

export const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SEARCH':
      return {
        ...state,
        search: action.payload,
      };
    case 'HAS_SEARCHED':
      return {
        ...state,
        hasSearched: action.payload,
      };
    default:
      return state;
  }
};
