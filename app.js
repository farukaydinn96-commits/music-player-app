const DEFAULT_TRACKS = [
  {
    id: "t1",
    title: "Midnight City Drive (Synthwave Mix)",
    artist: "Lofi Girl Synthwave",
    genre: "Synthwave",
    duration: "3:42",
    youtubeId: "4xDzrJKXOOY",
  },
  {
    id: "t2",
    title: "Snowfall (Slowed & Reverb)",
    artist: "Øneheart x Reidenshi",
    genre: "Ambient",
    duration: "2:04",
    youtubeId: "LlN8MPS7KQs",
  },
  {
    id: "t3",
    title: "Coffee Shop Radio — Chill Lofi Study Beats",
    artist: "Lofi Girl",
    genre: "Lo-Fi",
    duration: "3:24",
    youtubeId: "n61ULEU7CO0",
  },
  {
    id: "t4",
    title: "Cyberpunk 2077 — Night City Pulse",
    artist: "Hyper & Dark Electro",
    genre: "Electronic",
    duration: "3:58",
    youtubeId: "8GW6sLrK40k",
  },
  {
    id: "t5",
    title: "Coding Mode — Cyberpunk Trap & Bass",
    artist: "Mokka No Copyright Music",
    genre: "Electronic",
    duration: "2:48",
    youtubeId: "K4DyBUG242c",
  },
  {
    id: "t6",
    title: "Tokyo Rain — Aesthetic Lofi Hip Hop",
    artist: "Lofi Geek",
    genre: "Lo-Fi",
    duration: "3:12",
    youtubeId: "lTRiuFIWV54",
  },
  {
    id: "t7",
    title: "Horizon — Synthwave & Chillwave Mix",
    artist: "Lofi Girl Synthwave",
    genre: "Synthwave",
    duration: "4:15",
    youtubeId: "S_MOd40zlYU",
  },
  {
    id: "t8",
    title: "Weightless — Deep Space Meditation",
    artist: "Marconi Union Style",
    genre: "Ambient",
    duration: "6:10",
    youtubeId: "UfcAVejslrU",
  },
];

const STORAGE_KEYS = {
  FAVORITES: "pulse_favorites_v4",
  CUSTOM_TRACKS: "pulse_tracks_v4",
};

const state = {
  tracks:
    JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_TRACKS)) ||
    DEFAULT_TRACKS,
  selectedGenre: "Tümü",
  searchQuery: "",
  sortBy: null,
  sortAsc: true,
  favorites: JSON.parse(
    localStorage.getItem(STORAGE_KEYS.FAVORITES) || '["t1"]',
  ),
  currentTrackIndex: 0,
  isPlaying: false,
  isShuffle: false,
  isRepeat: false,
  isMuted: false,
  volume: 80,
  isPlayerReady: false,
  pendingPlay: false,
  progressTimer: null,
};

let ytPlayer = null;

