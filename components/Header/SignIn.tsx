import { signIn } from 'next-auth/react'; // Use the correct import

const SignIn = () => {
  const handleSignIn = async (event: any) => {
    event.preventDefault();
    await signIn('github');
  };

  return (
    <form onSubmit={handleSignIn} className="mb-0 flex w-auto items-center justify-end gap-2">
      <button type="submit" className="!h-[42px] rounded-none">
        GitHub Sign In
      </button>
    </form>
  );
};

export default SignIn;
