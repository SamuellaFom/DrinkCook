import { InputHTMLAttributes } from "react";

type Props = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({ label, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={props.name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        {...props}
        className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className ?? ""}`}
      />
    </div>
  );
}

