import React, { useState, useRef } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Container, Grid, Card, 
         CardContent, CardActions, Typography, Button, IconButton, Switch, Tooltip, Input} from '@mui/material';
import { Delete, Brightness4, Brightness7 } from '@mui/icons-material';

const LenticularImageGenerator = () => {
  const [images, setImages] = useState([]);
  const [lpi, setLpi] = useState(75);
  const [dpi, setDpi] = useState(300);
  const [interlaceOrientation, setInterlaceOrientation] = useState('vertical');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const fileInputRef = useRef(null);
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [darkMode, setDarkMode] = useState(prefersDarkMode);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...newFiles]);
  };

  const generateLenticularImage = () => {
    if (images.length < 2) {
      alert('Please upload at least 2 images.');
      return;
    }
  
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    let minWidth = Infinity;
    let minHeight = Infinity;
    const imageElements = [];
  
    const lenticuleWidth = dpi / lpi; // Calculate lenticule width in pixels
    const stripWidth = Math.ceil(lenticuleWidth); // Round up to ensure complete strips
  
    const loadPromises = images.map((file) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          minWidth = Math.min(minWidth, img.width);
          minHeight = Math.min(minHeight, img.height);
          imageElements.push(img);
          resolve();
        };
        img.src = URL.createObjectURL(file);
      });
    });
  
    Promise.all(loadPromises).then(() => {
      canvas.width = minWidth;
      canvas.height = minHeight;
  
      for (let position = 0; position < (interlaceOrientation === 'vertical' ? minWidth : minHeight); position++) {
        const imageIndex = Math.floor(position / stripWidth) % images.length;
        const sourceImg = imageElements[imageIndex];
  
        if (interlaceOrientation === 'vertical') {
          ctx.drawImage( sourceImg, position, 0, 1, minHeight, position, 0, 1, minHeight );
        } else {
          ctx.drawImage( sourceImg, 0, position, minWidth, 1, 0, position, minWidth, 1 );
        }
      }
  
      const dataURL = canvas.toDataURL('image/png');
      setGeneratedImage(dataURL);
    });
  };
  
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default to allow drop
  };
  
  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;
  
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(index, 0, movedImage);
  
    setImages(updatedImages);
    setDraggedIndex(null);
  };
  
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ p: 2, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Typography variant="h5">Lenticular Image Generator</Typography>
            </Grid>
            <Grid item>
              <Tooltip title="Toggle Dark Mode">
                <IconButton onClick={toggleDarkMode}>
                  {darkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 2, mb: 4 }}>
          <CardContent>
            <Typography variant="h6">Upload Images</Typography>
            <div
              style={{
                border: '2px dashed',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              Drag and drop or click to upload
            </div>
          </CardContent>
          <CardActions>
            {images.length > 0 && (
              <Grid container spacing={2}>
                {images.map((image, index) => (
                  <Grid item xs={4} key={index}>
                    <Card sx={{ position: 'relative' }}>
                    <div 
                      key={index} 
                      draggable 
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      style={{
                        cursor: 'grab',
                        padding: '8px',
                        margin: '8px',
                        display: 'inline-block',
                        textAlign: 'center',
                        position: 'relative'
                      }}>
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt={`Uploaded ${index}`}
                        style={{ width: '100%', height: '100%', objectFit: 'scale-down' }}/>
                      <button 
                        onClick={() => removeImage(index)} 
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '24px',
                          height: '24px',
                          background: 'red',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          cursor: 'pointer'
                        }}>
                        ✕
                      </button>
                    </div>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardActions>
        </Card>

        <Card sx={{ p: 2, mb: 4 }}>
          <CardContent>
            <Typography variant="h6">Lenticular Settings</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <Typography>Lenticule Width (LPI)</Typography>
                <Input
                  type="number"
                  value={lpi}
                  onChange={(e) => setLpi(parseFloat(e.target.value))}
                  inputProps={{ step: 0.1, min: 10, max: 300 }}
                />
              </Grid>
              <Grid item xs={4}>
                <Typography>Base DPI</Typography>
                <Input
                  type="number"
                  value={dpi}
                  onChange={(e) => setDpi(parseFloat(e.target.value))}
                  inputProps={{ step: 0.1, min: 10, max: 300 }}
                />
              </Grid>
              <Grid item xs={4}>
                <Typography>Interlace Orientation</Typography>
                <Switch
                  checked={interlaceOrientation === 'horizontal'}
                  onChange={() =>
                    setInterlaceOrientation((prev) =>
                      prev === 'vertical' ? 'horizontal' : 'vertical'
                    )
                  }
                />
                <Typography variant="body2">
                  {interlaceOrientation === 'vertical' ? 'Vertical' : 'Horizontal'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              onClick={generateLenticularImage}
              disabled={images.length < 2}
              fullWidth
            >
              Generate Lenticular Image
            </Button>
          </CardActions>
        </Card>

        {generatedImage && (
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6">Generated Image</Typography>
              <img
                src={generatedImage}
                alt="Generated Lenticular"
                style={{ width: '100%', margin: '16px 0', borderRadius: '8px' }}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedImage;
                  link.download = 'lenticular-image.png';
                  link.click();
                }}
              >
                Download Image
              </Button>
            </CardContent>
          </Card>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default LenticularImageGenerator;