"use client";
import React, { useState, useRef, useEffect } from "react";
import { StrapiImage } from "./StrapiImage";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImagePickerProps {
  id: string;
  name: string;
  label: string;
  showCard?: boolean;
  defaultValue?: string;
  value?: File;
  onChange: (file: File) => void;
}

function generateDataUrl(file: File, callback: (imageUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result as string);
  reader.readAsDataURL(file);
}

function ImagePreview({ dataUrl }: { readonly dataUrl: string }) {
  return (
    <StrapiImage
      src={dataUrl}
      alt="preview"
      height={100}
      width={100}
      className="h-full w-full rounded-lg object-contain"
    />
  );
}

function ImageCard({
  dataUrl,
  fileInput,
}: {
  readonly dataUrl: string;
  readonly fileInput: React.RefObject<HTMLInputElement>;
}) {
  const imagePreview = dataUrl ? (
    <ImagePreview dataUrl={dataUrl} />
  ) : (
    <p>Click Here to Add Image</p>
  );

  return (
    <div className="relative">
      <div className="relative flex h-40 w-40 items-center space-x-4 overflow-hidden rounded-md border p-4">
        {imagePreview}
      </div>
      <button
        onClick={() => fileInput.current?.click()}
        className="absolute inset-0 w-full"
        type="button"
      ></button>
    </div>
  );
}

export default function ImagePickerInForm({
  id,
  name,
  label,
  defaultValue,
  value,
  onChange,
}: Readonly<ImagePickerProps>) {
  // console.log(defaultValue);
  const fileInput = useRef<HTMLInputElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(defaultValue ?? null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      generateDataUrl(file, setDataUrl);
      onChange(file);
    }
  };

  useEffect(() => {
    // Update preview if the file changes
    if (value && value instanceof File) {
      generateDataUrl(value, setDataUrl);
    }
  }, [value]);

  return (
    <React.Fragment>
      <div className="hidden">
        <Label htmlFor={name}>{label}</Label>
        <Input
          type="file"
          id={id}
          name={name}
          onChange={handleFileChange}
          ref={fileInput}
          accept="image/*"
        />
      </div>
      <ImageCard dataUrl={dataUrl ?? ""} fileInput={fileInput} />
    </React.Fragment>
  );
}
