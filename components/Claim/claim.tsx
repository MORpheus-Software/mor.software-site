'use client';
import { STAKING_ADDRESS, STAKING_TOKEN_ADDRESS } from '@/constants/address';
import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
  useAccount,
} from 'wagmi';
import { abi, token_abi } from '@/constants/abi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { store } from '@/Store';
import CachedService from '@/classess/cachedservice';
import {
  ApprovalToast,
  ClaimSuccessToast,
  ErrorToast,
  StakeSuccessToast,
  TxProgressToast,
} from '../toasts';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { incrementSuccessTxCount, setLockDuration, setTokenAmount } from '@/Store/Reducers/session';
import { formatTokenAmount } from '@/utils/format';
import { parseEther, parseGwei } from 'viem';

interface ClaimProps {
  tokenAmount: any;
}

export function Claim({ tokenAmount }: ClaimProps) {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { address: accountAddress } = useAccount();

  const { open, close } = useWeb3Modal();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (error) {
      CachedService.errorToast(
        <ErrorToast message={(error as BaseError).shortMessage || error.message} />,
      );
    } else if (isConfirmed) {
      toast.dismiss();
      CachedService.successToast(
        <ClaimSuccessToast
          amount={formatTokenAmount(Number(tokenAmount))}
          txId={hash as `0x${string}`}
        />,
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
      abi: abi,
      functionName: 'claim',
      args: [poolId, accountAddress as `0x${string}`],
      value: parseEther('0.01'),
    });
  }

  return (
    <div>
      {!accountAddress ? (
        <p className="w-full" onClick={() => open()}>
          Connect Wallet
        </p>
      ) : (
        <div className="mb-0 cursor-pointer underline" onClick={submit}>
          <p className="w-full">{isPending || isConfirming ? 'Claiming...' : `Claim Now`}</p>
        </div>
      )}
    </div>
  );
}
