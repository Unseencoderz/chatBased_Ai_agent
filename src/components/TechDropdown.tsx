
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TechStack } from "@/types";
import TechBadge from "./TechBadge";

interface TechDropdownProps {
  techList: TechStack[];
  onSelectTech: (tech: TechStack) => void;
}

const TechDropdown = ({ techList, onSelectTech }: TechDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const initialVisibleCount = 6;
  
  // Show the first few tech options initially
  const visibleTech = techList.slice(0, initialVisibleCount);
  const hiddenTech = techList.slice(initialVisibleCount);
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-2">
        {visibleTech.map((tech) => (
          <Button
            key={tech}
            variant="outline"
            className="flex items-center gap-2 justify-start h-9"
            onClick={() => onSelectTech(tech)}
          >
            <TechBadge tech={tech} />
          </Button>
        ))}
      </div>
      
      {hiddenTech.length > 0 && (
        <div className="mt-2">
          <Button
            variant="ghost"
            className="text-sm flex items-center w-full justify-center border border-dashed border-white/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                <span>Show More Technologies</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
          
          {isOpen && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-2">
              {hiddenTech.map((tech) => (
                <Button
                  key={tech}
                  variant="outline"
                  className="flex items-center gap-2 justify-start h-9"
                  onClick={() => onSelectTech(tech)}
                >
                  <TechBadge tech={tech} />
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TechDropdown;
