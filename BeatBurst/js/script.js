let currentSong = new Audio();
let songs;
let currFolder;

//MINUTES TO SECONDS FUNCTION
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

//GETSONGS FUNCTION
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  // console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  // console.log(as);
  songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  //show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = " ";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                <img src="Images/music.svg" alt="">
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Priya</div>
                </div>
                <img src="Images/play1.svg" alt="">     
        </li>`;
  }
  //Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
    // console.log(e.querySelector(".info").firstElementChild.innerHTML);
  });
  return songs
}

//PLAYMUSIC FUNCTION
const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track
  if (!pause) {
      currentSong.play()
      play.src = "Images/pause.svg"
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track)
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
  console.log("displaying albums")
  let a = await fetch(`/songs/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  console.log(anchors);
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
      const e = array[index]; 
      if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
          let folder = e.href.split("/").slice(-2)[0]
          console.log(folder);
          // Get the metadata of the folder
          let a = await fetch(`/songs/${folder}/info.json`)
          let response = await a.json(); 
          cardContainer.innerHTML = cardContainer.innerHTML + `   <div  data-folder="${folder}" class="cards">
          <div  class="play">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="12" fill="#bca872" />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#000000"
                stroke-width="1.5"
              />
              <path
                d="M15.4531 12.3948C15.3016 13.0215 14.5857 13.4644 13.1539 14.3502C11.7697 15.2064 11.0777 15.6346 10.5199 15.4625C10.2893 15.3913 10.0793 15.2562 9.90982 15.07C9.5 14.6198 9.5 13.7465 9.5 12C9.5 10.2535 9.5 9.38018 9.90982 8.92995C10.0793 8.74381 10.2893 8.60868 10.5199 8.53753C11.0777 8.36544 11.7697 8.79357 13.1539 9.64983C14.5857 10.5356 15.3016 10.9785 15.4531 11.6052C15.5156 11.8639 15.5156 12.1361 15.4531 12.3948Z"
                stroke="#000000"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <img src="/songs/${folder}/cover.jpg" alt="">
          <h3>${response.title}</h3>
          <p>${response.description}</p>
        </div>`
      }
  }

  //Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("cards")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0])
    });
  });
}


//MAIN FUNCTION
async function main() {
  //Get the list of all the songs
  await getSongs("songs/Animal");
  // console.log(songs)
  playMusic(songs[0], true);

  displayAlbums();


  //Attach an eventListener to previous, play and next
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "Images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "Images/play.svg";
    }
  });

  //Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //Add an eventListener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add an eventListener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //Add an eventListener for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-500px";
  });

  //Add an eventListener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    // console.log("Previous clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    // console.log("Next clicked")

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  //add eventListener to mute the track
  document.querySelector('.volume > img').addEventListener("click",e=>{
    console.log(e.target);
    if(e.target.src.includes("Images/volume.svg")){
      e.target.src = e.target.src.replace("Images/volume.svg","Images/mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }else{
      e.target.src = e.target.src.replace("Images/mute.svg","Images/volume.svg")
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;


    }
  })

}
main();
