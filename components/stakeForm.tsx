// "use client";

// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import { useAccount } from "wagmi";
// import { signMessage } from "@wagmi/core";
// import { config } from "@/config";

// const StakeForm = () => {
//   const { data: session } = useSession();
//   const { address } = useAccount();
//   const [duration, setDuration] = useState(0);

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!address) {
//       alert("Please connect your wallet.");
//       return;
//     }

//     const message = `Sign this message to verify your address: ${address}`;
//     const signature = await signMessage(config, { message, account: address });

//     const response = await fetch("/api/stake", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         duration,
//         address,
//         userId: session?.user.id,
//         message,
//         signature,
//       }),
//     });

//     if (response.ok) {
//       alert("Staking submitted successfully!");
//     } else {
//       alert("Failed to submit staking.");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <label>
//         Duration (in days):
//         <input
//           type="number"
//           value={duration}
//           onChange={(e) => setDuration(parseInt(e.target.value))}
//         />
//       </label>
//       <button type="submit">Stake</button>
//     </form>
//   );
// };

// export default StakeForm;
