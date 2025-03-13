import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function MultiSelect({ options, selected, setSelected }: MultiSelectProps) {
  const toggleSelect = (value: string) => {
    setSelected((prevSelected) => {
      if (prevSelected.includes(value)) {
        return prevSelected.filter((item) => item !== value);
      } else {
        return [...prevSelected, value];
      }
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full">
          {selected.length > 0 ? selected.join(", ") : "Select Employees"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <ScrollArea className="h-48">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 p-2">
              <Checkbox
                id={option.value}
                checked={selected.includes(option.value)}
                onCheckedChange={() => toggleSelect(option.value)}
              />
              <label htmlFor={option.value} className="text-sm">
                {option.label}
              </label>
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
