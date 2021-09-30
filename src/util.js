export function convertBitmapToImageData(bitmap, scale)
{
    const res = new ImageData(bitmap.width * scale, bitmap.height * scale);

    for (let y = 0; y < bitmap.height; y++)
    {
        for (let x = 0; x < bitmap.width; x++)
        {
            const bitmapPixel = bitmap.pixels[x + y * bitmap.width]

            const r = (bitmapPixel >> 16) & 0xff;
            const g = (bitmapPixel >> 8) & 0xff;
            const b = bitmapPixel & 0xff;

            for (let ys = 0; ys < scale; ys++)
            {
                for (let xs = 0; xs < scale; xs++)
                {
                    const ptr = ((x * scale) + xs + ((y * scale) + ys) * res.width) * 4;

                    res.data[ptr] = r;
                    res.data[ptr + 1] = g;
                    res.data[ptr + 2] = b;
                    res.data[ptr + 3] = globalAlpha;
                }
            }
        }
    }

    return res;
}

export function randomColor()
{
    let r = Math.trunc(Math.random() * 255);
    let g = Math.trunc(Math.random() * 255);
    let b = Math.trunc(Math.random() * 255);

    return (r << 16) | (g << 8) | b;
}

export function grayScale(color)
{
    if (color < 0) color = 0;
    if (color >= 1) color = 1.0;

    let g = color * 255.0;

    return (g << 16) | (g << 8) | g;
}

export function colorize(v)
{
    if (v < 0) v = 0;
    if (v >= 1) v = 1;

    if (v > 0 && v <= 0.35) // Ocean
    {
        return 0x0D2851;
    }
    else if (v > 0.35 && v <= 0.5)
    {
        return 0x173C72;
    }
    else if (v > 0.5 && v <= 0.55)
    {
        return 0x1D4B8D;
    }
    else if (v > 0.55 && v <= 0.6) // Sand
    {
        return 0xF9D986;
    }
    else if (v > 0.6 && v <= 0.7) // Grass
    {
        return 0x689A19;
    }
    else if (v > 0.7 && v <= 1.0)
    {
        return 0x427E1F
    }
}

// https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
String.prototype.hashCode = function ()
{
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++)
    {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

const globalAlpha = 0xff;
