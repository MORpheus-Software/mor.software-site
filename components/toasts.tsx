import { generateExplorerTxLink } from "@/utils/format";

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
          <div className="flex gap-4 items-start">
            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="font-semibold mb-1 text-sm justify-start text-slate-200">
                {heading}{" "}
              </span>
            </div>
          </div>

          <p className="text-secondary text-sm">{subHeading}</p>

          {txId ? (
            <>
              {" "}
              <div className="grid-cols-auto grid gap-4 p-0 mt-4">
                <button
                  onClick={() =>
                    window.open(
                      explorerLink ?? generateExplorerTxLink(txId),
                      "_blank"
                    )
                  }
                  className="cursor-pointer whitespace-nowrap inline-flex gap-2 items-center justify-center font-medium disabled:opacity-50 disabled:pointer-events-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-blue bg-secondary hover:bg-muted focus:bg-accent min-h-[36px] h-[36px] px-3 text-sm rounded-sm"
                >
                  View transaction
                </button>
              </div>
            </>
          ) : (
            <div className="grid-cols-auto grid gap-4 p-0 mt-4">
              <button className="cursor-pointer whitespace-nowrap inline-flex gap-2 items-center justify-center font-medium disabled:opacity-50 disabled:pointer-events-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-blue bg-secondary hover:bg-muted focus:bg-accent min-h-[36px] h-[36px] px-3 text-sm rounded-sm">
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
  return (
    <BaseToast
      heading="Success!"
      subHeading={`Staking submitted successfully`}
    />
  );
};

export const ErrorToast = ({ message }: { message: string }) => {
  return (
    <BaseToast
      heading="Error"
      subHeading={
        <>
          <span className="font-semibold mr-1">{message}</span>
        </>
      }
    />
  );
};

export const ErrorFormtoast = ({
  message,
  address,
}: {
  message: string;
  address: String;
}) => {
  return (
    <BaseToast
      heading="Error"
      subHeading={
        <>
          <span className="font-semibold mr-1">
            {message} {address}
          </span>
        </>
      }
    />
  );
};
export const TxProgressToast = () => {
  return (
    <BaseToast
      heading="Processing Transaction"
      subHeading="Transaction is processing..."
    />
  );
};

export const ApprovalToast = () => {
  return <BaseToast heading="Approved" subHeading="Contract Approved" />;
};
