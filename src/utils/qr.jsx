import React from "react";
import { QRCodeSVG } from "qrcode.react";

export function QrCode({ value, size = 180, fgColor = "#121613", bgColor = "#FFFFFF" }) {
  return (
    <QRCodeSVG
      value={value || "SEE26"}
      size={size}
      level="M"
      marginSize={2}
      fgColor={fgColor}
      bgColor={bgColor}
      title="QR tiket Saudi Education Expo"
    />
  );
}
