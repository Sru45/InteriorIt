export const generateHeaderImage = async (ownerDetails) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    const logoImg = new Image();
    logoImg.src = '/logo.jpg';
    logoImg.onload = () => {
      // 1. Chromakey Extraction: Remove the 3D logo's red background to leave only pure Silver geometry
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 180;
      tempCanvas.height = 180;
      const tCtx = tempCanvas.getContext('2d');
      tCtx.drawImage(logoImg, 0, 0, 180, 180);
      
      const imgData = tCtx.getImageData(0, 0, 180, 180);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]; const g = data[i+1]; const b = data[i+2];
        // Eliminate distinctly red pixels and extremely dark vignette pixels
        if ((r > g + 25 && r > b + 25) || Math.max(r, g, b) < 30) {
          data[i + 3] = 0; // Alpha = 0 (Transparent)
        }
      }
      tCtx.putImageData(imgData, 0, 0);

      // 2. Base Red Header tuned to perfectly match exact bright screenshot red
      ctx.fillStyle = '#BA151B';
      ctx.fillRect(0, 0, 1600, 300);

      // 3. Dark Gray Right Block
      ctx.fillStyle = '#2A2A2A';
      ctx.beginPath();
      // Start further left, arch up, and flatten out before the top edge
      ctx.moveTo(550, 300);
      ctx.bezierCurveTo(950, 300, 1100, 60, 1600, 60);
      ctx.lineTo(1600, 300);
      ctx.fill();

      // 4. Swoosh Curve
      // Master white curve tracing the grey border
      ctx.lineWidth = 15;
      ctx.strokeStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(550, 300);
      ctx.bezierCurveTo(950, 300, 1100, 60, 1600, 60);
      ctx.stroke();

      // 5. Place the magically extracted 3D Logo
      ctx.drawImage(tempCanvas, 50, 50, 180, 180);

      // 6. Draw "INTERIOR IT" Text Lockup
      ctx.font = 'bold 85px "Trebuchet MS", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.fillText('INTERIOR', 260, 140);
      
      const interiorWidth = ctx.measureText('INTERIOR').width;
      const centerOfInterior = 260 + (interiorWidth / 2);
      
      ctx.font = 'bold 36px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IT', centerOfInterior, 200);
      
      const itWidth = ctx.measureText('IT').width;
      ctx.fillStyle = '#FFFFFF';
      
      // Flanking lines for exact match of "--- IT ---" layout
      const gap = 20;
      const lineWidth = (interiorWidth / 2) - (itWidth / 2) - gap;
      
      ctx.fillRect(260, 185, lineWidth, 4); // Left line
      ctx.fillRect(centerOfInterior + (itWidth / 2) + gap, 185, lineWidth, 4); // Right line

      // 7. Draw Owner Details on Right Side
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      
      const details = ownerDetails || {
        name: 'Babu Suthar',
        mobile1: '+91 97234 65421',
        mobile2: '+91 94275 15584',
        address: 'Vasad-396001 Gujarat',
        email: 'h.i.suthar85@gmail.com',
        gstin: '24AAAAA0000A1Z5'
      };

      // Shrunk text and pushed Y-coordinates down to avoid curve overlapping
      ctx.font = 'bold 28px "Trebuchet MS", sans-serif';
      ctx.fillText(details.name, 1550, 125);
      
      ctx.font = '22px "Trebuchet MS", sans-serif';
      ctx.fillText(`${details.mobile1} | ${details.mobile2}`, 1550, 160);
      ctx.fillText(details.address, 1550, 195);
      ctx.fillText(details.email, 1550, 230);
      ctx.fillText(`GSTIN: ${details.gstin}`, 1550, 265);

      // Extract as Base64 PNG
      const base64Image = canvas.toDataURL('image/png');
      resolve(base64Image);
    };

    logoImg.onerror = () => {
      // Fallback
      resolve(canvas.toDataURL('image/png'));
    };
  });
};
