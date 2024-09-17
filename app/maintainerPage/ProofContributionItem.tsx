import React from 'react';
import { ProofContribution } from './types'; // Adjust the import path as necessary

interface ProofContributionItemProps {
  proof: ProofContribution;
}

const ProofContributionItem: React.FC<ProofContributionItemProps> = ({ proof }) => {
  return (
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
  );
};

export default ProofContributionItem;
