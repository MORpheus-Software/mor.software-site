import { signIn } from "next-auth/react"; // Use the correct import

const SignIn = () => {
  const handleSignIn = async (event: any) => {
    event.preventDefault();
    await signIn("github");
  };

  return (
    <form
      onSubmit={handleSignIn}
      className="w-auto flex mb-0 justify-end items-center gap-2"
    >
      <button type="submit" className="!h-[42px] rounded-none">
        GitHub Sign In
      </button>
    </form>
  );
};

export default SignIn;
