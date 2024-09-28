// StandaloneJobItem.tsx
import React from 'react';
import { StandaloneJobForm } from './types';
import { Button } from 'antd';

interface StandaloneJobItemProps {
  job: StandaloneJobForm;
  onClick: () => void;
}

const StandaloneJobItem: React.FC<StandaloneJobItemProps> = ({ job, onClick }) => {
  return (
    <div
      key={job.id}
      className="proposal-item my-3 flex flex-col gap-1 rounded border border-neutral-600 bg-black p-5 hover:bg-neutral-900"
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-4">
            <h4 className="mb-0 text-xl font-bold">By {job.githubUsername}</h4>
            <p>Status: {job.status}</p>
          </div>
          <p>Created: {new Date(job.createdAt).toLocaleString()}</p>
        </div>
        <Button type="link" className="text-blue-500 underline" onClick={onClick}>
          Manage Standalone Jobs
        </Button>
      </div>
    </div>

    // <div
    //   key={job.id}
    //   className="job-item my-3 cursor-pointer rounded border border-neutral-600 bg-gray-800 p-4"
    //   onClick={onClick}
    // >
    //   <p>Author: {job.githubUsername}</p>
    //   <p>Email: {job.email}</p>
    //   <p>Description: {job.description}</p>
    //   <p>Requested Weights: {job.weightsRequested}</p>
    //   <p>Minimum Weights Time: {job.minimumWeightsTime}</p>
    //   <p>Status: {job.status}</p>
    // </div>
  );
};

export default StandaloneJobItem;
