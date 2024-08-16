


export default function Button({
  text,
  buttonType = "button",
  onClick,
}: {
  text: string;
  buttonType?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={buttonType}
      className="px-3 py-2 bg-[#179c65] rounded font-semibold text-sm hover:bg-[#127d51] sm:text-base sm:px-5 sm:py-2"
      onClick={onClick}
    >
      {text}
    </button>
  );
}
