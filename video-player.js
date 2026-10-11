/**
 * msitte Video Player - Smooth Sizing Animation, 5s Skip & YouTube Timeline
 */

(function () {
    'use strict';

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function initPlayer(container) {
        if (!container || container.dataset.playerInitialized) return;
        container.dataset.playerInitialized = 'true';

        const video = container.querySelector('.msitte-video-element');
        if (!video) return;

        // UI elements
        const centerPlayBtn = container.querySelector('.center-play-btn');
        const playPauseBtn = container.querySelector('.play-pause-btn');
        const playPauseIcon = container.querySelector('#playPauseIcon') || container.querySelector('.play-pause-btn .material-symbols-outlined');
        const skipBackBtn = container.querySelector('.skip-btn.skip-back, #skipBackBtn');
        const skipFwdBtn = container.querySelector('.skip-btn.skip-fwd, #skipFwdBtn');
        const skipFeedbackLeft = container.querySelector('.skip-feedback-left');
        const skipFeedbackRight = container.querySelector('.skip-feedback-right');
        const sizeToggleBtn = container.querySelector('.size-toggle-btn');
        const sizeToggleIcon = container.querySelector('#sizeToggleIcon') || container.querySelector('.size-toggle-btn .material-symbols-outlined');
        const playerSizePill = container.querySelector('.player-size-pill');
        const fullscreenBtn = container.querySelector('.fullscreen-btn');
        const fullscreenIcon = container.querySelector('#fullscreenIcon') || container.querySelector('.fullscreen-btn .material-symbols-outlined');
        const volumeBtn = container.querySelector('.volume-btn');
        const volumeIcon = container.querySelector('#volumeIcon') || container.querySelector('.volume-btn .material-symbols-outlined');
        const volumeSlider = container.querySelector('.volume-slider');
        const currentTimeEl = container.querySelector('#currentTime') || container.querySelector('.current-time');
        const durationTimeEl = container.querySelector('#durationTime') || container.querySelector('.duration-time');
        const timelineContainer = container.querySelector('.timeline-container');
        const timelineProgress = container.querySelector('.timeline-progress');
        const timelineBuffer = container.querySelector('.timeline-buffer');
        const timelineThumb = container.querySelector('.timeline-thumb');
        const timelineHoverTime = container.querySelector('.timeline-hover-time');

        let isDraggingTimeline = false;
        let lastVolume = 1;
        let idleTimeout = null;
        let leftSkipAccumulator = 0;
        let rightSkipAccumulator = 0;
        let leftSkipTimer = null;
        let rightSkipTimer = null;
        let clickTimeout = null;

        // --- Sizing Animation (Small <-> Big) ---
        function setExpanded(expand) {
            if (expand) {
                container.classList.remove('is-small');
                container.classList.add('is-expanded');
                container.dataset.expanded = 'true';
                if (sizeToggleIcon) sizeToggleIcon.textContent = 'close_fullscreen';
                if (sizeToggleBtn) {
                    sizeToggleBtn.setAttribute('aria-label', 'Shrink video (T)');
                    sizeToggleBtn.setAttribute('title', 'Shrink video (T)');
                }
            } else {
                container.classList.remove('is-expanded');
                container.classList.add('is-small');
                container.dataset.expanded = 'false';
                if (sizeToggleIcon) sizeToggleIcon.textContent = 'open_in_full';
                if (sizeToggleBtn) {
                    sizeToggleBtn.setAttribute('aria-label', 'Enlarge video (T)');
                    sizeToggleBtn.setAttribute('title', 'Enlarge video (T)');
                }
            }
        }

        function toggleSize() {
            const isCurrentlyExpanded = container.classList.contains('is-expanded');
            setExpanded(!isCurrentlyExpanded);
        }

        if (sizeToggleBtn) {
            sizeToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleSize();
            });
        }

        if (playerSizePill) {
            playerSizePill.addEventListener('click', (e) => {
                e.stopPropagation();
                setExpanded(true);
            });
        }

        // --- Play / Pause ---
        function togglePlay() {
            if (video.paused || video.ended) {
                // If in small mode, smoothly expand when playing!
                if (container.classList.contains('is-small')) {
                    setExpanded(true);
                }
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        }

        function updatePlayState() {
            if (video.paused) {
                container.classList.remove('is-playing');
                if (playPauseIcon) playPauseIcon.textContent = 'play_arrow';
                if (playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Play (Space)');
                showControls();
            } else {
                container.classList.add('is-playing');
                if (playPauseIcon) playPauseIcon.textContent = 'pause';
                if (playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Pause (Space)');
                resetIdleTimer();
            }
        }

        if (centerPlayBtn) {
            centerPlayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlay();
            });
        }

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlay();
            });
        }

        video.addEventListener('play', updatePlayState);
        video.addEventListener('pause', updatePlayState);
        video.addEventListener('ended', () => {
            updatePlayState();
            showControls();
        });

        // --- Skip 5s & YouTube-Style Double Tap / Double Click ---
        function showSkipFeedback(side, count) {
            const el = side === 'left' ? skipFeedbackLeft : skipFeedbackRight;
            if (!el) return;

            const textEl = el.querySelector('.skip-text');
            if (textEl) {
                textEl.textContent = `${side === 'left' ? '-' : '+'}${count}s`;
            }

            el.classList.add('active');
            clearTimeout(side === 'left' ? leftSkipTimer : rightSkipTimer);

            const timer = setTimeout(() => {
                el.classList.remove('active');
                if (side === 'left') {
                    leftSkipAccumulator = 0;
                } else {
                    rightSkipAccumulator = 0;
                }
            }, 650);

            if (side === 'left') leftSkipTimer = timer;
            else rightSkipTimer = timer;
        }

        function skipSeconds(seconds) {
            if (!video.duration) return;
            const newTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
            video.currentTime = newTime;

            if (seconds < 0) {
                leftSkipAccumulator += Math.abs(seconds);
                showSkipFeedback('left', leftSkipAccumulator);
            } else {
                rightSkipAccumulator += Math.abs(seconds);
                showSkipFeedback('right', rightSkipAccumulator);
            }
            updateProgress();
            resetIdleTimer();
        }

        if (skipBackBtn) {
            skipBackBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                skipSeconds(-5);
            });
        }

        if (skipFwdBtn) {
            skipFwdBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                skipSeconds(5);
            });
        }

        // Click / Double Click gesture on the video surface
        video.addEventListener('click', (e) => {
            const rect = video.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const isLeftHalf = clickX < rect.width / 2;

            if (clickTimeout) {
                // Double Click Detected!
                clearTimeout(clickTimeout);
                clickTimeout = null;
                if (isLeftHalf) {
                    skipSeconds(-5);
                } else {
                    skipSeconds(5);
                }
            } else {
                // Single Click - Wait to distinguish from double click
                clickTimeout = setTimeout(() => {
                    clickTimeout = null;
                    togglePlay();
                }, 240);
            }
        });

        // --- Timeline & Buffer Handling ---
        function updateProgress() {
            if (!video.duration) return;
            const current = video.currentTime;
            const duration = video.duration;
            const percent = (current / duration) * 100;

            if (timelineProgress) timelineProgress.style.width = `${percent}%`;
            if (timelineThumb) timelineThumb.style.left = `${percent}%`;
            if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
            if (durationTimeEl) durationTimeEl.textContent = formatTime(duration);
            if (timelineContainer) timelineContainer.setAttribute('aria-valuenow', Math.round(percent));
        }

        function updateBuffer() {
            if (!video.duration || !timelineBuffer) return;
            const buffered = video.buffered;
            if (buffered.length > 0) {
                for (let i = buffered.length - 1; i >= 0; i--) {
                    if (buffered.start(i) <= video.currentTime) {
                        const bufferPercent = (buffered.end(i) / video.duration) * 100;
                        timelineBuffer.style.width = `${bufferPercent}%`;
                        break;
                    }
                }
            }
        }

        video.addEventListener('timeupdate', () => {
            if (!isDraggingTimeline) {
                updateProgress();
            }
        });

        video.addEventListener('progress', updateBuffer);
        video.addEventListener('loadedmetadata', () => {
            updateProgress();
            updateBuffer();
            if (durationTimeEl) durationTimeEl.textContent = formatTime(video.duration);
        });

        // Seek position calculation
        function calculateSeekTime(e) {
            if (!timelineContainer || !video.duration) return 0;
            const rect = timelineContainer.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = offsetX / rect.width;
            return {
                time: percentage * video.duration,
                percent: percentage * 100,
                offsetX,
                width: rect.width
            };
        }

        // Timeline Scrubbing & Dragging
        function handleTimelineMove(e) {
            const seek = calculateSeekTime(e);
            if (isDraggingTimeline) {
                if (timelineProgress) timelineProgress.style.width = `${seek.percent}%`;
                if (timelineThumb) timelineThumb.style.left = `${seek.percent}%`;
                if (currentTimeEl) currentTimeEl.textContent = formatTime(seek.time);
                video.currentTime = seek.time;
            }

            // Hover tooltip
            if (timelineHoverTime) {
                timelineHoverTime.textContent = formatTime(seek.time);
                // Clamp within bounds
                const minOffset = 24;
                const maxOffset = seek.width - 24;
                const clampedX = Math.max(minOffset, Math.min(seek.offsetX, maxOffset));
                timelineHoverTime.style.left = `${clampedX}px`;
            }
        }

        if (timelineContainer) {
            timelineContainer.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                isDraggingTimeline = true;
                timelineContainer.classList.add('is-dragging');
                const seek = calculateSeekTime(e);
                video.currentTime = seek.time;
                updateProgress();

                const onMouseMove = (moveEvent) => {
                    handleTimelineMove(moveEvent);
                };

                const onMouseUp = () => {
                    isDraggingTimeline = false;
                    timelineContainer.classList.remove('is-dragging');
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                };

                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
            });

            timelineContainer.addEventListener('mousemove', (e) => {
                if (!isDraggingTimeline) {
                    handleTimelineMove(e);
                }
            });

            // Touch events for mobile scrubbing
            timelineContainer.addEventListener('touchstart', (e) => {
                isDraggingTimeline = true;
                timelineContainer.classList.add('is-dragging');
                const seek = calculateSeekTime(e);
                video.currentTime = seek.time;
                updateProgress();
            }, { passive: true });

            timelineContainer.addEventListener('touchmove', (e) => {
                if (isDraggingTimeline) {
                    handleTimelineMove(e);
                }
            }, { passive: true });

            timelineContainer.addEventListener('touchend', () => {
                isDraggingTimeline = false;
                timelineContainer.classList.remove('is-dragging');
            });
        }

        // --- Volume & Mute ---
        function setVolume(val) {
            const clamped = Math.max(0, Math.min(1, val));
            video.volume = clamped;
            video.muted = clamped === 0;
            if (volumeSlider) volumeSlider.value = clamped;

            if (volumeIcon) {
                if (clamped === 0 || video.muted) {
                    volumeIcon.textContent = 'volume_off';
                } else if (clamped < 0.5) {
                    volumeIcon.textContent = 'volume_down';
                } else {
                    volumeIcon.textContent = 'volume_up';
                }
            }
        }

        function toggleMute() {
            if (video.muted || video.volume === 0) {
                video.muted = false;
                setVolume(lastVolume > 0 ? lastVolume : 1);
            } else {
                lastVolume = video.volume;
                video.muted = true;
                setVolume(0);
            }
        }

        if (volumeBtn) {
            volumeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMute();
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                setVolume(parseFloat(e.target.value));
            });
        }

        // --- Fullscreen ---
        function toggleFullscreen() {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        }

        function updateFullscreenIcon() {
            const isFull = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
            if (fullscreenIcon) {
                fullscreenIcon.textContent = isFull ? 'fullscreen_exit' : 'fullscreen';
            }
            if (fullscreenBtn) {
                fullscreenBtn.setAttribute('aria-label', isFull ? 'Exit Fullscreen (F)' : 'Fullscreen (F)');
            }
        }

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFullscreen();
            });
        }

        document.addEventListener('fullscreenchange', updateFullscreenIcon);
        document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);

        // --- Controls Auto-Hide (Idle timer) ---
        function showControls() {
            container.classList.remove('is-idle');
            clearTimeout(idleTimeout);
        }

        function resetIdleTimer() {
            showControls();
            if (!video.paused && !video.ended) {
                idleTimeout = setTimeout(() => {
                    if (!isDraggingTimeline && !container.querySelector('.player-controls:hover')) {
                        container.classList.add('is-idle');
                    }
                }, 2500);
            }
        }

        container.addEventListener('mousemove', resetIdleTimer);
        container.addEventListener('mouseleave', () => {
            if (!video.paused) {
                container.classList.add('is-idle');
            }
        });

        // --- Keyboard Shortcuts (YouTube style) ---
        function handleKey(e) {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
            const searchModal = document.getElementById('searchModal');
            if (searchModal && searchModal.classList.contains('open')) return;

            const isTarget = container.contains(document.activeElement) ||
                             document.activeElement === container ||
                             (!video.paused && !video.ended);
            if (!isTarget) return;

            switch (e.key) {
                case ' ':
                case 'k':
                case 'K':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                case 'j':
                case 'J':
                    e.preventDefault();
                    skipSeconds(-5);
                    break;
                case 'ArrowRight':
                case 'l':
                case 'L':
                    e.preventDefault();
                    skipSeconds(5);
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 't':
                case 'T':
                    e.preventDefault();
                    toggleSize();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVolume(Math.min(1, video.volume + 0.05));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVolume(Math.max(0, video.volume - 0.05));
                    break;
            }
        }

        container.addEventListener('keydown', handleKey);
        document.addEventListener('keydown', handleKey);

        // Initial setup
        setVolume(1);
        updateProgress();
    }

    // Initialize all video players on page load
    document.addEventListener('DOMContentLoaded', () => {
        const containers = document.querySelectorAll('.msitte-player-container');
        containers.forEach(initPlayer);
    });
})();
