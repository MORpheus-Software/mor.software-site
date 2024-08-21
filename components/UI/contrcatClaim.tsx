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
import { StakeLock } from '../Stake/stakeLock';
import { SkeletonBox } from '@/utils/skeleton';

interface ClaimLockComponentProps {
  userStakingInfo: any; // Adjust type as needed
  stethmBalance: string;
  claimable: string;
}

const ContractClaimLockComponent = ({
  userStakingInfo,
  stethmBalance,
  claimable,
}: ClaimLockComponentProps) => {
  const { tokenAmount, lockDuration } = useSelector((state) => state.session);
  const { isTxInProgress } = useSelector((state) => state.loadings);

  const handleTokenAmountChange = (e: any) => {
    store.dispatch(setTokenAmount(e));
  };

  const handleLockDurationChange = (duration: any) => {
    store.dispatch(setLockDuration(duration));
  };

  const parsedBalance = Number(stethmBalance);
  const lockDurations = [
    { label: '1 Year', value: '365' },
    { label: '2 Years', value: '730' },
    { label: '3 Years', value: '1095' },
    { label: '4 Years', value: '1460' },
    { label: '5 Years', value: '1825' },
    { label: '6 Years', value: '2190' },
  ];
  const lastStake = userStakingInfo.claimLockStart; // Unix timestamp in seconds
  const claimLockEnd = userStakingInfo.claimLockEnd; // Number of days to lock

  // Convert both timestamps to moment objects
  const lastStakeMoment = moment.unix(lastStake);
  const claimLockEndMoment = moment.unix(claimLockEnd);

  // Check if the unlock date is in the future and format accordingly
  const formattedUnlockDate = claimLockEndMoment.isAfter(moment())
    ? `Unlocks ${claimLockEndMoment.fromNow()} (${claimLockEndMoment.format('YYYY-MM-DD')})`
    : '';

  const unlockDate = lastStakeMoment.add(claimLockEnd, 'days');

  const isDisabled = useMemo(
    () => isTxInProgress || claimLockEnd > 0,
    [isTxInProgress, claimLockEnd],
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
      {/* 
      <UnstakeModal
        available={userStakingInfo.deposited}
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        onUnstake={handleUnstake}
      /> */}

      <div className="col-span-12 mx-auto max-w-6xl rounded-2xl border border-borderTr bg-morBg p-4 shadow sm:p-6 md:col-span-9">
        <div className="flex flex-col-reverse text-base text-gray-200 lg:grid lg:grid-cols-5 lg:space-x-4">
          <div className="col-span-3 flex h-full flex-col">
            {/* <div className="p-2">Lock MORPHEUS tokens</div> */}
            <div className="flex h-full flex-col space-y-4">
              <div className="w-full flex-grow rounded bg-morCard p-5">
                <div className="flex flex-col justify-between space-y-3 sm:flex-row sm:space-y-0"></div>
                <div className="flex flex-col justify-between space-y-3 sm:flex-row sm:space-y-0">
                  <div className="flex w-full flex-col gap-8">
                    <div className="flex min-w-[14rem] text-lg font-semibold">
                      Stake your Weights
                    </div>
                    <div className="sm:gap:0 flex flex-col gap-4 sm:flex-row">
                      <div className="flex min-w-[14rem]">
                        Choose an amount of time to stake the weights associated with this address.
                        <br /> To calculate your power factor please consult the Power Factor guides
                        listed below.
                        <br /> <br /> Note: If you already have unclaimed MOR in this address when
                        you stake your MOR Rewards, it will lock those already earned MOR in
                        addition to the future MOR rewards, all for the total amount of time. In
                        short, every unclaimed MOR gets locked, present and future until the end of
                        the stake.
                        <br /> <br />
                        For how long would you like to stake your MOR Rewards?
                      </div>
                    </div>
                    <div className="sm:gap:0 flex flex-col gap-4 sm:flex-row">
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
                      className="flex justify-between text-sm text-gray-400"
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
              <StakeLock web3 tokenAmount={tokenAmount} lockDuration={lockDuration} />
            </div>
          </div>
          {true && (
            <div className="col-span-2 mb-4 flex h-full flex-col lg:mb-0">
              {/* <div className="p-2">Your Stats</div> */}
              {/* <WalletsPage></WalletsPage> */}
              <div className="flex h-full flex-1 space-y-4">
                <div className="flex w-full flex-1 flex-col justify-between rounded bg-morCard p-5 text-xs">
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 justify-center px-1">
                      <div className="text-gray-400">Staked at</div>
                      <div className="text-right text-white">
                        {isStaked ? (
                          moment.unix(userStakingInfo.claimLockStart).format('YYYY-MM-DD')
                        ) : (
                          <>-</>
                        )}
                      </div>
                    </div>
                    {/* <div className="grid justify-center px-1 grid-cols-2">
                      <div className="text-gray-400">Locked Until</div>
                      <div className="text-right text-white">
                        {isStaked ? (
                          moment
                            .unix(userStakingInfo.claimLockStart)
                            .format("YYYY-MM-DD")
                        ) : (
                          <>-</>
                        )}
                      </div>
                    </div> */}
                    <div className="grid grid-cols-2 justify-center px-1">
                      <div className="text-gray-400">Pending Rewards</div>
                      <div className="text-right text-white">
                        {isStaked ? formatUnits(claimable).toFixed(2) : <>-</>}
                      </div>
                    </div>{' '}
                    <div className="grid grid-cols-2 justify-center px-1">
                      <div className="text-gray-400">Unlocks</div>
                      <div className="w-max justify-self-end text-right text-white">
                        {isStaked ? formattedUnlockDate : <>-</>}
                      </div>
                    </div>
                    {/* <div className="grid justify-center px-1 grid-cols-2">
                    <div className="text-gray-400">stEth locked</div>
                    <div className="text-right text-white">
                      {userStakingInfo.deposited.length === 0
                        ? 0.0
                        : formatUnits(userStakingInfo.deposited).toFixed(2)}
                    </div>
                  </div> */}
                    {Number(userStakingInfo.deposited) !== 0 && (
                      <>
                        {/* <div className="grid justify-center px-1 grid-cols-2">
                          <div className="text-gray-400">Unlock date</div>
                          <div className="text-right text-white w-max flex justify-self-end	">
                            <p
                              onClick={() => {
                                if (
                                  lastStake.length === 0 ||
                                  !unlockDate.isAfter(new Date())
                                ) {
                                  openModal();
                                }
                              }}
                              className={`cursor-pointer mb-0 ${
                                lastStake.length === 0 ||
                                !unlockDate.isAfter(new Date())
                                  ? "underline"
                                  : ""
                              }`}
                            >
                              {lastStake.length === 0
                                ? "0.00"
                                : unlockDate.isAfter(new Date())
                                ? formattedUnlockDate
                                : "Unstake"}
                            </p>
                          </div>
                        </div> */}
                        {/* <div className="grid justify-center px-1 grid-cols-2">
                          <div className="text-gray-400">Claimable</div>
                          <div className="flex flex-row gap-1 justify-end">
                            <div className="text-right text-white w-max flex justify-self-end	">
                              {claimable.length !== 0
                                ? formatUnits(claimable).toFixed(2)
                                : "0"}{" "}
                              MOR
                            </div>
                            -
                            <Claim
                              tokenAmount={formatUnits(claimable).toFixed(2)}
                            />
                          </div>
                        </div> */}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContractClaimLockComponent;
