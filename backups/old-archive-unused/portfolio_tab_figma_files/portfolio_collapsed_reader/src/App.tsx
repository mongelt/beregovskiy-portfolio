import { ChevronDown } from "lucide-react";
import { Button } from "./components/ui/button";
import exampleImage from 'figma:asset/4aae44a55a5e8ff053bb631dce7bd3a46e610d6a.png';

export default function App() {
  return (
    <div className="min-h-screen bg-[#1a1d23] text-white flex flex-col relative">
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
      <div className="flex-1 px-8 pt-3 pb-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-start h-full">
          {/* Left Sidebar - Now top-aligned with selected on top */}
          <div className="flex-shrink-0 flex gap-12 items-start">
            {/* Column 1 */}
            <div className="space-y-3">
              <div className="text-gray-500">Category</div>
            </div>
            
            {/* Column 2 */}
            <div className="space-y-3">
              <div className="text-gray-500">Subcategory</div>
            </div>
            
            {/* Column 3 */}
            <div className="space-y-3">
              <div className="text-[#00ff88]">Content item</div>
            </div>
          </div>

          {/* Editor.js Content Area */}
          <div className="flex-1 -ml-[2%] -mr-[20%] mt-[calc(45vh-33vh-3rem)]">
            <h1 className="text-gray-300 mb-2 text-3xl font-bold">Sample Heading 1 for Content Items</h1>
            <p className="text-gray-300 mb-4">Test subtitle for content items</p>
            <div className="w-full h-px bg-gray-700 mb-6"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Cupidatat occaecat labore aliqua laborum minim proident. Veniam commodo irure ea nostrud duis laborum deserunt. Laboris nisi adipisicing qui sunt ad veniam irure excepteur consectetur velit veniam.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-4">
              Cupidatat occaecat labore aliqua laborum minim proident. Veniam commodo irure ea nostrud duis laborum deserunt. Laboris nisi adipisicing qui sunt ad veniam irure excepteur consectetur velit veniam.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-4">
              Cupidatat occaecat labore aliqua laborum minim proident. Veniam commodo irure ea nostrud duis laborum deserunt. Laboris nisi adipisicing qui sunt ad veniam irure excepteur consectetur velit veniam.
            </p>
          </div>

          {/* Right Menu - Single column, same styling as left sidebar */}
          <div className="flex-shrink-0 flex gap-6 items-start">
            <div className="text-gray-500">Collection 2</div>
            <div className="text-gray-500">Collection 1</div>
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

      {/* Left Side Menu - Publication Info */}
      <div className="absolute top-[50%] left-[5%] text-sm space-y-1">
        <p className="text-gray-400"><span className="font-bold text-[#00ff88]">Publication</span> / January 2025</p>
        <p className="text-gray-400"><span className="font-bold text-[#00ff88]">Written for</span>: Author Name</p>
        <p className="text-xs"><span className="font-bold text-[#00ff88]">Original:</span> <span className="text-gray-400 italic">example.com/url/content-item-name</span></p>
      </div>
    </div>
  );
}