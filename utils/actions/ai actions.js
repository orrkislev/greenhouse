'use server'

export async function generateImage(subject, style) {

    const prompt = `1 - translate the following subject to english: ${subject}
    2 - create a list of elements that represent the subject
    3 - generate an image of these elements, using the following style: ${JSON.stringify(style)}
    `

    // const url = 'https://api.getimg.ai/v1/flux-schnell/text-to-image';
    const url = 'https://api.getimg.ai/v1/stable-diffusion-xl/text-to-image';

    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: `Bearer ${process.env.GETIMG_KEY}`
        },
        body: JSON.stringify({ prompt })
    };

    const res = await fetch(url, options)
    const json = await res.json();
    const binary = atob(json.image);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'image/png' });
}
