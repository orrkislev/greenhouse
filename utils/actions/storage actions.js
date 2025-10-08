export function resizeImage(imageFile, size) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ratio = img.width / img.height;
                if (ratio > 1) {
                    canvas.width = size;
                    canvas.height = size / ratio;
                } else {
                    canvas.width = size * ratio;
                    canvas.height = size;
                }   
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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