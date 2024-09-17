import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Deliverable } from './types'; // Adjust the import path as necessary

interface DeliverableListProps {
  deliverables: Deliverable[];
}

const DeliverableList: React.FC<DeliverableListProps> = ({ deliverables }) => {
  return (
    <ul className="markdown-body">
      {deliverables.map((deliverable) => (
        <li key={deliverable.id} className="mt-2">
          <ReactMarkdown>{deliverable.description}</ReactMarkdown>
        </li>
      ))}
    </ul>
  );
};

export default DeliverableList;
