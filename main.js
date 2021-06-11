class Vector2
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    addS(s)
    {
        return new Vector2(this.x + s, this.y + s);
    }

    subS(s)
    {
        return new Vector2(this.x - s, this.y - s);
    }

    mulS(s)
    {
        return new Vector2(this.x * s, this.y * s);
    }

    divS(s)
    {
        return new Vector2(this.x / s, this.y / s);
    }

    addV(v)
    {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subV(v)
    {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    mulV(v)
    {
        return new Vector2(this.x * v.x, this.y * v.y);
    }

    divV(v)
    {
        return new Vector2(this.x / v.x, this.y / v.y);
    }

    len()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalized()
    {
        const len = this.len();

        return new Vector2(this.x / len, this.y / len);
    }

    dot(v)
    {
        return this.x * v.x + this.y * v.y;
    }
}

class Bitmap
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;
        this.pixels = new Uint32Array(width * height);
    }

    render(bitmap, ox, oy)
    {
        for (let y = 0; y < bitmap.height; y++)
        {
            let yy = oy + y;
            if (yy < 0 || yy >= this.height)
                continue;
            for (let x = 0; x < bitmap.width; x++)
            {
                let xx = ox + x;
                if (xx < 0 || xx >= this.width)
                    continue;

                const color = bitmap.pixels[x + y * bitmap.width];

                this.pixels[xx + yy * this.width] = color;
            }
        }
    }

    clear(color)
    {
        for (let i = 0; i < this.pixels.length; i++)
            this.pixels[i] = color;
    }
}

class Perlin
{
    constructor(seed)
    {
        this.seed = seed;
    }

    // From https://en.wikipedia.org/wiki/Perlin_noise#Implementation
    getGradient(ix, iy)
    {
        let random = 2920.0 * Math.sin(ix * 21942.0 + iy * 171324.0 + 8912.0) * Math.cos(ix * 23157.0 * iy * 217832.0 + 9758.0);
        return new Vector2(Math.cos(random), Math.sin(random));
    }

    dotGridGradient(ix, iy, x, y)
    {
        const gradient = this.getGradient(ix, iy);

        const dx = x - ix;
        const dy = y - iy;

        return (dx * gradient.x + dy * gradient.y);
    }

    interpolate(a0, a1, w)
    {
        if (0.0 > w) return a0;
        if (1.0 < w) return a1;

        // Linear interpolation
        // return (a1 - a0) * w + a0;

        // Smooth interpolation
        // return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;

        // Smoother interpolation
        return (a1 - a0) * ((w * (w * 6.0 - 15.0) + 10.0) * w * w * w) + a0;
    }

    noise(x, y)
    {
        let x0 = Math.trunc(x);
        let y0 = Math.trunc(y);
        let x1 = x0 + 1;
        let y1 = y0 + 1;

        // Extract fractional part
        let fx = x - x0;
        let fy = y - y0;

        let n0 = this.dotGridGradient(x0, y0, x, y);
        let n1 = this.dotGridGradient(x1, y0, x, y);
        let ix0 = this.interpolate(n0, n1, fx);

        n0 = this.dotGridGradient(x0, y1, x, y);
        n1 = this.dotGridGradient(x1, y1, x, y);
        let ix1 = this.interpolate(n0, n1, fx);

        return this.interpolate(ix0, ix1, fy);
    }
}

function main()
{
    let perlin = new Perlin(0);

    let cvs = document.getElementById("cvs");
    let ctx = cvs.getContext("2d");

    cvs.setAttribute("width", 800);
    cvs.setAttribute("height", 600);

    let t = new Bitmap(600, 600);

    const scale = 5;

    for (let y = 0; y < t.height; y++)
    {
        let yy = y / t.height * scale;
        for (let x = 0; x < t.width; x++)
        {
            let xx = x / t.width * scale;

            t.pixels[x + y * t.width] = grayScale((perlin.noise(xx, yy) + 1) * 128);
        }
    }

    t = convertBitmapToImageData(t, 1);

    ctx.putImageData(t, 0, 0)
}

function convertBitmapToImageData(bitmap, scale)
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

function randomColor()
{
    let r = Math.trunc(Math.random() * 255);
    let g = Math.trunc(Math.random() * 255);
    let b = Math.trunc(Math.random() * 255);

    return (r << 16) | (g << 8) | b;
}

function grayScale(color)
{
    let g = Math.trunc(color) & 0xff;

    return (g << 16) | (g << 8) | g;
}

var globalAlpha = 0xff;

window.onload = () =>
{
    main();
}