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
    // From https://en.wikipedia.org/wiki/Perlin_noise#Implementation
    getGradient(ix, iy)
    {
        let random = 2920.0 * Math.sin(ix * 21942.0 + iy * 171324.0 + 8912.0) * Math.cos(ix * 23157.0 * iy * 217832.0 + 9758.0);
        return new Vector2(Math.cos(random), Math.sin(random));
    }
}

function main()
{
    let perlin = new Perlin();

    let cvs = document.getElementById("cvs");
    let ctx = cvs.getContext("2d");

    cvs.setAttribute("width", 800);
    cvs.setAttribute("height", 600);

    let t = new Bitmap(100, 100);

    for(let i = 0; i < t.pixels.length; i++)
    {
        t.pixels[i] = randomColor();
    }

    t = convertBitmapToImageData(t, 4);

    ctx.putImageData(t, 30, 30)
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

var globalAlpha = 0xff;

window.onload = () =>
{
    main();
}