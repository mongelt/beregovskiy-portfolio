import { X } from 'lucide-react';

const navItems = [
  { label: 'RESUME', active: false },
  { label: 'PORTFOLIO', active: false },
  { label: 'DOWNLOADS', active: false },
  { label: 'COLLECTION', active: true, hasClose: true },
];

export function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-[#0f1419] z-50">
      <div className="flex items-center justify-center gap-12 py-6">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`flex items-center gap-2 tracking-wider transition-colors ${
              item.active ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span>{item.label}</span>
            {item.hasClose && <X size={16} className="text-red-400" />}
          </button>
        ))}
      </div>
    </div>
  );
}
