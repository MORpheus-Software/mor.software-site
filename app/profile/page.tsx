'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { Modal } from 'antd';
import { EditOutlined, LockOutlined } from '@ant-design/icons';
import { conciseAddress } from '@/utils/trunc';

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

interface BidFormDeliverable {
  id: string;
  deliverableDescription: string;
  weightsRequested: string;
}

interface BidForm {
  id: string;
  githubUsername: string;
  description: string;
  deliverables: BidFormDeliverable[];
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
  const [walletName, setWalletName] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [bidForms, setBidForms] = useState<BidForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/bidForm?uid=${session.user.id}`)
        .then((response) => response.json())
        .then((data) => {
          setBidForms(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching bid forms:', error);
          setLoading(false);
        });
    }
  }, [session?.user?.id]);

  const {
    data: user,
    error,
    mutate,
  } = useSWR<User>(session?.user?.id ? `/api/wallets?userId=${session.user.id}` : null, fetcher);

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
    setWalletName(wallet.name || '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletName(e.target.value);
  };

  const saveWalletName = async () => {
    if (editingWallet) {
      await fetch(`/api/namedWallet?userId=${session?.user?.id}&walletId=${editingWallet.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: walletName }),
      });

      if (user?.wallets) {
        const updatedWallets = user.wallets.map((wallet) =>
          wallet.id === editingWallet.id
            ? { ...wallet, name: walletName === '' ? null : walletName }
            : wallet,
        );

        mutate({ ...user, wallets: updatedWallets }, false);
      }

      setEditingWallet(null);
      setWalletName('');
    }
  };

  return (
    <div className="mx col-span-12 max-w-3xl rounded-2xl border border-borderTr bg-morBg p-4 shadow sm:mx-auto sm:p-6 md:col-span-9">
      <div className="flex flex-col-reverse text-base text-gray-200 lg:grid lg:grid-cols-1 lg:space-x-4">
        <div className="col-span-3 flex h-full flex-col">
          <div className="flex h-full flex-col space-y-4">
            <div className="w-full flex-grow rounded bg-morCard p-5">
              {!session ? (
                <p>Please log in via GitHub to view your profile.</p>
              ) : error ? (
                <p>Failed to load user data.</p>
              ) : !user ? (
                <p>Loading...</p>
              ) : (
                <>
                  <div className="mb-[0.5rem] text-xl font-bold">User</div>
                  <div>
                    <strong>Username:</strong> {user.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>

                  <div className="mb-[0.5rem] mt-[1.5rem] text-xl font-bold">Wallets</div>
                  {user?.wallets.length === 0 && <div>Your stats will appear here</div>}
                  <ul>
                    {user.wallets
                      .sort(
                        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                      )
                      .map((wallet: Wallet) => (
                        <li key={wallet.id} className="flex items-center">
                          {editingWallet?.id === wallet.id ? (
                            <>
                              <div className="flex flex-grow flex-col gap-4 sm:flex-row">
                                <input
                                  type="text"
                                  value={walletName}
                                  placeholder="Name your wallet"
                                  onChange={handleNameChange}
                                  className="mb-0 mr-2 p-3"
                                />
                                <button onClick={saveWalletName}>Save</button>
                                <button onClick={() => setEditingWallet(null)}>Cancel</button>
                              </div>
                            </>
                          ) : (
                            <>
                              {wallet.name ? (
                                <>
                                  {isMobile ? conciseAddress(wallet.address) : wallet.address}{' '}
                                  {wallet.name}
                                </>
                              ) : (
                                <>{isMobile ? conciseAddress(wallet.address) : wallet.address} </>
                              )}
                              <EditOutlined
                                onClick={() => handleEditClick(wallet)}
                                style={{
                                  marginLeft: '10px',
                                  cursor: 'pointer',
                                }}
                              />
                              {wallet.stakings.length > 0 && (
                                <LockOutlined
                                  onClick={() => showStakingDetails(wallet.stakings[0])}
                                  style={{
                                    marginLeft: '10px',
                                    cursor: 'pointer',
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
                      <div className="my-4 flex flex-col gap-4">
                        <span>
                          <strong>Staked Date:</strong>{' '}
                          {new Date(selectedStaking.stakedDate).toLocaleString()}
                        </span>
                        <span>
                          <strong>Lock End Date:</strong>{' '}
                          {new Date(selectedStaking.lockEndDate).toLocaleString()}
                        </span>
                        <span className="mb-0">
                          <strong>Duration:</strong> {selectedStaking.duration} days
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

      {bidForms && (
        <ul className="">
          {bidForms.map((form) => (
            <li
              className="my-3 flex flex-col gap-1 rounded border border-neutral-600 bg-black p-5 hover:bg-neutral-900"
              key={form.id}
            >
              <h2>{form.githubUsername}</h2>
              <p>{form.description}</p>
              <p>Deliverables:</p>
              {form.deliverables.length > 0 ? (
                <ul>
                  {form.deliverables.map((deliverable: BidFormDeliverable, index: number) => (
                    <li key={index}>
                      <p>Description: {deliverable.deliverableDescription}</p>
                      <p>Weight Requested: {deliverable.weightsRequested}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No deliverables available</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfilePage;
