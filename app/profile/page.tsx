'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { Modal, Button, Input, message } from 'antd';
import useSWR from 'swr';
import { EditOutlined, LockOutlined } from '@ant-design/icons';
import { conciseAddress } from '@/utils/trunc';
import { updatePhoneNumber } from '@/lib/server';

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
  createdAt: string;
}

interface JobFormDeliverable {
  id: string;
  deliverableDescription: string;
  weightsRequested: string;
}

interface JobFormComment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface JobForm {
  id: string;
  githubUsername: string;
  description: string;
  status: string;
  deliverables: JobFormDeliverable[];
  comments: JobFormComment[];
}

interface ProposalComment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  comments: ProposalComment[];
  category: {
    name: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  wallets: Wallet[];
}

const ProfilePage = () => {
  const { data: session } = useSession();
  const [selectedStaking, setSelectedStaking] = useState<Staking | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [walletName, setWalletName] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [jobForms, setJobForms] = useState<JobForm[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedJobForm, setSelectedJobForm] = useState<JobForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [isEditingPhoneNumber, setIsEditingPhoneNumber] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch user's proposals
      fetch('/api/proposals/user/proposals')
        .then((response) => response.json())
        .then((data) => {
          setProposals(data.proposals || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching proposals:', error);
          setLoading(false);
        });

      // Fetch user's job forms
      fetch('/api/proposals/user/jobforms')
        .then((response) => response.json())
        .then((data) => {
          setJobForms(data.jobForms || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching job forms:', error);
          setLoading(false);
        });
    }
  }, [session?.user?.id]);

  // const { data: user, error, mutate } = useSWR<User>(session?.user?.id ? `/api/wallets` : null, fetcher);
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
      await fetch(`/api/namedWallet?walletId=${editingWallet.id}`, {
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

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsModalVisible(true);
  };

  const handleViewJobForm = (jobForm: JobForm) => {
    setSelectedJobForm(jobForm);
    setIsModalVisible(true);
  };

  useEffect(() => {
    // Load the current user's phone number on component mount
    if (user && user.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const savePhoneNumber = () => {
    setLoadingPhone(true);
    startTransition(async () => {
      try {
        const result = await updatePhoneNumber(phoneNumber);

        //@ts-ignore
        if (result.error) {
          //@ts-ignore
          message.error(result.error);
        } else {
          message.success('Phone number updated successfully!');
          mutate(); // Re-fetch user data to update UI
        }
      } catch (error) {
        console.error('Error updating phone number:', error);
        message.error('Failed to update phone number.');
      } finally {
        setLoadingPhone(false);
      }
    });
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
                  <>
                    <div className="mb-[0.5rem] text-xl font-bold">User</div>
                    <div>
                      <strong>Username:</strong> {user.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {user.email}
                    </div>

                    <div className="mb-[0.5rem] mt-[1.5rem] text-xl font-bold">Phone Number</div>

                    {isEditingPhoneNumber ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          placeholder="+1234567890"
                          style={{ maxWidth: 200 }}
                        />
                        <Button type="primary" onClick={savePhoneNumber}>
                          Save
                        </Button>
                        <Button onClick={() => setIsEditingPhoneNumber(false)}>Cancel</Button>
                      </div>
                    ) : (
                      <div>
                        <span>{user.phoneNumber || 'No phone number set.'}</span>
                        <EditOutlined
                          onClick={() => setIsEditingPhoneNumber(true)}
                          style={{ marginLeft: '10px', cursor: 'pointer' }}
                        />
                      </div>
                    )}

                    <div className="mb-[0.5rem] mt-[1.5rem] text-xl font-bold">Wallets</div>
                    {user?.wallets.length === 0 && <div>Your stats will appear here</div>}
                    <ul>
                      {user.wallets
                        .sort(
                          (a, b) =>
                            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                        )
                        .map((wallet: Wallet) => (
                          <li key={wallet.id} className="flex items-center">
                            {editingWallet?.id === wallet.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  value={walletName}
                                  placeholder="Name your wallet"
                                  onChange={handleNameChange}
                                  style={{ maxWidth: 200 }}
                                />
                                <Button type="primary" onClick={saveWalletName}>
                                  Save
                                </Button>
                                <Button onClick={() => setEditingWallet(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <span>
                                  {isMobile ? conciseAddress(wallet.address) : wallet.address}{' '}
                                  {wallet.name || ''}
                                </span>
                                <EditOutlined
                                  onClick={() => handleEditClick(wallet)}
                                  style={{ marginLeft: '10px', cursor: 'pointer' }}
                                />
                                {wallet.stakings.length > 0 && (
                                  <LockOutlined
                                    onClick={() => showStakingDetails(wallet.stakings[0])}
                                    style={{ marginLeft: '10px', cursor: 'pointer' }}
                                  />
                                )}
                              </div>
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

                  {/* Display Proposals */}
                  <div className="mb-[0.5rem] mt-[1.5rem] text-xl font-bold">Your Proposals</div>
                  {proposals.length === 0 ? (
                    <div>You have not created any proposals yet.</div>
                  ) : (
                    <ul>
                      {proposals.map((proposal) => (
                        <li key={proposal.id} className="mb-3 flex items-center">
                          <div className="flex-grow">
                            <strong>{proposal.title}</strong> -{' '}
                            <span
                              className={`${
                                proposal.status === 'pending'
                                  ? 'bg-yellow-500 text-white'
                                  : proposal.status === 'approved'
                                    ? 'bg-green-500 text-white'
                                    : proposal.status === 'archived'
                                      ? 'bg-gray-500 text-white'
                                      : 'bg-red-500 text-white'
                              } mr-2 rounded-sm px-2 py-1 text-sm`}
                            >
                              {proposal.status}
                            </span>
                            ({proposal.category.name})
                            <Button onClick={() => handleViewProposal(proposal)} className="ml-2">
                              View Details
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Display Job Forms */}
                  <div className="mb-[0.5rem] mt-[1.5rem] text-xl font-bold">
                    Your Attached Jobs
                  </div>
                  {jobForms.length === 0 ? (
                    <div>Your attached proposal jobs will appear here.</div>
                  ) : (
                    <ul>
                      {jobForms && (
                        <ul className="">
                          {jobForms.map((form) => (
                            <li
                              className="my-3 flex flex-col gap-1 rounded border border-neutral-600 bg-black p-5 hover:bg-neutral-900"
                              key={form.id}
                            >
                              <div className="flex w-full flex-row items-center justify-between">
                                <h2>{form.githubUsername}</h2>

                                <div className="flex flex-row items-center gap-4">
                                  <h4 className="font-semibold">
                                    <span
                                      className={`${
                                        form.status === 'pending'
                                          ? 'bg-yellow-500 text-white'
                                          : form.status === 'approved'
                                            ? 'bg-green-500 text-white'
                                            : form.status === 'archived'
                                              ? 'bg-gray-500 text-white'
                                              : 'bg-red-500 text-white'
                                      } rounded-sm px-2 py-1 text-sm`}
                                    >
                                      {form.status}
                                    </span>
                                  </h4>

                                  <Button onClick={() => handleViewJobForm(form)} className="ml-2">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                              <p>{form.description}</p>
                              <p>Deliverables:</p>
                              {form.deliverables.length > 0 ? (
                                <ul>
                                  {form.deliverables.map(
                                    (deliverable: JobFormDeliverable, index: number) => (
                                      <li key={index}>
                                        <p>Description: {deliverable.deliverableDescription}</p>
                                        <p>Weight Requested: {deliverable.weightsRequested}</p>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              ) : (
                                <p>No deliverables available</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* {jobForms.map((jobForm) => (
                        <li key={jobForm.id} className="flex items-center mb-3">
                          <div className="flex-grow">
                            <strong>{jobForm.githubUsername}</strong>
                            <Button onClick={() => handleViewJobForm(jobForm)} className="ml-2">
                              View Details
                            </Button>
                          </div>
                        </li>
                      ))} */}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Proposal and JobForm Details */}
      <Modal
        title={selectedProposal ? selectedProposal.title : selectedJobForm ? 'Job Details' : ''}
        footer={null}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedProposal(null);
          setSelectedJobForm(null);
        }}
      >
        {selectedProposal && (
          <>
            <h3 className="mt-4 text-xl font-semibold">Description:</h3>
            <p>{selectedProposal.description}</p>

            <h3 className="mt-4 text-xl font-semibold">Maintainer Comments:</h3>
            <ul>
              {selectedProposal.comments.map((comment) => (
                <li key={comment.id}>
                  <strong>{comment.user.name}:</strong> {comment.text}
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
        {selectedJobForm && (
          <>
            <h3 className="mt-4 text-xl font-semibold">Description:</h3>
            <p>
              {' '}
              {selectedJobForm.deliverables.map((description) => (
                <li key={description.id}>
                  <p>Description: {description.deliverableDescription}</p>
                  <p>Weight Requested: {description.weightsRequested}</p>
                </li>
              ))}
            </p>

            <h3 className="mt-4 text-xl font-semibold">Maintainer Comments:</h3>
            <ul>
              {selectedJobForm.comments.map((comment) => (
                <li key={comment.id}>
                  <strong>{comment.user.name}:</strong> {comment.text}
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProfilePage;
