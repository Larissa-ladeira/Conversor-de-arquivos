const mammoth = require('mammoth');
  const jsPDF = require('jspdf');
  const fs = require('fs');
  
  async function convert(inputPath, outputPath) {
    const result = await mammoth.convertToHtml({path: inputPath});
    const html = result.value;
    
    const doc = new jsPDF();
    doc.html(html, {
      callback: function(blob) {
        doc.save(outputPath);
      },
      x: 10,
      y: 10,
      width: 190,
      windowWidth: 200
    });
  }
  
  convert(process.argv[2], process.argv[3]);