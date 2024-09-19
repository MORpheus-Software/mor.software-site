export interface Proposal {
  id: number;
  title: string;
  description: string;
  mri: string;
  status: string;
  deliverables: Deliverable[];
  comments?: ProposalComment[];
}

export interface ProposalComment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export interface Deliverable {
  id: number;
  description: string;
}

export interface JobForm {
  id: number;
  user: {
    name: string;
    githubUsername: string;
  };
  deliverables: {
    deliverableDescription: string;
    description: string;
    weightsRequested: number;
    minimumWeightsTime: number;
  }[];
  status: string;
  comments?: JobFormComment[];
}

export interface JobFormComment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export interface StandaloneJobComment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export interface StandaloneJobForm {
  id: string;
  githubUsername: string;
  email: string;
  description: string;
  deliverables: string;
  weightsRequested: string;
  minimumWeightsTime: number;
  status: string;
  comments?: StandaloneJobComment[];
}

// export interface ProofContribution {
//   id: string;
//   githubUsername: string;
//   email: string;
//   walletAddress: string;
//   description: string;
//   weightsAgreed: string;
//   linksToProof: string;
// }

// export interface ProofContribution {
//   id: string;
//   githubUsername: string;
//   email: string;
//   walletAddress: string;
//   description: string;
//   weightsAgreed: string;
//   linksToProof: string;
//   status: string;
//   comments?: ProofContributionComment[];
// }

// export interface ProofContributionComment {
//   id: string;
//   text: string;
//   createdAt: string;
//   user: {
//     name: string;
//   };
// }
// types.ts
export interface ProofContribution {
  id: string;
  githubUsername: string;
  walletAddress: string;
  email: string;
  mriNumber: string;
  linksToProof: string;
  weightsAgreed: string;
  description: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  status: string;
  comments?: ProofContributionComment[];
}

export interface ProofContributionComment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
  };
}


export interface Category {
  id: number;
  name: string;
  proposals: Proposal[];
  standaloneJobForm: StandaloneJobForm[];
  proofContribution: ProofContribution[];
}