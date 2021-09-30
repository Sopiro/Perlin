// https://en.wikipedia.org/wiki/Linear_congruential_generator 
export class PRNG 
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
