setTimeout(function(){

    const messages = document.querySelectorAll('.success-message');

    messages.forEach(function(msg){

        msg.style.transition = "opacity 0.3s";

        msg.style.opacity = "0";

        setTimeout(function(){

            msg.remove();

        },300);

    });

},1000);

document.getElementById('attendance-filter-form').addEventListener('submit', function(e){

    e.preventDefault();

    const params = new URLSearchParams(
        new FormData(this)
    );

    fetch(window.location.pathname + '?' + params.toString())
    .then(response => response.text())
    .then(html => {

        const parser = new DOMParser();

        const doc = parser.parseFromString(
            html,
            'text/html'
        );

        const newDashboard =
            doc.querySelector('#attendance-dashboard');

        document.querySelector('#attendance-dashboard').innerHTML =
            newDashboard.innerHTML;

    });

});
