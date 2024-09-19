import React from 'react';
import { Modal, Select, Button, Input } from 'antd';
import ReactMarkdown from 'react-markdown';
import { ProofContribution, ProofContributionComment } from './types';
import CommentSection from './CommentSection';

const { Option } = Select;
const { TextArea } = Input;

interface ProofContributionModalProps {
  isVisible: boolean;
  onClose: () => void;
  proof: ProofContribution | null;
  updating: boolean;
  comment: string;
  setComment: (value: string) => void;
  handleCommentSubmit: () => void;
  handleUpdateStatus: (proofId: string, status: string) => void;
}

const ProofContributionModal: React.FC<ProofContributionModalProps> = ({
  isVisible,
  onClose,
  proof,
  updating,
  comment,
  setComment,
  handleCommentSubmit,
  handleUpdateStatus,
}) => {
  return (
    <Modal
      title={proof ? `Proof Contribution by ${proof.githubUsername}` : 'Proof Contribution Details'}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {proof && (
        <>
          <div className="flex flex-row items-center gap-4">
            <Select
              value={proof.status}
              onChange={(value) => handleUpdateStatus(proof.id, value)}
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
            <ReactMarkdown>{proof.description}</ReactMarkdown>
          </div>

          <p className="mt-2">
            <strong>Weights Agreed:</strong> {proof.weightsAgreed}
          </p>
          <p>
            <strong>Links to Proof:</strong> {proof.linksToProof}
          </p>

          <CommentSection
            comments={proof.comments}
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

export default ProofContributionModal;
