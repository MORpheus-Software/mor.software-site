import React from 'react';
import { ProofContribution } from './types'; // Adjust the import path as necessary
import { Button } from 'antd';

interface ProofContributionItemProps {
  proof: ProofContribution;
  onClick: () => void;
}

const ProofContributionItem: React.FC<ProofContributionItemProps> = ({ proof, onClick }) => {
  return (
    <div
      key={proof.id}
      className="proposal-item my-3 flex flex-col gap-1 rounded border border-neutral-600 bg-black p-5 hover:bg-neutral-900"
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-4">
            <h4 className="mb-0 text-xl font-bold">By {proof.githubUsername}</h4>
            <p> Status: {proof.status}</p>
          </div>
          <p>Created: {new Date(proof.createdAt).toLocaleString()}</p>
        </div>
        <Button type="link" className="text-blue-500 underline" onClick={onClick}>
          Manage Proof of Contribution
        </Button>
      </div>
    </div>
  );
};

export default ProofContributionItem;
