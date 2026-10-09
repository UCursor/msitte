document.addEventListener('DOMContentLoaded', () => {
    const installComponent = document.querySelector('.installComponent');
    if (installComponent) {
        const tabsContainer = installComponent.querySelector('.install-tabs');
        const tabButtons = installComponent.querySelectorAll('.install-tab-btn');
        const tabIndicator = installComponent.querySelector('.tab-indicator');
        const panels = installComponent.querySelectorAll('.snippet-panel');
        const snippetRows = installComponent.querySelectorAll('.snippet-row');

        function updateIndicator() {
            const activeTab = installComponent.querySelector('.install-tab-btn.active');
            if (!activeTab || !tabIndicator || !tabsContainer) return;

            const tabRect = activeTab.getBoundingClientRect();
            const containerRect = tabsContainer.getBoundingClientRect();

            const leftOffset = tabRect.left - containerRect.left;
            const width = tabRect.width;

            tabIndicator.style.left = `${leftOffset}px`;
            tabIndicator.style.width = `${width}px`;
        }

        function switchTab(targetTabId) {
            tabButtons.forEach(btn => {
                const isMatch = btn.getAttribute('data-tab') === targetTabId;
                btn.classList.toggle('active', isMatch);
                btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
            });

            panels.forEach(panel => {
                const isMatch = panel.getAttribute('data-panel') === targetTabId;
                panel.classList.toggle('active', isMatch);
            });

            updateIndicator();
        }

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                switchTab(tabId);
            });

            btn.addEventListener('keydown', (e) => {
                const currentIndex = Array.from(tabButtons).indexOf(btn);
                let nextIndex = null;

                if (e.key === 'ArrowRight') {
                    nextIndex = (currentIndex + 1) % tabButtons.length;
                } else if (e.key === 'ArrowLeft') {
                    nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
                }

                if (nextIndex !== null) {
                    e.preventDefault();
                    tabButtons[nextIndex].focus();
                    switchTab(tabButtons[nextIndex].getAttribute('data-tab'));
                }
            });
        });

        async function copySnippet(row) {
            const textToCopy = row.getAttribute('data-copy-text');
            if (!textToCopy) return;

            let success = false;
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(textToCopy);
                    success = true;
                } else {
                    const textarea = document.createElement('textarea');
                    textarea.value = textToCopy;
                    textarea.style.position = 'fixed';
                    textarea.style.left = '-9999px';
                    textarea.style.top = '-9999px';
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();
                    success = document.execCommand('copy');
                    document.body.removeChild(textarea);
                }
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
            }

            if (success) {
                row.classList.add('copied');
                const feedbackEl = row.querySelector('.copy-feedback');
                if (feedbackEl) feedbackEl.textContent = 'Copied!';

                clearTimeout(row._copyTimeout);
                row._copyTimeout = setTimeout(() => {
                    row.classList.remove('copied');
                }, 2000);
            }
        }

        snippetRows.forEach(row => {
            row.addEventListener('click', () => {
                copySnippet(row);
            });

            row.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copySnippet(row);
                }
            });
        });

        updateIndicator();
        window.addEventListener('resize', updateIndicator);

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(updateIndicator);
        }
    }

    const searchModal = document.getElementById('searchModal') || document.getElementById('docsSearchModal');
    const searchTriggerBtn = document.getElementById('searchTriggerBtn') || document.getElementById('docsSearchTrigger');
    const searchCloseBtn = document.getElementById('searchCloseBtn') || document.getElementById('docsSearchCloseBtn');
    const siteSearchInput = document.getElementById('siteSearchInput') || document.getElementById('docsSearchInput');
    const searchResultsList = document.getElementById('searchResultsList') || document.getElementById('docsSearchResultsList');

    const searchIndex = [
        {
            title: 'Universal Installer',
            desc: 'Initiation command for Cursor, Claude Code, and AI agents: read github.com/ucursor/msitte/blob/main/Skills.md $initiation',
            displayUrl: 'msitte.pages.dev/',
            url: '/',
            category: 'Install'
        },
        {
            title: 'Other Agents Skill Link',
            desc: 'Direct skills reference for other agents and custom setups',
            displayUrl: 'msitte.pages.dev/skills',
            url: '/skills',
            category: 'Skills'
        },
        {
            title: 'Documentation: Overview & Initiation',
            desc: 'Guide to msitte / laucn, anti-cliche guardrails, and the $initiation command',
            displayUrl: 'msitte.pages.dev/docs',
            url: '/developers/docs/introduction.html',
            category: 'Docs'
        },
        {
            title: 'AI Signs: What AI Models Usually Do',
            desc: 'Breakdown of telltale AI flaws: purple-indigo gradients, unicode emoji icons, and broken placeholders',
            displayUrl: 'msitte.pages.dev/docs#ai-signs',
            url: '/developers/docs/introduction.html#ai-signs',
            category: 'Guardrails'
        },
        {
            title: 'webh.md Design Standards',
            desc: 'Strict negative constraints preventing non-functional mockups, emojis, and electric neon',
            displayUrl: 'msitte.pages.dev/docs#webh-rules',
            url: '/developers/docs/introduction.html#webh-rules',
            category: 'Standards'
        },
        {
            title: 'Discord Community',
            desc: 'Join the official msitte & laucn developer community on Discord',
            displayUrl: 'msitte.pages.dev/community',
            url: 'https://discord.gg/5KctFJj9Qk',
            category: 'Community',
            external: true
        },
        {
            title: 'GitHub Repository',
            desc: 'Official open source skills repository: @ucursor/msitte',
            displayUrl: 'msitte.pages.dev/github',
            url: 'https://github.com/ucursor/msitte',
            category: 'GitHub',
            external: true
        }
    ];

    let selectedIndex = 0;

    function renderSearchResults(query = '') {
        if (!searchResultsList) return;
        const normalized = query.trim().toLowerCase();

        const filtered = searchIndex.filter(item => {
            if (!normalized) return true;
            return item.title.toLowerCase().includes(normalized) ||
                   item.desc.toLowerCase().includes(normalized) ||
                   item.displayUrl.toLowerCase().includes(normalized) ||
                   item.category.toLowerCase().includes(normalized);
        });

        if (filtered.length === 0) {
            searchResultsList.innerHTML = `
                <div style="padding: 24px; text-align: center; color: rgba(255, 255, 255, 0.45); font-size: 0.9rem;">
                    No results found for "${query}". Try searching "skills", "docs", "signs", or "installer".
                </div>
            `;
            return;
        }

        selectedIndex = Math.min(selectedIndex, filtered.length - 1);

        searchResultsList.innerHTML = filtered.map((item, idx) => `
            <a href="${item.url}" class="search-result-item ${idx === selectedIndex ? 'selected' : ''}" data-idx="${idx}" ${item.external ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                <div class="search-result-info">
                    <div>
                        <div class="search-result-title">${item.title}</div>
                        <div class="search-result-desc">${item.desc}</div>
                        <div class="search-result-url">${item.displayUrl}</div>
                    </div>
                </div>
            </a>
        `).join('');

        searchResultsList.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => {
                closeSearchModal();
            });
        });
    }

    function openSearchModal() {
        if (!searchModal) return;
        searchModal.classList.add('open');
        searchModal.setAttribute('aria-hidden', 'false');
        if (siteSearchInput) {
            siteSearchInput.value = '';
            siteSearchInput.focus();
        }
        selectedIndex = 0;
        renderSearchResults('');
    }

    function closeSearchModal() {
        if (!searchModal) return;
        searchModal.classList.remove('open');
        searchModal.setAttribute('aria-hidden', 'true');
    }

    if (searchTriggerBtn) {
        searchTriggerBtn.addEventListener('click', openSearchModal);
    }

    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', closeSearchModal);
    }

    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                closeSearchModal();
            }
        });
    }

    if (siteSearchInput) {
        siteSearchInput.addEventListener('input', (e) => {
            selectedIndex = 0;
            renderSearchResults(e.target.value);
        });

        siteSearchInput.addEventListener('keydown', (e) => {
            const items = searchResultsList.querySelectorAll('.search-result-item');
            if (!items.length) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                renderSearchResults(siteSearchInput.value);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                renderSearchResults(siteSearchInput.value);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const activeItem = items[selectedIndex];
                if (activeItem) {
                    activeItem.click();
                    closeSearchModal();
                }
            } else if (e.key === 'Escape') {
                closeSearchModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        const isF = e.key && e.key.toLowerCase() === 'f';
        const isTrigger = isF && (e.shiftKey || e.metaKey || e.ctrlKey);

        if (isTrigger && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
            e.preventDefault();
            if (searchModal && searchModal.classList.contains('open')) {
                closeSearchModal();
            } else {
                openSearchModal();
            }
        } else if (e.key === 'Escape' && searchModal && searchModal.classList.contains('open')) {
            closeSearchModal();
        }
    });
});
