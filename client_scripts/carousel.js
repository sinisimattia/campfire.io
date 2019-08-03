/**
 * Add "/scripts/flickity.pkgd.min.js" before this script
 */

let carousel, n, p;
window.onload = () => {
    carousel = new Flickity('#menu' , {
        cellAlign: "center",
        contain: true,
        draggable: false,
        prevNextButtons: false,
        pageDots: false,
        fade: false
    });
};

n = () => {
    carousel.next(false, false);
}
p = () => {
    carousel.previous(false, false);
}