import { PRNG } from "./prng.js";
import { Vector2 } from "./vector2.js";

export class Perlin
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