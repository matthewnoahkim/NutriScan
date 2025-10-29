"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
// @ts-expect-error - scan-preview might not have type declarations
import { ScanPreview } from "./scan-preview";
import { Loader2, Upload, Camera, X } from "lucide-react";
import type { ParsedNutrition } from "@/lib/ocr/parseNutrition";
import { parseNutritionFromOCR, extractServingSize } from "@/lib/ocr/parseNutrition";
import { preprocessImageForOCR, blobToBase64 } from "@/lib/ocr/preprocessImage";
import { createWorker } from "tesseract.js";

interface ScanFormProps {
  onSaveSuccess: () => void;
}

export function ScanForm({ onSaveSuccess }: ScanFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [parsed, setParsed] = useState<ParsedNutrition | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Setup video stream when camera opens
  useEffect(() => {
    if (stream && videoRef.current && isCameraOpen) {
      console.log("Setting video srcObject...");
      videoRef.current.srcObject = stream;
      
      // Add event listeners for debugging
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded, dimensions:", 
          videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);
      };
      
      videoRef.current.onplay = () => {
        console.log("Video started playing");
      };
      
      videoRef.current.play()
        .then(() => console.log("Video play() succeeded"))
        .catch((err) => {
          console.error("Error playing video:", err);
          toast({
            title: "Video playback error",
            description: "Failed to display camera feed. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [stream, isCameraOpen, toast]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsed(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const startCamera = async () => {
    try {
      // Check if browser supports camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Camera not supported",
          description: "Your browser doesn't support camera access. Please use a modern browser or upload a file instead.",
          variant: "destructive",
        });
        return;
      }

      console.log("Requesting camera access...");
      
      // Try to get rear camera first (mobile), fallback to any camera (desktop)
      let mediaStream: MediaStream | null = null;
      
      try {
        // Try environment (rear) camera first
        console.log("Attempting to access rear camera...");
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
        console.log("Rear camera accessed successfully");
      } catch (err) {
        console.log("Rear camera not available, trying default camera...", err);
        // Fallback to any available camera
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
        console.log("Default camera accessed successfully");
      }
      
      if (mediaStream) {
        console.log("Setting media stream, tracks:", mediaStream.getTracks());
        setStream(mediaStream);
        setIsCameraOpen(true);

        toast({
          title: "Camera ready!",
          description: "Position the nutrition label and click capture.",
        });
      }
    } catch (error) {
      console.error("Camera access error:", error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use this feature. Make sure your browser has permission to access the camera.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const capturedFile = new File([blob], "nutrition-label.jpg", { type: "image/jpeg" });
      setFile(capturedFile);
      setParsed(null);
      
      // Create preview from canvas
      setPreview(canvas.toDataURL("image/jpeg"));
      
      // Stop camera after capture
      stopCamera();
      
      toast({
        title: "Photo captured!",
        description: "Click 'Scan Label' to extract nutrition information.",
      });
    }, "image/jpeg", 0.95);
  };

  const handleScan = async () => {
    if (!file) return;

    setIsScanning(true);
    let worker = null;

    try {
      console.log("Starting enhanced OCR processing...");

      // Step 1: Preprocess image for better OCR
      toast({
        title: "Preprocessing image...",
        description: "Optimizing image quality for better recognition",
      });

      const preprocessedBlob = await preprocessImageForOCR(file);
      const preprocessedFile = new File([preprocessedBlob], file.name, {
        type: "image/jpeg",
      });
      
      console.log("Image preprocessed successfully");

      // Step 2: Perform OCR with Tesseract
      toast({
        title: "Scanning label...",
        description: "Extracting text from nutrition label",
      });

      worker = await createWorker("eng", 1, {
        logger: (m) => console.log(m),
      });

      console.log("Worker created, performing recognition...");

      const { data } = await worker.recognize(preprocessedFile);
      
      console.log("Recognition complete, OCR text length:", data.text.length);

      const ocrText = data.text;

      // Parse nutrition facts from OCR text
      const parsed = parseNutritionFromOCR(ocrText);
      const servingSize = extractServingSize(ocrText);

      let result = {
        ...parsed,
        servingSize: servingSize || parsed.servingSize,
      };

      console.log("Parsed nutrition data:", result);

      // Step 3: If confidence is low, try AI enhancement
      if (!result.hasNutritionFacts || result.confidence < 0.5) {
        console.log("Low confidence detected, attempting AI enhancement...");
        
        toast({
          title: "Low confidence detected",
          description: "Attempting AI enhancement...",
        });

        try {
          const imageBase64 = await blobToBase64(preprocessedBlob);
          
          const aiResponse = await fetch("/api/ocr/enhance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64, ocrResult: result }),
          });

          if (!aiResponse.ok) {
            throw new Error("AI enhancement failed");
          }

          const enhanced = await aiResponse.json();
          
          console.log("AI enhancement successful:", enhanced);
          result = {
            ...result,
            ...enhanced,
            servingSize: enhanced.servingSize || result.servingSize,
          };

          toast({
            title: "AI enhancement successful!",
            description: "Nutrition data enhanced with AI vision",
          });
        } catch (aiError) {
          console.log("AI enhancement not available:", aiError);
          // Continue with OCR-only results
          toast({
            title: "Using OCR results",
            description: "AI enhancement unavailable. Please review and edit carefully.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Scan successful!",
          description: "Please review the parsed nutrition information.",
        });
      }

      setParsed(result);

    } catch (error) {
      console.error("Scan error:", error);
      
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Always terminate worker to prevent memory leaks
      if (worker) {
        try {
          await worker.terminate();
          console.log("Worker terminated successfully");
        } catch (e) {
          console.error("Error terminating worker:", e);
        }
      }
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Capture or Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCameraOpen ? (
            <>
              {/* Camera and Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={startCamera}
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={isScanning}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Open Camera
                </Button>

                <div className="relative">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isScanning}
                  />
                  <Button
                    variant="outline"
                    className="w-full pointer-events-none"
                    size="lg"
                    disabled={isScanning}
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload File
                  </Button>
                </div>
              </div>

              {preview && (
                <div className="relative w-full max-w-md mx-auto">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto rounded-lg border"
                  />
                </div>
              )}

              <Button
                onClick={handleScan}
                disabled={!file || isScanning}
                className="w-full"
                size="lg"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Scan Label
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Camera View */}
              <div className="relative w-full max-w-2xl mx-auto bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full min-h-[400px] object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Frame guide overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white/50 border-dashed rounded-lg flex items-center justify-center">
                    <div className="bg-black/60 text-white px-4 py-2 rounded-md text-sm">
                      Align nutrition label here
                    </div>
                  </div>
                </div>
                
                {/* Loading indicator while camera initializes */}
                {!stream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <p className="text-white text-sm">Starting camera...</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <X className="mr-2 h-5 w-5" />
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="w-full"
                  size="lg"
                  disabled={!stream}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capture Photo
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Position the nutrition label in the frame and click capture
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {parsed && (
        <ScanPreview
          parsed={parsed}
          onSaveSuccess={onSaveSuccess}
        />
      )}
    </div>
  );
}

