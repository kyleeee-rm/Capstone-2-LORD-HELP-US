type Props = {
  message?: string;
};

export default function Error({ message = "Something went wrong" }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 p-8 text-center">
      <p className="text-sm text-error">{message}</p>
    </div>
  );
}
