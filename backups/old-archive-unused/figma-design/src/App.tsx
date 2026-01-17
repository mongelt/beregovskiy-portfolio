import { useState } from 'react';
import { Header } from './components/Header';
import { BarrelSidebar } from './components/BarrelSidebar';
import { ContentArea } from './components/ContentArea';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex flex-col font-['Space_Grotesk']">
      {/* Header Section */}
      <Header isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden pb-24">
        {/* Barrel Sidebar - 25% - Fixed, no scroll */}
        <div className="w-[25%] flex items-center px-6 overflow-hidden">
          <BarrelSidebar />
        </div>

        {/* Content Viewing Area - 75% - Scrollable */}
        <div className="w-[75%] p-8 pl-16 overflow-y-auto overflow-x-hidden">
          <ContentArea />
        </div>
      </div>

      {/* Bottom Navigation - Fixed */}
      <BottomNav />
    </div>
  );
}
