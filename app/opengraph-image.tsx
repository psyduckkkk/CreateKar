import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CreateKar • Sovereign Creator Campaign Escrow & Contracts";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#090A0D",
          padding: "60px 80px",
          border: "2px solid #1F222D",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: "#171920",
              border: "2px solid #CDA043",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#CDA043",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            CK
          </div>
          <span style={{ fontSize: "28px", color: "#F5F6F8", fontWeight: "700" }}>
            CreateKar
          </span>
          <span
            style={{
              fontSize: "14px",
              color: "#63697A",
              border: "1px solid #2E3242",
              padding: "4px 10px",
              borderRadius: "6px",
              marginLeft: "12px",
            }}
          >
            INDIA ESCROW PROTOCOL
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "800",
              color: "#F5F6F8",
              lineHeight: 1.15,
              maxWidth: "960px",
              letterSpacing: "-0.02em",
            }}
          >
            The Sovereign Creator Contract Ledger.
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#9DA3B4",
              maxWidth: "840px",
              lineHeight: 1.4,
            }}
          >
            Automated milestone escrow, Aadhaar e-signed agreements, and instant GST invoices for creators and agencies.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            borderTop: "1px solid #1F222D",
            paddingTop: "24px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "14px", color: "#63697A" }}>ESCROW VAULT</span>
            <span style={{ fontSize: "22px", color: "#CDA043", fontWeight: "700" }}>
              100% Guaranteed
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "14px", color: "#63697A" }}>SETTLEMENT TIME</span>
            <span style={{ fontSize: "22px", color: "#F5F6F8", fontWeight: "700" }}>
              T+0 Delivery Approval
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "14px", color: "#63697A" }}>LEGAL COMPLIANCE</span>
            <span style={{ fontSize: "22px", color: "#F5F6F8", fontWeight: "700" }}>
              IT Act 2000 &amp; DPDP 2023
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
