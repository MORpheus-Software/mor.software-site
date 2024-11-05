import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoadingsReducer } from './session';

const initialState: LoadingsReducer = {
  isUserStakingInfoLoading: false,
  isTxInProgress: false,
};

const loadings = createSlice({
  name: 'loadings',
  initialState,
  reducers: {
    setIsUserStakingInfoLoading(state, action: PayloadAction<boolean>) {
      state.isUserStakingInfoLoading = action.payload;
    },
    setIsTxInProgress(state, action: PayloadAction<boolean>) {
      state.isTxInProgress = action.payload;
    },
  },
});

export default loadings.reducer;

export const { setIsUserStakingInfoLoading, setIsTxInProgress } = loadings.actions;
