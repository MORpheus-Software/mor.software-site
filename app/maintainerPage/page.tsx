'use client';
import { Select, Button, Modal, Input, DatePicker } from 'antd';
import { useAccount } from 'wagmi';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import { exportData } from '@/lib/server';
import { revalidatePath } from 'next/cache';
import moment from 'moment';
import dayjs, { Dayjs } from 'dayjs'; // Import Dayjs for date handling

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface Proposal {
  id: number;
  title: string;
  description: string;
  mri: string;
  status: string;
  deliverables: Deliverable[];
  comments?: ProposalComment[];
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

interface JobForm {
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
  comments?: JobFormComment[];
}

interface JobFormComment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface StandaloneJobForm {
  id: string;
  githubUsername: string;
  email: string;
  description: string;
  deliverables: string;
  weightsRequested: string;
  minimumWeightsTime: number;
  status: string;
}

interface ProofContribution {
  id: string;
  githubUsername: string;
  email: string;
  walletAddress: string;
  description: string;
  weightsAgreed: string;
  linksToProof: string;
}

interface Category {
  id: number;
  name: string;
  proposals: Proposal[];
  standaloneJobForm: StandaloneJobForm[];
  proofContribution: ProofContribution[];
}

export default function MaintainerPage() {
  const { address, isConnected } = useAccount();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [jobForms, setJobForms] = useState<JobForm[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');
  const [jobComments, setJobComments] = useState<{ [key: number]: string }>({});

  const [timeframe, setTimeframe] = useState<[Dayjs, Dayjs] | null>(null); // Use Dayjs type here
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [type, setType] = useState('proofContribution');
  const [isPending, startTransition] = useTransition();
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);

  useEffect(() => {
    if (address && isConnected) {
      fetchCategories();
    }
  }, [address, isConnected]);

  const handleExport = async () => {
    if (!timeframe) {
      toast.error('Please select a timeframe.');
      return;
    }
    const startDate = timeframe[0].toISOString();
    const endDate = timeframe[1].toISOString();

    try {
      // Call the server function from lib.ts to get the CSV string
      const csvString = await exportData(type, startDate, endDate, selectedCategories);

      // Create a Blob from the CSV string
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      // Revalidate the path to update the UI with fresh data
      // startTransition(() => {
      //   revalidatePath('/maintainerPage'); // Adjust path as needed
      // });

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error exporting data.');
    }
  };

  // Fetch categories associated with the maintainer's wallet address
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

  // Fetch proposal details including job forms
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

  // Update proposal status
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

  // Update job form status
  const handleUpdateJobStatus = async (jobFormId: number, status: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/jobForm', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: jobFormId,
          status,
          username: '',
          walletAddress: address,
        }),
      });

      if (response.ok) {
        fetchProposalDetails(selectedProposal?.id || 0); // Refresh the proposal details after update
        toast.success('JobForm status updated successfully!');
      } else {
        toast.error('Failed to update JobForm status.');
      }
    } catch (error) {
      console.error('Error updating JobForm status:', error);
      toast.error('Failed to update JobForm status.');
    } finally {
      setUpdating(false);
    }
  };

  // Submit a comment on a proposal
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

  // Submit a comment on a job form
  const handleJobCommentSubmit = async (jobFormId: number) => {
    try {
      const response = await fetch('/api/jobForm/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobFormId,
          text: jobComments[jobFormId] || '',
          walletAddress: address,
        }),
      });

      if (response.ok) {
        toast.success('Comment added to job form successfully!');
        setJobComments((prev) => ({ ...prev, [jobFormId]: '' }));
        fetchProposalDetails(selectedProposal?.id || 0); // Refresh proposal details
      } else {
        toast.error('Failed to add comment to job form.');
      }
    } catch (error) {
      console.error('Error adding comment to job form:', error);
      toast.error('Failed to add comment to job form.');
    }
  };

  // Close the proposal modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedProposal(null);
    setJobForms([]);
  };

  return (
    <div className="maintainer-page">
      <div className="mx col-span-12 max-w-3xl rounded-2xl border border-borderTr bg-morBg p-4 shadow sm:mx-auto sm:p-6">
        <Button type="primary" onClick={() => setIsExportModalVisible(true)}>
          Export Data
        </Button>

        <Modal
          title="Export Data"
          open={isExportModalVisible}
          onCancel={() => setIsExportModalVisible(false)}
          footer={null}
        >
          <Select value={type} onChange={setType} style={{ width: '100%', marginBottom: 20 }}>
            <Option value="proofContribution">Proof Contributions</Option>
            <Option value="standaloneJobForm">Standalone Job Forms</Option>
            <Option value="proposals">Proposals</Option>
          </Select>

          <RangePicker
            value={timeframe}
            onChange={(dates) => setTimeframe(dates as [Dayjs, Dayjs] | null)} // Ensure proper Dayjs handling
            style={{ width: '100%', marginBottom: 20 }}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />

          <Select
            mode="multiple"
            placeholder="Select Categories"
            value={selectedCategories}
            onChange={setSelectedCategories}
            style={{ width: '100%', marginBottom: 20 }}
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            onClick={handleExport}
            disabled={isPending || !timeframe || selectedCategories.length === 0}
          >
            {isPending ? 'Exporting...' : 'Export Data'}
          </Button>
        </Modal>

        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.id} className="category-section my-6">
              <h2 className="text-2xl font-bold">{category.name}</h2>

              {/* Proposals Section */}
              <h3 className="mt-4 text-xl font-semibold">Proposals:</h3>
              {category.proposals.length > 0 ? (
                category.proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="proposal-item my-3 flex flex-col gap-1 rounded border border-neutral-600 bg-black p-5 hover:bg-neutral-900"
                  >
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-row items-center gap-4">
                          <h4 className="mb-0 text-xl font-bold">{proposal.title}</h4>
                          <p>{proposal.status}</p>
                        </div>
                        <p>Category: {proposal.mri}</p>
                      </div>
                      <Button
                        type="link"
                        className="text-blue-500 underline"
                        onClick={() => fetchProposalDetails(proposal.id)}
                      >
                        Manage Proposal & Jobs
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No proposals available.</p>
              )}

              {/* Standalone Jobs Section */}
              <h3 className="mt-4 text-xl font-semibold">Standalone Jobs:</h3>
              {category.standaloneJobForm.length > 0 ? (
                category.standaloneJobForm.map((job) => (
                  <div
                    key={job.id}
                    className="job-item my-3 rounded border border-neutral-600 bg-gray-800 p-4"
                  >
                    <p>Author: {job.githubUsername}</p>
                    <p>Email: {job.email}</p>
                    <p>Description: {job.description}</p>
                    <p>Requested Weights: {job.weightsRequested}</p>
                    <p>Minimum Weights Time: {job.minimumWeightsTime}</p>
                    <p>Status: {job.status}</p>
                  </div>
                ))
              ) : (
                <p>No standalone jobs available in this category.</p>
              )}

              {/* Proof Contributions Section */}
              <h3 className="mt-4 text-xl font-semibold">Proof Contributions:</h3>
              {category.proofContribution.length > 0 ? (
                category.proofContribution.map((proof) => (
                  <div
                    key={proof.id}
                    className="proof-item my-3 rounded border border-neutral-600 bg-gray-800 p-4"
                  >
                    <p>Author: {proof.githubUsername}</p>
                    <p>Email: {proof.email}</p>
                    <p>Description: {proof.description}</p>
                    <p>Weights Agreed: {proof.weightsAgreed}</p>
                    <p>Link to Proof: {proof.linksToProof}</p>
                  </div>
                ))
              ) : (
                <p>No proof contributions available in this category.</p>
              )}
            </div>
          ))
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
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="denied">Denied</Option>
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
              {selectedProposal.comments?.map((comment) => (
                <li key={comment.id} className="mt-2">
                  <strong>{comment.user.name}:</strong> {comment.text}
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
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

            <h3 className="my-6 text-2xl font-semibold">Attached Jobs</h3>
            {jobForms.length > 0 ? (
              jobForms.map((job) => (
                <div key={job.id} className="mb-6 rounded-lg border border-gray-600 p-4">
                  <h4 className="mb-1 font-semibold">
                    Job by {job.user.name || job.user.githubUsername}
                  </h4>
                  <Select
                    value={job.status}
                    onChange={(value) => handleUpdateJobStatus(job.id, value)}
                    style={{ width: 200 }}
                    disabled={updating}
                  >
                    <Option value="pending">Pending</Option>
                    <Option value="approved">Approved</Option>
                    <Option value="denied">Denied</Option>
                  </Select>

                  <h5 className="mt-2 font-semibold">Deliverables:</h5>
                  <ul className="markdown-body">
                    {job.deliverables.map((deliverable) => (
                      <li key={deliverable.deliverableDescription} className="mt-2">
                        <div className="flex flex-col">
                          <strong>Job for weights description:</strong>
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
                    {job.comments?.map((comment) => (
                      <li key={comment.id} className="mt-2">
                        <strong>{comment.user.name}:</strong> {comment.text}
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <TextArea
                    value={jobComments[job.id] || ''}
                    onChange={(e) =>
                      setJobComments((prev) => ({ ...prev, [job.id]: e.target.value }))
                    }
                    placeholder="Leave a comment on this job..."
                    rows={3}
                  />
                  <Button
                    type="primary"
                    className="mt-2"
                    onClick={() => handleJobCommentSubmit(job.id)}
                    disabled={updating}
                  >
                    Submit Comment
                  </Button>
                </div>
              ))
            ) : (
              <p>No jobs have been submitted yet.</p>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
