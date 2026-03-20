export const generateHeaderImage = async (ownerDetails) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // 1. Red Background
    ctx.fillStyle = '#BC1F24';
    ctx.fillRect(0, 0, 1600, 300);

    // 2. Dark Gray Right Block
    ctx.fillStyle = '#2A2A2A';
    ctx.beginPath();
    ctx.moveTo(700, 300);
    ctx.bezierCurveTo(900, 300, 800, 0, 1100, 0);
    ctx.lineTo(1600, 0);
    ctx.lineTo(1600, 300);
    ctx.fill();

    // 3. Thick White Swoosh curve separating them
    ctx.lineWidth = 15;
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(700, 300);
    ctx.bezierCurveTo(900, 300, 800, 0, 1100, 0);
    ctx.stroke();

    // 4. Little white accent curve
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(750, 300);
    ctx.bezierCurveTo(950, 300, 850, 0, 1150, 0);
    ctx.stroke();

    // 5. Embed the Exact 3D Logo from User
    const logoImg = new Image();
    logoImg.src = '/logo.jpg';
    logoImg.onload = () => {
      // Draw image inside a softly rounded box to blend perfectly with the red
      ctx.save();
      ctx.beginPath();
      // Polyfill-safe rounded rect via arcs
      ctx.moveTo(66, 50);
      ctx.arcTo(230, 50, 230, 214, 16);
      ctx.arcTo(230, 214, 66, 214, 16);
      ctx.arcTo(50, 214, 50, 50, 16);
      ctx.arcTo(50, 50, 230, 50, 16);
      ctx.clip();
      ctx.drawImage(logoImg, 50, 50, 180, 180);
      ctx.restore();

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
