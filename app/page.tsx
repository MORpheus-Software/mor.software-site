import Image from 'next/image';

export default function Welcome() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Logo */}
      <Image src="/mor-big.svg" priority alt="Morepheus" width={500} height={500} />

      {/* Title */}
      <div className="mb-5 flex flex-col items-center">
        <h1 className="text-4xl">MOR.Software</h1>
        <p className="text-sm font-semibold italic">Open Source For The Win</p>
        <p className="mt-4 w-full max-w-[500px] text-center text-base font-bold">
          Log in with Github to register as a Morpheus code contributor to earn MOR rewards.{' '}
        </p>
        <p className="mt-2 w-full max-w-[500px] text-center text-base font-semibold">
          {' '}
          New: You can now stake those rewards for a greater Power Factor reward.
        </p>
      </div>
    </div>
  );
}
