import React from 'react';
import { Select, Button, Input } from 'antd';
import ReactMarkdown from 'react-markdown';
import { JobForm } from './types'; // Adjust the import path as necessary
import CommentSection from './CommentSection';

const { Option } = Select;
const { TextArea } = Input;

interface JobFormItemProps {
  job: JobForm;
  updating: boolean;
  handleUpdateJobStatus: (jobFormId: number, status: string) => void;
  handleJobCommentSubmit: (jobFormId: number) => void;
  jobComment: string;
  setJobComment: (value: string) => void;
}

const JobFormItem: React.FC<JobFormItemProps> = ({
  job,
  updating,
  handleUpdateJobStatus,
  handleJobCommentSubmit,
  jobComment,
  setJobComment,
}) => {
  return (
    <div key={job.id} className="mb-6 rounded-lg border border-gray-600 p-4">
      <h4 className="mb-1 font-semibold">Job by {job.user.name || job.user.githubUsername}</h4>
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
        {job.deliverables
          .slice()
          .reverse()
          .map((deliverable) => (
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

      <CommentSection
        comments={job.comments}
        comment={jobComment}
        setComment={setJobComment}
        handleCommentSubmit={() => handleJobCommentSubmit(job.id)}
        updating={updating}
        placeholder="Leave a comment on this job..."
      />
    </div>
  );
};

export default JobFormItem;
