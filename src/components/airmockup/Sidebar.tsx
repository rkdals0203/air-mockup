import { Button } from "@/components/ui/button";
import { Download, Box } from "lucide-react";
import { motion } from "framer-motion";
import ImageDropzone from "./ImageDropzone";
import MagicLink from "./MagicLink";
import RotationSliders from "./RotationSliders";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  imageUrl: string | null;
  onImageUpload: (url: string) => void;
  sessionCode: string | null;
  isConnected: boolean;
  rotation: [number, number, number];
  onRotationChange: (axis: number, value: number) => void;
  onExport: () => void;
}

const Sidebar = ({
  imageUrl,
  onImageUpload,
  sessionCode,
  isConnected,
  rotation,
  onRotationChange,
  onExport,
}: SidebarProps) => {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-80 min-w-[320px] h-screen flex flex-col border-r border-border bg-card overflow-y-auto"
    >
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            AirMockup
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Interactive 3D Mockup Generator
        </p>
      </div>

      <Separator />

      <div className="flex-1 p-6 space-y-6">
        <ImageDropzone imageUrl={imageUrl} onImageUpload={onImageUpload} />
        <Separator />
        <MagicLink sessionCode={sessionCode} isConnected={isConnected} />
        <Separator />
        <RotationSliders rotation={rotation} onChange={onRotationChange} />
      </div>

      <div className="p-6 pt-0">
        <Button onClick={onExport} className="w-full gap-2" size="lg">
          <Download className="w-4 h-4" />
          Capture Current View
        </Button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
