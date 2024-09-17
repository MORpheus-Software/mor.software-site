// CategorySection.tsx
import React from 'react';
import { Category } from './types';
import ProposalItem from './ProposalItem';
import StandaloneJobItem from './StandaloneJobItem';
import ProofContributionItem from './ProofContributionItem';

interface CategorySectionProps {
  category: Category;
  fetchProposalDetails: (proposalId: number) => void;
  fetchStandaloneJobDetails: (jobId: string) => void;
  fetchProofContributionDetails: (proofId: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  fetchProposalDetails,
  fetchStandaloneJobDetails,
  // fetchProofContributionDetails,
}) => {
  return (
    <div className="category-section my-6">
      <h2 className="text-2xl font-bold">{category.name}</h2>

      {/* Proposals Section */}
      <h3 className="mt-4 text-xl font-semibold">Proposals:</h3>
      {category.proposals.length > 0 ? (
        category.proposals.map((proposal) => (
          <ProposalItem
            key={proposal.id}
            proposal={proposal}
            fetchProposalDetails={fetchProposalDetails}
          />
        ))
      ) : (
        <p>No proposals available.</p>
      )}

      {/* Standalone Jobs Section */}
      <h3 className="mt-4 text-xl font-semibold">Standalone Jobs:</h3>
      {category.standaloneJobForm.length > 0 ? (
        category.standaloneJobForm.map((job) => (
          <StandaloneJobItem
            key={job.id}
            job={job}
            onClick={() => fetchStandaloneJobDetails(job.id)}
          />
        ))
      ) : (
        <p>No standalone jobs available in this category.</p>
      )}

      {/* Proof Contributions Section */}
      <h3 className="mt-4 text-xl font-semibold">Proof Contributions:</h3>
      {category.proofContribution.length > 0 ? (
        category.proofContribution.map((proof) => (
          <ProofContributionItem
            key={proof.id}
            proof={proof}
            // onClick={() => fetchProofContributionDetails(proof.id)}
          />
        ))
      ) : (
        <p>No proof contributions available in this category.</p>
      )}
    </div>
  );
};

export default CategorySection;
