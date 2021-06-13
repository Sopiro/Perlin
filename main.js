
// https://en.wikipedia.org/wiki/Linear_congruential_generator 
class PRNG 
{
    constructor(seed)
    {
        this.m = 0x80000000; // 2**31;
        this.a = 1103515245;
        this.c = 12345;

        this.state = (seed != undefined) ? seed : Math.floor(Math.random() * (this.m - 1));
    }

    nextInt()
    {
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state;
    }

    nextFloat() // 0.0 ~ 1.0
    {
        return this.nextInt() / (this.m - 1);
    }
}

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
        this.prng = new PRNG();

        this.updateSeed(seed);
    }

    updateSeed(seed)
    {
        switch (typeof seed)
        {
            case "string":
                this.seed = seed.hashCode();
                break;
            case "number":
                this.seed = seed;
                break;
            case "undefined":
                this.seed = Math.floor((Math.random() * (0x80000000 - 1)));
                break;

            default:
                break;
        }
    }

    getGradient(ix, iy)
    {
        let random = 2920.0 * Math.sin(ix * 21942.0 + iy * 171324.0 + 8912.0) * Math.cos(ix * 23157.0 * iy * 217832.0 + 9758.0);
        this.prng.state = this.seed + random;

        const rx = (this.prng.nextFloat() * 2.0) - 1.0;
        const ry = (this.prng.nextFloat() * 2.0) - 1.0;

        return new Vector2(rx, ry).normalized();
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

        // Range [-sqrt(N / 4), sqrt(N / 4)] where N is the noise dimension.
        // https://digitalfreepen.com/2017/06/20/range-perlin-noise.html

        // By multiflying sqrt(2), the output noise range become [-1 ~ 1]
        return this.interpolate(ix0, ix1, fy) * 1.4142;
    }

    octaveNoise(x, y, octaves, lacunarity, persistence)
    {
        let total = 0.0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;  // Used for normalizing result to 0.0 - 1.0

        for (let i = 0; i < octaves; i++)
        {
            total += this.noise(x * frequency, y * frequency) * amplitude;

            maxValue += amplitude;

            frequency = Math.pow(lacunarity, i + 1);
            amplitude = Math.pow(persistence, i + 1);
        }

        return total / maxValue;
    }
}

function generate(seed, scale, octaves, lacu, pers, iwidth, iheight, iscale)
{
    let perlin = new Perlin(seed);

    let cvs = document.getElementById("cvs");
    let ctx = cvs.getContext("2d");

    cvs.setAttribute("width", WIDTH);
    cvs.setAttribute("height", HEIGHT);

    let t = new Bitmap(iwidth, iheight);

    for (let y = 0; y < t.height; y++)
    {
        let yy = y / t.height * scale;
        for (let x = 0; x < t.width; x++)
        {
            let xx = x / t.width * scale;
            value = perlin.octaveNoise(xx, yy, octaves, lacu, pers);

            t.pixels[x + y * t.width] = grayScale((value + 1) * 0.5);
        }
    }

    t = convertBitmapToImageData(t, iscale);

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
    if (color < 0) color = 0;
    if (color >= 1) color = 1.0;

    let g = color * 255.0;

    return (g << 16) | (g << 8) | g;
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

var globalAlpha = 0xff;
var WIDTH = 600;
var HEIGHT = 600;

window.onload = () =>
{
    var btnGen = document.getElementById("gen");
    var txtIwidth = document.getElementById("iwidth");
    var txtIheight = document.getElementById("iheight");
    var txtIscale = document.getElementById("iscale");
    var txtSeed = document.getElementById("seed");
    var txtScale = document.getElementById("scale");
    var txtOctaves = document.getElementById("octaves");
    var txtLacunarity = document.getElementById("lacu");
    var txtPersistence = document.getElementById("pers");

    btnGen.onclick = () =>
    {
        let iwidth = txtIwidth.value == "" ? 300 : txtIwidth.value;
        let iheight = txtIheight.value == "" ? 300 : txtIheight.value;
        let iscale = txtIscale.value == "" ? 2.0 : txtIscale.value;
        let seed = txtSeed.value == "" ? undefined : txtSeed.value;
        let scale = txtScale.value == "" ? 2.0 : txtScale.value;
        let octaves = txtOctaves.value == "" ? 4 : txtOctaves.value;
        let lacu = txtLacunarity.value == "" ? 3 : txtLacunarity.value;
        let pers = txtPersistence.value == "" ? 0.2 : txtPersistence.value;

        generate(seed, scale, octaves, lacu, pers, iwidth, iheight, iscale);
    }

    btnGen.onclick();
}