const dom = {
  toastContainer: document.getElementById("toast-container"),
  genreList: document.getElementById("genre-list"),
  trackList: document.getElementById("track-list"),
  trackCount: document.getElementById("track-count"),
  searchInput: document.getElementById("search-input"),
  sortTitleBtn: document.getElementById("sort-title-btn"),
  sortDurationBtn: document.getElementById("sort-duration-btn"),
  sortTitleIndicator: document.getElementById("sort-title-indicator"),
  sortDurationIndicator: document.getElementById("sort-duration-indicator"),
  emptyState: document.getElementById("empty-state"),
  resetFilterBtn: document.getElementById("reset-filter-btn"),
  profileBtn: document.getElementById("profile-btn"),
  profilePopover: document.getElementById("profile-popover"),
  statTotalTracks: document.getElementById("stat-total-tracks"),
  statFavTracks: document.getElementById("stat-fav-tracks"),
  resetStorageBtn: document.getElementById("reset-storage-btn"),
  videoPosterOverlay: document.getElementById("video-poster-overlay"),
  videoPosterImg: document.getElementById("video-poster-img"),
  nowTitle: document.getElementById("now-playing-title"),
  nowArtist: document.getElementById("now-playing-artist"),
  nowGenre: document.getElementById("now-playing-genre"),
  nowFavBtn: document.getElementById("now-fav-btn"),
  eqBadge: document.getElementById("equalizer-badge"),
  shuffleBtn: document.getElementById("shuffle-btn"),
  repeatBtn: document.getElementById("repeat-btn"),
  playPauseBtn: document.getElementById("play-pause-btn"),
  prevBtn: document.getElementById("prev-btn"),
  nextBtn: document.getElementById("next-btn"),
  iconPlay: document.getElementById("icon-play"),
  iconPause: document.getElementById("icon-pause"),
  muteBtn: document.getElementById("mute-btn"),
  iconVolHigh: document.getElementById("icon-vol-high"),
  iconVolMute: document.getElementById("icon-vol-mute"),
  volumeSlider: document.getElementById("volume-slider"),
  volumeFill: document.getElementById("volume-fill"),
  seekSlider: document.getElementById("seek-slider"),
  progressFill: document.getElementById("progress-fill"),
  currentTimeEl: document.getElementById("current-time"),
  totalDurationEl: document.getElementById("total-duration"),
  openAddModalBtn: document.getElementById("open-add-modal-btn"),
  closeAddModalBtn: document.getElementById("close-add-modal-btn"),
  cancelAddModalBtn: document.getElementById("cancel-add-modal-btn"),
  addTrackModal: document.getElementById("add-track-modal"),
  addTrackForm: document.getElementById("add-track-form"),
  inputYtUrl: document.getElementById("input-yt-url"),
  inputTrackTitle: document.getElementById("input-track-title"),
  inputTrackArtist: document.getElementById("input-track-artist"),
  inputTrackGenre: document.getElementById("input-track-genre"),
  openInfoModalBtn: document.getElementById("open-info-modal-btn"),
  closeInfoModalBtn: document.getElementById("close-info-modal-btn"),
  infoModal: document.getElementById("info-modal"),
};

function showToast(message) {
  if (!dom.toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast-item";
  toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
    toast.style.transition = "all 0.2s ease";
    setTimeout(() => toast.remove(), 220);
  }, 2400);
}

function parseYouTubeId(input) {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

function durationToSeconds(str) {
  const parts = String(str).split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function saveStateToStorage() {
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.favorites));
  localStorage.setItem(
    STORAGE_KEYS.CUSTOM_TRACKS,
    JSON.stringify(state.tracks),
  );
  if (dom.statTotalTracks)
    dom.statTotalTracks.textContent = state.tracks.length;
  if (dom.statFavTracks) dom.statFavTracks.textContent = state.favorites.length;
}

function getAvailableGenres() {
  const dynamicGenres = Array.from(new Set(state.tracks.map((t) => t.genre)));
  return ["Tümü", "Favoriler", ...dynamicGenres];
}

function toggleFavorite(trackId) {
  const idx = state.favorites.indexOf(trackId);
  if (idx === -1) {
    state.favorites.push(trackId);
    showToast("Parça favorilere eklendi");
  } else {
    state.favorites.splice(idx, 1);
    showToast("Parça favorilerden çıkarıldı");
  }
  saveStateToStorage();
  renderGenres();
  renderTrackList();
  updateNowPlayingMeta();
}

function deleteTrack(trackId) {
  if (state.tracks.length <= 1) {
    showToast("Kitaplıkta en az 1 parça bulunmalıdır");
    return;
  }

  const deletedIndex = state.tracks.findIndex((t) => t.id === trackId);
  if (deletedIndex === -1) return;

  state.tracks.splice(deletedIndex, 1);
  state.favorites = state.favorites.filter((id) => id !== trackId);

  if (state.currentTrackIndex >= state.tracks.length) {
    state.currentTrackIndex = 0;
  }

  saveStateToStorage();
  renderGenres();
  renderTrackList();
  updateNowPlayingMeta();
  showToast("Parça kitaplıktan silindi");
}

function getFilteredTracks() {
  const filtered = state.tracks.filter((track) => {
    const matchesGenre =
      state.selectedGenre === "Tümü"
        ? true
        : state.selectedGenre === "Favoriler"
          ? state.favorites.includes(track.id)
          : track.genre === state.selectedGenre;

    const q = state.searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      track.genre.toLowerCase().includes(q);

    return matchesGenre && matchesSearch;
  });

  if (state.sortBy === "title") {
    filtered.sort((a, b) => {
      const cmp = a.title.localeCompare(b.title, "tr");
      return state.sortAsc ? cmp : -cmp;
    });
  } else if (state.sortBy === "duration") {
    filtered.sort((a, b) => {
      const cmp = durationToSeconds(a.duration) - durationToSeconds(b.duration);
      return state.sortAsc ? cmp : -cmp;
    });
  }

  return filtered;
}

