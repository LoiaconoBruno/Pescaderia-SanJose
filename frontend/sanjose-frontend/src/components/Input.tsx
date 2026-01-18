import type { InputHTMLAttributes } from "react";

type Props = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export default function Input({
  label,
  value,
  onChange,
  type = "text",
  ...props
}: Props) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
        {...props}
      />
    </div>
  );
}
