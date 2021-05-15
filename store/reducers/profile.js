// action types

const SET_PROFILE = "SET_PROFILE";

// action creators

export const setProfile = (profile) => {
  return {
    type: SET_PROFILE,
    profile,
  };
};

// reducer

const initialState = null;

function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_PROFILE:
      return action.profile;
    default:
      return state;
  }
}

export default reducer;
