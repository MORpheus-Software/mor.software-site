"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Modal } from "antd";
import { EditOutlined, LockOutlined } from "@ant-design/icons";
import { conciseAddress } from "@/utils/trunc";
// Fetcher function to be used by SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Staking {
  stakedDate: string;
  lockEndDate: string;
  duration: number;
}

interface Wallet {
  id: string;
  address: string;
  name: string | null;
  stakings: Staking[];
  createdAt: string; // Ensure this field is included
}

interface User {
  id: string;
  email: string;
  name: string;
  wallets: Wallet[];
}

const ProfilePage = () => {
  const { data: session } = useSession();
  const [selectedStaking, setSelectedStaking] = useState<Staking | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [walletName, setWalletName] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    data: user,
    error,
    mutate,
  } = useSWR<User>(
    session?.user?.id ? `/api/wallets?userId=${session.user.id}` : null,
    fetcher
  );

  const showStakingDetails = (staking: Staking) => {
    setSelectedStaking(staking);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setSelectedStaking(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedStaking(null);
  };

  const handleEditClick = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setWalletName(wallet.name || "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletName(e.target.value);
  };

  const saveWalletName = async () => {
    if (editingWallet) {
      await fetch(
        //@ts-ignore
        `/api/namedWallet?userId=${session?.user.id}&walletId=${editingWallet.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: walletName }),
        }
      );

      // Optimistically update the local state
      const updatedWallets = user?.wallets.map((wallet) =>
        wallet.id === editingWallet.id
          ? { ...wallet, name: walletName === "" ? null : walletName }
          : wallet
      );
      //@ts-ignore
      mutate({ ...user, wallets: updatedWallets }, false);

      setEditingWallet(null);
      setWalletName("");
    }
  };

  return (
    <div className="col-span-12 md:col-span-9 p-4 mx sm:mx-auto sm:p-6 shadow bg-morBg rounded-2xl max-w-3xl border border-borderTr">
      <div className="lg:grid lg:grid-cols-1 flex flex-col-reverse text-base lg:space-x-4 text-gray-200">
        <div className="col-span-3 flex flex-col h-full">
          <div className="space-y-4 flex flex-col h-full">
            <div className="p-5 rounded bg-morCard w-full flex-grow">
              {!session ? (
                <p>Please log in via GitHub to view your profile.</p>
              ) : error ? (
                <p>Failed to load user data.</p>
              ) : !user ? (
                <p>Loading...</p>
              ) : (
                <>
                  <div className="text-xl mb-[0.5rem] font-bold">User</div>
                  <div>
                    <strong>Username:</strong> {user.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>

                  <div className="text-xl mt-[1.5rem] mb-[0.5rem] font-bold">
                    Wallets
                  </div>
                  {user?.wallets.length === 0 && (
                    <div>Your stats will appear here</div>
                  )}
                  <ul>
                    {user.wallets
                      .sort(
                        (a, b) =>
                          new Date(a.createdAt).getTime() -
                          new Date(b.createdAt).getTime()
                      )
                      .map((wallet: Wallet) => (
                        <li key={wallet.id} className="flex items-center">
                          {editingWallet?.id === wallet.id ? (
                            <>
                              <div className="flex flex-col gap-4 sm:flex-row flex-grow">
                                <input
                                  type="text"
                                  value={walletName}
                                  placeholder="Name your wallet"
                                  onChange={handleNameChange}
                                  className="mr-2 p-3	mb-0"
                                />
                                <button onClick={saveWalletName}>Save</button>
                                <button onClick={() => setEditingWallet(null)}>
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              {wallet.name ? (
                                <>
                                  {isMobile
                                    ? conciseAddress(wallet.address)
                                    : wallet.address}{" "}
                                  {wallet.name}
                                </>
                              ) : (
                                <>
                                  {isMobile
                                    ? conciseAddress(wallet.address)
                                    : wallet.address}{" "}
                                </>
                              )}
                              <EditOutlined
                                onClick={() => handleEditClick(wallet)}
                                style={{
                                  marginLeft: "10px",
                                  cursor: "pointer",
                                }}
                              />
                              {wallet.stakings.length > 0 && (
                                <LockOutlined
                                  onClick={() =>
                                    showStakingDetails(wallet.stakings[0])
                                  }
                                  style={{
                                    marginLeft: "10px",
                                    cursor: "pointer",
                                  }}
                                />
                              )}
                            </>
                          )}
                        </li>
                      ))}
                  </ul>
                  <Modal
                    title="Staking Details"
                    footer={false}
                    open={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                  >
                    {selectedStaking && (
                      <div className="gap-4 my-4 flex flex-col">
                        <span>
                          <strong>Staked Date:</strong>{" "}
                          {new Date(
                            selectedStaking.stakedDate
                          ).toLocaleString()}
                        </span>
                        <span>
                          <strong>Lock End Date:</strong>{" "}
                          {new Date(
                            selectedStaking.lockEndDate
                          ).toLocaleString()}
                        </span>
                        <span className="mb-0">
                          <strong>Duration:</strong> {selectedStaking.duration}{" "}
                          days
                        </span>
                      </div>
                    )}
                  </Modal>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
