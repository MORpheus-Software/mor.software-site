import React from 'react';
import { Modal, Select, Button, Input } from 'antd';
import ReactMarkdown from 'react-markdown';
import { Proposal, JobForm } from './types'; // Adjust the import path as necessary
import JobFormItem from './JobFormItem';
import CommentSection from './CommentSection';

const { Option } = Select;
const { TextArea } = Input;

interface ProposalModalProps {
  isVisible: boolean;
  onClose: () => void;
  proposal: Proposal | null;
  jobForms: JobForm[];
  updating: boolean;
  comment: string;
  setComment: (value: string) => void;
  handleCommentSubmit: () => void;
  handleUpdateStatus: (proposalId: number, status: string) => void;
  handleUpdateJobStatus: (jobFormId: number, status: string) => void;
  handleJobCommentSubmit: (jobFormId: number) => void;
  jobComments: { [key: number]: string };
  setJobComments: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>;
}

const ProposalModal: React.FC<ProposalModalProps> = ({
  isVisible,
  onClose,
  proposal,
  jobForms,
  updating,
  comment,
  setComment,
  handleCommentSubmit,
  handleUpdateStatus,
  handleUpdateJobStatus,
  handleJobCommentSubmit,
  jobComments,
  setJobComments,
}) => {
  return (
    <Modal
      title={proposal ? proposal.title : 'Proposal Details'}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {proposal && (
        <>
          <div className="flex flex-row items-center gap-4">
            <Select
              value={proposal.status}
              onChange={(value) => handleUpdateStatus(proposal.id, value)}
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
            <ReactMarkdown>{proposal.description}</ReactMarkdown>
          </div>

          <h3 className="mt-4 text-xl font-semibold">Deliverables:</h3>
          <ul className="markdown-body">
            {proposal.deliverables.map((deliverable) => (
              <li key={deliverable.id} className="mt-2">
                <ReactMarkdown>{deliverable.description}</ReactMarkdown>
              </li>
            ))}
          </ul>

          <CommentSection
            comments={proposal.comments}
            comment={comment}
            setComment={setComment}
            handleCommentSubmit={handleCommentSubmit}
            updating={updating}
          />

          <h3 className="my-6 text-2xl font-semibold">Attached Jobs</h3>
          {jobForms.length > 0 ? (
            jobForms.map((job) => (
              <JobFormItem
                key={job.id}
                job={job}
                updating={updating}
                handleUpdateJobStatus={handleUpdateJobStatus}
                handleJobCommentSubmit={handleJobCommentSubmit}
                jobComment={jobComments[job.id] || ''}
                setJobComment={(value) => setJobComments((prev) => ({ ...prev, [job.id]: value }))}
              />
            ))
          ) : (
            <p>No jobs have been submitted yet.</p>
          )}
        </>
      )}
    </Modal>
  );
};

export default ProposalModal;
