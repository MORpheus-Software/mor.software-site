import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type LoadingsReducer = {
  isUserStakingInfoLoading: boolean;
  isTxInProgress: boolean;
};

// Type for staking information in each pool
export type ProgramUserInfo = {
  lastStake: string;
  deposited: string;
  rate: string;
  pendingRewards: string;
  claimLockStart: string;
  claimLockEnd: string;
  virtualDeposited: string;
};

// Type for user staking information across all pools
export type UserStakingInfo = {
  pools: ProgramUserInfo[];
};

export type globalData = {};

// Type for session state
export type SessionState = {
  tokenAmount: string;
  lockDuration: string;
  claimableAmount: string;
  stethmBalance: string;
  successTxCount: number;
  userStakingInfo: UserStakingInfo;
};

// Type for user information
export type UserInfoType = {
  user: string;
  pools: ProgramUserInfo[];
};

// Initial staking information for a single pool
const initialProgramUserInfo: ProgramUserInfo = {
  lastStake: "",
  deposited: "",
  rate: "",
  pendingRewards: "",
  claimLockStart: "",
  claimLockEnd: "",
  virtualDeposited: "",
};

// Initial session state
const initialState: SessionState = {
  stethmBalance: "",
  tokenAmount: "",
  lockDuration: "",
  claimableAmount: "",
  successTxCount: 0,
  userStakingInfo: {
    pools: [initialProgramUserInfo],
  },
};

// Create a slice for session state management
const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    // Reducer to set stETH balance
    setStEthmBalance(state, action: PayloadAction<string>) {
      state.stethmBalance = action.payload;
    },

    // Reducer to set user staking information
    setUserStakingInfo(state, action: PayloadAction<UserStakingInfo>) {
      state.userStakingInfo = action.payload;
    },

    setTokenAmount(state, action: PayloadAction<string>) {
      state.tokenAmount = action.payload;
    },

    setClaimableAmount(state, action: PayloadAction<string>) {
      state.claimableAmount = action.payload;
    },

    setLockDuration(state, action: PayloadAction<string>) {
      state.lockDuration = action.payload;
    },

    incrementSuccessTxCount(state) {
      state.successTxCount = state.successTxCount + 1;
    },
    // Reducer to set user
    // setUser(state, action: PayloadAction<string>) {
    //   state.user = action.payload;
    // },

    // // Reducer to set user information
    // setUserInfo(state, action: PayloadAction<UserInfoType>) {
    //   state.user = action.payload.user;
    //   state.userStakingInfo.pools = action.payload.pools;
    // },
  },
});

// Export the reducer
export default sessionSlice.reducer;

// Export actions
export const {
  setStEthmBalance,
  setUserStakingInfo,
  setTokenAmount,
  setClaimableAmount,
  setLockDuration,
  // setUser,
  // setUserInfo,
  incrementSuccessTxCount,
} = sessionSlice.actions;
