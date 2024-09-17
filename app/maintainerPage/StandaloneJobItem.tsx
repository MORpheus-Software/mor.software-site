// StandaloneJobItem.tsx
import React from 'react';
import { StandaloneJobForm } from './types';

interface StandaloneJobItemProps {
  job: StandaloneJobForm;
  onClick: () => void;
}

const StandaloneJobItem: React.FC<StandaloneJobItemProps> = ({ job, onClick }) => {
  return (
    <div
      key={job.id}
      className="job-item my-3 cursor-pointer rounded border border-neutral-600 bg-gray-800 p-4"
      onClick={onClick}
    >
      <p>Author: {job.githubUsername}</p>
      <p>Email: {job.email}</p>
      <p>Description: {job.description}</p>
      <p>Requested Weights: {job.weightsRequested}</p>
      <p>Minimum Weights Time: {job.minimumWeightsTime}</p>
      <p>Status: {job.status}</p>
    </div>
  );
};

export default StandaloneJobItem;
