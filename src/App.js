import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
  Switch,
  IconButton,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const LenticularImageGenerator = () => {
  const [images, setImages] = useState([]);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...newFiles]);
  };

  const handleDragStart = (index) => {
    setDraggedItem(index);
  };

  const handleDrop = (targetIndex) => {
    if (draggedItem === null || draggedItem === targetIndex) return;

    const updatedImages = [...images];
    const [removed] = updatedImages.splice(draggedItem, 1);
    updatedImages.splice(targetIndex, 0, removed);

    setImages(updatedImages);
    setDraggedItem(null);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const generateLenticularImage = async () => {
    if (images.length < 2) {
      alert('Please upload at least 2 images');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let maxWidth = 0;
    let maxHeight = 0;

    const loadedImages = await Promise.all(
      images.map((file) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            maxWidth = Math.max(maxWidth, img.width);
            maxHeight = Math.max(maxHeight, img.height);
            resolve(img);
          };
          img.src = URL.createObjectURL(file);
        })
      )
    );

    canvas.width = maxWidth;
    canvas.height = maxHeight;

    for (let x = 0; x < maxWidth; x++) {
      const imageIndex = x % loadedImages.length;
      const img = loadedImages[imageIndex];
      ctx.drawImage(img, x, 0, 1, maxHeight, x, 0, 1, maxHeight);
    }

    setGeneratedImage(canvas.toDataURL());
  };

  const downloadGeneratedImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.download = 'lenticular-image.png';
      link.href = generatedImage;
      link.click();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Lenticular Image Generator</Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="body1" mr={1}>
              Dark Mode
            </Typography>
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </Box>
        </Box>
        <Card>
          <CardHeader title="Upload Images" />
          <CardContent>
            <Box textAlign="center" onClick={() => fileInputRef.current.click()} mb={2}>
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <IconButton color="primary">
                <AddPhotoAlternateIcon fontSize="large" />
              </IconButton>
              <Typography>Click to upload images or drag and drop</Typography>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {images.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    border: dragOverItem === index ? '2px dashed #1976d2' : '2px solid #ccc',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    width: 150,
                    height: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.background.default,
                    cursor: 'grab',
                  }}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                >
                  <CardMedia
                    component="img"
                    src={URL.createObjectURL(image)}
                    alt={`Uploaded ${index}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <IconButton
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                    }}
                    onClick={() => removeImage(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Box mt={2} textAlign="center">
              <Button
                variant="contained"
                color="primary"
                onClick={generateLenticularImage}
                disabled={images.length < 2}
              >
                Generate Lenticular Image
              </Button>
            </Box>
            {generatedImage && (
              <Box mt={4} textAlign="center">
                <Typography variant="h6">Generated Lenticular Image</Typography>
                <CardMedia
                  component="img"
                  src={generatedImage}
                  alt="Generated Lenticular"
                  sx={{ maxWidth: '100%', maxHeight: 400, margin: '16px auto' }}
                />
                <Button variant="contained" color="secondary" onClick={downloadGeneratedImage}>
                  Download Image
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default LenticularImageGenerator;