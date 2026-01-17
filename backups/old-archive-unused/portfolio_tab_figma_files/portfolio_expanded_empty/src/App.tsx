import { ChevronDown } from "lucide-react";
import { Button } from "./components/ui/button";
import exampleImage from 'figma:asset/4aae44a55a5e8ff053bb631dce7bd3a46e610d6a.png';

export default function App() {
  return (
    <div className="min-h-screen bg-[#1a1d23] text-white flex flex-col">
      {/* Profile Section - Top ~33% */}
      <div className="h-[33vh] border-b border-gray-700 px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between">
          {/* Left side - Name and titles */}
          <div className="flex-shrink-0">
            <h1 className="text-white mb-2">ANDREY BEREGOVSKIY</h1>
            <p className="text-gray-400 text-sm mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-gray-400"></span>
              Washington, DC
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-300">Brand Journalist at Axway</p>
              <p className="text-gray-300">Correspondent at The LCB</p>
              <p className="text-gray-300">Editor at Ask a Pol</p>
              <p className="text-gray-300">Contributor at the Editorial Office</p>
            </div>
          </div>

          {/* Right side - Description */}
          <div className="max-w-md">
            <p className="text-gray-300 text-sm leading-relaxed">
              Incididunt consequat officia occaecat. Exercitation laborum tempor qui labore sunt tempor esse dolore reprehenderit minim. In et ex esse anim exercitation tempor. Exercitation magna aute nulla aliqua proident amet aliqua culpa minim cillum ipsum.
            </p>
          </div>
        </div>

        {/* Expand button */}
        <div className="max-w-7xl mx-auto mt-6 flex justify-center">
          <button className="flex items-center gap-2 text-[#00ff88] hover:text-[#00cc6a] transition-colors">
            EXPAND
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Section - Content Area */}
      <div className="flex-1 px-8 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          {/* Left Sidebar - Now top-aligned with selected on top */}
          <div className="flex-shrink-0 flex gap-12 items-start">
            {/* Column 1 */}
            <div className="space-y-3">
              <div className="text-[#00ff88]">Writing</div>
              <div className="text-gray-500">Video</div>
              <div className="text-gray-500">Photo</div>
              <div className="text-gray-500">Media</div>
              <div className="text-gray-500">Social Media</div>
            </div>
            
            {/* Column 2 */}
            <div className="space-y-3">
              <div className="text-[#00ff88]">Articles</div>
              <div className="text-gray-500">Academic</div>
              <div className="text-gray-500">Blogs</div>
              <div className="text-gray-500">Writegold</div>
            </div>
            
            {/* Column 3 */}
            <div className="space-y-3">
              <div className="text-[#00ff88]">Writing content three</div>
              <div className="text-gray-500">Blog number four</div>
              <div className="text-gray-500">Custom blog for people</div>
              <div className="text-gray-500">Sidebar content four</div>
            </div>
          </div>

          {/* Right Menu - Single column, same styling as left sidebar */}
          <div className="flex-shrink-0 space-y-3">
            <div className="text-gray-500">Collection 1</div>
            <div className="text-[#00ff88]">Collection 2</div>
            <div className="text-gray-500">Collection 3</div>
            <div className="text-gray-500">Collection 4</div>
            <div className="text-gray-500">Collection 5</div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Bottom ~10% */}
      <div className="h-[10vh] border-t border-gray-700 flex items-center justify-center">
        <div className="flex gap-8">
          <button className="text-[#00ff88] border-b-2 border-[#00ff88] pb-1">
            PORTFOLIO
          </button>
          <button className="text-gray-400 hover:text-white transition-colors pb-1">
            RESUME
          </button>
          <button className="text-gray-400 hover:text-white transition-colors pb-1">
            DOWNLOADS
          </button>
        </div>
      </div>
    </div>
  );
}