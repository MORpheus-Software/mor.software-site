import { ClaimLockContract } from "@/components/Main/claimLock";
import Image from "next/image";
import Link from "next/link";

// Main Page
// ========================================================
export default function ContractStaking() {
  // Render
  return (
    <div>
      <ClaimLockContract />
      <div className="mt-4 text-center">
        <h1 className="text-4xl">Power Factor Time Curve</h1>
        <p className="text-base font-bold max-w-[600px] w-full text-center mx-auto">
          From the Power Factor Time Curve, we can see that the Power Factor is
          a function locking a claim of MOR for a certain period of time. Please
          consult{" "}
          <Link
            href="https://github.com/MorpheusAIs/Docs/blob/main/!KEYDOCS%20README%20FIRST!/FAQs%20%26%20Guides/MOR%20Rewards%20Staking%20FAQ.md"
            legacyBehavior
          >
            <a
              className="text-blue-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Staking MOR Rewards FAQ
            </a>
          </Link>{" "}
          and{" "}
          <Link
            href="https://github.com/MorpheusAIs/MRC/blob/main/IN%20PROGRESS/MRC42.md"
            legacyBehavior
          >
            <a
              className="text-blue-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              MRC 42
            </a>
          </Link>{" "}
          for more information on the Power Factor Time Curve.
        </p>

        <Image
          src="/pfCurve.png"
          alt="Power Factor Time Curve"
          width={650}
          height={350}
          className="mt-2 text-base font-bold max-w-[650px] w-full text-center mx-auto"
        />
      </div>
    </div>
  );
}
