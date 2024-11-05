import { config } from './config';

import { STAKING_TOKEN_ADDRESS } from '@/constants/address';
import { store } from '@/Store';
import { setStEthmBalance } from '@/Store/Reducers/session';

import { getBalance } from 'wagmi/actions';

export const fetchBalance = async (walletPubKey: any, token: any) => {
  try {
    let balance = BigInt(1);
    balance = (
      await getBalance(config, {
        address: walletPubKey,
        token: STAKING_TOKEN_ADDRESS,
      })
    ).value;

    store.dispatch(setStEthmBalance(balance.toString()));
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
};

// export const fetchBalance = async (walletPubKey, token) => {
//   try {
//     let balance = BigInt(1);

//     setTimeout(async () => {
//       balance = (
//         await getBalance(config, {
//           address: walletPubKey,
//           token: STAKING_TOKEN_ADDRESS,
//         })
//       ).value;

//       store.dispatch(setStEthmBalance(balance.toString()));
//     }, 200); // Wait for 0.5 seconds (500 milliseconds)
//   } catch (error) {
//     console.error("Error fetching balance:", error);
//   }
// };
