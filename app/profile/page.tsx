'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { Modal, Button, Input, message } from 'antd';
import useSWR from 'swr';
import { EditOutlined, LockOutlined } from '@ant-design/icons';
import { conciseAddress } from '@/utils/trunc';
import { updatePhoneNumber } from '@/lib/server';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import CommentSection from '../maintainerPage/CommentSection';

interface StandaloneJobForm {
  id: string;
  githubUsername: string;
  email: string;
  description: string;
  deliverables: string;
  weightsRequested: string;
  minimumWeightsTime: number;
  status: string;
  comments: StandaloneJobComment[];
}

interface StandaloneJobComment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ProofContribution {
  id: string;
  githubUsername: string;
  email: string;
  walletAddress: string;
  description: string;
  weightsAgreed: string;
  linksToProof: string;
  status: string;
  comments: ProofContributionComment[];
}

interface ProofContributionComment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
  };
}

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
  description: string;
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

  const { address, isConnected } = useAccount();

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

  const [standaloneJobs, setStandaloneJobs] = useState<StandaloneJobForm[]>([]);
  const [proofContributions, setProofContributions] = useState<ProofContribution[]>([]);
  const [comment, setComment] = useState<string>('');
  const [proofContributionComment, setProofContributionComment] = useState<string>('');
  const [standaloneJobComment, setStandaloneJobComment] = useState<string>('');
  const [JobFormComment, setJobFormComment] = useState<string>('');

  const [updating, setUpdating] = useState<boolean>(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchProposalDetails = async (proposalId: number) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`);
      const { proposal, jobForms } = await response.json();

      if (response.ok) {
        setSelectedProposal(proposal);
        setJobForms(jobForms);
        setIsModalVisible(true);
      } else {
        toast.error('Failed to fetch proposal details.');
      }
    } catch (error) {
      console.error('Error fetching proposal details:', error);
      toast.error('Failed to fetch proposal details.');
    }
  };

  const handleCommentSubmit = async () => {
    let isActive = true;
    setUpdating(true);
    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: selectedProposal?.id,
          text: comment,
          walletAddress: address,
        }),
      });

      if (isActive) {
        if (response.ok) {
          toast.success('Comment added successfully!');
          setComment('');
          if (selectedProposal?.id) {
            fetchProposalDetails(Number(selectedProposal.id)); // Refresh proposal details
          }
        } else {
          toast.error('Failed to add comment.');
        }
      }
    } catch (error) {
      if (isActive) {
        console.error('Error adding comment:', error);
        toast.error('Failed to add comment.');
      }
    } finally {
      if (isActive) setUpdating(false);
    }

    return () => {
      isActive = false;
    };
  };

  const handleJobCommentSubmit = async (jobid: string) => {
    let isActive = true;
    setUpdating(true);
    try {
      const response = await fetch('/api/jobForm/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobFormId: jobid,
          text: JobFormComment,
          walletAddress: address,
        }),
      });

      if (isActive) {
        if (response.ok) {
          const newComment = await response.json(); // Assuming the new comment is returned in the response
          toast.success('Comment added successfully!');
          setJobFormComment('');

          // Update the job form comments directly in the state without re-fetching the whole job form
          setSelectedJobForm((selectedJobForm) => {
            if (selectedJobForm) {
              return {
                ...selectedJobForm,
                comments: [...selectedJobForm.comments, newComment], // Append new comment
              };
            }
            return selectedJobForm;
          });
        } else {
          toast.error('Failed to add comment.');
        }
      }
    } catch (error) {
      if (isActive) {
        console.error('Error adding comment:', error);
        toast.error('Failed to add comment.');
      }
    } finally {
      if (isActive) setUpdating(false);
    }

    return () => {
      isActive = false;
    };
  };

  const fetchProofContributionDetails = async (proofId: string) => {
    try {
      const response = await fetch(`/api/proofForm/${proofId}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedProofContribution(data.proofContribution);
      } else {
        toast.error('Failed to fetch proof contribution details.');
      }
    } catch (error) {
      console.error('Error fetching proof contribution details:', error);
      toast.error('Failed to fetch proof contribution details.');
    }
  };

  const handleProofContributionCommentSubmit = async (pocId: string) => {
    setUpdating(true);

    try {
      const response = await fetch('/api/proofForm/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proofContributionId: pocId,
          text: proofContributionComment,
          walletAddress: address,
        }),
      });

      if (isMountedRef.current) {
        if (response.ok) {
          toast.success('Comment added to Proof Contribution successfully!');
          setProofContributionComment('');
          await fetchProofContributionDetails(pocId);
        } else {
          toast.error('Failed to add comment to Proof Contribution.');
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error adding comment to Proof Contribution:', error);
        toast.error('Failed to add comment to Proof Contribution.');
      }
    } finally {
      if (isMountedRef.current) {
        setUpdating(false);
      }
    }
  };

  const handleViewStandaloneJob = (job: StandaloneJobForm) => {
    setSelectedStandaloneJob(job);
    setIsModalVisible(true);
  };

  const handleViewProofContribution = (proof: ProofContribution) => {
    setSelectedProofContribution(proof);
    setIsModalVisible(true);
  };

  const [selectedStandaloneJob, setSelectedStandaloneJob] = useState<StandaloneJobForm | null>(
    null,
  );
  const [selectedProofContribution, setSelectedProofContribution] =
    useState<ProofContribution | null>(null);

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

      // Fetch user's standalone jobs
      fetch('/api/jobForm/user')
        .then((response) => response.json())
        .then((data) => {
          setStandaloneJobs(data.standaloneJobs || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching standalone jobs:', error);
          setLoading(false);
        });

      // Fetch user's proof contributions
      fetch('/api/proofForm/user')
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setProofContributions(data.proofContributions || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching proof contributions:', error);
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
        message.error('Failed to update phone numsber.');
      } finally {
        setLoadingPhone(false);
      }
    });
  };

  const fetchStandaloneJobDetails = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobForm/standalone/${jobId}`);
      const data = await response.json();
      console.log(data, 'dataa');

      if (response.ok) {
        setSelectedStandaloneJob(data.standaloneJob);
      } else {
        toast.error('Failed to fetch standalone job details.');
      }
    } catch (error) {
      console.error('Error fetching standalone job details:', error);
      toast.error('Failed to fetch standalone job details.');
    }
  };

  const handleStandaloneJobCommentSubmit = async (JobId: any) => {
    if (!JobId) return;
    setUpdating(true);

    try {
      const response = await fetch('/api/jobForm/standalone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: true,
          jobId: JobId,
          text: standaloneJobComment,
          walletAddress: address,
        }),
      });

      if (response.ok) {
        toast.success('Comment added to Standalone Job successfully!');
        setStandaloneJobComment('');
        fetchStandaloneJobDetails(JobId);
      } else {
        toast.error('Failed to add comment to Standalone Job.');
      }
    } catch (error) {
      console.error('Error adding comment to Standalone Job:', error);
      toast.error('Failed to add comment to Standalone Job.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mx col-span-12 max-w-3xl rounded-2xl border border-borderTr bg-morBg p-4 shadow sm:mx-auto sm:p-6 md:col-span-9">
      <div className="flex flex-col-reverse text-base text-gray-200 lg:grid lg:grid-cols-1 lg:space-x-4">
        <div className="col-span-3 flex h-full flex-col">
          <div className="flex h-full flex-col space-y-4">
            {!session ? (
              <p>Please log in via GitHub to view your profile.</p>
            ) : error ? (
              <p>Failed to load user data.</p>
            ) : !user ? (
              <p>Loading...</p>
            ) : (
              <>
                <>
                  <div className="text-2xl font-bold">Profile</div>

                  <div className="proposal-item my-3 flex flex-col gap-1 rounded border border-neutral-600 bg-black p-5 hover:bg-neutral-900">
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
                    {user?.wallets?.length === 0 && <div>Your stats will appear here</div>}
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
                  </div>
                </>

                {/* Display Proposals */}
                <div className="mb-[0.5rem] mt-[1.5rem] text-xl font-bold">Your MRCs</div>
                <div className="">
                  {proposals.length === 0 ? (
                    <div>You have not created any MRCs yet.</div>
                  ) : (
                    <ul>
                      {proposals.map((proposal) => (
                        <li
                          key={proposal.id}
                          className="proposal-item my-3 flex flex-col gap-1 rounded border border-neutral-600 bg-black p-5 hover:bg-neutral-900"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex flex-row gap-2">
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
                            </div>
                            {/* ({proposal.category.name}) */}
                            <Button onClick={() => handleViewProposal(proposal)} className="ml-2">
                              View Details
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Display Job Forms */}
                <div className="mb-[0.5rem] mt-[1.5rem] text-xl font-bold">Your Attached Jobs</div>
                {jobForms.length === 0 ? (
                  <div>Your attached MRC jobs will appear here.</div>
                ) : (
                  <ul>
                    {jobForms && (
                      <ul>
                        {jobForms.map((form) => (
                          <li
                            className="my-3 flex flex-col gap-1 rounded border border-neutral-600 bg-black p-5 hover:bg-neutral-900"
                            key={form.id}
                          >
                            <div className="flex w-full flex-row items-center justify-between">
                              <div className="flex flex-row items-center gap-4">
                                <h2 className="mb-0">{form.githubUsername}</h2>

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
                              </div>

                              <Button onClick={() => handleViewJobForm(form)} className="ml-2">
                                View Details
                              </Button>
                            </div>

                            <div className="mt-2">
                              <p>{form.description}</p>
                              <p className="mb-2 font-semibold">Deliverables:</p>
                              {form.deliverables.length > 0 ? (
                                <ul className="flex flex-col gap-4">
                                  {form.deliverables
                                    .slice()
                                    .reverse()
                                    .map((deliverable: JobFormDeliverable, index: number) => (
                                      <li key={index}>
                                        <p>Description: {deliverable.deliverableDescription}</p>
                                        <p>Weight Requested: {deliverable.weightsRequested}</p>
                                        <p>End Of Month Deliverable: {deliverable.description}</p>
                                      </li>
                                    ))}
                                </ul>
                              ) : (
                                <p>No deliverables available</p>
                              )}
                            </div>
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

                <div className="mb-[0.5rem] mt-[1.5rem] text-xl font-bold">
                  Your Standalone Jobs
                </div>
                {standaloneJobs.length === 0 ? (
                  <div>You have not submitted any Standalone Jobs yet.</div>
                ) : (
                  <ul>
                    {standaloneJobs.map((job) => (
                      <li
                        key={job.id}
                        className="my-3 flex flex-col gap-1 rounded border border-neutral-600 bg-black p-5 hover:bg-neutral-900"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-row gap-2">
                            <strong>{job.description}</strong> -{' '}
                            <span
                              className={`${
                                job.status === 'pending'
                                  ? 'bg-yellow-500 text-white'
                                  : job.status === 'approved'
                                    ? 'bg-green-500 text-white'
                                    : job.status === 'archived'
                                      ? 'bg-gray-500 text-white'
                                      : 'bg-red-500 text-white'
                              } mr-2 rounded-sm px-2 py-1 text-sm`}
                            >
                              {job.status}
                            </span>
                          </div>

                          <Button onClick={() => handleViewStandaloneJob(job)} className="ml-2">
                            View Details
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Display Proof Contributions */}
                <div className="mb-[0.5rem] mt-[1.5rem] text-xl font-bold">
                  Your Proof Contributions
                </div>
                {proofContributions.length === 0 ? (
                  <div>You have not submitted any Proof Contributions yet.</div>
                ) : (
                  <ul>
                    {proofContributions.map((proof) => (
                      <li
                        key={proof.id}
                        className="my-3 flex flex-col gap-1 rounded border border-neutral-600 bg-black p-5 hover:bg-neutral-900"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-row gap-2">
                            <strong>{proof.description}</strong> -{' '}
                            <span
                              className={`${
                                proof.status === 'pending'
                                  ? 'bg-yellow-500 text-white'
                                  : proof.status === 'approved'
                                    ? 'bg-green-500 text-white'
                                    : proof.status === 'archived'
                                      ? 'bg-gray-500 text-white'
                                      : 'bg-red-500 text-white'
                              } mr-2 rounded-sm px-2 py-1 text-sm`}
                            >
                              {proof.status}
                            </span>
                          </div>

                          <Button
                            onClick={() => handleViewProofContribution(proof)}
                            className="ml-2"
                          >
                            View Details
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Proposal and JobForm Details */}
      <Modal
        title={
          selectedProposal
            ? selectedProposal.title
            : selectedJobForm
              ? 'Job Details'
              : selectedStandaloneJob
                ? 'Standalone Job Details'
                : selectedProofContribution
                  ? 'Proof Contribution Details'
                  : ''
        }
        footer={null}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedProposal(null);
          setSelectedJobForm(null);
          setSelectedStandaloneJob(null);
          setSelectedProofContribution(null);
        }}
      >
        {selectedProposal && (
          <>
            <h3 className="mt-4 text-xl font-semibold">Description:</h3>
            <p>{selectedProposal.description}</p>

            {/* <h3 className="mt-4 text-xl font-semibold">Maintainer Comments:</h3> */}
            {/* <ul>
              {selectedProposal.comments.map((comment) => (
                <li key={comment.id}>
                  <strong>{comment.user.name}:</strong> {comment.text}
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul> */}

            <CommentSection
              comments={selectedProposal.comments}
              comment={comment}
              setComment={setComment}
              handleCommentSubmit={handleCommentSubmit}
              updating={updating}
            />
          </>
        )}
        {selectedJobForm && (
          <>
            <h3 className="mt-4 text-xl font-semibold">Description:</h3>{' '}
            <div className="flex flex-col gap-4">
              {selectedJobForm.deliverables
                .slice()
                .reverse()
                .map((description) => (
                  <li key={description.id}>
                    <p>Description: {description.deliverableDescription}</p>
                    <p>Weight Requested: {description.weightsRequested}</p>
                    <p>End of Month Deliverable: {description.description}</p>
                  </li>
                ))}
            </div>
            <ul>
              <CommentSection
                comments={selectedJobForm.comments}
                comment={JobFormComment}
                setComment={setJobFormComment}
                handleCommentSubmit={() => handleJobCommentSubmit(selectedJobForm.id)} // Use an arrow function to wrap the call
                updating={updating}
              />
            </ul>
          </>
        )}

        {selectedStandaloneJob && (
          <>
            <h3 className="mt-4 text-xl font-semibold">Description:</h3>
            <p>Description: {selectedStandaloneJob.description}</p>
            <p>Deliverables: {selectedStandaloneJob.deliverables}</p>
            <p>Weight Requested: {selectedStandaloneJob.weightsRequested}</p>
            <p>Minimum Weights Time: {selectedStandaloneJob.minimumWeightsTime}</p>

            {/* <h3 className="mt-4 text-xl font-semibold">Maintainer Comments:</h3> */}
            <ul>
              {/* {selectedStandaloneJob.comments.map((comment) => (
                <li key={comment.id}>
                  <strong>{comment.user.name}:</strong> {comment.text}
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </li>
              ))} */}

              <CommentSection
                comments={selectedStandaloneJob.comments}
                comment={standaloneJobComment}
                setComment={setStandaloneJobComment}
                handleCommentSubmit={() =>
                  handleStandaloneJobCommentSubmit(selectedStandaloneJob.id)
                } // Use an arrow function to wrap the call
                updating={updating}
              />
            </ul>
          </>
        )}

        {selectedProofContribution && (
          <>
            <h3 className="mt-4 text-xl font-semibold">Description:</h3>
            <p>Description: {selectedProofContribution.description}</p>
            <p>Weight Agreed: {selectedProofContribution.weightsAgreed}</p>
            <p>Links to the proof: {selectedProofContribution.linksToProof}</p>
            <h3 className="mt-4 text-xl font-semibold">Maintainer Comments:</h3>
            <ul>
              {selectedProofContribution.comments.map((comment) => (
                <li key={comment.id}>
                  <strong>{comment.user.name}:</strong> {comment.text}
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>

            <CommentSection
              comments={selectedProofContribution.comments}
              comment={proofContributionComment}
              setComment={setProofContributionComment}
              handleCommentSubmit={() =>
                handleProofContributionCommentSubmit(selectedProofContribution.id)
              } // Use an arrow function to wrap the call
              updating={updating}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProfilePage;
