'use client';

import { useState } from 'react';
import MarkdownField from './MarkdownField';

export default function Deliverables() {
  const [numberOfDeliverables, setNumberOfDeliverables] = useState(1);

  const addDeliverable = () => {
    setNumberOfDeliverables((prev) => prev + 1);
  };

  return (
    <div className="w-full">
      {Array.from({ length: numberOfDeliverables }).map((_, index) => (
        <div key={index} className="-mt-7 flex flex-col">
          <MarkdownField
            id={`deliverable-${index}`}
            title={`Deliverable ${index + 1}`}
            desc="Describe the deliverable"
          />
        </div>
      ))}

      <button
        type="button"
        className="mb-3 cursor-pointer rounded bg-gray-800 p-2 px-5 font-semibold hover:bg-gray-700"
        onClick={addDeliverable}
      >
        Add Deliverable
      </button>
    </div>
  );
}
