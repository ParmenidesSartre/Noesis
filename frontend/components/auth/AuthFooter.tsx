interface AuthFooterProps {
  text: string;
}

export function AuthFooter({ text }: AuthFooterProps) {
  return (
    <p className="text-center text-xs text-slate-500 font-medium px-4">
      {text}
    </p>
  );
}