function formatSeconds(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function renderGenres() {
  dom.genreList.innerHTML = "";
  const genres = getAvailableGenres();

  genres.forEach((genre) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.role = "tab";
    btn.className = `genre-btn ${state.selectedGenre === genre ? "active" : ""}`;
    btn.setAttribute("aria-selected", state.selectedGenre === genre);

    if (genre === "Favoriler") {
      btn.innerHTML = `<span>♥ Favoriler</span><span class="fav-count-pill">${state.favorites.length}</span>`;
    } else {
      btn.textContent = genre;
    }

    btn.addEventListener("click", () => {
      state.selectedGenre = genre;
      renderGenres();
      renderTrackList();
    });

    dom.genreList.appendChild(btn);
  });
}

function updateSortIndicators() {
  if (dom.sortTitleIndicator) {
    dom.sortTitleIndicator.textContent =
      state.sortBy === "title" ? (state.sortAsc ? "↑" : "↓") : "";
  }
  if (dom.sortDurationIndicator) {
    dom.sortDurationIndicator.textContent =
      state.sortBy === "duration" ? (state.sortAsc ? "↑" : "↓") : "";
  }
}

function renderTrackList() {
  const filtered = getFilteredTracks();
  dom.trackCount.textContent = `${filtered.length} Parça`;
  dom.trackList.innerHTML = "";
  updateSortIndicators();

  if (filtered.length === 0) {
    dom.emptyState.classList.remove("hidden");
    return;
  }

  dom.emptyState.classList.add("hidden");
  const currentTrack = state.tracks[state.currentTrackIndex];

  filtered.forEach((track, idx) => {
    const isCurrent = currentTrack && currentTrack.id === track.id;
    const isFav = state.favorites.includes(track.id);
    const li = document.createElement("li");
    li.className = `track-row ${isCurrent ? "active" : ""}`;
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", isCurrent);
    li.tabIndex = 0;

    li.innerHTML = `
      <span class="track-index">${String(idx + 1).padStart(2, "0")}</span>
      <div class="track-info">
        <span class="track-title">${track.title}</span>
        <span class="track-artist">${track.artist}</span>
      </div>
      <span class="track-genre-tag">${track.genre}</span>
      <div class="row-actions">
        <button type="button" class="row-fav-btn ${isFav ? "favorited" : ""}" title="Favorilere Ekle/Çıkar" aria-label="Favori">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"/>
          </svg>
        </button>
        <button type="button" class="row-del-btn" title="Parçayı Sil" aria-label="Sil">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      <span class="track-duration">${track.duration}</span>
    `;

    li.querySelector(".row-fav-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(track.id);
    });

    li.querySelector(".row-del-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTrack(track.id);
    });

    const playSelected = () => {
      const globalIndex = state.tracks.findIndex((t) => t.id === track.id);
      if (globalIndex !== -1) {
        if (state.currentTrackIndex === globalIndex) {
          togglePlayPause();
        } else {
          selectAndPlayTrack(globalIndex);
        }
      }
    };

    li.addEventListener("click", playSelected);
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        playSelected();
      }
    });

    dom.trackList.appendChild(li);
  });
}

function updateNowPlayingMeta() {
  const track = state.tracks[state.currentTrackIndex];
  if (!track) return;

  dom.nowTitle.textContent = track.title;
  dom.nowArtist.textContent = track.artist;
  dom.nowGenre.textContent = track.genre;
  dom.totalDurationEl.textContent = track.duration;
  if (dom.videoPosterImg) {
    dom.videoPosterImg.src = `https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`;
  }

  if (state.favorites.includes(track.id)) {
    dom.nowFavBtn.classList.add("favorited");
  } else {
    dom.nowFavBtn.classList.remove("favorited");
  }
}

function updatePlayPauseUI(isPlaying) {
  state.isPlaying = isPlaying;
  if (isPlaying) {
    dom.iconPlay.classList.add("hidden");
    dom.iconPause.classList.remove("hidden");
    dom.eqBadge.classList.add("playing");
    if (dom.videoPosterOverlay)
      dom.videoPosterOverlay.classList.add("playing-hide");
  } else {
    dom.iconPlay.classList.remove("hidden");
    dom.iconPause.classList.add("hidden");
    dom.eqBadge.classList.remove("playing");
    if (dom.videoPosterOverlay)
      dom.videoPosterOverlay.classList.remove("playing-hide");
  }
}

