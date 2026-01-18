import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  gradientClassName?: string; // opcional para la barrita de abajo
  iconBgClassName?: string;   // opcional para fondo del icono
  valueClassName?: string;    // opcional para color del número
};

export default function StatCard({
  icon,
  label,
  value,
  gradientClassName = "bg-gradient-to-r from-blue-500 to-indigo-500",
  iconBgClassName = "bg-slate-100",
  valueClassName = "text-slate-900",
}: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBgClassName} p-3 rounded-xl`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-slate-600 text-sm font-medium mb-1">{label}</p>
          <p className={`text-4xl font-bold ${valueClassName}`}>{value}</p>
        </div>
      </div>
      <div className={`h-1 rounded-full mt-4 ${gradientClassName}`} />
    </div>
  );
}
