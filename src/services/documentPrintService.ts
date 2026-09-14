/**
 * Document Print & PDF Service for Jai Bhavani Cargo
 * Handles clean A4 printing, PDF generation via iframe, and WhatsApp document sharing.
 */

export const documentPrintService = {
  /**
   * Prints the given HTML document content in an isolated iframe
   * Ensures perfect A4 page breaks, removes web portal navigation, and prints cleanly.
   */
  printDocument(title: string, htmlContent: string) {
    // Check if an existing print iframe exists, remove it
    const existingIframe = document.getElementById('jc-print-frame');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'jc-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #0f172a;
            background: #ffffff;
            font-size: 11px;
            line-height: 1.35;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 4px 6px;
            border: 1px solid #94a3b8;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    doc.close();
  },

  /**
   * Generates a pre-formatted WhatsApp share link for LR / POD
   */
  getWhatsAppShareUrl(params: {
    recipientPhone?: string;
    documentType: 'LR' | 'POD';
    documentNumber: string;
    tripNumber: string;
    clientName: string;
    vehicleNumber: string;
    route: string;
    status: string;
    verificationUrl: string;
  }): string {
    const isLr = params.documentType === 'LR';
    const text = `🚚 *JAI BHAVANI CARGO - ${isLr ? 'LORRY RECEIPT' : 'PROOF OF DELIVERY'}*

📋 *Document No:* ${params.documentNumber}
🛣️ *Trip:* ${params.tripNumber} (${params.route})
🏢 *Client:* ${params.clientName}
🚛 *Vehicle:* ${params.vehicleNumber}
📊 *Status:* ${params.status}

🔍 *Secure Online Verification:*
${params.verificationUrl}

_Jai Bhavani Cargo & Logistics | Ghatkesar, Hyderabad_
_Ph: +91 7794072244 | www.jaibhavanicargo.com_`;

    const encodedText = encodeURIComponent(text);
    let cleanedPhone = (params.recipientPhone || '').replace(/\D/g, '');
    if (cleanedPhone.length === 10) {
      cleanedPhone = '91' + cleanedPhone;
    }

    if (cleanedPhone) {
      return `https://wa.me/${cleanedPhone}?text=${encodedText}`;
    }
    return `https://wa.me/?text=${encodedText}`;
  }
};