function initYouTubePlayer() {
  if (ytPlayer || !window.YT || !window.YT.Player) return;

  const initialTrack = state.tracks[state.currentTrackIndex];

  ytPlayer = new YT.Player("youtube-player", {
    videoId: initialTrack.youtubeId,
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
}

window.onYouTubeIframeAPIReady = function () {
  initYouTubePlayer();
};

function onPlayerReady() {
  state.isPlayerReady = true;
  if (ytPlayer && typeof ytPlayer.setVolume === "function") {
    ytPlayer.setVolume(state.volume);
  }
  updateNowPlayingMeta();

  if (state.pendingPlay) {
    state.pendingPlay = false;
    ytPlayer.playVideo();
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    updatePlayPauseUI(true);
    startProgressSync();
  } else if (
    event.data === YT.PlayerState.PAUSED ||
    event.data === YT.PlayerState.CUED
  ) {
    updatePlayPauseUI(false);
    stopProgressSync();
  } else if (event.data === YT.PlayerState.ENDED) {
    if (state.isRepeat) {
      ytPlayer.seekTo(0, true);
      ytPlayer.playVideo();
    } else {
      playNextTrack();
    }
  }
}

function onPlayerError() {
  showToast("Video gömülü oynatmaya kısıtlı, sıradaki parçaya geçiliyor...");
  setTimeout(playNextTrack, 1200);
}

function selectAndPlayTrack(index) {
  state.currentTrackIndex = index;
  const track = state.tracks[index];

  updateNowPlayingMeta();
  renderTrackList();

  if (
    state.isPlayerReady &&
    ytPlayer &&
    typeof ytPlayer.loadVideoById === "function"
  ) {
    if (dom.videoPosterOverlay)
      dom.videoPosterOverlay.classList.add("playing-hide");
    ytPlayer.loadVideoById(track.youtubeId);
  } else {
    state.pendingPlay = true;
    initYouTubePlayer();
  }
}

function togglePlayPause() {
  if (
    !state.isPlayerReady ||
    !ytPlayer ||
    typeof ytPlayer.getPlayerState !== "function"
  ) {
    state.pendingPlay = true;
    initYouTubePlayer();
    showToast("Oynatıcı hazırlanıyor, lütfen bekleyin...");
    return;
  }

  const playerState = ytPlayer.getPlayerState();
  if (playerState === YT.PlayerState.PLAYING) {
    ytPlayer.pauseVideo();
  } else {
    if (dom.videoPosterOverlay)
      dom.videoPosterOverlay.classList.add("playing-hide");
    ytPlayer.playVideo();
  }
}

function playNextTrack() {
  const filtered = getFilteredTracks();
  const pool = filtered.length > 0 ? filtered : state.tracks;

  if (state.isShuffle && pool.length > 1) {
    const currentTrack = state.tracks[state.currentTrackIndex];
    const candidates = pool.filter((t) => t.id !== currentTrack.id);
    const randomTrack =
      candidates[Math.floor(Math.random() * candidates.length)];
    const nextGlobalIndex = state.tracks.findIndex(
      (t) => t.id === randomTrack.id,
    );
    selectAndPlayTrack(nextGlobalIndex);
    return;
  }

  const currentTrack = state.tracks[state.currentTrackIndex];
  const currentInPool = pool.findIndex((t) => t.id === currentTrack.id);
  const nextTrack = pool[(currentInPool + 1) % pool.length];
  const nextGlobalIndex = state.tracks.findIndex((t) => t.id === nextTrack.id);

  selectAndPlayTrack(nextGlobalIndex);
}

function playPrevTrack() {
  const filtered = getFilteredTracks();
  const pool = filtered.length > 0 ? filtered : state.tracks;

  const currentTrack = state.tracks[state.currentTrackIndex];
  const currentInPool = pool.findIndex((t) => t.id === currentTrack.id);
  const prevIndex = (currentInPool - 1 + pool.length) % pool.length;
  const prevTrack = pool[prevIndex];
  const prevGlobalIndex = state.tracks.findIndex((t) => t.id === prevTrack.id);

  selectAndPlayTrack(prevGlobalIndex);
}

function setVolume(value) {
  state.volume = value;
  dom.volumeSlider.value = value;
  dom.volumeFill.style.width = `${value}%`;

  if (value === 0) {
    state.isMuted = true;
    dom.iconVolHigh.classList.add("hidden");
    dom.iconVolMute.classList.remove("hidden");
  } else {
    state.isMuted = false;
    dom.iconVolHigh.classList.remove("hidden");
    dom.iconVolMute.classList.add("hidden");
  }

  if (state.isPlayerReady && ytPlayer) {
    ytPlayer.unMute();
    ytPlayer.setVolume(value);
  }
}

function toggleMute() {
  if (!state.isPlayerReady || !ytPlayer) return;

  if (state.isMuted || state.volume === 0) {
    const restored = state.volume > 0 ? state.volume : 80;
    setVolume(restored);
    showToast(`Ses açıldı (%${restored})`);
  } else {
    state.isMuted = true;
    dom.iconVolHigh.classList.add("hidden");
    dom.iconVolMute.classList.remove("hidden");
    dom.volumeFill.style.width = "0%";
    ytPlayer.mute();
    showToast("Ses kapatıldı");
  }
}

function startProgressSync() {
  stopProgressSync();
  state.progressTimer = setInterval(() => {
    if (!ytPlayer || typeof ytPlayer.getCurrentTime !== "function") return;

    const current = ytPlayer.getCurrentTime() || 0;
    const duration = ytPlayer.getDuration() || 0;

    dom.currentTimeEl.textContent = formatSeconds(current);

    if (duration > 0) {
      const percent = Math.min(100, (current / duration) * 100);
      dom.seekSlider.value = percent;
      dom.progressFill.style.width = `${percent}%`;
      dom.totalDurationEl.textContent = formatSeconds(duration);
    }
  }, 500);
}

function stopProgressSync() {
  if (state.progressTimer) {
    clearInterval(state.progressTimer);
    state.progressTimer = null;
  }
}

function initApp() {
  saveStateToStorage();
  renderGenres();
  renderTrackList();
  updateNowPlayingMeta();

  if (window.YT && window.YT.Player) {
    initYouTubePlayer();
  }

  dom.playPauseBtn.addEventListener("click", togglePlayPause);
  if (dom.videoPosterOverlay) {
    dom.videoPosterOverlay.addEventListener("click", togglePlayPause);
  }
  dom.nextBtn.addEventListener("click", playNextTrack);
  dom.prevBtn.addEventListener("click", playPrevTrack);

  dom.shuffleBtn.addEventListener("click", () => {
    state.isShuffle = !state.isShuffle;
    dom.shuffleBtn.classList.toggle("active", state.isShuffle);
    showToast(state.isShuffle ? "Karışık çalma aktif" : "Karışık çalma kapalı");
  });

  if (dom.repeatBtn) {
    dom.repeatBtn.addEventListener("click", () => {
      state.isRepeat = !state.isRepeat;
      dom.repeatBtn.classList.toggle("active", state.isRepeat);
      showToast(
        state.isRepeat ? "Parça tekrarı aktif" : "Parça tekrarı kapalı",
      );
    });
  }

  dom.nowFavBtn.addEventListener("click", () => {
    const currentTrack = state.tracks[state.currentTrackIndex];
    if (currentTrack) toggleFavorite(currentTrack.id);
  });

  dom.muteBtn.addEventListener("click", toggleMute);
  dom.volumeSlider.addEventListener("input", (e) => {
    setVolume(parseInt(e.target.value, 10));
  });

  dom.searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderTrackList();
  });

  if (dom.sortTitleBtn) {
    dom.sortTitleBtn.addEventListener("click", () => {
      if (state.sortBy === "title") {
        state.sortAsc = !state.sortAsc;
      } else {
        state.sortBy = "title";
        state.sortAsc = true;
      }
      renderTrackList();
    });
  }

  if (dom.sortDurationBtn) {
    dom.sortDurationBtn.addEventListener("click", () => {
      if (state.sortBy === "duration") {
        state.sortAsc = !state.sortAsc;
      } else {
        state.sortBy = "duration";
        state.sortAsc = true;
      }
      renderTrackList();
    });
  }

  dom.resetFilterBtn.addEventListener("click", () => {
    state.selectedGenre = "Tümü";
    state.searchQuery = "";
    state.sortBy = null;
    dom.searchInput.value = "";
    renderGenres();
    renderTrackList();
  });

  dom.profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = dom.profilePopover.classList.toggle("hidden");
    dom.profileBtn.setAttribute("aria-expanded", !isHidden);
  });

  if (dom.resetStorageBtn) {
    dom.resetStorageBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_TRACKS);
      localStorage.removeItem(STORAGE_KEYS.FAVORITES);
      state.tracks = [...DEFAULT_TRACKS];
      state.favorites = ["t1"];
      state.selectedGenre = "Tümü";
      state.currentTrackIndex = 0;
      saveStateToStorage();
      renderGenres();
      renderTrackList();
      updateNowPlayingMeta();
      dom.profilePopover.classList.add("hidden");
      showToast("Kitaplık varsayılan verilere sıfırlandı");
    });
  }

  if (dom.openAddModalBtn) {
    dom.openAddModalBtn.addEventListener("click", () => {
      dom.addTrackModal.classList.remove("hidden");
      dom.inputYtUrl.focus();
    });
  }

  const closeAddModal = () => {
    if (!dom.addTrackModal) return;
    dom.addTrackModal.classList.add("hidden");
    dom.addTrackForm.reset();
  };

  if (dom.closeAddModalBtn)
    dom.closeAddModalBtn.addEventListener("click", closeAddModal);
  if (dom.cancelAddModalBtn)
    dom.cancelAddModalBtn.addEventListener("click", closeAddModal);

  if (dom.addTrackForm) {
    dom.addTrackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const ytId = parseYouTubeId(dom.inputYtUrl.value);
      if (!ytId) {
        showToast("Geçerli bir YouTube linki veya 11 haneli ID girin");
        return;
      }

      const newTrack = {
        id: "t_" + Date.now(),
        title: dom.inputTrackTitle.value.trim(),
        artist: dom.inputTrackArtist.value.trim(),
        genre: dom.inputTrackGenre.value,
        duration: "3:30",
        youtubeId: ytId,
      };

      state.tracks.unshift(newTrack);
      saveStateToStorage();
      renderGenres();
      renderTrackList();
      selectAndPlayTrack(0);
      closeAddModal();
      showToast("Yeni parça kitaplığa eklendi");
    });
  }

  if (dom.openInfoModalBtn) {
    dom.openInfoModalBtn.addEventListener("click", () => {
      dom.infoModal.classList.remove("hidden");
    });
  }

  if (dom.closeInfoModalBtn) {
    dom.closeInfoModalBtn.addEventListener("click", () => {
      dom.infoModal.classList.add("hidden");
    });
  }

  document.addEventListener("click", (e) => {
    if (
      !dom.profilePopover.contains(e.target) &&
      !dom.profileBtn.contains(e.target)
    ) {
      dom.profilePopover.classList.add("hidden");
      dom.profileBtn.setAttribute("aria-expanded", "false");
    }
    if (dom.addTrackModal && e.target === dom.addTrackModal) closeAddModal();
    if (dom.infoModal && e.target === dom.infoModal)
      dom.infoModal.classList.add("hidden");
  });

  dom.seekSlider.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    dom.progressFill.style.width = `${val}%`;

    if (
      state.isPlayerReady &&
      ytPlayer &&
      typeof ytPlayer.getDuration === "function"
    ) {
      const duration = ytPlayer.getDuration();
      if (duration > 0) {
        const targetTime = (val / 100) * duration;
        ytPlayer.seekTo(targetTime, true);
      }
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAddModal();
      if (dom.infoModal) dom.infoModal.classList.add("hidden");
      dom.profilePopover.classList.add("hidden");
      return;
    }

    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
    )
      return;

    if (e.key === "/") {
      e.preventDefault();
      dom.searchInput.focus();
    } else if (e.code === "Space") {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === "ArrowRight") {
      playNextTrack();
    } else if (e.code === "ArrowLeft") {
      playPrevTrack();
    } else if (e.key.toLowerCase() === "m") {
      toggleMute();
    } else if (e.key.toLowerCase() === "n" && dom.addTrackModal) {
      e.preventDefault();
      dom.addTrackModal.classList.remove("hidden");
      dom.inputYtUrl.focus();
    }
  });
}

document.addEventListener("DOMContentLoaded", initApp);
