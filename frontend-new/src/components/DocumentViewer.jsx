import { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Button,
  CircularProgress,
  Tooltip,
  TextField
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  OpenInNew as OpenInNewIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use local file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

const DocumentViewer = ({ documents, open, onClose, initialIndex = 0 }) => {
  const [currentDocIndex, setCurrentDocIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const [pdfDoc, setPdfDoc] = useState(null);
  const [renderError, setRenderError] = useState(false);
  const [scale, setScale] = useState(1.5); // Zoom scale
  const canvasRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();

  const currentDoc = documents[currentDocIndex];

  useEffect(() => {
    setCurrentDocIndex(initialIndex);
    setCurrentPage(1);
    setPageInput('1');
  }, [initialIndex]);

  // Load PDF when document changes
  useEffect(() => {
    if (open && currentDoc) {
      const isPDF = currentDoc.file?.mimeType?.includes('pdf') || currentDoc.file?.originalName?.toLowerCase().endsWith('.pdf');
      if (isPDF) {
        loadPDF();
      } else {
        setPdfDoc(null);
        setTotalPages(0);
      }
    }
    return () => {
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [currentDoc, open]);

  // Render page when currentPage or scale changes
  useEffect(() => {
    if (pdfDoc && currentPage > 0 && currentPage <= totalPages) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  const loadPDF = async () => {
    if (!currentDoc || !currentDoc._id) {
      setRenderError(true);
      enqueueSnackbar('Document ID not found', { variant: 'error' });
      return;
    }

    setPdfLoading(true);
    setRenderError(false);
    try {
      // Clean up previous PDF
      if (pdfDoc) {
        pdfDoc.destroy();
      }

      // Get token and build proxy URL with token as query parameter
      const token = sessionStorage.getItem('token');
      const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents/${currentDoc._id}/proxy?token=${encodeURIComponent(token)}`;

      console.log('Loading PDF from proxy:', proxyUrl);

      const loadingTask = pdfjsLib.getDocument({
        url: proxyUrl,
        withCredentials: false,
        isEvalSupported: false
      });

      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setPageInput('1');
      enqueueSnackbar(`PDF loaded: ${pdf.numPages} pages`, { variant: 'success' });
    } catch (error) {
      console.error('Error loading PDF:', error);
      setRenderError(true);
      enqueueSnackbar('Failed to load PDF. Try downloading instead.', { variant: 'warning' });
    } finally {
      setPdfLoading(false);
    }
  };

  const renderPage = async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Use the scale state for zoom
      const viewport = page.getViewport({ scale: scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
      setRenderError(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && !e.shiftKey) {
        handlePreviousPage();
      } else if (e.key === 'ArrowRight' && !e.shiftKey) {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' && e.shiftKey) {
        handlePreviousDoc();
      } else if (e.key === 'ArrowRight' && e.shiftKey) {
        handleNextDoc();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentDocIndex, currentPage, totalPages]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
    setPageInput(totalPages.toString());
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else {
      setPageInput(currentPage.toString());
      enqueueSnackbar(`Page must be between 1 and ${totalPages}`, { variant: 'warning' });
    }
  };

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 3)); // Max 3x zoom
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5)); // Min 0.5x zoom
  };

  const handleResetZoom = () => {
    setScale(1.5); // Reset to default
  };

  const handlePreviousDoc = () => {
    const newIndex = currentDocIndex > 0 ? currentDocIndex - 1 : documents.length - 1;
    setCurrentDocIndex(newIndex);
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleNextDoc = () => {
    const newIndex = currentDocIndex < documents.length - 1 ? currentDocIndex + 1 : 0;
    setCurrentDocIndex(newIndex);
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents/${currentDoc._id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Ensure filename has .pdf extension
        let filename = data.filename;
        if (!filename.toLowerCase().endsWith('.pdf')) {
          filename = filename + '.pdf';
        }
        
        try {
          // Fetch the actual file content
          const fileResponse = await fetch(data.downloadUrl);
          if (fileResponse.ok) {
            // Create blob and download
            const blob = await fileResponse.blob();
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the blob URL
            window.URL.revokeObjectURL(url);
            
            enqueueSnackbar(`Downloaded ${filename}`, { variant: 'success' });
          } else {
            throw new Error('Failed to fetch file');
          }
        } catch (fetchError) {
          console.error('File fetch error:', fetchError);
          // Fallback: open in new tab
          window.open(data.downloadUrl, '_blank');
          enqueueSnackbar('Download opened in new tab', { variant: 'info' });
        }
      } else {
        const error = await response.json();
        enqueueSnackbar(error.message || 'Download failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('Download error:', error);
      enqueueSnackbar('Network error', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(currentDoc.file.url, '_blank', 'noopener,noreferrer');
  };

  const getCategoryColor = (category) => {
    const colors = {
      policy: '#8B5CF6',
      procedure: '#EC4899',
      manual: '#10B981',
      report: '#F59E0B',
      contract: '#3B82F6',
      other: '#6B7280'
    };
    return colors[category] || colors.other;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!currentDoc) return null;

  const isPDF = currentDoc.file?.mimeType?.includes('pdf') || currentDoc.file?.originalName?.toLowerCase().endsWith('.pdf');
  const isImage = currentDoc.file?.mimeType?.includes('image');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#0f0f0f',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          height: '98vh', // Increased from 95vh
          maxHeight: '98vh',
          m: 1
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', py: 1, bgcolor: '#0f0f0f' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          {/* Left: Back Button + Document Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Back to Dashboard">
              <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Box sx={{ width: 1, height: 24, bgcolor: 'rgba(255,255,255,0.2)', mx: 0.5 }} />
            <Tooltip title="Previous Document">
              <IconButton onClick={handlePreviousDoc} size="small" sx={{ color: 'white' }}>
                <NavigateBeforeIcon />
              </IconButton>
            </Tooltip>
            <Chip
              label={`${currentDocIndex + 1} / ${documents.length}`}
              size="small"
              sx={{
                backgroundColor: getCategoryColor(currentDoc.category),
                color: 'white',
                fontWeight: 600,
                minWidth: 60,
                height: 24
              }}
            />
            <Tooltip title="Next Document">
              <IconButton onClick={handleNextDoc} size="small" sx={{ color: 'white' }}>
                <NavigateNextIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Center: Document Title */}
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              color: 'white',
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              flex: 1,
              textAlign: 'center'
            }}
          >
            {currentDoc.title}
          </Typography>

          {/* Right: Zoom + Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isPDF && (
              <>
                <Tooltip title="Zoom Out">
                  <IconButton onClick={handleZoomOut} size="small" sx={{ color: 'white' }} disabled={scale <= 0.5}>
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption" sx={{ color: 'white', minWidth: 45, textAlign: 'center' }}>
                  {Math.round(scale * 100)}%
                </Typography>
                <Tooltip title="Zoom In">
                  <IconButton onClick={handleZoomIn} size="small" sx={{ color: 'white' }} disabled={scale >= 3}>
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Box sx={{ width: 1, height: 24, bgcolor: 'rgba(255,255,255,0.2)', mx: 0.5 }} />
              </>
            )}
            <Tooltip title="Open in New Tab">
              <IconButton onClick={handleOpenInNewTab} size="small" sx={{ color: 'white' }}>
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton onClick={handleDownload} size="small" disabled={loading} sx={{ color: 'white' }}>
                {loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <DownloadIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#1a1a1a' }}>
        {/* Top Page Navigation Bar - DocHub Style */}
        {isPDF && totalPages > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: 1.5,
              px: 2,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              bgcolor: '#0f0f0f'
            }}
          >
            <IconButton 
              onClick={handlePreviousPage} 
              disabled={currentPage === 1}
              size="small"
              sx={{ color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : 'white' }}
            >
              <NavigateBeforeIcon />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <form onSubmit={handlePageInputSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TextField
                  value={pageInput}
                  onChange={handlePageInputChange}
                  size="small"
                  sx={{
                    width: 45,
                    '& input': {
                      textAlign: 'center',
                      py: 0.5,
                      px: 0.5,
                      fontSize: '0.875rem',
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: 1
                    },
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)'
                    },
                    '& .MuiOutlinedInput-root:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)'
                    }
                  }}
                />
                <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ fontSize: '0.875rem' }}>
                  / {totalPages}
                </Typography>
              </form>
            </Box>

            <IconButton 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              size="small"
              sx={{ color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : 'white' }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>
        )}

        {/* Document Viewer */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
            justifyContent: 'center',
            bgcolor: '#1a1a1a',
            overflow: 'auto', // Enable scrolling
            position: 'relative',
            p: 3
          }}
        >
          {pdfLoading ? (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
              <CircularProgress size={60} sx={{ color: '#8B5CF6', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Loading PDF...
              </Typography>
            </Box>
          ) : isPDF && pdfDoc && !renderError ? (
            /* PDF Canvas Viewer */
            <Box
              sx={{
                maxWidth: '100%',
                display: 'flex',
                justifyContent: 'center',
                bgcolor: 'white',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                borderRadius: 1,
                overflow: 'visible', // Changed from 'hidden'
                my: 2 // Add margin top and bottom
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </Box>
          ) : isPDF && renderError ? (
            /* PDF Load Error - Show Fallback */
            <Box sx={{ textAlign: 'center', p: 4, maxWidth: 500 }}>
              <Typography variant="h5" sx={{ mb: 2, color: '#8B5CF6' }}>
                Unable to Display PDF
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                This PDF cannot be displayed in the browser. Please use one of the options below:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<OpenInNewIcon />}
                  onClick={handleOpenInNewTab}
                  sx={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    px: 4
                  }}
                >
                  Open in New Tab
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                  onClick={handleDownload}
                  disabled={loading}
                  sx={{
                    borderColor: '#8B5CF6',
                    color: '#8B5CF6',
                    px: 4
                  }}
                >
                  {loading ? 'Downloading...' : 'Download PDF'}
                </Button>
              </Box>
            </Box>
          ) : isImage ? (
            /* Image Viewer */
            <Box
              component="img"
              src={currentDoc.file.url}
              alt={currentDoc.title}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          ) : (
            /* Unsupported File Type */
            <Box sx={{ textAlign: 'center', p: 4, maxWidth: 500 }}>
              <Typography variant="h5" sx={{ mb: 2, color: '#8B5CF6' }}>
                Preview Not Available
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                This file type cannot be previewed in the browser. Please download it to view on your device.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                  onClick={handleDownload}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    px: 4
                  }}
                >
                  {loading ? 'Downloading...' : 'Download Document'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<OpenInNewIcon />}
                  onClick={handleOpenInNewTab}
                  sx={{
                    borderColor: '#8B5CF6',
                    color: '#8B5CF6',
                    px: 4
                  }}
                >
                  Open in New Tab
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* Bottom Navigation Bar - DocHub Style */}
        {isPDF && totalPages > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: 1.5,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              bgcolor: '#0f0f0f'
            }}
          >
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              startIcon={<NavigateBeforeIcon />}
              sx={{
                color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : 'white',
                textTransform: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                },
                '&.Mui-disabled': {
                  color: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              Previous
            </Button>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', mx: 1 }}>
              Page {currentPage} of {totalPages}
            </Typography>

            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              endIcon={<NavigateNextIcon />}
              sx={{
                color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : 'white',
                textTransform: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                },
                '&.Mui-disabled': {
                  color: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              Next
            </Button>
          </Box>
        )}

        {/* Document Info Footer - Minimal */}
        <Box
          sx={{
            py: 1,
            px: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            bgcolor: '#0a0a0a',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
            {currentDoc.category} • {formatFileSize(currentDoc.file?.size || 0)} • Use ← → to navigate
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
