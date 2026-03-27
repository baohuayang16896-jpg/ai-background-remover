const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const resultArea = document.getElementById('resultArea');
const loading = document.getElementById('loading');
const originalImg = document.getElementById('originalImg');
const resultImg = document.getElementById('resultImg');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

let processedImageUrl = '';

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

async function handleFile(file) {
    originalImg.src = URL.createObjectURL(file);
    uploadArea.style.display = 'none';
    loading.style.display = 'block';

    try {
        const response = await fetch('/api/remove-bg', {
            method: 'POST',
            body: file
        });

        if (!response.ok) throw new Error('处理失败');

        const blob = await response.blob();
        processedImageUrl = URL.createObjectURL(blob);
        resultImg.src = processedImageUrl;

        loading.style.display = 'none';
        resultArea.style.display = 'block';
    } catch (error) {
        alert('处理失败: ' + error.message);
        reset();
    }
}

downloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = processedImageUrl;
    a.download = 'removed-bg.png';
    a.click();
});

resetBtn.addEventListener('click', reset);

function reset() {
    uploadArea.style.display = 'block';
    resultArea.style.display = 'none';
    loading.style.display = 'none';
    fileInput.value = '';
}
