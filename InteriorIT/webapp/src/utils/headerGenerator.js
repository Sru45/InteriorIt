export const generateHeaderImage = async (ownerDetails) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    const logoImg = new Image();
    logoImg.src = '/logo.jpg';
    logoImg.onload = () => {
      // 1. Core Chromatic Extraction: Blend the 3D logo seamlessly
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 180;
      tempCanvas.height = 180;
      const tCtx = tempCanvas.getContext('2d');
      tCtx.drawImage(logoImg, 0, 0, 180, 180);
      
      // Sample a boundary pixel to discover the exact edge shade (e.g. vignette red)
      const borderPixel = tCtx.getImageData(3, 3, 1, 1).data;
      const dynamicBgColor = `rgb(${borderPixel[0]}, ${borderPixel[1]}, ${borderPixel[2]})`;

      // 2. Base Red Header generated identically to the Logo's border
      ctx.fillStyle = dynamicBgColor;
      ctx.fillRect(0, 0, 1600, 300);

      // 3. Dark Gray Right Block
      ctx.fillStyle = '#2A2A2A';
      ctx.beginPath();
      ctx.moveTo(700, 300);
      ctx.bezierCurveTo(900, 300, 800, 0, 1100, 0);
      ctx.lineTo(1600, 0);
      ctx.lineTo(1600, 300);
      ctx.fill();

      // 4. Swoosh Curves
      ctx.lineWidth = 15;
      ctx.strokeStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(700, 300);
      ctx.bezierCurveTo(900, 300, 800, 0, 1100, 0);
      ctx.stroke();

      ctx.lineWidth = 5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(750, 300);
      ctx.bezierCurveTo(950, 300, 850, 0, 1150, 0);
      ctx.stroke();

      // 5. Place the 3D Logo (It will now perfectly sink into its dynamically matched surroundings!)
      ctx.drawImage(logoImg, 50, 50, 180, 180);

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

      ctx.font = '35px sans-serif';
      ctx.fillText(details.name, 1550, 80);
      
      ctx.font = '28px sans-serif';
      ctx.fillText(`${details.mobile1} | ${details.mobile2}`, 1550, 130);
      ctx.fillText(details.address, 1550, 175);
      ctx.fillText(details.email, 1550, 220);
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
