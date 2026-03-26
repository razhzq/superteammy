import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, QrCode } from "lucide-react";

export default function QRRegistrationPage() {
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [showQR, setShowQR] = useState(false);

  const handleGenerate = () => {
    // For local testing, use localhost
    // After deployment, this will be your Vercel URL
    const url = registrationUrl || `${window.location.origin}/register`;
    setRegistrationUrl(url);
    setShowQR(true);
  };

  const handleDownload = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = "student-registration-qr.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="flex flex-col gap-[24px] p-[32px]">
      <div className="flex flex-col gap-[8px]">
        <h1 className="font-outfit text-[28px] font-bold text-[var(--text-primary)]">
          QR Code Registration
        </h1>
        <p className="font-inter text-[14px] text-[var(--text-secondary)]">
          Generate QR codes for student registration
        </p>
      </div>

      {/* URL Input */}
      <div className="flex flex-col gap-[16px] p-[24px] rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border)]">
        <div className="flex flex-col gap-[8px]">
          <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
            Registration URL
          </label>
          <input
            type="text"
            value={registrationUrl}
            onChange={(e) => setRegistrationUrl(e.target.value)}
            placeholder={`${window.location.origin}/register`}
            className="px-[16px] py-[12px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
          />
          <p className="font-inter text-[12px] text-[var(--text-secondary)]">
            Leave empty to use default registration page URL
          </p>
        </div>

        <button
          onClick={handleGenerate}
          className="flex items-center justify-center gap-[8px] px-[24px] py-[14px] rounded-[8px] bg-[var(--primary)] text-white font-inter text-[14px] font-medium hover:opacity-90"
        >
          <QrCode className="w-[18px] h-[18px]" />
          Generate QR Code
        </button>
      </div>

      {/* QR Code Display */}
      {showQR && (
        <div className="flex flex-col gap-[16px] p-[24px] rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border)]">
          <h2 className="font-outfit text-[18px] font-semibold text-[var(--text-primary)]">
            Your QR Code
          </h2>

          <div className="flex flex-col items-center gap-[16px] p-[24px] bg-white rounded-[12px]">
            <QRCodeSVG
              id="qr-code"
              value={registrationUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
            <p className="font-mono text-[12px] text-gray-600 text-center break-all max-w-[300px]">
              {registrationUrl}
            </p>
          </div>

          <div className="flex flex-col gap-[12px]">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-[8px] px-[24px] py-[12px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] font-medium hover:bg-[var(--surface-hover)]"
            >
              <Download className="w-[18px] h-[18px]" />
              Download QR Code
            </button>

            <div className="p-[16px] rounded-[8px] bg-blue-950/20 border border-blue-500/30">
              <p className="font-inter text-[13px] text-blue-400">
                <strong>How to use:</strong>
                <br />
                1. Download the QR code
                <br />
                2. Print it or display it on a screen
                <br />
                3. Students scan with their phone camera
                <br />
                4. They fill the form and submit
                <br />
                5. Data automatically added to database
              </p>
            </div>

            <div className="p-[16px] rounded-[8px] bg-yellow-950/20 border border-yellow-500/30">
              <p className="font-inter text-[13px] text-yellow-400">
                <strong>Note:</strong> For QR codes to work on phones, you need to deploy this app
                to Vercel or another hosting service. Local URLs (localhost) won't work on mobile
                devices.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
