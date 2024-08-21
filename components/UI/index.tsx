import React, { useMemo, useState } from 'react';
import { formatTokenAmount, formatUnits } from '@/utils/format';
import { NumericalInput } from '../numericalInput';
import { Stake } from '../Stake/stake';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import Image from 'next/image';
import { useSelector } from '@/Store';
import { setTokenAmount, setLockDuration } from '@/Store/Reducers/session';
import { store } from '@/Store';
import moment from 'moment';
import UnstakeModal from '../UnstakeModal/unstake';
import { Claim } from '../Claim/claim';

interface LockStakeComponentProps {
  userStakingInfo: any; // Adjust type as needed
  stethmBalance: string;
  claimable: string;
}

const LockStakeComponent = ({
  userStakingInfo,
  stethmBalance,
  claimable,
}: LockStakeComponentProps) => {
  const { tokenAmount, lockDuration } = useSelector((state) => state.session);
  const { isTxInProgress } = useSelector((state) => state.loadings);

  const handleTokenAmountChange = (e: any) => {
    store.dispatch(setTokenAmount(e));
  };

  const handleLockDurationChange = (duration: any) => {
    store.dispatch(setLockDuration(duration));
  };

  const parsedBalance = Number(stethmBalance);
  console.log(typeof userStakingInfo.deposited);
  const lockDurations = [
    { label: '1 Month', value: '30' },
    { label: '6 Months', value: '180' },
    { label: '1 Year', value: '365' },
    { label: '2 Years', value: '730' },
    { label: '4 Years', value: '1460' },
  ];
  const lastStake = userStakingInfo.claimLockStart; // Unix timestamp in seconds
  const claimLockEnd = userStakingInfo.claimLockEnd; // Number of days to lock

  const unlockDate = moment.unix(lastStake).add(claimLockEnd, 'days');

  const formattedUnlockDate = unlockDate.isAfter(new Date())
    ? `Unlocks ${unlockDate.fromNow()} (${unlockDate.format('YYYY-MM-DD')})`
    : '';

  const isDisabled = useMemo(
    () => isTxInProgress || (claimLockEnd > 0 && unlockDate.isAfter(new Date())),
    [isTxInProgress, claimLockEnd, unlockDate],
  );

  const isStaked = lastStake > 0;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleUnstake = (amount: number) => {
    console.log(`Unstaking ${amount} tokens`);
    // Add your unstake logic here
  };

  return (
    <>
      <style jsx>{`
        .input-container {
          height: 60px; /* Set a fixed height */
        }
        .input-element {
          height: 100%; /* Make the input fill the container's height */
        }
      `}</style>

      <UnstakeModal
        available={userStakingInfo.deposited}
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        onUnstake={handleUnstake}
      />

      <div className="col-span-12 mx-auto max-w-6xl rounded-2xl border border-borderTr bg-morBg p-4 shadow sm:p-6 md:col-span-9">
        <div className="flex flex-col-reverse text-base text-gray-200 lg:grid lg:grid-cols-5 lg:space-x-4">
          <div className="col-span-3 flex h-full flex-col">
            {/* <div className="p-2">Lock MORPHEUS tokens</div> */}
            <div className="flex h-full flex-col space-y-4">
              <div className="w-full flex-grow rounded bg-morCard p-5">
                <div className="flex flex-col justify-between space-y-3 sm:flex-row sm:space-y-0"></div>
                <div className="flex flex-col justify-between space-y-3 sm:flex-row sm:space-y-0">
                  <div className="flex w-full flex-col gap-8">
                    <div className="sm:gap:0 flex flex-col gap-4 sm:flex-row">
                      <div className="flex min-w-[14rem]">
                        <div className="flex items-center">
                          <Image
                            alt="stEth"
                            fetchPriority="high"
                            width="45"
                            height="45"
                            decoding="async"
                            src="/stEth.svg"
                          />
                        </div>
                        <div className="mx-3.5 flex flex-1 flex-col items-start justify-center">
                          <div className="token-symbol-container text-sm font-bold md:text-2xl">
                            stEth
                          </div>
                          <div className="text-xxs font-regular text-gray-400">Amount to lock</div>
                        </div>
                      </div>
                      <div className="relative w-full">
                        <NumericalInput
                          className="mb-0 w-full rounded bg-morBg px-4 py-4 pr-20 text-2xl text-white placeholder-gray-500"
                          value={tokenAmount}
                          onUserInput={handleTokenAmountChange}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 transform text-xs text-gray-500">
                          {Number.isFinite(parsedBalance) && (
                            <span>Balance: {formatUnits(parsedBalance).toFixed(3)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="sm:gap:0 flex flex-col gap-4 sm:flex-row">
                      <div className="flex min-w-[14rem]">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="50"
                            height="50"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <div className="mx-3.5 flex flex-1 flex-col items-start justify-center">
                          <div className="token-symbol-container text-sm font-bold md:text-2xl">
                            Lock for
                          </div>
                          <div className="text-xxs font-regular text-gray-400">
                            7 days - 4 years
                          </div>
                        </div>
                      </div>
                      <div className="relative w-full">
                        <NumericalInput
                          className="mb-0 w-full rounded bg-morBg px-4 py-4 pr-20 text-2xl text-white placeholder-gray-500"
                          value={lockDuration}
                          onUserInput={handleLockDurationChange}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 transform text-xs text-gray-500">
                          DAYS
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex justify-around text-xs text-gray-400"
                      id="lock-duration-options"
                      role="radiogroup"
                    >
                      {lockDurations.map((duration) => (
                        <div
                          key={duration.value}
                          className={`flex cursor-pointer flex-row items-center justify-start space-x-1 ${
                            lockDuration === duration.value ? 'text-white' : 'text-gray-400'
                          }`}
                          role="radio"
                          aria-checked={lockDuration === duration.value}
                          tabIndex={0}
                          onClick={() => handleLockDurationChange(duration.value)}
                        >
                          <span
                            style={{
                              display: 'block',
                              height: '0.5rem',
                              width: '0.5rem',
                              borderRadius: '9999px',
                              marginLeft: '0.5rem',
                              border: `1px solid ${
                                lockDuration === duration.value ? '#24dc8e' : 'rgb(119, 119, 119)'
                              }`,
                              background:
                                lockDuration === duration.value ? '#24dc8e' : 'transparent',
                            }}
                          ></span>
                          <span>{duration.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 w-full">
              <Stake tokenAmount={tokenAmount} lockDuration={lockDuration} />
            </div>
          </div>
          <div className="col-span-2 mb-4 flex h-full flex-col lg:mb-0">
            {/* <div className="p-2">Your Stats</div> */}
            <div className="flex h-full flex-1 space-y-4">
              <div className="flex w-full flex-1 flex-col justify-between rounded bg-morCard p-5 text-xs">
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 justify-center px-1">
                    <div className="text-gray-400">stEth locked</div>
                    <div className="text-right text-white">
                      {userStakingInfo.deposited.length === 0
                        ? 0.0
                        : formatUnits(userStakingInfo.deposited).toFixed(2)}
                    </div>
                  </div>

                  {Number(userStakingInfo.deposited) !== 0 && (
                    <>
                      {' '}
                      <div className="grid grid-cols-2 justify-center px-1">
                        <div className="text-gray-400">Unlock date</div>
                        <div className="flex w-max justify-self-end text-right text-white">
                          <p
                            onClick={() => {
                              if (lastStake.length === 0 || !unlockDate.isAfter(new Date())) {
                                openModal();
                              }
                            }}
                            className={`mb-0 cursor-pointer ${
                              lastStake.length === 0 || !unlockDate.isAfter(new Date())
                                ? 'underline'
                                : ''
                            }`}
                          >
                            {lastStake.length === 0
                              ? '0.00'
                              : unlockDate.isAfter(new Date())
                                ? formattedUnlockDate
                                : 'Unstake'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 justify-center px-1">
                        <div className="text-gray-400">Claimable</div>
                        <div className="flex flex-row justify-end gap-1">
                          <div className="flex w-max justify-self-end text-right text-white">
                            {claimable.length !== 0 ? formatUnits(claimable).toFixed(2) : '0'} MOR
                          </div>
                          -
                          <Claim tokenAmount={formatUnits(claimable).toFixed(2)} />
                        </div>

                        {/* <div onClick={Claim()} className="">
                          {" "}
                          Claim Now
                        </div> */}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LockStakeComponent;
