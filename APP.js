const canvas = document.getElementById('polylineCanvas');
const ctx = canvas.getContext('2d');
const wrapper = document.getElementById('canvasWrapper'); 

// Target the new status box in the right panel
const statusDisplay = document.getElementById('currentStatus');

// Application State
let polylines = []; 
let currentPolyline = null;
let mode = 'idle'; 
let selectedPoint = null;
let mousePos = { x: 0, y: 0 };

// --- FIX 1: Robust Canvas Sizing ---
function resizeCanvas() {
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    draw();
}
// Run once on load, and whenever the window changes size
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/**
 * State Manager: Updates logic, cursor, and the right-panel UI Text
 */
function setMode(newMode, uiText) {
    mode = newMode;
    if (statusDisplay) {
        statusDisplay.innerHTML = `Mode:<br><strong style="color: white;">${uiText}</strong>`;
    }
    switch(newMode) {
        case 'drawing': canvas.style.cursor = 'crosshair'; break;
        case 'moving_start': canvas.style.cursor = 'grab'; break;
        case 'moving_active': canvas.style.cursor = 'grabbing'; break;
        case 'deleting': canvas.style.cursor = 'crosshair'; break;
        default: canvas.style.cursor = 'default'; break;
    }
}

setMode('idle', 'Idle');

const getDist = (x1, y1, x2, y2) => Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);

function findClosest(x, y) {
    let closest = null;
    let min = 15; // Hitbox radius
    polylines.forEach((line, lIdx) => {
        line.forEach((pt, pIdx) => {
            let d = getDist(x, y, pt.x, pt.y);
            if (d < min) { 
                min = d; 
                closest = { lIdx, pIdx }; 
            }
        });
    });
    return closest;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw lines
    polylines.forEach(line => {
        if (line.length < 1) return;
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        line.forEach(pt => ctx.lineTo(pt.x, pt.y));
        ctx.strokeStyle = '#2563eb'; 
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw points
        line.forEach((pt, pIdx) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#0f172a';
            
            if (mode === 'moving_active' && selectedPoint && 
                selectedPoint.lIdx === polylines.indexOf(line) && 
                selectedPoint.pIdx === pIdx) {
                ctx.fillStyle = '#ef4444'; 
                ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2); 
            }
            ctx.fill();
        });
    });

    // Draw preview line
    if (mode === 'drawing' && currentPolyline && currentPolyline.length > 0) {
        const lastPt = currentPolyline[currentPolyline.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPt.x, lastPt.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.strokeStyle = '#94a3b8'; 
        ctx.setLineDash([5, 5]); 
        ctx.stroke();
        ctx.setLineDash([]); 
    }
}

// --- FIX 2: Bulletproof Mouse Coordinate Scaling ---
function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;    // Relationship bitmap vs. element for X
    const scaleY = canvas.height / rect.height;  // Relationship bitmap vs. element for Y
    
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

canvas.addEventListener('mousemove', (e) => {
    mousePos = getMousePos(e); // Use the new scaling function
    
    if (mode === 'moving_active' && selectedPoint) {
        polylines[selectedPoint.lIdx][selectedPoint.pIdx] = { ...mousePos };
    }
    draw();
});

canvas.addEventListener('mousedown', (e) => {
    mousePos = getMousePos(e); // Use the new scaling function

    if (mode === 'drawing' && currentPolyline) {
        currentPolyline.push({ ...mousePos });
        
    } else if (mode === 'deleting') {
        const target = findClosest(mousePos.x, mousePos.y);
        if (target) {
            polylines[target.lIdx].splice(target.pIdx, 1);
            if (polylines[target.lIdx].length === 0) polylines.splice(target.lIdx, 1);
        }
        setMode('idle', 'Idle');
        
    } else if (mode === 'moving_start') {
        selectedPoint = findClosest(mousePos.x, mousePos.y);
        if (selectedPoint) {
            setMode('moving_active', 'Placing...');
        } else {
            setMode('idle', 'Idle');
        }
        
    } else if (mode === 'moving_active') {
        setMode('idle', 'Idle');
        selectedPoint = null;
    }
    draw();
});

window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    
    if (k === 'b') {
        let newArr = [];
        polylines.push(newArr);
        currentPolyline = newArr;
        setMode('drawing', 'Drawing');
    } 
    else if (k === 'd') {
        setMode('deleting', 'Deleting');
        currentPolyline = null;
    } 
    else if (k === 'm') {
        setMode('moving_start', 'Select Point');
        currentPolyline = null;
    } 
    else if (k === 'r') {
        polylines = [];
        currentPolyline = null;
        setMode('idle', 'Cleared');
    } 
    else if (k === 'q') {
        setMode('quit', 'App Quit');
        currentPolyline = null;
    }
    else if (k === 'Escape') {
        setMode('idle', 'Idle');
        currentPolyline = null;
    }
    draw();
});
