import { architectureColors, type ArchitectureElement } from '../../data/onboarding-data';

export function ArchitectureCard({ element }: { element: ArchitectureElement }) {
  return (
    <div className={`p-5 rounded-2xl border-2 ${architectureColors[element.id]} transition-all hover:shadow-md hover:-translate-y-0.5 duration-200`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{element.icon}</span>
        <h3 className="text-lg font-bold tracking-tight">{element.name}</h3>
      </div>
      <p className="text-sm font-medium mb-1">{element.definition}</p>
      <p className="text-sm opacity-75 mb-3 leading-relaxed">{element.role}</p>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-start gap-2">
          <span className="font-semibold opacity-80">Location:</span>
          <code className="bg-white/40 dark:bg-black/20 px-2 py-0.5 rounded-lg">{element.location}</code>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-semibold opacity-80">Example:</span>
          <span className="opacity-75">{element.example}</span>
        </div>
      </div>
    </div>
  );
}
