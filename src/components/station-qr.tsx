"use client";

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function StationQr({
  value,
  title,
  size = 180,
  showDownload = true,
}: {
  value: string;
  title: string;
  size?: number;
  showDownload?: boolean;
}) {
  const safeName = title.replace(/[^\wа-яА-ЯёЁ\- ]+/g, "").trim() || "station";

  function downloadPng() {
    const svg = document.getElementById(`qr-${safeName}`)?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size * 2;
      canvas.height = size * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.download = `klad-${safeName}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  return (
    <div className="flex flex-col items-center gap-3" id={`qr-${safeName}`}>
      <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-border">
        <QRCodeSVG value={value} size={size} level="M" includeMargin={false} />
      </div>
      {showDownload ? (
        <Button type="button" variant="outline" size="sm" onClick={downloadPng} className="no-print">
          <Download data-icon="inline-start" />
          Изтегли QR
        </Button>
      ) : null}
    </div>
  );
}
