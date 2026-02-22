'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SignaturePad } from '@/components/signature-pad';

interface SignaturePadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (signatureData: string, signerName: string) => void;
}

export function SignaturePadModal({ open, onClose, onSubmit }: SignaturePadModalProps) {
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');

  const handleSubmit = () => {
    if (signatureData && signerName.trim()) {
      onSubmit(signatureData, signerName.trim());
      setSignatureData(null);
      setSignerName('');
    }
  };

  const handleClose = () => {
    setSignatureData(null);
    setSignerName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sign Document</DialogTitle>
          <DialogDescription>
            Please draw your signature below and enter your full legal name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Draw your signature</Label>
            <SignaturePad onSignatureChange={setSignatureData} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signerName">Full legal name</Label>
            <Input
              id="signerName"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!signatureData || !signerName.trim()}
          >
            Confirm Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
