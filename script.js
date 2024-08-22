let currentSongIndex = 0;
let currentSong = new Audio();
let Songs = [];
const seekbar = document.getElementById("seek-bar");
let currFolder = "";

function convertSeconds(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);
  let formattedTime = `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
  return formattedTime;
}
//https://vaibhavrajharsh.github.io/Music-Player/musics/MyFavourates/Afsane.mp3
async function getSongs(folder) {
  Songs = []; // Clear the Songs array to avoid duplication
  currFolder = folder;
  let a = await fetch(`https://vaibhavrajharsh.github.io/Music-Player/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let list = div.getElementsByTagName("a");
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    if (element.href.endsWith(".mp3")) {
      Songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }
  let SongDiv = document.querySelector(".lists ul");
  SongDiv.innerHTML = "";
  for (const song of Songs) {
    SongDiv.innerHTML += `
      <li>
        <div class="li-song">
          <img src="images/music.svg" alt=""><p>${song.replaceAll("%20", " ").replace(".mp3", "")}</p>
        </div>
      </li>`;
  }

  Array.from(document.querySelectorAll(".lists li")).forEach((e, index) => {
    e.addEventListener("click", () => {
      currentSongIndex = index; // Update the current song index
      playMusic(Songs[currentSongIndex].replaceAll("%20", " ").replace(".mp3", ""));
    });
  });
}

const playMusic = (track) => {
  currentSong.src = `/${currFolder}/` + track + ".mp3";
  currentSong.play();
  play.src = "images/pause.svg"; // Update play button to pause icon
  document.querySelector(".current-song p").innerHTML = track;
  
  currentSong.addEventListener("loadedmetadata", () => {
    document.querySelector(".duration").innerHTML = convertSeconds(currentSong.duration);
  });
  
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".current-duration").innerHTML = convertSeconds(currentSong.currentTime);
    const percentage = (currentSong.currentTime / currentSong.duration) * 100;
    seekbar.value = percentage;
  });

  currentSong.addEventListener("ended", () => {
    playNextSong();
  });
};

const playNextSong = () => {
  currentSongIndex = (currentSongIndex + 1) % Songs.length;
  playMusic(Songs[currentSongIndex].replaceAll("%20", " ").replace(".mp3", ""));
};

const playPreviousSong = () => {
  currentSongIndex = (currentSongIndex - 1 + Songs.length) % Songs.length;
  playMusic(Songs[currentSongIndex].replaceAll("%20", " ").replace(".mp3", ""));
};

async function main() {
  await getSongs("musics/PartySongs");

  play.addEventListener("click", () => {
    if (!currentSong.src || currentSong.paused) {
      if (!currentSong.src) {
        currentSongIndex = 0;
        playMusic(Songs[currentSongIndex].replaceAll("%20", " ").replace(".mp3", ""));
      } else {
        currentSong.play();
        play.src = "images/pause.svg";
      }
    } else {
      currentSong.pause();
      play.src = "images/play.svg";
    }
  });

  previous.addEventListener("click", () => {
    playPreviousSong();
  });

  next.addEventListener("click", () => {
    playNextSong();
  });

  seekbar.addEventListener("input", () => {
    const seekTo = (seekbar.value / 100) * currentSong.duration;
    currentSong.currentTime = seekTo;
  });
}

// Add an event to volume
document.querySelector("#volume").addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/ 100")
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong.volume >0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
    }
})

// Add event listener to mute the track
document.querySelector(".volume>img").addEventListener("click", e=>{ 
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("images/volume.svg", "images/mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("images/mute.svg", "images/volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }

})

Array.from(document.getElementsByClassName("card")).forEach((e) => {
  e.addEventListener("click", async (item) => {
    await getSongs(`musics/${item.currentTarget.dataset.folder}`);
  });
});

main();
