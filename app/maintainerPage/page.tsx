'use client';
import { Select, Button, Modal, Input } from 'antd';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

const { Option } = Select;
const { TextArea } = Input;

interface Proposal {
  id: number;
  title: string;
  description: string;
  mri: string;
  status: string;
  deliverables: Deliverable[];
  comments?: ProposalComment[]; // Make comments optional
}

interface ProposalComment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface Deliverable {
  id: number;
  description: string;
}

interface BidForm {
  id: number;
  user: {
    name: string;
    githubUsername: string;
  };
  deliverables: {
    deliverableDescription: string;
    description: string;
    weightsRequested: number;
    minimumWeightsTime: number;
  }[];
  status: string;
  comments?: BidFormComment[]; // Make comments optional
}

interface BidFormComment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
  proposals: Proposal[];
}

export default function MaintainerPage() {
  const { address, isConnected } = useAccount();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [bidForms, setBidForms] = useState<BidForm[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');
  const [bidComment, setBidComment] = useState<string>('');
  const [selectedBidForm, setSelectedBidForm] = useState<BidForm | null>(null);

  useEffect(() => {
    if (address && isConnected) {
      fetchCategories();
    }
  }, [address, isConnected]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?walletAddress=${address}`);
      const data: Category[] = await response.json();

      if (response.ok && data.length > 0) {
        setCategories(data);
        const proposals = data.flatMap((category) => category.proposals);
        setAllProposals(proposals);
      } else {
        toast.error('No categories found.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories.');
    }
  };

  const fetchProposalDetails = async (proposalId: number) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`);
      const { proposal, bidForms } = await response.json();

      if (response.ok) {
        setSelectedProposal(proposal);
        setBidForms(bidForms);
        setIsModalVisible(true);
      } else {
        toast.error('Failed to fetch proposal details.');
      }
    } catch (error) {
      console.error('Error fetching proposal details:', error);
      toast.error('Failed to fetch proposal details.');
    }
  };

  const handleUpdateStatus = async (proposalId: number, status: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/proposals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: proposalId,
          status,
          walletAddress: address,
        }),
      });

      if (response.ok) {
        fetchCategories(); // Refresh the proposals list after update
        toast.success('Proposal status updated successfully!');
      } else {
        toast.error('Failed to update proposal status.');
      }
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast.error('Failed to update proposal status.');
    } finally {
      fetchProposalDetails(proposalId);
      setUpdating(false);
    }
  };

  const handleUpdateBidStatus = async (bidFormId: number, status: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/bidForm', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bidFormId,
          status,
          walletAddress: address,
        }),
      });

      if (response.ok) {
        fetchProposalDetails(selectedProposal?.id || 0); // Refresh the proposal details after update
        toast.success('BidForm status updated successfully!');
      } else {
        toast.error('Failed to update BidForm status.');
      }
    } catch (error) {
      console.error('Error updating BidForm status:', error);
      toast.error('Failed to update BidForm status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCommentSubmit = async () => {
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

      if (response.ok) {
        toast.success('Comment added successfully!');
        setComment('');
        fetchProposalDetails(selectedProposal?.id || 0); // Refresh proposal details
      } else {
        toast.error('Failed to add comment.');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment.');
    }
  };

  const handleBidCommentSubmit = async (bidFormId: number) => {
    try {
      const response = await fetch('/api/bidForm/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bidFormId,
          text: bidComment,
          walletAddress: address,
        }),
      });

      if (response.ok) {
        toast.success('Comment added to bid form successfully!');
        setBidComment('');
        fetchProposalDetails(selectedProposal?.id || 0); // Refresh proposal details
      } else {
        toast.error('Failed to add comment to bid form.');
      }
    } catch (error) {
      console.error('Error adding comment to bid form:', error);
      toast.error('Failed to add comment to bid form.');
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedProposal(null);
    setBidForms([]);
  };

  return (
    <div className="maintainer-page">
      <div className="mx col-span-12 max-w-3xl rounded-2xl border border-borderTr bg-morBg p-4 shadow sm:mx-auto sm:p-6">
        {categories.length > 0 ? (
          <>
            {allProposals.length > 0 ? (
              allProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="proposal-item my-3 flex flex-col gap-1 rounded border border-neutral-600 bg-black p-5 hover:bg-neutral-900"
                >
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row items-center gap-4">
                        <h2 className="mb-0 text-xl font-bold">{proposal.title}</h2>
                        <p>{proposal.status}</p>
                      </div>
                      <p>Category: {proposal.mri}</p>
                    </div>
                    <Button
                      type="link"
                      className="text-blue-500 underline"
                      onClick={() => fetchProposalDetails(proposal.id)}
                    >
                      Manage Proposal & Bids
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p>No proposals found for this wallet.</p>
            )}
          </>
        ) : (
          <p>No categories assigned to this wallet.</p>
        )}
      </div>

      {/* Modal for displaying proposal details */}
      <Modal
        title={selectedProposal ? selectedProposal.title : 'Proposal Details'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedProposal && (
          <>
            <div className="flex flex-row items-center gap-4">
              <Select
                value={selectedProposal.status}
                onChange={(value) => handleUpdateStatus(selectedProposal.id, value)}
                style={{ width: 200 }}
                disabled={updating}
              >
                <Option value="open">Open</Option>
                <Option value="closed">Closed</Option>
                <Option value="archived">Archived</Option>
              </Select>
            </div>

            <h3 className="mt-4 text-xl font-semibold">Description:</h3>
            <div className="markdown-body text-sm text-gray-300">
              <ReactMarkdown>{selectedProposal.description}</ReactMarkdown>
            </div>

            <h3 className="mt-4 text-xl font-semibold">Deliverables:</h3>
            <ul className="markdown-body">
              {selectedProposal.deliverables.map((deliverable) => (
                <li key={deliverable.id} className="mt-2">
                  <ReactMarkdown>{deliverable.description}</ReactMarkdown>
                </li>
              ))}
            </ul>

            <h3 className="mb-2 mt-4 text-xl font-semibold">Comments:</h3>
            <ul className="markdown-body">
              {selectedProposal.comments?.map(
                (
                  comment, // Add optional chaining
                ) => (
                  <li key={comment.id} className="mt-2">
                    <strong>{comment.user.name}:</strong> {comment.text}
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </li>
                ),
              )}
            </ul>

            <TextArea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a comment..."
              rows={3}
            />
            <Button
              type="primary"
              className="mt-2"
              onClick={handleCommentSubmit}
              disabled={updating}
            >
              Submit Comment
            </Button>

            <h3 className="my-6 text-2xl font-semibold">Submitted Bids</h3>
            {bidForms.length > 0 ? (
              bidForms.map((bid) => (
                <div key={bid.id} className="mb-6 rounded-lg border border-gray-600 p-4">
                  <h4 className="mb-1 font-semibold">
                    Bid by {bid.user.name || bid.user.githubUsername}
                  </h4>
                  <Select
                    value={bid.status}
                    onChange={(value) => handleUpdateBidStatus(bid.id, value)}
                    style={{ width: 200 }}
                    disabled={updating}
                  >
                    <Option value="pending">pending</Option>
                    <Option value="approved">approved</Option>
                    <Option value="denied">denied</Option>
                  </Select>

                  <h5 className="mt-2 font-semibold">Deliverables:</h5>
                  <ul className="markdown-body">
                    {bid.deliverables.map((deliverable) => (
                      <li key={deliverable.deliverableDescription} className="mt-2">
                        <div className="flex flex-col">
                          <strong>Bid for weights description:</strong>
                          <ReactMarkdown>{deliverable.deliverableDescription}</ReactMarkdown>
                        </div>
                        <div className="mt-2 flex flex-col">
                          <strong>End of month deliverables:</strong>
                          <ReactMarkdown>{deliverable.description}</ReactMarkdown>
                        </div>
                        <div className="mt-2 flex flex-col">
                          <strong>Weights Requested:</strong>
                          <span>{deliverable.weightsRequested}</span>
                        </div>
                        <div className="mt-2 flex flex-col">
                          <strong>Minimum Weights Time:</strong>
                          <span>{deliverable.minimumWeightsTime}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <h5 className="mt-2 font-semibold">Comments:</h5>
                  <ul className="markdown-body">
                    {bid.comments?.map(
                      (
                        comment, // Add optional chaining
                      ) => (
                        <li key={comment.id} className="mt-2">
                          <strong>{comment.user.name}:</strong> {comment.text}
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </li>
                      ),
                    )}
                  </ul>

                  <TextArea
                    value={bidComment}
                    onChange={(e) => setBidComment(e.target.value)}
                    placeholder="Leave a comment on this bid..."
                    rows={3}
                  />
                  <Button
                    type="primary"
                    className="mt-2"
                    onClick={() => handleBidCommentSubmit(bid.id)}
                    disabled={updating}
                  >
                    Submit Comment
                  </Button>
                </div>
              ))
            ) : (
              <p>No bids have been submitted yet.</p>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
