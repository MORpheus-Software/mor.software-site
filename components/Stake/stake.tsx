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
import { ApprovalToast, ErrorToast, StakeSuccessToast, TxProgressToast } from '../toasts';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { incrementSuccessTxCount, setLockDuration, setTokenAmount } from '@/Store/Reducers/session';
import { formatTokenAmount } from '@/utils/format';

interface StakeProps {
  tokenAmount: any;
  lockDuration: any;
}

export function Stake({ tokenAmount, lockDuration }: StakeProps) {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { address: accountAddress } = useAccount();
  const [approval, setApprovalState] = useState(false);

  const stakeAmount = BigInt(tokenAmount * 1e18); // Set the stake amount
  const lockTime = BigInt(lockDuration); // Convert to BigInt

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
      if (!approval) {
        store.dispatch(setTokenAmount(''));
        store.dispatch(setLockDuration(''));
      } else {
        setApprovalState(false);
      }
      toast.dismiss();
      CachedService.successToast(
        approval ? (
          <ApprovalToast />
        ) : (
          <StakeSuccessToast
            lockDuration={lockDuration}
            amount={Number(formatTokenAmount(tokenAmount))}
            txId={hash as `0x${string}`}
          />
        ),
      );

      store.dispatch(incrementSuccessTxCount());
    } else if (isConfirming) {
      toast.dismiss();
      CachedService.TxProgressToast(<TxProgressToast />);
    }
  }, [error, isConfirmed, isConfirming]);

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: STAKING_TOKEN_ADDRESS,
    abi: token_abi,
    functionName: 'allowance',
    args: [accountAddress, STAKING_ADDRESS],
  });

  const allowance = allowanceData as bigint | undefined;

  async function submit() {
    const poolId = BigInt(1); // Convert to BigInt

    await refetchAllowance();

    if (allowance !== undefined && allowance < stakeAmount) {
      setApprovalState(true);
      writeContract({
        address: STAKING_TOKEN_ADDRESS,
        abi: token_abi,
        functionName: 'approve',
        args: [STAKING_ADDRESS, stakeAmount],
      });
    } else {
      writeContract({
        address: STAKING_ADDRESS,
        abi,
        functionName: 'stake',
        args: [poolId, stakeAmount, lockTime],
      });
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      refetchAllowance();
    }
  }, [isConfirmed]);

  const isFormInvalid = tokenAmount <= 0;
  // || lockDuration <= 0;

  return (
    <div>
      {!accountAddress ? (
        <button className="w-full" onClick={() => open()}>
          Connect Wallet
        </button>
      ) : (
        <div className="mb-0" onClick={submit}>
          <button
            className="w-full"
            disabled={isPending || isFormInvalid || isConfirming}
            type="submit"
          >
            {isPending || isConfirming
              ? 'Confirming...'
              : isFormInvalid
                ? 'Enter Token Amount and Lock Duration'
                : allowance !== undefined && allowance < stakeAmount
                  ? 'Approve'
                  : `Stake and Lock for ${lockDuration} Days`}
          </button>
        </div>
      )}
    </div>
  );
}
