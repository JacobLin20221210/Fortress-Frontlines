import * as handTrack from 'handtrackjs';

let video;
let canvas;
let ctx;
let model;
const videoParams = {
    flipHorizontal: true, // Flip video for a mirror-like effect
    maxNumBoxes: 1,       // Detect one hand at a time
    scoreThreshold: 0.6,  // Minimum confidence threshold
};

// Initialize the hand tracking model
async function loadModel() {
    model = await handTrack.load(videoParams);
    console.log("HandTrack.js model loaded.");
}

// Start video capture and detection
async function startVideo() {
    video = document.createElement("video");
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");

    // Set canvas dimensions
    canvas.width = 640;
    canvas.height = 480;

    // Start video stream
    const status = await handTrack.startVideo(video);
    if (status) {
        video.width = canvas.width;
        video.height = canvas.height;
        detectHands();
    } else {
        console.error("Camera access denied or not available.");
    }
}

// Detect hands and draw predictions
async function detectHands() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video feed
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Make predictions
    const predictions = await model.detect(video);
    drawPredictions(predictions);

    requestAnimationFrame(detectHands);
}

// Draw bounding boxes and lines for detected hands
function drawPredictions(predictions) {
    predictions.forEach((prediction) => {
        const [x, y, width, height] = prediction.bbox;
        const label = prediction.label;
        const score = (prediction.score * 100).toFixed(2);

        // Draw bounding box
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw label
        ctx.fillStyle = "green";
        ctx.font = "16px Arial";
        ctx.fillText(`${label} (${score}%)`, x, y - 10);

        // Draw lines between points (simulated connections)
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        drawHandLines(centerX, centerY, width);
    });
}

// Simulated lines for hand detection
function drawHandLines(centerX, centerY, size) {
    const points = [
        { x: centerX - size * 0.2, y: centerY - size * 0.2 },
        { x: centerX + size * 0.2, y: centerY - size * 0.2 },
        { x: centerX, y: centerY + size * 0.3 },
    ];

    // Draw points
    points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
    });

    // Draw lines between points
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();
    ctx.stroke();
}

// Load model and start video when the page loads
window.onload = async () => {
    await loadModel();
    await startVideo();
};
