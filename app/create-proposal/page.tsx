'use client';
import Link from 'next/link';
import Button from '../../components/button';
import { submitProposal } from './actions';
import { MarkdownField, SubmitButton, Deliverables } from './components';
import { notification } from 'antd';

export default function CreateProposal() {
  const handleFormSubmit = async (formData) => {
    const result = await submitProposal(formData);

    if (result.success) {
      notification.success({ message: result.message });
    } else {
      notification.error({ message: result.message });
    }
  };

  return (
    <div className="mx col-span-12 max-w-3xl rounded-2xl border border-borderTr bg-morBg p-4 shadow sm:mx-auto sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create MRC</h1>
        <Link href="/">
          <Button text="Go Back" />
        </Link>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          await handleFormSubmit(formData);
        }}
      >
        <div className="mt-5 flex flex-col gap-4">
          <label className="texg-xl mb-0 flex flex-col gap-2 text-white" htmlFor="title">
            Title
            <p className="my-0.5 mb-2 text-sm text-gray-400">MRI Title</p>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="mb-0 rounded border border-neutral-800 bg-black p-3 text-white focus:border-[#179c65] focus:outline-none"
            placeholder="Title"
            required
          />
        </div>

        <div className="mt-5 flex flex-col">
          <label className="texg-xl flex flex-col gap-2 text-white" htmlFor="mri">
            MRI Number{' '}
            <p className="my-0.5 mb-2 text-sm text-gray-400">
              To which MRI does this contribution belong?
            </p>
          </label>
          <select
            id="mri"
            name="mri"
            className="rounded border border-neutral-800 bg-black p-3 text-white placeholder-gray-500"
          >
            <option>Choose MRI</option>
            <option value="1 - Smart Contracts on Ethereum or Arbitrum">
              1 - Smart Contracts on Ethereum or Arbitrum
            </option>
            <option value="2 - Smart Agent Tools and Examples">
              2 - Smart Agent Tools and Examples
            </option>
            <option value="3 - Morpheus Local Install Desktop / Mobile">
              3 - Morpheus Local Install Desktop / Mobile
            </option>
            <option value="4 - TCM / MOR20 Token Standard for Fair Launches">
              4 - TCM / MOR20 Token Standard for Fair Launches
            </option>
            <option value="5 - Protection Fund">5 - Protection Fund</option>
            <option value="6 - Capital Proofs Extended beyond Lido stETH">
              6 - Capital Proofs Extended beyond Lido stETH
            </option>
            <option value="7 - Compute Proofs Morpheus / Lumerin">
              7 - Compute Proofs Morpheus / Lumerin
            </option>
            <option value="8 - Code Proofs & Dashboards">8 - Code Proofs & Dashboards</option>
            <option value="9 - Frontend Proofs & Examples">9 - Frontend Proofs & Examples</option>
            <option value="10 - Interoperability">10 - Interoperability</option>
          </select>
        </div>

        <MarkdownField
          id="description"
          title="Description"
          desc="Details of MRC in markdown format"
        />

        <Deliverables />
        <SubmitButton submitAction={handleFormSubmit} />
      </form>
    </div>
  );
}
