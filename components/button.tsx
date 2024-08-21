export default function Button({
  text,
  buttonType = 'button',
  onClick,
}: {
  text: string;
  buttonType?: 'submit' | 'button';
  onClick?: () => void;
}) {
  return (
    <button
      type={buttonType}
      className="rounded bg-[#179c65] px-3 py-2 text-sm font-semibold hover:bg-[#127d51] sm:px-5 sm:py-2 sm:text-base"
      onClick={onClick}
    >
      {text}
    </button>
  );
}
