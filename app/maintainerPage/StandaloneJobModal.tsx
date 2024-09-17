import React from 'react';
import { Modal, Select, Button, Input } from 'antd';
import ReactMarkdown from 'react-markdown';
import { StandaloneJobForm, StandaloneJobComment } from './types';
import CommentSection from './CommentSection';

const { Option } = Select;
const { TextArea } = Input;

interface StandaloneJobModalProps {
  isVisible: boolean;
  onClose: () => void;
  job: StandaloneJobForm | null;
  updating: boolean;
  comment: string;
  setComment: (value: string) => void;
  handleCommentSubmit: () => void;
  handleUpdateStatus: (jobId: string, status: string) => void;
}

const StandaloneJobModal: React.FC<StandaloneJobModalProps> = ({
  isVisible,
  onClose,
  job,
  updating,
  comment,
  setComment,
  handleCommentSubmit,
  handleUpdateStatus,
}) => {
  console.log(job, 'vss');

  return (
    <Modal
      title={job ? `Standalone Job by ${job.githubUsername}` : 'Standalone Job Details'}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {job && (
        <>
          <div className="flex flex-row items-center gap-4">
            <Select
              value={job.status}
              onChange={(value) => handleUpdateStatus(job.id, value)}
              style={{ width: 200 }}
              disabled={updating}
            >
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="denied">Denied</Option>
            </Select>
          </div>

          <h3 className="mt-4 text-xl font-semibold">Description:</h3>
          <div className="markdown-body text-sm text-black">
            <ReactMarkdown>{job.description}</ReactMarkdown>
          </div>

          <h3 className="mt-4 text-xl font-semibold">Deliverables:</h3>
          <div className="markdown-body text-sm text-black">
            <ReactMarkdown>{job.deliverables}</ReactMarkdown>
          </div>

          <p className="mt-2">
            <strong>Requested Weights:</strong> {job.weightsRequested}
          </p>
          <p>
            <strong>Minimum Weights Time:</strong> {job.minimumWeightsTime}
          </p>

          <CommentSection
            comments={job.comments}
            comment={comment}
            setComment={setComment}
            handleCommentSubmit={handleCommentSubmit}
            updating={updating}
          />
        </>
      )}
    </Modal>
  );
};

export default StandaloneJobModal;
