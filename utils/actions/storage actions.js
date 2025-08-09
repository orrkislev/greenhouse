export function resizeImageTo128(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = 128;
                canvas.height = 128;
                const ctx = canvas.getContext("2d");
                // Draw the image scaled to 128x128
                ctx.drawImage(img, 0, 0, 128, 128);
                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Canvas toBlob failed"));
                    },
                    "image/jpeg", // or "image/png"
                    0.9 // quality (for jpeg)
                );
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });
}