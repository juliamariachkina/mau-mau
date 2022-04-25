const cards = document.querySelectorAll(".card");
let cardLocks = [false, false];

for (const card of cards) {
    card.addEventListener("click", (event) => rotatePicture(event));
}

function rotatePicture(event) {
    const cardId = event.target.getAttribute("id");
    const cardIdNumber = Number(cardId.substring(cardId.lastIndexOf('d') + 1));
    if (cardLocks[cardIdNumber])
        return; //Do nothing since a rotation is ongoing already
    cardLocks[cardIdNumber] = true;
    const transformStr = event.target.style.transform;
    const degrees = Number(transformStr.substring(transformStr.indexOf('(') + 1, transformStr.indexOf('deg)')));
    rotate3Degrees(60, degrees === 360 ? 0 : degrees, event.target, cardIdNumber);
}

function rotate3Degrees(its, degrees, target, cardIdNumber) {
    if (its === 0) {
        cardLocks[cardIdNumber] = false;
        return;
    }
    degrees += 3;
    target.style.transform = `rotateX(${degrees}deg)`;
    if (degrees === 90 || degrees === 270) {
        if (target.style.backgroundImage.includes("images/new-york-city.jpg")) {
            target.style.backgroundImage = "url(images/ocean.jpg)";
        } else {
            target.style.backgroundImage = "url(images/new-york-city.jpg)";
        }
    }
    setTimeout(rotate3Degrees, 30, --its, degrees, target, cardIdNumber);
}
