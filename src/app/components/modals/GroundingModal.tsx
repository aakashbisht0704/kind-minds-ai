"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const steps = [
  { label: "5 things you can see", detail: "Look around and name objects near you." },
  { label: "4 things you can touch", detail: "Focus on textures—your clothing, chair, or the ground." },
  { label: "3 things you can hear", detail: "Listen for distant and nearby sounds." },
  { label: "2 things you can smell", detail: "Notice scents around you or recall calming smells." },
  { label: "1 thing you can taste", detail: "Take a sip of water or focus on a lingering taste." },
];

export default function GroundingModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
    }
  }, [open]);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Grounding Exercise — 5-4-3-2-1</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-800">
            Follow each step slowly. This technique helps you reconnect with the present moment.
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className={`rounded-xl border px-4 py-3 ${
                  index === currentStep
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200 bg-white text-gray-500"
                }`}
              >
                <div className="text-sm font-semibold text-gray-900">{step.label}</div>
                <div className="text-xs text-gray-600">{step.detail}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={nextStep} disabled={currentStep === steps.length - 1}>
              {currentStep === steps.length - 1 ? "Done" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


