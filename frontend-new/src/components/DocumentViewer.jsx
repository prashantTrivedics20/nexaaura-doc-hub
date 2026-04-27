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

// Configure PDF.js worker - use CDN for production reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

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
  const [renderTask, setRenderTask] = useState(null); // Track current render task
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
      // Cleanup when component unmounts or document changes
      cancelCurrentRender();
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

  // Cleanup function to cancel ongoing render tasks
  const cancelCurrentRender = () => {
    if (renderTask) {
      renderTask.cancel();
      setRenderTask(null);
    }
  };

  const loadPDF = async () => {
    if (!currentDoc || !currentDoc._id) {
      setRenderError(true);
      enqueueSnackbar('Document ID not found', { variant: 'error' });
      console.error('❌ No document or document ID');
      return;
    }

    setPdfLoading(true);
    setRenderError(false);
    
    // Cancel any ongoing render tasks
    cancelCurrentRender();
    
    try {
      // Clean up previous PDF
      if (pdfDoc) {
        pdfDoc.destroy();
        setPdfDoc(null);
      }

      // Get token and build proxy URL with token as query parameter
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found');
        enqueueSnackbar('Authentication required. Please sign in again.', { variant: 'error' });
        setRenderError(true);
        setPdfLoading(false);
        return;
      }

      const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents/${currentDoc._id}/proxy?token=${encodeURIComponent(token)}`;

      console.log('📄 Loading PDF:', currentDoc.title);
      console.log('🔗 Proxy URL:', proxyUrl);
      console.log('📋 Document:', currentDoc);

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
      console.log('✅ PDF loaded successfully:', pdf.numPages, 'pages');
      enqueueSnackbar(`PDF loaded: ${pdf.numPages} pages`, { variant: 'success' });
    } catch (error) {
      console.error('❌ Error loading PDF:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setRenderError(true);
      enqueueSnackbar('Failed to load PDF. Try downloading instead.', { variant: 'error' });
    } finally {
      setPdfLoading(false);
    }
  };

  const renderPage = async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) {
      console.warn('⚠️ Cannot render: pdfDoc or canvas not available');
      return;
    }

    // Cancel any ongoing render task before starting a new one
    cancelCurrentRender();

    try {
      console.log(`🎨 Rendering page ${pageNum}/${totalPages}`);
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Clear the canvas before rendering
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Use the scale state for zoom
      const viewport = page.getViewport({ scale: scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      // Start the render task and store it
      const newRenderTask = page.render(renderContext);
      setRenderTask(newRenderTask);

      // Wait for render to complete
      await newRenderTask.promise;
      
      // Clear the render task when done
      setRenderTask(null);
      console.log(`✅ Page ${pageNum} rendered successfully`);
      
    } catch (error) {
      // Check if error is due to cancellation (which is expected)
      if (error.name === 'RenderingCancelledException') {
        console.log('🔄 Render cancelled (expected behavior)');
        return;
      }
      
      console.error('❌ Error rendering page:', error);
      setRenderError(true);
      enqueueSnackbar('Error rendering page', { variant: 'error' });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      
      if (e.key === 'Escape') {
        handleClose();
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

  const handleClose = () => {
    // Cancel any ongoing render tasks when closing
    cancelCurrentRender();
    onClose();
  };

  const handlePreviousDoc = () => {
    // Cancel current render before switching documents
    cancelCurrentRender();
    const newIndex = currentDocIndex > 0 ? currentDocIndex - 1 : documents.length - 1;
    setCurrentDocIndex(newIndex);
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleNextDoc = () => {
    // Cancel current render before switching documents
    cancelCurrentRender();
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
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#ffffff',
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          height: '95vh',
          maxHeight: '95vh',
          m: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          borderBottom: '2px solid #f0f0f0',
          py: 2,
          px: 3,
          bgcolor: '#ffffff',
          background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          {/* Left: Back Button + Document Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title="Back to Dashboard" arrow>
              <IconButton 
                onClick={handleClose} 
                size="medium" 
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ width: 2, height: 32, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1, mx: 0.5 }} />
            
            <Tooltip title="Previous Document (Shift + ←)" arrow>
              <IconButton 
                onClick={handlePreviousDoc} 
                size="medium" 
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    transform: 'translateX(-2px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <NavigateBeforeIcon />
              </IconButton>
            </Tooltip>
            
            <Chip
              label={`${currentDocIndex + 1} / ${documents.length}`}
              size="medium"
              sx={{
                bgcolor: 'white',
                color: '#00bcd4',
                fontWeight: 700,
                fontSize: '0.875rem',
                minWidth: 70,
                height: 32,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                '& .MuiChip-label': {
                  px: 2
                }
              }}
            />
            
            <Tooltip title="Next Document (Shift + →)" arrow>
              <IconButton 
                onClick={handleNextDoc} 
                size="medium" 
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    transform: 'translateX(2px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <NavigateNextIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Center: Document Title */}
          <Box sx={{ flex: 1, textAlign: 'center', px: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                fontSize: '1.1rem'
              }}
            >
              {currentDoc.title}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: 1
              }}
            >
              {currentDoc.category}
            </Typography>
          </Box>

          {/* Right: Zoom + Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isPDF && (
              <>
                <Tooltip title="Zoom Out" arrow>
                  <span>
                    <IconButton 
                      onClick={handleZoomOut} 
                      size="medium" 
                      disabled={scale <= 0.5}
                      sx={{ 
                        color: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
                        '&.Mui-disabled': { 
                          color: 'rgba(255, 255, 255, 0.3)',
                          bgcolor: 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                    >
                      <ZoomOutIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                
                <Box 
                  sx={{ 
                    bgcolor: 'white',
                    color: '#00bcd4',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    minWidth: 55,
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {Math.round(scale * 100)}%
                </Box>
                
                <Tooltip title="Zoom In" arrow>
                  <span>
                    <IconButton 
                      onClick={handleZoomIn} 
                      size="medium" 
                      disabled={scale >= 3}
                      sx={{ 
                        color: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
                        '&.Mui-disabled': { 
                          color: 'rgba(255, 255, 255, 0.3)',
                          bgcolor: 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                
                <Box sx={{ width: 2, height: 32, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1, mx: 0.5 }} />
              </>
            )}
            
            <Tooltip title="Open in New Tab" arrow>
              <IconButton 
                onClick={handleOpenInNewTab} 
                size="medium" 
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Download Document" arrow>
              <IconButton 
                onClick={handleDownload} 
                size="medium" 
                disabled={loading} 
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <DownloadIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Close (Esc)" arrow>
              <IconButton 
                onClick={handleClose} 
                size="medium" 
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': { 
                    bgcolor: '#ff6b6b',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f5f5f5' }}>
        {/* Top Page Navigation Bar - Enhanced Style */}
        {isPDF && totalPages > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: 2,
              px: 3,
              borderBottom: '2px solid #e0e0e0',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Tooltip title="First Page" arrow>
              <span>
                <IconButton 
                  onClick={handleFirstPage} 
                  disabled={currentPage === 1}
                  size="medium"
                  sx={{ 
                    color: currentPage === 1 ? '#ccc' : '#00bcd4',
                    bgcolor: currentPage === 1 ? '#f5f5f5' : '#e0f7fa',
                    '&:hover': { 
                      bgcolor: currentPage === 1 ? '#f5f5f5' : '#b2ebf2',
                      transform: currentPage === 1 ? 'none' : 'scale(1.05)'
                    },
                    transition: 'all 0.2s',
                    '&.Mui-disabled': {
                      color: '#ccc',
                      bgcolor: '#f5f5f5'
                    }
                  }}
                >
                  <FirstPageIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Previous Page (←)" arrow>
              <span>
                <IconButton 
                  onClick={handlePreviousPage} 
                  disabled={currentPage === 1}
                  size="medium"
                  sx={{ 
                    color: currentPage === 1 ? '#ccc' : '#00bcd4',
                    bgcolor: currentPage === 1 ? '#f5f5f5' : '#e0f7fa',
                    '&:hover': { 
                      bgcolor: currentPage === 1 ? '#f5f5f5' : '#b2ebf2',
                      transform: currentPage === 1 ? 'none' : 'translateX(-2px)'
                    },
                    transition: 'all 0.2s',
                    '&.Mui-disabled': {
                      color: '#ccc',
                      bgcolor: '#f5f5f5'
                    }
                  }}
                >
                  <NavigateBeforeIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'white', px: 2, py: 1, borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 188, 212, 0.15)' }}>
              <form onSubmit={handlePageInputSubmit} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                    Page
                  </Typography>
                  <TextField
                    value={pageInput}
                    onChange={handlePageInputChange}
                    size="small"
                    sx={{
                      width: 55,
                      '& input': {
                        textAlign: 'center',
                        py: 0.75,
                        px: 1,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#00bcd4',
                        bgcolor: '#e0f7fa',
                        borderRadius: 1.5
                      },
                      '& fieldset': {
                        borderColor: '#00bcd4',
                        borderWidth: 2
                      },
                      '& .MuiOutlinedInput-root:hover fieldset': {
                        borderColor: '#0097a7'
                      },
                      '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                        borderColor: '#00bcd4'
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                    of {totalPages}
                  </Typography>
                </Box>
              </form>
            </Box>

            <Tooltip title="Next Page (→)" arrow>
              <span>
                <IconButton 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                  size="medium"
                  sx={{ 
                    color: currentPage === totalPages ? '#ccc' : '#00bcd4',
                    bgcolor: currentPage === totalPages ? '#f5f5f5' : '#e0f7fa',
                    '&:hover': { 
                      bgcolor: currentPage === totalPages ? '#f5f5f5' : '#b2ebf2',
                      transform: currentPage === totalPages ? 'none' : 'translateX(2px)'
                    },
                    transition: 'all 0.2s',
                    '&.Mui-disabled': {
                      color: '#ccc',
                      bgcolor: '#f5f5f5'
                    }
                  }}
                >
                  <NavigateNextIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Last Page" arrow>
              <span>
                <IconButton 
                  onClick={handleLastPage} 
                  disabled={currentPage === totalPages}
                  size="medium"
                  sx={{ 
                    color: currentPage === totalPages ? '#ccc' : '#00bcd4',
                    bgcolor: currentPage === totalPages ? '#f5f5f5' : '#e0f7fa',
                    '&:hover': { 
                      bgcolor: currentPage === totalPages ? '#f5f5f5' : '#b2ebf2',
                      transform: currentPage === totalPages ? 'none' : 'scale(1.05)'
                    },
                    transition: 'all 0.2s',
                    '&.Mui-disabled': {
                      color: '#ccc',
                      bgcolor: '#f5f5f5'
                    }
                  }}
                >
                  <LastPageIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}

        {/* Document Viewer */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            bgcolor: '#f5f5f5',
            overflow: 'auto',
            position: 'relative',
            p: 4
          }}
        >
          {pdfLoading ? (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
              <CircularProgress size={70} thickness={4} sx={{ color: '#00bcd4', mb: 3 }} />
              <Typography variant="h6" sx={{ color: '#00bcd4', fontWeight: 600, mb: 1 }}>
                Loading PDF...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we prepare your document
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
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                borderRadius: 2,
                overflow: 'visible',
                my: 2,
                border: '1px solid #e0e0e0'
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
            <Box sx={{ textAlign: 'center', p: 5, maxWidth: 600, bgcolor: 'white', borderRadius: 3, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)' }}>
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: '#ffe0e0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  border: '3px solid #ff6b6b'
                }}
              >
                <CloseIcon sx={{ fontSize: 40, color: '#ff6b6b' }} />
              </Box>
              <Typography variant="h5" sx={{ mb: 2, color: '#333', fontWeight: 700 }}>
                Unable to Display PDF
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                This PDF cannot be displayed in the browser. Please use one of the options below to access your document:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<OpenInNewIcon />}
                  onClick={handleOpenInNewTab}
                  sx={{
                    bgcolor: '#00bcd4',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)',
                    '&:hover': {
                      bgcolor: '#0097a7',
                      boxShadow: '0 6px 16px rgba(0, 188, 212, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s'
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
                    borderColor: '#00bcd4',
                    color: '#00bcd4',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: 2,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: '#0097a7',
                      bgcolor: '#e0f7fa',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s'
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
                objectFit: 'contain',
                borderRadius: 2,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e0e0e0'
              }}
            />
          ) : (
            /* Unsupported File Type */
            <Box sx={{ textAlign: 'center', p: 5, maxWidth: 600, bgcolor: 'white', borderRadius: 3, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)' }}>
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: '#e0f7fa', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  border: '3px solid #00bcd4'
                }}
              >
                <DownloadIcon sx={{ fontSize: 40, color: '#00bcd4' }} />
              </Box>
              <Typography variant="h5" sx={{ mb: 2, color: '#333', fontWeight: 700 }}>
                Preview Not Available
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                This file type cannot be previewed in the browser. Please download it to view on your device.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                  onClick={handleDownload}
                  disabled={loading}
                  sx={{
                    bgcolor: '#00bcd4',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)',
                    '&:hover': {
                      bgcolor: '#0097a7',
                      boxShadow: '0 6px 16px rgba(0, 188, 212, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s'
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
                    borderColor: '#00bcd4',
                    color: '#00bcd4',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: 2,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: '#0097a7',
                      bgcolor: '#e0f7fa',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  Open in New Tab
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* Bottom Navigation Bar - Enhanced Style */}
        {isPDF && totalPages > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
              py: 2,
              px: 3,
              borderTop: '2px solid #e0e0e0',
              bgcolor: '#ffffff',
              boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Left: Previous Button */}
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              startIcon={<NavigateBeforeIcon />}
              sx={{
                color: currentPage === 1 ? '#ccc' : '#00bcd4',
                bgcolor: currentPage === 1 ? '#f5f5f5' : '#e0f7fa',
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: currentPage === 1 ? '#f5f5f5' : '#b2ebf2',
                  transform: currentPage === 1 ? 'none' : 'translateX(-2px)'
                },
                '&.Mui-disabled': {
                  color: '#ccc',
                  bgcolor: '#f5f5f5'
                },
                transition: 'all 0.2s'
              }}
            >
              Previous
            </Button>

            {/* Center: Page Info */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                bgcolor: '#e0f7fa',
                px: 3,
                py: 1,
                borderRadius: 2,
                border: '2px solid #00bcd4'
              }}
            >
              <Typography variant="body1" sx={{ color: '#00bcd4', fontWeight: 700, fontSize: '1rem' }}>
                Page {currentPage}
              </Typography>
              <Box sx={{ width: 2, height: 20, bgcolor: '#00bcd4', borderRadius: 1 }} />
              <Typography variant="body1" sx={{ color: '#666', fontWeight: 600, fontSize: '1rem' }}>
                of {totalPages}
              </Typography>
            </Box>

            {/* Right: Next Button */}
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              endIcon={<NavigateNextIcon />}
              sx={{
                color: currentPage === totalPages ? '#ccc' : '#00bcd4',
                bgcolor: currentPage === totalPages ? '#f5f5f5' : '#e0f7fa',
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: currentPage === totalPages ? '#f5f5f5' : '#b2ebf2',
                  transform: currentPage === totalPages ? 'none' : 'translateX(2px)'
                },
                '&.Mui-disabled': {
                  color: '#ccc',
                  bgcolor: '#f5f5f5'
                },
                transition: 'all 0.2s'
              }}
            >
              Next
            </Button>
          </Box>
        )}

        {/* Document Info Footer - Enhanced */}
        <Box
          sx={{
            py: 1.5,
            px: 3,
            borderTop: '1px solid #e0e0e0',
            bgcolor: '#fafafa',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Chip
            label={currentDoc.category.toUpperCase()}
            size="small"
            sx={{
              bgcolor: getCategoryColor(currentDoc.category),
              color: 'white',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 22,
              letterSpacing: 0.5
            }}
          />
          <Typography variant="caption" sx={{ color: '#999', fontSize: '0.8rem' }}>
            •
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.8rem', fontWeight: 600 }}>
            {formatFileSize(currentDoc.file?.size || 0)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#999', fontSize: '0.8rem' }}>
            •
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.8rem', fontWeight: 500 }}>
            Use ← → to navigate pages • Shift + ← → to switch documents
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
