let currentSongIndex = 0;
let currentSong = new Audio();
let isShuffle = false;
let isRepeat = false;
let Songs = [];
const seekbar = document.getElementById("seek-bar");
let currFolder = "";
let likedPlaylists = JSON.parse(localStorage.getItem("likedPlaylists") || "[]");

function saveLikedPlaylists() {
  localStorage.setItem("likedPlaylists", JSON.stringify(likedPlaylists));
}


const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");


function convertSeconds(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

async function getSongs(folder) {
  Songs = []; // ✅ Clear songs
  currFolder = folder;

  let a = await fetch(`${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let list = div.getElementsByTagName("a");

  // ✅ Extract songs
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    if (element.href.endsWith(".mp3")) {
      Songs.push(decodeURIComponent(element.href.split(`${folder}/`)[1]));
    }
  }

  // ✅ Clear playlist UI first
  let SongDiv = document.querySelector(".lists ul");
  SongDiv.innerHTML = "";

  // ✅ Render songs
  for (const song of Songs) {
    SongDiv.innerHTML += `
      <li>
        <div class="li-song">
          <img src="images/music.svg" alt="">
          <p>${song.replace(".mp3", "")}</p>
        </div>
      </li>`;
  }

  // ✅ Attach fresh listeners (remove duplicates automatically by recreating list)
  Array.from(SongDiv.querySelectorAll("li")).forEach((e, index) => {
    e.addEventListener("click", () => {
      currentSongIndex = index;
      playMusic(Songs[currentSongIndex].replace(".mp3", ""));
    });
  });

  // ✅ Reset current song state
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


const togglePlayPause = () => {
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
  }
  
  // Keyboard Accessibility Enhancements
const initializeKeyboardShortcuts = () => {
  document.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "Space":
        e.preventDefault(); // Prevent scroll
        togglePlayPause();
        break;

      case "ArrowRight":
        playNextSong();
        break;

      case "ArrowLeft":
        playPreviousSong();
        break;

      case "ArrowUp":
        currentSong.volume = Math.min(currentSong.volume + 0.1, 1);
        document.querySelector("#volume").value = currentSong.volume * 100;
        break;

      case "ArrowDown":
        currentSong.volume = Math.max(currentSong.volume - 0.1, 0);
        document.querySelector("#volume").value = currentSong.volume * 100;
        break;

      case "KeyM":
        const volumeIcon = document.querySelector(".volume>img");
        const volumeSlider = document.querySelector("#volume");
        if (currentSong.volume > 0) {
          currentSong.volume = 0;
          volumeSlider.value = 0;
          volumeIcon.src = "images/mute.svg";
        } else {
          currentSong.volume = 0.1;
          volumeSlider.value = 10;
          volumeIcon.src = "images/volume.svg";
        }
        break;

      case "KeyS":
        isShuffle = !isShuffle;
        document.getElementById("shuffle").classList.toggle("active");
        break;

      case "KeyL":
        isRepeat = !isRepeat;
        document.getElementById("loop").classList.toggle("active");
        break;
    }
  });
};


async function main() {
  await getSongs("musics/PartySongs");

  play.addEventListener("click", () => {
   togglePlayPause();
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

function bindPlaylistCards() {
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.replaceWith(e.cloneNode(true)); // ✅ Removes old listeners
  });

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      await getSongs(`musics/${item.currentTarget.dataset.folder}`);
    });
  });
}

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



document.getElementById("shuffle").addEventListener("click", () => {
  isShuffle = !isShuffle;
  document.getElementById("shuffle").classList.toggle("active");
});

document.getElementById("loop").addEventListener("click", () => {
  isRepeat = !isRepeat;
  document.getElementById("loop").classList.toggle("active");
});

initializeKeyboardShortcuts();
// ---------- LIKE PLAYLIST FEATURE ----------

function saveLikedPlaylists() {
  localStorage.setItem("likedPlaylists", JSON.stringify(likedPlaylists));
}

function updatePlaylistLikeButtons() {
  document.querySelectorAll(".like-playlist-btn").forEach((btn) => {
    const folder = btn.dataset.folder;
    const isLiked = likedPlaylists.includes(folder);
    btn.classList.toggle("liked", isLiked);
    btn.innerHTML = `<i class="fa-${isLiked ? "solid" : "regular"} fa-heart"></i>`;
  });
}


document.addEventListener("DOMContentLoaded", () => {
  main();
  updatePlaylistLikeButtons();

  // ✅ Like/unlike playlists (only once)
  document.addEventListener("click", (e) => {
    const likeBtn = e.target.closest(".like-playlist-btn");
    if (likeBtn) {
      const folder = likeBtn.dataset.folder;
      const index = likedPlaylists.indexOf(folder);
      if (index === -1) {
        likedPlaylists.push(folder);
      } else {
        likedPlaylists.splice(index, 1);
      }
      saveLikedPlaylists();
      updatePlaylistLikeButtons();
      e.stopPropagation();
    }
  });

  // ✅ Show liked playlists
  document.getElementById("liked-songs-link").addEventListener("click", () => {
    const liked = JSON.parse(localStorage.getItem("likedPlaylists") || "[]");
    const container = document.querySelector(".liked-cards-container");
    container.innerHTML = "";

    liked.forEach((folder) => {
      const originalCard = document.querySelector(`.card[data-folder="${folder}"]`);
      if (originalCard) {
        const clone = originalCard.cloneNode(true);
        clone.addEventListener("click", () => {
          getSongs(`musics/${folder}`);
        });
        container.appendChild(clone);
      }
    });

    // ✅ Show popup
    document.getElementById("liked-playlists-popup").classList.remove("hidden");
  });

  // ✅ Close liked playlists popup
  document.getElementById("close-liked-playlists").addEventListener("click", () => {
    document.getElementById("liked-playlists-popup").classList.add("hidden");
  });
});










// // Card click to switch playlist
// Array.from(document.getElementsByClassName("card")).forEach((e) => {
//   e.addEventListener("click", async (item) => {
//     await getSongs(`musics/${item.currentTarget.dataset.folder}`);
//   });
// });



// const loginBtn = document.getElementById("login-btn");
// const authSection = document.getElementById("auth-section");
// const backdrop = document.getElementById("auth-backdrop");
// const closeBtn = document.getElementById("close-auth");

// loginBtn.addEventListener("click", () => {
//   authSection.classList.add("show");
//   authSection.classList.remove("hidden");
//   backdrop.classList.add("show");
// });

// backdrop.addEventListener("click", closeModal);
// closeBtn.addEventListener("click", closeModal);

// function closeModal() {
//   authSection.classList.remove("show");
//   authSection.classList.add("hidden");
//   backdrop.classList.remove("show");
// }

// document.getElementById("show-login").addEventListener("click", () => {
//   document.getElementById("login-form").classList.remove("hidden");
//   document.getElementById("signup-form").classList.add("hidden");
//   document.getElementById("show-login").classList.add("active");
//   document.getElementById("show-signup").classList.remove("active");
// });

// document.getElementById("show-signup").addEventListener("click", () => {
//   document.getElementById("signup-form").classList.remove("hidden");
//   document.getElementById("login-form").classList.add("hidden");
//   document.getElementById("show-signup").classList.add("active");
//   document.getElementById("show-login").classList.remove("active");
// });

