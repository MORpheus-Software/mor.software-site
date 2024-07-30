"use client";
import { STAKING_ADDRESS, STAKING_TOKEN_ADDRESS } from "@/constants/address";
import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
  useAccount,
  useBlockNumber,
} from "wagmi";
import { abi, token_abi } from "@/constants/abi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { store } from "@/Store";
import CachedService from "@/classess/cachedservice";
import {
  ApprovalToast,
  ErrorFormtoast,
  ErrorToast,
  StakeFormSucess,
  StakeSuccessToast,
  TxProgressToast,
} from "../toasts";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  incrementSuccessTxCount,
  setLockDuration,
  setTokenAmount,
} from "@/Store/Reducers/session";
import { useSession } from "next-auth/react";

import { formatTokenAmount } from "@/utils/format";
import { conciseAddress } from "@/utils/trunc";
import { signMessage } from "@wagmi/core";
import { config } from "@/config";

interface StakeProps {
  tokenAmount: any;
  lockDuration: any;
}

export function StakeLock({ tokenAmount, lockDuration }: StakeProps) {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { address: accountAddress } = useAccount();
  const { data: session } = useSession();

  const result = useBlockNumber();

  // Create a Date object from the timestamp and remove milliseconds
  const date = new Date(result.dataUpdatedAt);
  date.setMilliseconds(0);

  // Add 365 days to the date
  const daysToAdd = parseInt(lockDuration, 10);
  date.setDate(date.getDate() + daysToAdd);

  // Convert the updated date back to a timestamp (milliseconds)
  const updatedTimestamp = date.getTime() / 1000;

  const { open, close } = useWeb3Modal();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (error) {
      CachedService.errorToast(
        <ErrorToast
          message={(error as BaseError).shortMessage || error.message}
        />
      );
    } else if (isConfirmed) {
      toast.dismiss();
      CachedService.successToast(
        <StakeSuccessToast
          lockDuration={lockDuration}
          amount={Number(formatTokenAmount(tokenAmount))}
          txId={hash as `0x${string}`}
        />
      );
      store.dispatch(incrementSuccessTxCount());
    } else if (isConfirming) {
      toast.dismiss();
      CachedService.TxProgressToast(<TxProgressToast />);
    }
  }, [error, isConfirmed, isConfirming]);

  async function submit() {
    const poolId = BigInt(1); // Convert to BigInt

    writeContract({
      address: STAKING_ADDRESS,
      abi,
      functionName: "lockClaim",
      args: [poolId, BigInt(updatedTimestamp)],
    });
  }

  const handleSubmitWeb2 = async (event: any) => {
    event.preventDefault();

    if (!accountAddress) {
      alert("Please connect your wallet.");
      return;
    }

    const message = `I'm staking for ${lockDuration} days with address ${accountAddress}`;
    const signature = await signMessage(config, {
      message,
      account: accountAddress,
    });

    // Send the message and signature to your backend for verification
    const response = await fetch("/api/stake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        duration: Number(lockDuration),
        address: accountAddress,
        userId: session?.user?.id,
        message,
        signature,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      CachedService.successToast(<StakeFormSucess />);
    } else {
      CachedService.errorToast(
        <ErrorFormtoast message={data.error} address={accountAddress} />
      );
    }
  };

  const isFormInvalid = lockDuration <= 0;

  return (
    <div>
      {!accountAddress ? (
        <button className="w-full" onClick={() => open()}>
          Connect Wallet
        </button>
      ) : (
        <div className="mb-0" onClick={handleSubmitWeb2}>
          <button
            className="w-full"
            disabled={
              isPending || isFormInvalid || isConfirming || !session?.user?.name
            }
            type="submit"
          >
            {isPending || isConfirming
              ? "Confirming..."
              : !session?.user?.name
              ? "Login via GitHub to Stake"
              : isFormInvalid
              ? "Enter Lock Duration"
              : `Stake Weights associated with ${conciseAddress(
                  accountAddress
                )} for ${lockDuration} days`}
          </button>
        </div>
      )}
    </div>
  );
}
