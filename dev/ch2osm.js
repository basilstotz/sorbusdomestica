//file:///home/user/Downloads/ch1903wgs84_d.pdf

//WGS82 to LV95 and LV3

let phi0 = process.argv[2]*3600;
let lam0 = process.argv[3]*3600;

phi0 = 46*3600 + 2*60 + 38.87;
lam0 = 8*3600 * 43*60 + 49.79;

/*

lam                   = (lam0 - a)/10000
lam * 10000           =  lam0 -a
(lam * 10000) -lam0   = -a
lam0 - (lam*10000)    = a

Beispiel auf pdf:

lam=0.464729
lam0=(8*3600 * 43*60 + 49.79)

phi=0.326979
phi0=(46*3600 + 2*60 + 38.87)

*/

let a;
//a = (46*3600 + 2*60 + 38.87) - (0.326979*10000);
a = 169028.66;


let b;
b = (8*3600 * 43*60 + 49.79) - (0.464729*10000);
//b = 26782.5;


let phi = (phi0 - a)/10000.0;
let lam = (lam0 - b)/10000.0;


console.log(a+' '+b+' '+phi+' '+lam);

//LV95
let em = 2600072.37
    + 211455.93*lam
    - 1098.51*lam*phi
    - 0.36*lam*phi*phi
    - 44.54*lam*lam*lam;

let nm = 1200147.07
    + 308807.95*phi
    + 3745.25*lam*lam
    + 76.63*phi*phi
    - 194.56*lam*lam*phi
    + 119.79*phi*phi*phi;

//LV03
let xm = nm - 1000000.0;

let ym = em - 2000000.0;


console.log(xm+' '+ym);



