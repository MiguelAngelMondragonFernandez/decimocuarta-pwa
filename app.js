// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const switchCameraBtn = document.getElementById('switchCamera');
const closeCameraBtn = document.getElementById('closeCamera');
const canvas = document.getElementById('canvas');
const photoGallery = document.getElementById('photoGallery');
const clearGalleryBtn = document.getElementById('clearGallery');
const ctx = canvas.getContext('2d'); // Contexto 2D para dibujar en el Canvas

let stream = null; // Variable para almacenar el MediaStream de la cámara
let facingMode = 'environment'; // 'environment' para trasera, 'user' para frontal


/**
 * @function openCamera
 * @description Activa la cámara del dispositivo y muestra el streaming en el elemento de video.
 * Solicita permisos al usuario y actualiza la interfaz de usuario.
 */
async function openCamera() {
    try {
        // 1. Definición de Restricciones (Constraints)
        const constraints = {
            video: {
                facingMode: { ideal: facingMode }, // Usa la variable para seleccionar la cámara
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        // 2. Obtener el Stream de Medios
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // 3. Asignar el Stream al Elemento <video>
        video.srcObject = stream;
        
        // 4. Actualización de la UI
        cameraContainer.style.display = 'flex'; // Usar flex para centrar contenido
        openCameraBtn.style.display = 'none';
        clearGalleryBtn.style.display = 'none';
        
        console.log('Cámara abierta exitosamente');
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
}

/**
 * @function takePhoto
 * @description Captura el frame actual del video, lo dibuja en un canvas y lo convierte a una URL de datos.
 */
function takePhoto() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    // Asegurarse de que el canvas tenga las mismas dimensiones que el video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 1. Dibujar el Frame de Video en el Canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 2. Conversión a Data URL
    const imageDataURL = canvas.toDataURL('image/png');
    
    // 3. Añadir la foto a la galería
    const img = document.createElement('img');
    img.src = imageDataURL;
    img.addEventListener('click', () => downloadPhoto(imageDataURL));
    photoGallery.appendChild(img);
}

/**
 * @function closeCamera
 * @description Detiene el streaming de la cámara, libera los recursos y restaura la interfaz de usuario.
 */
function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;

        video.srcObject = null;
        cameraContainer.style.display = 'none';
        openCameraBtn.style.display = 'inline-block';
        clearGalleryBtn.style.display = 'inline-block';
        
        console.log('Cámara cerrada');
    }
}

/**
 * @function switchCamera
 * @description Cambia entre la cámara frontal y la trasera.
 */
async function switchCamera() {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    console.log('Cambiando a cámara:', facingMode);
    closeCamera();
    setTimeout(openCamera, 100);
}

/**
 * @function clearGallery
 * @description Limpia todas las fotos de la galería.
 */
function clearGallery() {
    photoGallery.innerHTML = '';
    console.log('Galería limpiada');
}

/**
 * @function downloadPhoto
 * @description Descarga una foto a partir de su URL de datos.
 * @param {string} imageDataURL - La URL de datos de la imagen a descargar.
 */
function downloadPhoto(imageDataURL) {
    const link = document.createElement('a');
    link.href = imageDataURL;
    link.download = `foto-${new Date().toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event listeners
openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);
switchCameraBtn.addEventListener('click', switchCamera);
closeCameraBtn.addEventListener('click', closeCamera);
clearGalleryBtn.addEventListener('click', clearGallery);

window.addEventListener('beforeunload', () => {
    closeCamera();
});