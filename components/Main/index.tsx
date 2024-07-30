"use client";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { fetchBalance } from "@/utils/fetchers";
import { STAKING_ADDRESS, STAKING_TOKEN_ADDRESS } from "@/constants/address";
import { abi } from "@/constants/abi";
import {
  setClaimableAmount,
  setStEthmBalance,
  setUserStakingInfo,
} from "@/Store/Reducers/session";
import { store, useSelector } from "@/Store/index";
import { UserInfoType, ProgramUserInfo } from "@/Store/Reducers/session";
import LockStakeComponent from "../UI";
import { multicall } from "wagmi/actions";
import { config } from "@/utils/config";

export function Main() {
  const { userStakingInfo, stethmBalance, successTxCount, claimableAmount } =
    useSelector((state) => state.session);

  const account = useAccount();

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (account?.address) {
        try {
          await fetchBalance(account?.address, STAKING_TOKEN_ADDRESS);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      } else {
        store.dispatch(setStEthmBalance("0"));
      }
    };

    fetchUserBalance();
  }, [account?.address, successTxCount]);

  useEffect(() => {
    const fetchData = async () => {
      if (account?.address) {
        try {
          const contractResult = await multicall(config, {
            contracts: [
              {
                abi,
                functionName: "usersData",
                address: STAKING_ADDRESS,
                args: [account.address as `0x${string}`, BigInt(0)],
              },
              {
                abi,
                functionName: "getCurrentUserReward",
                address: STAKING_ADDRESS,
                args: [BigInt(0), account.address as `0x${string}`],
              },
            ],
          });

          if (contractResult[0].result) {
            const [
              lastStake,
              deposited,
              rate,
              pendingRewards,
              claimLockStart,
              claimLockEnd,
              virtualDeposited,
            ] = contractResult[0].result;

            const programUserInfo: ProgramUserInfo = {
              lastStake: lastStake.toString(),
              deposited: deposited.toString(),
              rate: rate.toString(),
              pendingRewards: pendingRewards.toString(),
              claimLockStart: claimLockStart.toString(),
              claimLockEnd: claimLockEnd.toString(),
              virtualDeposited: virtualDeposited.toString(),
            };

            const userInfo: UserInfoType = {
              user: account?.address,
              pools: [programUserInfo],
            };

            store.dispatch(setUserStakingInfo(userInfo));
          } else {
            store.dispatch(setUserStakingInfo(emptyUserInfo()));
          }
          if (contractResult[1].result) {
            const claimable = contractResult[1].result;

            store.dispatch(setClaimableAmount(claimable.toString()));
          } else {
            store.dispatch(setClaimableAmount(""));
          }
        } catch (error) {
          console.error("Error fetching contract data:", error);
          store.dispatch(setUserStakingInfo(emptyUserInfo()));
        }
      } else {
        store.dispatch(setUserStakingInfo(emptyUserInfo()));
      }
    };

    // Fetch data immediately on mount
    fetchData();

    const intervalId = setInterval(fetchData, 1500);

    return () => clearInterval(intervalId);
  }, [account?.address, successTxCount]);

  const emptyUserInfo = (): UserInfoType => ({
    user: "",
    pools: [
      {
        lastStake: "",
        deposited: "",
        rate: "",
        pendingRewards: "",
        claimLockStart: "",
        claimLockEnd: "",
        virtualDeposited: "",
      },
    ],
  });

  return (
    <LockStakeComponent
      userStakingInfo={userStakingInfo.pools[0]}
      stethmBalance={stethmBalance}
      claimable={claimableAmount}
    />
  );
}
