interface StrapiErrorsProps {
  message?: string | null;
  name?: string;
  status?: string | null;
}

export function StrapiErrors({ error }: { readonly error: StrapiErrorsProps }) {
  if (!error?.message) return null;
  return (
    <div className="py-2 text-sm italic text-pink-500">{error.message}</div>
  );
}
