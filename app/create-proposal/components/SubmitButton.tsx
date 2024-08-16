"use client";

import { useFormStatus } from "react-dom";
import { signIn, useSession } from "next-auth/react";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  const { data: session } = useSession();

  const handleSignInAndSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!session) {
      event.preventDefault();
      await signIn("github");
    }
  };

  return (
    <button
      className="min-w-fit mt-2 px-5 py-2 bg-[#179c65] rounded font-semibold hover:bg-[#127d51]"
      type="submit"
      disabled={pending}
      onClick={handleSignInAndSubmit}
    >
      {pending ? <span>Creating ...</span> : <span>{session ? "Create Proposal" : "Sign in with GitHub"}</span>}
    </button>
  );
}
