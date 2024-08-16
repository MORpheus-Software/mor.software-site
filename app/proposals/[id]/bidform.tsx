"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { notification } from "antd";
import { useSession } from "next-auth/react";
import { MarkdownField ,SubmitButton, Deliverables} from "@/app/create-proposal/components";

export default function BidForm({ proposalId, deliverables }: { proposalId: number, deliverables: Array<{ id: number, description: string }> }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
  
    const formData = new FormData(event.currentTarget);
    const deliverableDescriptions: any = {};
  
    deliverables.forEach((deliverable) => {
      const key = `deliverable-${deliverable.id}`;
      deliverableDescriptions[key] = formData.get(key);
    });
  
    try {
      const res = await fetch(`/api/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          githubUsername: formData.get("githubUsername"),
          email: formData.get("email"),
          description: formData.get("description"),
          deliverables: formData.get("deliverables"),
          weightsRequested: formData.get("weightsRequested"),
          walletAddress: formData.get("walletAddress"),
          minimumWeightsTime: formData.get("minimumWeightsTime"),
          proposalId,
          userId: session?.user?.id,
          ...deliverableDescriptions, // Include the deliverable descriptions
        }),
      });
  
      if (res.ok) {
        notification.success({ message: "Bid submitted successfully!" });
        router.push(`/proposals`);
      } else {
        notification.error({ message: "Failed to submit bid" });
      }
    } catch (error) {
      notification.error({ message: "An error occurred during submission" });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="col-span-12 p-4 mx sm:mx-auto sm:p-6 shadow bg-morBg rounded-2xl max-w-3xl border border-borderTr">
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="flex flex-col gap-4 mt-5">
          <label className="flex flex-col text-white texg-xl gap-2 mb-0" htmlFor="githubUsername">
            GitHub Username
            <input
              type="text"
              id="githubUsername"
              name="githubUsername"
              defaultValue={session?.user?.name || ""}
              readOnly
              required
              className="cursor-not-allowed bg-black text-white border border-neutral-800 p-3 rounded"
            />
          </label>
        </div>

        <div className="flex flex-col gap-4 mt-5">
          <label className="flex flex-col text-white texg-xl gap-2 mb-0" htmlFor="email">
            Email
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={session?.user?.name || ""}
              readOnly
              required
              className="cursor-not-allowed bg-black text-white border border-neutral-800 p-3 rounded"
            />
          </label>
        </div>

        <MarkdownField
          id="description"
          title="Description of Contribution"
          desc="Please describe your contribution in detail."
          // required
        />

        <MarkdownField
          id="deliverables"
          title="End of Month Deliverables"
          desc="Please state your deliverables."
          // required
        />

        <div className="flex flex-col gap-4 mt-5">
          <label className="flex flex-col text-white texg-xl gap-2 mb-0" htmlFor="weightsRequested">
            Weights Requested
            <input
              type="number"
              id="weightsRequested"
              name="weightsRequested"
              min={1}
              required
              className="bg-black text-white border border-neutral-800 p-3 rounded"
            />
          </label>
        </div>

        <div className="flex flex-col gap-4 mt-5">
          <label className="flex flex-col text-white texg-xl gap-2 mb-0" htmlFor="walletAddress">
            Wallet Address
            <input
              type="text"
              id="walletAddress"
              name="walletAddress"
              required
              className="bg-black text-white border border-neutral-800 p-3 rounded"
            />
          </label>
        </div>

        <div className="flex flex-col gap-4 mt-5">
          <label className="flex flex-col text-white texg-xl gap-2 mb-0" htmlFor="minimumWeightsTime">
            Minimum Weights Time
            <input
              type="number"
              id="minimumWeightsTime"
              name="minimumWeightsTime"
              min={1}
              required
              className="bg-black text-white border border-neutral-800 p-3 rounded"
            />
          </label>
        </div>

        {deliverables.map((deliverable) => (
          <MarkdownField
            key={deliverable.id}
            id={`deliverable-${deliverable.id}`}
            title={`Deliverable: ${deliverable.description}`}
            desc="Describe your contribution to this deliverable."
            // required
          />
        ))}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white p-3 rounded mt-5"
        >
          {loading ? "Submitting..." : "Submit Bid"}
        </button>
      </form>
    </div>
  );
}
