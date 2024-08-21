import { generateExplorerTxLink } from '@/utils/format';

const BaseToast = ({
  heading,
  subHeading,
  explorerLink,
  txId,
}: {
  heading: string;
  subHeading?: any;
  explorerLink?: string;
  txId?: string;
}) => {
  return (
    <div>
      <div role="alert" className="">
        <div>
          <div className="flex items-start gap-4">
            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="mb-1 justify-start text-sm font-semibold text-slate-200">
                {heading}{' '}
              </span>
            </div>
          </div>

          <p className="text-secondary text-sm">{subHeading}</p>

          {txId ? (
            <>
              {' '}
              <div className="grid-cols-auto mt-4 grid gap-4 p-0">
                <button
                  onClick={() =>
                    window.open(explorerLink ?? generateExplorerTxLink(txId), '_blank')
                  }
                  className="ring-offset-background focus-visible:ring-ring ring-blue bg-secondary hover:bg-muted focus:bg-accent inline-flex h-[36px] min-h-[36px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  View transaction
                </button>
              </div>
            </>
          ) : (
            <div className="grid-cols-auto mt-4 grid gap-4 p-0">
              <button className="ring-offset-background focus-visible:ring-ring ring-blue bg-secondary hover:bg-muted focus:bg-accent inline-flex h-[36px] min-h-[36px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const StakeSuccessToast = ({
  amount,
  txId,
  lockDuration,
}: {
  amount?: number;
  txId: string;
  lockDuration?: string;
}) => {
  return (
    <BaseToast
      heading="Transaction Successful"
      subHeading={`Successfully staked your weights for ${lockDuration} days`}
      txId={txId}
    />
  );
};
export const UnstakeSuccessToast = ({
  amount,
  txId,
  lockDuration,
}: {
  amount: string;
  txId: string;
  lockDuration?: string;
}) => {
  return (
    <BaseToast
      heading="Transaction Successful"
      subHeading={`Successfully unstaked ${amount} stEth`}
      txId={txId}
    />
  );
};

export const ClaimSuccessToast = ({
  amount,
  txId,
  lockDuration,
}: {
  amount: string;
  txId: string;
  lockDuration?: string;
}) => {
  return (
    <BaseToast
      heading="Transaction Successful"
      subHeading={`Successfully claimed ${amount} MOR on Arbitrum`}
      txId={txId}
    />
  );
};

export const StakeFormSucess = ({ amount }: { amount?: string }) => {
  return <BaseToast heading="Success!" subHeading={`Staking submitted successfully`} />;
};

export const ErrorToast = ({ message }: { message: string }) => {
  return (
    <BaseToast
      heading="Error"
      subHeading={
        <>
          <span className="mr-1 font-semibold">{message}</span>
        </>
      }
    />
  );
};

export const ErrorFormtoast = ({ message, address }: { message: string; address: String }) => {
  return (
    <BaseToast
      heading="Error"
      subHeading={
        <>
          <span className="mr-1 font-semibold">
            {message} {address}
          </span>
        </>
      }
    />
  );
};
export const TxProgressToast = () => {
  return <BaseToast heading="Processing Transaction" subHeading="Transaction is processing..." />;
};

export const ApprovalToast = () => {
  return <BaseToast heading="Approved" subHeading="Contract Approved" />;
};
