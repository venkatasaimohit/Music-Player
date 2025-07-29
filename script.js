const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');
let currentSongIndex = 0;
let currentSong = new Audio();
let isShuffle = false;
let isRepeat = false;
let Songs = [];
const seekbar = document.getElementById("seek-bar");
let currFolder = "";

function convertSeconds(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

async function getSongs(folder) {
  Songs = [];
  currFolder = folder;

  let a = await fetch(`${folder}/`);  // ✅ fixed fetch path
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let list = div.getElementsByTagName("a");

  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    if (element.href.endsWith(".mp3")) {
      Songs.push(decodeURIComponent(element.href.split(`${folder}/`)[1]));  // ✅ fixed broken song URL
    }
  }

  let SongDiv = document.querySelector(".lists ul");
  SongDiv.innerHTML = "";

  for (const song of Songs) {
    SongDiv.innerHTML += `
      <li>
        <div class="li-song">
          <img src="images/music.svg" alt="">
          <p>${song.replace(".mp3", "")}</p>
        </div>
      </li>`;
  }

  Array.from(document.querySelectorAll(".lists li")).forEach((e, index) => {
    e.addEventListener("click", () => {
      currentSongIndex = index;
      playMusic(Songs[currentSongIndex].replace(".mp3", ""));
    });
  });

  currentSong.pause();
  currentSong.src = "";
  currentSongIndex = 0;
  play.src = "images/play.svg";
  document.querySelector(".current-song p").innerHTML = "Select a song";
}

const playMusic = (track) => {

  currentSong.pause();
  currentSong = new Audio(`${currFolder}/${track}.mp3`);

  currentSong.play();
  play.src = "images/pause.svg";
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
    if (isRepeat) {
      playMusic(Songs[currentSongIndex].replace(".mp3", ""));
    } else if (isShuffle && Songs.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * Songs.length);
      } while (randomIndex === currentSongIndex);
      currentSongIndex = randomIndex;
      playMusic(Songs[currentSongIndex].replace(".mp3", ""));
    } else {
      playNextSong();
    }
  });
};

const playNextSong = () => {
  currentSongIndex = (currentSongIndex + 1) % Songs.length;
  playMusic(Songs[currentSongIndex].replace(".mp3", ""));
};

const playPreviousSong = () => {
  currentSongIndex = (currentSongIndex - 1 + Songs.length) % Songs.length;
  playMusic(Songs[currentSongIndex].replace(".mp3", ""));
};

async function main() {
  await getSongs("musics/PartySongs");

  play.addEventListener("click", () => {
    if (!currentSong.src || currentSong.paused) {
      if (!currentSong.src) {
        currentSongIndex = 0;
        playMusic(Songs[currentSongIndex].replace(".mp3", ""));
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

// Volume control
document.querySelector("#volume").addEventListener("change", (e) => {
  currentSong.volume = parseInt(e.target.value) / 100;
  if (currentSong.volume > 0) {
    document.querySelector(".volume>img").src = "images/volume.svg";
  }
});

// Mute/unmute
document.querySelector(".volume>img").addEventListener("click", (e) => {
  const volumeInput = document.querySelector("#volume");

  if (e.target.src.includes("volume.svg")) {
    e.target.src = "images/mute.svg";
    currentSong.volume = 0;
    volumeInput.value = 0;
  } else {
    e.target.src = "images/volume.svg";
    currentSong.volume = 0.1;
    volumeInput.value = 10;
  }
});

// Card click to switch playlist
Array.from(document.getElementsByClassName("card")).forEach((e) => {
  e.addEventListener("click", async (item) => {
    await getSongs(`musics/${item.currentTarget.dataset.folder}`);
  });
});

// search button features are from here
function filterSongs(query) {
  query = query.toLowerCase();
  let filtered = Songs.filter(song => song.toLowerCase().includes(query));
  let SongDiv = document.querySelector(".lists ul");
  SongDiv.innerHTML = "";
  for (const song of filtered) {
    SongDiv.innerHTML += `
      <li>
        <div class="li-song">
          <img src="images/music.svg" alt="">
          <p>${song.replace(".mp3", "")}</p>
        </div>
      </li>`;
  }
  Array.from(document.querySelectorAll(".lists li")).forEach((e, index) => {
    e.addEventListener("click", () => {
      let realIndex = Songs.findIndex(s => s === filtered[index]);
      if (realIndex !== -1) {
        currentSongIndex = realIndex;
        playMusic(Songs[currentSongIndex].replace(".mp3", ""));
      }
    });
  });
}

document.getElementById("search-btn").addEventListener("click", function() {
  let val = document.getElementById("search-input").value;
  filterSongs(val);
});
document.getElementById("search-input").addEventListener("input", function(e) {
  filterSongs(e.target.value);
});

document.getElementById('sidebar-search-btn').addEventListener('click', function() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.focus();
    searchInput.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
});

main();

document.getElementById("shuffle").addEventListener("click", () => {
  isShuffle = !isShuffle;
  document.getElementById("shuffle").classList.toggle("active");
});

document.getElementById("loop").addEventListener("click", () => {
  isRepeat = !isRepeat;
  document.getElementById("loop").classList.toggle("active");
});

document.getElementById('theme-toggle').addEventListener('click', function () {
  console.log('Theme toggle clicked');
  document.body.classList.toggle('bright-mode');
  console.log('bright-mode class toggled:', document.body.classList.contains('bright-mode'));

  if (document.body.classList.contains('bright-mode')) {
    this.textContent = 'Dark Mode';
  } else {
    this.textContent = 'Light Mode';
  }
});

document.addEventListener("DOMContentLoaded", function () {
  hamburgerBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
})

