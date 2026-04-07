import { Slider } from "@/components/ui/slider";

interface RotationSlidersProps {
  rotation: [number, number, number];
  onChange: (axis: number, value: number) => void;
}

const labels = ["X Axis", "Y Axis", "Z Axis"];

const RotationSliders = ({ rotation, onChange }: RotationSlidersProps) => {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Manual Rotation
      </h3>
      <div className="space-y-4">
        {labels.map((label, i) => (
          <div key={label} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground font-mono">
                {Math.round((rotation[i] * 180) / Math.PI)}°
              </span>
            </div>
            <Slider
              value={[rotation[i]]}
              min={-Math.PI}
              max={Math.PI}
              step={0.01}
              onValueChange={([v]) => onChange(i, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RotationSliders;
