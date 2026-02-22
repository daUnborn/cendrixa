'use client';

import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { SignaturePad } from '@/components/signature-pad';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface SignatureZone {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PDFSignatureViewerProps {
  pdfUrl: string;
  onSignatureComplete: (signatureData: string, signerName: string, zone: SignatureZone) => void;
}

export function PDFSignatureViewer({ pdfUrl, onSignatureComplete }: PDFSignatureViewerProps) {
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [signatureZone, setSignatureZone] = useState<SignatureZone | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdfDoc = await loadingTask.promise;
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);

        // Calculate signature zone on last page
        const lastPage = await pdfDoc.getPage(pdfDoc.numPages);
        const viewport = lastPage.getViewport({ scale: 1 });

        const zone: SignatureZone = {
          page: pdfDoc.numPages,
          x: viewport.width - 250,
          y: viewport.height - 150,
          width: 200,
          height: 80
        };
        setSignatureZone(zone);

        // Render first page by default
        setCurrentPage(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      const page = await pdf.getPage(currentPage);
      const canvas = canvasRef.current!;
      const context = canvas.getContext('2d')!;

      // Calculate scale to fit container width
      const containerWidth = containerRef.current?.clientWidth || 800;
      const viewport = page.getViewport({ scale: 1 });
      const scale = Math.min(containerWidth / viewport.width, 2); // Max scale of 2

      const scaledViewport = page.getViewport({ scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      await page.render({
        canvasContext: context,
        viewport: scaledViewport
      }).promise;
    };

    renderPage();
  }, [pdf, currentPage]);

  const handleZoneClick = () => {
    setShowSignaturePad(true);
  };

  const handleSignatureSubmit = (data: string, name: string) => {
    setSignatureData(data);
    setSignerName(name);
    setShowSignaturePad(false);
  };

  const handleFinalSubmit = () => {
    if (signatureData && signerName && signatureZone) {
      onSignatureComplete(signatureData, signerName, signatureZone);
    }
  };

  const getSignatureZoneStyle = (): React.CSSProperties => {
    if (!signatureZone || !canvasRef.current || currentPage !== signatureZone.page) {
      return { display: 'none' };
    }

    const canvas = canvasRef.current;
    const scaleX = canvas.width / canvas.offsetWidth;
    const scaleY = canvas.height / canvas.offsetHeight;

    // Get the actual viewport scale
    const containerWidth = containerRef.current?.clientWidth || 800;
    const actualScale = canvas.width / (signatureZone.width + signatureZone.x + 50); // Approximate original width

    return {
      position: 'absolute',
      left: `${(signatureZone.x * canvas.offsetWidth) / canvas.width}px`,
      top: `${(signatureZone.y * canvas.offsetHeight) / canvas.height}px`,
      width: `${(signatureZone.width * canvas.offsetWidth) / canvas.width}px`,
      height: `${(signatureZone.height * canvas.offsetHeight) / canvas.height}px`,
      border: '2px dashed #0066cc',
      backgroundColor: signatureData ? 'transparent' : 'rgba(0, 102, 204, 0.1)',
      cursor: 'pointer',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#0066cc',
      fontWeight: '500'
    };
  };

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative border rounded-lg overflow-hidden bg-gray-50">
        <canvas ref={canvasRef} className="w-full" />

        {/* Signature zone overlay */}
        {currentPage === signatureZone?.page && (
          <div
            style={getSignatureZoneStyle()}
            onClick={handleZoneClick}
          >
            {!signatureData && (
              <span className="text-center px-2">
                Click to sign here
              </span>
            )}
            {signatureData && (
              <img
                src={signatureData}
                alt="Signature"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        )}
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
            disabled={currentPage === numPages}
          >
            Next
          </Button>
        </div>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {numPages}
        </span>
        {currentPage !== signatureZone?.page && signatureZone && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setCurrentPage(signatureZone.page)}
          >
            Go to Signature Page
          </Button>
        )}
      </div>

      {/* Final submit button */}
      {signatureData && signerName && (
        <div className="flex justify-end">
          <Button onClick={handleFinalSubmit} size="lg">
            Submit Signed Document
          </Button>
        </div>
      )}

      {/* Signature pad modal */}
      {showSignaturePad && (
        <SignaturePad
          onSubmit={handleSignatureSubmit}
          onCancel={() => setShowSignaturePad(false)}
        />
      )}
    </div>
  );
}
