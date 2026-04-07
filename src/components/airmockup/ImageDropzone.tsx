import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageDropzoneProps {
  imageUrl: string | null;
  onImageUpload: (url: string) => void;
}

const ImageDropzone = ({ imageUrl, onImageUpload }: ImageDropzoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const url = URL.createObjectURL(file);
        onImageUpload(url);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [], "image/jpeg": [], "image/jpg": [] },
    multiple: false,
  });

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Step 1 — Upload Screen
      </h3>
      <div
        {...getRootProps()}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50 hover:bg-secondary/50"
        }`}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {imageUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <img
                src={imageUrl}
                alt="Uploaded preview"
                className="w-full max-h-40 object-contain rounded-lg"
              />
              <p className="text-xs text-muted-foreground">
                Click or drop to replace
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              {isDragActive ? (
                <ImageIcon className="w-8 h-8 text-primary" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm text-foreground font-medium">
                  {isDragActive ? "Drop image here" : "Drag & drop your UI"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG or JPG • Screen mockup
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImageDropzone;
