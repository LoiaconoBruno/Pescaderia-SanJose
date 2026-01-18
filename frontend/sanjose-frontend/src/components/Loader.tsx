type Props = {
  text?: string;
};

export default function Loader({ text = "Cargando..." }: Props) {
  return (
    <div className="p-12 text-center">
      <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-slate-500 text-lg">{text}</p>
    </div>
  );
}
