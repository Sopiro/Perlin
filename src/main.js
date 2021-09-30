'use strict'

import { Bitmap } from "./bitmap.js";
import { Perlin } from "./perlin.js";
import * as Util from "./util.js";

function generate(seed, scale, octaves, lacu, pers, iwidth, iheight, iscale, renderGrayScale)
{
    let perlin = new Perlin(seed);

    let cvs = document.getElementById("cvs");
    let ctx = cvs.getContext("2d");

    cvs.setAttribute("width", WIDTH);
    cvs.setAttribute("height", HEIGHT);

    let t = new Bitmap(iwidth, iheight);

    for (let y = 0; y < t.height; y++)
    {
        const yy = y / t.height * scale;
        for (let x = 0; x < t.width; x++)
        {
            const xx = x / t.width * scale;
            let value = perlin.octaveNoise(xx, yy, octaves, lacu, pers);
            value = (value + 1) * 0.5; // [-1 ~ 1] -> [0 -> 1]

            const color = renderGrayScale ? Util.grayScale(value) : Util.colorize(value);

            t.pixels[x + y * t.width] = color;
        }
    }

    t = Util.convertBitmapToImageData(t, iscale);

    ctx.putImageData(t, 0, 0)
}

const WIDTH = 600;
const HEIGHT = 600;

window.onload = () =>
{
    const btnGen = document.getElementById("gen");
    const txtIwidth = document.getElementById("iwidth");
    const txtIheight = document.getElementById("iheight");
    const txtIscale = document.getElementById("iscale");
    const txtSeed = document.getElementById("seed");
    const txtScale = document.getElementById("scale");
    const txtOctaves = document.getElementById("octaves");
    const txtLacunarity = document.getElementById("lacu");
    const txtPersistence = document.getElementById("pers");
    const ckbGrayscale = document.getElementById("grayscale");

    btnGen.onclick = () =>
    {
        const iwidth = txtIwidth.value == "" ? 300 : txtIwidth.value;
        const iheight = txtIheight.value == "" ? 300 : txtIheight.value;
        const iscale = txtIscale.value == "" ? 2.0 : txtIscale.value;
        const seed = txtSeed.value == "" ? undefined : txtSeed.value;
        const scale = txtScale.value == "" ? 4.0 : txtScale.value;
        const octaves = txtOctaves.value == "" ? 4 : txtOctaves.value;
        const lacu = txtLacunarity.value == "" ? 3 : txtLacunarity.value;
        const pers = txtPersistence.value == "" ? 0.2 : txtPersistence.value;
        const grayScale = ckbGrayscale.checked;

        generate(seed, scale, octaves, lacu, pers, iwidth, iheight, iscale, grayScale);
    }

    btnGen.onclick();
}