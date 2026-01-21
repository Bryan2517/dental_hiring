import * as pdfjsLib from 'pdfjs-dist';
// Initialize the worker for Vite environment
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
export async function extractTextFromPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        // Iterate over all pages
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // Extract text items and join them
            const pageText = textContent.items
                .map((item) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }
        return fullText;
    }
    catch (error) {
        console.error('Error extracting text from PDF:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
        throw new Error('Failed to extract text from PDF: Unknown error');
    }
}
