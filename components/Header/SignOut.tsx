import { signOut } from "next-auth/react"; // Use the correct import

const SignOut = () => {
  const handleSignOut = async (event: any) => {
    event.preventDefault();
    await signOut();
  };

  return (
    <form
      onSubmit={handleSignOut}
      className="w-auto mb-0 flex justify-end items-center"
    >
      <button type="submit" className="!h-[42px] rounded-none">
        Sign Out
      </button>
    </form>
  );
};

export default SignOut;
