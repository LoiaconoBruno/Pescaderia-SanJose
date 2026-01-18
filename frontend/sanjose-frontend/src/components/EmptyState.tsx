import { Package } from "lucide-react";

type Props = {
  onAdd: () => void;
};

export default function EmptyState({ onAdd }: Props) {
  return (
    <div className="p-12 text-center">
      <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-10 h-10 text-blue-600" />
      </div>
      <p className="text-slate-500 mb-4 text-lg">No hay productos registrados</p>
      <button
        onClick={onAdd}
        className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
      >
        Crear el primer producto →
      </button>
    </div>
  );
}
