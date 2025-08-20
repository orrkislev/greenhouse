export function resizeImage(imageFile, size) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                const scale = Math.max(size / img.width, size / img.height);
                const newWidth = img.width * scale;
                const newHeight = img.height * scale;
                ctx.drawImage(img, (size - newWidth) / 2, (size - newHeight) / 2, newWidth, newHeight);
                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Canvas toBlob failed"));
                    },
                    "image/png", // or "image/png"
                    1 // quality (for jpeg)
                );
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });
}