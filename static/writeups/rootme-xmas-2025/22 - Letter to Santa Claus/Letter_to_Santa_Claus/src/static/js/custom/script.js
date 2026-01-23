/* Globals */
const url = document.location;

function has_class(element, cls){
    return element.classList.contains(cls);
}

/* Navbar */
const navbar = document.getElementById("nav");

function setActiveLink(){
    var target = url.toString();

    for(let i=0; i<navbar.children.length; i++){
        var element = navbar.children[i];

        if(has_class(element, "nav-link") && (element.href == target || element.href == "/" + target)){
            element.classList.add("active");
            element.removeAttribute("href");
            break;
        }
    };
}

/* Snowflakes Animation */
function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.innerHTML = '❄';
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.animationDuration = (Math.random() * 5 + 5) + 's';
    snowflake.style.opacity = Math.random() * 0.5 + 0.5;
    snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px';
    document.body.appendChild(snowflake);
    
    setTimeout(() => {
        snowflake.remove();
    }, 10000);
}

function startSnowfall() {
    // Create initial snowflakes
    for (let i = 0; i < 20; i++) {
        setTimeout(() => createSnowflake(), i * 500);
    }
    
    // Continue creating snowflakes
    setInterval(createSnowflake, 500);
}

window.onload = () => {
    setActiveLink();
    startSnowfall();
}

/* Custom Js */