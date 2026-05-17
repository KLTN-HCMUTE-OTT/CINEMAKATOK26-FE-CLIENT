"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContentPicker } from "./content-picker";
import type { ContentRef } from "@/types/content-ref";

interface ContentPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (ref: ContentRef) => void;
}

export function ContentPickerDialog({
  open,
  onOpenChange,
  onConfirm,
}: ContentPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-gray-900 border border-white/10 text-white p-0 overflow-hidden max-w-[600px] h-[80vh] flex flex-col"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex-none">
          <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600" />
          <div className="px-5 py-4 border-b border-white/10">
            <DialogTitle className="text-base font-bold text-white">
              Choose content for your watch party
            </DialogTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Pick a movie or TV episode — we'll pre-fill the room for you.
            </p>
          </div>
        </div>

        {/* Picker */}
        <div className="flex-1 overflow-hidden">
          <ContentPicker
            onConfirm={(ref) => {
              onConfirm(ref);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
