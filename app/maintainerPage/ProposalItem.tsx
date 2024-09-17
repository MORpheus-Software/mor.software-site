import React from 'react';
import { Proposal } from './types'; // Adjust the import path as necessary
import { Button } from 'antd';

interface ProposalItemProps {
  proposal: Proposal;
  fetchProposalDetails: (proposalId: number) => void;
}

const ProposalItem: React.FC<ProposalItemProps> = ({ proposal, fetchProposalDetails }) => {
  return (
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
  );
};

export default ProposalItem;
