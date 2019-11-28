var socket = io(); // connection to the socket

socket.on("players", (playerData) => {
    console.log("Socket response:", playerData);
})

fetch("/players")
    .then(res => res.json())
    .then(players => {
        players.forEach(player => {
            addPlayerToList(player);
        });
    })

/* FUNCTIONS */

function submit() {
    fetch("/players", {
        method: "POST",
        body: new FormData(document.querySelector("form"))
    })
        .then(res => res.json())
        .then(player => {
            console.log("REST response:", player);
            addPlayerToList(player);
        })
}

function addPlayerToList(player) {
    document.querySelector("table").innerHTML += `
        <tr>
            <td>${player.name}</td>
            <td>(${player.email})</td>
        </tr>`;
}