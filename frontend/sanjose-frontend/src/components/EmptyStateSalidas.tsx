import { TrendingDown } from "lucide-react";

type Props = {
  onAdd: () => void;
};

export default function EmptyStateSalidas({ onAdd }: Props) {
  return (
    <div className="p-12 text-center">
      <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <TrendingDown className="w-10 h-10 text-red-600" />
      </div>
      <p className="text-slate-500 mb-4 text-lg">No hay salidas registradas</p>
      <button
        onClick={onAdd}
        className="text-red-600 hover:text-red-700 font-semibold hover:underline"
      >
        Registrar la primera salida →
      </button>
    </div>
  );
}
