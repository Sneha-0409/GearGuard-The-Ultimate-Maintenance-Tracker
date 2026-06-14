import React, { useRef, useEffect, useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Undo, Check, X } from 'lucide-react';

interface ImageAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  onSave: (annotatedFile: File) => void;
}

const ImageAnnotationModal: React.FC<ImageAnnotationModalProps> = ({
  isOpen,
  onClose,
  file,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Store the original image so we can clear/redraw it
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!isOpen || !file) {
      setImageLoaded(false);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onload = () => {
      imageObjRef.current = img;
      drawImageToCanvas();
      setImageLoaded(true);
      URL.revokeObjectURL(objectUrl);
    };
  }, [isOpen, file]);

  const drawImageToCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imageObjRef.current;
    
    if (!canvas || !container || !img) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions to fit within modal (max 600px wide/high)
    const maxWidth = container.clientWidth;
    const maxHeight = window.innerHeight * 0.6;
    
    let targetWidth = img.width;
    let targetHeight = img.height;
    
    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
    
    if (ratio < 1) {
      targetWidth = img.width * ratio;
      targetHeight = img.height * ratio;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // Fill white background first (in case of transparency)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    
    // Set up pen style
    ctx.strokeStyle = '#ef4444'; // red-500
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.closePath();
      }
      setIsDrawing(false);
    }
  };

  const handleClear = () => {
    drawImageToCanvas();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const parts = file.name.split('.');
      const ext = parts.pop();
      const baseName = parts.join('.');
      const newName = `${baseName}_annotated.${ext || 'jpg'}`;
      
      const newFile = new File([blob], newName, { type: blob.type });
      onSave(newFile);
      onClose();
    }, file.type);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Annotate Photo"
      size="lg"
    >
      <div className="flex flex-col items-center space-y-4">
        {!imageLoaded && (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Loading image...
          </div>
        )}
        
        <div 
          ref={containerRef}
          className={`w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex justify-center ${!imageLoaded ? 'hidden' : ''}`}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            className="cursor-crosshair max-w-full touch-none border border-gray-200 dark:border-gray-700 shadow-sm"
          />
        </div>
        
        <div className="flex justify-between w-full mt-4">
          <Button type="button" variant="secondary" onClick={handleClear} className="flex items-center">
            <Undo className="w-4 h-4 mr-2" />
            Clear
          </Button>
          
          <div className="flex space-x-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex items-center">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleSave} className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Save Annotation
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ImageAnnotationModal;
