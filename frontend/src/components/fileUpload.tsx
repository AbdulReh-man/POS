import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface IconUploadProps {
  value: string;
  onChange: (filePath: string) => void;
  platformName?: string;
}

export function IconUpload({ value, onChange, platformName }: IconUploadProps) {
  const handleFileSelect = async () => {
    try {
      const result = await window.api.file.selectFile({
        filters: [{ name: "PNG Images", extensions: ["png"] }],
        properties: ["openFile"],
      });      

      if (result && !result.canceled && result.filePaths[0]) {
        const filePath = result.filePaths[0];

        // Validate file size (e.g., max 2MB)
        const stats = await window.api.file.getFileStats(filePath);
        if (stats.size > 2 * 1024 * 1024) {
          alert("File too large. Please select an image under 2MB.");
          return;
        }

        // Copy to app directory with platform-specific name
        const savedPath = await window.api.file.saveIcon(
          filePath,
          platformName
        );
        onChange(savedPath);
        
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      alert("Failed to upload icon. Please try again.");
    }
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className='space-y-2'>
      {value ? (
        <div className='relative w-20 h-20'>
          {/* Preview Image */}
          <img
            src={`file://${value}`}
            alt='Icon preview'
            className='w-full h-full object-contain rounded-lg border bg-white p-1'
          />
          {/* Remove Button */}
          <Button
            type='button'
            variant='destructive'
            size='icon'
            className='absolute -top-2 w-fit h-fit -right-2 p-1 rounded-full shadow-md'
            onClick={handleClear}>
            <X className='w-3 h-3' />
          </Button>
        </div>
      ) : (
        <Button
          type='button'
          variant='outline'
          onClick={handleFileSelect}
          className='w-20 h-20 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-muted transition'>
          <Upload className='w-5 h-5 text-muted-foreground' />
          <p className='text-xs text-center text-muted-foreground'>Upload</p>
        </Button>
      )}
    </div>
  );
}
