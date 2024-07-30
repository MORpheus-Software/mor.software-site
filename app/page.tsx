import Image from "next/image";

export default function Welcome() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Logo */}
      <Image
        src="/mor-big.svg"
        priority
        alt="Morepheus"
        width={500}
        height={500}
      />

      {/* Title */}
      <div className="flex flex-col items-center mb-5">
        <h1 className="text-4xl">MOR.Software</h1>
        <p className="text-sm italic font-semibold">Open Source For The Win</p>
      </div>
    </div>
  );
}
