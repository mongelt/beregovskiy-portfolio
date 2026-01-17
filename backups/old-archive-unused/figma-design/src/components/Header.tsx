import { ChevronDown, ChevronUp } from 'lucide-react';

interface HeaderProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

export function Header({ isExpanded, setIsExpanded }: HeaderProps) {
  return (
    <div className="border-b border-gray-800 transition-all duration-300">
      <div className="px-8 py-6">
        <div className="flex items-start relative">
          {/* Left side - Name and roles */}
          <div className="w-[50%]">
            <h1 className="text-white mb-1">ALEXANDRA MORRISON</h1>
            <p className="text-gray-400 text-sm mb-3">San Francisco, CA</p>
            <div className="space-y-0.5 text-sm text-gray-300">
              <p>Creative Director</p>
              <p>UX/UI Designer</p>
              <p>Content Strategist</p>
              <p>Brand Consultant</p>
            </div>
          </div>

          {/* Right side - Description (from 50% to 75%) */}
          <div className="w-[25%]">
            <p className="text-gray-300 text-sm leading-relaxed">
              Passionate about crafting meaningful digital experiences that bridge the gap
              between user needs and business objectives. Over a decade of experience in
              design and strategy, specializing in cohesive brand narratives and intuitive
              interfaces that resonate with audiences across multiple industries.
            </p>
          </div>
          
          {/* Spacer for remaining 25% */}
          <div className="w-[25%]"></div>
        </div>

        {/* Expand/Collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-6 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span className="text-sm tracking-wider">EXPAND</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-8 pb-6 border-t border-gray-800 mt-4 pt-6">
          <div className="max-w-3xl space-y-4 text-gray-300 text-sm leading-relaxed">
            <p>
              With over ten years of experience in digital design and brand strategy, I've had the
              privilege of working with startups, established enterprises, and everything in between.
              My approach combines deep user research, innovative thinking, and a commitment to
              creating experiences that not only look beautiful but solve real problems.
            </p>
            <p>
              I believe great design is invisible – it guides users naturally, anticipates their needs,
              and creates moments of delight without calling attention to itself. Every project is an
              opportunity to learn, iterate, and push the boundaries of what's possible.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
