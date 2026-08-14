async function test() {
  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
    await import("pdfjs-dist/legacy/build/pdf.worker.js");
    console.log("Both pdf.js and pdf.worker.js loaded successfully!");
  } catch (err) {
    console.error("Test error:", err);
  }
}

test();
