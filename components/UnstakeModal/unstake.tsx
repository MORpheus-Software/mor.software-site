import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import NumericalInput from '../numericalInput';
import { formatTokenAmount, formatUnits } from '@/utils/format';
import { BaseError, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { STAKING_ADDRESS } from '@/constants/address';
import { abi } from '@/constants/abi';
import CachedService from '@/classess/cachedservice';
import {
  ApprovalToast,
  ErrorToast,
  StakeSuccessToast,
  TxProgressToast,
  UnstakeSuccessToast,
} from '../toasts';
import { store } from '@/Store';
import { incrementSuccessTxCount } from '@/Store/Reducers/session';
import { toast } from 'react-toastify';

interface UnstakeModalProps {
  isOpen: boolean;
  available: number;
  onRequestClose: () => void;
  onUnstake: (amount: number) => void;
}

const UnstakeModal: React.FC<UnstakeModalProps> = ({
  isOpen,
  available,
  onRequestClose,
  onUnstake,
}) => {
  const [amount, setAmount] = useState<string>('');
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const isFormInvalid = BigInt(Number(amount) * 1e18) > available || Number(amount) <= 0;

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
        <UnstakeSuccessToast
          amount={formatTokenAmount(Number(amount))}
          txId={hash as `0x${string}`}
        />,
      );
      store.dispatch(incrementSuccessTxCount());
      setAmount('');
      onRequestClose;
    } else if (isConfirming) {
      CachedService.TxProgressToast(<TxProgressToast />);
    }
  }, [error, isConfirmed, isConfirming]);

  async function submit() {
    const poolId = BigInt(1); // Convert to BigInt

    writeContract({
      address: STAKING_ADDRESS,
      abi,
      functionName: 'withdraw',
      args: [poolId, BigInt(Number(amount) * 1e18)],
    });
  }

  //   const handleUnstake = () => {
  //     if (amount > 0) {
  //       onUnstake(amount);
  //       onRequestClose();
  //     } else {
  //       alert("Please enter a valid amount to unstake.");
  //     }
  //   };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Unstake Modal"
      ariaHideApp={false}
      className="modal"
      overlayClassName="overlay"
    >
      <div style={overlayStyle} onClick={onRequestClose}>
        <div style={modalStyle} className="drop-shadow-lg" onClick={(e) => e.stopPropagation()}>
          <h2> Unstake stEth Tokens</h2>
          <div
            className="modal-box bg-base-content max-w-lg rounded"
            style={{ overflowY: 'unset' }}
          >
            <div className="flex flex-col justify-end gap-4">
              <div className="relative w-full">
                <NumericalInput
                  className="mb-0 w-full rounded bg-morBg px-4 py-4 pr-20 text-2xl text-white placeholder-gray-500"
                  value={amount}
                  onUserInput={setAmount}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 transform text-xs text-gray-500">
                  <span>Available to unstake: {formatUnits(available).toFixed(2)}</span>
                </div>
              </div>
              <div>
                <div className="mb-0" onClick={submit}>
                  <button
                    className="w-full"
                    disabled={isPending || isFormInvalid || isConfirming}
                    type="submit"
                  >
                    {isPending || isConfirming
                      ? 'Confirming...'
                      : isFormInvalid
                        ? 'Enter Token Amount'
                        : `Unstake ${amount} stEth`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  backdropFilter: 'blur(0.1px)',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#0d1f16',
  color: '#fff',
  border: '1px solid #ffffff1f',
  padding: '20px',
  borderRadius: '5px',
  width: '500px',
  zIndex: '100',
  maxWidth: '100%',
};
export default UnstakeModal;
